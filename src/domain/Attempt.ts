import { AttemptStatus, EvaluationResult } from './types';
import { Submission } from './Submission';

export interface AttemptProps {
  id: string;
  problemId: string;
  learnerId: string;
  attemptNumber: number;
  status?: AttemptStatus;
  submission: Submission;
  evaluation?: EvaluationResult;
  failureReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Attempt {
  readonly id: string;
  readonly problemId: string;
  readonly learnerId: string;
  readonly attemptNumber: number;
  private _status: AttemptStatus;
  private _submission: Submission;
  private _evaluation?: EvaluationResult;
  private _failureReason?: string;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: AttemptProps) {
    if (!props.id || !props.problemId || !props.learnerId) {
      throw new Error('Attempt requires id, problemId, and learnerId');
    }
    this.id = props.id;
    this.problemId = props.problemId;
    this.learnerId = props.learnerId;
    this.attemptNumber = props.attemptNumber || 1;
    this._status = props.status || 'DRAFT';
    this._submission = props.submission;
    this._evaluation = props.evaluation;
    this._failureReason = props.failureReason;
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get status(): AttemptStatus {
    return this._status;
  }

  get submission(): Submission {
    return this._submission;
  }

  get evaluation(): EvaluationResult | undefined {
    return this._evaluation;
  }

  get failureReason(): string | undefined {
    return this._failureReason;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateSubmission(newSubmission: Submission): void {
    if (this._status === 'EVALUATING') {
      throw new Error('Cannot edit submission while evaluation is in progress');
    }
    this._submission = newSubmission;
    this._status = 'DRAFT';
    this._updatedAt = new Date();
  }

  markSubmitted(): void {
    if (this._status === 'EVALUATING') {
      throw new Error('Attempt is already evaluating');
    }
    this._status = 'SUBMITTED';
    this._updatedAt = new Date();
  }

  startEvaluation(): void {
    if (this._status !== 'SUBMITTED' && this._status !== 'FAILED') {
      throw new Error(`Cannot start evaluation from state: ${this._status}`);
    }
    this._status = 'EVALUATING';
    this._failureReason = undefined;
    this._updatedAt = new Date();
  }

  completeEvaluation(evaluation: EvaluationResult): void {
    if (this._status !== 'EVALUATING') {
      throw new Error(`Cannot complete evaluation from state: ${this._status}`);
    }
    this._evaluation = evaluation;
    this._status = 'EVALUATED';
    this._updatedAt = new Date();
  }

  failEvaluation(reason: string): void {
    if (this._status !== 'EVALUATING') {
      throw new Error(`Cannot mark failure from state: ${this._status}`);
    }
    this._failureReason = reason;
    this._status = 'FAILED';
    this._updatedAt = new Date();
  }

  retry(): void {
    if (this._status !== 'FAILED') {
      throw new Error('Can only retry a failed attempt');
    }
    this._status = 'SUBMITTED';
    this._failureReason = undefined;
    this._updatedAt = new Date();
  }
}
