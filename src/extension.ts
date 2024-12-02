import path from "path";
import fs, { mkdirSync, writeFileSync } from "fs";
import { window, workspace, ExtensionContext, ExtensionMode } from "vscode";

import {
  Executable,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";
import { execSync } from "child_process";

const SERVER_VERSION = "v0.1.0-beta.4";
const SERVER_DOWNLOAD_URL = `https://github.com/kelly-lin/12d-lang-server-dist/releases/download/${SERVER_VERSION}/12dls.exe`;

let client: LanguageClient;

/**
 * Download the server to provided bin path.
 */
async function downloadServer(binPath: string): Promise<void> {
  const res = await fetch(SERVER_DOWNLOAD_URL);
  if (!res.ok) {
    throw new Error(
      `failed to download language server: status ${res.status}, ${res.body}`
    );
  }
  const buf = await res.arrayBuffer();
  mkdirSync(path.dirname(binPath), { recursive: true });
  writeFileSync(binPath, Buffer.from(buf));
}

/**
 * Returns the default server binary directory for the given platform. Throws an
 * error if the default directory could not be obtained. This can happen if
 * dependent environment variables are unset.
 */
function getDefaultBinDir(platform: "windows" | "unix"): string {
  if (platform == "windows") {
    if (process.env.SYSTEMDRIVE) {
      return path.join(process.env.SYSTEMDRIVE, "12dls");
    }
    throw new Error("could not get system drive environment variable");
  }
  if (platform == "unix") {
    if (process.env.HOME) {
      return path.join(process.env.HOME, ".local", "bin");
    }
    throw new Error("could not get home environment variable");
  }
  throw new Error("unsupported platform");
}

/**
 * Append binary name to the provided directory path for the given platform.
 */
function appendBinFilename(dir: string, platform: "windows" | "unix"): string {
  return path.join(dir, platform === "windows" ? "12dls.exe" : "12dls");
}

/**
 * Downloads the server on production builds if the binary located at bin path
 * does not exist or is out of date.
 */
function shouldDownloadServer(binPath: string): boolean {
  if (!fs.existsSync(binPath)) {
    return true;
  }
  const currentVersion = execSync(`${binPath} -v`, {
    encoding: "utf8",
  }).trim();
  return currentVersion !== SERVER_VERSION;
}

export async function activate(context: ExtensionContext): Promise<void> {
  const wsConfig = workspace.getConfiguration("12dpl");
  const platform = process.platform === "win32" ? "windows" : "unix";
  let binDir = "";
  try {
    binDir =
      wsConfig.get<string>("serverBinDirectory") || getDefaultBinDir(platform);
  } catch (e: any) {
    window.showErrorMessage(e.message);
    return;
  }
  const binPath = appendBinFilename(binDir, platform);
  const isProd = context.extensionMode === ExtensionMode.Production;
  if (isProd && shouldDownloadServer(binPath)) {
    try {
      await downloadServer(binPath);
    } catch (e: any) {
      window.showErrorMessage(e.message);
      return;
    }
  }
  if (!fs.existsSync(binPath)) {
    window.showErrorMessage(`no language server binary found at ${binPath}`);
    return;
  }
  const includesDir = wsConfig.get<string>("includesDir") ?? "";
  if (!fs.existsSync(includesDir)) {
    window.showWarningMessage(
      `the configured/default includes directory ${includesDir} does not exist, `
    );
  }
  const logFilepath = wsConfig.get<string>("debug.logFilepath") ?? "";
  const args = [];
  if (logFilepath) args.push("-l", logFilepath);
  if (includesDir) args.push("-i", includesDir);
  const executable: Executable = {
    command: binPath,
    args,
  };
  const serverOptions: ServerOptions = {
    run: executable,
    debug: executable,
  };
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "12dpl" }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };
  client = new LanguageClient(
    "12dls",
    "12d Language Server",
    serverOptions,
    clientOptions
  );
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
