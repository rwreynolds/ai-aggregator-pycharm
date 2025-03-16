'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Message from '../../components/Message';
import SettingsPanel from '../../components/SettingsPanel';
import { Message as MessageType, UserSettings, ServiceMap, Assistant } from '../../types';
import {
  fetchMessages,
  fetchUserSettings,
  fetchServices,
  fetchAssistants,
  sendMessage,
  updateUserSettings
} from '../../services/api';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [services, setServices] = useState<ServiceMap>({});
  const [assistants, setAssistants] = useState<Assistant[]>([]);

  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load initial data
  useEffect(() => {
    if (status === 'authenticated') {
      const loadInitialData = async () => {
        try {
          const [messagesData, settingsData, servicesData, assistantsData] = await Promise.all([
            fetchMessages(),
            fetchUserSettings(),
            fetchServices(),
            fetchAssistants()
          ]);

          setMessages(messagesData);
          setSettings(settingsData);
          setServices(servicesData);
          setAssistants(assistantsData);
        } catch (err) {
          console.error('Error loading initial data:', err);
          setError('Failed to load data. Please refresh the page.');
        }
      };

      loadInitialData();
    }
  }, [status]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !settings) return;

    setIsLoading(true);
    setError('');

    try {
      // Add optimistic user message
      const optimisticUserMsg: MessageType = {
        id: `temp-${Date.now()}`,
        user_id: session?.user?.id || '',
        thread_id: settings.session_thread_id || '',
        content: newMessage,
        role: 'user',
        service: settings.service,
        model: settings.model,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, optimisticUserMsg]);
      setNewMessage('');

      // Send message to API
      const response = await sendMessage({
        message: newMessage,
        settings
      });

      // Replace the optimistic message with the real response
      setMessages(prevMessages => [...prevMessages.filter(m => m.id !== optimisticUserMsg.id), response]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = async (updatedSettings: Partial<UserSettings>) => {
    if (!settings) return;

    try {
      const response = await updateUserSettings(updatedSettings);
      setSettings(response);
      setShowSettings(false);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings. Please try again.');
    }
  };

  if (status === 'loading' || !settings) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-blue-600">AI Services Aggregator</h1>

          <div className="flex space-x-4 items-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>

            <div className="text-sm text-gray-600">
              {session?.user?.name}
            </div>

            <button
              onClick={() => router.push('/api/auth/signout')}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      <SettingsPanel
        settings={settings}
        services={services}
        assistants={assistants}
        onUpdateSettings={handleUpdateSettings}
        isOpen={showSettings}
      />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <h3 className="text-xl font-semibold mb-2">Welcome to AI Services Aggregator</h3>
              <p>Start a conversation with any AI model by typing a message below.</p>
            </div>
          ) : (
            messages.map(message => (
              <Message key={message.id} message={message} />
            ))
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isLoading}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : 'Send'}
            </button>
          </form>

          <div className="mt-2 text-xs text-gray-500">
            Using: {settings.service} / {settings.model}
          </div>
        </div>
      </div>
    </div>
  );
}