import { IProblemRepository } from '../repositories';
import { Problem } from '../domain';

export class ProblemService {
  constructor(private problemRepo: IProblemRepository) {}

  async getAllProblems(): Promise<Problem[]> {
    return this.problemRepo.findAll();
  }

  async getProblemById(id: string): Promise<Problem | null> {
    return this.problemRepo.findById(id);
  }

  async getProblemBySlug(slug: string): Promise<Problem | null> {
    return this.problemRepo.findBySlug(slug);
  }
}
