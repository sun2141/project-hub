'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
          >
            ← 프로젝트 목록으로
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            새 프로젝트 만들기
          </h1>
          <p className="text-lg text-gray-600">
            프로젝트 정보를 입력하여 새로운 프로젝트를 추가하세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                프로젝트 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="예: Health Blog Automation"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-900 mb-2">
                슬러그 (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono text-sm"
                placeholder="예: health-blog-automation"
              />
              <p className="mt-1 text-sm text-gray-500">
                영문 소문자, 숫자, 하이픈(-)만 사용 가능
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">
                상태 <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="development">🚧 개발 중</option>
                <option value="active">✅ 운영 중</option>
                <option value="maintenance">🔧 유지보수</option>
                <option value="archived">📦 보관됨</option>
              </select>
            </div>

            {/* Tech Stack */}
            <div>
              <label htmlFor="tech_stack" className="block text-sm font-medium text-gray-900 mb-2">
                기술 스택 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="tech_stack"
                name="tech_stack"
                required
                value={formData.tech_stack}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="예: Next.js, TypeScript, MySQL, Tailwind CSS"
              />
              <p className="mt-1 text-sm text-gray-500">
                쉼표(,)로 구분하여 입력하세요
              </p>
            </div>

            {/* GitHub URL */}
            <div>
              <label htmlFor="github_url" className="block text-sm font-medium text-gray-900 mb-2">
                GitHub URL
              </label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="https://github.com/username/repository"
              />
            </div>

            {/* Vercel URL */}
            <div>
              <label htmlFor="vercel_url" className="block text-sm font-medium text-gray-900 mb-2">
                Live URL (Vercel 등)
              </label>
              <input
                type="url"
                id="vercel_url"
                name="vercel_url"
                value={formData.vercel_url}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="https://your-project.vercel.app"
              />
            </div>

            {/* Local Path */}
            <div>
              <label htmlFor="local_path" className="block text-sm font-medium text-gray-900 mb-2">
                로컬 경로
              </label>
              <input
                type="text"
                id="local_path"
                name="local_path"
                value={formData.local_path}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono text-sm"
                placeholder="/Users/username/projects/my-project"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              {saving ? '생성 중...' : '프로젝트 생성'}
            </button>

            <Link
              href="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
