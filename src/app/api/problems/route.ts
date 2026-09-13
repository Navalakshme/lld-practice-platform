import { NextResponse } from 'next/server';
import { problemService } from '@/services';

export async function GET() {
  try {
    const problems = await problemService.getAllProblems();
    return NextResponse.json({ success: true, problems });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch problems' },
      { status: 500 }
    );
  }
}
