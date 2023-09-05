import * as vscode from "vscode";
import * as path from "path";
import { readConfigFile, registerCommand } from "./utils";
import { autoCssInJsColor } from "./commands";

export async function activate(context: vscode.ExtensionContext) {
  const configFilePath = path.join(context.extensionPath, "color-config.json");

  try {
    const parseConfig = await readConfigFile(configFilePath);
    registerCommand(context, "autoCssInJsColor.run", () =>
      autoCssInJsColor(parseConfig)
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(err);
  }
}

export function deactivate() {}
