'use client';

import { useEffect, useState } from 'react';
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
  updated_at: string;
}

interface Stats {
  total: number;
  byStatus: {
    active?: number;
    development?: number;
    archived?: number;
    maintenance?: number;
  };
  recentActivity: Array<{
    id: number;
    project_name: string;
    action: string;
    details: string;
    created_at: string;
  }>;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, statsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/stats'),
      ]);

      const projectsData = await projectsRes.json();
      const statsData = await statsRes.json();

      if (projectsData.success) {
        setProjects(projectsData.data);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'development':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'archived':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const openInEditor = (path: string, editor: 'claude' | 'cursor' | 'vscode') => {
    const urls = {
      claude: `claude-code://open?path=${encodeURIComponent(path)}`,
      cursor: `cursor://file/${path}`,
      vscode: `vscode://file/${path}`,
    };
    window.location.href = urls[editor];
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
          <div className="text-lg text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🚀 Project Hub
          </h1>
          <p className="text-base text-gray-400">
            모든 프로젝트를 한곳에서 관리하세요
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-xs font-medium text-gray-400 mb-1">
              전체 프로젝트
            </div>
            <div className="text-2xl font-bold text-white">
              {stats?.total || 0}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-xs font-medium text-gray-400 mb-1">
              운영 중
            </div>
            <div className="text-2xl font-bold text-green-400">
              {stats?.byStatus.active || 0}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-xs font-medium text-gray-400 mb-1">
              개발 중
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {stats?.byStatus.development || 0}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-xs font-medium text-gray-400 mb-1">
              보관됨
            </div>
            <div className="text-2xl font-bold text-gray-400">
              {stats?.byStatus.archived || 0}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">프로젝트</h2>
            <Link
              href="/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + 새 프로젝트
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-12 text-center border border-gray-800">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                프로젝트가 없습니다
              </h3>
              <p className="text-gray-400 mb-6">
                첫 번째 프로젝트를 추가하여 시작하세요
              </p>
              <Link
                href="/new"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                프로젝트 추가하기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800 hover:border-gray-700"
                >
                  <div className="p-4">
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/projects/${project.slug}`}
                          className="text-base font-bold text-white hover:text-blue-400 transition-colors block truncate"
                        >
                          {project.name}
                        </Link>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium border flex-shrink-0 ml-2 ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {getStatusLabel(project.status).split(' ')[0]}
                      </span>
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.tech_stack.slice(0, 4).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.tech_stack.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                          +{project.tech_stack.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        상세 →
                      </Link>

                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          GitHub
                        </a>
                      )}

                      {project.vercel_url && (
                        <a
                          href={project.vercel_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          Live
                        </a>
                      )}

                      {project.local_path && (
                        <>
                          <button
                            onClick={() => openInEditor(project.local_path!, 'claude')}
                            className="text-xs font-medium text-gray-400 hover:text-purple-400 transition-colors"
                            title="Open in Claude Code"
                          >
                            Claude
                          </button>
                          <button
                            onClick={() => openInEditor(project.local_path!, 'cursor')}
                            className="text-xs font-medium text-gray-400 hover:text-blue-400 transition-colors"
                            title="Open in Cursor"
                          >
                            Cursor
                          </button>
                          <button
                            onClick={() => openInEditor(project.local_path!, 'vscode')}
                            className="text-xs font-medium text-gray-400 hover:text-blue-400 transition-colors"
                            title="Open in VSCode"
                          >
                            VSCode
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {stats && stats.recentActivity.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              최근 활동
            </h2>
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className="divide-y divide-gray-800">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 hover:bg-gray-800 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-white text-sm">
                          {activity.project_name}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {activity.details}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {new Date(activity.created_at).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
