import { CanonicalState } from "../../../types/state";
import * as fs from "fs";
import * as path from "path";

export async function runArchitectureAgent(
  state: CanonicalState
): Promise<CanonicalState> {
  // 1. Deep clone state
  const nextState: CanonicalState = JSON.parse(JSON.stringify(state));

  // 2. Define blueprint file path
  const blueprintPath = `runs/${state.serviceDomain.name
    .toLowerCase()
    .replace(/\s+/g, "-")}/blueprint.md`;

  const absolutePath = path.resolve(blueprintPath);

  // 3. Ensure directory exists
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

  // 4. Write minimal blueprint content
  const blueprintContent = `# ${state.serviceDomain.name} Architecture Blueprint

## Overview
High-level BIAN-aligned architecture for the ${state.serviceDomain.name} service domain.

## Principles
- BIAN Service Domain alignment
- Clear domain boundaries
- API-first integration

## Scope
This blueprint defines the architectural baseline for downstream design and implementation.
`;

  fs.writeFileSync(absolutePath, blueprintContent, "utf-8");

  // 5. Update canonical state (REFERENCE ONLY)
  nextState.architecture = {
    blueprint: {
      path: blueprintPath,
      approved: true,
    },
    diagrams: {},
  };

  return nextState;
}
