'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Github, Key, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import GitHubApiClient from '@/lib/github';

interface CredentialsPageProps {
  onCredentialsSet: (token: string, username: string) => void;
}

export default function CredentialsPage({ onCredentialsSet }: CredentialsPageProps) {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateCredentials = async () => {
    if (!token.trim() || !username.trim()) {
      setError('Please enter both GitHub token and username');
      return;
    }

    setIsValidating(true);
    setError(null);
    setSuccess(false);

    try {
      const client = new GitHubApiClient(token.trim());
      const user = await client.getUser(username.trim());
      
      // Verify the token belongs to the specified user
      if (user.login.toLowerCase() !== username.trim().toLowerCase()) {
        throw new Error('Token does not belong to the specified username');
      }

      setSuccess(true);
      
      // Store credentials in localStorage for persistence
      localStorage.setItem('github_token', token.trim());
      localStorage.setItem('github_username', username.trim());
      
      // Call the parent callback after a short delay to show success
      setTimeout(() => {
        onCredentialsSet(token.trim(), username.trim());
      }, 1000);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to validate credentials: ${errorMessage}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateCredentials();
  };

  const loadStoredCredentials = () => {
    const storedToken = localStorage.getItem('github_token');
    const storedUsername = localStorage.getItem('github_username');
    
    if (storedToken && storedUsername) {
      setToken(storedToken);
      setUsername(storedUsername);
    }
  };

  // Load stored credentials on component mount
  useEffect(() => {
    loadStoredCredentials();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center">
            <Github className="h-6 w-6 text-white dark:text-gray-900" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            GitHub Repository Manager
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your GitHub credentials to get started
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                GitHub Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:z-10 sm:text-sm"
                  placeholder="Enter your GitHub username"
                />
              </div>
            </div>

            {/* Token Field */}
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Personal Access Token
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="token"
                  name="token"
                  type={showToken ? 'text' : 'password'}
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:z-10 sm:text-sm"
                  placeholder="Enter your GitHub personal access token"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 dark:focus:text-gray-300"
                  >
                    {showToken ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Success!
                  </h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    Credentials validated successfully. Redirecting...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isValidating || !token.trim() || !username.trim()}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                'Connect to GitHub'
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">
                Don&apos;t have a GitHub Personal Access Token?
              </p>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
              >
                Create one here
              </a>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Required scopes: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">repo</code> and <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">public_repo</code>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
