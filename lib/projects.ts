import { sql } from './db';

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
  const { rows } = await sql`SELECT * FROM projects ORDER BY updated_at DESC`;
  return rows as Project[];
}

// Get project by slug
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { rows } = await sql`SELECT * FROM projects WHERE slug = ${slug}`;

  if (rows.length === 0) return null;

  return rows[0] as Project;
}

// Create new project
export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const { rows } = await sql`
    INSERT INTO projects (name, slug, description, status, tech_stack, github_url, vercel_url, local_path)
    VALUES (
      ${project.name},
      ${project.slug},
      ${project.description},
      ${project.status},
      ${JSON.stringify(project.tech_stack)}::jsonb,
      ${project.github_url || null},
      ${project.vercel_url || null},
      ${project.local_path || null}
    )
    RETURNING id
  `;

  const projectId = rows[0].id;

  // Log the creation
  await addProjectLog(projectId, 'project_created', `${project.name} 프로젝트가 생성되었습니다.`);

  return projectId;
}

// Update project
export async function updateProject(id: number, updates: Partial<Project>): Promise<void> {
  const fields: string[] = [];
  const params: any = { id };

  if (updates.name !== undefined) {
    fields.push('name = ' + `'${updates.name}'`);
  }
  if (updates.description !== undefined) {
    fields.push('description = ' + `'${updates.description}'`);
  }
  if (updates.status !== undefined) {
    fields.push('status = ' + `'${updates.status}'`);
  }
  if (updates.tech_stack !== undefined) {
    fields.push('tech_stack = ' + `'${JSON.stringify(updates.tech_stack)}'::jsonb`);
  }
  if (updates.github_url !== undefined) {
    fields.push('github_url = ' + (updates.github_url ? `'${updates.github_url}'` : 'NULL'));
  }
  if (updates.vercel_url !== undefined) {
    fields.push('vercel_url = ' + (updates.vercel_url ? `'${updates.vercel_url}'` : 'NULL'));
  }
  if (updates.local_path !== undefined) {
    fields.push('local_path = ' + (updates.local_path ? `'${updates.local_path}'` : 'NULL'));
  }

  if (fields.length === 0) return;

  await sql.query(`UPDATE projects SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`);

  await addProjectLog(id, 'project_updated', '프로젝트 정보가 업데이트되었습니다.');
}

// Delete project
export async function deleteProject(id: number): Promise<void> {
  await sql`DELETE FROM projects WHERE id = ${id}`;
}

// Get project statistics
export async function getProjectStats() {
  const { rows: projects } = await sql`
    SELECT status, COUNT(*) as count FROM projects GROUP BY status
  `;

  const { rows: total } = await sql`
    SELECT COUNT(*) as total FROM projects
  `;

  const { rows: recentLogs } = await sql`
    SELECT pl.*, p.name as project_name
    FROM project_logs pl
    JOIN projects p ON pl.project_id = p.id
    ORDER BY pl.created_at DESC
    LIMIT 10
  `;

  return {
    total: Number(total[0]?.total || 0),
    byStatus: projects.reduce((acc: any, row: any) => {
      acc[row.status] = Number(row.count);
      return acc;
    }, {}),
    recentActivity: recentLogs,
  };
}

// Add project log
export async function addProjectLog(projectId: number, action: string, details?: string): Promise<void> {
  await sql`
    INSERT INTO project_logs (project_id, action, details)
    VALUES (${projectId}, ${action}, ${details || null})
  `;
}

// Get project logs
export async function getProjectLogs(projectId: number, limit: number = 50): Promise<ProjectLog[]> {
  const { rows } = await sql`
    SELECT * FROM project_logs
    WHERE project_id = ${projectId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return rows as ProjectLog[];
}
