import { workspace, ExtensionContext } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(_context: ExtensionContext) {
  const config = workspace.getConfiguration("12dpl");
  const binPath = config.get<string>("languageServerBinPath") ?? "";
  const includesDir = config.get<string>("includesDir") ?? "";
  const enableLogging = config.get<boolean>("enableLogging") ?? false;
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
