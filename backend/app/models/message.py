from datetime import datetime
import uuid

class Message:
    def __init__(self, user_id, content, role, service, model, thread_id=None):
        self.id = str(uuid.uuid4())
        self.user_id = user_id
        self.thread_id = thread_id or str(uuid.uuid4())
        self.content = content
        self.role = role  # 'user' or 'assistant'
        self.service = service
        self.model = model
        self.timestamp = datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'thread_id': self.thread_id,
            'content': self.content,
            'role': self.role,
            'service': self.service,
            'model': self.model,
            'timestamp': self.timestamp
        }

    @classmethod
    def from_dict(cls, data):
        message = cls(
            user_id=data['user_id'],
            content=data['content'],
            role=data['role'],
            service=data['service'],
            model=data['model'],
            thread_id=data.get('thread_id')
        )
        message.id = data.get('id', message.id)
        message.timestamp = data.get('timestamp', message.timestamp)
        return message


class Thread:
    def __init__(self, user_id, title=None):
        self.id = str(uuid.uuid4())
        self.user_id = user_id
        self.title = title or "New Conversation"
        self.created_at = datetime.utcnow().isoformat()
        self.updated_at = datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @classmethod
    def from_dict(cls, data):
        thread = cls(
            user_id=data['user_id'],
            title=data.get('title')
        )
        thread.id = data.get('id', thread.id)
        thread.created_at = data.get('created_at', thread.created_at)
        thread.updated_at = data.get('updated_at', thread.updated_at)
        return thread