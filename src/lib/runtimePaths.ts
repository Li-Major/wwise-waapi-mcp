import path from "node:path";

type PackagedProcess = NodeJS.Process & {
  pkg?: unknown;
};

export function getProjectRoot(): string {
  const packagedProcess = process as PackagedProcess;
  return packagedProcess.pkg ? path.dirname(process.execPath) : path.resolve(__dirname, "..", "..", "..");
}

export function getConfigPath(...segments: string[]): string {
  return path.join(getProjectRoot(), "config", ...segments);
}

export function getReferencePath(...segments: string[]): string {
  return path.join(getProjectRoot(), "reference", "WAAPI", ...segments);
}