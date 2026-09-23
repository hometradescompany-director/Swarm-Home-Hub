import type { AgentReference } from "../domain/agent.js";
import type { ResidenceId } from "../domain/residence.js";
import type { TypedAbsence } from "../provenance/absence.js";
import type { CurrentReadyHandoffCapsule } from "../query/ready-handoff.js";
import type { ReadyHandoffAttempt } from "../service/ready-handoff-service.js";

export interface ContinuationTask<TPayload = unknown> {
  readonly taskRef: string;
  readonly residenceId: ResidenceId;
  readonly agent: AgentReference;
  readonly payload: TPayload;
}

export interface ReadyHandoffIssuer {
  attempt(
    residenceId: ResidenceId,
    agent: AgentReference,
    generatedAt: string
  ): Promise<ReadyHandoffAttempt>;
}

export interface ContinuationExecutionContext<TPayload = unknown> {
  readonly task: ContinuationTask<TPayload>;
  readonly handoff: CurrentReadyHandoffCapsule;
  readonly startedAt: string;
}

export interface ContinuationExecutor<TPayload = unknown, TResult = unknown> {
  execute(context: ContinuationExecutionContext<TPayload>): Promise<TResult>;
}

interface ContinuationPulseBase {
  readonly taskRef: string;
  readonly residenceId: ResidenceId;
  readonly observedAt: string;
}

export type ContinuationPulse<TResult = unknown> =
  | (ContinuationPulseBase & {
      readonly state: "blocked";
      readonly absence: TypedAbsence;
    })
  | (ContinuationPulseBase & {
      readonly state: "running";
      readonly handoff: CurrentReadyHandoffCapsule;
    })
  | (ContinuationPulseBase & {
      readonly state: "completed";
      readonly handoff: CurrentReadyHandoffCapsule;
      readonly result: TResult;
    })
  | (ContinuationPulseBase & {
      readonly state: "failed";
      readonly handoff: CurrentReadyHandoffCapsule;
      readonly error: string;
    });

export type ContinuationObserver<TResult = unknown> = (
  pulse: ContinuationPulse<TResult>
) => void;

export interface ResidentContinuationBridgeOptions<TResult = unknown> {
  readonly clock?: () => string;
  readonly observe?: ContinuationObserver<TResult>;
}

function assertTimestamp(value: string): void {
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error("continuation clock must return a valid ISO-8601 value");
  }
}

function assertTask(taskRef: string): void {
  if (taskRef.trim().length === 0) {
    throw new Error("continuation taskRef must not be empty");
  }
}

/**
 * Bridges a currently-ready Swarm residence into one bounded host execution.
 *
 * The bridge deliberately does not own a task queue, model session, scheduler,
 * provider credential, or long-running loop. A host supplies those concerns and
 * repeatedly invokes runOnce. This keeps residence truth in the event journal
 * while still giving hosts a real wake/execute/pulse seam.
 */
export class ResidentContinuationBridge<TPayload = unknown, TResult = unknown> {
  readonly #clock: () => string;
  readonly #observe: ContinuationObserver<TResult> | undefined;

  constructor(
    private readonly handoffs: ReadyHandoffIssuer,
    private readonly executor: ContinuationExecutor<TPayload, TResult>,
    options: ResidentContinuationBridgeOptions<TResult> = {}
  ) {
    this.#clock = options.clock ?? (() => new Date().toISOString());
    this.#observe = options.observe;
  }

  async runOnce(task: ContinuationTask<TPayload>): Promise<ContinuationPulse<TResult>> {
    assertTask(task.taskRef);

    const startedAt = this.#clock();
    assertTimestamp(startedAt);

    const attempt = await this.handoffs.attempt(
      task.residenceId,
      task.agent,
      startedAt
    );

    if (!attempt.created) {
      const blocked: ContinuationPulse<TResult> = {
        state: "blocked",
        taskRef: task.taskRef,
        residenceId: task.residenceId,
        observedAt: startedAt,
        absence: attempt.absence
      };
      this.#observe?.(blocked);
      return blocked;
    }

    const running: ContinuationPulse<TResult> = {
      state: "running",
      taskRef: task.taskRef,
      residenceId: task.residenceId,
      observedAt: startedAt,
      handoff: attempt.handoff
    };
    this.#observe?.(running);

    try {
      const result = await this.executor.execute({
        task,
        handoff: attempt.handoff,
        startedAt
      });
      const completedAt = this.#clock();
      assertTimestamp(completedAt);

      const completed: ContinuationPulse<TResult> = {
        state: "completed",
        taskRef: task.taskRef,
        residenceId: task.residenceId,
        observedAt: completedAt,
        handoff: attempt.handoff,
        result
      };
      this.#observe?.(completed);
      return completed;
    } catch (error) {
      const failedAt = this.#clock();
      assertTimestamp(failedAt);

      const failed: ContinuationPulse<TResult> = {
        state: "failed",
        taskRef: task.taskRef,
        residenceId: task.residenceId,
        observedAt: failedAt,
        handoff: attempt.handoff,
        error: error instanceof Error ? error.message : "continuation executor failed"
      };
      this.#observe?.(failed);
      return failed;
    }
  }
}
