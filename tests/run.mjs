/**
 * pi-zh-cn 测试运行器。
 *
 * 通过 `pi --mode rpc` 加载 tests/ 下的测试扩展，触发其命令并收集断言结果。
 * 不依赖任何本机绝对路径：
 *   - 优先使用环境变量 PI_CLI（Pi 的 cli.js 路径，用当前 node 运行）；
 *   - 否则使用 PI_BIN（一个可执行文件 / 命令）；
 *   - 否则使用 PATH 中的 `pi`。
 *
 * 用法：
 *   node tests/run.mjs
 *   PI_CLI="/path/to/pi-coding-agent/dist/bundle/cli.js" node tests/run.mjs
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** 解析 pi 命令。返回 { cmd, args, shell }。 */
function resolvePi() {
	if (process.env.PI_CLI) {
		return { cmd: process.execPath, args: [process.env.PI_CLI], shell: false };
	}
	if (process.env.PI_BIN) {
		const cmd = process.env.PI_BIN;
		const shell = process.platform === "win32" && /\.(cmd|bat)$/i.test(cmd);
		return { cmd, args: [], shell };
	}
	if (process.platform === "win32") {
		return { cmd: "pi.cmd", args: [], shell: true };
	}
	return { cmd: "pi", args: [], shell: false };
}

const TESTS = [
	{ file: "translations-test.ts", command: "zhtest", prefix: "ZHTEST" },
	{ file: "width-test.ts", command: "widthtest", prefix: "WIDTHTEST" },
];

/** 运行单个测试文件，返回 { output, errors }。 */
function runTest(test) {
	return new Promise((resolve) => {
		const { cmd, args: baseArgs, shell } = resolvePi();
		const cwd = mkdtempSync(join(tmpdir(), "pi-zh-cn-test-"));
		const child = spawn(
			cmd,
			[...baseArgs, "--mode", "rpc", "-a", "--no-session", "-e", join(__dirname, test.file)],
			{ cwd, stdio: ["pipe", "pipe", "pipe"], shell },
		);

		let buffer = "";
		let output = "";
		const errors = [];
		let settled = false;

		const cleanup = () => {
			try {
				child.kill();
			} catch {
				// ignore
			}
			try {
				rmSync(cwd, { recursive: true, force: true });
			} catch {
				// ignore
			}
		};
		const settle = () => {
			if (settled) return;
			settled = true;
			cleanup();
			resolve({ output, errors });
		};

		child.stderr.on("data", (d) => {
			const s = d.toString();
			if (s.trim() && !s.includes("WSL")) errors.push(s);
		});
		child.on("error", (e) => {
			errors.push(String(e));
			settle();
		});
		child.on("exit", () => {
			if (!output) settle();
		});

		child.stdout.on("data", (chunk) => {
			buffer += chunk.toString("utf8");
			let i;
			while ((i = buffer.indexOf("\n")) !== -1) {
				const line = buffer.slice(0, i).replace(/\r$/, "");
				buffer = buffer.slice(i + 1);
				if (!line.trim()) continue;
				let msg;
				try {
					msg = JSON.parse(line);
				} catch {
					continue;
				}
				if (msg.type === "response" && msg.command === "get_commands") {
					child.stdin.write(JSON.stringify({ type: "prompt", message: `/${test.command}` }) + "\n");
				}
				if (
					msg.type === "extension_ui_request" &&
					msg.method === "notify" &&
					typeof msg.message === "string" &&
					msg.message.startsWith(test.prefix)
				) {
					output = msg.message;
					setTimeout(settle, 200);
				}
			}
		});

		setTimeout(() => {
			try {
				child.stdin.write(JSON.stringify({ type: "get_commands", id: "c" }) + "\n");
			} catch {
				// ignore
			}
		}, 1800);
		setTimeout(() => {
			errors.push("测试超时（60s）");
			settle();
		}, 60000);
	});
}

function statusLines(output) {
	return output.split("\n").filter((l) => l.startsWith("PASS") || l.startsWith("FAIL"));
}

const allFailures = [];
for (const test of TESTS) {
	console.log(`\n===== ${test.file} =====`);
	const { output, errors } = await runTest(test);
	if (!output) {
		console.log("（未收到结果）");
		if (errors.length) console.log(errors.join(""));
		allFailures.push(test.file);
		continue;
	}
	const lines = statusLines(output);
	for (const line of lines) {
		console.log((line.startsWith("PASS") ? "✅ " : "❌ ") + line.slice(5));
	}
	const failed = lines.filter((l) => l.startsWith("FAIL"));
	if (failed.length > 0 || lines.length === 0) allFailures.push(test.file);
}

if (allFailures.length > 0) {
	console.log(`\n❌ 存在失败：${allFailures.join(", ")}`);
	process.exit(1);
}
console.log("\n✅ 全部测试通过");
