import { CanonicalState } from "../../../types/state";

export async function runCodeAgent(
  state: CanonicalState
): Promise<CanonicalState> {
  const updatedState: CanonicalState = structuredClone(state);

  updatedState.code = {
    status: "completed",
    repositories: [
      {
        name: "customer-management-service",
        path: "repos/customer-management",
        language: "typescript",
        buildTool: "npm",
      },
    ],
    modules: [
      {
        name: "customer-core",
        description: "Core customer management logic",
        relatedInterfaces: ["CustomerAPI"],
      },
    ],
  };

  return updatedState;
}
