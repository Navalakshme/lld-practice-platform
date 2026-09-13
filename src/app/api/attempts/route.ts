import { NextResponse } from 'next/server';
import { attemptService } from '@/services';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');
    const learnerId = searchParams.get('learnerId') || 'learner-default';

    let attempts;
    if (problemId) {
      attempts = await attemptService.getAttemptsForProblem(problemId, learnerId);
    } else {
      attempts = await attemptService.getAllAttemptsByLearner(learnerId);
    }

    return NextResponse.json({ success: true, attempts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch attempts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { problemId, learnerId = 'learner-default', initialSubmission } = body;

    if (!problemId) {
      return NextResponse.json(
        { success: false, error: 'problemId is required' },
        { status: 400 }
      );
    }

    const attempt = await attemptService.startAttempt({
      problemId,
      learnerId,
      initialSubmission,
    });

    return NextResponse.json({ success: true, attempt }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create attempt' },
      { status: 500 }
    );
  }
}
