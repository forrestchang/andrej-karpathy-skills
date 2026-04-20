#!/usr/bin/env node
// surgical-changes.mjs — PostToolUse hook
// Principle 3: "Touch only what you must. Clean up only your own mess."

/** Patterns that suppress linting/type tools — shortcuts that hide problems. */
const SUPPRESSION_PATTERNS = [
  /eslint-disable/,
  /@ts-ignore/,
  /#\s*nosec/,
  /\/\/\s*nolint/,
  /#\s*type:\s*ignore/,
  /#\s*noqa/,
];

/**
 * Returns true if the two strings differ only in whitespace.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function isWhitespaceOnlyDiff(a, b) {
  return a.replace(/\s+/g, "") === b.replace(/\s+/g, "");
}

/**
 * Extracts comment lines from a block of text.
 * Matches lines whose first non-whitespace token is //, #, or /**.
 * @param {string} text
 * @returns {string[]}
 */
function extractCommentLines(text) {
  return text.split("\n").filter((line) => /^\s*(\/\/|#|\/\*)/.test(line));
}

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
  const oldString = toolInput.old_string || "";
  const newString = toolInput.new_string || toolInput.content || "";

  const warnings = [];

  // Check 1: Suppression markers in the new content.
  if (newString) {
    for (const pattern of SUPPRESSION_PATTERNS) {
      if (pattern.test(newString)) {
        warnings.push(
          `Warning: Karpathy Principle 3 — Surgical Changes\n` +
          `New content contains a suppression marker matching /${pattern.source}/.\n` +
          `Suppression markers hide problems rather than fixing them.\n` +
          `Consider addressing the root cause instead.`
        );
        break; // One warning per file is enough
      }
    }
  }

  // Check 2: Formatting-only changes (only relevant when old_string is present).
  if (oldString && newString) {
    if (isWhitespaceOnlyDiff(oldString, newString)) {
      warnings.push(
        `Warning: Karpathy Principle 3 — Surgical Changes\n` +
        `This edit changes only whitespace/formatting.\n` +
        `"Match existing style, even if you'd do it differently."\n` +
        `Verify this change was actually requested.`
      );
    }

    // Check 3: Comment removal.
    const oldComments = extractCommentLines(oldString);
    const newComments = new Set(extractCommentLines(newString));
    const removedComments = oldComments.filter((line) => !newComments.has(line));

    if (removedComments.length > 0) {
      warnings.push(
        `Warning: Karpathy Principle 3 — Surgical Changes\n` +
        `${removedComments.length} comment line(s) from the original were removed.\n` +
        `"Don't improve adjacent comments unless that was part of the task."\n` +
        `Removed:\n` +
        removedComments.map((l) => `  ${l.trim()}`).join("\n")
      );
    }
  }

  if (warnings.length > 0) {
    process.stderr.write(warnings.join("\n\n") + "\n");
  }

  // Advisory only — never block.
  process.exit(0);
}

main().catch(() => process.exit(0));
