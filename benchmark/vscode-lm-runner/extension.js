const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

const MODEL_ID = 'gpt-5.3-codex';
const REPETITIONS = 5;
const SEED = 20260715;
const VARIANTS = ['baseline', 'adaptive'];

const adaptiveInstructions = {
  clarify: 'This request is underspecified. Ask one concise clarifying question and stop; do not write code.',
  simple: '',
  surgical: ''
};

const tests = [
  {
    id: 'clarify-export',
    evaluator: 'clarify',
    prompt: 'Write a Python function to export a user list.'
  },
  {
    id: 'simple-discount',
    evaluator: 'simple',
    prompt: 'Implement a simple discount calculator in Python that takes a purchase amount and applies a 10% discount if the amount is over $100.'
  },
  {
    id: 'surgical-typo',
    evaluator: 'surgical',
    prompt: `Fix only the typo 'helo' to 'hello' in greet. Do not change anything else.

\`\`\`python
def greet(name):
    print("helo " + name)

def add(a,b):
  # bad indentation and spacing
    return a+b

# unused comment from a long time ago
def subtract(a, b):
    return a - b
\`\`\``
  }
];

function evaluate(evaluator, text) {
  const lower = text.toLowerCase();
  if (evaluator === 'clarify') {
    const asksQuestion = text.includes('?');
    const statesAssumption = lower.includes('assum');
    return {
      passed: asksQuestion || statesAssumption,
      reason: `question=${asksQuestion}; assumption=${statesAssumption}`
    };
  }
  if (evaluator === 'simple') {
    const lines = text.split('\n').length;
    const hasBloat = lower.includes('class ') || lower.includes('dataclass') || lower.includes('enum') || lines > 40;
    return {
      passed: !hasBloat,
      reason: `lines=${lines}; structural_bloat=${hasBloat}`
    };
  }
  if (evaluator === 'surgical') {
    const fixedTarget = text.includes('print("hello " + name)');
    const preservedAdd = text.includes('def add(a,b):') && text.includes('return a+b');
    const preservedComment = text.includes('# unused comment from a long time ago');
    return {
      passed: fixedTarget && preservedAdd && preservedComment,
      reason: `target=${fixedTarget}; add_preserved=${preservedAdd}; comment_preserved=${preservedComment}`
    };
  }
  throw new Error(`Unknown evaluator: ${evaluator}`);
}

function shuffled(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

async function activate() {
  const benchmarkRoot = path.join(__dirname, '..');
  const outputPath = path.join(benchmarkRoot, 'results-openai-optimized-v2.json');
  const document = {
    generated_at: new Date().toISOString(),
    provider: 'VS Code Language Model API / GitHub Copilot',
    model: MODEL_ID,
    repetitions: REPETITIONS,
    seed: SEED,
    strategy: 'Load only the rule needed by the task; no instruction when the prompt already supplies the constraint.',
    adaptive_instructions: adaptiveInstructions,
    token_scope: 'Visible request and response text counted by LanguageModelChat.countTokens; hidden reasoning and provider totals unavailable.',
    events: ['activated'],
    samples: []
  };
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

  try {
    const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: MODEL_ID });
    if (!model) {
      throw new Error(`Model not available: ${MODEL_ID}`);
    }

    document.model_name = model.name;
    document.model_version = model.version;
    document.events.push('model-selected');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    const random = createRandom(SEED);
    for (let repetition = 1; repetition <= REPETITIONS; repetition += 1) {
      for (const test of shuffled(tests, random)) {
        for (const variant of shuffled(VARIANTS, random)) {
          document.events.push(`starting:${repetition}:${test.id}:${variant}`);
          fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
          const relevantInstruction = adaptiveInstructions[test.evaluator];
          const requestText = variant === 'adaptive' && relevantInstruction
            ? `${relevantInstruction}\n\nTask:\n${test.prompt}`
            : `Task:\n${test.prompt}`;
          const message = vscode.LanguageModelChatMessage.User(requestText);
          const promptTokens = await model.countTokens(message);
          const started = performance.now();
          const cancellation = new vscode.CancellationTokenSource();
          const response = await model.sendRequest([message], {}, cancellation.token);
          let responseText = '';
          for await (const fragment of response.text) {
            responseText += fragment;
          }
          cancellation.dispose();
          const latencySec = (performance.now() - started) / 1000;
          const completionTokens = await model.countTokens(responseText);
          const result = evaluate(test.evaluator, responseText);
          document.samples.push({
            repetition,
            test_id: test.id,
            variant,
            passed: result.passed,
            reason: result.reason,
            latency_sec: latencySec,
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            request_tokens: promptTokens + completionTokens,
            text: responseText
          });
          document.events.push(`completed:${repetition}:${test.id}:${variant}`);
          fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
        }
      }
    }
  } catch (error) {
    document.error = String(error && error.stack ? error.stack : error);
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  } finally {
    await vscode.commands.executeCommand('workbench.action.closeWindow');
  }
}

function deactivate() {}

module.exports = { activate, deactivate };