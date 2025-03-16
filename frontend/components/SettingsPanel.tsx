import React, { useState, useEffect } from 'react';
import { UserSettings, ServiceMap, Assistant } from '../types';

interface SettingsPanelProps {
  settings: UserSettings;
  services: ServiceMap;
  assistants: Assistant[];
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  isOpen: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  services,
  assistants,
  onUpdateSettings,
  isOpen,
}) => {
  const [selectedService, setSelectedService] = useState(settings.service);
  const [selectedModel, setSelectedModel] = useState(settings.model);
  const [temperature, setTemperature] = useState(settings.temperature);
  const [maxTokens, setMaxTokens] = useState(settings.max_tokens);
  const [assistantId, setAssistantId] = useState(settings.assistant_id || '');
  
  // Reset settings when props change
  useEffect(() => {
    setSelectedService(settings.service);
    setSelectedModel(settings.model);
    setTemperature(settings.temperature);
    setMaxTokens(settings.max_tokens);
    setAssistantId(settings.assistant_id || '');
  }, [settings]);

  // Get models for selected service
  const availableModels = selectedService ? services[selectedService]?.models || [] : [];
  const supportsAssistants = selectedService ? services[selectedService]?.supportsAssistants : false;

  useEffect(() => {
    // Reset model if not available for selected service
    if (availableModels.length > 0 && !availableModels.includes(selectedModel)) {
      setSelectedModel(availableModels[0]);
    }
  }, [selectedService, availableModels, selectedModel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedSettings: Partial<UserSettings> = {
      service: selectedService,
      model: selectedModel,
      temperature: temperature,
      max_tokens: maxTokens,
    };

    if (supportsAssistants) {
      updatedSettings.assistant_id = assistantId || null;
    } else {
      updatedSettings.assistant_id = null;
    }

    onUpdateSettings(updatedSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white border-b shadow-md p-4 transition-all duration-300">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-lg font-semibold mb-4">Chat Settings</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Service
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {Object.entries(services).map(([key, service]) => (
                  <option key={key} value={key}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature: {temperature.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Max Tokens Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Tokens: {maxTokens}
              </label>
              <input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Assistant ID (when applicable) */}
            {supportsAssistants && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assistant
                </label>
                <select
                  value={assistantId}
                  onChange={(e) => setAssistantId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">None (Use regular chat)</option>
                  {assistants.map((assistant) => (
                    <option key={assistant.id} value={assistant.id}>
                      {assistant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Apply Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPanel;