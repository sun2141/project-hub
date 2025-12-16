-- Project Hub Database Schema (PostgreSQL)

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'development' CHECK (status IN ('active', 'archived', 'development', 'maintenance')),
  tech_stack JSONB,
  github_url VARCHAR(500),
  vercel_url VARCHAR(500),
  local_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- 프로젝트 파일 메타데이터 테이블
CREATE TABLE IF NOT EXISTS project_files (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  description TEXT,
  size_kb INTEGER,
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);

-- 활동 로그 테이블
CREATE TABLE IF NOT EXISTS project_logs (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_logs_project_id ON project_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_logs_created_at ON project_logs(created_at);

-- 초기 데이터: Health Blog Automation 프로젝트
INSERT INTO projects (name, slug, description, status, tech_stack, github_url, vercel_url, local_path)
VALUES (
  'Health Blog Automation',
  'health-blog-automation',
  '매일 자동으로 건강 트렌드를 분석하여 워드프레스 블로그에 포스팅하는 AI 자동화 시스템',
  'active',
  '["Next.js", "TypeScript", "Gemini AI", "WordPress", "Supabase", "Inngest"]'::jsonb,
  'https://github.com/sun2141/health-blog-automation',
  'https://health-blog-automation.vercel.app',
  '/Users/sun/health-blog-automation'
)
ON CONFLICT (slug) DO UPDATE
SET updated_at = CURRENT_TIMESTAMP;

-- 초기 로그
INSERT INTO project_logs (project_id, action, details)
SELECT id, 'project_created', 'Health Blog Automation 프로젝트가 프로젝트 허브에 등록되었습니다.'
FROM projects WHERE slug = 'health-blog-automation'
ON CONFLICT DO NOTHING;
