import re

def update_readme(file_path, is_zh=False):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the header and badges
    header = """<p align="right">
  {lang_links}
</p>

<h1 align="center">Andrej Karpathy Skills</h1>

<p align="center">
  {desc}
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg">
  <img alt="Support" src="https://img.shields.io/badge/Agents-Claude_|_Cursor_|_Copilot_|_Hermes-7A3FFF.svg">
</p>

"""

    if is_zh:
        lang_links = '<a href="./README.md">English</a> | 简体中文'
        desc = '一份受 Andrej Karpathy 启发编写的 AI 编程助手行为规范，让各种 Agent 变得更聪明、更克制。'
        content = re.sub(r'# Karpathy 启发的 AI 编程助手规范\n+>.*?\n+>.*?\n+.*?<br>.*?\n+.*?\[Andrej Karpathy.*?\n+.*?\*\*Cursor.*?\*\*。.*?\n+\[English\]\(\./README\.md\) \| 简体中文\n+', header.format(lang_links=lang_links, desc=desc), content, flags=re.DOTALL)
    else:
        lang_links = 'English | <a href="./README.zh.md">简体中文</a>'
        desc = "A unified set of guidelines to improve the behavior of AI coding assistants, derived from Andrej Karpathy's observations."
        content = re.sub(r'# Karpathy-Inspired Coding Guidelines for AI Agents\n+>.*?\n+>.*?\n+A unified set of guidelines.*?\n+Originally created for Claude Code.*?\n+English \| \[简体中文\]\(\./README\.zh\.md\)\n+', header.format(lang_links=lang_links, desc=desc), content, flags=re.DOTALL)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

update_readme('README.md', is_zh=False)
update_readme('README.zh.md', is_zh=True)
