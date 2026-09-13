import { describe, it, expect } from 'vitest';
import { Problem, Submission } from '../src/domain';
import { HybridEvaluationPipeline } from '../src/evaluator';
import { SEED_PROBLEMS } from '../src/data/seedProblems';

describe('HybridEvaluationPipeline', () => {
  const pipeline = new HybridEvaluationPipeline();
  const parkingLotProblem = new Problem(SEED_PROBLEMS[0]);

  it('should synthesize deterministic coverage with qualitative design reasoning', async () => {
    const submission = new Submission({
      classes: [
        {
          id: 'c1',
          name: 'ParkingLot',
          type: 'CLASS',
          responsibilities: ['Coordinates floors and entry gates'],
          attributes: [],
          methods: [{ name: 'processEntry', returnType: 'Ticket', visibility: 'PUBLIC' }],
        },
        {
          id: 'c2',
          name: 'ParkingFloor',
          type: 'CLASS',
          responsibilities: ['Maintains spots on floor'],
          attributes: [],
          methods: [],
        },
        {
          id: 'c3',
          name: 'ParkingSpot',
          type: 'CLASS',
          responsibilities: ['Holds vehicle instance'],
          attributes: [],
          methods: [],
        },
        {
          id: 'c4',
          name: 'Vehicle',
          type: 'ABSTRACT_CLASS',
          responsibilities: ['Base vehicle model'],
          attributes: [],
          methods: [{ name: 'getType', returnType: 'VehicleType', visibility: 'PUBLIC' }],
        },
      ],
      interfaces: [
        {
          id: 'i1',
          name: 'SpotAllocationStrategy',
          purpose: 'Determine best spot',
          methods: [{ name: 'allocateSpot', returnType: 'ParkingSpot', visibility: 'PUBLIC' }],
        },
      ],
      relationships: [
        { id: 'r1', source: 'ParkingLot', target: 'ParkingFloor', type: 'COMPOSITION' },
        { id: 'r2', source: 'ParkingFloor', target: 'ParkingSpot', type: 'AGGREGATION' },
      ],
      designPatterns: ['Strategy Pattern'],
      explanation: 'Used Strategy pattern for spot allocation to isolate placement algorithms from parking lot core.',
    });

    const result = await pipeline.evaluate(parkingLotProblem, submission);

    expect(result.evaluatorType).toBe('HYBRID');
    expect(result.overallScore).toBeGreaterThanOrEqual(7.0);
    expect(result.dimensionScores.length).toBeGreaterThanOrEqual(4);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.tradeOffs.length).toBeGreaterThan(0);

    // Verify trade-offs highlight decision nuances
    const strategyTradeoff = result.tradeOffs.find((t) => t.decision.includes('Strategy Pattern'));
    expect(strategyTradeoff).toBeDefined();
    expect(strategyTradeoff?.isAcceptable).toBe(true);
  });
});
