import type { APIConfig } from '../../types/models';
import { getProviderEnvKey, getProviderEndpointKey, readEnvFile } from '../envManager';

export function loadStoredConfigs(): APIConfig[] {
  console.log('Loading stored configs...');
  const envVars = readEnvFile();
  console.log('Environment variables:', envVars);
  const configs: APIConfig[] = [];

  Object.entries(envVars).forEach(([key, value]) => {
    console.log('Processing env var:', key);
    if (key.endsWith('_API_KEY')) {
      const provider = key.split('_')[0].toLowerCase();
      console.log('Found provider:', provider);
      const config = {
        provider,
        apiKey: value,
        endpoint: envVars[getProviderEndpointKey(provider)],
        iconUrl: envVars[`${provider.toUpperCase()}_ICON_URL`]
      };
      console.log('Created config:', { ...config, apiKey: '[REDACTED]' });
      configs.push(config);
    }
  });

  console.log('Returning configs:', configs.map(c => ({ ...c, apiKey: '[REDACTED]' })));
  return configs;
}