#!/usr/bin/env python3
"""Validate Claude Code plugin structure: JSON files, SKILL.md frontmatter,
name/directory match, no duplicate skill names, all listed skill paths exist.
Zero dependencies — runs on stock python3."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLUGIN_JSON = ROOT / ".claude-plugin" / "plugin.json"
MARKETPLACE_JSON = ROOT / ".claude-plugin" / "marketplace.json"
HOOKS_JSON = ROOT / "hooks" / "hooks.json"
FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---", re.DOTALL)
PLUGIN_ROOT_VAR = re.compile(r"\$\{CLAUDE_PLUGIN_ROOT\}")

errors: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def load_json(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text())
    except FileNotFoundError:
        err(f"{path.relative_to(ROOT)}: file not found")
    except json.JSONDecodeError as e:
        err(f"{path.relative_to(ROOT)}: invalid JSON — {e}")
    return None


def parse_frontmatter(text: str) -> dict[str, str] | None:
    m = FRONTMATTER_RE.match(text)
    if not m:
        return None
    fields: dict[str, str] = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            fields[k.strip()] = v.strip()
    return fields


def validate_hooks() -> None:
    hooks_cfg = load_json(HOOKS_JSON)
    if hooks_cfg is None:
        return
    events = hooks_cfg.get("hooks", {})
    if not isinstance(events, dict):
        err("hooks/hooks.json: top-level 'hooks' must be an object")
        return
    for event, matchers in events.items():
        for matcher in matchers:
            for entry in matcher.get("hooks", []):
                cmd = entry.get("command", "")
                rel = PLUGIN_ROOT_VAR.sub("", cmd).lstrip("/")
                script = ROOT / rel
                if not script.exists():
                    err(f"hooks/hooks.json: {event} references missing script: {rel}")
                elif not script.stat().st_mode & 0o111:
                    err(f"hooks/hooks.json: {event} script not executable: {rel}")


def validate_skill(rel_path: str, seen_names: set[str]) -> None:
    skill_dir = (ROOT / rel_path).resolve()
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        err(f"{rel_path}: SKILL.md missing")
        return

    fm = parse_frontmatter(skill_md.read_text())
    if fm is None:
        err(f"{rel_path}/SKILL.md: missing YAML frontmatter (--- ... ---)")
        return

    for required in ("name", "description"):
        if required not in fm or not fm[required]:
            err(f"{rel_path}/SKILL.md: frontmatter missing '{required}'")

    name = fm.get("name", "")
    if name and name != skill_dir.name:
        err(f"{rel_path}/SKILL.md: name '{name}' != directory '{skill_dir.name}'")
    if name in seen_names:
        err(f"duplicate skill name: '{name}'")
    seen_names.add(name)


def main() -> int:
    plugin = load_json(PLUGIN_JSON)
    load_json(MARKETPLACE_JSON)
    if plugin is None:
        return 1

    skills = plugin.get("skills", [])
    if not skills:
        err("plugin.json: 'skills' is empty or missing")

    seen: set[str] = set()
    for rel in skills:
        validate_skill(rel, seen)

    if HOOKS_JSON.exists():
        validate_hooks()

    if errors:
        print("VALIDATION FAILED:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    print(f"OK: {len(seen)} skill(s) validated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
