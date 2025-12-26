// types/state.ts

export type Phase =
  | "architecture"
  | "design"
  | "code"
  | "test"
  | "deploy";

export type ExecutionStatus =
  | "in-progress"
  | "blocked"
  | "completed";

export interface CanonicalState {
  metadata: {
    stateVersion?: string;
    createdAt?: string;
    updatedAt?: string;
    currentPhase: Phase;
    status: ExecutionStatus;
  };

  serviceDomain: {
    name: string;
    description?: string;
    version?: string;
  };

  architecture: {
    blueprint?: {
      path: string;
      approved: boolean;
      assumptions?: Array<{
        id: string;
        description: string;
      }>;
    };
    diagrams?: {
      context?: { path: string; approved: boolean };
      container?: { path: string; approved: boolean };
      component?: { path: string; approved: boolean };
    };
  };

  design: {
    status: "not-started" | "in-progress" | "approved";
    decisions: any[];
    interfaces: any[];
  };

  code: {
    status: "not-started" | "completed";
    repositories: any[];
    modules: any[];
  };

  tests: {
    status: "not-started" | "passed" | "failed";
    testSuites: any[];
    coverage: {
      percentage: number;
    };
  };

  deployment: {
    status: "not-started" | "completed";
    environments: any[];
    artifacts: any[];
  };

  governance: {
    approvals: {
      architecture?: boolean;
      design?: boolean;
      code?: boolean;
      tests?: boolean;
      deployment?: boolean;
    };
    blockedReason?: string | null;
  };
}
