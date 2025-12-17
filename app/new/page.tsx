'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface GitHubRepo {
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

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'development' as 'active' | 'development' | 'maintenance' | 'archived',
    tech_stack: '',
    github_url: '',
    vercel_url: '',
    local_path: '',
  });

  const fetchGitHubRepos = async () => {
    setLoadingRepos(true);
    try {
      const response = await fetch('/api/github/repos');
      const data = await response.json();
      if (data.success) {
        setGithubRepos(data.data);
        setShowRepoSelector(true);
      } else {
        alert('GitHub 저장소를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching repos:', error);
      alert('GitHub 저장소를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingRepos(false);
    }
  };

  const selectRepo = (repo: GitHubRepo) => {
    const slug = repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const techStack = repo.language ? repo.language : '';

    setFormData({
      ...formData,
      name: repo.name,
      slug: slug,
      description: repo.description || '',
      tech_stack: techStack,
      github_url: repo.html_url,
    });

    setShowRepoSelector(false);
  };

  const filteredRepos = githubRepos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from name
    if (name === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Convert tech_stack string to array
      const techStackArray = formData.tech_stack
        .split(',')
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0);

      const payload = {
        ...formData,
        tech_stack: techStackArray,
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/projects/${formData.slug}`);
      } else {
        alert('프로젝트 생성에 실패했습니다: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('프로젝트 생성 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-4"
          >
            ← 프로젝트 목록으로
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                새 프로젝트 만들기
              </h1>
              <p className="text-base text-gray-400">
                GitHub 저장소에서 가져오거나 직접 입력하세요
              </p>
            </div>
            <button
              type="button"
              onClick={fetchGitHubRepos}
              disabled={loadingRepos}
              className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loadingRepos ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  불러오는 중...
                </>
              ) : (
                <>
                  🔗 GitHub에서 가져오기
                </>
              )}
            </button>
          </div>
        </div>

        {/* GitHub Repo Selector Modal */}
        {showRepoSelector && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-white">GitHub 저장소 선택</h2>
                  <button
                    onClick={() => setShowRepoSelector(false)}
                    className="text-gray-400 hover:text-white text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="저장소 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="overflow-y-auto flex-1 p-4">
                {filteredRepos.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    {searchQuery ? '검색 결과가 없습니다.' : '저장소가 없습니다.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredRepos.map((repo) => (
                      <button
                        key={repo.id}
                        type="button"
                        onClick={() => selectRepo(repo)}
                        className="w-full p-4 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 transition-colors text-left"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium mb-1">{repo.name}</div>
                            {repo.description && (
                              <p className="text-sm text-gray-400 line-clamp-2">
                                {repo.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              {repo.language && <span>{repo.language}</span>}
                              <span>⭐ {repo.stargazers_count}</span>
                              {repo.private && <span className="text-yellow-500">🔒 Private</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                프로젝트 이름 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="예: Health Blog Automation"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-white mb-2">
                슬러그 (URL) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono text-sm"
                placeholder="예: health-blog-automation"
              />
              <p className="mt-1 text-xs text-gray-400">
                영문 소문자, 숫자, 하이픈(-)만 사용 가능
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                설명 <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
                상태 <span className="text-red-400">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="development">🚧 개발 중</option>
                <option value="active">✅ 운영 중</option>
                <option value="maintenance">🔧 유지보수</option>
                <option value="archived">📦 보관됨</option>
              </select>
            </div>

            {/* Tech Stack */}
            <div>
              <label htmlFor="tech_stack" className="block text-sm font-medium text-white mb-2">
                기술 스택 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="tech_stack"
                name="tech_stack"
                required
                value={formData.tech_stack}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="예: Next.js, TypeScript, MySQL, Tailwind CSS"
              />
              <p className="mt-1 text-xs text-gray-400">
                쉼표(,)로 구분하여 입력하세요
              </p>
            </div>

            {/* GitHub URL */}
            <div>
              <label htmlFor="github_url" className="block text-sm font-medium text-white mb-2">
                GitHub URL
              </label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="https://github.com/username/repository"
              />
            </div>

            {/* Vercel URL */}
            <div>
              <label htmlFor="vercel_url" className="block text-sm font-medium text-white mb-2">
                Live URL (Vercel 등)
              </label>
              <input
                type="url"
                id="vercel_url"
                name="vercel_url"
                value={formData.vercel_url}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="https://your-project.vercel.app"
              />
            </div>

            {/* Local Path */}
            <div>
              <label htmlFor="local_path" className="block text-sm font-medium text-white mb-2">
                로컬 경로
              </label>
              <input
                type="text"
                id="local_path"
                name="local_path"
                value={formData.local_path}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono text-sm"
                placeholder="/Users/username/projects/my-project"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-800">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? '생성 중...' : '프로젝트 생성'}
            </button>

            <Link
              href="/"
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
