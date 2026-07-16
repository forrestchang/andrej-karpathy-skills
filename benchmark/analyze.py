import argparse
import json
import random
import statistics
from pathlib import Path


def percent_change(current: float, baseline: float) -> float:
    return 100 * (current - baseline) / baseline


def summarize(samples: list[dict], variant: str) -> dict:
    group = [sample for sample in samples if sample["variant"] == variant]
    return {
        "trials": len(group),
        "pass_rate": sum(sample["passed"] for sample in group) / len(group),
        "mean_prompt_tokens": statistics.mean(sample["prompt_tokens"] for sample in group),
        "mean_completion_tokens": statistics.mean(sample["completion_tokens"] for sample in group),
        "mean_request_tokens": statistics.mean(sample["request_tokens"] for sample in group),
        "median_latency_sec": statistics.median(sample["latency_sec"] for sample in group),
    }


def percentile(values: list[float], probability: float) -> float:
    ordered = sorted(values)
    index = probability * (len(ordered) - 1)
    lower = int(index)
    upper = min(lower + 1, len(ordered) - 1)
    fraction = index - lower
    return ordered[lower] * (1 - fraction) + ordered[upper] * fraction


def bootstrap_changes(samples: list[dict], treatment_name: str, iterations: int = 10_000) -> dict[str, tuple[float, float]]:
    pairs = {}
    for sample in samples:
        pairs.setdefault((sample["repetition"], sample["test_id"]), {})[sample["variant"]] = sample
    complete = [pair for pair in pairs.values() if "baseline" in pair and treatment_name in pair]
    generator = random.Random(20260715)
    changes = {"tokens": [], "latency": [], "pass_rate": []}
    for _ in range(iterations):
        selected = [generator.choice(complete) for _ in complete]
        baseline_tokens = statistics.mean(pair["baseline"]["request_tokens"] for pair in selected)
        treatment_tokens = statistics.mean(pair[treatment_name]["request_tokens"] for pair in selected)
        baseline_latency = statistics.median(pair["baseline"]["latency_sec"] for pair in selected)
        treatment_latency = statistics.median(pair[treatment_name]["latency_sec"] for pair in selected)
        baseline_pass = statistics.mean(pair["baseline"]["passed"] for pair in selected)
        treatment_pass = statistics.mean(pair[treatment_name]["passed"] for pair in selected)
        changes["tokens"].append(percent_change(treatment_tokens, baseline_tokens))
        changes["latency"].append(percent_change(treatment_latency, baseline_latency))
        changes["pass_rate"].append(treatment_pass - baseline_pass)
    return {
        metric: (percentile(values, 0.025), percentile(values, 0.975))
        for metric, values in changes.items()
    }


def print_comparison(samples: list[dict], label: str, treatment_name: str) -> None:
    baseline = summarize(samples, "baseline")
    treatment = summarize(samples, treatment_name)
    print(f"\n{label}")
    print("variant   trials  pass    prompt  completion  request  median_sec")
    for name, result in (("baseline", baseline), (treatment_name, treatment)):
        print(
            f"{name:<10}{result['trials']:>6}  {result['pass_rate']:>5.1%}  "
            f"{result['mean_prompt_tokens']:>7.1f}  {result['mean_completion_tokens']:>10.1f}  "
            f"{result['mean_request_tokens']:>7.1f}  {result['median_latency_sec']:>10.2f}"
        )
    print(
        "change: "
        f"request tokens {percent_change(treatment['mean_request_tokens'], baseline['mean_request_tokens']):+.1f}%; "
        f"median latency {percent_change(treatment['median_latency_sec'], baseline['median_latency_sec']):+.1f}%; "
        f"pass rate {(treatment['pass_rate'] - baseline['pass_rate']):+.1%}"
    )
    intervals = bootstrap_changes(samples, treatment_name)
    print(
        "paired bootstrap 95% CI: "
        f"request tokens [{intervals['tokens'][0]:+.1f}%, {intervals['tokens'][1]:+.1f}%]; "
        f"median latency [{intervals['latency'][0]:+.1f}%, {intervals['latency'][1]:+.1f}%]; "
        f"pass rate [{intervals['pass_rate'][0]:+.1%}, {intervals['pass_rate'][1]:+.1%}]"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("results", type=Path, nargs="?", default=Path(__file__).with_name("results-openai.json"))
    args = parser.parse_args()
    document = json.loads(args.results.read_text(encoding="utf-8"))
    if document.get("error"):
        raise SystemExit(document["error"])

    expected = document["repetitions"] * 3 * 2
    samples = document["samples"]
    if len(samples) != expected:
        raise SystemExit(f"Incomplete benchmark: {len(samples)}/{expected} samples")

    treatment_name = next(variant for variant in {sample["variant"] for sample in samples} if variant != "baseline")
    print(f"model: {document['model_name']} ({document['model_version']})")
    print(f"token scope: {document['token_scope']}")
    print_comparison(samples, "All tasks", treatment_name)
    for test_id in sorted({sample["test_id"] for sample in samples}):
        print_comparison([sample for sample in samples if sample["test_id"] == test_id], test_id, treatment_name)

    baseline = summarize(samples, "baseline")
    treatment = summarize(samples, treatment_name)
    intervals = bootstrap_changes(samples, treatment_name)
    quality_ok = intervals["pass_rate"][0] >= 0
    token_win = intervals["tokens"][1] <= -10
    latency_win = intervals["latency"][1] <= -10
    print(f"\nverdict: {'PASS' if quality_ok and (token_win or latency_win) else 'NO SIGNIFICANT WIN'}")


if __name__ == "__main__":
    main()