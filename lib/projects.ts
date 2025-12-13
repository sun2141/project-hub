import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'archived' | 'development' | 'maintenance';
  tech_stack: string[];
  github_url?: string;
  vercel_url?: string;
  local_path?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectFile {
  id: number;
  project_id: number;
  file_path: string;
  file_type: string;
  description?: string;
  size_kb?: number;
  last_modified: Date;
}

export interface ProjectLog {
  id: number;
  project_id: number;
  action: string;
  details?: string;
  created_at: Date;
}

// Get all projects
export async function getAllProjects(): Promise<Project[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM projects ORDER BY updated_at DESC'
  );

  return rows.map(row => ({
    ...row,
    tech_stack: JSON.parse(row.tech_stack || '[]'),
  })) as Project[];
}

// Get project by slug
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM projects WHERE slug = ?',
    [slug]
  );

  if (rows.length === 0) return null;

  return {
    ...rows[0],
    tech_stack: JSON.parse(rows[0].tech_stack || '[]'),
  } as Project;
}

// Create new project
export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO projects (name, slug, description, status, tech_stack, github_url, vercel_url, local_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      project.name,
      project.slug,
      project.description,
      project.status,
      JSON.stringify(project.tech_stack),
      project.github_url,
      project.vercel_url,
      project.local_path,
    ]
  );

  // Log the creation
  await addProjectLog(result.insertId, 'project_created', `${project.name} 프로젝트가 생성되었습니다.`);

  return result.insertId;
}

// Update project
export async function updateProject(id: number, updates: Partial<Project>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.description) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.tech_stack) {
    fields.push('tech_stack = ?');
    values.push(JSON.stringify(updates.tech_stack));
  }
  if (updates.github_url !== undefined) {
    fields.push('github_url = ?');
    values.push(updates.github_url);
  }
  if (updates.vercel_url !== undefined) {
    fields.push('vercel_url = ?');
    values.push(updates.vercel_url);
  }
  if (updates.local_path !== undefined) {
    fields.push('local_path = ?');
    values.push(updates.local_path);
  }

  if (fields.length === 0) return;

  values.push(id);

  await pool.query(
    `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  await addProjectLog(id, 'project_updated', '프로젝트 정보가 업데이트되었습니다.');
}

// Delete project
export async function deleteProject(id: number): Promise<void> {
  await pool.query('DELETE FROM projects WHERE id = ?', [id]);
}

// Get project statistics
export async function getProjectStats() {
  const [projects] = await pool.query<RowDataPacket[]>(
    'SELECT status, COUNT(*) as count FROM projects GROUP BY status'
  );

  const [total] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) as total FROM projects'
  );

  const [recentLogs] = await pool.query<RowDataPacket[]>(
    `SELECT pl.*, p.name as project_name
     FROM project_logs pl
     JOIN projects p ON pl.project_id = p.id
     ORDER BY pl.created_at DESC
     LIMIT 10`
  );

  return {
    total: total[0].total,
    byStatus: projects.reduce((acc: any, row: any) => {
      acc[row.status] = row.count;
      return acc;
    }, {}),
    recentActivity: recentLogs,
  };
}

// Add project log
export async function addProjectLog(projectId: number, action: string, details?: string): Promise<void> {
  await pool.query(
    'INSERT INTO project_logs (project_id, action, details) VALUES (?, ?, ?)',
    [projectId, action, details]
  );
}

// Get project logs
export async function getProjectLogs(projectId: number, limit: number = 50): Promise<ProjectLog[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM project_logs WHERE project_id = ? ORDER BY created_at DESC LIMIT ?',
    [projectId, limit]
  );

  return rows as ProjectLog[];
}
