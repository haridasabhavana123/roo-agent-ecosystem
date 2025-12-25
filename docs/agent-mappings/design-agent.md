# Design Agent → Canonical State Mapping

## Purpose

This document defines how the Design Agent reads from and writes to
the canonical state model.

The Design Agent is responsible for producing detailed design artifacts
based on an approved architecture.

These artifacts translate architectural intent into
implementation-ready specifications.

---

## Preconditions (Required State)

The Design Agent MAY run only if:

```yaml
metadata:
  currentPhase: design
architecture:
  blueprint:
    approved: true
governance:
  approvals:
    architecture: true

```

## Inputs (Read-Only)

The Design Agent reads:
- serviceDomain
- architecture
- metadata.currentPhase

The agent MUST NOT modify these fields.

## Outputs (Write Scope)

The Design Agent is allowed to write ONLY to:


```yaml
design:
  status
  decisions
  interfaces

```
It MUST NOT write to:

- architecture
- code
- tests
- deployment

## State Updates Performed

On successful completion, the agent MUST update the canonical state as follows:

```yaml
design:
  status: approved
  decisions:
    - id: D1
      description: <design decision description>
      rationale: <reasoning behind the decision>
  interfaces:
    - name: <interface name>
      type: api | event
      specification:
        openapiPath: <path-to-openapi-or-swagger-yaml>

```
## Governance Updates

If human review is required and approved:

```yaml
governance:
  approvals:
    design: true

```
## Phase Transition Signal

When all of the following are true:

- design.status == approved
- governance.approvals.design == true

Then the agent MAY signal:

```yaml
metadata:
  currentPhase: code


```

The Design Agent itself MUST NOT change metadata.currentPhase.
This transition is controlled by the orchestrator.

---


