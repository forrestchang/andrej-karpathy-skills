#!/usr/bin/env node
// goal-driven-stop.mjs — Stop hook
// Principle 4: "Define success criteria. Loop until verified."

async function main() {
  process.stdout.write(
    `Karpathy Principle 4 — Goal-Driven Execution\n` +
    `Before closing, verify:\n` +
    `  - Success criteria were stated before implementation\n` +
    `  - Each change traces to the user's request\n` +
    `  - No speculative features were added\n` +
    `  - Tests pass (if applicable)\n`
  );
  process.exit(0); // Don't block — advisory only
}

main().catch(() => process.exit(0));
