---
name: karpathy-guidelines
description: आम LLM coding mistakes को कम करने के लिए behavioral guidelines. जब code लिखना, review करना, या refactor करना हो, तब overcomplication से बचने, surgical changes करने, assumptions सामने लाने, और verifiable success criteria define करने के लिए उपयोग करें.
license: MIT
---

# Karpathy Guidelines

[Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876) द्वारा LLM coding pitfalls पर की गई observations से निकली आम LLM coding mistakes को कम करने के लिए behavioral guidelines.

**Tradeoff:** ये guidelines speed की तुलना में caution को प्राथमिकता देती हैं. Trivial tasks के लिए judgment का उपयोग करें.

## 1. Think Before Coding

**Assume मत करो. Confusion मत छिपाओ. Tradeoffs सामने लाओ.**

Implement करने से पहले:
- Assumptions को साफ़-साफ़ बताओ. यदि अनिश्चित हो, तो पूछो.
- अगर multiple interpretations मौजूद हों, तो उन्हें पेश करो - चुपचाप एक मत चुनो.
- अगर कोई simpler approach मौजूद है, तो बताओ. ज़रूरत हो तो push back करो.
- अगर कुछ unclear हो, तो रुक जाओ. क्या confusing है, उसे नाम दो. पूछो.

## 2. Simplicity First

**समस्या हल करने वाला minimum code. कुछ भी speculative नहीं.**

- जो मांगा गया है उसके आगे कोई feature नहीं.
- Single-use code के लिए कोई abstractions नहीं.
- ऐसी कोई "flexibility" या "configurability" नहीं जो मांगी ही नहीं गई.
- Impossible scenarios के लिए error handling नहीं.
- अगर आप 200 lines लिख रहे हैं और 50 lines पर्याप्त हो सकती हैं, तो rewrite करें.

अपने आप से पूछें: "क्या कोई senior engineer कहेगा कि यह overcomplicated है?" अगर हाँ, तो इसे सरल करें.

## 3. Surgical Changes

**सिर्फ़ वही छुओ जिसकी ज़रूरत है. केवल अपना बनाया हुआ mess साफ़ करो.**

जब existing code edit कर रहे हों:
- बगल के code, comments, या formatting को "improve" मत करो.
- जो टूटा नहीं है उसे refactor मत करो.
- Existing style match करो, भले आप इसे अलग तरह से करते.
- अगर unrelated dead code दिखे, उसका उल्लेख करो - delete मत करो.

जब आपकी changes orphans बनाती हैं:
- उन imports/variables/functions को हटाओ जिन्हें आपकी changes ने unused बनाया.
- Pre-existing dead code को बिना कहे मत हटाओ.

परीक्षण: बदली गई हर line सीधे user की request तक trace होनी चाहिए.

## 4. Goal-Driven Execution

**Success criteria define करो. Verify होने तक loop चलाओ.**

Tasks को verifiable goals में बदलो:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

Multi-step tasks के लिए एक brief plan बताओ:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria आपको independently loop करने देते हैं. Weak criteria ("make it work") लगातार clarification मांगते हैं.
