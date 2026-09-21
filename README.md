# pi-zh-cn

> Pi 编码代理的**简体中文界面**扩展（Pi Extension Package）。
> 通过官方 Extension / TUI API 实现，**不修改 Pi 核心源码，也不修改 `node_modules`**。

安装后，Pi 的命令补全菜单、二级页面、设置项、状态栏与提示信息都会尽可能显示中文；
真正执行的命令与内部配置值仍然是官方英文，功能零影响。

---

## 功能简介

- **命令补全菜单**：`/model` → `（模型）选择并切换模型`
- **二级页面汉化**：
  - `/settings` 设置页（设置项名称、描述、选项值）
  - `/model` 模型选择页
  - `/session` 会话信息卡片
  - `/resume` 会话恢复列表
  - `/tree` 对话树
  - `/fork` 用户消息分叉
  - `/scoped-models` 模型范围
  - `/login` `/logout` 认证选择器与登录对话框
  - `/trust` 项目信任选择器
  - `/hotkeys` 快捷键帮助页
  - `/help` 中文命令帮助（本扩展新增，英文命令名不变）
- **其它**：底部状态栏、确认弹窗、通知、错误提示、工作提示、思考等级显示等。
- **多语言切换行为**：未收录的英文自动回退原样显示，Pi 升级后不会报错。

### 设计原则

1. **命令不变**：真正执行的始终是 `/model`、`/settings`……中文只出现在显示层。
2. **词典集中**：所有中文集中在 `src/translations.ts`，不散落在代码中。
3. **只翻译用户可见文本**：命令名、配置 key、枚举值、模型 ID、session ID、
   文件路径、主题文件名、工具名一律不翻译。
4. **未命中回退英文**：新版本出现的新英文项自动原样显示。

---

## 支持的 Pi 版本

| 项目 | 版本 |
|------|------|
| Pi（`@earendil-works/pi-coding-agent`） | `0.86.x` 已验证；依赖的公开 API 自 `0.84+` 基本稳定 |
| Node.js | `>= 22.19.0` |
| 平台 | Windows / Linux / macOS（纯运行时，无平台相关代码） |

> 本扩展只使用 Pi 公开的 Extension / TUI API。Pi 升级后若个别私有组件字段变化，
> 对应包装会 `try/catch` 回退英文，不会导致 Pi 崩溃。

---

## 安装方法

### 方式一：从 npm 安装（推荐）

```bash
pi install npm:pi-zh-cn
```

安装后执行 `/reload`，或重启 Pi。

### 方式二：从 GitHub 安装

```bash
pi install git:github.com/Ws030201/pi-zh-cn-i18n
```

固定版本：

```bash
pi install git:github.com/Ws030201/pi-zh-cn-i18n@v1.0.0
```

### 方式三：本地目录 / `.tgz` 安装（离线）

```bash
# 目录
pi install /absolute/path/to/pi-zh-cn

# 或先把 .tgz 解压后再安装
tar -xzf pi-zh-cn-1.0.0.tgz
pi install /absolute/path/to/package
```

### 临时试用（不写入设置）

```bash
pi -e /absolute/path/to/pi-zh-cn
```

---

## 更新方法

```bash
# 更新单个包
pi update npm:pi-zh-cn

# 更新所有已安装的扩展包
pi update --extensions
```

Git 安装的包会跟随设置的 ref（标签 / 提交），如需换版本：

```bash
pi install git:github.com/Ws030201/pi-zh-cn-i18n@v1.1.0
```

---

## 卸载方法

```bash
pi remove npm:pi-zh-cn
```

Git / 本地安装同理：

```bash
pi remove git:github.com/Ws030201/pi-zh-cn-i18n
pi remove /absolute/path/to/pi-zh-cn
```

也可以用 `pi config` 交互式启用 / 禁用已安装的包。

---

## 功能截图说明

> 以下为文本示意（终端实际效果取决于主题与终端宽度）。

**1. 命令补全菜单**

```
/model            （模型）选择并切换模型
/thinking         （思考等级）切换推理等级
/settings         （设置）打开设置
/help             （帮助）查看帮助
```

**2. 设置页 `/settings`**

```
Auto-compact        自动压缩
Steering mode       插话模式
Double-escape action 双击 Esc 行为
...
```

**3. 模型选择页 `/model`**

```
模型名称: deepseek-flash
范围: 范围内
...
```

**4. 对话树 `/tree`**

```
  对话树        输入以搜索: 
  用户: ...
  助手: ...
```

**5. 快捷键帮助页 `/hotkeys`**

```
| 按键 | 操作 |
|------|------|
| ↑    | 移动光标 / 浏览历史 |
```

建议在 README 或 GitHub Release 中替换为真实截图（可在 `package.json` 的
`pi.image` 字段配置一张预览图，PNG / JPEG / GIF / WebP）。

---

## 已知限制

| 页面 | 限制 | 现状 |
|------|------|------|
| `/settings` | `SettingsManager` 不对扩展暴露，无法重写页面 | 运行时翻译 `SettingsList` 显示字段 |
| `/tree` `/resume` | 内部列表类未导出 | 通过外层选择器渲染后翻译 |
| `/login` `/logout` | OAuth 流程由核心驱动 | 翻译固定文案与提示 |
| `/scoped-models` | 需要写回设置 | 只翻译显示，枚举值仍为英文 |
| `/changelog` | 正文来自官方 CHANGELOG | 仅翻译标题，正文保持原文 |
| 全屏模式状态栏 | 由核心直接绘制 | 可翻译文本有限 |

采用运行时原型包装，极少数深层私有组件可能无法覆盖；这些页面会**保持英文显示**。

---

## 开发调试方法

### 目录结构

```
pi-zh-cn/
├── package.json        # Pi 包清单（pi.extensions）
├── README.md
├── LICENSE
├── CHANGELOG.md
├── index.ts            # 扩展入口：export default function (pi) {}
├── src/
│   ├── translations.ts # ★ 唯一词典 + 翻译器
│   ├── commands.ts     # 命令补全 + /help + 条目渲染器
│   ├── tui.ts          # 内置 TUI 组件汉化补丁
│   └── utils.ts        # 宽度安全层 + 补丁注册表
└── tests/
    ├── translations-test.ts
    ├── width-test.ts
    ├── run.mjs
    └── README.md
```

### 本地开发

```bash
# 直接在 Pi 中加载本目录（临时，不改设置）
pi -e /absolute/path/to/pi-zh-cn

# 在 Pi 内热重载
/reload
```

### 运行测试

测试通过 `pi --mode rpc` 加载测试扩展并断言结果。运行器会自动寻找 `pi`：

```bash
# pi 已在 PATH
npm test

# 或显式指定 pi CLI（例如通过 node 运行打包后的 cli.js）
PI_CLI="/path/to/@earendil-works/pi-coding-agent/dist/bundle/cli.js" npm test
```

测试覆盖：

- 词典精确翻译、枚举值、动态规则、未命中回退；
- ANSI / Markdown 片段翻译；
- `Text` / `TruncatedText` / `SelectList` / `SettingsList` / `Markdown` 补丁生效；
- 真实 `FooterComponent` 在 12~210 列下每一行 `visibleWidth <= width`；
- 超长中文 / Emoji / ANSI 文本按当前宽度安全截断。

### 宽度安全（防止 TUI 崩溃）

中文 / 日文 / 韩文与多数 Emoji 是**双列宽**。扩展在「渲染后翻译」时，原组件已按
翻译前宽度完成布局，若翻译后变宽会触发：

```
Rendered line N exceeds terminal width
```

`src/utils.ts` 在所有翻译出口统一收紧宽度：

1. `visibleWidth()` 计算真实显示宽度（忽略 ANSI / OSC / APC，正确处理中文 / Emoji）；
2. 优先从左右两列之间的**空白填充**回收空间，保留两侧内容；
3. 仍放不下才用 `truncateToWidth()` 截断。

宽度始终来自 `render(width)` 实参，**不写死任何列数**，终端缩放后自动适配。

### 新增 / 修改翻译

编辑 `src/translations.ts`：

```ts
// 固定文案
phrases: {
  "Some new label": "某个新标签",
},

// 带变量的动态规则
rules: [
  [/^Session name: (.+)$/, "会话名称: $1"],
],
```

然后在 Pi 中执行 `/reload`。

---

## 依赖说明

- `@earendil-works/pi-coding-agent`、`@earendil-works/pi-tui` 由 **Pi 运行时内置**，
  因此按 Pi 官方包规范声明为 `peerDependencies: "*"`，不打包、不重复安装。
- 本扩展没有其它第三方运行时依赖，`dependencies` 为空。

---

## License

[MIT](./LICENSE)
