'use client';

import { useState, useMemo } from 'react';
import { GitHubRepository } from '@/lib/github';
import RepositoryCard from './RepositoryCard';
import { Search, SortAsc, SortDesc } from 'lucide-react';

interface RepositoryListProps {
  repositories: GitHubRepository[];
  onViewRepository: (repo: GitHubRepository) => void;
  onDeleteRepository: (repo: GitHubRepository) => void;
  deletingRepoId?: number;
}

type SortField = 'name' | 'updated_at' | 'stargazers_count' | 'forks_count' | 'size';
type SortDirection = 'asc' | 'desc';

export default function RepositoryList({ 
  repositories, 
  onViewRepository, 
  onDeleteRepository,
  deletingRepoId 
}: RepositoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'contributed'>('all');
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Get unique languages for filter
  const languages = useMemo(() => {
    const uniqueLanguages = Array.from(
      new Set(repositories.map(repo => repo.language).filter(Boolean))
    );
    return uniqueLanguages.sort();
  }, [repositories]);

  // Filter and sort repositories
  const filteredAndSortedRepos = useMemo(() => {
    const filtered = repositories.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLanguage = !languageFilter || repo.language === languageFilter;
      const matchesOwnership = ownershipFilter === 'all' || 
                              (ownershipFilter === 'owned' && repo.isOwner !== false) ||
                              (ownershipFilter === 'contributed' && repo.isOwner === false);
      return matchesSearch && matchesLanguage && matchesOwnership;
    });

    // Sort repositories
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'stargazers_count':
          aValue = a.stargazers_count;
          bValue = b.stargazers_count;
          break;
        case 'forks_count':
          aValue = a.forks_count;
          bValue = b.forks_count;
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [repositories, searchTerm, languageFilter, ownershipFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Language Filter */}
          <div className="md:w-48">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Languages</option>
              {languages.map(language => (
                <option key={language} value={language!}>
                  {language}
                </option>
              ))}
            </select>
          </div>

          {/* Ownership Filter */}
          <div className="md:w-48">
            <select
              value={ownershipFilter}
              onChange={(e) => setOwnershipFilter(e.target.value as 'all' | 'owned' | 'contributed')}
              className="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
            >
              <option value="all">All Repositories</option>
              <option value="owned">Owned</option>
              <option value="contributed">Contributed</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Sort by:</span>
          {[
            { field: 'name' as SortField, label: 'Name' },
            { field: 'updated_at' as SortField, label: 'Updated' },
            { field: 'stargazers_count' as SortField, label: 'Stars' },
            { field: 'forks_count' as SortField, label: 'Forks' },
            { field: 'size' as SortField, label: 'Size' },
          ].map(({ field, label }) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-full transition-colors ${
                sortField === field
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>{label}</span>
              {sortField === field && (
                sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Repository Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredAndSortedRepos.length} of {repositories.length} repositories
      </div>

      {/* Repository Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedRepos.map((repo) => (
          <RepositoryCard
            key={repo.id}
            repo={repo}
            onView={onViewRepository}
            onDelete={onDeleteRepository}
            isDeleting={deletingRepoId === repo.id}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedRepos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No repositories found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || languageFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'No repositories available.'}
          </p>
        </div>
      )}
    </div>
  );
}
