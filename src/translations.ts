/**
 * 统一中文映射表（唯一数据源）。
 *
 * 设计：
 *   - `commandLabels` 命令补全 / /help 用的「英文命令 → 中文名 + 说明」
 *   - `values`        枚举/配置值的“显示文本”（内部值保持不变）
 *   - `phrases`       TUI 组件中出现的**整段**英文 → 中文（精确匹配）
 *   - `rules`         带变量的动态文案（正则替换）
 *
 * 只命中才替换；未命中一律回退英文。
 *
 * 注意：这里翻译的是「用户可见文本」。命令名、配置 key、枚举值本身、
 * 模型 ID、session ID、文件路径、工具名一律不翻译。
 */

/** 命令显示标签。 */
export interface CommandLabel {
	/** 中文名称，如「模型」 */
	zh: string;
	/** 中文说明，如「选择并切换模型」 */
	desc: string;
}

/** 英文命令 → 中文名称/说明。 */
export const commandLabels: Record<string, CommandLabel> = {
	help: { zh: "帮助", desc: "查看帮助" },
	model: { zh: "模型", desc: "选择并切换模型" },
	thinking: { zh: "思考等级", desc: "切换推理等级" },
	session: { zh: "会话", desc: "查看当前会话" },
	settings: { zh: "设置", desc: "打开设置" },
	new: { zh: "新会话", desc: "开始新会话" },
	resume: { zh: "恢复会话", desc: "恢复历史会话" },
	tree: { zh: "对话树", desc: "查看会话历史" },
	compact: { zh: "压缩上下文", desc: "压缩当前上下文" },
	reload: { zh: "重载", desc: "重新加载配置" },
	hotkeys: { zh: "快捷键", desc: "查看快捷键" },
	quit: { zh: "退出", desc: "退出 Pi" },
	"scoped-models": { zh: "模型范围", desc: "启用/禁用 Ctrl+P 循环的模型" },
	export: { zh: "导出", desc: "导出当前会话" },
	import: { zh: "导入", desc: "从文件导入会话" },
	share: { zh: "分享", desc: "分享会话链接" },
	copy: { zh: "复制", desc: "复制最后一条回复" },
	name: { zh: "改名", desc: "设置会话名称" },
	changelog: { zh: "更新日志", desc: "查看版本更新" },
	fork: { zh: "分叉", desc: "从历史消息创建分支" },
	clone: { zh: "克隆", desc: "复制当前会话" },
	trust: { zh: "信任", desc: "保存项目信任设置" },
	login: { zh: "登录", desc: "配置提供商认证" },
	logout: { zh: "登出", desc: "移除提供商认证" },
	bug: { zh: "反馈", desc: "报告问题" },
	llama: { zh: "Llama", desc: "管理本地 llama.cpp 模型" },
};

/** 统一的「（中文名）中文说明」格式。 */
export function formatCommandLabel(label: CommandLabel): string {
	return `（${label.zh}）${label.desc}`;
}

/**
 * 枚举 / 配置值的“显示文本”。
 * key 是内部真实值（保持英文存储），value 是界面显示。
 */
export const values: Record<string, string> = {
	// 通用布尔 / 开关
	true: "是",
	false: "否",
	on: "开",
	off: "关",
	enabled: "已启用",
	disabled: "已禁用",
	none: "无",
	auto: "自动",
	automatic: "自动",
	default: "默认",
	configured: "已配置",
	configure: "配置",
	unsaved: "未保存",
	// 模式
	"one-at-a-time": "逐个",
	all: "全部",
	regular: "常规",
	fullscreen: "全屏",
	transcript: "输出记录",
	// 传输
	sse: "SSE",
	websocket: "WebSocket",
	"websocket-cached": "WebSocket（缓存）",
	// 缓存预热
	streaming: "流式",
	idle: "空闲",
	// 项目信任
	ask: "询问",
	always: "始终信任",
	never: "从不信任",
	trusted: "已信任",
	untrusted: "未信任",
	// 双击 Esc 行为 / 树过滤
	tree: "对话树",
	fork: "分叉",
	"no-tools": "隐藏工具",
	"user-only": "仅用户消息",
	"labeled-only": "仅有标签",
	// Mermaid
	final: "仅最终",
	// 思考等级
	minimal: "极简",
	low: "低",
	medium: "中",
	high: "高",
	xhigh: "极高",
	max: "最大",
	// 主题名
	dark: "深色",
	light: "浅色",
	// 认证类型
	oauth: "订阅",
	subscription: "订阅",
	api_key: "API 密钥",
	"API key": "API 密钥",
	// 模型选择器 scope
	scoped: "范围内",
};

/**
 * 固定整段英文 → 中文。
 * 键为去掉首尾空白后的文本；匹配时会保留原始首尾空白。
 */
export const phrases: Record<string, string> = {
	// ===== 通用按钮 / 选项 =====
	Yes: "是",
	No: "否",
	Cancel: "取消",
	Confirm: "确认",
	Apply: "应用",
	Save: "保存",
	Close: "关闭",
	Back: "返回",
	Default: "默认",
	Automatic: "自动",
	"save and go back": "保存并返回",
	"switch to single theme": "切换到单一主题",

	// ===== 底部快捷键提示（keyHint 的说明部分） =====
	navigate: "导航",
	select: "选择",
	cancel: "取消",
	save: "保存",
	confirm: "确认",
	close: "关闭",
	"to cancel": "取消",
	"to cancel,": "取消，",
	"to submit": "提交",
	"to select": "选择",
	"to save": "保存",
	"to close": "关闭",
	"to open": "打开",
	"to interrupt": "中断",
	"to clear": "清空",
	"to exit": "退出",
	"to exit (empty)": "退出（编辑器为空时）",
	"to suspend": "挂起",
	"to expand": "展开",
	"to expand tools": "展开工具输出",
	"to expand thinking": "展开思考",
	"to cycle thinking level": "切换思考等级",
	"to cycle models": "切换模型",
	"to select model": "选择模型",
	"to queue follow-up": "排队后续消息",
	"to edit all queued messages": "编辑所有排队消息",
	"to paste image (with text fallback)": "粘贴图片（回退为文本）",
	"to attach": "附加文件",
	"to delete to end": "删除到行尾",
	"to view full changelog": "查看完整更新日志",
	"to toggle tools expanded": "展开/收起工具输出",
	commands: "命令",
	bash: "运行 bash",
	"bash (no context)": "运行 bash（不入上下文）",
	"drop files": "拖入文件",

	// ===== 设置页：设置项名称 =====
	"Auto-compact": "自动压缩",
	"Steering mode": "插话模式",
	"Follow-up mode": "后续消息模式",
	Transport: "传输方式",
	"HTTP idle timeout": "HTTP 空闲超时",
	"Cache warming": "缓存预热",
	"Hide thinking": "隐藏思考",
	"Mermaid diagrams": "Mermaid 图表",
	"Cache miss notices": "缓存未命中提示",
	"Collapse changelog": "折叠更新日志",
	"Quiet startup": "安静启动",
	"Install telemetry": "安装遥测",
	"Default project trust": "默认项目信任",
	"Double-escape action": "双击 Esc 行为",
	"Tree filter mode": "对话树过滤模式",
	Warnings: "警告",
	"Default thinking level per model": "各模型默认思考等级",
	"Show images": "显示图片",
	"Image width (cells)": "图片宽度（列）",
	"Auto-resize images": "自动缩放图片",
	"Block images": "阻止图片",
	"Enable skill commands": "启用技能命令",
	Theme: "主题",
	"Light theme": "浅色主题",
	"Dark theme": "深色主题",
	"Change mode": "更改模式",
	"Default model": "默认模型",
	"Current model": "当前模型",
	"Thinking level": "思考等级",
	"Thinking Level": "思考等级",
	"Editor padding": "编辑器内边距",
	"Output padding": "输出内边距",
	"Autocomplete max visible": "补全最大显示条数",
	"Clear on shrink": "缩小时清屏",
	"Show hardware cursor": "显示硬件光标",
	"Terminal progress": "终端进度",
	"TUI mode": "TUI 模式",
	"Fullscreen exit output": "全屏退出输出",
	"Fullscreen scrollbar": "全屏滚动条",
	"Fullscreen copy on select": "全屏选中即复制",
	"Mermaid rendering": "Mermaid 渲染",
	"Anthropic extra usage": "Anthropic 额外用量",
	"Project trust": "项目信任",
	"Session name": "会话名称",
	"Rename Session": "重命名会话",
	"Fork from Message": "从消息分叉",
	"Session Info": "会话信息",
	"Cache Warming": "缓存预热",
	Cost: "费用",
	"Keyboard Shortcuts": "键盘快捷键",
	"What's New": "更新内容",
	"Model Configuration": "模型配置",
	"Open settings menu": "打开设置",
	"Select model": "选择模型",

	// ===== 设置页：设置项描述 =====
	"Automatically compact context when it gets too large": "上下文过大时自动压缩",
	"Enter while streaming queues steering messages. 'one-at-a-time': deliver one, wait for response. 'all': deliver all at once.":
		"流式输出时按回车会排队插话。'逐个'：一条一条发送并等待回复。'全部'：一次性全部发送。",
	"'one-at-a-time': deliver one, wait for response. 'all': deliver all at once.":
		"'逐个'：一条一条发送并等待回复。'全部'：一次性全部发送。",
	"Preferred transport for providers that support multiple transports": "支持多种传输方式的提供商所使用的首选传输方式",
	"Maximum idle gap while waiting for HTTP headers or body chunks. Disable for local models that pause longer than five minutes.":
		"等待 HTTP 响应头或响应体分块时的最大空闲间隔。本地模型停顿超过五分钟时可禁用。",
	"Hide thinking blocks in assistant responses": "在助手回复中隐藏思考块",
	"Render Mermaid code blocks as Unicode diagrams": "将 Mermaid 代码块渲染为 Unicode 图表",
	"Show transcript notices for cache costs and provider recovery diagnostics":
		"在输出记录中显示缓存费用与提供商恢复诊断提示",
	"Show condensed changelog after updates": "更新后显示精简版更新日志",
	"Disable verbose printing at startup": "启动时不打印冗长信息",
	"Send an anonymous version/update ping after changelog-detected updates":
		"检测到更新后发送匿名的版本/更新统计",
	"Fallback behavior when no extension or saved trust decision decides project trust":
		"当没有扩展或已保存的信任决定时，项目信任的回退行为",
	"Action when pressing Escape twice with empty editor": "编辑器为空时双击 Escape 的动作",
	"Default filter when opening /tree": "打开 /tree 时的默认过滤方式",
	"Enable or disable individual warnings": "启用或禁用各项警告",
	"Override the default thinking level for specific models.": "为特定模型覆盖默认思考等级。",
	"Select a model to configure": "选择要配置的模型",
	"Select a theme, or choose Automatic to follow terminal appearance.":
		"选择主题，或选择“自动”以跟随终端外观。",
	"Use separate themes for light and dark terminal appearance": "为终端浅色/深色外观分别使用主题",
	"Choose themes for terminal light and dark appearance.": "为终端浅色/深色外观选择主题。",
	"Light/dark detection requires terminal support.": "浅色/深色检测需要终端支持。",
	"Warn when Anthropic subscription auth may use paid extra usage":
		"当 Anthropic 订阅认证可能产生额外付费用量时发出警告",
	"Show images inline in terminal": "在终端内联显示图片",
	"Show text placeholder instead": "改为显示文本占位符",
	"Configure provider authentication": "配置提供商认证",
	"Toggle individual settings": "切换各项设置",
	"off; streaming while the agent runs; idle also between runs while continuation stays profitable":
		"off：智能体运行时流式预热；空闲时若继续预热仍划算也预热",
	"Ask": "询问",
	"Always trust": "始终信任",
	"Never trust": "从不信任",
	"  Type to filter · Enter to select · Esc to go back": "  输入以过滤 · Enter 选择 · Esc 返回",
	"  Enter to select · Esc to go back": "  Enter 选择 · Esc 返回",
	"  No matching commands": "  无匹配命令",
	"  No matching settings": "  无匹配设置",
	"  No settings available": "  没有可用的设置",

	// ===== 设置子菜单 / 通用 =====
	"Per-Model Thinking Level": "各模型思考等级",
	"Authentication": "认证",
	"Saved decision: ": "已保存的决定: ",
	"Current session: ": "当前会话: ",
	"none": "无",
	"trusted": "已信任",
	"untrusted": "未信任",
	"Subscription": "订阅",
	"API key": "API 密钥",
	"No subscription providers available.": "没有可用的订阅提供商。",
	"No API key providers available.": "没有可用的 API 密钥提供商。",
	"No login providers available.": "没有可用的登录提供商。",
	"Select authentication method:": "选择认证方式：",
	"Sign in with an account": "使用账号登录",
	"Sign in with an API key": "使用 API 密钥登录",
	"Waiting for authentication...": "正在等待认证…",
	"Login cancelled": "登录已取消",

	// ===== 模型选择器 =====
	"Only showing models from configured providers. Use /login to add providers.":
		"仅显示已配置提供商的模型。使用 /login 添加提供商。",
	"Refreshing model catalogs…": "正在刷新模型目录…",
	"Model catalogs refreshed.": "模型目录已刷新。",
	"Model refresh timed out; showing cached models.": "模型目录刷新超时，显示缓存中的模型。",
	"  No matching models": "  无匹配模型",
	"Model Name: ": "模型名称: ",
	"Scope: ": "范围: ",
	"all": "全部",
	"scoped": "范围内",

	// ===== 思考等级选择器 =====
	"No reasoning": "不推理",
	"Very brief reasoning (~1k tokens)": "极简推理（约 1k tokens）",
	"Light reasoning (~2k tokens)": "轻度推理（约 2k tokens）",
	"Moderate reasoning (~8k tokens)": "中度推理（约 8k tokens）",
	"Deep reasoning (~16k tokens)": "深度推理（约 16k tokens）",
	"Extra-high reasoning (~32k tokens)": "极高推理（约 32k tokens）",
	"Maximum reasoning": "最大推理",
	" · default": " · 默认",

	// ===== 会话恢复 / 会话列表 =====
	"Resume Session (Current Folder)": "恢复会话（当前文件夹）",
	"Resume Session (All)": "恢复会话（全部）",
	"Current folder": "当前文件夹",
	"Current Folder": "当前文件夹",
	"○ Current Folder": "○ 当前文件夹",
	"◉ Current Folder": "◉ 当前文件夹",
	"Sort: ": "排序: ",
	"Name: ": "名称: ",
	"(on)": "（开）",
	"(off)": "（关）",
	"  No sessions found": "  未找到会话",
	"  No named sessions found. Press ": "  未找到命名会话。按 ",
	"  No named sessions in current folder. Press ": "  当前文件夹中没有命名会话。按 ",
	"  No sessions in current folder. Press Tab to view all.":
		"  当前文件夹中没有会话。按 Tab 查看全部。",
	"Session moved to trash": "会话已移入回收站",
	"Session deleted": "会话已删除",
	"Unknown error": "未知错误",
	"Cannot delete the currently active session": "无法删除当前正在使用的会话",
	"re:<pattern> regex · \"phrase\" exact": "re:<正则> 正则 · \"短语\" 精确匹配",

	// ===== 对话树 =====
	"  Session Tree": "  对话树",
	"  No entries found": "  未找到条目",
	"user: ": "用户: ",
	"assistant: ": "助手: ",
	"branch summary": "分支摘要",
	"(aborted)": "（已中止）",
	"(no content)": "（无内容）",
	"Type to search: ": "输入以搜索: ",
	"Label (empty to remove): ": "标签（留空则删除）: ",
	"label time": "标签时间",
	" [no-tools]": " [隐藏工具]",
	" [user]": " [用户]",
	" [labeled]": " [有标签]",
	" [all]": " [全部]",
	" [+label time]": " [+标签时间]",

	// ===== 模型配置（scoped-models） =====
	"all enabled": "全部启用",
	"(unsaved)": "（未保存）",
	" [unavailable]": " [不可用]",
	"Model unavailable": "模型不可用",

	// ===== 用户消息分叉 =====
	"Select a user message to copy the active path up to that point into a new session":
		"选择一条用户消息，将其之前的活动路径复制到新会话",
	"  No user messages found": "  未找到用户消息",

	// ===== 认证选择器 =====
	"Select provider to configure:": "选择要配置的提供商：",
	"Select provider to logout:": "选择要登出的提供商：",
	"No providers available": "没有可用的提供商",
	"No providers logged in. Use /login first.": "没有已登录的提供商。请先使用 /login。",
	"No matching providers": "无匹配的提供商",
	" • unconfigured": " • 未配置",
	"subscription configured": "已配置订阅",
	"API key configured": "已配置 API 密钥",
	" ✓ configured": " ✓ 已配置",
	"Cmd+click to open": "Cmd+点击打开",
	"Ctrl+click to open": "Ctrl+点击打开",
	"Enter code: ": "输入验证码: ",

	// ===== 会话信息卡片（/session） =====
	"Name:": "名称:",
	"File:": "文件:",
	"ID:": "ID:",
	"In-memory": "内存中",
	Messages: "消息",
	"Total:": "总计:",
	"User:": "用户:",
	"Assistant:": "助手:",
	"Tools:": "工具:",
	Tokens: "Tokens",
	"Input:": "输入:",
	"Cached:": "已缓存:",
	"Uncached:": "未缓存:",
	"Output:": "输出:",
	"Mode:": "模式:",
	"Status:": "状态:",
	"Cache miss penalty:": "缓存未命中代价:",
	"Refresh cost:": "刷新代价:",
	"Cache Re-billed:": "缓存重复计费:",
	"Inactive (cache warming unavailable)": "未启用（缓存预热不可用）",
	"calls": "次调用",
	"results": "条结果",
	"written to cache": "写入缓存",

	// ===== 状态 / 通知 / 错误 =====
	"Operation aborted": "操作已中止",
	"Compaction cancelled": "压缩已取消",
	"Auto-compaction cancelled": "自动压缩已取消",
	"Completed compaction is missing from the session context": "会话上下文中缺少已完成的压缩",
	"Warning: ": "警告: ",
	"Error: ": "错误: ",
	"Cache miss": "缓存未命中",
	"Cache miss after model switch": "切换模型后缓存未命中",
	"Branch summary": "分支摘要",
	"Session compacted ": "会话已压缩 ",
	"1 time": "1 次",
	"No queued messages to restore": "没有可恢复的排队消息",
	"No messages to fork from": "没有可分叉的消息",
	"No entries in session": "会话中没有条目",
	"Already at this point": "已在该位置",
	"Summarize branch?": "是否生成分支摘要？",
	"No summary": "不生成摘要",
	"Summarize with custom prompt": "使用自定义提示生成摘要",
	"Custom summarization instructions": "自定义摘要说明",
	"Selected entry has no text to copy": "所选条目没有可复制的文本",
	"Copied selected message to clipboard": "已将所选消息复制到剪贴板",
	"No agent messages to copy yet.": "还没有可复制的助手消息。",
	"Copied!": "已复制！",
	"Copied last agent message to clipboard": "已复制最后一条助手消息到剪贴板",
	"Nothing to clone yet": "暂无可克隆的内容",
	"No changelog entries found.": "未找到更新日志条目。",
	"A bash command is already running. Press Esc to cancel it first.":
		"已有 bash 命令正在运行。请先按 Esc 取消。",
	"Wait for the current response to finish before reloading.": "请等待当前回复完成后再重载。",
	"Wait for compaction to finish before reloading.": "请等待压缩完成后再重载。",
	"Wait for the current compaction or tree navigation to finish before navigating the session tree.":
		"请等待当前压缩或对话树导航完成后再导航会话树。",
	"Reloading keybindings, extensions, skills, prompts, themes, and context files...":
		"正在重载快捷键、扩展、技能、提示模板、主题与上下文文件…",
	"Reloaded keybindings, extensions, skills, prompts, themes, and context files":
		"已重载快捷键、扩展、技能、提示模板、主题与上下文文件",
	"Resume cancelled": "恢复已取消",
	"Import cancelled": "导入已取消",
	"Session exported to: ": "会话已导出到: ",
	"Session imported from: ": "会话已从以下位置导入: ",
	"Session name: ": "会话名称: ",
	"Session name set: ": "会话名称已设置: ",
	"Usage: /name <name>": "用法: /name <名称>",
	"Usage: /import <path.jsonl>": "用法: /import <路径.jsonl>",
	"No login methods available.": "没有可用的登录方式。",
	"Current model does not support thinking": "当前模型不支持思考",
	"Only one model in scope": "范围内只有一个模型",
	"Only one model available": "只有一个可用模型",
	"Tool output: expanded": "工具输出: 已展开",
	"Tool output: collapsed": "工具输出: 已折叠",
	"Thinking blocks: hidden": "思考块: 已隐藏",
	"Thinking blocks: visible": "思考块: 可见",
	"Syspended to background is not supported on Windows": "Windows 不支持挂起到后台",
	"Suspend to background is not supported on Windows": "Windows 不支持挂起到后台",
	"Update Available": "有可用更新",
	"Package Updates Available": "有可用的包更新",
	"Packages:": "包:",
	"Failed to create session": "创建会话失败",
	"Resumed session": "已恢复会话",
	"Resumed session in current cwd": "已在当前工作目录恢复会话",
	"Failed to resume session": "恢复会话失败",
	"Navigated to selected point": "已导航到所选位置",
	"Navigation cancelled": "导航已取消",
	"Branch summarization cancelled": "分支摘要已取消",
	"Forked to new session": "已分叉到新会话",
	"Cloned to new session": "已克隆到新会话",
	"Model selection saved to settings": "模型选择已保存到设置",
	"Saved trust decision": "已保存信任决定",
	"Anthropic subscription warning": "Anthropic 订阅警告",

	// ===== 树过滤 / 状态 =====
	"branch": "分支",
	"Entry": "条目",
	"Disabled": "已禁用",
	"Enabled": "已启用",
	// 页脚 / 加载器 / 状态
	" (auto)": "（自动）",
	"thinking off": "思考 关闭",
	"Loading...": "加载中…",
	"Working": "处理中",
	"Compacting context...": "正在压缩上下文…",
	"Auto-compacting...": "正在自动压缩…",
	"Summarizing branch...": "正在生成分支摘要…",
	"Retrying": "正在重试",
	"Context overflow detected": "检测到上下文溢出",
	"Unknown": "未知",
	"Configured": "已配置",
	"Unconfigured": "未配置",

	// ===== 欢迎 / 启动 =====
	"for commands": "查看命令",
	"to run bash": "运行 bash",
	"to run bash (no context)": "运行 bash（不入上下文）",
};

/** 动态文案规则：`[正则, 替换]`，按顺序匹配，命中第一个即返回。
 * 正则作用于「去掉首尾空白的整段文本」，替换后会自动补回首尾空白。
 */
export type TranslationRule = [RegExp, string];

export const rules: TranslationRule[] = [
	// 会话信息
	[/^Name: (.+)$/, "名称: $1"],
	[/^File: (.+)$/, "文件: $1"],
	[/^ID: (.+)$/, "ID: $1"],
	[/^Total: (.+)$/, "总计: $1"],
	[/^User: (.+)$/, "用户: $1"],
	[/^Assistant: (.+)$/, "助手: $1"],
	[/^Input: (.+)$/, "输入: $1"],
	[/^Output: (.+)$/, "输出: $1"],
	[/^Mode: (.+)$/, "模式: $1"],
	[/^Status: (.+)$/, "状态: $1"],
	[/^Cache miss penalty: (.+)$/, "缓存未命中代价: $1"],
	[/^Refresh cost: (.+)$/, "刷新代价: $1"],
	[/^Cache Re-billed: (.+)$/, "缓存重复计费: $1"],
	[/^Tools: (.+)$/, "工具: $1"],
	[/^(\d+) calls, (\d+) results$/, "$1 次调用，$2 条结果"],
	[/^(.+) written to cache$/, "已写入缓存 $1"],
	// 状态提示
	[/^Session name: (.+)$/, "会话名称: $1"],
	[/^Session name set: (.+)$/, "会话名称已设置: $1"],
	[/^Session exported to: (.+)$/, "会话已导出到: $1"],
	[/^Session imported from: (.+)$/, "会话已从以下位置导入: $1"],
	[/^Switched to (.+)$/, "已切换到 $1"],
	[/^Thinking level: (.+)$/, "思考等级: $1"],
	[/^Default thinking level: (.+)$/, "默认思考等级: $1"],
	[/^Model: (.+)$/, "模型: $1"],
	[/^Default model: (.+)$/, "默认模型: $1"],
	[/^Unknown thinking level "(.+)"\. Available levels: (.+)\.$/, "未知的思考等级“$1”。可用等级：$2。"],
	[/^Session compacted (\d+) times$/, "会话已压缩 $1 次"],
	[/^(\d+) configured$/, "已配置 $1 个"],
	[/^(\d+) misses$/, "$1 次未命中"],
	[/^1 miss$/, "1 次未命中"],
	[/^Failed to export session: (.+)$/, "导出会话失败: $1"],
	[/^Failed to import session: (.+)$/, "导入会话失败: $1"],
	[/^Failed to delete: (.+)$/, "删除失败: $1"],
	[/^Failed to load sessions: (.+)$/, "加载会话失败: $1"],
	[/^Failed to send queued messages?: (.+)$/, "发送排队消息失败: $1"],
	[/^Failed to send queued message(?:s)?: (.+)$/, "发送排队消息失败: $1"],
	[/^Failed to create session$/, "创建会话失败"],
	[/^Reload failed: (.+)$/, "重载失败: $1"],
	[/^Warning: (.+)$/, "警告: $1"],
	[/^Error: (.+)$/, "错误: $1"],
	[/^Could not refresh (.+); showing cached models\.$/, "无法刷新 $1；显示缓存中的模型。"],
	[/^Could not refresh model catalogs: (.+)$/, "无法刷新模型目录: $1"],
	[/^Could not save project trust after reload: (.+)$/, "重载后无法保存项目信任: $1"],
	[/^Saved trust decision: (trusted|untrusted)\. Restart (.+) for this to take effect\.$/, "已保存信任决定: $1。重启 $2 后生效。"],
	[/^Aborted after (\d+) retry attempts?$/, "在 $1 次重试后中止"],
	[/^Retry failed after (.+) attempts: (.+)$/, "重试 $1 次后失败: $2"],
	[/^Anthropic dropped (\d+) (thinking blocks?|thinking block) \(details in session\)$/, "Anthropic 丢弃了 $1 个思考块（详情见会话）"],
	[/^Cache miss after (\d+)m idle$/, "空闲 $1 分钟后缓存未命中"],
	[/^(.+) tokens re-billed$/, "重新计费 $1 tokens"],
	[/^(.+) tokens, (\d+) misses?$/, "$1 tokens，$2 次未命中"],
	[/^To resume this session: (.+)$/, "恢复此会话: $1"],
	[/^(.+) is available\. Run (.+)$/, "$1 可用。运行 $2"],
	[/^New version (.+) is available\. Run (.+)$/, "新版本 $1 可用。运行 $2"],
	[/^Package updates are available\. Run (.+)$/, "有可用的包更新。运行 $1"],
	[/^Steering: (.+)$/, "插话: $1"],
	[/^Follow-up: (.+)$/, "后续: $1"],
	[/^Restored (\d+) queued messages? to editor$/, "已将 $1 条排队消息恢复到编辑器"],
	[/^Queued message for after compaction$/, "已排队消息，压缩后发送"],
	[/^Bash command failed: (.+)$/, "Bash 命令失败: $1"],
	[/^(.+), but no default model is configured for provider "(.+)"\. Use \/model to select a model\.$/, "$1，但提供商“$2”未配置默认模型。使用 /model 选择模型。"],
	[/^(.+), but no models are available for that provider\. Use \/model to select a model\.$/, "$1，但该提供商没有可用模型。使用 /model 选择模型。"],
	[/^(.+), but its default model "(.+)" is not available\. Use \/model to select a model\.$/, "$1，但其默认模型“$2”不可用。使用 /model 选择模型。"],
	[/^(.+), but selecting its default model failed: (.+)\. Use \/model to select a model\.$/, "$1，但选择其默认模型失败: $2。使用 /model 选择模型。"],
	[/^(.+)\. Selected (.+)\. Credentials saved to (.+)$/, "$1。已选择 $2。凭据已保存到 $3"],
	[/^(.+)\. Credentials saved to (.+)$/, "$1。凭据已保存到 $2"],
	[/^Logged out of (.+)$/, "已登出 $1"],
	[/^Removed stored API key for (.+)\. Environment variables and models\.json config are unchanged\.$/, "已移除 $1 的存储 API 密钥。环境变量与 models.json 配置不变。"],
	[/^Logged in to (.+)$/, "已登录 $1"],
	[/^Saved API key for (.+)$/, "已保存 $1 的 API 密钥"],
	[/^Failed to login to (.+): (.+)$/, "登录 $1 失败: $2"],
	[/^Failed to save API key for (.+): (.+)$/, "保存 $1 的 API 密钥失败: $2"],
	// 模型选择器
	[/^Model Name: (.+)$/, "模型名称: $1"],
	[/^Scope: (.+)$/, "范围: $1"],
	[/^(\d+) configured$/, "已配置 $1 个"],
	// 会话列表
	[/^Delete session\? (.+)$/, "删除会话？$1"],
	[/^Rename Session$/, "重命名会话"],
	[/^trash: (.+)$/, "回收站: $1"],
	[/^path (.+)$/, "路径 $1"],
	[/^  No named sessions found\. Press (.+) to show all\.$/, "  未找到命名会话。按 $1 显示全部。"],
	[/^  No named sessions in current folder\. Press (.+?) to show all, or Tab to view all\.$/, "  当前文件夹中没有命名会话。按 $1 显示全部，或按 Tab 查看全部。"],
	[/^(.+) of (\d+)$/, "第 $1 条，共 $2 条"],
	// 对话树
	[/^\[compaction: (.+)\]$/, "[压缩: $1]"],
	[/^\[branch summary\]$/, "[分支摘要]"],
	[/^\[model: (.+)\]$/, "[模型: $1]"],
	[/^\[thinking: (.+)\]$/, "[思考: $1]"],
	[/^\[custom: (.+)\]$/, "[自定义: $1]"],
	[/^\[label: (.+)\]$/, "[标签: $1]"],
	[/^\[read: (.+)\]$/, "[读取: $1]"],
	[/^\[write: (.+)\]$/, "[写入: $1]"],
	[/^\[edit: (.+)\]$/, "[编辑: $1]"],
	[/^\[bash: (.+)\]$/, "[bash: $1]"],
	[/^\[grep: (.+)\]$/, "[grep: $1]"],
	[/^\[find: (.+)\]$/, "[查找: $1]"],
	[/^\[ls: (.+)\]$/, "[列目录: $1]"],
	[/^(\d+)\/(\d+)$/, "$1/$2"],
	// 模型配置
	[/^Session-only\. (.+) to save to settings\.$/, "仅当前会话。按 $1 保存到设置。"],
	[/^(\d+)\/(\d+) enabled(.+)$/, "$1/$2 已启用$3"],
	// 认证
	[/^Login to (.+)$/, "登录到 $1"],
	[/^Enter code: (.+)$/, "输入验证码: $1"],
	[/^e\.g\., (.+)$/, "例如，$1"],
	[/^Saved decision: (.*)$/, "已保存的决定: $1"],
	[/^Current session: (.+)$/, "当前会话: $1"],
	[/^(.+) \(inherited from (.+)\)$/, "$1（继承自 $2）"],
	// 主题
	[/^([✓ ]*)dark$/, "$1深色"],
	[/^([✓ ]*)light$/, "$1浅色"],
	// 设置页动态描述
	[/^(.+) queues follow-up messages until agent stops\. 'one-at-a-time': deliver one, wait for response\. 'all': deliver all at once\.$/, "$1 排队后续消息直到助手停止。'逐个'：一条一条发送并等待回复。'全部'：一次性全部发送。"],
	[/^Override the default thinking level for specific models\. (.+)$/, "为特定模型覆盖默认思考等级。$1"],
	[/^Step (\d+)\/(\d+) · (.+)$/, "步骤 $1/$2 · $3"],
	[/^(\d+) minutes?$/, "$1 分钟"],
	[/^(\d+) seconds?$/, "$1 秒"],
	[/^(\d+) hours?$/, "$1 小时"],
	// 选择器底部提示（含动态按键名）
	[/^(.+?) to select · (.+?) to set as default · (.+?) to cancel$/, "$1 选择 · $2 设为默认 · $3 取消"],
	[/^(.+?) to select · (.+?) to cancel$/, "$1 选择 · $2 取消"],
	// 加载 / 状态指示器
	[/^Retrying \((\d+)\/(\d+)\) in (\d+)s\.\.\. \((.+) to cancel\)$/, "正在重试（$1/$2），$3 秒后…（$4 取消）"],
	[/^Compacting context\.\.\. (.+)$/, "正在压缩上下文… $1"],
	[/^(Context overflow detected, )?Auto-compacting\.\.\. (.+)$/, "$1正在自动压缩… $2"],
	[/^Summarizing branch\.\.\. \((.+) to cancel\)$/, "正在生成分支摘要…（$1 取消）"],
	// 页脚思考等级
];

/**
 * Markdown 帮助页（/hotkeys）中需要翻译的整行文本。
 * 仅用于 Markdown 组件，避免误伤 LLM 正文。
 */
export const markdownLines: Record<string, string> = {
	"**Navigation**": "**导航**",
	"**Editing**": "**编辑**",
	"**Other**": "**其他**",
	"**Extensions**": "**扩展**",
	"| Key | Action |": "| 按键 | 操作 |",
};

/** Markdown 表格中「动作」列的整段文本。 */
export const markdownActions: Record<string, string> = {
	"Move cursor / browse history": "移动光标 / 浏览历史",
	"Move by word": "按词移动",
	"Start of line": "行首",
	"End of line": "行尾",
	"Jump forward to character": "向前跳转到字符",
	"Jump backward to character": "向后跳转到字符",
	"Scroll by page": "按页滚动",
	"Send message": "发送消息",
	"New line": "换行",
	"New line (Ctrl+Enter on Windows Terminal)": "换行（Windows Terminal 上为 Ctrl+Enter）",
	"Delete word backwards": "向后删除一个词",
	"Delete word forwards": "向前删除一个词",
	"Delete to start of line": "删除到行首",
	"Delete to end of line": "删除到行尾",
	"Paste the most-recently-deleted text": "粘贴最近删除的文本",
	"Cycle through the deleted text after pasting": "粘贴后循环切换已删除文本",
	Undo: "撤销",
	"Path completion / accept autocomplete": "路径补全 / 接受自动补全",
	"Cancel autocomplete / abort streaming": "取消自动补全 / 中止流式输出",
	"Clear editor (first) / exit (second)": "清空编辑器（第一次）/ 退出（第二次）",
	"Exit (when editor is empty)": "退出（编辑器为空时）",
	"Suspend to background": "挂起到后台",
	"Cycle thinking level": "切换思考等级",
	"Cycle models": "切换模型",
	"Open model selector": "打开模型选择器",
	"Toggle tool output expansion": "展开/收起工具输出",
	"Toggle thinking block visibility": "显示/隐藏思考块",
	"Edit message in external editor": "在外部编辑器中编辑消息",
	"Copy selection or last assistant message": "复制选中内容或最后一条助手消息",
	"Queue follow-up message": "排队后续消息",
	"Restore queued messages": "恢复排队消息",
	"Paste image or text from clipboard": "从剪贴板粘贴图片或文本",
	"Slash commands": "斜杠命令",
	"Run bash command": "运行 bash 命令",
	"Run bash command (excluded from context)": "运行 bash 命令（不入上下文）",
};
export { commandLabels, formatCommandLabel, markdownActions, markdownLines, phrases, rules, values };
export type { CommandLabel, TranslationRule };

/** 超过该长度的文本不翻译（保护 LLM / 工具输出等大段内容）。 */
const MAX_TEXT_LENGTH = 8000;
/** 单行超过该长度不翻译。 */
const MAX_LINE_LENGTH = 600;

const cache = new Map<string, string>();
const CACHE_LIMIT = 4000;

/** 常见 ANSI 转义序列：CSI 与 OSC（含超链接）。 */
const ANSI_RE = /\x1b(?:\[[0-9;?]*[ -/]*[@-~]|\][^\x07\x1b]*(?:\x07|\x1b\\))/g;

/** 翻译单个纯文本片段（可能含首尾空白）。 */
export function translatePlain(input: string): string {
	if (!input) return input;
	const cached = cache.get(input);
	if (cached !== undefined) return cached;
	let result: string;
	try {
		result = translatePlainUncached(input);
	} catch {
		result = input;
	}
	if (cache.size >= CACHE_LIMIT) cache.clear();
	cache.set(input, result);
	return result;
}

function translatePlainUncached(input: string): string {
	// 1) 整段精确命中
	const direct = phrases[input];
	if (direct !== undefined) return direct;
	const directValue = values[input];
	if (directValue !== undefined) return directValue;

	// 2) 去掉首尾空白后再试（保留原始空白）
	const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(input);
	if (!match) return input;
	const [, lead, core, trail] = match;

	// 3) 带前缀徽标（✓ / ○ / ● / ◉ / →）的枚举值，如「✓ dark」「  off」
	const badge = /^([✓●○◉→\s]+)(\S[\s\S]*)$/.exec(core);
	if (badge && values[badge[2]] !== undefined) {
		return lead + badge[1] + values[badge[2]] + trail;
	}

	// 4) 「描述 · default」后缀
	if (core.endsWith(" · default")) {
		const base = core.slice(0, -" · default".length);
		const translatedBase = translatePlain(base);
		return lead + translatedBase + " · 默认" + trail;
	}

	// 5) 「名称 • 枚举值」形式（页脚模型/思考等级）
	const bullet = /^(.+?) • (\S+)$/.exec(core);
	if (bullet && values[bullet[2]] !== undefined) {
		return lead + bullet[1] + " • " + values[bullet[2]] + trail;
	}

	if (core === input) {
		// 无首尾空白：只跑规则
		for (const [re, rep] of rules) {
			if (re.test(input)) return input.replace(re, rep);
		}
		return input;
	}
	const coreDirect = phrases[core];
	if (coreDirect !== undefined) return lead + coreDirect + trail;
	const coreValue = values[core];
	if (coreValue !== undefined) return lead + coreValue + trail;
	for (const [re, rep] of rules) {
		if (re.test(core)) return lead + core.replace(re, rep) + trail;
	}
	return input;
}

/** 翻译一段可能包含 ANSI 的文本，按行 + ANSI 片段处理。 */
export function translateAnsiText(text: string): string {
	if (!text || text.length > MAX_TEXT_LENGTH) return text;
	if (!/[A-Za-z]/.test(text)) return text;
	const lines = text.split("\n");
	let changed = false;
	const out = lines.map((line) => {
		if (line.length > MAX_LINE_LENGTH || !/[A-Za-z]/.test(line)) return line;
		const translated = translateAnsiLine(line);
		if (translated !== line) changed = true;
		return translated;
	});
	return changed ? out.join("\n") : text;
}

function translateAnsiLine(line: string): string {
	let result = "";
	let lastIndex = 0;
	ANSI_RE.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = ANSI_RE.exec(line)) !== null) {
		result += translatePlain(line.slice(lastIndex, match.index)) + match[0];
		lastIndex = match.index + match[0].length;
	}
	result += translatePlain(line.slice(lastIndex));
	return result;
}

/** 翻译 Markdown（仅精确行与表格动作列，避免影响 LLM 正文）。 */
export function translateMarkdown(text: string): string {
	if (!text || text.length > MAX_TEXT_LENGTH) return text;
	if (!/[A-Za-z]/.test(text)) return text;
	const lines = text.split("\n");
	let changed = false;
	const out = lines.map((line) => {
		if (line.length > MAX_LINE_LENGTH || !/[A-Za-z]/.test(line)) return line;
		const translated = translateMarkdownLine(line);
		if (translated !== line) changed = true;
		return translated;
	});
	return changed ? out.join("\n") : text;
}

function translateMarkdownLine(line: string): string {
	const trimmed = line.trim();
	const lineDirect = markdownLines[trimmed];
	if (lineDirect !== undefined) {
		const index = line.indexOf(trimmed);
		return line.slice(0, index) + lineDirect + line.slice(index + trimmed.length);
	}
	// 表格行：| 按键 | 动作 |
	if (line.includes("|")) {
		const cells = line.split("|");
		if (cells.length >= 4) {
			let changed = false;
			for (let i = 0; i < cells.length; i++) {
				const cellTrim = cells[i].trim();
				const action = markdownActions[cellTrim];
				if (action !== undefined && action !== cellTrim) {
					const index = cells[i].indexOf(cellTrim);
					cells[i] = cells[i].slice(0, index) + action + cells[i].slice(index + cellTrim.length);
					changed = true;
				}
			}
			if (changed) return cells.join("|");
		}
	}
	return line;
}

/** 翻译一组渲染后的行。 */
export function translateLines(lines: string[]): string[] {
	if (!Array.isArray(lines)) return lines;
	let changed = false;
	const out = lines.map((line) => {
		if (typeof line !== "string") return line;
		const translated = translateAnsiText(line);
		if (translated !== line) changed = true;
		return translated;
	});
	return changed ? out : lines;
}

/** UI 文案。 */
export const zh = {
	statusActive: "中文命令 ✓",
	working: "思考中…",
	hiddenThinking: "思考中…",
	notifyReady: "中文界面已启用：命令补全、二级页面与提示均已汉化（输入 /help 查看全部命令）",
} as const;
