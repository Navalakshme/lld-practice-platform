import { Problem, Submission, EvaluationResult } from '../domain';

export interface IEvaluator {
  readonly name: string;
  evaluate(problem: Problem, submission: Submission): Promise<EvaluationResult>;
}
