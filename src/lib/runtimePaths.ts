import path from "node:path";

/**
 * 扩展 NodeJS.Process 类型，标记 pkg 属性（由 pkg 打包工具注入）。
 * 打包后 __dirname 不可靠，需改用 process.execPath 定位资源文件。
 */
type PackagedProcess = NodeJS.Process & {
  pkg?: unknown;
};

/**
 * 返回项目根目录的绝对路径。
 * - 开发模式：__dirname 位于 dist/src/lib，向上三级即为仓库根目录。
 * - 打包模式（pkg）：使用可执行文件所在目录。
 */
export function getProjectRoot(): string {
  const packagedProcess = process as PackagedProcess;
  return packagedProcess.pkg ? path.dirname(process.execPath) : path.resolve(__dirname, "..", "..", "..");
}

/** 返回 config/ 目录下指定文件的绝对路径。 */
export function getConfigPath(...segments: string[]): string {
  return path.join(getProjectRoot(), "config", ...segments);
}