import { getProviderEnvKey, getProviderEndpointKey } from '../envManager';
import type { APIConfig } from '../../types/models';

export function saveConfig(config: APIConfig): void {
  const envVars = readEnvFile();
  
  // Save API key
  envVars[getProviderEnvKey(config.provider)] = config.apiKey;
  
  // Save endpoint if provided
  if (config.endpoint) {
    envVars[getProviderEndpointKey(config.provider)] = config.endpoint;
  }
  
  // Save icon URL if provided
  if (config.iconUrl) {
    envVars[`${config.provider.toUpperCase()}_ICON_URL`] = config.iconUrl;
  }
  
  writeEnvFile(envVars);
}

export function removeConfig(provider: string): void {
  const envVars = readEnvFile();
  delete envVars[getProviderEnvKey(provider)];
  delete envVars[getProviderEndpointKey(provider)];
  delete envVars[`${provider.toUpperCase()}_ICON_URL`];
  writeEnvFile(envVars);
}

function readEnvFile(): Record<string, string> {
  try {
    const stored = localStorage.getItem('multiple-chat-env-vars');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function writeEnvFile(envVars: Record<string, string>): void {
  localStorage.setItem('multiple-chat-env-vars', JSON.stringify(envVars));
}