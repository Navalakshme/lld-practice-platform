import { describe, it, expect } from 'vitest';
import { InMemoryAttemptRepository, InMemoryProblemRepository } from '../src/repositories';
import { HybridEvaluationPipeline } from '../src/evaluator';
import { AttemptService, EvaluationService } from '../src/services';
import { SEED_PROBLEMS } from '../src/data/seedProblems';

describe('Resilience & Failure Recovery', () => {
  const problemRepo = new InMemoryProblemRepository(SEED_PROBLEMS);
  const attemptRepo = new InMemoryAttemptRepository();
  const evaluator = new HybridEvaluationPipeline();
  const attemptService = new AttemptService(attemptRepo, problemRepo);
  const evaluationService = new EvaluationService(attemptRepo, problemRepo, evaluator);

  it('should transition to FAILED on simulated engine failure and recover via retry', async () => {
    // 1. Start a new attempt
    const attempt = await attemptService.startAttempt({
      problemId: 'prob-1',
      learnerId: 'test-learner',
      initialSubmission: {
        classes: [
          {
            id: 'c1',
            name: 'ParkingLot',
            type: 'CLASS',
            responsibilities: ['Entry and exit'],
            attributes: [],
            methods: [],
          },
        ],
      },
    });

    expect(attempt.status).toBe('DRAFT');

    // 2. Evaluate with simulated failure
    const failedAttempt = await evaluationService.evaluateAttempt(attempt.id, {
      simulateFailure: true,
      failureReason: 'AI Evaluator rate limit exceeded (HTTP 429)',
      artificialDelayMs: 5,
    });

    expect(failedAttempt.status).toBe('FAILED');
    expect(failedAttempt.failureReason).toBe('AI Evaluator rate limit exceeded (HTTP 429)');
    expect(failedAttempt.evaluation).toBeUndefined();

    // 3. Retry the attempt
    const retriedAttempt = await attemptService.retryAttempt(attempt.id);
    expect(retriedAttempt.status).toBe('SUBMITTED');
    expect(retriedAttempt.failureReason).toBeUndefined();

    // 4. Re-evaluate successfully
    const recoveredAttempt = await evaluationService.evaluateAttempt(attempt.id, {
      simulateFailure: false,
      artificialDelayMs: 5,
    });

    expect(recoveredAttempt.status).toBe('EVALUATED');
    expect(recoveredAttempt.evaluation).toBeDefined();
    expect(recoveredAttempt.evaluation?.overallScore).toBeGreaterThan(0);
  });

  it('should gracefully handle malformed submissions without server crashes', async () => {
    const attempt = await attemptService.startAttempt({
      problemId: 'prob-2',
      learnerId: 'test-learner-2',
      initialSubmission: {
        classes: undefined as any,
        interfaces: undefined as any,
        relationships: undefined as any,
      },
    });

    const evaluatedAttempt = await evaluationService.evaluateAttempt(attempt.id, {
      artificialDelayMs: 5,
    });

    expect(evaluatedAttempt.status).toBe('EVALUATED');
    expect(evaluatedAttempt.evaluation?.issues.length).toBeGreaterThan(0);
  });
});
