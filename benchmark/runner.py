import os
import time
import json
import requests
import dotenv

def load_api_key():
    # Load environment variables from .env file
    dotenv.load_dotenv()
    
    # Check standard environment variable
    api_key = os.environ.get('GEMINI_API_KEY')
    if api_key:
        return api_key
        
    # Also check typical config path for local testing if not in env
    fallback_path = 'C:/Users/sumon/Documents/App Development/TradeGenius/.env.local'
    if os.path.exists(fallback_path):
        config = dotenv.dotenv_values(fallback_path)
        return config.get('GEMINI_API_KEY')
        
    return None

def load_system_instructions():
    # Look for AGENTS.md in the project root (one level up from benchmark/ folder)
    agents_md_path = os.path.join(os.path.dirname(__file__), '..', 'AGENTS.md')
    if not os.path.exists(agents_md_path):
        agents_md_path = 'AGENTS.md' # fallback
    
    with open(agents_md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return content

def call_gemini(api_key, system_instruction, user_prompt):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "contents": [{
            "parts": [{
                "text": user_prompt
            }]
        }]
    }
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{
                "text": system_instruction
            }]
        }

    start_time = time.time()
    try:
        response = requests.post(url, headers=headers, json=payload)
        elapsed = time.time() - start_time
        if response.status_code == 200:
            res_json = response.json()
            usage = res_json.get('usageMetadata', {})
            text = res_json['candidates'][0]['content']['parts'][0]['text']
            return {
                "success": True,
                "text": text,
                "time_sec": elapsed,
                "prompt_tokens": usage.get('promptTokenCount', 0),
                "completion_tokens": usage.get('candidatesTokenCount', 0),
                "total_tokens": usage.get('totalTokenCount', 0)
            }
        else:
            return {
                "success": False,
                "error": response.text,
                "time_sec": elapsed,
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "time_sec": time.time() - start_time,
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0
        }

def evaluate_tc1_think_before_coding(response_text):
    lower = response_text.lower()
    has_question = "?" in response_text
    has_clarify = "clarify" in lower or "clarifying" in lower or "question" in lower
    has_assumptions = "assum" in lower or "what about" in lower
    score = 0
    if has_question: score += 1
    if has_clarify: score += 1
    if has_assumptions: score += 1
    
    reasons = []
    if has_question: reasons.append("contains question")
    if has_clarify: reasons.append("clarifying mentioned")
    if has_assumptions: reasons.append("assumptions/alternatives mentioned")
    
    passed = score >= 1
    return passed, f"Score: {score}/3 ({', '.join(reasons) if reasons else 'none'})"

def evaluate_tc2_simplicity_first(response_text):
    lower = response_text.lower()
    overengineered = False
    reasons = []
    if "class " in response_text:
        overengineered = True
        reasons.append("created class structure")
    if "enum" in lower:
        overengineered = True
        reasons.append("created Enum")
    if "dataclass" in lower:
        overengineered = True
        reasons.append("used dataclass")
    if len(response_text.splitlines()) > 40:
        overengineered = True
        reasons.append("response too long")
        
    passed = not overengineered
    return passed, f"{'Overengineered' if overengineered else 'Simple'} ({', '.join(reasons) if reasons else 'minimal code'})"

def evaluate_tc3_surgical_changes(response_text):
    lower = response_text.lower()
    unrelated_modified = False
    reasons = []
    
    if "def add" in response_text:
        if "def add(a, b):" in response_text or "    return a + b" in response_text:
            unrelated_modified = True
            reasons.append("reformatted add function (fixed spacing/indentation)")
    if "unused comment" not in lower and "def subtract" in response_text:
        unrelated_modified = True
        reasons.append("deleted/modified pre-existing comment in subtract")
        
    passed = not unrelated_modified
    return passed, f"{'Modified unrelated' if unrelated_modified else 'Surgical'} ({', '.join(reasons) if reasons else 'minimal changes'})"

def main():
    api_key = load_api_key()
    if not api_key:
        print("GEMINI_API_KEY environment variable or config file not found.")
        print("Please set GEMINI_API_KEY in your environment or a .env file.")
        return
    
    system_inst = load_system_instructions()
    print("Loaded system instructions length:", len(system_inst))

    test_cases = [
        {
            "id": 1,
            "name": "Think Before Coding / Assumptions",
            "prompt": "Write a python function to export a user list.",
            "eval_func": evaluate_tc1_think_before_coding
        },
        {
            "id": 2,
            "name": "Simplicity First / YAGNI",
            "prompt": "Implement a simple discount calculator in Python that takes a purchase amount and applies a 10% discount if the amount is over $100.",
            "eval_func": evaluate_tc2_simplicity_first
        },
        {
            "id": 3,
            "name": "Surgical Changes / Scoping",
            "prompt": (
                "Here is a python file containing some functions. Some have bad indentation or formatting, "
                "and one has a typo ('helo' instead of 'hello' in the greet function). Please fix the typo.\n\n"
                "```python\ndef greet(name):\n    print(\"helo \" + name)\n\ndef add(a,b):\n  # bad indentation and spacing\n    return a+b\n\n# unused comment from a long time ago\ndef subtract(a, b):\n    return a - b\n```"
            ),
            "eval_func": evaluate_tc3_surgical_changes
        }
    ]

    results = []

    for tc in test_cases:
        print(f"\nRunning Test Case {tc['id']}: {tc['name']}")
        
        # 1. Run baseline
        print(" -> Running Baseline...")
        res_baseline = call_gemini(api_key, None, tc['prompt'])
        if res_baseline['success']:
            passed_base, reason_base = tc['eval_func'](res_baseline['text'])
        else:
            passed_base, reason_base = False, f"API Error: {res_baseline.get('error')}"

        # 2. Run Karpathy
        print(" -> Running Karpathy Mode...")
        res_karpathy = call_gemini(api_key, system_inst, tc['prompt'])
        if res_karpathy['success']:
            passed_karp, reason_karp = tc['eval_func'](res_karpathy['text'])
        else:
            passed_karp, reason_karp = False, f"API Error: {res_karpathy.get('error')}"

        results.append({
            "id": tc['id'],
            "name": tc['name'],
            "prompt": tc['prompt'],
            "baseline": {
                "time": res_baseline['time_sec'],
                "prompt_tokens": res_baseline['prompt_tokens'],
                "completion_tokens": res_baseline['completion_tokens'],
                "total_tokens": res_baseline['total_tokens'],
                "passed": passed_base,
                "reason": reason_base,
                "text": res_baseline.get('text', '')
            },
            "karpathy": {
                "time": res_karpathy['time_sec'],
                "prompt_tokens": res_karpathy['prompt_tokens'],
                "completion_tokens": res_karpathy['completion_tokens'],
                "total_tokens": res_karpathy['total_tokens'],
                "passed": passed_karp,
                "reason": reason_karp,
                "text": res_karpathy.get('text', '')
            }
        })

    # Save raw results
    out_dir = os.path.dirname(__file__)
    with open(os.path.join(out_dir, "results.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    # Generate Markdown Report
    report = []
    report.append("# Benchmark Report: Karpathy Rules vs Baseline")
    report.append("\nThis report evaluates the performance of `gemini-3.5-flash` with and without the Karpathy coding system instructions.\n")
    
    # Table Summary
    report.append("| Test Case | Baseline Time (s) | Baseline Tokens (I/O) | Baseline Success? | Karpathy Time (s) | Karpathy Tokens (I/O) | Karpathy Success? |")
    report.append("| --- | --- | --- | --- | --- | --- | --- |")
    for r in results:
        base_tok = f"{r['baseline']['prompt_tokens']}/{r['baseline']['completion_tokens']}"
        karp_tok = f"{r['karpathy']['prompt_tokens']}/{r['karpathy']['completion_tokens']}"
        base_succ = "✅ Yes" if r['baseline']['passed'] else "❌ No"
        karp_succ = "✅ Yes" if r['karpathy']['passed'] else "❌ No"
        report.append(
            f"| {r['name']} | {r['baseline']['time']:.2f}s | {base_tok} | {base_succ} ({r['baseline']['reason']}) | "
            f"{r['karpathy']['time']:.2f}s | {karp_tok} | {karp_succ} ({r['karpathy']['reason']}) |"
        )

    report.append("\n## Detailed Observations\n")
    for r in results:
        report.append(f"### Test Case {r['id']}: {r['name']}")
        report.append(f"**Prompt**: `{r['prompt'].strip()}`\n")
        report.append("#### [Baseline Response]")
        report.append(f"```python\n{r['baseline']['text'].strip()}\n```\n")
        report.append("#### [Karpathy Mode Response]")
        report.append(f"```python\n{r['karpathy']['text'].strip()}\n```\n")
        report.append("---")

    report_path = os.path.join(out_dir, "README.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report))
        
    print(f"\nDone! Report written to: {report_path}")

if __name__ == '__main__':
    main()
