import React, { useState, useEffect } from 'react';
import { signUp, login, signInWithGoogle, updateUserLanguage } from '../utils/firebase';
import { useStore } from '../store/useStore';
import { translations } from '../utils/translations';

const Auth: React.FC = () => {
  const { setUser, setLanguage: setStoreLanguage } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [language, setLocalLanguage] = useState<'en' | 'es'>('en');

  // Debug initial state
  useEffect(() => {
    console.log('Auth component mounted with state:', {
      isLogin,
      email,
      displayName,
      acceptedTerms,
      language,
      error
    });
  }, []);

  // Update store language when local language changes
  useEffect(() => {
    console.log('Language changed:', {
      previous: localStorage.getItem('language'),
      new: language
    });
    setStoreLanguage(language);
    localStorage.setItem('language', language);
  }, [language]);

  // Debug state changes
  useEffect(() => {
    console.log('Auth state updated:', {
      isLogin,
      email,
      displayName,
      acceptedTerms,
      error
    });
  }, [isLogin, email, displayName, acceptedTerms, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission:', {
      isLogin,
      email,
      displayName,
      acceptedTerms,
      language
    });

    try {
      let user;
      if (isLogin) {
        console.log('Attempting login...');
        user = await login(email, password);
        console.log('Login successful:', user.uid);
        // Update language if user changes it during login
        await updateUserLanguage(user.uid, language);
      } else {
        if (!acceptedTerms) {
          console.log('Terms not accepted');
          setError(translations[language].acceptTerms);
          return;
        }
        console.log('Attempting signup...');
        user = await signUp(email, password, displayName);
        console.log('Signup successful:', user.uid);
      }

      if (user) {
        console.log('Setting user in store:', user.uid);
        setUser(user);
      } else {
        throw new Error('Authentication failed - no user returned');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(
        error instanceof Error
          ? error.message
          : translations[language].authenticationFailed
      );
    }
  };

  const handleGoogleSignIn = async () => {
    if (!acceptedTerms) {
      setError(translations[language].acceptTerms);
      return;
    }

    try {
      console.log('Starting Google sign in with language:', language);
      const user = await signInWithGoogle();
      if (user) {
        // Update language if user changes it during Google sign in
        await updateUserLanguage(user.uid, language);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : translations[language].googleSignInFailed
      );
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin
          ? translations[language].login
          : translations[language].signUp}
      </h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center mb-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setLocalLanguage('en')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                language === 'en' ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">🇺🇸</span>
              <span>English</span>
            </button>
            <button
              type="button"
              onClick={() => setLocalLanguage('es')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                language === 'es' ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">🇪🇸</span>
              <span>Español</span>
            </button>
          </div>
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium mb-1">
              {translations[language].name}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            {translations[language].email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {translations[language].password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">
            {translations[language].importantInfo}
          </h3>
          <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
            <li>{translations[language].terms}</li>
            <li>{translations[language].groq}</li>
            <li>{translations[language].apiKeys}</li>
            <li>{translations[language].chatHistory}</li>
            <li>{translations[language].deleteChat}</li>
            <li>{translations[language].training}</li>
          </ul>
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="accept-terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="accept-terms" className="text-sm">
              {translations[language].acceptTerms}
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            className={`w-full p-2 text-white rounded ${
              !isLogin && !acceptedTerms
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={!isLogin && !acceptedTerms}
          >
            {isLogin
              ? translations[language].login
              : translations[language].signUp}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {translations[language].continueWith}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className={`w-full p-2 border border-gray-300 rounded flex items-center justify-center space-x-2 ${
              acceptedTerms
                ? 'hover:bg-gray-50'
                : 'opacity-50 cursor-not-allowed'
            }`}
            disabled={!acceptedTerms}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{translations[language].google}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Toggle button clicked');
              console.log('Current state:', {
                isLogin,
                email,
                displayName,
                acceptedTerms
              });
              
              // Reset form state when toggling
              setEmail('');
              setPassword('');
              setDisplayName('');
              setAcceptedTerms(false);
              setError('');
              
              // Toggle login mode
              setIsLogin(!isLogin);
              
              console.log('Toggled to:', !isLogin);
            }}
            className="mt-4 w-full text-blue-500 hover:underline py-2"
          >
            {isLogin
              ? translations[language].needAccount
              : translations[language].alreadyHaveAccount}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Auth;