import { NextResponse } from 'next/server';
import { getUserRepositories } from '@/lib/github';

export async function GET() {
  try {
    const repos = await getUserRepositories();

    return NextResponse.json({
      success: true,
      data: repos,
    });
  } catch (error: any) {
    console.error('Error fetching GitHub repositories:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
