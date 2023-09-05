import * as tinycolor from "tinycolor2";

import * as fs from "fs/promises";

import { IColor, IColorConfig } from "../models";
import { ExtensionContext, commands } from "vscode";
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
export async function readConfigFile(
  path: string
): Promise<Required<IColorConfig>> {
  let colorConfig: Required<IColorConfig> = {
    colorPrefix: DEFAULT_COLOR_PREFIX,
    color: {},
    reveredColor: {},
    importPath: "",
  };

  try {
    const jsonConfig = await fs.readFile(path, "utf8");

    const parsedConfig: IColorConfig = JSON.parse(jsonConfig);

    const reveredColor: IColor = Object.fromEntries(
      Object.entries(parsedConfig.color || {}).map(([key, val]) => [
        val.toLocaleLowerCase(),
        key,
      ])
    );

    return Object.assign(colorConfig, parsedConfig, { reveredColor });
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
