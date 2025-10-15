'use client';

import { useState, useEffect, useCallback } from 'react';
import { GitHubUser, GitHubRepository } from '@/lib/github';
import GitHubApiClient from '@/lib/github';
import ProfileCard from '@/components/ProfileCard';
import RepositoryList from '@/components/RepositoryList';
import RepositoryDetails from '@/components/RepositoryDetails';
import CredentialsPage from '@/components/CredentialsPage';
import { useCredentials } from '@/contexts/CredentialsContext';
import { AlertCircle, Loader2, RefreshCw, LogOut } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function GitHubManager() {
  const { credentials, setCredentials, clearCredentials, isLoading: credentialsLoading } = useCredentials();
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<GitHubRepository | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingRepoId, setDeletingRepoId] = useState<number | null>(null);
  const [githubClient, setGithubClient] = useState<GitHubApiClient | null>(null);

  // Initialize GitHub client when credentials are available
  useEffect(() => {
    if (credentials) {
      const client = new GitHubApiClient(credentials.token);
      setGithubClient(client);
    } else {
      setGithubClient(null);
    }
  }, [credentials]);

  const loadData = useCallback(async () => {
    if (!githubClient) return;

    setLoading(true);
    setError(null);

    try {
      if (!credentials) return;
      
      // Load user and repositories in parallel
      const [userData, reposData] = await Promise.all([
        githubClient.getUser(credentials.username),
        githubClient.getAllUserRepositories(credentials.username)
      ]);

      setUser(userData);
      setRepositories(reposData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage || 'Failed to load GitHub data');
    } finally {
      setLoading(false);
    }
  }, [githubClient, credentials]);

  useEffect(() => {
    if (githubClient && credentials) {
      loadData();
    }
  }, [githubClient, credentials, loadData]);

  const handleViewRepository = (repo: GitHubRepository) => {
    setSelectedRepository(repo);
  };

  const handleBackToList = () => {
    setSelectedRepository(null);
  };

  const handleDeleteRepository = async (repo: GitHubRepository) => {
    if (!githubClient) return;

    setDeletingRepoId(repo.id);

    try {
      await githubClient.deleteRepository(repo.full_name.split('/')[0], repo.name);
      
      // Remove from local state
      setRepositories(prev => prev.filter(r => r.id !== repo.id));
      
      // If this was the selected repository, go back to list
      if (selectedRepository?.id === repo.id) {
        setSelectedRepository(null);
      }
      
      // Update user's repository count
      if (user) {
        setUser(prev => prev ? { ...prev, public_repos: prev.public_repos - 1 } : null);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage || 'Failed to delete repository');
    } finally {
      setDeletingRepoId(null);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleLogout = () => {
    clearCredentials();
    setUser(null);
    setRepositories([]);
    setSelectedRepository(null);
    setError(null);
  };

  // Show loading while checking for stored credentials
  if (credentialsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show credentials page if no credentials are available
  if (!credentials) {
    return <CredentialsPage onCredentialsSet={setCredentials} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading GitHub data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">GitHub Repository Manager</h1>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {selectedRepository ? (
          <RepositoryDetails
            repository={selectedRepository}
            onBack={handleBackToList}
            onDelete={handleDeleteRepository}
          />
        ) : (
          <div className="space-y-8">
            {/* Profile Card */}
            <ProfileCard user={user} />

            {/* Repository List */}
            <RepositoryList
              repositories={repositories}
              onViewRepository={handleViewRepository}
              onDeleteRepository={handleDeleteRepository}
              deletingRepoId={deletingRepoId ?? undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}