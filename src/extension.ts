import { workspace, ExtensionContext } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient;

// TODO: move this to config.
const DEV_CMD =
  "/Users/kelly.lin/Repos/repoman/github.com/kelly-lin/12d-lang-server/12d-lang-server";

export function activate(_context: ExtensionContext) {
  const serverOptions: ServerOptions = {
    run: {
      command: "12d-lang-server",
    },
    debug: {
      command: DEV_CMD,
      args: ["-d"],
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
    "12d-lang-server",
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
