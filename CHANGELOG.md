# Changelog

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.1] - 2026-09-21

### 修复

- **兼容旧版 Pi**：`pi.registerEntryRenderer` 仅在 Pi `0.80.4+` 提供。现在所有可选
  API（`registerEntryRenderer`、`ctx.ui.addAutocompleteProvider`、
  `setHiddenThinkingLabel`、`setWorkingMessage`、`setStatus`、`notify`、
  `getCommands`、`appendEntry`）都会先做能力探测，缺失时静默降级，
  不再导致整个扩展加载失败（`pi.registerEntryRenderer is not a function`）。
- `/help` 在旧版 Pi 上回退为通知输出。

## [1.0.0] - 2026-09-21

首个独立分发的 Pi Extension Package 版本。

### 新增

- 独立的 Pi 包结构：`package.json` 声明 `pi.extensions`，可通过
  `pi install npm:pi-zh-cn-i18n` / `pi install git:...` 安装。
- 源代码重组为 `src/translations.ts`（唯一词典）、`src/commands.ts`
  （补全与 `/help`）、`src/tui.ts`（组件补丁）、`src/utils.ts`
  （宽度安全层 + 补丁注册表）。
- `tests/`：宽度回归测试与词典 / 组件补丁测试。

### 修复

- 修复中文宽字符 / Emoji 导致的 `Rendered line N exceeds terminal width` 崩溃。
  所有翻译出口统一使用 Pi 官方 `visibleWidth()` 与 `truncateToWidth()`，
  并优先回收左右两列之间的空白填充，避免直接截掉中文。

### 保留

- 官方英文命令与内部配置值不变，仅翻译用户可见界面。
- 命令补全、`/help`、设置页、模型页、会话页、对话树、快捷键页等二级界面汉化。

## [0.2.x] - 历史版本

- 早期以项目内扩展目录形式迭代：
  命令补全中文化、二级页面运行时翻译、ANSI 感知宽度处理等。
