import { NextResponse } from 'next/server';
import { getProjectBySlug } from '@/lib/projects';
import { getGitHubStats, getReadme } from '@/lib/github';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.github_url) {
      return NextResponse.json(
        { success: false, error: 'No GitHub URL found for this project' },
        { status: 400 }
      );
    }

    const stats = await getGitHubStats(project.github_url);
    const readme = await getReadme(project.github_url);

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        readme,
      },
    });
  } catch (error: any) {
    console.error('Error fetching GitHub data:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
