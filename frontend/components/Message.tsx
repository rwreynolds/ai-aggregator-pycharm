import React from 'react';
import { Message as MessageType } from '../types';
import { useSession } from 'next-auth/react';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { data: session } = useSession();
  const isUser = message.role === 'user';
  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-4`}>
      <div
        className={`relative max-w-3xl rounded-lg p-4 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {!isUser && (
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-gray-600">Assistant</div>
          </div>
        )}

        {isUser && (
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-medium">
            {userInitial}
          </div>
        )}

        <div className="whitespace-pre-wrap">{message.content}</div>

        <div className="text-xs mt-3 opacity-70">
          {message.service} / {message.model}
        </div>
      </div>
    </div>
  );
};

export default Message;