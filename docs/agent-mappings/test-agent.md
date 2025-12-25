# Test Agent → Canonical State Mapping

## Purpose

This document defines how the Test Agent reads from and writes to
the canonical state model.

The Test Agent is responsible for validating implemented code
through automated testing and reporting results.

---

## Preconditions (Required State)

The Test Agent MAY run only if:

```yaml
metadata:
  currentPhase: test
code:
  status: completed
governance:
  approvals:
    code: true
```
## Inputs (Read-Only)

The Test Agent reads:

- serviceDomain
- architecture
- design
- code
- metadata.currentPhase

The agent MUST NOT modify these fields.

## Outputs (Write Scope)

The Test Agent is allowed to write ONLY to:
```yaml
tests:
  status
  testSuites
  coverage
```
It MUST NOT write to:

- architecture
- design
- code
- deployment

## State Updates Performed

On successful completion, the agent MUST update the canonical state as follows:
```yaml
tests:
  status: passed
  testSuites:
    - name: <test-suite-name>
      type: unit | integration | contract
      result: passed | failed
  coverage:
    percentage: <number>
```

## Governance Updates

If human review is required and approved:
```yaml
governance:
  approvals:
    tests: true
```
## Phase Transition Signal

When all of the following are true:

- tests.status == passed
- governance.approvals.tests == true

Then the agent MAY signal:
```yaml
metadata:
  currentPhase: deploy
```
The Test Agent itself MUST NOT change `metadata.currentPhase`.
This transition is controlled by the orchestrator.
