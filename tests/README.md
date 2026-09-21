# 测试

本目录包含 pi-zh-cn 的回归测试。测试通过 `pi --mode rpc` 加载测试扩展，
执行命令后收集断言结果，**不依赖任何本机绝对路径**。

## 文件

| 文件 | 说明 |
|------|------|
| `translations-test.ts` | 词典翻译 + 组件补丁测试（命令 `/zhtest`） |
| `width-test.ts` | TUI 宽度 / 截断回归测试（命令 `/widthtest`） |
| `run.mjs` | 测试运行器 |

测试扩展会自行安装 pi-zh-cn 的补丁，因此无需先安装本包。

## 运行

```bash
# 在 PATH 中已有 pi
node tests/run.mjs

# 指定 Pi 的 cli.js（用当前 node 运行）
PI_CLI="/path/to/@earendil-works/pi-coding-agent/dist/bundle/cli.js" node tests/run.mjs

# 或指定一个可执行命令
PI_BIN="pi" node tests/run.mjs
```

也可以通过根目录脚本运行：

```bash
npm test
```

## 覆盖范围

- 词典精确翻译、去空白、枚举值、动态规则、未命中回退；
- ANSI / Markdown 片段翻译；
- `Text` / `TextTruncated` / `SelectList` / `SettingsList` / `Markdown` 补丁生效；
- 内置 `ShowImages` / `Thinking` / `UserMessage` 选择器；
- 真实 `FooterComponent` 在 12~210 列下每行 `visibleWidth <= width`；
- 超长中文 / Emoji / ANSI 彩色文本的安全截断；
- 左右两列布局在翻译变宽后优先回收空白、保留中文内容。
