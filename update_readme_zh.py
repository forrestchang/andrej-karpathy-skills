import re

def update_readme_zh(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    header = """<p align="right">
  <a href="./README.md">English</a> | 简体中文
</p>

<h1 align="center">Andrej Karpathy Skills</h1>

<p align="center">
  一份受 Andrej Karpathy 启发编写的 AI 编程助手行为规范，让各种 Agent 变得更聪明、更克制。
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg">
  <img alt="Support" src="https://img.shields.io/badge/Agents-Claude_|_Cursor_|_Copilot_|_Hermes-7A3FFF.svg">
</p>

"""

    content = re.sub(r'# 受 Karpathy 启发的 .*?\n+>.*?\n+>.*?\n+.*?关于 LLM 编码陷阱的总结。\n+\n+\[English\]\(\./README\.md\) \| 简体中文\n+', header, content, flags=re.DOTALL)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

update_readme_zh('README.zh.md')
