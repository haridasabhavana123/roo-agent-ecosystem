# Orchestrator Execution Model

## Purpose

This document defines the authoritative execution model for the Orchestrator.

It specifies:
- how the system progresses through lifecycle phases
- which agent may run at any given time
- how blocking, governance, and recovery are handled
- how completion is determined

This document is implementation-agnostic and serves as the
single source of truth for orchestrator behavior.

---

## 1. Canonical Phase State Machine

The system lifecycle is defined as a fixed sequence of phases:

architecture → design → code → test → deploy → completed

This sequence is treated as a finite state machine (FSM),
where each phase represents a distinct unit of work
owned by a single agent.

---

### 1.1 State Representation

The state machine is represented explicitly in the canonical state model.

```yaml
metadata:
  currentPhase: architecture | design | code | test | deploy
  status: in-progress | blocked | completed
```
### 1.2 Meaning of State Fields

- `currentPhase`

	- Identifies the active lifecycle phase
	- Determines which agent is allowed to run
	- MUST be one of the predefined phases
- `status`
	- Controls whether execution may proceed
	- Possible values:
		- in-progress → normal execution allowed
		- blocked → execution paused, waiting for intervention
		- completed → lifecycle finished

The separation of these fields is intentional and critical.

### 1.3 Orchestrator Authority Rule

The Orchestrator is the ONLY component allowed to:

- change `metadata.currentPhase`
- change `metadata.status`

No agent may directly modify these fields.


---

## 2. Valid Phase Transitions
A phase transition represents the Orchestrator advancing the system
from one lifecycle phase to the next.

Transitions are:
- explicit
- guarded by conditions
- executed ONLY by the Orchestrator

Agents may signal readiness, but they may NOT perform transitions.

### 2.1 Phase Transition Table

| From Phase     | To Phase   | Required Conditions |
|---------------|------------|---------------------|
| architecture  | design     | Architecture artifacts approved and governance approval granted |
| design        | code       | Design artifacts approved and governance approval granted |
| code          | test       | Code artifacts completed and governance approval granted |
| test          | deploy     | Tests passed and governance approval granted |
| deploy        | completed  | Deployment completed and governance approval granted |

### 2.2 Transition Guard Conditions

A transition is permitted only if ALL required conditions evaluate to true
based on the canonical state.

The following guards apply:


#### Architecture → Design

- `architecture.blueprint.approved == true`
- All architecture diagrams approved
- `governance.approvals.architecture == true`

#### Design → Code

- `design.status == approved`
- `governance.approvals.design == true`

#### Code → Test

- `code.status == completed`
- `governance.approvals.code == true`

#### Test → Deploy

- `tests.status == passed`
- `governance.approvals.tests == true`

#### Deploy → Completed

- `deployment.status == completed`
- `governance.approvals.deployment == true`

Each bullet is a hard gate.

### 2.3 Invalid Transitions

The following are explicitly forbidden:

- Skipping phases
- Moving backward to a previous phase
- Transitioning while `metadata.status == blocked`
- Transitioning without required governance approval
- Agents directly modifying `metadata.currentPhase`

Any attempt to perform an invalid transition MUST result in the
Orchestrator setting the system to `blocked` status.

### 2.4 Transition Failure Handling

If a transition guard condition fails:

- The phase MUST remain unchanged
- `metadata.status` MUST be set to `blocked`
- `governance.blockedReason` MUST be populated with a human-readable explanation

The system may only resume when the blocking condition is resolved
and the Orchestrator explicitly resumes execution.


