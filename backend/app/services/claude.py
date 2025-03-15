import os
import anthropic

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

def claude_completion(messages, model, temperature, max_tokens):
    """
    Anthropic Claude API integration
    """
    # Convert messages to Claude format
    claude_messages = []
    
    for message in messages:
        role = message['role']
        # Claude uses 'human' and 'assistant' instead of 'user' and 'assistant'
        if role == 'user':
            role = 'human'
        claude_messages.append({
            'role': role,
            'content': message['content']
        })
    
    response = client.messages.create(
        model=model,
        messages=claude_messages,
        temperature=temperature,
        max_tokens=max_tokens
    )
    
    return response.content[0].text