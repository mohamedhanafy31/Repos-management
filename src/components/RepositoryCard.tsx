'use client';

import { useState } from 'react';
import { GitHubRepository } from '@/lib/github';
import { Star, GitBranch, Eye, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RepositoryCardProps {
  repo: GitHubRepository;
  onView: (repo: GitHubRepository) => void;
  onDelete: (repo: GitHubRepository) => void;
  isDeleting?: boolean;
}

export default function RepositoryCard({ repo, onView, onDelete, isDeleting }: RepositoryCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) return `${sizeInKB} KB`;
    return `${(sizeInKB / 1024).toFixed(1)} MB`;
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(repo);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group",
        isDeleting && "opacity-50 pointer-events-none"
      )}
      onClick={() => onView(repo)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {repo.name}
          </h3>
          {repo.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{repo.description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {repo.isOwner === false && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
              Contributor
            </span>
          )}
          {repo.private && (
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
              Private
            </span>
          )}
          {repo.fork && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
              Fork
            </span>
          )}
          {repo.archived && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
              Archived
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
        {repo.language && (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>{repo.language}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4" />
          <span>{repo.stargazers_count}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <GitBranch className="w-4 h-4" />
          <span>{repo.forks_count}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Eye className="w-4 h-4" />
          <span>{repo.open_issues_count}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span>{formatSize(repo.size)}</span>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>Updated {formatDate(repo.updated_at)}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(repo.html_url, '_blank');
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            title="View on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          
          {repo.isOwner !== false && (
            <button
              onClick={handleDeleteClick}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
              title="Delete repository"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to delete <strong>{repo.name}</strong>?
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
