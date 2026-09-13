import { describe, it, expect } from 'vitest';
import { Problem, Submission } from '../src/domain';
import { DeterministicEvaluator } from '../src/evaluator';
import { SEED_PROBLEMS } from '../src/data/seedProblems';

describe('DeterministicEvaluator', () => {
  const evaluator = new DeterministicEvaluator();
  const problem = new Problem(SEED_PROBLEMS[0]); // Parking Lot

  it('should flag empty submissions with high severity issue', async () => {
    const emptySubmission = new Submission({
      classes: [],
      interfaces: [],
      relationships: [],
    });

    const result = await evaluator.evaluate(problem, emptySubmission);

    expect(result.evaluatorType).toBe('DETERMINISTIC');
    expect(result.issues.some((i) => i.title.includes('Empty Submission'))).toBe(true);
    expect(result.requirementCoverage.every((r) => !r.covered)).toBe(true);
    expect(result.overallScore).toBeLessThan(4.0);
  });

  it('should detect dangling relationship references', async () => {
    const submission = new Submission({
      classes: [
        {
          id: 'c1',
          name: 'ParkingLot',
          type: 'CLASS',
          responsibilities: ['Manages entry'],
          attributes: [],
          methods: [{ name: 'enter', returnType: 'void', visibility: 'PUBLIC' }],
        },
      ],
      relationships: [
        {
          id: 'r1',
          source: 'ParkingLot',
          target: 'GhostFloor', // Not declared in classes or interfaces
          type: 'COMPOSITION',
        },
      ],
    });

    const result = await evaluator.evaluate(problem, submission);
    const danglingIssue = result.issues.find((i) => i.title.includes('Dangling Relationship'));
    expect(danglingIssue).toBeDefined();
    expect(danglingIssue?.affectedElements).toContain('GhostFloor');
  });

  it('should accurately calculate requirement coverage from declared components', async () => {
    const comprehensiveSubmission = new Submission({
      classes: [
        {
          id: 'c1',
          name: 'ParkingLot',
          type: 'CLASS',
          responsibilities: ['Orchestrate floors and gates'],
          attributes: [],
          methods: [{ name: 'park', returnType: 'Ticket', visibility: 'PUBLIC' }],
        },
        {
          id: 'c2',
          name: 'ParkingFloor',
          type: 'CLASS',
          responsibilities: ['Store parking spots across levels'],
          attributes: [{ name: 'spots', type: 'List<ParkingSpot>', visibility: 'PRIVATE' }],
          methods: [],
        },
        {
          id: 'c3',
          name: 'ParkingSpot',
          type: 'CLASS',
          responsibilities: ['Hold compact, regular, or large vehicle'],
          attributes: [],
          methods: [{ name: 'vacate', returnType: 'void', visibility: 'PUBLIC' }],
        },
        {
          id: 'c4',
          name: 'Ticket',
          type: 'CLASS',
          responsibilities: ['Record vehicle entry timestamp and spot'],
          attributes: [],
          methods: [],
        },
      ],
      interfaces: [
        {
          id: 'i1',
          name: 'PricingStrategy',
          purpose: 'Calculate fees on exit',
          methods: [{ name: 'calculateFee', returnType: 'double', visibility: 'PUBLIC' }],
        },
        {
          id: 'i2',
          name: 'SpotAllocationStrategy',
          purpose: 'Find optimal spot for vehicle',
          methods: [{ name: 'findSpot', returnType: 'ParkingSpot', visibility: 'PUBLIC' }],
        },
      ],
      relationships: [
        { id: 'r1', source: 'ParkingLot', target: 'ParkingFloor', type: 'COMPOSITION' },
        { id: 'r2', source: 'ParkingFloor', target: 'ParkingSpot', type: 'AGGREGATION' },
      ],
      explanation: 'Supports motorcycle, car, truck with ticket generation and dynamic fee payment.',
    });

    const result = await evaluator.evaluate(problem, comprehensiveSubmission);
    const coveredReqs = result.requirementCoverage.filter((r) => r.covered);

    expect(coveredReqs.length).toBeGreaterThanOrEqual(4);
    expect(result.overallScore).toBeGreaterThanOrEqual(8.0);
    expect(result.strengths.length).toBeGreaterThan(0);
  });
});
