/**
 * TUI 组件层汉化补丁。
 *
 * 覆盖两类组件：
 *   1. 基元组件（pi-tui）：Text / TruncatedText / SelectList / SettingsList / Markdown
 *   2. Pi 内置选择器（pi-coding-agent）：设置、模型、对话树、会话、思考、主题、
 *      模型范围、分叉、信任、登录、提供商、扩展选择器等
 *
 * 说明：由于扩展通过 Pi 的虚拟模块机制导入，拿到的类与核心使用的是**同一个对象**，
 * 因此对原型的包装会真实作用于内置页面。若某版本类/方法缺失，则自动跳过。
 */
import {
	claimPatch,
	getTranslator,
} from "./utils";
import { fitLinesToWidth } from "./utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 把一组渲染行收紧到当前终端宽度。
 * 始终以 render(width) 的实参为准，因此终端缩放后依然正确。
 */
function safeFit(lines: any, width: number): any {
	if (!Array.isArray(lines)) return lines;
	try {
		return fitLinesToWidth(lines, width);
	} catch {
		return lines;
	}
}

/** 包装某个类的 render，返回翻译并按当前宽度收紧后的行。 */
function wrapRender(Cls: any, name: string): void {
	const proto = Cls?.prototype;
	if (!proto || typeof proto.render !== "function") return;
	if (!claimPatch(proto, `${name}.render`)) return;
	const original = proto.render;
	proto.render = function patchedRender(this: any, width: number) {
		const lines = original.call(this, width);
		try {
			const translator = getTranslator();
			if (!translator || !Array.isArray(lines)) return lines;
			// 先翻译，再按同一宽度收紧，避免中文/Emoji 撑破终端。
			return safeFit(translator.translateLines(lines), width);
		} catch {
			return safeFit(lines, width);
		}
	};
}

/** 包装 Text / TruncatedText：在构造与 setText 时翻译其文本。 */
function wrapTextLike(Cls: any, name: string): void {
	const proto = Cls?.prototype;
	if (!proto || typeof proto.render !== "function") return;
	if (!claimPatch(proto, `${name}.text`)) return;

	if (typeof proto.setText === "function") {
		const originalSetText = proto.setText;
		proto.setText = function patchedSetText(this: any, text: string) {
			try {
				const translator = getTranslator();
				if (translator && typeof text === "string") {
					return originalSetText.call(this, translator.translateAnsiText(text));
				}
			} catch {
				// 回退原文
			}
			return originalSetText.call(this, text);
		};
	}

	const originalRender = proto.render;
	proto.render = function patchedTextRender(this: any, width: number) {
		try {
			const translator = getTranslator();
			if (translator && typeof this.text === "string") {
				const translated = translator.translateAnsiText(this.text);
				if (translated !== this.text) {
					this.text = translated;
					this.cachedText = undefined;
					this.cachedWidth = undefined;
					this.cachedLines = undefined;
				}
			}
		} catch {
			// 回退原文本
		}
		return safeFit(originalRender.call(this, width), width);
	};
}

/** 翻译一个 SelectList 选项（仅用于显示，value 保持不变）。 */
function translateSelectItem(item: any): any {
	if (!item || typeof item !== "object") return item;
	const translator = getTranslator();
	if (!translator) return item;
	const copy: any = { ...item };
	try {
		if (typeof copy.label === "string") copy.label = translator.translatePlain(copy.label);
		if (typeof copy.description === "string") copy.description = translator.translatePlain(copy.description);
	} catch {
		return item;
	}
	return copy;
}

/** 翻译一个 SettingsList 选项（仅用于显示，value / values 保持不变）。 */
function translateSettingItem(item: any): any {
	if (!item || typeof item !== "object") return item;
	const translator = getTranslator();
	if (!translator) return item;
	const copy: any = { ...item };
	try {
		if (typeof copy.label === "string") copy.label = translator.translatePlain(copy.label);
		if (typeof copy.description === "string") copy.description = translator.translatePlain(copy.description);
		if (typeof copy.currentValue === "string") copy.currentValue = translator.translatePlain(copy.currentValue);
	} catch {
		return item;
	}
	return copy;
}

/** 包装 SelectList / SettingsList：渲染前临时替换显示字段，渲染后恢复原对象。 */
function wrapItemList(Cls: any, name: string, translateItem: (item: any) => any): void {
	const proto = Cls?.prototype;
	if (!proto || typeof proto.render !== "function") return;
	if (!claimPatch(proto, `${name}.render`)) return;
	const original = proto.render;
	proto.render = function patchedListRender(this: any, width: number) {
		const savedItems = this.items;
		const savedFiltered = this.filteredItems;
		try {
			const map = new Map<any, any>();
			const convert = (item: any) => {
				if (!map.has(item)) map.set(item, translateItem(item));
				return map.get(item);
			};
			if (Array.isArray(savedItems)) this.items = savedItems.map(convert);
			if (Array.isArray(savedFiltered)) this.filteredItems = savedFiltered.map(convert);
		} catch {
			// 保持原样
		}
		let lines: any;
		try {
			lines = original.call(this, width);
		} finally {
			this.items = savedItems;
			this.filteredItems = savedFiltered;
		}
		return safeFit(lines, width);
	};
}

/** 包装 Markdown：只翻译帮助页的标题行与表格动作列。 */
function wrapMarkdown(Cls: any, name: string): void {
	const proto = Cls?.prototype;
	if (!proto || typeof proto.render !== "function") return;
	if (!claimPatch(proto, `${name}.markdown`)) return;
	const originalRender = proto.render;
	proto.render = function patchedMarkdownRender(this: any, width: number) {
		try {
			const translator = getTranslator();
			if (translator && typeof this.text === "string") {
				const translated = translator.translateMarkdown(this.text);
				if (translated !== this.text) {
					this.text = translated;
					this.invalidate?.();
				}
			}
		} catch {
			// 回退原文
		}
		return safeFit(originalRender.call(this, width), width);
	};
}

/** 需要「渲染后整行翻译」的内置选择器组件名。 */
const SELECTOR_COMPONENTS = [
	"SettingsSelectorComponent",
	"ModelSelectorComponent",
	"TreeSelectorComponent",
	"SessionSelectorComponent",
	"ThinkingSelectorComponent",
	"ThemeSelectorComponent",
	"ScopedModelsSelectorComponent",
	"UserMessageSelectorComponent",
	"TrustSelectorComponent",
	"OAuthSelectorComponent",
	"LoginDialogComponent",
	"ExtensionSelectorComponent",
	"ShowImagesSelectorComponent",
	"FooterComponent",
];

/**
 * 安装所有 TUI 补丁。
 * @param piNamespace `@earendil-works/pi-coding-agent` 的命名空间对象
 * @param tuiNamespace `@earendil-works/pi-tui` 的命名空间对象
 */
export function installTuiPatches(piNamespace: any, tuiNamespace: any): void {
	// 基元组件
	wrapTextLike(tuiNamespace?.Text, "Text");
	wrapTextLike(tuiNamespace?.TruncatedText, "TruncatedText");
	wrapItemList(tuiNamespace?.SelectList, "SelectList", translateSelectItem);
	wrapItemList(tuiNamespace?.SettingsList, "SettingsList", translateSettingItem);
	wrapMarkdown(tuiNamespace?.Markdown, "Markdown");

	// 内置选择器（渲染后翻译）
	for (const name of SELECTOR_COMPONENTS) {
		wrapRender(piNamespace?.[name], name);
	}
}
