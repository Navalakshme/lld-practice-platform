import { NextResponse } from 'next/server';
import { problemService } from '@/services';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    let problem = await problemService.getProblemById(params.id);
    if (!problem) {
      problem = await problemService.getProblemBySlug(params.id);
    }

    if (!problem) {
      return NextResponse.json(
        { success: false, error: 'Problem not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, problem });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch problem' },
      { status: 500 }
    );
  }
}
