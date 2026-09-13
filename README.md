# LLD Practice Platform (Low-Level Design Practice & Feedback Studio)

> **2-Day Engineering Prototype** designed to help software engineers practice Low-Level Design (LLD), submit structured solutions, and receive explainable, multi-dimensional feedback across iterative attempts.

---

## 🌟 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0 or higher (v20+ / v22 recommended)
- **npm**: v9.0 or higher

### Installation & Run

1. **Clone or Navigate to the directory:**
   ```bash
   cd d:/navalakshme/LLD
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the Automated Test Suite (Vitest):**
   ```bash
   npm test
   ```
   *Runs 10 unit and integration tests covering domain state transitions, deterministic checks, hybrid evaluation, and failure recovery.*

4. **Launch the Development Server:**
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 🎯 The Learner Journey & Practice Loop

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 1. Choose       │ ────► │ 2. Think &      │ ────► │ 3. Submit       │
│    Problem      │       │    Design       │       │    Solution     │
└─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                             │
┌─────────────────┐       ┌─────────────────┐                │
│ 6. Iterate &    │ ◄──── │ 5. Review       │ ◄──────────────┘
│    Try Again    │       │    Feedback     │
└────────┬────────┘       └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Attempt History │ (Track score progression: Attempt #1 ──► #2 ──► #3)
└─────────────────┘
```

1. **Choose Problem:** Browse curated LLD problems (*Parking Lot*, *Elevator System*, *Vending Machine*, *Tic-Tac-Toe*) with explicit requirements and evaluation rubrics.
2. **Design Studio:** Build domain models using structured elements:
   - **Classes:** Define names, concrete vs abstract, responsibilities, attributes, and methods.
   - **Interfaces:** Specify abstraction contracts and purposes.
   - **Relationships:** Define Composition, Aggregation, Inheritance, Implementation, and Associations.
   - **Patterns & Rationale:** Declare design patterns (Strategy, State, Factory, etc.) and explain architectural trade-offs.
   - *Quick Presets:* One-click buttons to load a **"Good Design"** (Strategy + SOLID) or a **"Flawed Design"** (God class) for instant testing!
3. **Submit Solution:** Triggers the evaluation state machine (`DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `EVALUATING` $\rightarrow$ `EVALUATED`).
4. **Explainable Feedback:**
   - Overall Quality Score (0.0 to 10.0)
   - Dimension Breakdown (Requirement Coverage, Single Responsibility, Abstraction, Extensibility, Rationale)
   - Deterministic Requirement Coverage Checklist
   - Strengths identified
   - Issues tagged with violated principles (`[SRP]`, `[OCP]`, `[DIP]`)
   - Actionable recommendations with code examples
   - **Recognized Architectural Trade-offs** (explaining why an alternative approach was acceptable vs suboptimal)
5. **Attempt History & Progression:** Track multiple attempts per problem, compare scores, and refine your design iteratively.

---

## 🏗️ Architecture & Domain Design

```
src/
├── app/                        # Next.js App Router (UI & REST API)
│   ├── api/
│   │   ├── problems/           # GET catalog & problem details
│   │   └── attempts/           # POST create, PATCH update, POST evaluate, POST retry
│   ├── problems/[id]/          # Problem requirements & rubric view
│   ├── practice/[attemptId]/   # Flagship Interactive Design Studio & Feedback View
│   ├── page.tsx                # Dashboard & problem browser
│   └── globals.css             # Tailwind dark-mode styling
├── domain/                     # Core Object-Oriented Domain Layer
│   ├── Problem.ts              # Problem entity with requirements & rubric
│   ├── Submission.ts           # Submission entity with classes, interfaces, relationships
│   ├── Attempt.ts              # Attempt entity with lifecycle state machine
│   └── types.ts                # Value objects, enums, dimension scores, trade-offs
├── evaluator/                  # Evaluation Strategy Pipeline
│   ├── IEvaluator.ts           # Common Evaluator interface (Strategy Pattern)
│   ├── DeterministicEvaluator.ts # Structural completeness, requirement coverage, dangling links
│   ├── QualitativeEvaluator.ts # SOLID principles, abstraction, coupling, trade-offs
│   └── HybridEvaluationPipeline.ts # Weighted synthesis (40% deterministic, 60% qualitative)
├── repositories/               # Repository interfaces and in-memory persistence
│   ├── IProblemRepository.ts   # Problem repository interface
│   ├── InMemoryProblemRepository.ts # Pre-seeded problem store
│   ├── IAttemptRepository.ts   # Attempt repository interface
│   └── InMemoryAttemptRepository.ts # Attempt history store
├── services/                   # Application Service Layer
│   ├── ProblemService.ts       # Problem discovery
│   ├── AttemptService.ts       # Attempt creation, updates, and iteration
│   └── EvaluationService.ts    # Evaluation coordination & failure recovery
└── data/
    └── seedProblems.ts         # 4 rich seed LLD problems
```

---

## 🧪 Testing & Reliability

The test suite validates the core domain logic, state machine, deterministic rules, hybrid synthesis, and failure resilience:

```bash
npm test
```

### Test Coverage Highlights:
- `tests/domain.test.ts`: Verifies entity creation, requirement validation, and the state machine (`DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `EVALUATING` $\rightarrow$ `EVALUATED` and `FAILED` $\rightarrow$ `retry()`).
- `tests/deterministic-evaluator.test.ts`: Tests detection of empty submissions, dangling relationships, God classes, and requirement keyword matching.
- `tests/hybrid-pipeline.test.ts`: Tests weighted score computation, strength compilation, issue tagging, and trade-off recognition.
- `tests/resilience-and-edge-cases.test.ts`: Simulates engine timeouts/failures, verifies the transition to `FAILED`, tests the `retry()` recovery flow, and tests malformed payloads.

---

## 🛡️ Evaluation Resilience & Failure Handling

The platform models evaluation as an explicit state machine inside `Attempt`:
```
DRAFT ──► SUBMITTED ──► EVALUATING ──► EVALUATED
                             │
                             └──► FAILED ──► retry() ──► SUBMITTED
```

### Live Resilience Demonstration:
1. In the **Design Studio**, check the **"Simulate Failure"** box.
2. Click **Submit for Evaluation**.
3. Notice the state smoothly transitions to `FAILED` with an alert: *"Evaluation engine timeout or rate limit exceeded."*
4. Click **Retry Evaluation**: the system resets the state to `SUBMITTED`, clears the error, and automatically re-evaluates successfully without losing any learner input.

---

## 📄 Assignment Deliverables

- **Research Note (1–2 pages):** [`RESEARCH_NOTE.md`](./RESEARCH_NOTE.md)  
  *Detailed analysis of the learner problem, existing tools (LeetCode, blogs, generic LLMs), gaps, and product thesis.*
- **Design Note:** [`DESIGN_NOTE.md`](./DESIGN_NOTE.md)  
  *Explanation of MVP architecture, domain model, evaluation approach, answers to the 5 design questions, and key trade-offs.*
- **AI Usage:** [`AI_USAGE.md`](./AI_USAGE.md)  
  *Analysis of 5 meaningful AI-assisted decisions: what was suggested, accepted vs. rejected, and rationale.*
- **Automated Tests:** [`tests/`](./tests/)  
  *10 passing automated tests across 4 test suites.*

---

## ⚖️ Limitations & Future Work

1. **Visual Diagram Canvas**: Current submission uses a structured form builder with classes, interfaces, and relationships. Future iterations can introduce an interactive drag-and-drop UML canvas (e.g. React Flow or Mermaid preview).
2. **Code Execution Sandbox**: While LLD focuses on object responsibilities, an optional micro-sandbox running unit tests on learner-provided class skeletons could complement the qualitative review.
3. **Database Persistence**: Current state uses thread-safe in-memory repositories with interface abstraction (`IProblemRepository`, `IAttemptRepository`). In production, this cleanly swaps for PostgreSQL / Prisma without altering domain services.
