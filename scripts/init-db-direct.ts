import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function initDatabase() {
  try {
    console.log('📦 Starting database initialization...');

    // Create projects table
    await sql`
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
      )
    `;
    console.log('✅ Created projects table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug)`;
    console.log('✅ Created indexes for projects');

    // Create project_files table
    await sql`
      CREATE TABLE IF NOT EXISTS project_files (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(50),
        description TEXT,
        size_kb INTEGER,
        last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ Created project_files table');

    await sql`CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id)`;

    // Create project_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS project_logs (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ Created project_logs table');

    await sql`CREATE INDEX IF NOT EXISTS idx_project_logs_project_id ON project_logs(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_project_logs_created_at ON project_logs(created_at)`;

    // Insert initial data
    await sql`
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
      SET updated_at = CURRENT_TIMESTAMP
    `;
    console.log('✅ Inserted initial project data');

    // Insert initial log
    const { rows } = await sql`SELECT id FROM projects WHERE slug = 'health-blog-automation'`;
    if (rows.length > 0) {
      await sql`
        INSERT INTO project_logs (project_id, action, details)
        VALUES (
          ${rows[0].id},
          'project_created',
          'Health Blog Automation 프로젝트가 프로젝트 허브에 등록되었습니다.'
        )
        ON CONFLICT DO NOTHING
      `;
      console.log('✅ Inserted initial log');
    }

    console.log('🎉 Database initialized successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
