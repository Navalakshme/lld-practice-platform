import { IAttemptRepository, IProblemRepository } from '../repositories';
import { IEvaluator } from '../evaluator';
import { Attempt, EvaluationResult } from '../domain';

export interface EvaluateAttemptOptions {
  simulateFailure?: boolean;
  failureReason?: string;
  artificialDelayMs?: number;
}

export class EvaluationService {
  constructor(
    private attemptRepo: IAttemptRepository,
    private problemRepo: IProblemRepository,
    private evaluator: IEvaluator
  ) {}

  async evaluateAttempt(
    attemptId: string, 
    options: EvaluateAttemptOptions = {}
  ): Promise<Attempt> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt not found: ${attemptId}`);
    }

    const problem = await this.problemRepo.findById(attempt.problemId);
    if (!problem) {
      throw new Error(`Problem not found: ${attempt.problemId}`);
    }

    // Move to SUBMITTED if currently DRAFT
    if (attempt.status === 'DRAFT') {
      attempt.markSubmitted();
    }

    // Transition state machine: SUBMITTED -> EVALUATING
    attempt.startEvaluation();
    await this.attemptRepo.save(attempt);

    try {
      // Optional artificial delay to simulate realistic background/LLM reasoning
      if (options.artificialDelayMs && options.artificialDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, options.artificialDelayMs));
      }

      // Optional failure simulation to test resilience & retry loop
      if (options.simulateFailure) {
        throw new Error(options.failureReason || 'Evaluation engine timeout or rate limit exceeded.');
      }

      // Execute evaluation pipeline
      const result: EvaluationResult = await this.evaluator.evaluate(
        problem,
        attempt.submission
      );

      // Transition state machine: EVALUATING -> EVALUATED
      attempt.completeEvaluation(result);
      await this.attemptRepo.save(attempt);
      return attempt;
    } catch (err: any) {
      // Transition state machine: EVALUATING -> FAILED
      attempt.failEvaluation(err.message || 'Unknown evaluation failure occurred.');
      await this.attemptRepo.save(attempt);
      return attempt;
    }
  }
}
