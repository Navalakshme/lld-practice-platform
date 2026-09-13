# AI Usage: Engineering Decisions & Rationale

**Platform:** LLD Practice Platform  
**Document Scope:** Explaining 3–5 meaningful AI-assisted architectural decisions, what was suggested, what was accepted or rejected, and why.

---

## 1. Evaluation Architecture: Pure LLM Prompt vs. Hybrid Pipeline
- **What AI Suggested:** The AI initially suggested sending the learner's entire submission directly to an LLM endpoint (e.g. GPT-4 or Gemini) with a system prompt asking: *"Score this low-level design from 1 to 10 and list its pros and cons."*
- **What We Accepted vs. Rejected:** **Rejected the pure LLM approach.** We instead implemented a two-stage `HybridEvaluationPipeline` combining a strict `DeterministicEvaluator` with a `QualitativeEvaluator`.
- **Engineering Rationale:**
  1. A monolithic LLM prompt is non-deterministic, difficult to regression test, and susceptible to hallucinated grading.
  2. Concrete facts (e.g., whether all 5 problem requirements are addressed, whether a relationship points to a non-existent class, or whether a class has zero methods) do not require probabilistic reasoning—they should be evaluated deterministically.
  3. By separating deterministic structural checks (40% weight) from qualitative design reasoning (60% weight), our platform achieves reproducible, transparent scoring while utilizing qualitative reasoning where it truly excels: judging Single Responsibility, abstraction boundaries, and architectural trade-offs.

---

## 2. Submission Medium: Full Source Code vs. Structured Domain Modeling
- **What AI Suggested:** The AI suggested building a code editor (e.g. Monaco Editor) where students write full compilable Java/TypeScript classes, complete with getters, setters, and constructors.
- **What We Accepted vs. Rejected:** **Rejected full code-only submission; accepted a Structured Design Studio with optional code snippet.**
- **Engineering Rationale:**
  1. When learners write 400 lines of boilerplate Java in an interview or practice session, 75% of their cognitive bandwidth is consumed by syntactic minutiae (imports, syntax errors, packaging).
  2. Compiling and running unit tests converts an LLD problem into an algorithmic LeetCode puzzle, penalizing valid architectural variations simply because a method signature differs.
  3. Structured modeling (`classes`, `responsibilities`, `interfaces`, `relationships`, and `designRationale`) directly exposes the learner's domain taxonomy and architectural intent, making the design readily inspectable and evaluatable.

---

## 3. Extensibility Design: Evaluator Strategy Pattern
- **What AI Suggested:** The AI recommended defining an `IEvaluator` interface with a polymorphic `evaluate(problem, submission)` method signature.
- **What We Accepted vs. Rejected:** **Accepted.**
- **Engineering Rationale:**
  1. The assignment explicitly asks: *"How would your design accommodate another evaluation approach later?"*
  2. By abstracting the evaluation engine behind `IEvaluator`, new evaluation mechanisms—such as `HumanPeerEvaluator`, `ClaudeEvaluator`, `OpenAIEvaluator`, or `RuleBasedLinter`—can be introduced simply by implementing the interface and registering the class in the dependency container.
  3. The core `Attempt`, `Submission`, and API controllers remain completely decoupled from the specific evaluation implementation (Dependency Inversion Principle).

---

## 4. Evaluation Failure & Resilience: Distributed Queue vs. Domain State Machine
- **What AI Suggested:** The AI suggested introducing a Redis/BullMQ task queue with worker processes and WebSocket notifications to manage asynchronous evaluation.
- **What We Accepted vs. Rejected:** **Rejected the external message broker; accepted an in-memory Lifecycle State Machine with recovery transitions.**
- **Engineering Rationale:**
  1. The assignment guidelines explicitly state: *"Keep this practical; do not turn the assignment into a distributed-systems project."* Introducing Redis or Celery would over-complicate the prototype without adding LLD value.
  2. Instead, we modeled resilience inside the `Attempt` domain entity using a clean state machine:
     $$\text{DRAFT} \longrightarrow \text{SUBMITTED} \longrightarrow \text{EVALUATING} \longrightarrow \text{EVALUATED} \text{ or } \text{FAILED}$$
  3. If an evaluator times out or fails (which can be triggered via our "Simulate Failure" test toggle), the attempt captures a `failureReason` and enters `FAILED`. The learner can click "Retry Evaluation", which cleanly transitions the attempt back to `SUBMITTED` and re-triggers the pipeline without data loss.

---

## 5. Feedback Schema: Free-form Text vs. Multi-Dimensional Rubric & Trade-Offs
- **What AI Suggested:** The AI suggested generating a single score and a markdown block with general tips.
- **What We Accepted vs. Rejected:** **Rejected unformatted text; accepted a structured, multi-dimensional rubric schema with an explicit `RecognizedTradeOff` array.**
- **Engineering Rationale:**
  1. Good Low-Level Design does not have one dogmatic "correct" answer. Different designs make different trade-offs.
  2. We designed our `EvaluationResult` schema to explicitly return:
     - `dimensionScores`: Breakdown across Requirement Coverage, SRP, Abstraction, Extensibility, and Rationale.
     - `requirementCoverage`: Granular map of which requirements were satisfied.
     - `issues`: Principle-tagged critique (e.g. `[SRP]`, `[OCP]`, `[DIP]`).
     - `tradeOffs`: Explicit evaluation of the learner's choices (e.g., *Strategy Pattern for Spot Allocation* vs *Inline Switch Logic*), highlighting upsides vs downsides.
  3. This ensures the feedback is explainable, educational, and respectful of valid design alternatives.
