import { IEvaluator } from './IEvaluator';
import { 
  Problem, 
  Submission, 
  EvaluationResult, 
  RequirementCoverageResult, 
  FeedbackIssue, 
  DimensionScore 
} from '../domain';

export class DeterministicEvaluator implements IEvaluator {
  readonly name = 'DeterministicEvaluator';

  async evaluate(problem: Problem, submission: Submission): Promise<EvaluationResult> {
    const issues: FeedbackIssue[] = [];
    const strengths: string[] = [];

    const declaredTypes = submission.getAllTypeNames();
    const allClasses = submission.classes;
    const allInterfaces = submission.interfaces;
    const allRelationships = submission.relationships;

    // 1. Structural Completeness Checks
    if (!submission.hasValidStructure()) {
      issues.push({
        severity: 'HIGH',
        title: 'Empty Submission Structure',
        description: 'No classes or interfaces were defined. An LLD solution requires concrete or abstract domain components.',
      });
    }

    // Check for empty classes
    for (const cls of allClasses) {
      const hasAttributes = cls.attributes && cls.attributes.length > 0;
      const hasMethods = cls.methods && cls.methods.length > 0;
      const hasResponsibilities = cls.responsibilities && cls.responsibilities.length > 0;

      if (!hasAttributes && !hasMethods && !hasResponsibilities) {
        issues.push({
          severity: 'MEDIUM',
          title: `Incomplete Class Definition: ${cls.name}`,
          description: `Class "${cls.name}" has no attributes, methods, or stated responsibilities.`,
          affectedElements: [cls.name],
        });
      }
    }

    // Check for dangling relationship targets or sources
    for (const rel of allRelationships) {
      const srcExists = declaredTypes.has(rel.source.trim().toLowerCase());
      const tgtExists = declaredTypes.has(rel.target.trim().toLowerCase());

      if (!srcExists || !tgtExists) {
        issues.push({
          severity: 'MEDIUM',
          title: `Dangling Relationship Reference: ${rel.source} -> ${rel.target}`,
          description: `Relationship connects "${rel.source}" to "${rel.target}", but one or both are not declared in the classes/interfaces list.`,
          affectedElements: [!srcExists ? rel.source : rel.target],
        });
      }
    }

    // Detect God Class / Fat Class
    for (const cls of allClasses) {
      const totalResponsibilities = (cls.responsibilities?.length || 0) + (cls.methods?.length || 0);
      if (totalResponsibilities >= 7 && allClasses.length <= 2) {
        issues.push({
          severity: 'HIGH',
          title: `Potential God Class: ${cls.name}`,
          description: `"${cls.name}" concentrates too many operations and responsibilities (${totalResponsibilities}) while the rest of the domain remains under-decomposed.`,
          violatesPrinciple: 'SRP',
          affectedElements: [cls.name],
        });
      }
    }

    // 2. Requirement Coverage Analysis
    const requirementCoverage: RequirementCoverageResult[] = [];
    const searchableText = [
      ...allClasses.map((c) => `${c.name} ${c.responsibilities.join(' ')} ${c.methods.map((m) => m.name).join(' ')} ${c.attributes.map((a) => a.name).join(' ')}`),
      ...allInterfaces.map((i) => `${i.name} ${i.purpose} ${i.methods.map((m) => m.name).join(' ')}`),
      ...allRelationships.map((r) => `${r.source} ${r.type} ${r.target} ${r.description || ''}`),
      submission.explanation,
      submission.codeSnippet || '',
    ].join(' ').toLowerCase();

    let coveredCount = 0;

    for (const req of problem.requirements) {
      const matchedKeywords: string[] = [];
      for (const kw of req.keywords) {
        if (searchableText.includes(kw.toLowerCase())) {
          matchedKeywords.push(kw);
        }
      }

      const isCovered = matchedKeywords.length > 0;
      if (isCovered) {
        coveredCount++;
      }

      requirementCoverage.push({
        requirementId: req.id,
        code: req.code,
        covered: isCovered,
        matchedElements: matchedKeywords,
        notes: isCovered
          ? `Addressed via concepts: ${matchedKeywords.join(', ')}`
          : `Requirement [${req.code}] not clearly reflected in domain entities, methods, or explanation.`,
      });

      if (!isCovered && req.criticality === 'CRITICAL') {
        issues.push({
          severity: 'HIGH',
          title: `Critical Requirement Unmet: ${req.code}`,
          description: `Requirement "${req.description}" was not detected in classes, methods, or design rationale.`,
        });
      }
    }

    // Strengths
    if (coveredCount === problem.requirements.length && problem.requirements.length > 0) {
      strengths.push('Complete coverage: All problem requirements are explicitly represented in the model.');
    } else if (coveredCount >= Math.ceil(problem.requirements.length * 0.75)) {
      strengths.push(`Strong requirement coverage (${coveredCount}/${problem.requirements.length} requirements addressed).`);
    }

    if (allInterfaces.length > 0) {
      strengths.push(`Good abstraction foundation: ${allInterfaces.length} interface(s) declared for polymorphic behavior.`);
    }

    if (allRelationships.length >= 2) {
      strengths.push(`Domain topology defined: ${allRelationships.length} relationships model interaction between components.`);
    }

    // Score calculations
    const coverageRatio = problem.requirements.length > 0 ? coveredCount / problem.requirements.length : 0;
    const reqCoverageScore = Math.min(10, Math.round(coverageRatio * 100) / 10);

    const structuralPenalty = issues.filter((i) => i.severity === 'HIGH').length * 2.5 +
                              issues.filter((i) => i.severity === 'MEDIUM').length * 1.0;
    const structureScore = Math.max(1, Math.min(10, Math.round((10 - structuralPenalty) * 10) / 10));

    const dimensionScores: DimensionScore[] = [
      {
        dimensionId: 'requirement_coverage',
        dimensionName: 'Requirement Coverage',
        score: reqCoverageScore,
        maxScore: 10,
        weight: 0.5,
        rationale: `Covered ${coveredCount} of ${problem.requirements.length} specified requirements based on entity and responsibility mapping.`,
      },
      {
        dimensionId: 'structural_soundness',
        dimensionName: 'Structural Soundness',
        score: structureScore,
        maxScore: 10,
        weight: 0.5,
        rationale: issues.length === 0 
          ? 'Clear domain taxonomy with well-formed classes and verified relationships.' 
          : `Identified ${issues.length} structural or completeness issue(s).`,
      },
    ];

    const overallScore = Math.round((reqCoverageScore * 0.5 + structureScore * 0.5) * 10) / 10;

    return {
      overallScore,
      dimensionScores,
      requirementCoverage,
      strengths,
      issues,
      suggestions: [],
      tradeOffs: [],
      evaluatedAt: new Date().toISOString(),
      evaluatorType: 'DETERMINISTIC',
    };
  }
}
