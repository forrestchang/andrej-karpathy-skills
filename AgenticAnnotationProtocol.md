# Beunec Agentic Annotation Protocol (ASPS Framework)

{created owned by Beunec Technologies Inc., Open Source & Licensed under the MIT} available in the andrej-karpathy-skills github repo

➡️ [https://github.com/Beunec/agentic-annotation-protocol](https://github.com/Beunec/agentic-annotation-protocol)

## The Thesis: Eliminating System Prompt & Skills Bloat

Traditional system prompts have become cognitive noise. In high-throughput production environments, verbose monolithic instructions cause context drift, unwarranted overconfidence, and subtle hallucinations. The **Agentic-System-Prompt-as-a-Skill (ASPS)** framework replaces bloated external prompts with **structurally embedded agentic annotations** inside the target outputs themselves.

By restricting the LLM's operational boundaries through highly deterministic heuristics, ASPS achieves:
- **Maximum token efficiency**
- **Absolute production readiness**
- **Predictable, structured output**
- **Non-capability transparency** via `{PLACEHOLDER}` handoffs to human experts

## Repository Structure

```
/LLM SYSTEM INSTRUCTIONS/
  ├── code_agenticannotation.md
  ├── research_agenticannotation.md
  ├── generative_chat_agenticannotation.md
  ├── legal_agenticannotation.md
  └── financial_intelligence_data_automator_agenticannotation.md

/AGENTIC AWARENESS INPUT PROMPT/
  ├── code_agenticannotation.md
  ├── research_agenticannotation.md
  ├── generative_chat_agenticannotation.md
  ├── legal_agenticannotation.md
  └── financial_intelligence_data_automator_agenticannotation.md

/aap/
  ├── code/
  │   └── index.js
  ├── research/
  │   └── index.js
  ├── generative-chat/
  │   └── index.js
  ├── legal/
  │   └── index.js
  └── financial intelligence & data automator/
      └── index.js

README.md
package.json
index.js
```

---

## How AAP Differs From Traditional System Prompts & Agent Skills

```text
┌──────────────────────────────────────────────────────────────────────┐
│ TRADITIONAL LLM & AGENT ARCHITECTURES                               │
└──────────────────────────────────────────────────────────────────────┘

User Request
      │
      ▼
┌─────────────────┐
│ System Prompt   │  ← Hundreds or thousands of tokens
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Skill Files     │  ← Additional behavioural instructions
│ SKILL.md        │
│ SKILL.md        │
│ SKILL.md        │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ LLM / Agent     │
└─────────────────┘
      │
      ▼
Generated Output

Observed Industry Challenges:

• System prompt bloat
• Context drift
• Cognitive overhead
• Unwarranted overconfidence
• Skill stacking complexity
• Agent capability ambiguity
• Increased token consumption
```

```text
┌──────────────────────────────────────────────────────────────────────┐
│ BEUNEC AGENTIC ANNOTATION PROTOCOL (AAP)                            │
└──────────────────────────────────────────────────────────────────────┘

User Request
      │
      ▼
┌────────────────────────────────────────────┐
│ Agentic Annotation Layer (AAP)             │
│                                            │
│ Embedded Structural Guidance               │
│ Embedded Execution Constraints             │
│ Embedded Capability Boundaries             │
│ Embedded Human Handoff Rules               │
│ Embedded Deterministic Formatting          │
└────────────────────────────────────────────┘
      │
      ▼
┌─────────────────┐
│ LLM / Agent     │
└─────────────────┘
      │
      ▼
Annotated Output
      │
      ├── Deterministic Structure
      ├── Production Readiness
      ├── Token Efficiency
      ├── Transparent Limitations
      └── {PLACEHOLDER} Human Escalation
```

---

## Inspiration: From Data Annotation to Agentic Annotation

Modern artificial intelligence systems are heavily dependent on **data annotation**.

Before a Large Language Model can reason, write, code, or analyse information, humans must first label and structure data. These annotations may include:

* Human preference rankings
* Expert-reviewed responses
* Classification labels
* Domain-specific tagging
* Reinforcement learning feedback
* Industry-specialist corrections

Today, many leading AI organisations invest substantial resources into data annotation and alignment research, including:

* [OpenAI](https://openai.com)
* [Anthropic](https://www.anthropic.com)
* [Google DeepMind](https://deepmind.google)
* [xAI](https://x.ai)

Data annotation improves how models learn during training.

The Beunec R&D Team asked a different question:

> If annotations improve model behaviour during training, why shouldn't annotations improve agent behaviour during execution?

This question led to the development of the **Agentic Annotation Protocol (AAP)**.

Rather than embedding increasingly large system prompts or continuously attaching additional skill files, AAP introduces structured annotations directly into the operational artefacts that agents generate and consume.

In this framework, annotations become an execution layer rather than merely a training layer.

---

## The Research Journey

During development of Beunec's proprietary orchestration runtime and reasoning infrastructure, the R&D team conducted extensive experimentation using:

* Rivine
* RE-AI
* Internal orchestration runtimes
* Multi-agent execution environments
* Human-in-the-loop production workflows

Throughout this research, Beunec deliberately explored alternatives to popular industry frameworks and methodologies. Our objective was not to replicate existing approaches, but to investigate whether different architectural assumptions could improve deterministic execution, transparency, and production readiness.

Internal benchmarking revealed a recurring pattern:

1. Larger system prompts increased cognitive overhead.
2. Additional skill files often introduced instruction duplication.
3. Agents became increasingly prone to capability ambiguity.
4. Execution quality degraded as behavioural layers accumulated.
5. Token consumption increased without proportional performance gains.

These observations led to the creation of AAP as a lightweight annotation protocol intended to reduce instructional noise while preserving operational control.

---

## AAP Design Philosophy

AAP is not intended to replace existing tools, frameworks, or methodologies.

Instead, AAP proposes an alternative perspective:

```text
Traditional View
──────────────────────────
Prompt → Agent → Output

Skill-Based View
──────────────────────────
Prompt + Skills → Agent → Output

AAP View
──────────────────────────
Prompt → Agent → Annotated Output
                      ↑
             Execution Guidance
             Capability Boundaries
             Human Escalation Rules
             Structural Determinism
```

The goal is not to eliminate skills.

The goal is to evolve skills into a more transparent, execution-oriented annotation layer that reduces ambiguity and improves production reliability.

---

## Community Invitation

The Agentic Annotation Protocol is released as an open-source research initiative.

We welcome:

* Researchers
* AI engineers
* Agent builders
* Framework maintainers
* Enterprise architects
* Human-computer interaction researchers

to experiment with, critique, benchmark, improve, and extend the protocol.

Whether you agree with the framework or challenge its assumptions, thoughtful feedback and empirical testing help advance the broader field of agentic systems.

If this research interests you, we encourage you to contribute to the repository, open discussions, submit benchmarks, and share findings from your own production environments.

Our goal is not to create another knowledge-specialist agent layer.

Our goal is to encourage the development of more transparent, production-ready, and professionally accountable AI systems.

---

This addition is surgical, publication-ready, explains the concept to non-technical readers, introduces the data-annotation analogy, provides the architectural comparison diagram, and preserves the rest of your README unchanged.


### Executing Skills Directly via CLI (npx)

The Beunec AAP framework provides executable command-line interfaces for both global routing and individual skills. You can execute these via `npx` either directly from the GitHub repository or the npm package. 

By default, the CLI command returns the **"Agentic Awareness Input Prompt"** version of the file, which is ready to be used by any user or AI agent directly.
To return the **"LLM System Instruction"** version (designed for developers embedding it in an LLM backend), append `--system-instruction`.

**1. Running Directly From GitHub (Without Publishing or Installing)**

Your terminal agents can run specific skills without installing by querying the GitHub repo directly:

To run the main router:
```bash
npx beunec/agentic-annotation-protocol
```

To run sub-commands or individual skills (returns Agentic Awareness Input Prompt):
```bash
npx beunec/agentic-annotation-protocol aap-code
npx beunec/agentic-annotation-protocol aap-research
npx beunec/agentic-annotation-protocol aap-generative-chat
npx beunec/agentic-annotation-protocol aap-legal
npx beunec/agentic-annotation-protocol aap-finance
```

To run sub-commands and request the **LLM System Instruction** version (for developers):
```bash
npx beunec/agentic-annotation-protocol aap-code --system-instruction
npx beunec/agentic-annotation-protocol aap-research --system-instruction
npx beunec/agentic-annotation-protocol aap-generative-chat --system-instruction
npx beunec/agentic-annotation-protocol aap-legal --system-instruction
npx beunec/agentic-annotation-protocol aap-finance --system-instruction
```

**2. Running From published npm registry via npx**

Agents can call the package directly without installing it globally:
```bash
npx beunec-agentic-annotation-protocol
```

Individual skills (returns Agentic Awareness Input Prompt):
```bash
npx beunec-agentic-annotation-protocol aap-code
npx beunec-agentic-annotation-protocol aap-research
npx beunec-agentic-annotation-protocol aap-generative-chat
npx beunec-agentic-annotation-protocol aap-legal
npx beunec-agentic-annotation-protocol aap-finance
```

Individual skills for developers (returns LLM System Instruction):
```bash
npx beunec-agentic-annotation-protocol aap-code --system-instruction
npx beunec-agentic-annotation-protocol aap-research --system-instruction
npx beunec-agentic-annotation-protocol aap-generative-chat --system-instruction
npx beunec-agentic-annotation-protocol aap-legal --system-instruction
npx beunec-agentic-annotation-protocol aap-finance --system-instruction
```

### System Instructions (`/LLM SYSTEM INSTRUCTIONS/`)
Designed to be embedded in an LLM's backend system prompt. Developers copy/paste these into their orchestration runtime. They include placeholders for project-specific context and enforce memory loops (e.g., `beunec_artificial_experience.md`).

**Available Files:**
- `code_agenticannotation.md`
- `financial_intelligence_data_automator_agenticannotation.md`
- `generative_chat_agenticannotation.md`
- `legal_agenticannotation.md`
- `research_agenticannotation.md`

### Agentic Awareness Activation (`/AGENTIC AWARENESS INPUT PROMPT/`)
Designed for end-users to copy/paste directly into a standard LLM chat box alongside their task. These instantly override generic LLM behavior to enforce ASPS constraints without modifying the backend. No need for additional guidelines or loaded skills.

**Available Files:**
- `code_agenticannotation.md`
- `financial_intelligence_data_automator_agenticannotation.md`
- `generative_chat_agenticannotation.md`
- `legal_agenticannotation.md`
- `research_agenticannotation.md`

## Installation & Usage

You can also install the lightweight AAP framework for re-engineering into your project or for global execution CLI.

**Install as a project dependency:**

```bash
npm install beunec-agentic-annotation-protocol
```

**Or globally for CLI access anywhere:**

```bash
npm install -g beunec-agentic-annotation-protocol
```

If installed globally, you can run the commands directly without `npx`:
```bash
beunec-agentic-annotation-protocol
aap-code
aap-finance --system-instruction
```

- Website: [https://beunec.co](https://beunec.co)
- Contact: info@beunec.com
- Our Research Resources: [https://beunec.substack.com](https://beunec.substack.com)
- PyPI Wheels: [https://www.piwheels.org/project/beunec-asps/](https://www.piwheels.org/project/beunec-asps/)
- GitHub Repository: [https://github.com/Beunec/asps](https://github.com/Beunec/asps)

## Support & Funding

Help fund our open-source R&D by subscribing to the paid plan:

➡️ [https://beunec.substack.com/p/the-agentic-annotation-protocol](https://beunec.substack.com/p/the-agentic-annotation-protocol)

## Legal Disclaimer

**Users & developers are solely responsible for the usage of this framework and the creator (Beunec Technologies Inc.) is not liable for it.**

---

*Engineered by Beunec Technologies, Inc. R&D Team. May 2026.*
*R&D Team: Austin Jung, Prajwal Srinivas, Olu Akinnawo*
