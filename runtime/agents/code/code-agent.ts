import { CanonicalState } from "../../../types/state";

export async function runCodeAgent(
  state: CanonicalState
): Promise<CanonicalState> {
  return {
    ...state,

    code: {
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
          name: "CustomerController",
          description: "Handles customer API requests",
          relatedInterfaces: ["CustomerAPI"],
        },
        {
          name: "CustomerService",
          description: "Implements core customer business logic",
          relatedInterfaces: ["CustomerAPI"],
        },
      ],
    },
  };
}
