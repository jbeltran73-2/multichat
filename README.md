# Chat Application

A modern chat application that supports multiple AI providers with a clean and intuitive interface.

## Features

- Support for multiple AI providers (OpenAI, Anthropic, Gemini, Groq, Deepseek, xAI, Ollama)
- Real-time chat interface with markdown support
- Prompt enhancement using Groq's Llama 3.3 70B model
- File attachment support
- Context-aware conversations
- Model selection and configuration
- Firebase authentication and data persistence
- Chat history synchronization across devices
- Secure encrypted storage of API keys

## Security

### Local Development
When running locally (localhost:5173), the application connects to Firebase for:
- User authentication
- Secure storage of encrypted API keys
- Chat history synchronization

### Production Deployment

When deployed to Netlify or Cloudflare Pages, the application handles data as follows:

1. API Keys:
   - Encrypted and stored in Firebase Firestore
   - Accessible only to authenticated users
   - Protected by Firebase security rules
   - Synchronized across user's devices

2. Chat History:
   - Stored in Firebase Firestore
   - Synchronized across user's devices
   - Accessible only to authenticated users

3. Security:
   - All API requests are encrypted
   - Firebase Authentication for user management
   - Firestore security rules protect user data
   - API keys are encrypted before storage

For Netlify:
- API requests are handled through Netlify Functions

For Cloudflare:
- API requests are handled through Cloudflare Workers

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jbeltran73-2/project-chat-multiple-v0.1
   cd project-chat-multiple-v0.1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase environment variables:
   Create a `.env` file in the root directory with your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

### Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password and Google sign-in methods
3. Create a Firestore database
4. Get your Firebase configuration from Project Settings > General > Your apps > Web app
5. Add the configuration values to your `.env` file

### API Key Configuration
API keys are managed through the application's user interface:

1. Sign in to the application
2. Click the gear icon to open settings
3. Add your API keys for the providers you want to use
4. Keys are automatically encrypted and stored in Firebase

The application securely stores your API keys:
- Keys are encrypted before being stored in Firebase
- Each user's keys are isolated and protected
- Keys can be updated or removed through the settings panel

### Netlify Deployment
1. Go to your Netlify site settings
2. Navigate to "Environment variables"
3. Add your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   ```

### API Keys

Each provider requires its own API key:

- **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Anthropic**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
- **Gemini**: Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)
- **Groq**: Get your API key from [Groq Console](https://console.groq.com/)
- **Deepseek**: Get your API key from [Deepseek's platform](https://platform.deepseek.com/api_keys)
- **xAI**: Get your API key from [xAI's platform](https://console.x.ai/)

## Usage

1. Open the application in your browser
2. Sign in with your email or Google account
3. Click the gear icon to open settings
4. Add your API keys for the providers you want to use
5. Select a model and start chatting

### Enhance Prompt Feature

The enhance prompt feature uses Groq's Llama 3.3 70B model to improve your prompts. To use this feature:

1. Add your Groq API key through the settings panel
2. Type your prompt in the chat input
3. Click the star icon to enhance your prompt
4. The enhanced prompt will replace your original input

If you haven't added a Groq API key, hovering over the star icon will show a message explaining that you need to add your Groq API key to use this feature.

## Development

### Project Structure

```
src/
├── components/        # React components
├── store/            # Zustand state management
├── types/            # TypeScript types
├── utils/            # Utility functions
│   ├── apiManager/   # API management
│   ├── config/       # Configuration handling
│   ├── error/        # Error handling
│   ├── providers/    # Provider-specific implementations
│   └── services/     # Service layer
netlify/
└── functions/        # Serverless functions for API requests
public/              # Static assets
```

### Scripts

- `dev`: Start development server
- `build`: Build production version
- `lint`: Run ESLint
- `format`: Format code with Prettier

## License

This project is licensed under the terms of the [MIT License](./LICENSE).

### Attribution

If you find this project useful, consider giving credit to Juan Beltrán by linking to https://github.com/jbeltran73-2 or https://www.linkedin.com/in/juan-beltran-ai/
