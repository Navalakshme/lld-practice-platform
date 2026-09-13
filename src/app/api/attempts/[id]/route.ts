import { NextResponse } from 'next/server';
import { attemptService } from '@/services';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attempt = await attemptService.getAttemptById(params.id);
    if (!attempt) {
      return NextResponse.json(
        { success: false, error: 'Attempt not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, attempt });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch attempt' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { submission } = body;

    const attempt = await attemptService.updateSubmission(params.id, submission);
    return NextResponse.json({ success: true, attempt });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update submission' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    if (body.action === 'retry') {
      const attempt = await attemptService.retryAttempt(params.id);
      return NextResponse.json({ success: true, attempt });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported action' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to perform action' },
      { status: 500 }
    );
  }
}
