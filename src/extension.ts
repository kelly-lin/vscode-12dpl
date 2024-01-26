import path from "path";
import fs, { writeFileSync } from "fs";
import { window, workspace, ExtensionContext, ExtensionMode } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";
import { execSync } from "child_process";
import { Readable } from "stream";

const SERVER_VERSION = "0.1.0-beta";
const SERVER_DOWNLOAD_URL = `https://github.com/kelly-lin/12d-lang-server/releases/download/v${SERVER_VERSION}/12dls.exe`;

async function downloadServer(binPath: string) {
  const res = await fetch(SERVER_DOWNLOAD_URL);
  if (!res.ok) {
    throw new Error(
      `failed to download language server: status ${res.status}, ${res.body}`
    );
  }
  const buf = await res.arrayBuffer();
  writeFileSync(binPath, Buffer.from(buf));
}

function getBinDir(platform: "windows" | "linux"): string | undefined {
  if (platform == "windows") {
    if (process.env.PROGRAMFILES) {
      return path.join(process.env.PROGRAMFILES, "12dls");
    }
    if (process.env.SYSTEMDRIVE) {
      return path.join(process.env.SYSTEMDRIVE, "12dls");
    }
  }

  if (platform == "linux") {
    if (process.env.HOME) {
      return path.join(process.env.HOME, ".local", "bin");
    }
  }
}

function getDefaultBinPath(platform: "windows" | "linux"): string | undefined {
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
function shouldDownloadServer(binPath: string, isProd: boolean) {
  if (!isProd) {
    return false;
  }
  if (!fs.existsSync(binPath)) {
    return true;
  }
  const currentVersion = execSync(`${binPath} -v`, {
    encoding: "utf8",
  }).trim();
  return currentVersion !== SERVER_VERSION;
}

export async function activate(context: ExtensionContext) {
  const wsConfig = workspace.getConfiguration("12dpl");
  const platform = process.platform === "win32" ? "windows" : "linux";
  const binPath =
    wsConfig.get<string>("serverBinPath") ?? getDefaultBinPath(platform);
  if (!binPath) {
    window.showErrorMessage(
      "server bin path is unset and could not get default bin path"
    );
    return;
  }
  const isProd = context.extensionMode === ExtensionMode.Production;
  if (shouldDownloadServer(binPath, isProd)) {
    try {
      await downloadServer(binPath);
    } catch (e: any) {
      window.showErrorMessage(e.message);
      return;
    }
  }

  const includesDir = wsConfig.get<string>("includesDir") ?? "";
  const enableLogging = wsConfig.get<boolean>("enableLogging") ?? false;
  const args = [];
  if (enableLogging) args.push("-d");
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
  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
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
