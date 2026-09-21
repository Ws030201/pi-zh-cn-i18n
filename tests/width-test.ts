/**
 * TUI 宽度回归测试：验证 pi-zh-cn 的宽度安全层。
 *
 * 通过 `pi -e tests/width-test.ts` 加载，然后执行 /widthtest。
 *
 * 关键复现：FooterComponent 会在原宽度布局完成后再被翻译
 * （max → 最大 使右侧变宽），从而出现
 * `Rendered line N exceeds terminal width`。本测试在多个宽度下
 * 渲染真实组件，断言每一行 visibleWidth <= width，且中文仍被保留。
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
	getMarkdownTheme,
	getSelectListTheme,
	getSettingsListTheme,
	FooterComponent,
	ShowImagesSelectorComponent,
	ThinkingSelectorComponent,
	UserMessageSelectorComponent,
} from "@earendil-works/pi-coding-agent";
import * as piNamespace from "@earendil-works/pi-coding-agent";
import * as tuiNamespace from "@earendil-works/pi-tui";
import { Markdown, SelectList, SettingsList, Text, TruncatedText, visibleWidth } from "@earendil-works/pi-tui";
import { translateAnsiText } from "../src/translations";
import { installTuiPatches } from "../src/tui";
import { fitLineToWidth, fitLinesToWidth, registerTranslator } from "../src/utils";

function check(name: string, pass: boolean, detail = ""): string {
	return `${pass ? "PASS" : "FAIL"} ${name}${detail ? ` :: ${detail}` : ""}`;
}

/** 断言一组行的每一行都不超过 width。 */
function linesFit(lines: string[], width: number): { ok: boolean; worst: number; bad: string } {
	let worst = 0;
	let bad = "";
	for (const line of lines) {
		const w = visibleWidth(line);
		if (w > worst) worst = w;
		if (w > width && !bad) bad = line;
	}
	return { ok: worst <= width, worst, bad };
}

const WIDTHS = [12, 20, 30, 40, 60, 80, 100, 120, 160, 210];

export default function (pi: ExtensionAPI) {
	// 测试自带补丁安装，无需先安装 pi-zh-cn 包。
	registerTranslator();
	installTuiPatches(piNamespace, tuiNamespace);

	pi.registerCommand("widthtest", {
		description: "Test Chinese TUI width fitting",
		handler: async (_args, ctx) => {
			const results: string[] = [];

			// ============================================================
			// 1) 纯函数：模拟页脚两列布局被翻译撑宽
			// ============================================================
			try {
				const gap = " ".repeat(60);
				const raw = `\x1b[38;2;102;102;102m0.0%/1.0M (auto)\x1b[39m\x1b[38;2;102;102;102m${gap}deepseek-flash • max\x1b[39m`;
				const translated = translateAnsiText(raw);
				const tw = visibleWidth(translated);
				const target = tw - 1; // 故意比翻译后窄 1 列
				const fitted = fitLineToWidth(translated, target);
				results.push(
					check(
						"footer two-column refit",
						visibleWidth(fitted) <= target && fitted.includes("最大"),
						`translated=${tw} target=${target} fitted=${visibleWidth(fitted)}`,
					),
				);
			} catch (error) {
				results.push("FAIL footer two-column refit: " + String(error));
			}

			// ============================================================
			// 2) 纯函数：超长不可断的宽字符 / Emoji / ANSI
			// ============================================================
			try {
				const cjk = fitLineToWidth("中".repeat(100), 30);
				results.push(check("long CJK truncation", visibleWidth(cjk) === 30, `w=${visibleWidth(cjk)}`));
				const emoji = fitLineToWidth("😀".repeat(50), 31);
				results.push(check("long emoji truncation", visibleWidth(emoji) <= 31, `w=${visibleWidth(emoji)}`));
				const colored = fitLineToWidth("\x1b[31m" + "宽".repeat(40) + "\x1b[0m", 25);
				results.push(
					check(
						"ANSI colored truncation",
						visibleWidth(colored) <= 25 && colored.includes("\x1b[31m"),
						`w=${visibleWidth(colored)}`,
					),
				);
				const noHardcode = fitLineToWidth("a".repeat(500), 137);
				results.push(
					check("arbitrary width (no hardcode)", visibleWidth(noHardcode) <= 137, `w=${visibleWidth(noHardcode)}`),
				);
			} catch (error) {
				results.push("FAIL pure width helpers: " + String(error));
			}

			// fitLinesToWidth 保留已合规行
			try {
				const lines = ["short", "x".repeat(50), "中".repeat(50)];
				const fitted = fitLinesToWidth(lines, 20);
				results.push(
					check(
						"fitLinesToWidth all lines",
						fitted[0] === "short" && visibleWidth(fitted[1]) <= 20 && visibleWidth(fitted[2]) <= 20,
					),
				);
			} catch (error) {
				results.push("FAIL fitLinesToWidth: " + String(error));
			}

			// ============================================================
			// 3) 真实 FooterComponent —— 崩溃现场复现
			// ============================================================
			try {
				const session: any = {
					state: {
						model: { id: "deepseek-flash", provider: "deepseek", contextWindow: 1000000, reasoning: true },
						thinkingLevel: "max",
					},
					sessionManager: {
						getEntries: () => [],
						getCwd: () => process.cwd(),
						getSessionName: () => undefined,
					},
					getContextUsage: () => ({ percent: 0, contextWindow: 1000000 }),
					modelRuntime: { isUsingSubscription: () => false },
				};
				const footerData: any = {
					getGitBranch: () => undefined,
					getAvailableProviderCount: () => 1,
					getExtensionStatuses: () => new Map(),
				};
				const footer = new FooterComponent(session, footerData);
				let allOk = true;
				let localized = false;
				let detail = "";
				for (const width of WIDTHS) {
					const lines = footer.render(width);
					const fit = linesFit(lines, width);
					if (!fit.ok) {
						allOk = false;
						detail = `width=${width} worst=${fit.worst}`;
					}
					if (lines.some((l) => l.includes("最大"))) localized = true;
				}
				results.push(check("FooterComponent fits all widths", allOk, detail));
				results.push(check("FooterComponent keeps zh (最大)", localized));
				// 精确复现：宽度 210 时原崩溃
				const at210 = footer.render(210);
				const fit210 = linesFit(at210, 210);
				results.push(
					check(
						"FooterComponent @210 (crash case)",
						fit210.ok && at210.some((l) => l.includes("最大")),
						`worst=${fit210.worst}`,
					),
				);
			} catch (error) {
				results.push("FAIL FooterComponent: " + String(error));
			}

			// ============================================================
			// 4) 其它基础组件与选择器：多宽度断言
			// ============================================================
			const components: Array<{ name: string; make: () => { render: (w: number) => string[] } }> = [
				{
					name: "Text",
					make: () => new Text("\x1b[2mUser:\x1b[0m 在终端内联显示图片 Automatically compact context", 0, 0),
				},
				{
					name: "TruncatedText",
					make: () => new TruncatedText("User: 在终端内联显示图片 Automatically compact context when it gets too large", 1, 0),
				},
				{
					name: "SelectList",
					make: () =>
						new SelectList(
							[
								{ value: "a", label: "Yes", description: "Show images inline in terminal" },
								{ value: "b", label: "No", description: "Show text placeholder instead" },
							],
							5,
							getSelectListTheme(),
						),
				},
				{
					name: "SelectList slash layout",
					make: () =>
						new SelectList(
							[
								{ value: "model", label: "/model", description: "（模型）选择并切换模型" },
								{ value: "scoped-models", label: "/scoped-models", description: "（模型范围）启用/禁用 Ctrl+P 循环的模型" },
							],
							6,
							getSelectListTheme(),
							{ minPrimaryColumnWidth: 12, maxPrimaryColumnWidth: 32 },
						),
				},
				{
					name: "SettingsList",
					make: () =>
						new SettingsList(
							[
								{
									id: "autocompact",
									label: "Auto-compact",
									description: "Automatically compact context when it gets too large",
									currentValue: "true",
									values: ["true", "false"],
								},
							],
							10,
							getSettingsListTheme(),
							() => {},
							() => {},
						),
				},
				{
					name: "Markdown",
					make: () => new Markdown("**导航**\n\n| 按键 | 操作 |\n| --- | --- |\n| `↑` | 移动光标 / 浏览历史 |", 0, 0, getMarkdownTheme()),
				},
				{
					name: "ShowImagesSelector",
					make: () => new ShowImagesSelectorComponent(true, () => {}, () => {}),
				},
				{
					name: "ThinkingSelector",
					make: () =>
						new ThinkingSelectorComponent("medium", ["off", "low", "medium", "high"], () => {}, () => {}, () => {}, "medium"),
				},
				{
					name: "UserMessageSelector",
					make: () => new UserMessageSelectorComponent([{ id: "1", text: "hello" }], () => {}, () => {}, "1"),
				},
			];

			for (const { name, make } of components) {
				try {
					const comp = make();
					let ok = true;
					let detail = "";
					for (const width of WIDTHS) {
						const fit = linesFit(comp.render(width), width);
						if (!fit.ok) {
							ok = false;
							detail = `width=${width} worst=${fit.worst}`;
						}
					}
					results.push(check(`${name} fits all widths`, ok, detail));
				} catch (error) {
					results.push(`FAIL ${name}: ${String(error)}`);
				}
			}

			ctx.ui.notify("WIDTHTEST\n" + results.join("\n"), "info");
		},
	});
}
