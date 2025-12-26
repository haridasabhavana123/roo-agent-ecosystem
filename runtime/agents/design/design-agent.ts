import { CanonicalState } from "../../../types/state";

export async function runDesignAgent(
  state: CanonicalState
): Promise<CanonicalState> {
  return {
    ...state,
    design: {
      status: "approved",
      decisions: [],
      interfaces: [],
    },
    
  };
}
