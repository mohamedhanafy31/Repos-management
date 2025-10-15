'use client';

import { GitHubRepository } from '@/lib/github';
import { 
  Star, 
  GitBranch, 
  Eye, 
  Calendar, 
  ExternalLink, 
  ArrowLeft,
  Code,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';

interface RepositoryDetailsProps {
  repository: GitHubRepository;
  onBack: () => void;
  onDelete: (repo: GitHubRepository) => void;
}

export default function RepositoryDetails({ repository, onBack, onDelete }: RepositoryDetailsProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) return `${sizeInKB} KB`;
    return `${(sizeInKB / 1024).toFixed(1)} MB`;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(type);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${repository.name}"? This action cannot be undone.`)) {
      onDelete(repository);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to repositories</span>
        </button>
      </div>

      {/* Repository Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{repository.name}</h1>
            {repository.description && (
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{repository.description}</p>
            )}
            
            {/* Repository Status Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {repository.isOwner === false && (
                <span className="px-3 py-1 text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                  Contributor
                </span>
              )}
              {repository.private && (
                <span className="px-3 py-1 text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                  Private
                </span>
              )}
              {repository.fork && (
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                  Fork
                </span>
              )}
              {repository.archived && (
                <span className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
                  Archived
                </span>
              )}
              {repository.disabled && (
                <span className="px-3 py-1 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                  Disabled
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-2">
            <button
              onClick={() => window.open(repository.html_url, '_blank')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on GitHub</span>
            </button>
            
            {repository.isOwner !== false && (
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <span>Delete Repository</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Stars</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{repository.stargazers_count}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
              <GitBranch className="w-4 h-4" />
              <span className="text-sm font-medium">Forks</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{repository.forks_count}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Issues</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{repository.open_issues_count}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
              <Code className="w-4 h-4" />
              <span className="text-sm font-medium">Size</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatSize(repository.size)}</div>
          </div>
        </div>
      </div>

      {/* Repository Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Repository Information</h2>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Language:</span>
              <div className="mt-1">
                {repository.language ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-gray-900 dark:text-gray-100">{repository.language}</span>
                  </div>
                ) : (
                  <span className="text-gray-500 dark:text-gray-500">Not specified</span>
                )}
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created:</span>
              <div className="mt-1 flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(repository.created_at)}</span>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated:</span>
              <div className="mt-1 flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(repository.updated_at)}</span>
              </div>
            </div>
            
            {repository.pushed_at && (
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Push:</span>
                <div className="mt-1 flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(repository.pushed_at)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clone URLs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Clone URLs</h2>
          
          <div className="space-y-4">
            {/* HTTPS Clone URL */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                HTTPS Clone URL
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={repository.clone_url}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm font-mono text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={() => copyToClipboard(repository.clone_url, 'https')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  title="Copy HTTPS URL"
                >
                  {copiedUrl === 'https' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SSH Clone URL */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                SSH Clone URL
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={repository.ssh_url}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm font-mono text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={() => copyToClipboard(repository.ssh_url, 'ssh')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  title="Copy SSH URL"
                >
                  {copiedUrl === 'ssh' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Download ZIP */}
            <div>
              <button
                onClick={() => window.open(`${repository.html_url}/archive/refs/heads/main.zip`, '_blank')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download ZIP</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
