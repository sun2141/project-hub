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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            🚀 Project Hub
          </h1>
          <p className="text-xl text-gray-600">
            모든 프로젝트를 한곳에서 관리하세요
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">
              전체 프로젝트
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {stats?.total || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">
              운영 중
            </div>
            <div className="text-4xl font-bold text-green-600">
              {stats?.byStatus.active || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">
              개발 중
            </div>
            <div className="text-4xl font-bold text-blue-600">
              {stats?.byStatus.development || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">
              보관됨
            </div>
            <div className="text-4xl font-bold text-gray-600">
              {stats?.byStatus.archived || 0}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">프로젝트</h2>
            <Link
              href="/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              + 새 프로젝트
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                프로젝트가 없습니다
              </h3>
              <p className="text-gray-600 mb-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="p-6">
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link
                          href={`/projects/${project.slug}`}
                          className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {project.name}
                        </Link>
                        <p className="text-gray-600 text-sm mt-1">
                          {project.description}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech_stack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        상세보기 →
                      </Link>

                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          GitHub
                        </a>
                      )}

                      {project.vercel_url && (
                        <a
                          href={project.vercel_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Live
                        </a>
                      )}

                      {project.local_path && (
                        <span className="text-sm text-gray-400">
                          📁 Local
                        </span>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              최근 활동
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {activity.project_name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {activity.details}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap ml-4">
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
