/**
 * 测试专用扩展：验证 pi-zh-cn 的词典翻译与运行时组件补丁。
 *
 * 通过 `pi -e tests/translations-test.ts` 加载，然后执行 /zhtest。
 * 关键点：本扩展导入的 Text / SelectList 与 pi-zh-cn 补丁作用于**同一个类**，
 * 因此可以直接断言 Text 渲染结果已变为中文。
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as piNamespace from "@earendil-works/pi-coding-agent";
import * as tuiNamespace from "@earendil-works/pi-tui";
import { getMarkdownTheme, getSelectListTheme, getSettingsListTheme } from "@earendil-works/pi-coding-agent";
import {
	Markdown,
	SelectList,
	SettingsList,
	Text,
} from "@earendil-works/pi-tui";
import {
	ShowImagesSelectorComponent,
	ThinkingSelectorComponent,
	UserMessageSelectorComponent,
} from "@earendil-works/pi-coding-agent";
import {
	translateAnsiText,
	translateMarkdown,
	translatePlain,
} from "../src/translations";
import { installTuiPatches } from "../src/tui";
import { registerTranslator } from "../src/utils";

function check(name: string, pass: boolean): string {
	return `${pass ? "PASS" : "FAIL"} ${name}`;
}

export default function (pi: ExtensionAPI) {
	// 测试自带补丁安装，无需先安装 pi-zh-cn 包。
	registerTranslator();
	installTuiPatches(piNamespace, tuiNamespace);

	pi.registerCommand("zhtest", {
		description: "Test zh-cn translator and TUI patches",
		handler: async (_args, ctx) => {
			const results: string[] = [];

			// ---- 纯文本翻译 ----
			results.push(check("exact: Select model", translatePlain("Select model") === "选择模型"));
			results.push(check("trim: Yes", translatePlain("  Yes  ") === "  是  "));
			results.push(check("value: one-at-a-time", translatePlain("one-at-a-time") === "逐个"));
			results.push(check("value: dark", translatePlain("dark") === "深色"));
			results.push(check("value: badge dark", translatePlain("✓ dark") === "✓ 深色"));
			results.push(check("value: badge medium", translatePlain("✓ medium") === "✓ 中"));
			results.push(
				check(
					"dynamic: default suffix",
					translatePlain("Moderate reasoning (~8k tokens) · default") === "中度推理（约 8k tokens） · 默认",
				),
			);
			results.push(
				check(
					"dynamic: hint line",
					translatePlain("ctrl+enter to select · ctrl+s to set as default · escape to cancel") ===
						"ctrl+enter 选择 · ctrl+s 设为默认 · escape 取消",
				),
			);
			results.push(check("dynamic: session name", translatePlain("Session name: foo") === "会话名称: foo"));
			results.push(check("fallback: unknown", translatePlain("Some unknown English") === "Some unknown English"));

			// ---- ANSI 翻译 ----
			const ansi = translateAnsiText("\x1b[2mUser:\x1b[0m 3");
			results.push(check("ansi: User:", ansi.includes("用户:") && ansi.includes("\x1b[2m")));

			// ---- Markdown 帮助页 ----
			const md = translateMarkdown("**Navigation**\n| `↑` | Move cursor / browse history |");
			results.push(check("markdown heading", md.includes("**导航**")));
			results.push(check("markdown table action", md.includes("移动光标 / 浏览历史")));

			// ---- Text 组件补丁是否生效 ----
			try {
				const text = new Text("\x1b[2mUser:\x1b[0m 3", 0, 0);
				const rendered = text.render(40).join("\n");
				results.push(check("Text patch", rendered.includes("用户:")));
			} catch (error) {
				results.push("FAIL Text patch: " + String(error));
			}

			// ---- SelectList 组件补丁是否生效 ----
			try {
				const list = new SelectList(
					[
						{ value: "a", label: "Yes", description: "Show images inline in terminal" },
						{ value: "b", label: "No", description: "Show text placeholder instead" },
					],
					5,
					getSelectListTheme(),
				);
				const rendered = list.render(60).join("\n");
				results.push(check("SelectList patch", rendered.includes("是") && rendered.includes("在终端内联显示图片")));
			} catch (error) {
				results.push("FAIL SelectList patch: " + String(error));
			}

			// ---- SettingsList 组件补丁是否生效 ----
			try {
				const list = new SettingsList(
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
				);
				const rendered = list.render(80).join("\n");
				results.push(check("SettingsList patch", rendered.includes("自动压缩") && rendered.includes("是")));
				// 内部值必须保持英文
				results.push(check("SettingsList keeps value", list.items[0].values[0] === "true"));
			} catch (error) {
				results.push("FAIL SettingsList patch: " + String(error));
			}

			// ---- Markdown 组件补丁是否生效 ----
			try {
				const markdown = new Markdown("**Navigation**", 0, 0, getMarkdownTheme());
				const rendered = markdown.render(40).join("\n");
				results.push(check("Markdown patch", rendered.includes("导航")));
			} catch (error) {
				results.push("FAIL Markdown patch: " + String(error));
			}

			// ---- 内置选择器：ShowImagesSelectorComponent ----
			try {
				const comp = new ShowImagesSelectorComponent(true, () => {}, () => {});
				const rendered = comp.render(80).join("\n");
				results.push(check("ShowImages selector", rendered.includes("在终端内联显示图片")));
			} catch (error) {
				results.push("FAIL ShowImages selector: " + String(error));
			}

			// ---- 内置选择器：ThinkingSelectorComponent ----
			try {
				const comp = new ThinkingSelectorComponent("medium", ["off", "low", "medium", "high"], () => {}, () => {}, () => {}, "medium");
				const rendered = comp.render(90).join("\n");
				results.push(check("Thinking selector", rendered.includes("思考等级") && rendered.includes("中度推理")));
			} catch (error) {
				results.push("FAIL Thinking selector: " + String(error));
			}

			// ---- 内置选择器：UserMessageSelectorComponent ----
			try {
				const comp = new UserMessageSelectorComponent([{ id: "1", text: "hello" }], () => {}, () => {}, "1");
				const rendered = comp.render(90).join("\n");
				results.push(check("UserMessage selector", rendered.includes("从消息分叉")));
			} catch (error) {
				results.push("FAIL UserMessage selector: " + String(error));
			}

			ctx.ui.notify("ZHTEST\n" + results.join("\n"), "info");
		},
	});
}
