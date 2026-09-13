import { IProblemRepository } from './IProblemRepository';
import { Problem } from '../domain';
import { SEED_PROBLEMS } from '../data/seedProblems';

export class InMemoryProblemRepository implements IProblemRepository {
  private problems: Map<string, Problem> = new Map();

  constructor(seed = SEED_PROBLEMS) {
    seed.forEach((p) => {
      const problem = new Problem(p);
      this.problems.set(problem.id, problem);
    });
  }

  async findAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }

  async findById(id: string): Promise<Problem | null> {
    return this.problems.get(id) || null;
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    for (const p of this.problems.values()) {
      if (p.slug === slug) return p;
    }
    return null;
  }
}

// Global singleton instance for in-memory server state
export const problemRepository = new InMemoryProblemRepository();
