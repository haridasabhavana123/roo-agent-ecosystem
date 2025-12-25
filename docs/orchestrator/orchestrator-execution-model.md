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



---

## 3. Blocked State Semantics
A blocked state represents a controlled pause in execution.

When the system is blocked:
- no agent may run
- no phase transitions may occur
- the current phase remains unchanged
- the system awaits external intervention

Blocked state is not an error condition.
It is an intentional mechanism for governance, safety, and recovery.
### 3.1 Blocked State Representation

The blocked state is represented explicitly in the canonical state model.

```yaml
metadata:
  status: blocked
governance:
  blockedReason: <human-readable explanation>
```
This is **the only valid representation** of a block.

---
### 3.2 Causes of Blocking

The Orchestrator MUST transition the system to blocked state
when any of the following occur:

- agent preconditions are not satisfied
- an agent attempts to write outside its allowed scope
- required artifacts are missing or invalid
- required governance approval is missing
- an invalid phase transition is attempted
- agent execution fails unexpectedly

### 3.3 Behavior While Blocked

While `metadata.status == blocked`:

- the Orchestrator MUST NOT invoke any agent
- the Orchestrator MUST NOT advance phases
- the Orchestrator MUST NOT retry execution automatically
- the Orchestrator MAY expose the blocked state to a UI or API

The system remains idle until an explicit resume action is performed.

### 3.4 Resume Semantics

Resuming execution from a blocked state requires explicit external action.

To resume:
- the blocking condition MUST be resolved
- the Orchestrator MUST clear `governance.blockedReason`
- the Orchestrator MUST set `metadata.status` to `in-progress`

Resumption does NOT change the current phase.
Execution resumes from the same phase that was blocked.

### 3.5 Retry and Manual Intervention

Blocked states may be resolved by:
- human approval
- configuration correction
- artifact regeneration
- policy override

The Orchestrator does not distinguish between retry and manual fix.
It relies solely on the canonical state to determine readiness to resume.


---

## 4. Orchestrator Execution Cycle

The Orchestrator operates as a continuous evaluation loop.

In each cycle, it:
- reads the canonical state
- determines whether execution may proceed
- validates conditions for the active phase
- invokes exactly one agent (if permitted)
- validates results and governance
- advances the phase, blocks, or completes execution

The Orchestrator never assumes agent correctness.
All outcomes are validated against the canonical state.

### 4.1 Main Execution Loop (Pseudocode)
```
while true:

load canonical state

if metadata.status == completed:
terminate execution

if metadata.status == blocked:
wait for external resume action
continue

determine active phase from metadata.currentPhase
resolve corresponding agent for the phase

if preconditions for the agent are not satisfied:
block execution with reason
continue

invoke the agent with the current canonical state

if agent writes outside its allowed scope:
block execution with reason
continue

if required outputs for the phase are missing or invalid:
block execution with reason
continue

if required governance approval is missing:
block execution with reason
continue

if current phase is deploy:
mark metadata.status as completed
persist state
terminate execution

advance to the next phase
persist state
```
### 4.2 Preconditions Evaluation

Before invoking an agent, the Orchestrator MUST verify that
all phase-specific preconditions are satisfied.

Preconditions are defined in the agent’s canonical state mapping
and MAY include:

- current phase match
- prior artifacts approved
- required governance approvals present

Failure to satisfy any precondition MUST result in blocked state.

### 4.3 Agent Invocation Rules

During each execution cycle:

- exactly one agent MAY be invoked
- the agent MUST be the one mapped to the active phase
- agents are invoked as black boxes
- agents receive the canonical state as input
- agents may modify only their allowed write scope

The Orchestrator MUST NOT trust agents to enforce these rules.


### 4.4 Output and Governance Validation

After agent execution, the Orchestrator MUST validate:

- only allowed state fields were modified
- required artifacts are present and valid
- required governance approvals are recorded

Any validation failure MUST result in blocked state.

### 4.5 Phase Advancement and Completion

If all validations succeed:

- the Orchestrator advances to the next phase
- execution continues in the next cycle

If the active phase is `deploy` and validations succeed:

- the Orchestrator MUST set `metadata.status` to `completed`
- no further execution cycles occur



