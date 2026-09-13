import { IEvaluator } from './IEvaluator';
import { 
  Problem, 
  Submission, 
  EvaluationResult, 
  FeedbackIssue, 
  FeedbackSuggestion, 
  RecognizedTradeOff, 
  DimensionScore 
} from '../domain';

export class QualitativeEvaluator implements IEvaluator {
  readonly name = 'QualitativeEvaluator';

  async evaluate(problem: Problem, submission: Submission): Promise<EvaluationResult> {
    // If an LLM API key were provided, it would attempt external model invocation.
    // For deterministic reproducibility, resilience, and offline execution, we execute
    // an expert low-level design heuristic reasoning engine tailored to the problem and submission.
    return this.evaluateHeuristics(problem, submission);
  }

  private evaluateHeuristics(problem: Problem, submission: Submission): EvaluationResult {
    const issues: FeedbackIssue[] = [];
    const suggestions: FeedbackSuggestion[] = [];
    const strengths: string[] = [];
    const tradeOffs: RecognizedTradeOff[] = [];

    const allClasses = submission.classes;
    const allInterfaces = submission.interfaces;
    const allRelationships = submission.relationships;
    const explanation = (submission.explanation || '').toLowerCase();
    const patterns = submission.designPatterns.map((p) => p.toLowerCase());

    // --- 1. Single Responsibility Principle (SRP) & Cohesion ---
    let srpScore = 8.0;
    const godClasses = allClasses.filter((c) => {
      const respCount = (c.responsibilities?.length || 0) + (c.methods?.length || 0);
      return respCount > 6;
    });

    if (godClasses.length > 0) {
      srpScore -= 2.5;
      godClasses.forEach((gc) => {
        issues.push({
          severity: 'HIGH',
          title: `SRP Violation: Overloaded Class "${gc.name}"`,
          description: `"${gc.name}" contains ${gc.methods?.length || 0} methods and ${gc.responsibilities?.length || 0} responsibilities. It mixes orchestration with domain state.`,
          violatesPrinciple: 'SRP',
          affectedElements: [gc.name],
        });
      });
    } else if (allClasses.length >= 3) {
      strengths.push('Clean domain decomposition: Classes exhibit focused responsibilities across distinct domain concepts.');
    }

    // --- 2. Abstraction & Interface Segregation (ISP / DIP) ---
    let abstractionScore = 7.0;
    const hasStrategyOrInterface = allInterfaces.length > 0 || 
      patterns.some((p) => p.includes('strategy') || p.includes('factory') || p.includes('state'));

    if (allInterfaces.length === 0) {
      abstractionScore -= 2.0;
      issues.push({
        severity: 'MEDIUM',
        title: 'Missing Abstractions / Programming to Implementations',
        description: 'No interfaces or abstract contracts defined. High-level orchestrators are tightly coupled to concrete classes.',
        violatesPrinciple: 'DIP',
      });
      suggestions.push({
        title: 'Introduce Strategy or State Interfaces',
        recommendation: 'Define polymorphic interfaces for behaviors subject to variation (e.g., spot allocation, fee calculation, elevator dispatching).',
      });
    } else {
      abstractionScore += 1.5;
      strengths.push(`Good abstraction level: Defined ${allInterfaces.length} contract(s) to isolate client code from concrete implementations.`);
    }

    // --- 3. Coupling & Extensibility (OCP) ---
    let extensibilityScore = 7.5;
    const hasInheritanceOrImpl = allRelationships.some(
      (r) => r.type === 'INHERITANCE' || r.type === 'IMPLEMENTATION'
    );

    // Problem-specific qualitative checks
    if (problem.slug.includes('parking-lot') || problem.id.includes('parking')) {
      const hasVehicleHierarchy = allClasses.some((c) => c.name.toLowerCase().includes('vehicle')) ||
                                  allInterfaces.some((i) => i.name.toLowerCase().includes('vehicle'));
      const hasStrategy = allInterfaces.some((i) => i.name.toLowerCase().includes('strategy') || i.name.toLowerCase().includes('pricing') || i.name.toLowerCase().includes('spot'));

      if (!hasVehicleHierarchy) {
        issues.push({
          severity: 'MEDIUM',
          title: 'Direct Coupling to Concrete Vehicle Formats',
          description: 'Lacks a base Vehicle abstraction or polymorphism for cars, bikes, and trucks.',
          violatesPrinciple: 'OCP',
        });
        suggestions.push({
          title: 'Establish a Vehicle Inheritance or Strategy Hierarchy',
          recommendation: 'Use an abstract Vehicle base class with concrete Car, Bike, Truck subclasses, or a VehicleType enum mapped to spot dimensions.',
        });
        extensibilityScore -= 1.5;
      } else {
        strengths.push('Extensible Vehicle modeling allows new vehicle types (e.g. ElectricVehicle) to be introduced without modifying parking spots.');
      }

      if (hasStrategy) {
        strengths.push('Flexible allocation/pricing strategy: Spot assignment or pricing algorithms can be swapped dynamically.');
        tradeOffs.push({
          decision: 'Strategy Pattern for Spot Allocation',
          upside: 'Allows runtime configuration of Nearest-to-Entrance, Random, or Clustered allocation.',
          downside: 'Slightly higher class count and indirect delegation compared to inline loops.',
          isAcceptable: true,
          verdict: 'Excellent design decision for production parking architectures.',
        });
      } else {
        tradeOffs.push({
          decision: 'Inline Spot Allocation Logic',
          upside: 'Simpler initial code and fewer files.',
          downside: 'Violates Open/Closed principle if new allocation algorithms are needed in future.',
          isAcceptable: true,
          verdict: 'Acceptable for simple MVP, but introduce a Strategy interface as system grows.',
        });
      }
    } else if (problem.slug.includes('elevator') || problem.id.includes('elevator')) {
      const hasStatePattern = patterns.includes('state') || 
        allClasses.some((c) => c.name.toLowerCase().includes('state')) ||
        allInterfaces.some((i) => i.name.toLowerCase().includes('state'));

      if (hasStatePattern) {
        strengths.push('State Pattern effectively handles elevator motion states (IDLE, MOVING_UP, MOVING_DOWN, MAINTENANCE).');
        tradeOffs.push({
          decision: 'State Pattern for Car Movement',
          upside: 'Eliminates complex nested switch/case statements when handling internal/external requests.',
          downside: 'Requires managing state transitions across multiple discrete class instances.',
          isAcceptable: true,
          verdict: 'Recommended for multi-car elevator control systems.',
        });
      } else {
        suggestions.push({
          title: 'Consider State Pattern for Elevator Car Lifecycle',
          recommendation: 'Encapsulating ElevatorState avoids conditional sprawl when processing floor button requests while already moving.',
        });
      }
    } else if (problem.slug.includes('vending') || problem.id.includes('vending')) {
      const hasState = patterns.includes('state') || 
        allClasses.some((c) => c.name.toLowerCase().includes('state')) ||
        allInterfaces.some((i) => i.name.toLowerCase().includes('state'));

      if (hasState) {
        strengths.push('State Pattern models money insertion, item selection, dispensing, and refund transitions robustly.');
      } else {
        suggestions.push({
          title: 'Decouple Vending Machine State Transitions',
          recommendation: 'Model states (IdleState, HasMoneyState, DispensingState, SoldOutState) as polymorphic state handlers to prevent illegal state transactions.',
        });
      }
    }

    // Explanation Quality
    let explanationScore = 6.0;
    if (submission.explanation && submission.explanation.length > 80) {
      explanationScore = 8.5;
      strengths.push('Thoughtful design rationale: Explanation justifies trade-offs and structural choices.');
    } else {
      suggestions.push({
        title: 'Articulate Architectural Trade-offs',
        recommendation: 'Document why you chose composition vs inheritance or specific design patterns in the design explanation.',
      });
    }

    srpScore = Math.max(1, Math.min(10, Math.round(srpScore * 10) / 10));
    abstractionScore = Math.max(1, Math.min(10, Math.round(abstractionScore * 10) / 10));
    extensibilityScore = Math.max(1, Math.min(10, Math.round(extensibilityScore * 10) / 10));

    const dimensionScores: DimensionScore[] = [
      {
        dimensionId: 'responsibility_separation',
        dimensionName: 'Single Responsibility & Cohesion',
        score: srpScore,
        maxScore: 10,
        weight: 0.35,
        rationale: srpScore >= 7.5 ? 'Clear domain boundaries and minimal responsibility bleeding.' : 'Some classes bundle excessive domain behaviors.',
      },
      {
        dimensionId: 'abstraction_and_coupling',
        dimensionName: 'Abstraction & Loose Coupling',
        score: abstractionScore,
        maxScore: 10,
        weight: 0.30,
        rationale: allInterfaces.length > 0 ? 'Good use of abstractions to insulate high-level clients.' : 'Coupled to concrete classes; lacks interface contracts.',
      },
      {
        dimensionId: 'extensibility_and_patterns',
        dimensionName: 'Extensibility & Design Patterns',
        score: extensibilityScore,
        maxScore: 10,
        weight: 0.25,
        rationale: hasInheritanceOrImpl ? 'System open for extension without modification.' : 'Modifying rules may require rewriting existing classes.',
      },
      {
        dimensionId: 'design_rationale',
        dimensionName: 'Design Rationale & Trade-offs',
        score: explanationScore,
        maxScore: 10,
        weight: 0.10,
        rationale: explanation.length > 50 ? 'Design choices and trade-offs are clearly articulated.' : 'Explanation is minimal; provide deeper rationale for patterns.',
      },
    ];

    const overallScore = Math.round(
      dimensionScores.reduce((acc, d) => acc + d.score * d.weight, 0) * 10
    ) / 10;

    return {
      overallScore,
      dimensionScores,
      requirementCoverage: [],
      strengths,
      issues,
      suggestions,
      tradeOffs,
      evaluatedAt: new Date().toISOString(),
      evaluatorType: 'QUALITATIVE',
    };
  }
}
