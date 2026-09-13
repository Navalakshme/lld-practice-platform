import { Problem } from '../domain';

export interface IProblemRepository {
  findAll(): Promise<Problem[]>;
  findById(id: string): Promise<Problem | null>;
  findBySlug(slug: string): Promise<Problem | null>;
}
