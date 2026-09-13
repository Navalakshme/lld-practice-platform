import { Attempt } from '../domain';

export interface IAttemptRepository {
  save(attempt: Attempt): Promise<void>;
  findById(id: string): Promise<Attempt | null>;
  findByProblemAndLearner(problemId: string, learnerId: string): Promise<Attempt[]>;
  findAllByLearner(learnerId: string): Promise<Attempt[]>;
}
