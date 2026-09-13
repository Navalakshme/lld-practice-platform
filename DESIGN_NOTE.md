# Design Note: LLD Practice Platform Architecture & Domain Model

**Document Purpose:** Architectural specification of the Low-Level Design Practice Platform MVP.  
**System Type:** Modular Monolith (Next.js App Router, TypeScript, Tailwind CSS, Vitest).

---

## 1. System Architecture Overview

The system is structured into four distinct architectural layers, strictly maintaining dependency inversion:

```
┌────────────────────────────────────────────────────────┐
│                   Presentation Layer                   │
│   (Next.js App Router UI: Dashboard, Studio, History)  │
└───────────────────────────┬────────────────────────────┘
                            │ Calls REST API / Actions
┌───────────────────────────▼────────────────────────────┐
│                    API / Routing Layer                 │
│      (/api/problems, /api/attempts, /api/evaluate)     │
└───────────────────────────┬────────────────────────────┘
                            │ Invokes Domain Services
┌───────────────────────────▼────────────────────────────┐
│                 Application Service Layer              │
│    ProblemService │ AttemptService │ EvaluationService  │
└─────────────┬───────────────────────────┬──────────────┘
              │ Uses Repositories         │ Coordinates Pipeline
┌─────────────▼─────────────┐ ┌───────────▼──────────────┐
│     Repository Layer      │ │     Evaluator Pipeline   │
│ IProblemRepo, IAttemptRepo│ │ IEvaluator: Deterministic│
│ (In-Memory / Pluggable DB)│ │   + Qualitative + Hybrid │
└─────────────┬─────────────┘ └───────────┬──────────────┘
              │                           │
              └─────────────┬─────────────┘
                            │ Operates on Domain Entities
┌───────────────────────────▼────────────────────────────┐
│                       Domain Layer                     │
│    Problem, Attempt, Submission, Evaluation, Rubric    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Core Domain Entities & Responsibilities

1. **`Problem`**:
   - Represents an LLD challenge (e.g. *Parking Lot*, *Elevator System*).
   - Encapsulates `ProblemRequirement[]` (with criticality: `CRITICAL`, `IMPORTANT`) and `EvaluationRubric` (weighted dimensions).
2. **`Submission`**:
   - Represents the learner's design solution.
   - Structured into `classes: ClassModel[]`, `interfaces: InterfaceModel[]`, `relationships: RelationshipModel[]`, `designPatterns: string[]`, `explanation: string`, and `codeSnippet?: string`.
3. **`Attempt`**:
   - Encapsulates the learner journey for a specific problem.
   - Maintains an explicit **State Machine** (`DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `EVALUATING` $\rightarrow$ `EVALUATED` or `FAILED`).
   - Tracks attempt number, submission snapshots, evaluation results, and failure recovery.
4. **`Evaluation` / `EvaluationResult`**:
   - Structured assessment output including `overallScore`, `dimensionScores: DimensionScore[]`, `requirementCoverage: RequirementCoverageResult[]`, `strengths: string[]`, `issues: FeedbackIssue[]`, `suggestions: FeedbackSuggestion[]`, and `tradeOffs: RecognizedTradeOff[]`.

---

## 3. Evaluation Architecture (Hybrid Strategy Pattern)

The evaluation system is designed around the `IEvaluator` interface:

```typescript
export interface IEvaluator {
  readonly name: string;
  evaluate(problem: Problem, submission: Submission): Promise<EvaluationResult>;
}
```

### Implementations:
1. **`DeterministicEvaluator`**:
   - **Requirement Coverage**: Scans requirements against classes, methods, and responsibilities using keyword graphs.
   - **Structural Completeness**: Detects empty submissions, classes without methods or responsibilities, and dangling relationships (relationships targeting undeclared classes).
   - **Anti-pattern Guards**: Detects God Classes (single class concentrating $\ge 7$ operations while the rest of the domain remains empty).
2. **`QualitativeEvaluator`**:
   - Evaluates Single Responsibility Principle (SRP), Abstraction level (programming to interfaces vs concrete implementations), Coupling & Cohesion, and Extensibility (OCP).
   - Produces targeted critique tagged with violated principles (`[SRP]`, `[OCP]`, `[DIP]`), actionable suggestions, and recognized trade-offs.
   - Pluggable: Runs a deterministic design heuristics engine offline, with optional upstream LLM provider hooks when API keys are supplied.
3. **`HybridEvaluationPipeline`**:
   - Synthesizes deterministic checks (40% weight) with qualitative design reasoning (60% weight).
   - Normalizes scores and compiles a multi-dimensional scorecard.

---

## 4. Addressing the 5 Main Assignment Design Questions

### Q1: What does a learner actually need to provide for an LLD practice attempt to be meaningful?
**Answer:** A learner does not need to submit hundreds of lines of boilerplate getters and setters. To evaluate an object-oriented design, the platform requires:
- **Classes & Types**: Concrete vs abstract classes and their primary attributes and methods.
- **Stated Responsibilities**: Why each class exists (validating Single Responsibility Principle).
- **Interface Contracts**: Key abstraction points (validating Dependency Inversion).
- **Relationships**: Topological links (Composition, Aggregation, Inheritance, Implementation).
- **Architectural Rationale**: The learner's reasoning explaining why they chose specific patterns and trade-offs.

### Q2: What makes feedback useful when there can be more than one valid LLD solution?
**Answer:** Feedback is useful when it:
1. **Evaluates Principles, Not Canonical Templates**: Focuses on cohesion, coupling, and extensibility rather than demanding identical class names.
2. **Explicitly Acknowledges Trade-offs**: For example, recognizing that using a simple enum for parking spots is simpler for an MVP, while an abstract strategy is better for dynamic scaling.
3. **Explains "Why This Matters"**: Vague grades ("6/10") are unhelpful. Useful feedback says: *"ParkingLot currently calculates ticket pricing directly. This violates SRP and means changing fee algorithms requires modifying core lot orchestration."*
4. **Provides Actionable Suggestions**: Recommends concrete interface extractions or patterns with code snippets.

### Q3: Which parts of evaluation should be deterministic, and which parts benefit from an LLM?
**Answer:**
- **Deterministic**: Structural completeness, orphaned/dangling relationship references, requirement coverage metrics, and detection of empty or bloated classes.
- **LLM / Semantic Heuristics**: Judging whether class responsibilities bleed across domain boundaries, whether abstractions are at the right level of granularity, assessing design pattern appropriateness, and evaluating the quality of the learner's design rationale.

### Q4: How would your design accommodate another evaluation approach or another submission format later?
**Answer:**
- **Another Evaluation Approach**: By adhering to the `IEvaluator` interface, adding a new evaluator (e.g. `HumanPeerEvaluator`, `LLMAnthropicEvaluator`, `StaticCodeLinterEvaluator`) requires only implementing `evaluate(problem, submission)` and registering it into the `HybridEvaluationPipeline`. No existing domain entity or UI contract changes.
- **Another Submission Format**: If we allow full GitHub repository submissions or UML diagrams (PlantUML / Mermaid), we only need a `SubmissionAdapter` that parses the input into the normalized `Submission` domain model.

### Q5: What should happen if evaluation takes time or fails?
**Answer:**
We avoid turning this assignment into an overly complex distributed messaging project by embedding a robust **Lifecycle State Machine** into the `Attempt` entity:
```
DRAFT ──► SUBMITTED ──► EVALUATING ──► EVALUATED
                             │
                             └──► FAILED ──► retry() ──► SUBMITTED
```
- When an evaluation starts, the attempt moves to `EVALUATING`.
- If an external model times out or errors, the status transitions to `FAILED` with a human-readable `failureReason`.
- The user interface immediately surfaces a "Retry Evaluation" button, which transitions the attempt back to `SUBMITTED` and re-triggers the evaluator without losing any of the learner's work.

---

## 5. Architectural Trade-offs & Decisions

| Decision | Alternative Considered | Rationale for Choice |
| :--- | :--- | :--- |
| **Modular Monolith** | Microservices (Evaluation Service, Problem Service, User Service) | Prevents unnecessary network latency, serialization overhead, and deployment complexity. Keeps the focus squarely on Low-Level Design and domain modeling. |
| **Structured Form Submission** | Free-form Code Editor or Free-form Essay | Code submissions force learners to waste time on syntax/compilation boilerplate. Essays are too ambiguous to evaluate deterministically. Structured domain entities strike the optimal balance. |
| **In-Memory Repository with Pluggable Interfaces** | Raw PostgreSQL / Prisma setup | Allows zero-setup execution, ultra-fast test runs (2.4s), and full reproducibility while keeping repository interfaces decoupled from persistence mechanism. |
| **Preset Loaders** | Manual typing only | Allows examiners and learners to test both high-performing and anti-pattern designs with a single click. |
