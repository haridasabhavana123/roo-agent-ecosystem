import { loadState, saveState } from "./state-store";
import { runArchitectureAgent } from "../agents/architecture/architecture-agent";
//import { validateAgentWriteScope } from "./validators"; 
import { validateAgentWriteScope } from "./validators"; 
import { Phase } from "../../types/state";
import { log } from "./logger";
import { runDesignAgent } from "../agents/design/design-agent";
import { runCodeAgent } from "../agents/code/code-agent";
import { runTestAgent } from "../agents/test/test-agent";
import { runDeploymentAgent } from "../agents/deployment/deployment-agent";


import {
  validatePreconditions,
  validateTransitionGuards,
} from "./validators";
import { CanonicalState } from "../../types/state";

function resolveAgent(phase: Phase) {
  switch (phase) {
    case "architecture":
      return runArchitectureAgent;
       case "design":
      return runDesignAgent;
      case "code":
      return runCodeAgent;
      case "test":
      return runTestAgent;
       case "deploy":
      return runDeploymentAgent;
    default:
      throw new Error(`No agent registered for phase: ${phase}`);
  }
}


export async function runOrchestrator(): Promise<void> {
  let state: CanonicalState;

  try {
    // 1. Load canonical state
    state = loadState();
   
     log({
        level: "INFO",
        action: "orchestrator_start",
        phase: state.metadata.currentPhase,
        message: "Orchestrator execution started",
      });
    
    // 2. Terminal state check
    if (state.metadata.status === "completed") {
      return;
    }

    // 3. Blocked state check
    if (state.metadata.status === "blocked") {
      return;
    }

    // 4. Validate preconditions for current phase
    validatePreconditions(state);

 // 5. Invoke agent for current phase
const agent = resolveAgent(state.metadata.currentPhase);

   log({
        level: "INFO",
        action: "agent_invocation",
        phase: state.metadata.currentPhase,
        message: "Orchestrator execution started",
      });

const updatedState = await agent(state);

// 5.1 Validate agent write scope
validateAgentWriteScope(
  state,
  updatedState,
  state.metadata.currentPhase
);

// 5.2 Persist updated state
saveState(updatedState);

// IMPORTANT: from this point on, use updatedState
state = updatedState;

state.governance = state.governance || {};
state.governance.approvals = {
  ...state.governance.approvals,
  design: true,
};

console.log("Current phase:", state.metadata.currentPhase);


    // 6. Validate transition guards
    validateTransitionGuards(state);

    // 7. Advance phase or complete execution
    advancePhase(state);

    // 8. Persist canonical state
    saveState(state);
  } catch (error: any) {
    // 9. Block execution on any failure
    state = loadState();
    state.metadata.status = "blocked";
    state.governance = state.governance || {};
    state.governance.blockedReason = error.message;
    log({
      level: "ERROR",
      action: "orchestration_blocked",
      phase: state.metadata.currentPhase,
      message: error.message,
    });

    saveState(state);
    console.log("Current phase:", state.metadata.currentPhase);

  }
}
function advancePhase(state: CanonicalState): void {
  const phaseOrder: Phase[] = ["architecture", "design", "code", "test", "deploy"];
  const current = state.metadata.currentPhase;

  const index = phaseOrder.indexOf(current);

  if (index === -1) {
    throw new Error(`Unknown phase '${current}'`);
  }

  if (current === "deploy") {
    log({
      level: "INFO",
      action: "workflow_completed",
      phase: current,
      message: "Orchestration completed successfully",
    });

    state.metadata.status = "completed";
    return;
  }
  log({
  level: "INFO",
  action: "phase_transition",
  phase: state.metadata.currentPhase,
  message: `Advancing to next phase`,
  details: {
    from: state.metadata.currentPhase,
    to: phaseOrder[index + 1],
  },
});

  state.metadata.currentPhase = phaseOrder[index + 1];
}

// Temporary entrypoint for manual execution
if (require.main === module) {
  runOrchestrator().catch((err) => {
    console.error("Orchestrator failed:", err);
    process.exit(1);
  });
}
