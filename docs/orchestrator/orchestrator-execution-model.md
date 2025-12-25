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
