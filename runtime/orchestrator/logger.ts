export type LogLevel = "INFO" | "WARN" | "ERROR";

export interface OrchestratorLog {
  level: LogLevel;
  timestamp?: string;
  phase?: string;
  action: string;
  message: string;
  details?: Record<string, any>;
}

export function log(entry: OrchestratorLog): void {
  const output = {
    ...entry,
    timestamp: entry.timestamp ?? new Date().toISOString(),
  };

  console.log(JSON.stringify(output));
}
