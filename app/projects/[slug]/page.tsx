'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'archived' | 'development' | 'maintenance';
  tech_stack: string[];
  github_url?: string;
  vercel_url?: string;
  local_path?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectLog {
  id: number;
  project_id: number;
  action: string;
  details: string;
  created_at: string;
}

interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

interface GitHubRepo {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
}

interface GitHubData {
  repo: GitHubRepo | null;
  commits: GitHubCommit[];
  readme: {
    content: string;
    html: string;
  } | null;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReadme, setShowReadme] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [slug]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${slug}`);
      const data = await response.json();

      if (data.success) {
        setProject(data.data.project);
        setLogs(data.data.logs);

        // Fetch GitHub data if URL exists
        if (data.data.project.github_url) {
          fetchGitHubData();
        }
      } else {
        console.error('Failed to fetch project:', data.error);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGitHubData = async () => {
    setLoadingGithub(true);
    try {
      const response = await fetch(`/api/github/${slug}`);
      const data = await response.json();

      if (data.success) {
        setGithubData(data.data);
      }
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
    } finally {
      setLoadingGithub(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    const confirmed = window.confirm(
      `"${project.name}" 프로젝트를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/projects/${slug}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        router.push('/');
      } else {
        alert('프로젝트 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('프로젝트 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'development':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '✅ 운영 중';
      case 'development':
        return '🚧 개발 중';
      case 'maintenance':
        return '🔧 유지보수';
      case 'archived':
        return '📦 보관됨';
      default:
        return status;
    }
  };

  const openInVSCode = () => {
    if (!project?.github_url) return;
    const vscodeUrl = project.github_url.replace('github.com', 'github.dev');
    window.open(vscodeUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            프로젝트를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-6">
            요청하신 프로젝트가 존재하지 않거나 삭제되었습니다.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
          >
            ← 프로젝트 목록으로
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {project.name}
              </h1>
              <p className="text-lg text-gray-600">{project.description}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                project.status
              )}`}
            >
              {getStatusLabel(project.status)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Link
            href={`/projects/${project.slug}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            ✏️ 수정하기
          </Link>

          {project.github_url && (
            <>
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                🔗 GitHub 열기
              </a>

              <button
                onClick={openInVSCode}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                💻 VSCode로 열기
              </button>
            </>
          )}

          {project.vercel_url && (
            <a
              href={project.vercel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              🚀 Live 사이트
            </a>
          )}

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            {deleting ? '삭제 중...' : '🗑️ 삭제'}
          </button>
        </div>

        {/* GitHub Stats */}
        {project.github_url && githubData?.repo && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 GitHub 통계</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">⭐ {githubData.repo.stars}</div>
                <div className="text-sm text-gray-600">Stars</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">🍴 {githubData.repo.forks}</div>
                <div className="text-sm text-gray-600">Forks</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{githubData.repo.language}</div>
                <div className="text-sm text-gray-600">Language</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">
                  {new Date(githubData.repo.updatedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-sm text-gray-600">Last Updated</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Commits */}
        {project.github_url && githubData?.commits && githubData.commits.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📝 최근 커밋</h2>
            <div className="space-y-3">
              {githubData.commits.map((commit) => (
                <a
                  key={commit.sha}
                  href={commit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {commit.message}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {commit.author} • {new Date(commit.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <code className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {commit.sha}
                    </code>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* README Preview */}
        {project.github_url && githubData?.readme && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">📖 README</h2>
              <button
                onClick={() => setShowReadme(!showReadme)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showReadme ? '접기 ▲' : '펼치기 ▼'}
              </button>
            </div>
            {showReadme && (
              <div
                className="prose prose-sm max-w-none overflow-auto"
                dangerouslySetInnerHTML={{ __html: githubData.readme.html }}
              />
            )}
          </div>
        )}

        {/* Loading GitHub Data */}
        {project.github_url && loadingGithub && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-2"></div>
            <div className="text-sm text-gray-600">GitHub 정보 로딩 중...</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Info */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">프로젝트 정보</h2>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  기술 스택
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {project.local_path && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    로컬 경로
                  </div>
                  <code className="block bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700 border border-gray-200">
                    {project.local_path}
                  </code>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    생성일
                  </div>
                  <div className="text-sm text-gray-900">
                    {new Date(project.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    최종 수정
                  </div>
                  <div className="text-sm text-gray-900">
                    {new Date(project.updated_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 링크</h2>
            <div className="space-y-3">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>🔗</span>
                  <span>GitHub Repository</span>
                </a>
              )}

              {project.vercel_url && (
                <a
                  href={project.vercel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>🌐</span>
                  <span>Live Website</span>
                </a>
              )}

              {project.local_path && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <span>📁</span>
                  <span>로컬 프로젝트</span>
                </div>
              )}

              {!project.github_url && !project.vercel_url && !project.local_path && (
                <p className="text-sm text-gray-400">링크가 없습니다</p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">활동 로그</h2>

          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">활동 기록이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {log.action}
                    </div>
                    {log.details && (
                      <div className="text-sm text-gray-600 mt-1">
                        {log.details}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {new Date(log.created_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
