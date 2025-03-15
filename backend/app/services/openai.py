import os
import openai
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

def chat_completion(messages, model, temperature, max_tokens):
    """
    Standard OpenAI chat completion
    """
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    
    return response.choices[0].message.content

def assistant_completion(messages, assistant_id, thread_id=None, user_id=None):
    """
    OpenAI Assistant API integration
    """
    # Create a new thread if none provided
    if not thread_id:
        thread = client.beta.threads.create()
        thread_id = thread.id
        
        # In a real app, you would save this thread_id to the user's settings
        # to maintain the conversation across sessions
    
    # Add the latest user message to the thread
    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=messages[-1]['content']
    )
    
    # Run the assistant
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id
    )
    
    # Wait for the run to complete
    while run.status in ["queued", "in_progress"]:
        run = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run.id
        )
    
    # Get the latest message from the assistant
    messages = client.beta.threads.messages.list(thread_id=thread_id)
    
    # Return the latest assistant message
    for message in messages.data:
        if message.role == "assistant":
            return message.content[0].text.value
            
    return "No response from assistant."