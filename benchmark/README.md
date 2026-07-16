# Benchmark: Karpathy Rules vs Baseline

## Verdict

The original always-loaded rules did **not** lower token cost. A repeated GPT-5.3-Codex benchmark confirmed that loading the full skill improved quality but increased visible request tokens by 203.6%.

An adaptive second iteration produced a significant gain: load no extra instruction when the prompt already contains the needed constraint; for an underspecified request, ask one concise clarifying question and stop. Across 30 calls, this reduced visible request tokens by **45.1%**, reduced median latency by **12.5%**, and improved pass rate from **66.7% to 100%**. The paired bootstrap 95% interval for token change was **-64.6% to -16.4%**.

## OpenAI Benchmark

Run on July 15, 2026 through the VS Code Language Model API and GitHub Copilot using `gpt-5.3-codex`. Each experiment used three tasks, five repetitions, interleaved arm order, and 30 calls total.

| Strategy | Baseline pass | Treatment pass | Visible request tokens | Median latency | Verdict |
| --- | ---: | ---: | ---: | ---: | --- |
| Full skill on every task | 66.7% | 100% | **+203.6%** | +34.6% | Reject |
| Adaptive v1: permissive clarification | 66.7% | 100% | -4.4% | +1.7% | Below threshold |
| Adaptive v2: one question, then stop | 66.7% | 100% | **-45.1%** | **-12.5%** | **Pass** |

The v2 per-task result explains the gain:

| Task | Token change | Latency change | Pass-rate change |
| --- | ---: | ---: | ---: |
| Underspecified export request | **-83.7%** | **-73.5%** | 0% to 100% |
| Explicit simple implementation | -1.7% | +9.2% | unchanged at 100% |
| Explicit surgical edit | +7.2% | +8.3% | unchanged at 100% |

The last two arms intentionally received identical prompts. Their small differences are model variance, not an instruction effect.

## Historical Gemini Benchmark

| Historical metric | Baseline | Original rules | Change |
| --- | ---: | ---: | ---: |
| Pass rate | 0/3 | 3/3 | Better, but permissive graders |
| Mean prompt tokens | 48.3 | 801.3 | +1,558% |
| Mean completion tokens | 554.3 | 158.3 | -71.4% |
| Mean prompt + completion tokens | 602.7 | 959.7 | **+59.2%** |
| Mean provider total tokens | 1,338.7 | 1,622.7 | **+21.2%** |
| Median response latency | 31.56 s | 14.08 s | **-55.4%** |

These are descriptive results, not statistically reliable estimates: each arm ran once per task, baseline always ran first, and the graders mostly checked keywords or line counts. The test measured single API responses, not a full coding-agent workflow with file edits and tool calls.

## Optimization

The skill changed from an always-applied rule bundle to adaptive guardrails:

- activate only for underspecified, broad, risky, or weakly scoped tasks;
- apply only the guardrail missing from the request;
- do not repeat constraints already supplied by the user or project;
- on an underspecified request, ask one concise question and stop instead of guessing and implementing.

The skill file is now 1,384 characters versus the original 4,243, a **67.4% payload reduction**. Root instruction files remain appropriate when quality guardrails must always apply; the adaptive skill is the cost-sensitive option.

## Repeated Benchmark

[`runner.ps1`](runner.ps1) provides a dependency-free repeated microbenchmark for Gemini. It:

- interleaves and randomizes baseline and skill calls;
- defaults to five repetitions per task;
- uses temperature 0 to reduce sampling noise;
- reports pass rate, prompt tokens, completion tokens, prompt-plus-completion tokens, provider totals, and median latency;
- saves every raw response for review;
- treats lower cost as a win only when quality is non-inferior.

Run the audit of the historical data without an API key:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\benchmark\runner.ps1 -AnalyzeExisting
```

Run a fresh repeated trial after setting `GEMINI_API_KEY` directly in the terminal:

```powershell
.\benchmark\runner.ps1 -Model gemini-3.5-flash -Repetitions 10
```

The OpenAI benchmark uses the authenticated models already available through GitHub Copilot in VS Code 1.129 or newer. It does not require an OpenAI API key:

```powershell
code --new-window --extensionDevelopmentPath="$PWD\benchmark\vscode-lm-runner" "$PWD"
python .\benchmark\analyze.py .\benchmark\results-openai-optimized-v2.json
```

Raw datasets:

- [`results-openai.json`](results-openai.json): full skill versus baseline;
- [`results-openai-optimized.json`](results-openai-optimized.json): adaptive v1;
- [`results-openai-optimized-v2.json`](results-openai-optimized-v2.json): adaptive v2.

Use more repetitions and broader tasks before generalizing these results. Pin the model name and record the date because hosted models change. Review raw responses manually before accepting the built-in graders.

## Decision Rule

Call the skill an improvement only if:

1. its pass rate is no worse than baseline;
2. the paired 95% confidence interval shows at least 10% lower visible request tokens or median latency;
3. the result repeats across multiple task types and is not driven by one outlier.

The VS Code API exposes token counts for visible request and response text but not hidden reasoning or provider-billed totals. For a true coding benchmark, run equivalent isolated repositories through an agent harness and measure successful-task billed tokens, wall time, tool calls, changed-line precision, and test results. These are instruction microbenchmarks, not full agent benchmarks.