export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type AttemptStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'EVALUATED' | 'FAILED';

export type RelationshipType = 
  | 'INHERITANCE'    // "is-a" (e.g. Car is a Vehicle)
  | 'IMPLEMENTATION' // "implements" (e.g. HourlyPricingStrategy implements PricingStrategy)
  | 'COMPOSITION'    // "part-of / strong lifecycle" (e.g. ParkingLot owns ParkingFloors)
  | 'AGGREGATION'    // "has-a / weak lifecycle" (e.g. ParkingFloor has ParkingSpots)
  | 'ASSOCIATION'    // "uses / interacts" (e.g. Ticket references ParkingSpot)
  | 'DEPENDENCY';    // "depends-on / parameter" (e.g. PaymentProcessor depends on PaymentDetails)

export interface ProblemRequirement {
  id: string;
  code: string; // e.g. "REQ-1"
  description: string;
  keywords: string[]; // for deterministic requirement tracking
  criticality: 'CRITICAL' | 'IMPORTANT' | 'OPTIONAL';
}

export interface RubricDimension {
  id: string;
  name: string;
  weight: number; // e.g. 0.20
  description: string;
}

export interface EvaluationRubric {
  dimensions: RubricDimension[];
}

export interface ClassMethod {
  name: string;
  returnType: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
  parameters?: string[];
  responsibilityDesc?: string;
}

export interface ClassAttribute {
  name: string;
  type: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
}

export interface ClassModel {
  id: string;
  name: string;
  type: 'CLASS' | 'ABSTRACT_CLASS';
  responsibilities: string[];
  attributes: ClassAttribute[];
  methods: ClassMethod[];
}

export interface InterfaceModel {
  id: string;
  name: string;
  methods: ClassMethod[];
  purpose: string;
}

export interface RelationshipModel {
  id: string;
  source: string; // class/interface name
  target: string; // class/interface name
  type: RelationshipType;
  description?: string;
}

export interface SubmissionData {
  classes: ClassModel[];
  interfaces: InterfaceModel[];
  relationships: RelationshipModel[];
  designPatterns: string[];
  explanation: string;
  codeSnippet?: string;
}

export interface DimensionScore {
  dimensionId: string;
  dimensionName: string;
  score: number; // 0 to 10
  maxScore: number;
  weight: number;
  rationale: string;
}

export interface FeedbackIssue {
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  violatesPrinciple?: 'SRP' | 'OCP' | 'LSP' | 'ISP' | 'DIP' | 'HIGH_COUPLING' | 'LOW_COHESION';
  affectedElements?: string[];
}

export interface FeedbackSuggestion {
  title: string;
  recommendation: string;
  exampleSnippet?: string;
}

export interface RecognizedTradeOff {
  decision: string;
  upside: string;
  downside: string;
  isAcceptable: boolean;
  verdict: string;
}

export interface RequirementCoverageResult {
  requirementId: string;
  code: string;
  covered: boolean;
  matchedElements: string[];
  notes: string;
}

export interface EvaluationResult {
  overallScore: number; // 0.0 - 10.0
  dimensionScores: DimensionScore[];
  requirementCoverage: RequirementCoverageResult[];
  strengths: string[];
  issues: FeedbackIssue[];
  suggestions: FeedbackSuggestion[];
  tradeOffs: RecognizedTradeOff[];
  evaluatedAt: string;
  evaluatorType: 'DETERMINISTIC' | 'QUALITATIVE' | 'HYBRID';
}
