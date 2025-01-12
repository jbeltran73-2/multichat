// Copyright (c) 2025 Juan Beltrán
// Licensed under the MIT License. See LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { Settings, Menu, X } from 'lucide-react';
import { ModelSelector } from './components/ModelSelector';
import { ConfigPanel } from './components/ConfigPanel';
import { Chat } from './components/Chat';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import { useStore } from './store/useStore';
import { translations } from './utils/translations';
import { onAuthChange } from './utils/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { ChatHistory } from './components/ChatHistory';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const {
    toggleConfigPanel,
    initializeModels,
    loadChat,
    isConfigPanelOpen,
    apiConfigs,
    user,
    setUser,
    language
  } = useStore();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is the lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    initializeModels();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      console.log('Auth state changed:', {
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        displayName: firebaseUser?.displayName,
        photoURL: firebaseUser?.photoURL
      });
      
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined
        };
        console.log('Setting user state:', userData);
        setUser(firebaseUser);
      } else {
        console.log('Clearing user state');
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <Auth />
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen bg-gray-100">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-xl font-bold">Multiple Chat</h1>
          <UserProfile />
        </div>

        {/* Mobile Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex-1 overflow-y-auto h-[calc(100%-8rem)]">
            <h2 className="p-4 text-sm font-medium text-gray-500">{translations[language].history}</h2>
            <ChatHistory />
          </div>

          {/* 
            IMPORTANT LICENSE NOTICE:
            The following attribution section (by JB and LinkedIn link) is a required part of the MIT license
            and must not be removed or modified without explicit permission from Juan Beltrán.
            For licensing inquiries, please contact through LinkedIn: https://www.linkedin.com/in/juan-beltran-ai/
          */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t bg-white">
            <div className="p-4 flex items-center">
              <span className="text-sm text-gray-500">by JB v 0.1</span>
              <a
                href="https://www.linkedin.com/in/juan-beltran-ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 hover:opacity-75 transition-opacity"
              >
                <svg className="w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
            <button
              onClick={toggleConfigPanel}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Main Content */}
        <div className="flex flex-col h-[calc(100%-4rem)]">
          <div className="p-4 border-b bg-white">
            <ModelSelector />
          </div>

          <div className="flex-1 overflow-hidden">
            <Chat />
          </div>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSidebar}
          />
        )}

        <ConfigPanel />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="w-48 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Multiple Chat</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <h2 className="p-4 text-sm font-medium text-gray-500">{translations[language].history}</h2>
          <ChatHistory />
        </div>

        {/* 
          IMPORTANT LICENSE NOTICE:
          The following attribution section (by JB and LinkedIn link) is a required part of the MIT license
          and must not be removed or modified without explicit permission from Juan Beltrán.
          For licensing inquiries, please contact through LinkedIn: https://www.linkedin.com/in/juan-beltran-ai/
        */}
        <div className="flex items-center justify-between border-t">
          <div className="p-4 flex items-center">
            <span className="text-sm text-gray-500">by JB v 0.1</span>
            <a
              href="https://www.linkedin.com/in/juan-beltran-ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 hover:opacity-75 transition-opacity"
            >
              <svg className="w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
          <button
            onClick={toggleConfigPanel}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <ModelSelector />
          <UserProfile />
        </div>

        <div className="flex-1 overflow-hidden">
          <Chat />
        </div>
      </div>

      <ConfigPanel />
    </div>
  );
}