import path from "path";
import fs, { mkdirSync, writeFileSync } from "fs";
import { window, workspace, ExtensionContext, ExtensionMode } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";
import { execSync } from "child_process";

const SERVER_VERSION = "0.1.0-beta";
const SERVER_DOWNLOAD_URL = `https://github.com/kelly-lin/12d-lang-server/releases/download/v${SERVER_VERSION}/12dls.exe`;

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

function getBinDir(platform: "windows"): string | undefined {
  if (platform == "windows") {
    if (process.env.SYSTEMDRIVE) {
      return path.join(process.env.SYSTEMDRIVE, "12dls");
    }
  }
  // TODO: support linux.
  // if (platform == "linux") {
  //   if (process.env.HOME) {
  //     return path.join(process.env.HOME, ".local", "bin");
  //   }
  // }
}

function getDefaultBinPath(platform: "windows"): string | undefined {
  const binDir = getBinDir(platform);
  if (!binDir) {
    return;
  }
  const binName = platform == "windows" ? "12dls.exe" : "12dls";
  return path.join(binDir, binName);
}

let client: LanguageClient;

/**
 * Downloads the server on production builds if the binary located at binPath
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
  // TODO: support linux.
  // const platform = process.platform === "win32" ? "windows" : "linux";
  const platform = "windows";
  const binPath = getDefaultBinPath(platform);
  if (!binPath) {
    window.showErrorMessage(
      "server bin path is unset and could not get default bin path"
    );
    return;
  }
  const isProd = context.extensionMode === ExtensionMode.Production;
  if (isProd && shouldDownloadServer(binPath)) {
    try {
      await downloadServer(binPath);
    } catch (e: any) {
      window.showErrorMessage(e.message);
      return;
    }
  }

  const includesDir =
    wsConfig.get<string>("includesDir") ?? "";
  if (!fs.existsSync(includesDir)) {
    window.showWarningMessage(
      `the configured/default includes directory ${includesDir} does not exist, `
    );
  }
  const logFilepath = wsConfig.get<string>("logFilepath") ?? "";
  const args = [];
  if (logFilepath) args.push("-l", logFilepath);
  if (includesDir) args.push("-i", includesDir);
  const serverOptions: ServerOptions = {
    run: {
      command: binPath,
      args,
    },
    debug: {
      command: binPath,
      args,
    },
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
