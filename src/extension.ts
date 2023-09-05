import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";

interface IColor {
  [key: string]: string;
}

interface IColorConfig {
  colorPrefix?: string;
  color?: IColor;
  reveredColor?: IColor;
}

const hexColorRegex = /#[0-9A-Fa-f]{6}\b/g;

//TODO: RGB regex
const rgbColorRegex = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/g;

export async function activate(context: vscode.ExtensionContext) {
  const configFilePath = path.join(
    context.extensionPath,
    "color-config.json"
  );

  let bixiColorConfig: IColorConfig = {
    colorPrefix: "Color",
    color: {},
    reveredColor: {},
  };

  try {
    const jsonConfig = await fs.readFile(configFilePath, "utf8");

    const parsedConfig: IColorConfig = JSON.parse(jsonConfig);

    bixiColorConfig = {
      ...bixiColorConfig,
      color: parsedConfig.color,
      reveredColor: Object.fromEntries(
        Object.entries(parsedConfig.color || {}).map(([key, val]) => [
          val.toLocaleLowerCase(),
          key,
        ])
      ),
    };
  } catch (err) {
    vscode.window.showErrorMessage("读取配置文件失败");
    return;
  }

  const disposable = vscode.commands.registerCommand(
    "autoCssinJsColor.run",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("没有打开的编辑器");
        return;
      }

      let firstReplacedPosition: vscode.Position | undefined;

      try {
        await editor.edit(async (editBuilder) => {
          const doc = editor.document;
          const text = doc.getText();

          const newText = text.replace(hexColorRegex, (match, offset) => {
            const matchColorKey = bixiColorConfig.reveredColor?.[match];

            if (!matchColorKey) {
              return match;
            }

            if (!firstReplacedPosition) {
              firstReplacedPosition = doc.positionAt(offset + match.length);
            }

            return "$" + `{${bixiColorConfig.colorPrefix}['${matchColorKey}']}`;
          });

          const startPos = doc.positionAt(0);
          const endPos = doc.positionAt(doc.getText().length);
          editBuilder.replace(new vscode.Range(startPos, endPos), newText);
        });

        if (firstReplacedPosition) {
          const newPosition = firstReplacedPosition;
          const newSelection = new vscode.Selection(newPosition, newPosition);
          editor.selection = newSelection;
        }

        //TODO: auto import & auto format code
        setTimeout(async () => {
          try {
            await vscode.commands.executeCommand("editor.action.quickFix");
          } catch (err: any) {
            vscode.window.showErrorMessage(
              "执行快速修复操作失败:" + err.message
            );
          }
        }, 700);

        vscode.window.showInformationMessage("颜色替换完成!");
      } catch (err: any) {
        vscode.window.showErrorMessage("应用颜色失败:" + err.message);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
