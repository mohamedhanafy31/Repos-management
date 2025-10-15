'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Credentials {
  token: string;
  username: string;
}

interface CredentialsContextType {
  credentials: Credentials | null;
  setCredentials: (token: string, username: string) => void;
  clearCredentials: () => void;
  isLoading: boolean;
}

const CredentialsContext = createContext<CredentialsContextType | undefined>(undefined);

export function CredentialsProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentialsState] = useState<Credentials | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load credentials from localStorage on mount
    const storedToken = localStorage.getItem('github_token');
    const storedUsername = localStorage.getItem('github_username');
    
    if (storedToken && storedUsername) {
      setCredentialsState({ token: storedToken, username: storedUsername });
    }
    
    setIsLoading(false);
  }, []);

  const setCredentials = (token: string, username: string) => {
    const newCredentials = { token, username };
    setCredentialsState(newCredentials);
    
    // Store in localStorage
    localStorage.setItem('github_token', token);
    localStorage.setItem('github_username', username);
  };

  const clearCredentials = () => {
    setCredentialsState(null);
    
    // Remove from localStorage
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_username');
  };

  return (
    <CredentialsContext.Provider value={{
      credentials,
      setCredentials,
      clearCredentials,
      isLoading
    }}>
      {children}
    </CredentialsContext.Provider>
  );
}

export function useCredentials() {
  const context = useContext(CredentialsContext);
  if (context === undefined) {
    throw new Error('useCredentials must be used within a CredentialsProvider');
  }
  return context;
}
