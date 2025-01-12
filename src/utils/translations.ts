export type TranslationKey = 
  | 'apiConfiguration'
  | 'provider'
  | 'selectProvider'
  | 'apiKey'
  | 'getApiKey'
  | 'endpointUrl'
  | 'configuring'
  | 'saveConfiguration'
  | 'configured'
  | 'login'
  | 'signUp'
  | 'name'
  | 'email'
  | 'password'
  | 'importantInfo'
  | 'terms'
  | 'groq'
  | 'apiKeys'
  | 'chatHistory'
  | 'deleteChat'
  | 'training'
  | 'acceptTerms'
  | 'continueWith'
  | 'google'
  | 'needAccount'
  | 'alreadyHaveAccount'
  | 'typeMessage'
  | 'history'
  | 'authenticationFailed'
  | 'googleSignInFailed'
  | 'selectModelToStart'
  | 'enhancePrompt'
  | 'underDevelopment'
  | 'noConversationsYet';

export type TranslationType = {
  [key in TranslationKey]: string;
};

export type Translations = {
  [key: string]: TranslationType;
};

export const translations: Translations = {
  en: {
    login: 'Login',
    signUp: 'Sign Up',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    importantInfo: 'Important Information:',
    terms: 'Before using the app, add your API\'s from Models you want to use',
    groq: 'If you want Enhance prompts, you have to add Groq API',
    apiKeys: 'API keys are stored in Firebase encrypted',
    chatHistory: 'Chat history is stored in Firebase',
    deleteChat: 'You can delete each chat and it will be deleted from server',
    training: 'Data isn\'t being used for training purposes',
    acceptTerms: 'I understand and accept these terms',
    continueWith: 'Or continue with',
    google: 'Google',
    needAccount: 'Need an account? Sign Up',
    alreadyHaveAccount: 'Already have an account? Login',
    typeMessage: 'Type your message...',
    history: 'History',
    authenticationFailed: 'Authentication failed',
    googleSignInFailed: 'Failed to sign in with Google',
    selectModelToStart: 'Select a model to start chatting',
    enhancePrompt: 'Enhance prompt',
    underDevelopment: 'Under development',
    noConversationsYet: 'No conversations yet',
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
    login: 'Iniciar sesión',
    signUp: 'Registrarse',
    name: 'Nombre',
    email: 'Correo electrónico',
    password: 'Contraseña',
    importantInfo: 'Información importante:',
    terms: 'Antes de usar la aplicación, añade tus API\'s de los Modelos que quieras usar',
    groq: 'Si quieres mejorar los prompts, tienes que añadir la API de Groq',
    apiKeys: 'Las claves API se almacenan en Firebase encriptadas',
    chatHistory: 'El historial de chat se almacena en Firebase',
    deleteChat: 'Puedes eliminar cada chat y se borrará del servidor',
    training: 'Los datos no se utilizan para fines de entrenamiento',
    acceptTerms: 'Entiendo y acepto estos términos',
    continueWith: 'O continúa con',
    google: 'Google',
    needAccount: '¿Necesitas una cuenta? Regístrate',
    alreadyHaveAccount: '¿Ya tienes una cuenta? Inicia sesión',
    typeMessage: 'Escribe tu mensaje...',
    history: 'Histórico',
    authenticationFailed: 'Error de autenticación',
    googleSignInFailed: 'Error al iniciar sesión con Google',
    selectModelToStart: 'Selecciona un modelo para empezar a chatear',
    enhancePrompt: 'Mejorar el prompt',
    underDevelopment: 'En desarrollo',
    noConversationsYet: 'No hay conversaciones aún',
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