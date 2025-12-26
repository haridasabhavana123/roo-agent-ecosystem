console.log(">>> UI SERVER FILE LOADED <<<");

import express from "express";
import { loadState, saveState } from "../orchestrator/state-store";
import { runOrchestrator } from "../orchestrator/orchestrator";

const app = express();
app.use(express.json());

app.get("/state", (_req, res) => {
  const state = loadState();
  res.json(state);
});

app.post("/approve/:phase", (req, res) => {
  const phase = req.params.phase;
  const state = loadState();

  state.governance = state.governance || {};
  state.governance.approvals = {
    ...(state.governance.approvals || {}),
    [phase]: true,
  };

  // unblock if needed
  if (state.metadata.status === "blocked") {
    state.metadata.status = "in-progress";
    state.governance.blockedReason = null;
  }

  saveState(state);
  res.json({ message: `Approved ${phase}` });
});

app.post("/run", async (_req, res) => {
  await runOrchestrator();
  res.json({ message: "Orchestrator executed" });
});

app.listen(3002, () => {
  console.log("UI server running at http://localhost:3002");
});
