#!/usr/bin/env node
// think-before-coding.mjs — PreToolUse hook
// Principle 1: "Don't assume. Don't hide confusion."
// Principle 2: "If you write 200 lines and it could be 50, rewrite it."

const COMPLEXITY_THRESHOLD = 200; // lines

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) process.exit(0);

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const toolInput = payload.tool_input || {};
  const content = toolInput.content || toolInput.new_string || "";

  if (!content) process.exit(0);

  const lineCount = content.split("\n").length;

  if (lineCount > COMPLEXITY_THRESHOLD) {
    process.stderr.write(
      `Warning: Karpathy Principle 2 — Simplicity First\n` +
      `You're about to write ${lineCount} lines. Could this be simpler?\n` +
      `"If you write 200 lines and it could be 50, rewrite it."\n`
    );
    // Warn but don't block — exit 0
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
