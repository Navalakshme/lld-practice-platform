# Research Note: Re-architecting Low-Level Design (LLD) Practice

**Author:** Engineering Team  
**Date:** September 2026  
**Assignment Scope:** 2-Day Engineering Assignment — LLD Practice Platform  

---

## 1. Executive Summary & Problem Formulation
Low-Level Design (LLD) is one of the most critical competencies for software engineers transitioning from junior to senior and staff roles. Where High-Level Design (HLD) deals with distributed systems, databases, caching, and network topologies, LLD focuses on object-oriented programming (OOP), domain boundary decomposition, interface design, Single Responsibility, extensibility, and maintainability.

Despite its importance in industry and technical interviews, practicing LLD is characterized by a fundamental asymmetry:
> **"LLD practice is easy to start, but notoriously difficult to evaluate."**

When a learner tackles problems such as designing a *Parking Lot*, an *Elevator System*, or a *Vending Machine*, there is no binary `true/false` test harness. Two completely distinct designs—one employing an explicit Strategy pattern for spot allocation, and another using a cohesive domain service with internal predicates—can both be valid under different trade-off constraints. Consequently, learners suffer from evaluation paralysis: they do not know whether their abstractions, coupling levels, and responsibility boundaries are good, over-engineered, or brittle.

---

## 2. Competitive Analysis: Existing Approaches & Gaps

We analyzed the current landscape of how engineers practice LLD:

| Platform / Approach | Primary Medium | Strengths | Critical Gaps |
| :--- | :--- | :--- | :--- |
| **LeetCode / HackerRank** | Full source code + automated unit test runner | Instant feedback, deterministic test execution, clear pass/fail | Treats design problems as algorithmic puzzles. Evaluates whether `int park(Car c)` returns `1`, ignoring SRP, coupling, and OOP principles. Promotes anti-patterns (e.g., monolithic static methods). |
| **YouTube & Blog Tutorials** | Video walkthroughs, medium articles, GitHub repos | Rich verbal explanations of design patterns | Purely passive consumption. The learner watches an expert solve the problem but receives zero feedback on their own unique design or trade-offs. |
| **Generic Chatbots (ChatGPT / Claude)** | Unstructured free-form text prompting | Flexible conversational interaction | Inconsistent evaluation. Tend to give generic positive scores ("8/10, great job!") or hallucinate rigid single-answer solutions without checking explicit requirement coverage or structural validity. |
| **Peer / Mock Interviews (Pramp, Interviewing.io)** | Human-to-human video pair design | Nuanced feedback, probing of trade-offs | Expensive, unscalable, non-standardized, and unavailable for repeated daily deliberate practice. |

### The Core Gaps Identified:
1. **The "Single Reference Solution" Fallacy**: Many static graders penalize students simply because their class naming or relationship structure differs from the author's reference code, ignoring valid alternative trade-offs.
2. **Boilerplate vs. Design Distinction**: When forced to write 500 lines of compilable Java or C++ code just to represent an LLD attempt, learners spend 80% of their energy on language syntax and getters/setters rather than architectural boundaries.
3. **Absence of Iterative Progression**: Platforms treat design as a one-time test rather than an iterative feedback loop where an engineer refines an initial draft based on critique.

---

## 3. Product Direction & Thesis

Our thesis for the **LLD Practice Platform** is:
> *"An effective LLD practice environment should not judge whether a learner copied a canonical reference solution. It must evaluate the soundness of their domain decomposition against explicit functional requirements, explain the principles behind its critique, explicitly recognize legitimate trade-offs, and facilitate iterative improvement across attempts."*

### Key Strategic Decisions:

1. **Structured Design Representation (Classes + Responsibilities + Interfaces + Relationships + Rationale)**:
   Instead of raw unstructured essays or tedious boilerplate code, we model the learner's solution as structured object-oriented entities. This allows learners to express their design cleanly and enables deterministic analysis of their class boundaries.

2. **Hybrid Evaluation Pipeline**:
   - **Deterministic Stage**: Verifies objective structural properties (are all requirements addressed? are there dangling relationships? are any classes empty or bloated into God objects?).
   - **Qualitative Stage (Heuristic / LLM reasoning)**: Analyzes architectural qualities (Single Responsibility, abstraction boundaries, coupling, and extensibility).

3. **Multi-Dimensional Explainable Feedback**:
   Feedback is decomposed into a transparent rubric:
   - *Requirement Coverage (40%)*
   - *Single Responsibility & Cohesion (20%)*
   - *Abstraction & Loose Coupling (20%)*
   - *Extensibility & Design Patterns (15%)*
   - *Design Rationale & Trade-offs (5%)*

4. **First-Class Architectural Trade-Offs**:
   The engine explicitly surfaces trade-offs (e.g., *Strategy Pattern for Spot Allocation* vs *Inline Logic*), explaining the upside (runtime flexibility) versus downside (indirection), validating the student's engineering judgment rather than imposing a dogmatic rule.

5. **Attempt Progression Loop**:
   Attempt history is preserved (Attempt #1 $\rightarrow$ Attempt #2 $\rightarrow$ Attempt #3), allowing learners to carry over their draft, resolve flagged issues, and measure tangible score progression over time.
