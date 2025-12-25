### ✅ **FINAL — `docs/state-model.md` (VERIFIED)**

```md
# Canonical State Model

## Purpose

This document defines the canonical, shared state structure used by all agents
in the agent ecosystem.

The canonical state is the single source of truth for:
- agent orchestration
- agent inputs and outputs
- human approval checkpoints
- resumability and auditability

All agents MUST read from and write to this state model.
No agent may introduce state outside this structure.

---

## Top-Level State Structure

The canonical state is divided into the following sections:

- metadata
- serviceDomain
- architecture
- design
- code
- tests
- deployment
- governance

Each section is owned by one or more agents and evolves incrementally.

---

## metadata

Tracks lifecycle, ownership, and orchestration status.

```yaml
metadata:
  stateVersion: "1.0"
  createdAt: "<timestamp>"
  updatedAt: "<timestamp>"
  currentPhase: architecture   # architecture | design | code | test | deploy
  status: in-progress           # in-progress | blocked | completed
```

## serviceDomain
Defines the domain being worked on.
This section is immutable once set.
```yaml
serviceDomain:
  name: "Customer Management"
  description: "BIAN Customer Management service domain"
  version: "v1"
```

## architecture
Owned by: Architecture Agent
```yaml
architecture:
  blueprint:
    path: runs/golden-customer-management/blueprint.md
    approved: true
    assumptions:
      - id: A1
        description: "Customer is treated as Party"
  diagrams:
    context:
      path: packages/diagrams/generated/customer-management-context.mmd
      approved: true
    container:
      path: packages/diagrams/generated/customer-management-container.mmd
      approved: true
    component:
      path: packages/diagrams/generated/customer-management-component.mmd
      approved: true
```


## design
Owned by: Design Agent

```yaml
design:
  status: not-started           # not-started | in-progress | approved
  decisions: []
  interfaces: []
```

## code
Owned by: Code Agent

```yaml
code:
  status: not-started
  repositories: []
  modules: []
```


## tests
Owned by: Test Agent
```yaml
tests:
  status: not-started
  testSuites: []
  coverage:
    percentage: 0
```

## deployment
Owned by: Deployment Agent

```yaml
deployment:
  status: not-started
  environments: []
  artifacts: []
```

## governance
Tracks human approvals and policy enforcement.

```yaml
governance:
  approvals:
    architecture: true
    design: false
    code: false
    deployment: false
  blockedReason: null
```


## Governance Rules

Each agent may write only to sections it owns
Agents must not overwrite other sections
Phase transitions are controlled by the orchestrator
Human approvals gate progression
Stability Guarantee

This file is the backbone of the agent ecosystem.
Changes to this file MUST be intentional, versioned, and rare.
