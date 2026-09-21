/**
 * Pi 中文界面扩展（pi-zh-cn）
 * ===========================
 *
 * 让 Pi 从命令补全菜单、二级页面、选择器、设置页、帮助页到提示信息
 * 尽可能全部中文化，同时**不新增任何重复的中文命令**。
 *
 * 实现分三层：
 *   1. 显示层：命令补全菜单 + /help（官方英文命令不变）；
 *   2. 运行层：对 Pi 内置 TUI 组件做「渲染后翻译 + 宽度收紧」补丁
 *      （覆盖 /settings、/model、/tree、/resume、/hotkeys 等二级界面）；
 *   3. 词典层：所有中文集中在 src/translations.ts，未收录英文自动回退。
 *
 * 不修改 Pi 核心源码与 node_modules。
 *
 * 安装（推荐）：
 *   pi install npm:pi-zh-cn
 *   或  pi install git:github.com/<username>/pi-zh-cn
 */
import * as piNamespace from "@earendil-works/pi-coding-agent";
import * as tuiNamespace from "@earendil-works/pi-tui";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
	createZhAutocompleteProvider,
	registerHelpCommand,
	registerZhRenderers,
} from "./src/commands";
import { zh } from "./src/translations";
import { installTuiPatches } from "./src/tui";
import { registerTranslator } from "./src/utils";

/** 安装运行时 TUI 汉化补丁（幂等）。 */
function ensurePatched(): void {
	try {
		registerTranslator();
		installTuiPatches(piNamespace, tuiNamespace);
	} catch {
		// 任何失败都静默回退英文，不影响 Pi 运行。
	}
}

/** 安全调用可选 API：函数不存在或抛错都静默跳过。 */
function safeCall(fn: () => void): void {
	try {
		fn();
	} catch {
		// 忽略：不同 Pi 版本的可选 API 差异
	}
}

/** 取 ctx.ui 的宽松视图，便于做能力探测。 */
function uiOf(ctx: unknown): Record<string, unknown> {
	return ((ctx as { ui?: unknown } | undefined)?.ui ?? {}) as Record<string, unknown>;
}

/** 调用 ctx.ui 上的可选方法（自动能力探测，无则跳过）。 */
function callUi(ui: Record<string, unknown>, method: string, ...args: unknown[]): void {
	safeCall(() => {
		const fn = ui[method];
		if (typeof fn === "function") (fn as (...a: unknown[]) => unknown).apply(ui, args);
	});
}

export default function piZhCnExtension(pi: ExtensionAPI): void {
	// 0) 运行时组件层汉化（越早安装越好）
	ensurePatched();

	// 1) /help 命令与中文条目渲染器（内部已做版本能力探测）
	registerHelpCommand(pi);
	registerZhRenderers(pi);

	// Pi 极早期版本可能没有 pi.on，此时静默跳过事件注册。
	if (typeof pi.on !== "function") return;

	// 2) 会话启动：安装补全菜单中文化包装器，并中文化状态信息
	pi.on("session_start", async (event, ctx) => {
		// 重载 / 会话替换后重新安装，保证词典是最新的。
		ensurePatched();

		const ui = uiOf(ctx);
		// 核心：在原补全提供器外层包一层，只改写命令的显示名称/说明。
		// 在 RPC / 打印模式下该方法是安全的空操作。
		callUi(ui, "addAutocompleteProvider", createZhAutocompleteProvider);
		callUi(ui, "setStatus", "pi-zh-cn", zh.statusActive);
		callUi(ui, "setHiddenThinkingLabel", zh.hiddenThinking);
		if (event.reason === "startup") {
			callUi(ui, "notify", zh.notifyReady, "info");
		}
	});

	// 3) 中文化流式工作提示
	pi.on("agent_start", async (_event, ctx) => {
		callUi(uiOf(ctx), "setWorkingMessage", zh.working);
	});
	pi.on("agent_settled", async (_event, ctx) => {
		// 不传参数即恢复 Pi 默认的工作提示
		callUi(uiOf(ctx), "setWorkingMessage");
	});

	// 4) 会话结束清理状态栏
	pi.on("session_shutdown", async (_event, ctx) => {
		callUi(uiOf(ctx), "setStatus", "pi-zh-cn", undefined);
	});
}
