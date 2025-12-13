import { NextResponse } from 'next/server';
import { getAllProjects, createProject } from '@/lib/projects';

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectId = await createProject(body);
    return NextResponse.json({ success: true, id: projectId });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
