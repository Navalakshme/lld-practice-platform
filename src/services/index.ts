import { problemRepository, attemptRepository } from '../repositories';
import { HybridEvaluationPipeline } from '../evaluator';
import { ProblemService } from './ProblemService';
import { AttemptService } from './AttemptService';
import { EvaluationService } from './EvaluationService';

export * from './ProblemService';
export * from './AttemptService';
export * from './EvaluationService';

export const problemService = new ProblemService(problemRepository);
export const attemptService = new AttemptService(attemptRepository, problemRepository);
export const hybridPipeline = new HybridEvaluationPipeline();
export const evaluationService = new EvaluationService(
  attemptRepository, 
  problemRepository, 
  hybridPipeline
);
