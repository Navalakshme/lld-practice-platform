import { NextResponse } from 'next/server';
import { evaluationService, attemptService } from '@/services';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is acceptable
    }

    const { submission, simulateFailure, failureReason, artificialDelayMs } = body;

    // If a new submission snapshot is provided in the evaluate call, update the draft first
    if (submission) {
      await attemptService.updateSubmission(params.id, submission);
    }

    const evaluatedAttempt = await evaluationService.evaluateAttempt(params.id, {
      simulateFailure,
      failureReason,
      artificialDelayMs: artificialDelayMs ?? 1000, // 1s realistic evaluation simulation
    });

    return NextResponse.json({
      success: true,
      attempt: evaluatedAttempt,
      status: evaluatedAttempt.status,
      evaluation: evaluatedAttempt.evaluation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Evaluation pipeline failed' },
      { status: 500 }
    );
  }
}
