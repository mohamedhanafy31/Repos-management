import { GitHubUser } from '@/lib/github';
import { Calendar, Users, GitBranch } from 'lucide-react';
import Image from 'next/image';

interface ProfileCardProps {
  user: GitHubUser;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
        {/* Avatar */}
        <Image
          src={user.avatar_url}
          alt={`${user.login}'s avatar`}
          width={96}
          height={96}
          className="rounded-full border-4 border-gray-200 dark:border-gray-600"
        />
        
        {/* Profile Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name || user.login}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">@{user.login}</p>
          
          {user.bio && (
            <p className="text-gray-700 dark:text-gray-300 mt-2">{user.bio}</p>
          )}
          
          {user.email && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
          )}
          
          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <GitBranch className="w-4 h-4" />
              <span className="text-sm font-medium">{user.public_repos} repositories</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{user.followers} followers</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{user.following} following</span>
            </div>
          </div>
          
          {/* Join Date */}
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mt-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Joined {formatDate(user.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
