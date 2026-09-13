import { IAttemptRepository, IProblemRepository } from '../repositories';
import { Attempt, Submission, SubmissionData } from '../domain';

export interface CreateAttemptInput {
  problemId: string;
  learnerId: string;
  initialSubmission?: Partial<SubmissionData>;
}

export class AttemptService {
  constructor(
    private attemptRepo: IAttemptRepository,
    private problemRepo: IProblemRepository
  ) {}

  async startAttempt(input: CreateAttemptInput): Promise<Attempt> {
    const problem = await this.problemRepo.findById(input.problemId);
    if (!problem) {
      throw new Error(`Problem not found: ${input.problemId}`);
    }

    const previousAttempts = await this.attemptRepo.findByProblemAndLearner(
      input.problemId,
      input.learnerId
    );
    const nextAttemptNumber = previousAttempts.length + 1;
    const attemptId = `att-${input.problemId}-${input.learnerId}-${nextAttemptNumber}-${Date.now()}`;

    const submission = new Submission(input.initialSubmission || {});
    const attempt = new Attempt({
      id: attemptId,
      problemId: input.problemId,
      learnerId: input.learnerId,
      attemptNumber: nextAttemptNumber,
      status: 'DRAFT',
      submission,
    });

    await this.attemptRepo.save(attempt);
    return attempt;
  }

  async getAttemptById(id: string): Promise<Attempt | null> {
    return this.attemptRepo.findById(id);
  }

  async getAttemptsForProblem(problemId: string, learnerId: string): Promise<Attempt[]> {
    return this.attemptRepo.findByProblemAndLearner(problemId, learnerId);
  }

  async getAllAttemptsByLearner(learnerId: string): Promise<Attempt[]> {
    return this.attemptRepo.findAllByLearner(learnerId);
  }

  async updateSubmission(attemptId: string, data: Partial<SubmissionData>): Promise<Attempt> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt not found: ${attemptId}`);
    }

    const newSubmission = new Submission(data);
    attempt.updateSubmission(newSubmission);
    await this.attemptRepo.save(attempt);
    return attempt;
  }

  async markSubmitted(attemptId: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt not found: ${attemptId}`);
    }

    attempt.markSubmitted();
    await this.attemptRepo.save(attempt);
    return attempt;
  }

  async retryAttempt(attemptId: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt not found: ${attemptId}`);
    }

    attempt.retry();
    await this.attemptRepo.save(attempt);
    return attempt;
  }
}
