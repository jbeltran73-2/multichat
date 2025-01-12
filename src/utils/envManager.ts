const STORAGE_KEY = 'multiple-chat-env-vars';

export const readEnvFile = (): Record<string, string> => {
  console.log('Reading environment variables from storage...');
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Raw stored value:', stored);
    const parsed = stored ? JSON.parse(stored) : {};
    console.log('Parsed environment variables:', { 
      ...parsed, 
      ...Object.fromEntries(
        Object.entries(parsed)
          .filter(([key]) => key.includes('API_KEY'))
          .map(([key]) => [key, '[REDACTED]'])
      )
    });
    return parsed;
  } catch (error) {
    console.error('Error reading environment variables:', error);
    return {};
  }
};

export const writeEnvFile = (envVars: Record<string, string>) => {
  console.log('Writing environment variables to storage...', {
    ...envVars,
    ...Object.fromEntries(
      Object.entries(envVars)
        .filter(([key]) => key.includes('API_KEY'))
        .map(([key]) => [key, '[REDACTED]'])
    )
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envVars));
    console.log('Successfully wrote environment variables');
  } catch (error) {
    console.error('Error writing environment variables:', error);
  }
};

export const getProviderEnvKey = (provider: string) => {
  const key = `${provider.toUpperCase()}_API_KEY`;
  console.log('Generated provider env key:', key);
  return key;
};

export const getProviderEndpointKey = (provider: string) => {
  const key = `${provider.toUpperCase()}_ENDPOINT`;
  console.log('Generated provider endpoint key:', key);
  return key;
};