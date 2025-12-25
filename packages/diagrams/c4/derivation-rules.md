# C4 Diagram Derivation Rules

## Purpose
Define how the agent derives C4 diagrams from an architecture blueprint.

---

## General Rule
The agent MUST derive diagrams from the blueprint.
It must NOT invent elements not described or clearly implied.

---

## Context Diagram Derivation (C4 Level 1)

### Extract:
- Primary system under design
- External users or actors
- External systems explicitly mentioned

### Ignore:
- Internal components
- Databases
- Technical details

### Output:
- One box for the service domain
- Boxes for users and external systems
- High-level directional relationships

---

## Container Diagram Derivation (C4 Level 2)

### Extract:
- APIs
- Services
- Databases
- Event mechanisms
- Integration points

### Rules:
- Each container has one clear responsibility
- Containers belong inside the service domain boundary

---

## Component Diagram Derivation (C4 Level 3)

### Extract:
- Logical responsibilities inside a container
- Business-focused components (not classes)
- Coordination, validation, persistence roles

### Rules:
- No technology-specific classes
- Focus on responsibility, not implementation

---

## Assumptions
If required structure is missing:
- Mark assumptions
- Ask for user confirmation
- Do NOT silently fill gaps
