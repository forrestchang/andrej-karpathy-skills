# Karpathy-Inspired Claude Code Guidelines

[English](README.md) | [हिन्दी](README.hi-IN.md)

> मेरा नया प्रोजेक्ट [Multica](https://github.com/multica-ai/multica) देखें — reusable skills के साथ coding agents को चलाने और manage करने के लिए एक open-source platform.
>
> मुझे X पर फॉलो करें: [https://x.com/jiayuan_jy](https://x.com/jiayuan_jy)

[Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876) द्वारा LLM coding pitfalls पर की गई observations से निकली Claude Code behavior को बेहतर बनाने के लिए एक single `CLAUDE.md` file.

## समस्याएँ

Andrej की post से:

> "The models make wrong assumptions on your behalf and just run along with them without checking. They don't manage their confusion, don't seek clarifications, don't surface inconsistencies, don't present tradeoffs, don't push back when they should."

> "They really like to overcomplicate code and APIs, bloat abstractions, don't clean up dead code... implement a bloated construction over 1000 lines when 100 would do."

> "They still sometimes change/remove comments and code they don't sufficiently understand as side effects, even if orthogonal to the task."

## समाधान

एक ही file में चार principles जो इन समस्याओं को सीधे address करते हैं:

| Principle | किसे address करता है |
|-----------|----------------------|
| **Think Before Coding** | गलत assumptions, छिपा confusion, missing tradeoffs |
| **Simplicity First** | overcomplication, bloated abstractions |
| **Surgical Changes** | orthogonal edits, उस code को छूना जिसे नहीं छूना चाहिए |
| **Goal-Driven Execution** | tests-first, verifiable success criteria के जरिए leverage |

## चार Principles विस्तार से

### 1. Think Before Coding

**Assume मत करो. Confusion मत छिपाओ. Tradeoffs सामने लाओ.**

LLMs अक्सर चुपचाप एक interpretation चुन लेते हैं और उसी पर आगे बढ़ जाते हैं. यह principle explicit reasoning को मजबूर करता है:

- **Assumptions को साफ़-साफ़ बताओ** — यदि अनिश्चित हो, guess करने के बजाय पूछो
- **Multiple interpretations पेश करो** — ambiguity होने पर चुपचाप एक विकल्प मत चुनो
- **ज़रूरत हो तो push back करो** — अगर कोई simpler approach मौजूद है, तो बताओ
- **Confused होने पर रुक जाओ** — क्या unclear है, उसे नाम दो और clarification मांगो

### 2. Simplicity First

**समस्या हल करने वाला minimum code. कुछ भी speculative नहीं.**

Overengineering की प्रवृत्ति को रोकें:

- जो मांगा गया है उसके आगे कोई feature नहीं
- Single-use code के लिए कोई abstractions नहीं
- ऐसी कोई "flexibility" या "configurability" नहीं जो मांगी ही नहीं गई
- Impossible scenarios के लिए error handling नहीं
- अगर 200 lines की जगह 50 lines चल सकती हैं, तो rewrite करो

**परीक्षण:** क्या कोई senior engineer कहेगा कि यह overcomplicated है? अगर हाँ, तो इसे सरल करो.

### 3. Surgical Changes

**सिर्फ़ वही छुओ जिसकी ज़रूरत है. केवल अपना बनाया हुआ mess साफ़ करो.**

जब existing code edit कर रहे हों:

- बगल के code, comments, या formatting को "improve" मत करो
- जो टूटा नहीं है उसे refactor मत करो
- Existing style match करो, भले आप इसे अलग तरह से करते
- अगर unrelated dead code दिखे, उसका उल्लेख करो — delete मत करो

जब आपकी changes orphans बनाती हैं:

- उन imports/variables/functions को हटाओ जिन्हें आपकी changes ने unused बनाया
- Pre-existing dead code को बिना कहे मत हटाओ

**परीक्षण:** बदली गई हर line सीधे user की request तक trace होनी चाहिए.

### 4. Goal-Driven Execution

**Success criteria define करो. Verify होने तक loop चलाओ.**

Imperative tasks को verifiable goals में बदलो:

| इसके बजाय... | इसमें बदलो... |
|--------------|----------------|
| "Add validation" | "Write tests for invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test that reproduces it, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after" |

Multi-step tasks के लिए एक brief plan बताओ:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria LLM को independently loop करने देते हैं. Weak criteria ("make it work") लगातार clarification मांगते हैं.

## Install

**Option A: Claude Code Plugin (recommended)**

Claude Code के भीतर पहले marketplace जोड़ें:
```
/plugin marketplace add forrestchang/andrej-karpathy-skills
```

फिर plugin install करें:
```
/plugin install andrej-karpathy-skills@karpathy-skills
```

यह guidelines को Claude Code plugin के रूप में install करता है, जिससे skill आपके सभी projects में available हो जाती है.

**Option B: CLAUDE.md (per-project)**

नया project:
```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md
```

Existing project (append):
```bash
echo "" >> CLAUDE.md
curl https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md >> CLAUDE.md
```

## मुख्य समझ

Andrej से:

> "LLMs are exceptionally good at looping until they meet specific goals... Don't tell it what to do, give it success criteria and watch it go."

"Goal-Driven Execution" principle इसी बात को पकड़ता है: imperative instructions को verification loops वाले declarative goals में बदलो.

## कैसे जानें कि यह काम कर रहा है

ये guidelines काम कर रही हैं अगर आप देखें:

- **Diffs में कम unnecessary changes** — केवल requested changes दिखाई दें
- **Overcomplication के कारण कम rewrites** — code पहली बार में ही simple हो
- **Clarifying questions implementation से पहले आएँ** — गलतियों के बाद नहीं
- **Clean, minimal PRs** — कोई drive-by refactoring या "improvements" नहीं

## Customization

इन guidelines को project-specific instructions के साथ merge करने के लिए design किया गया है. इन्हें अपने existing `CLAUDE.md` में जोड़ें या नया बनाएं.

Project-specific rules के लिए ऐसे sections जोड़ें:

```markdown
## Project-Specific Guidelines

- Use TypeScript strict mode
- All API endpoints must have tests
- Follow the existing error handling patterns in `src/utils/errors.ts`
```

## Tradeoff Note

ये guidelines **speed की तुलना में caution** को प्राथमिकता देती हैं. Trivial tasks (simple typo fixes, obvious one-liners) के लिए judgment का उपयोग करें — हर change को full rigor की ज़रूरत नहीं होती.

लक्ष्य non-trivial work में costly mistakes कम करना है, simple tasks को धीमा करना नहीं.

## License

MIT
