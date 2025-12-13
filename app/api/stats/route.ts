import { NextResponse } from 'next/server';
import { getProjectStats } from '@/lib/projects';

export async function GET() {
  try {
    const stats = await getProjectStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
