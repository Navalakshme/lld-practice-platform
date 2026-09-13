import { IEvaluator } from './IEvaluator';
import { DeterministicEvaluator } from './DeterministicEvaluator';
import { QualitativeEvaluator } from './QualitativeEvaluator';
import { Problem, Submission, EvaluationResult, DimensionScore } from '../domain';

export class HybridEvaluationPipeline implements IEvaluator {
  readonly name = 'HybridEvaluationPipeline';

  private deterministicEvaluator: DeterministicEvaluator;
  private qualitativeEvaluator: QualitativeEvaluator;

  constructor(
    deterministicEvaluator = new DeterministicEvaluator(),
    qualitativeEvaluator = new QualitativeEvaluator()
  ) {
    this.deterministicEvaluator = deterministicEvaluator;
    this.qualitativeEvaluator = qualitativeEvaluator;
  }

  async evaluate(problem: Problem, submission: Submission): Promise<EvaluationResult> {
    // 1. Run deterministic checks (structural sanity & requirement coverage)
    const deterministicResult = await this.deterministicEvaluator.evaluate(problem, submission);

    // 2. Run qualitative checks (SOLID principles, abstractions, trade-offs)
    const qualitativeResult = await this.qualitativeEvaluator.evaluate(problem, submission);

    // 3. Combine dimension scores with explicit rubric weighting
    const combinedDimensions: DimensionScore[] = [
      ...deterministicResult.dimensionScores.map((d) => ({
        ...d,
        weight: d.weight * 0.4, // 40% weight to deterministic checks
      })),
      ...qualitativeResult.dimensionScores.map((d) => ({
        ...d,
        weight: d.weight * 0.6, // 60% weight to qualitative design reasoning
      })),
    ];

    const totalWeight = combinedDimensions.reduce((acc, d) => acc + d.weight, 0);
    const weightedSum = combinedDimensions.reduce((acc, d) => acc + d.score * d.weight, 0);
    const overallScore = Math.round((weightedSum / (totalWeight || 1)) * 10) / 10;

    // Deduplicate strengths and issues
    const combinedStrengths = Array.from(
      new Set([...deterministicResult.strengths, ...qualitativeResult.strengths])
    );

    const combinedIssues = [...deterministicResult.issues, ...qualitativeResult.issues];

    return {
      overallScore,
      dimensionScores: combinedDimensions,
      requirementCoverage: deterministicResult.requirementCoverage,
      strengths: combinedStrengths,
      issues: combinedIssues,
      suggestions: qualitativeResult.suggestions,
      tradeOffs: qualitativeResult.tradeOffs,
      evaluatedAt: new Date().toISOString(),
      evaluatorType: 'HYBRID',
    };
  }
}
