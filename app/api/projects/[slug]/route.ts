import { NextResponse } from 'next/server';
import { getProjectBySlug, updateProject, deleteProject, getProjectLogs } from '@/lib/projects';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const project = await getProjectBySlug(params.slug);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const logs = await getProjectLogs(project.id);

    return NextResponse.json({
      success: true,
      data: { project, logs }
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const project = await getProjectBySlug(params.slug);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const updates = await request.json();
    await updateProject(project.id, updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const project = await getProjectBySlug(params.slug);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    await deleteProject(project.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
