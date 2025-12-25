# Golden C4 Validation Rules

## Purpose
Ensure generated C4 diagrams align with Golden Reference diagrams.

---

## Validation Inputs
- Generated diagram (Mermaid)
- Golden reference diagram
- Blueprint source

---

## Validation Criteria

### Structural Alignment
- Same primary system boundary
- Same category of external actors
- No missing critical systems

### Naming Consistency
- Business terminology preferred
- No technology bias unless stated

### Relationship Integrity
- Direction of interactions must match intent
- No unexplained connections

---

## Failure Handling
If misalignment is detected:
1. Explain the difference
2. Propose corrections
3. Ask for user confirmation
4. Regenerate diagram if approved

---

## Non-Negotiable Rule
Golden reference always overrides generated output.
