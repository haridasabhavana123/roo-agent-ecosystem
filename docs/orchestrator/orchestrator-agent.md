# Orchestrator Agent

## Purpose

The Orchestrator Agent coordinates the execution of all agents in the
agent ecosystem based on the canonical state model.

It is responsible for:
- enforcing agent execution order
- validating preconditions
- triggering agent execution
- managing phase transitions
- enforcing governance rules

The Orchestrator Agent does NOT produce domain artifacts.

---

## Inputs

The Orchestrator Agent reads:

- the full canonical state
- agent mapping contracts from `docs/agent-mappings/`

---

## Authority

The Orchestrator Agent is the ONLY component allowed to:

- change `metadata.currentPhase`
- mark phases as complete
- block progression due to governance or validation failures

---

## Orchestration Logic

The orchestrator evaluates the canonical state and determines
which agent may be invoked.

### Phase → Agent Mapping

| Phase | Agent |
|------|-------|
| architecture | Architecture Agent |
| design | Design Agent |
| code | Code Agent |
| test | Test Agent |
| deploy | Deployment Agent |

---

## Execution Rules

1. The orchestrator MUST read `metadata.currentPhase`
2. Only the agent mapped to the current phase MAY be invoked
3. Preconditions defined in the agent’s mapping MUST be validated
4. Agents attempting to write outside their allowed scope MUST be rejected
5. Phase transitions occur ONLY after success and approval checks

---

## Phase Transition Rules

The orchestrator MAY advance `metadata.currentPhase` only if:

- the active agent reports success
- all required artifacts are present
- governance approvals for the phase are satisfied

### Example (Architecture → Design)

```yaml
IF
  architecture.blueprint.approved == true
  AND all architecture.diagrams.*.approved == true
  AND governance.approvals.architecture == true
THEN
  metadata.currentPhase = design

```

## UI Interaction Model

The orchestrator exposes the following information to the UI:

- current phase
- completed phases
- blocked reasons
- available next actions
- agent execution status

The UI MUST NOT invoke agents directly.
All execution requests go through the orchestrator.

## Blocking and Error Handling

The orchestrator MUST block progression if:

- agent execution fails
- state validation fails
- governance approval is missing

Blocked reasons MUST be written to:

```yaml
governance:
  blockedReason: <description>

```


