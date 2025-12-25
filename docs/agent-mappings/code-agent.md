# Code Agent → Canonical State Mapping

## Purpose

This document defines how the Code Agent reads from and writes to
the canonical state model.

The Code Agent is responsible for producing implementation artifacts
(source code and buildable modules) based on approved designs.

---

## Preconditions (Required State)

The Code Agent MAY run only if:

```yaml
metadata:
  currentPhase: code
design:
  status: approved
governance:
  approvals:
    design: true
```

## Inputs (Read-Only)

The Code Agent reads:

- serviceDomain
- architecture
- design
- metadata.currentPhase

The agent MUST NOT modify these fields.


## Outputs (Write Scope)

The Code Agent is allowed to write ONLY to:
```yaml
code:
  status
  repositories
  modules
```
It MUST NOT write to:

- architecture
- design
- tests
- deployment


## State Updates Performed

On successful completion, the agent MUST update the canonical state as follows:
```yaml
code:
  status: completed
  repositories:
    - name: <repository-name>
      path: <repo-path>
      language: <language>
      buildTool: <maven | gradle | npm | etc>
  modules:
    - name: <module-name>
      description: <what this module implements>
      relatedInterfaces:
        - <interface-name>
```

## Governance Updates

If human review is required and approved:

```yaml
governance:
  approvals:
    code: true
```
## Phase Transition Signal

When all of the following are true:

- code.status == completed
- governance.approvals.code == true

Then the agent MAY signal:
```yaml
metadata:
  currentPhase: test
```
The Code Agent itself MUST NOT change `metadata.currentPhase`.
This transition is controlled by the orchestrator.

---