import * as vscode from "vscode";
import { readConfigFile, registerCommand } from "./utils";
import { autoCssInJsColor } from "./commands";

export async function activate(context: vscode.ExtensionContext) {
  try {
    const parseConfig = await readConfigFile();
    registerCommand(context, "autoCssInJsColor.run", () =>
      autoCssInJsColor(parseConfig)
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(err.message);
  }
}

export function deactivate() {}
