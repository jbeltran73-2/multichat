import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { translations } from '../utils/translations';

type TranslationKey =
  | 'apiConfiguration'
  | 'provider'
  | 'selectProvider'
  | 'apiKey'
  | 'getApiKey'
  | 'endpointUrl'
  | 'configuring'
  | 'saveConfiguration'
  | 'configured';

type TranslationType = {
  [key in TranslationKey]: string;
};

type Translations = {
  [key: string]: TranslationType;
};

// Fallback translations in case the import fails
const fallbackTranslations: Translations = {
  en: {
    apiConfiguration: 'API Configuration',
    provider: 'Provider',
    selectProvider: 'Select a provider',
    apiKey: 'API Key',
    getApiKey: 'Get API Key',
    endpointUrl: 'Endpoint URL',
    configuring: 'Configuring...',
    saveConfiguration: 'Save Configuration',
    configured: 'Configured'
  },
  es: {
    apiConfiguration: 'Configuración de API',
    provider: 'Proveedor',
    selectProvider: 'Seleccionar proveedor',
    apiKey: 'Clave API',
    getApiKey: 'Obtener clave API',
    endpointUrl: 'URL del endpoint',
    configuring: 'Configurando...',
    saveConfiguration: 'Guardar configuración',
    configured: 'Configurado'
  }
};

const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    docsUrl: 'https://platform.openai.com/api-keys',
    requiresTopup: true,
    icon: '/provider-icons/openai-logo.png'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    docsUrl: 'https://console.anthropic.com/',
    requiresTopup: true,
    icon: '/provider-icons/anthropic-logo.png'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    docsUrl: 'https://aistudio.google.com/apikey',
    requiresTopup: false,
    icon: '/provider-icons/gemini-logo.png'
  },
  {
    id: 'groq',
    name: 'Groq',
    docsUrl: 'https://console.groq.com/',
    requiresTopup: false,
    icon: '/provider-icons/groq-logo.jpg'
  },
  {
    id: 'deepseek',
    name: 'Deepseek',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    requiresTopup: true,
    icon: '/provider-icons/deepseek-logo.webp'
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    docsUrl: 'https://console.x.ai/',
    requiresTopup: true,
    icon: '/provider-icons/xai-logo.webp'
  },
  {
    id: 'ollama',
    name: 'Ollama',
    docsUrl: 'https://ollama.ai/download',
    requiresTopup: false,
    icon: '/provider-icons/ollama-logo.png'
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    docsUrl: 'https://cloud.cerebras.ai/platform/org_ed2xyytct4k4y5d5wyetrfev/apikeys',
    requiresTopup: false,
    icon: '/provider-icons/cerebras-logo.png'
  }
];

export const ConfigPanel = () => {
  const { 
    isConfigPanelOpen, 
    toggleConfigPanel, 
    addApiConfig, 
    apiConfigs,
    isLoading,
    error,
    language
  } = useStore();
  
  const [provider, setProvider] = React.useState('');
  const [apiKey, setApiKey] = React.useState('');
  const [endpoint, setEndpoint] = React.useState('');
  const [_, forceUpdate] = React.useState(0);

  // Get translation with fallback
  const getTranslation = (key: TranslationKey) => {
    try {
      return translations[language]?.[key] || fallbackTranslations[language]?.[key] || fallbackTranslations['en'][key];
    } catch (e) {
      console.error('Translation error:', e);
      return fallbackTranslations['en'][key];
    }
  };

  // Force re-render when language changes
  useEffect(() => {
    console.log('Language changed in ConfigPanel:', language);
    console.log('Available translations:', translations);
    console.log('Current translations:', translations[language]);
    forceUpdate(prev => prev + 1);
  }, [language]);

  // Debug translations on every render
  console.log('Render debug - language:', language);
  console.log('Render debug - translations:', translations[language]);

  const configuredProviders = apiConfigs.map(config => config.provider);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProvider = PROVIDERS.find(p => p.id === provider);
    if (!selectedProvider) return;

    console.log('Submitting config:', { provider, apiKey });
    await addApiConfig({ 
      provider, 
      apiKey, 
      endpoint
    });
    
    if (!error) {
      setProvider('');
      setApiKey('');
      setEndpoint('');
    }
  };

  if (!isConfigPanelOpen) return null;

  const selectedProvider = PROVIDERS.find(p => p.id === provider);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">{getTranslation('apiConfiguration')}</h2>
          <button
            onClick={toggleConfigPanel}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getTranslation('provider')}
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              <option value="">{getTranslation('selectProvider')}</option>
              {PROVIDERS.map(p => (
                <option 
                  key={p.id} 
                  value={p.id}
                  className={configuredProviders.includes(p.id) ? 'text-green-600 font-medium' : ''}
                >
                  {p.name} {configuredProviders.includes(p.id) ? `(${getTranslation('configured')})` : ''} {p.requiresTopup ? '💳' : ''}
                </option>
              ))}
            </select>
            {selectedProvider && (
              <div className="flex items-center mt-2 space-x-2">
                <img 
                  src={selectedProvider.icon} 
                  alt={selectedProvider.name} 
                  className="w-6 h-6 object-contain"
                />
                <a
                  href={selectedProvider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {getTranslation('getApiKey')}
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getTranslation('apiKey')}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          {provider === 'ollama' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getTranslation('endpointUrl')}
              </label>
              <input
                type="url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="http://localhost:11434"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-2 px-4 bg-gray-700 text-white rounded-md transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
            }`}
            disabled={isLoading || !provider}
          >
            {isLoading ? getTranslation('configuring') : getTranslation('saveConfiguration')}
          </button>
        </form>
      </div>
    </div>
  );
};