/**
 * 命令与补全层：命令补全菜单中文化、/help 命令、/help 自定义条目渲染器。
 *
 * 所有中文来自 ./translations，命令名 / value 保持英文，仅修改显示。
 */
import type { EntryRenderer, ExtensionAPI, Theme } from "@earendil-works/pi-coding-agent";
import { getMarkdownTheme } from "@earendil-works/pi-coding-agent";
import type {
	AutocompleteItem,
	AutocompleteProvider,
	AutocompleteSuggestions,
} from "@earendil-works/pi-tui";
import { Box, Markdown } from "@earendil-works/pi-tui";
import { commandLabels, formatCommandLabel } from "./translations";

/**
 * 自定义会话条目的 TUI 渲染器。
 *
 * /help 使用 pi.appendEntry() 写入 CustomEntry：这类条目不会进入 LLM 上下文，
 * 仅作为界面信息持久显示。这里为它注册 Markdown 渲染器，在交互式 TUI 中美观展示。
 */



/** /help 帮助信息的条目类型。 */
export const ENTRY_HELP = "中文·帮助";

function markdownRenderer(): EntryRenderer<string> {
	return (entry, _options, theme: Theme) => {
		const markdownText = typeof entry.data === "string" ? entry.data : "";
		if (!markdownText) return undefined;
		const box = new Box(1, 1, (text) => theme.bg("customMessageBg", text));
		box.addChild(new Markdown(markdownText, 0, 0, getMarkdownTheme()));
		return box;
	};
}

/** 注册条目标题渲染器。 */
export function registerZhRenderers(pi: ExtensionAPI): void {
	pi.registerEntryRenderer(ENTRY_HELP, markdownRenderer());
}

/**
 * 命令补全菜单中文化（核心实现）。
 *
 * Pi 的内置命令说明（如 "Select model"）硬编码在核心的 BUILTIN_SLASH_COMMANDS 中，
 * 扩展无法直接改写。但 Pi 提供了公开的 TUI 扩展点：
 *
 *     ctx.ui.addAutocompleteProvider(factory)
 *
 * 它允许扩展在「内置补全提供器」外层再包一层。我们只在显示层把匹配到的
 * 官方英文命令改写为：
 *
 *     /model     （模型）选择并切换模型
 *
 * 关键点：
 *   - item.value 保持官方命令名不变 → 选中后补全插入的仍是 /model，执行不受影响；
 *   - 只改 item.label（显示为 /model）与 item.description（中文说明）；
 *   - 仅在「正在输入命令名」（前缀以 / 开头且不含空格）时改写，
 *     参数补全（如 /model 后的模型名）保持原样；
 *   - 不在映射表里的命令（其他扩展/技能/模板）保持原样，互不干扰。
 *
 * 由于只是包装现有 provider，不依赖任何 Pi 私有实现，升级兼容性最好。
 */


/** 判断是否处于「输入斜杠命令名」阶段（而非参数阶段）。 */
export function isCommandNamePrefix(prefix: string): boolean {
	return prefix.startsWith("/") && !prefix.includes(" ");
}

/**
 * 纯函数：把命令补全项改写为「/英文命令 + （中文名）中文说明」。
 * 未收录的命令原样返回。
 */
export function translateCommandItems(prefix: string, items: AutocompleteItem[]): AutocompleteItem[] {
	if (!isCommandNamePrefix(prefix)) return items;
	return items.map((item) => {
		const label = commandLabels[item.value];
		if (!label) return item;
		return {
			value: item.value, // 真实命令名，保证补全后执行的是官方命令
			label: `/${item.value}`, // 菜单主列显示 /model
			description: formatCommandLabel(label), // 次列显示 （模型）选择并切换模型
		};
	});
}

/**
 * 包装当前补全提供器，返回一个只改写命令显示、其余行为完全委托给原提供器的代理。
 *
 * 使用 Object.create(current) 保留原型链，避免丢失类的原型方法；
 * 仅覆盖 getSuggestions，applyCompletion / triggerCharacters /
 * shouldTriggerFileCompletion 等继续使用原实现。
 */
export function createZhAutocompleteProvider(current: AutocompleteProvider): AutocompleteProvider {
	const wrapper = Object.create(current) as AutocompleteProvider;

	wrapper.getSuggestions = async (
		lines: string[],
		cursorLine: number,
		cursorCol: number,
		options: { signal: AbortSignal; force?: boolean },
	): Promise<AutocompleteSuggestions | null> => {
		const result = await current.getSuggestions(lines, cursorLine, cursorCol, options);
		if (!result) return result;
		return {
			prefix: result.prefix,
			items: translateCommandItems(result.prefix, result.items),
		};
	};

	return wrapper;
}

/**
 * /help 命令：用中文列出所有可用命令。
 *
 * Pi 没有内置 /help，因此这里新增一个官方风格的英文命令 /help，
 * 执行结果以中文 Markdown 卡片展示（不进入 LLM 上下文）。
 */



/** 帮助中的命令顺序（常用在前）。 */
const HELP_ORDER = [
	"help",
	"model",
	"thinking",
	"session",
	"settings",
	"new",
	"resume",
	"tree",
	"compact",
	"reload",
	"hotkeys",
	"quit",
	"scoped-models",
	"export",
	"import",
	"share",
	"copy",
	"name",
	"changelog",
	"fork",
	"clone",
	"trust",
	"login",
	"logout",
	"bug",
	"llama",
];

/** 生成中文帮助 Markdown。 */
export function buildHelpMarkdown(pi: ExtensionAPI): string {
	const lines: string[] = [];
	lines.push("# Pi 命令帮助（中文）", "");
	lines.push("直接输入英文命令执行，括号内为中文名称。", "");

	const ordered = HELP_ORDER.filter((name) => commandLabels[name]);
	// 补上映射表中存在但未列入 HELP_ORDER 的命令，避免遗漏
	for (const name of Object.keys(commandLabels)) {
		if (!ordered.includes(name)) ordered.push(name);
	}

	const pad = Math.max(...ordered.map((name) => name.length), 0);
	const codeLines = ordered.map((name) => {
		const label = commandLabels[name];
		return `/${name}${" ".repeat(pad - name.length + 2)}${formatCommandLabel(label)}`;
	});
	lines.push("```");
	lines.push(...codeLines);
	lines.push("```");

	// 其他扩展 / 技能 / 提示模板命令保持原样列出，避免与官方命令混淆。
	const others = pi
		.getCommands()
		.filter((command) => !commandLabels[command.name])
		.map((command) => {
			const tag = command.source === "skill" ? "技能" : command.source === "prompt" ? "提示模板" : "扩展";
			const description = command.description ? ` — ${command.description}` : "";
			return `- \`/${command.name}\`（${tag}）${description}`;
		});
	if (others.length > 0) {
		lines.push("", "## 其他扩展 / 技能 / 提示模板命令", "");
		lines.push(...others);
	}

	lines.push(
		"",
		"> 说明：以上英文命令均为 Pi 官方命令，本插件未做重命名；中文名称仅显示在命令补全菜单与帮助中。",
	);
	return lines.join("\n");
}

/** 注册 /help 命令。 */
export function registerHelpCommand(pi: ExtensionAPI): void {
	pi.registerCommand("help", {
		description: formatCommandLabel(commandLabels.help),
		handler: async (_args, _ctx) => {
			pi.appendEntry(ENTRY_HELP, buildHelpMarkdown(pi));
		},
	});
}
