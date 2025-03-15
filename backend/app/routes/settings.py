from flask import Blueprint, request, jsonify
from app import db
from app.models.user import UserSettings
from app.routes.auth import token_required

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/settings', methods=['GET'])
@token_required
def get_settings(user_id):
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    if not settings:
        # Create default settings if not exist
        settings = UserSettings(user_id=user_id)
        db.session.add(settings)
        db.session.commit()
    
    return jsonify(settings.to_dict()), 200

@settings_bp.route('/settings', methods=['POST'])
@token_required
def update_settings(user_id):
    data = request.get_json()
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.session.add(settings)
    
    # Update settings
    if 'service' in data:
        settings.service = data['service']
    if 'model' in data:
        settings.model = data['model']
    if 'temperature' in data:
        settings.temperature = data['temperature']
    if 'max_tokens' in data:
        settings.max_tokens = data['max_tokens']
    if 'assistant_id' in data:
        settings.assistant_id = data['assistant_id']
    if 'service_thread_id' in data:
        settings.service_thread_id = data['service_thread_id']
    if 'session_thread_id' in data:
        settings.session_thread_id = data['session_thread_id']
    
    db.session.commit()
    
    return jsonify(settings.to_dict()), 200

@settings_bp.route('/services', methods=['GET'])
@token_required
def get_services(user_id):
    # This would typically fetch from a database or configuration
    # Static list for demonstration
    services = {
        'openai': {
            'name': 'OpenAI',
            'models': ['gpt-3.5-turbo', 'gpt-4'],
            'supportsAssistants': True
        },
        'openai_assistants': {
            'name': 'OpenAI Assistants',
            'models': ['gpt-3.5-turbo', 'gpt-4']
        },
        'claude': {
            'name': 'Claude',
            'models': ['claude-instant-1', 'claude-2']
        },
        'grok': {
            'name': 'Grok',
            'models': ['grok-1']
        }
    }
    
    return jsonify(services), 200

@settings_bp.route('/assistants', methods=['GET'])
@token_required
def get_assistants(user_id):
    # In a real implementation, this would fetch from OpenAI API
    # Mock data for demonstration
    assistants = [
        {
            'id': 'asst_123',
            'name': 'Research Assistant'
        },
        {
            'id': 'asst_456',
            'name': 'Code Helper'
        },
        {
            'id': 'asst_789',
            'name': 'Writing Assistant'
        }
    ]
    
    return jsonify(assistants), 200