export interface IColor {
  [key: string]: string;
}

export interface IColorConfig {
  colorPrefix?: string;
  color: IColor;
  reveredColor: IColor;
  importPath?: string;
}
