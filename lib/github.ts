import { Octokit } from 'octokit';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export interface GitHubRepo {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
  defaultBranch: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface GitHubReadme {
  content: string;
  html: string;
}

// Extract owner and repo from GitHub URL
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;

    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
    };
  } catch {
    return null;
  }
}

// Get repository information
export async function getRepoInfo(githubUrl: string): Promise<GitHubRepo | null> {
  try {
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) return null;

    const { data } = await octokit.rest.repos.get({
      owner: parsed.owner,
      repo: parsed.repo,
    });

    return {
      name: data.name,
      description: data.description || '',
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language || 'Unknown',
      updatedAt: data.updated_at,
      defaultBranch: data.default_branch,
    };
  } catch (error) {
    console.error('Error fetching repo info:', error);
    return null;
  }
}

// Get recent commits
export async function getRecentCommits(
  githubUrl: string,
  count: number = 3
): Promise<GitHubCommit[]> {
  try {
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) return [];

    const { data } = await octokit.rest.repos.listCommits({
      owner: parsed.owner,
      repo: parsed.repo,
      per_page: count,
    });

    return data.map((commit) => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split('\n')[0], // First line only
      author: commit.commit.author?.name || 'Unknown',
      date: commit.commit.author?.date || '',
      url: commit.html_url,
    }));
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
}

// Get README content
export async function getReadme(githubUrl: string): Promise<GitHubReadme | null> {
  try {
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) return null;

    const { data } = await octokit.rest.repos.getReadme({
      owner: parsed.owner,
      repo: parsed.repo,
      mediaType: {
        format: 'html',
      },
    });

    // @ts-ignore - data is string when format is html
    return {
      content: Buffer.from(data.content, 'base64').toString('utf-8'),
      html: data as unknown as string,
    };
  } catch (error) {
    console.error('Error fetching README:', error);
    return null;
  }
}

// Get GitHub stats for a repository
export async function getGitHubStats(githubUrl: string) {
  const repo = await getRepoInfo(githubUrl);
  const commits = await getRecentCommits(githubUrl, 3);

  return {
    repo,
    commits,
  };
}

// Get user's GitHub repositories
export interface UserRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  private: boolean;
}

export async function getUserRepositories(): Promise<UserRepository[]> {
  try {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
      affiliation: 'owner',
    });

    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      updated_at: repo.updated_at || '',
      private: repo.private,
    }));
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    return [];
  }
}
