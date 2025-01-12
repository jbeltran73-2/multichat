import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { AIModel } from '../types/models';
import { translations } from '../utils/translations';

export const ModelSelector = () => {
  const { models, selectedModel, selectModel, language } = useStore();

  useEffect(() => {
    console.log('Available models:', models);
  }, [models]);

  const ModelBadge = ({ type }: { type: string }) => (
    <span className={`px-2 py-0.5 text-xs rounded-full ${
      type === 'Advanced' ? 'bg-blue-100 text-blue-800' :
      type === 'Vision' ? 'bg-purple-100 text-purple-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {type}
    </span>
  );

  const renderModelOption = (model: AIModel) => (
    <div className="flex items-center gap-2">
      <img src={model.icon} alt={model.name} className="w-5 h-5 object-contain" />
      <span>{model.name}</span>
      <span className="text-gray-500">({model.provider})</span>
    </div>
  );

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value;
    console.log('Selected model ID:', modelId);
    
    const model = models.find(m => m.id === modelId);
    console.log('Found model:', model);
    
    if (model) {
      console.log('Selecting model:', model.name, 'from provider:', model.provider);
      selectModel(model);
    }
  };

  useEffect(() => {
    console.log('Current selected model:', selectedModel);
  }, [selectedModel]);

  return (
    <div className="w-full max-w-md">
      <select
        value={selectedModel?.id || ''}
        onChange={handleModelChange}
        className="w-full p-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        <option value="">{translations[language].selectModelToStart}</option>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} ({model.provider})
          </option>
        ))}
      </select>

      {selectedModel && (
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src={selectedModel.icon} alt={selectedModel.name} className="w-6 h-6 object-contain" />
            <span className="font-medium">{selectedModel.name}</span>
          </div>
          <div className="flex gap-1">
            {selectedModel.type.map(type => (
              <ModelBadge key={type} type={type} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};