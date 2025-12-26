import fs from "fs";
import path from "path";
import * as YAML from "yaml";
import { CanonicalState } from "../../types/state";

const STATE_FILE_PATH = path.resolve(
  process.cwd(),
  "state",
  "canonical-state.yaml"
);

export function loadState(): CanonicalState {
  if (!fs.existsSync(STATE_FILE_PATH)) {
    throw new Error(`Canonical state file not found at ${STATE_FILE_PATH}`);
  }

  const raw = fs.readFileSync(STATE_FILE_PATH, "utf-8");
  const parsed = YAML.parse(raw);

  return parsed as CanonicalState;
}

export function saveState(state: CanonicalState): void {
  const yaml = YAML.stringify(state);
  fs.writeFileSync(STATE_FILE_PATH, yaml, "utf-8");
}
