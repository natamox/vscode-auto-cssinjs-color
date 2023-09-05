import * as tinycolor from "tinycolor2";

import { IColor, IColorConfig } from "../models";
import { ExtensionContext, commands, workspace } from "vscode";
import { DEFAULT_COLOR_PREFIX } from "../constants";

/**
 *
 * @param text
 * @param colorRegex
 * @param config
 * @returns replaced text
 */
export function replaceColorsInText(
  text: string,
  colorRegex: RegExp,
  config: IColorConfig
): string {
  const inlineColors: {
    start: number;
    end: number;
    matchColor: string;
    resultColor: string;
  }[] = [];

  let replacedStyledText = text.replace(colorRegex, (matchColor, offset) => {
    const hexColor = tinycolor(matchColor).toHexString().toLocaleLowerCase();
    const matchColorKey = config.reveredColor?.[hexColor];

    if (!matchColorKey) {
      return matchColor;
    }

    if (
      (text[offset - 1] === `'` && text[offset + matchColor.length] === `'`) ||
      (text[offset - 1] === `"` && text[offset + matchColor.length] === `"`)
    ) {
      inlineColors.push({
        start: offset - 1,
        end: offset + matchColor.length + 1,
        matchColor,
        resultColor: `${config.colorPrefix}['${matchColorKey}']`,
      });
      return matchColor;
    }
    return "$" + `{${config.colorPrefix}['${matchColorKey}']}`;
  });

  if (!!inlineColors.length) {
    while (inlineColors.length) {
      const inlineColor = inlineColors.pop();

      if (!inlineColor) {
        continue;
      }

      replacedStyledText =
        replacedStyledText.slice(0, inlineColor.start) +
        inlineColor.resultColor +
        replacedStyledText.slice(inlineColor.end, replacedStyledText.length);
    }
  }

  return replacedStyledText;
}

/**
 *
 * @param path
 * @returns config
 */
export async function readConfigFile(): Promise<Required<IColorConfig>> {
  try {
    const config = workspace.getConfiguration("autoCssInJsColor");

    const colorPrefix = config.get("colorPrefix", DEFAULT_COLOR_PREFIX);

    const color: IColor = config.get("color", {});

    const reveredColor: IColor = config.get(
      "reveredColor",
      Object.fromEntries(
        Object.entries(color || {}).map(([key, val]) => [
          val.toLocaleLowerCase(),
          key,
        ])
      )
    );

    const importPath = config.get("importPath", "");

    return {
      colorPrefix,
      color,
      reveredColor,
      importPath,
    };
  } catch (err) {
    throw new Error("读取配置文件失败");
  }
}

export function registerCommand(
  context: ExtensionContext,
  command: string,
  callback: any
): void {
  context.subscriptions.push(commands.registerCommand(command, callback));
}
