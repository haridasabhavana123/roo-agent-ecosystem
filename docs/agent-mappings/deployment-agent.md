# Deployment Agent → Canonical State Mapping

## Purpose

This document defines how the Deployment Agent reads from and writes to
the canonical state model.

The Deployment Agent is responsible for deploying tested artifacts
to target environments and recording deployment metadata.

---

## Preconditions (Required State)

The Deployment Agent MAY run only if:

```yaml
metadata:
  currentPhase: deploy
tests:
  status: passed
governance:
  approvals:
    tests: true
```

## Inputs (Read-Only)

The Deployment Agent reads:

- serviceDomain
- architecture
- design
- code
- tests
- metadata.currentPhase

The agent MUST NOT modify these fields.

## Outputs (Write Scope)

The Deployment Agent is allowed to write ONLY to:
```yaml
deployment:
  status
  environments
  artifacts
```
It MUST NOT write to:
- architecture
- design
- code
- tests

## State Updates Performed

On successful completion, the agent MUST update the canonical state as follows:
```yaml
deployment:
  status: completed
  environments:
    - name: <environment-name>     # dev | test | uat | prod
      url: <endpoint-url>
      version: <deployed-version>
  artifacts:
    - name: <artifact-name>
      type: container | binary
      location: <registry-or-storage-path>
```

## Governance Updates

If human review is required and approved:
```yaml
governance:
  approvals:
    deployment: true
```
## Phase Completion Signal

When all of the following are true:

- deployment.status == completed
- governance.approvals.deployment == true

Then the orchestrator MAY mark the workflow as complete:
```yaml
metadata:
  status: completed
```
The Deployment Agent itself MUST NOT change `metadata.currentPhase`
or `metadata.status`.
These updates are controlled by the orchestrator.
---