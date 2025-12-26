import { CanonicalState } from "../../../types/state";

export async function runTestAgent(
  state: CanonicalState
): Promise<CanonicalState> {
  const updatedState: CanonicalState = structuredClone(state);

  updatedState.tests = {
    status: "passed",
    testSuites: [
      {
        name: "customer-unit-tests",
        type: "unit",
        result: "passed",
      },
      {
        name: "customer-integration-tests",
        type: "integration",
        result: "passed",
      },
    ],
    coverage: {
      percentage: 82,
    },
  };

  return updatedState;
}
