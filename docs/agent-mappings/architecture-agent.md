# Architecture Agent → Canonical State Mapping

## Purpose
This document defines how the Architecture Agent reads from and writes to
the canonical state model.

The Architecture Agent is responsible for producing high-level architectural
artifacts for a given service domain.

---

## Preconditions (Required State)

The Architecture Agent MAY run only if:

```yaml
metadata:
  currentPhase: architecture
serviceDomain:
  name: <defined>
  
```

## Inputs (Read-Only)

The Architecture Agent reads:

- serviceDomain
- metadata.currentPhase

The agent MUST NOT modify these fields.


## Outputs (Write Scope)

The Architecture Agent is allowed to write ONLY to:
```yaml
architecture:
  blueprint
  diagrams

```
It MUST NOT write to:

- design
- code
- tests
- deployment

## State Updates Performed

On successful completion, the agent MUST:
```yaml
architecture:
  blueprint:
    path: <path>
    approved: true
  diagrams:
    context.approved: true
    container.approved: true
    component.approved: true

```
## Governance Updates

If human review is required and approved:
```yaml
governance:
  approvals:
    architecture: true

```

## Phase Transition Signal

When all of the following are true:

- architecture.blueprint.approved == true

- all architecture.diagrams.*.approved == true

- governance.approvals.architecture == true

Then the agent MAY signal:
```yaml
metadata:
  currentPhase: design

```
The Architecture Agent itself MUST NOT change `currentPhase`.
This transition is controlled by the orchestrator.

