// User and Authentication types
export interface User {
    id: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// Message and Thread types
export interface Message {
    id: string;
    user_id: string;
    thread_id: string;
    content: string;
    role: 'user' | 'assistant';
    service: string;
    model: string;
    timestamp: string;
}

export interface Thread {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

// Settings types
export interface UserSettings {
    id: string;
    user_id: string;
    service: string;
    model: string;
    temperature: number;
    max_tokens: number;
    assistant_id: string | null;
    service_thread_id: string | null;
    session_thread_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface Service {
    name: string;
    models: string[];
    supportsAssistants?: boolean;
}

export interface ServiceMap {
    [key: string]: Service;
}

export interface Assistant {
    id: string;
    name: string;
}

// API request types
export interface ChatRequest {
    message: string;
    settings?: UserSettings;
}

export interface SettingsUpdateRequest {
    service?: string;
    model?: string;
    temperature?: number;
    max_tokens?: number;
    assistant_id?: string | null;
    service_thread_id?: string | null;
    session_thread_id?: string | null;
}