-- Project Hub Database Schema
-- Run this in Cafe24 MySQL after creating the database

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  status ENUM('active', 'archived', 'development', 'maintenance') DEFAULT 'development',
  tech_stack JSON,
  github_url VARCHAR(500),
  vercel_url VARCHAR(500),
  local_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 프로젝트 파일 메타데이터 테이블
CREATE TABLE IF NOT EXISTS project_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  description TEXT,
  size_kb INT,
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 활동 로그 테이블
CREATE TABLE IF NOT EXISTS project_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 초기 데이터: Health Blog Automation 프로젝트
INSERT INTO projects (name, slug, description, status, tech_stack, github_url, vercel_url, local_path)
VALUES (
  'Health Blog Automation',
  'health-blog-automation',
  '매일 자동으로 건강 트렌드를 분석하여 워드프레스 블로그에 포스팅하는 AI 자동화 시스템',
  'active',
  JSON_ARRAY('Next.js', 'TypeScript', 'Gemini AI', 'WordPress', 'Supabase', 'Inngest'),
  'https://github.com/sun2141/health-blog-automation',
  'https://health-blog-automation.vercel.app',
  '/Users/sun/health-blog-automation'
) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 초기 로그
INSERT INTO project_logs (project_id, action, details)
SELECT id, 'project_created', 'Health Blog Automation 프로젝트가 프로젝트 허브에 등록되었습니다.'
FROM projects WHERE slug = 'health-blog-automation';
