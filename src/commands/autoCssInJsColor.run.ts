import * as vscode from "vscode";
import { replaceColorsInText } from "../utils";
import { hexColorRegex, rgbColorRegex } from "../constants";
import { IColorConfig } from "../models";

const autoCssinJsColor = async (config: IColorConfig) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage("没有打开的编辑器");
    return;
  }

  try {
    await editor.edit(async (editBuilder) => {
      const doc = editor.document;
      const text = doc.getText();

      const replaceWithHexText = replaceColorsInText(
        text,
        hexColorRegex,
        config
      );

      const replaceWithRgbText = replaceColorsInText(
        replaceWithHexText,
        rgbColorRegex,
        config
      );

      const startPos = doc.positionAt(0);
      const endPos = doc.positionAt(doc.getText().length);
      editBuilder.replace(
        new vscode.Range(startPos, endPos),
        replaceWithRgbText
      );
      editBuilder.insert(new vscode.Position(0, 0), config.importPath + "\n");
    });

    await vscode.commands.executeCommand("editor.action.organizeImports");

    setTimeout(async () => {
      await vscode.commands.executeCommand("workbench.action.files.save");
    }, 500);
  } catch (err: any) {
    vscode.window.showErrorMessage("应用颜色失败:" + err.message);
  }
};

export default autoCssinJsColor;
