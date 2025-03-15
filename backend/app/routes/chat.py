from flask import Blueprint, request, jsonify
from app import mongo_db
from app.models.message import Message, Thread
from app.models.user import UserSettings
from app.routes.auth import token_required
from app.services.openai import chat_completion, assistant_completion
from app.services.claude import claude_completion
from app.services.grok import grok_completion
import uuid

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/messages', methods=['GET'])
@token_required
def get_messages(user_id):
    # Get the current thread ID or create a new one
    thread_id = request.args.get('thread_id')
    
    if not thread_id:
        # Get the most recent thread or create new one
        thread = mongo_db.threads.find_one(
            {'user_id': user_id},
            sort=[('updated_at', -1)]
        )
        
        if thread:
            thread_id = thread['id']
        else:
            # Create a new thread
            new_thread = Thread(user_id=user_id)
            mongo_db.threads.insert_one(new_thread.to_dict())
            thread_id = new_thread.id
    
    # Fetch messages for this thread
    messages = list(mongo_db.messages.find(
        {'thread_id': thread_id, 'user_id': user_id},
        sort=[('timestamp', 1)]
    ))
    
    # Convert ObjectId to string for JSON serialization
    for message in messages:
        if '_id' in message:
            del message['_id']
    
    return jsonify(messages), 200

@chat_bp.route('/threads', methods=['GET'])
@token_required
def get_threads(user_id):
    threads = list(mongo_db.threads.find(
        {'user_id': user_id},
        sort=[('updated_at', -1)]
    ))
    
    # Convert ObjectId to string for JSON serialization
    for thread in threads:
        if '_id' in thread:
            del thread['_id']
    
    return jsonify(threads), 200

@chat_bp.route('/chat', methods=['POST'])
@token_required
def chat(user_id):
    data = request.get_json()
    
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    # Get user settings from the request or database
    if 'settings' in data:
        settings = data['settings']
    else:
        user_settings = UserSettings.query.filter_by(user_id=user_id).first()
        if not user_settings:
            return jsonify({'error': 'User settings not found'}), 404
        settings = user_settings.to_dict()
    
    # Get or create thread
    thread_id = settings.get('session_thread_id')
    if not thread_id:
        thread = Thread(user_id=user_id)
        mongo_db.threads.insert_one(thread.to_dict())
        thread_id = thread.id
        
        # Update user settings with new thread ID
        user_settings = UserSettings.query.filter_by(user_id=user_id).first()
        if user_settings:
            user_settings.session_thread_id = thread_id
            from app import db
            db.session.commit()
    
    # Save user message to database
    user_message = Message(
        user_id=user_id,
        thread_id=thread_id,
        content=data['message'],
        role='user',
        service=settings['service'],
        model=settings['model']
    )
    mongo_db.messages.insert_one(user_message.to_dict())
    
    # Get previous messages for context
    previous_messages = list(mongo_db.messages.find(
        {'thread_id': thread_id},
        sort=[('timestamp', 1)]
    ))
    
    # Clean messages for API consumption
    messages_for_api = []
    for msg in previous_messages:
        if '_id' in msg:
            del msg['_id']
        messages_for_api.append({
            'role': msg['role'],
            'content': msg['content']
        })
    
    # Get response from appropriate AI service
    service = settings['service']
    response_content = ""
    
    try:
        if service == 'openai':
            if settings.get('assistant_id'):
                response_content = assistant_completion(
                    messages_for_api,
                    settings['assistant_id'],
                    settings.get('service_thread_id'),
                    user_id
                )
            else:
                response_content = chat_completion(
                    messages_for_api,
                    settings['model'],
                    settings['temperature'],
                    settings['max_tokens']
                )
        elif service == 'claude':
            response_content = claude_completion(
                messages_for_api,
                settings['model'],
                settings['temperature'],
                settings['max_tokens']
            )
        elif service == 'grok':
            response_content = grok_completion(
                messages_for_api,
                settings['temperature'],
                settings['max_tokens']
            )
        else:
            return jsonify({'error': 'Invalid service'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    # Save assistant response to database
    assistant_message = Message(
        user_id=user_id,
        thread_id=thread_id,
        content=response_content,
        role='assistant',
        service=settings['service'],
        model=settings['model']
    )
    mongo_db.messages.insert_one(assistant_message.to_dict())
    
    # Update thread timestamp
    mongo_db.threads.update_one(
        {'id': thread_id},
        {'$set': {'updated_at': assistant_message.timestamp}}
    )
    
    return jsonify(assistant_message.to_dict()), 200