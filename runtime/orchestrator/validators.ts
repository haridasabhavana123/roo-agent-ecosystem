import { CanonicalState, Phase } from "../../types/state";

const ALLOWED_WRITE_SCOPE_BY_PHASE: Record<string, string[]> = {
  architecture: ["architecture"],
  design: ["design"],
  code: ["code"],
  test: ["tests"],
  deploy: ["deployment"],
};


export function validatePreconditions(state: CanonicalState): void {
  const { metadata, governance } = state;

  // Global execution guard
  if (metadata.status !== "in-progress") {
    throw new Error(
      `Execution not allowed while status is '${metadata.status}'`
    );
  }

  const phase = metadata.currentPhase;

  switch (phase) {
    case "architecture":
      // Architecture has no prior phase dependency
      return;

    case "design":
      if (!governance?.approvals?.architecture) {
        throw new Error(
          "Design phase blocked: architecture approval missing"
        );
      }
      return;

    case "code":
      if (!governance?.approvals?.design) {
        throw new Error("Code phase blocked: design approval missing");
      }
      return;

    case "test":
      if (!governance?.approvals?.code) {
        throw new Error("Test phase blocked: code approval missing");
      }
      return;

    case "deploy":
      if (!governance?.approvals?.tests) {
        throw new Error("Deploy phase blocked: tests approval missing");
      }
      return;

    default:
      throw new Error(`Unknown phase '${phase}'`);
  }
}

export function validateTransitionGuards(state: CanonicalState): void {
  const phase = state.metadata.currentPhase;

  switch (phase) {
    case "architecture":
      if (!state.architecture?.blueprint?.approved) {
        throw new Error(
          "Cannot transition from architecture: blueprint not approved"
        );
      }
      return;

    case "design":
      if (state.design?.status !== "approved") {
        throw new Error(
          "Cannot transition from design: design not approved"
        );
      }
      return;

    case "code":
      if (state.code?.status !== "completed") {
        throw new Error(
          "Cannot transition from code: code not completed"
        );
      }
      return;

    case "test":
      if (state.tests?.status !== "passed") {
        throw new Error(
          "Cannot transition from test: tests not passed"
        );
      }
      return;

    case "deploy":
      if (state.deployment?.status !== "completed") {
        throw new Error(
          "Cannot transition from deploy: deployment not completed"
        );
      }
      return;

    default:
      throw new Error(`Unknown phase '${phase}'`);
  }
}
export function validateAgentWriteScope(
  before: CanonicalState,
  after: CanonicalState,
  phase: Phase
): void {
  //const phase = before.metadata.currentPhase;
  const allowedRoots = ALLOWED_WRITE_SCOPE_BY_PHASE[phase];

  if (!allowedRoots) {
    throw new Error(`No write scope defined for phase '${phase}'`);
  }

  const changedRoots = new Set<string>();

  for (const key of Object.keys(after)) {
    const beforeValue = (before as any)[key];
    const afterValue = (after as any)[key];

    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changedRoots.add(key);
    }
  }

  for (const changed of changedRoots) {
    if (
      changed === "metadata" ||
      changed === "governance" ||
      !allowedRoots.includes(changed)
    ) {
      throw new Error(
        `Illegal state modification detected: '${changed}' modified during '${phase}' phase`
      );
    }
  }
}
