import { describe, it, expect } from 'vitest';
import { Problem, Submission, Attempt } from '../src/domain';
import { SEED_PROBLEMS } from '../src/data/seedProblems';

describe('Domain Entities & Lifecycle', () => {
  it('should instantiate Problem with valid requirements and rubrics', () => {
    const problemProps = SEED_PROBLEMS[0];
    const problem = new Problem(problemProps);

    expect(problem.id).toBe('prob-1');
    expect(problem.title).toBe('Parking Lot System');
    expect(problem.requirements.length).toBeGreaterThan(0);
    expect(problem.getCriticalRequirements().length).toBeGreaterThan(0);
  });

  it('should reject Problem instantiation with empty requirements', () => {
    expect(() => {
      new Problem({
        id: 'bad-prob',
        title: 'Bad Problem',
        slug: 'bad',
        difficulty: 'BEGINNER',
        summary: 'No reqs',
        description: 'No reqs',
        context: 'None',
        requirements: [],
        rubric: { dimensions: [] },
        tags: [],
      });
    }).toThrow('Problem must have at least one requirement');
  });

  it('should manage Submission structure and type indexing', () => {
    const submission = new Submission({
      classes: [
        {
          id: 'c1',
          name: 'ParkingLot',
          type: 'CLASS',
          responsibilities: ['Orchestrate floors', 'Coordinate entry and exit'],
          attributes: [{ name: 'floors', type: 'List<ParkingFloor>', visibility: 'PRIVATE' }],
          methods: [{ name: 'parkVehicle', returnType: 'Ticket', visibility: 'PUBLIC' }],
        },
      ],
      interfaces: [
        {
          id: 'i1',
          name: 'PricingStrategy',
          purpose: 'Calculate fees dynamically',
          methods: [{ name: 'calculateFee', returnType: 'double', visibility: 'PUBLIC' }],
        },
      ],
      relationships: [
        {
          id: 'r1',
          source: 'ParkingLot',
          target: 'ParkingFloor',
          type: 'COMPOSITION',
        },
      ],
      explanation: 'Used composition for parking floors and strategy for pricing.',
    });

    expect(submission.hasValidStructure()).toBe(true);
    const types = submission.getAllTypeNames();
    expect(types.has('parkinglot')).toBe(true);
    expect(types.has('pricingstrategy')).toBe(true);
    expect(submission.getAllMethods()).toContain('parkVehicle');
    expect(submission.getAllMethods()).toContain('calculateFee');
  });

  it('should enforce the Attempt state machine transitions correctly', () => {
    const submission = new Submission({ classes: [] });
    const attempt = new Attempt({
      id: 'att-1',
      problemId: 'prob-1',
      learnerId: 'user-1',
      attemptNumber: 1,
      submission,
    });

    expect(attempt.status).toBe('DRAFT');

    // DRAFT -> SUBMITTED
    attempt.markSubmitted();
    expect(attempt.status).toBe('SUBMITTED');

    // SUBMITTED -> EVALUATING
    attempt.startEvaluation();
    expect(attempt.status).toBe('EVALUATING');

    // Attempting to edit while EVALUATING should throw
    expect(() => {
      attempt.updateSubmission(new Submission({ classes: [] }));
    }).toThrow('Cannot edit submission while evaluation is in progress');

    // EVALUATING -> FAILED
    attempt.failEvaluation('Simulated network timeout');
    expect(attempt.status).toBe('FAILED');
    expect(attempt.failureReason).toBe('Simulated network timeout');

    // FAILED -> retry() -> SUBMITTED
    attempt.retry();
    expect(attempt.status).toBe('SUBMITTED');
    expect(attempt.failureReason).toBeUndefined();

    // SUBMITTED -> EVALUATING -> EVALUATED
    attempt.startEvaluation();
    attempt.completeEvaluation({
      overallScore: 8.5,
      dimensionScores: [],
      requirementCoverage: [],
      strengths: ['Great modularity'],
      issues: [],
      suggestions: [],
      tradeOffs: [],
      evaluatedAt: new Date().toISOString(),
      evaluatorType: 'HYBRID',
    });

    expect(attempt.status).toBe('EVALUATED');
    expect(attempt.evaluation?.overallScore).toBe(8.5);
  });
});
