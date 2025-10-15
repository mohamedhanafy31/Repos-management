import { Octokit } from '@octokit/rest';

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  private: boolean;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  isOwner?: boolean; // Added to distinguish between owned and contributed repositories
}

export interface GitHubApiError {
  message: string;
  status: number;
}

class GitHubApiClient {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async getUser(username: string): Promise<GitHubUser> {
    try {
      const { data } = await this.octokit.rest.users.getByUsername({
        username,
      });
      return data as GitHubUser;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch user: ${errorMessage}`);
    }
  }

  async getRepositories(username: string, page = 1, perPage = 30): Promise<GitHubRepository[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForUser({
        username,
        page,
        per_page: perPage,
        sort: 'updated',
        direction: 'desc',
      });
      return data as GitHubRepository[];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch repositories: ${errorMessage}`);
    }
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });
      return data as GitHubRepository;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch repository: ${errorMessage}`);
    }
  }

  async deleteRepository(owner: string, repo: string): Promise<void> {
    try {
      await this.octokit.rest.repos.delete({
        owner,
        repo,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete repository: ${errorMessage}`);
    }
  }

  async getContributedRepositories(page = 1, perPage = 30): Promise<GitHubRepository[]> {
    try {
      // Get all repositories the authenticated user has access to
      // Use the simplest possible call to avoid parameter issues
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        page,
        per_page: perPage,
        sort: 'updated',
        direction: 'desc',
      });
      return data as GitHubRepository[];
    } catch (error: unknown) {
      console.error('GitHub API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch contributed repositories: ${errorMessage}`);
    }
  }

  async getAllRepositories(username: string): Promise<GitHubRepository[]> {
    const allRepos: GitHubRepository[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const repos = await this.getRepositories(username, page, perPage);
      if (repos.length === 0) break;
      
      allRepos.push(...repos);
      page++;
    }

    return allRepos;
  }

  async getAllContributedRepositories(): Promise<GitHubRepository[]> {
    const allRepos: GitHubRepository[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const repos = await this.getContributedRepositories(page, perPage);
      if (repos.length === 0) break;
      
      allRepos.push(...repos);
      page++;
    }

    return allRepos;
  }

  async getAllUserRepositories(username: string): Promise<GitHubRepository[]> {
    try {
      // Get all repositories the user has access to (owned + contributed, public + private)
      const allRepos = await this.getAllContributedRepositories();
      
      console.log(`Total repositories fetched: ${allRepos.length}`);
      
      // Log repository types for debugging
      const ownedRepos = allRepos.filter(repo => 
        repo.full_name.split('/')[0].toLowerCase() === username.toLowerCase()
      );
      const contributedRepos = allRepos.filter(repo => 
        repo.full_name.split('/')[0].toLowerCase() !== username.toLowerCase()
      );
      const privateRepos = allRepos.filter(repo => repo.private);
      const ownedPrivateRepos = ownedRepos.filter(repo => repo.private);
      
      console.log(`Owned repositories: ${ownedRepos.length}`);
      console.log(`Contributed repositories: ${contributedRepos.length}`);
      console.log(`Private repositories: ${privateRepos.length}`);
      console.log(`Owned private repositories: ${ownedPrivateRepos.length}`);
      
      // Remove duplicates based on repository ID
      const uniqueRepos = allRepos.filter((repo, index, self) => 
        index === self.findIndex(r => r.id === repo.id)
      );
      
      console.log(`Unique repositories after deduplication: ${uniqueRepos.length}`);
      
      // Mark ownership based on the repository owner
      const reposWithOwnership = uniqueRepos.map(repo => ({
        ...repo,
        isOwner: repo.full_name.split('/')[0].toLowerCase() === username.toLowerCase()
      }));

      return reposWithOwnership;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch all user repositories: ${errorMessage}`);
    }
  }
}

export default GitHubApiClient;
