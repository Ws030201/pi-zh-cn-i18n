/**
 * TUI 宽度安全层。
 *
 * 背景：本插件对内置组件采用「渲染后翻译」时，英文变中文会让可见宽度变大
 * （CJK 字符为双列宽、Emoji 通常也是双列宽），而原组件已经按旧宽度完成
 * 布局、截断与补白，于是最终行可能超过终端宽度，触发 Pi 的
 * `Rendered line N exceeds terminal width` 崩溃。
 *
 * 解决：在所有翻译出口统一调用本模块，把结果收紧到 render(width) 给出的
 * 当前可用宽度。宽度始终来自 render 的实参，随终端缩放实时变化，
 * **不写死任何固定列数**。
 *
 * 处理顺序：
 *   1. 用 pi-tui 的 visibleWidth() 计算真实显示宽度
 *      （自动忽略 ANSI/OSC/APC 转义序列，并按 grapheme 正确识别中文 / Emoji）。
 *   2. 若超宽，先尝试从行内空白间隙回收空间——左右两列布局的填充、
 *      列间距、缩进都属于可回收空白，回收后可同时保留左右内容。
 *   3. 仍无法容纳时才用 pi-tui 的 truncateToWidth() 截断（ANSI 感知）。
 */
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { translateAnsiText, translateLines, translateMarkdown, translatePlain } from "./translations";

/**
 * 匹配 ANSI/OSC/APC 等转义序列，避免把序列内部的空格误当成可回收空白。
 * 覆盖：CSI、OSC（含 OSC 8 超链接）、APC（如 CURSOR_MARKER）以及双字符转义。
 */
const ESCAPE_RE =
	/\x1b(?:\[[0-9;?]*[ -/]*[@-~]|\][^\x07\x1b]*(?:\x07|\x1b\\)|_[^\x1b]*(?:\x1b\\)|[@-Z\\-_])/g;

/**
 * 从行内「转义序列之外」的空白段回收 `excess` 个可见列。
 *
 * - 只删除 U+0020 空格，绝不触碰中文、Emoji 或其它可见字符；
 * - 优先回收最长的空白段（通常是两列之间的填充），从段中部删除，
 *   让左右两列都保持可见；
 * - 返回 null 表示没有任何可回收空白。
 */
function reclaimSpaces(line: string, excess: number): string | null {
	if (excess <= 0) return line;

	// 先标记所有转义序列占用的区间，后续跳过。
	const protectedRanges: Array<[number, number]> = [];
	ESCAPE_RE.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = ESCAPE_RE.exec(line)) !== null) {
		protectedRanges.push([match.index, match.index + match[0].length]);
	}

	// 收集所有可回收的连续空格段。
	const runs: Array<{ start: number; end: number }> = [];
	const n = line.length;
	let i = 0;
	let p = 0;
	while (i < n) {
		while (p < protectedRanges.length && protectedRanges[p][1] <= i) p++;
		const prot = protectedRanges[p];
		if (prot && i >= prot[0] && i < prot[1]) {
			i = prot[1];
			continue;
		}
		if (line[i] === " ") {
			const start = i;
			while (i < n && line[i] === " ") i++;
			runs.push({ start, end: i });
		} else {
			i++;
		}
	}
	if (runs.length === 0) return null;

	// 最长空白段优先。
	runs.sort((a, b) => b.end - b.start - (a.end - a.start));

	let remaining = excess;
	const removals: Array<{ start: number; end: number }> = [];
	for (const run of runs) {
		if (remaining <= 0) break;
		const len = run.end - run.start;
		const take = Math.min(len, remaining);
		remaining -= take;
		// 从段中部删除，尽量保留两侧间距，视觉更均衡。
		const keepLeft = Math.floor((len - take) / 2);
		removals.push({ start: run.start + keepLeft, end: run.start + keepLeft + take });
	}
	if (removals.length === 0) return null;

	// 从后往前删除，保证下标不失效。
	removals.sort((a, b) => b.start - a.start);
	let out = line;
	for (const { start, end } of removals) {
		out = out.slice(0, start) + out.slice(end);
	}
	return out;
}

/**
 * 把单行收紧到 `maxWidth` 可见列。
 *
 * 返回的字符串保证 `visibleWidth(result) <= maxWidth`。
 * 对左右两列布局（左内容 + 填充 + 右内容）会优先回收中间填充，
 * 因此不会直接截掉右侧中文。
 */
export function fitLineToWidth(line: string, maxWidth: number): string {
	if (typeof line !== "string") return line;
	if (!Number.isFinite(maxWidth) || maxWidth < 0) return line;
	const width = visibleWidth(line);
	if (width <= maxWidth) return line;

	const excess = width - maxWidth;

	// 1) 从空白间隙回收（保留可见内容）。
	try {
		const reclaimed = reclaimSpaces(line, excess);
		if (reclaimed !== null && visibleWidth(reclaimed) <= maxWidth) {
			return reclaimed;
		}
	} catch {
		// 回收失败则走截断兜底。
	}

	// 2) 官方 ANSI 感知截断兜底。
	try {
		return truncateToWidth(line, maxWidth, "", false);
	} catch {
		return line;
	}
}

/**
 * 把整组渲染行收紧到 `maxWidth`。
 * 未超宽的行原样返回；全部合规时返回原数组，避免无谓分配与失效。
 */
export function fitLinesToWidth(lines: string[], maxWidth: number): string[] {
	if (!Array.isArray(lines)) return lines;
	if (!Number.isFinite(maxWidth) || maxWidth < 0) return lines;
	let changed = false;
	const out = lines.map((line) => {
		if (typeof line !== "string") return line;
		if (visibleWidth(line) <= maxWidth) return line;
		changed = true;
		return fitLineToWidth(line, maxWidth);
	});
	return changed ? out : lines;
}
/**
 * 运行时补丁基础设施。
 *
 * 目的：Pi 内置的二级页面组件把英文文案硬编码在核心中，扩展 API 无法重写。
 * 本插件在内存中为这些组件的原型包一层「渲染后翻译」，从而汉化显示，
 * **不修改任何源文件 / node_modules**。
 *
 * 兼容性策略：
 *   - 所有包装都带 try/catch，失败即回退原实现；
 *   - 通过 `Symbol.for` 标记避免重复包装；
 *   - 翻译函数放在 globalThis 注册表中，/reload 后可热更新词典。
 */
/** 跨模块实例共享的补丁标记。 */
export const PATCH_MARK = Symbol.for("pi-zh-cn.patched");
/** 跨模块实例共享的翻译函数注册表。 */
export const TRANSLATOR_REGISTRY = Symbol.for("pi-zh-cn.translator");

export interface Translator {
	translatePlain: typeof translatePlain;
	translateAnsiText: typeof translateAnsiText;
	translateLines: typeof translateLines;
	translateMarkdown: typeof translateMarkdown;
}

/** 注册/刷新全局翻译器，供已安装的补丁在 /reload 后取用。 */
export function registerTranslator(): void {
	(globalThis as Record<symbol, unknown>)[TRANSLATOR_REGISTRY] = {
		translatePlain,
		translateAnsiText,
		translateLines,
		translateMarkdown,
	} satisfies Translator;
}

export function getTranslator(): Translator | undefined {
	return (globalThis as Record<symbol, unknown>)[TRANSLATOR_REGISTRY] as Translator | undefined;
}

/** 标记原型上某个补丁是否已安装。返回 true 表示本次应当安装。 */
export function claimPatch(proto: unknown, name: string): boolean {
	if (!proto || (typeof proto !== "object" && typeof proto !== "function")) return false;
	try {
		const holder = proto as Record<symbol, unknown>;
		let set = holder[PATCH_MARK];
		if (!(set instanceof Set)) {
			set = new Set<string>();
			Object.defineProperty(proto, PATCH_MARK, {
				value: set,
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		const typed = set as Set<string>;
		if (typed.has(name)) return false;
		typed.add(name);
		return true;
	} catch {
		return false;
	}
}
