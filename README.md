# vscode-auto-cssinjs-color README

Auto replace your css color variables by a command

# Start

Ctrl + Shift + P -> AutoCssInJsColor

# Config

edit settings.json

```json
{
  "autoCssInJsColor": {
    "colorPrefix": "Color",
    "importPath": "import { Color } from '@styles';",
    "color": {
      "@color-primary-1": "#4d67be",
      "@color-info-1": "#5b97bd",
      "@color-success-1": "#47a992",
      "@color-warning-1": "#cb9433",
      "@color-error-1": "#e16f64",
      "@color-grey-1": "#0d0f12",
      "@color-chart-color-1": "#303c46"
    }
  }
```
