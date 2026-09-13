import { Difficulty, ProblemRequirement, EvaluationRubric } from './types';

export interface ProblemProps {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  summary: string;
  description: string;
  context: string;
  requirements: ProblemRequirement[];
  rubric: EvaluationRubric;
  starterHint?: string;
  tags: string[];
}

export class Problem {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly difficulty: Difficulty;
  readonly summary: string;
  readonly description: string;
  readonly context: string;
  readonly requirements: ProblemRequirement[];
  readonly rubric: EvaluationRubric;
  readonly starterHint?: string;
  readonly tags: string[];

  constructor(props: ProblemProps) {
    if (!props.id || !props.title) {
      throw new Error('Problem must have an id and title');
    }
    if (!props.requirements || props.requirements.length === 0) {
      throw new Error('Problem must have at least one requirement');
    }
    this.id = props.id;
    this.title = props.title;
    this.slug = props.slug;
    this.difficulty = props.difficulty;
    this.summary = props.summary;
    this.description = props.description;
    this.context = props.context;
    this.requirements = props.requirements;
    this.rubric = props.rubric;
    this.starterHint = props.starterHint;
    this.tags = props.tags || [];
  }

  getCriticalRequirements(): ProblemRequirement[] {
    return this.requirements.filter((r) => r.criticality === 'CRITICAL');
  }

  findRequirement(reqId: string): ProblemRequirement | undefined {
    return this.requirements.find((r) => r.id === reqId || r.code === reqId);
  }
}
