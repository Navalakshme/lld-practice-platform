import { IAttemptRepository } from './IAttemptRepository';
import { Attempt } from '../domain';

export class InMemoryAttemptRepository implements IAttemptRepository {
  private attempts: Map<string, Attempt> = new Map();

  async save(attempt: Attempt): Promise<void> {
    this.attempts.set(attempt.id, attempt);
  }

  async findById(id: string): Promise<Attempt | null> {
    return this.attempts.get(id) || null;
  }

  async findByProblemAndLearner(problemId: string, learnerId: string): Promise<Attempt[]> {
    const list: Attempt[] = [];
    const all = Array.from(this.attempts.values());
    for (const a of all) {
      if (a.problemId === problemId && a.learnerId === learnerId) {
        list.push(a);
      }
    }
    return list.sort((a, b) => a.attemptNumber - b.attemptNumber);
  }

  async findAllByLearner(learnerId: string): Promise<Attempt[]> {
    const list: Attempt[] = [];
    const all = Array.from(this.attempts.values());
    for (const a of all) {
      if (a.learnerId === learnerId) {
        list.push(a);
      }
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

// Global singleton instance for server state across API routes
export const attemptRepository = new InMemoryAttemptRepository();
