# Karpathy-Inspired Claude Code Guidelines

> Check out my new project [Multica](https://github.com/multica-ai/multica) — an open-source platform for running and managing coding agents with reusable skills.
>
> Follow me on X: [https://x.com/jiayuan_jy](https://x.com/jiayuan_jy)

A single `CLAUDE.md` file to improve Claude Code behavior, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.

English | [简体中文](./README.zh.md)

## The Problems

From Andrej's post:

> "The models make wrong assumptions on your behalf and just run along with them without checking. They don't manage their confusion, don't seek clarifications, don't surface inconsistencies, don't present tradeoffs, don't push back when they should."

> "They really like to overcomplicate code and APIs, bloat abstractions, don't clean up dead code... implement a bloated construction over 1000 lines when 100 would do."

> "They still sometimes change/remove comments and code they don't sufficiently understand as side effects, even if orthogonal to the task."

## The Solution

Four principles in one file that directly address these issues:

| Principle | Addresses |
|-----------|-----------|
| **Think Before Coding** | Wrong assumptions, hidden confusion, missing tradeoffs |
| **Simplicity First** | Overcomplication, bloated abstractions |
| **Surgical Changes** | Orthogonal edits, touching code you shouldn't |
| **Goal-Driven Execution** | Leverage through tests-first, verifiable success criteria |

## The Four Principles in Detail

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

LLMs often pick an interpretation silently and run with it. This principle forces explicit reasoning:

- **State assumptions explicitly** — If uncertain, ask rather than guess
- **Present multiple interpretations** — Don't pick silently when ambiguity exists
- **Push back when warranted** — If a simpler approach exists, say so
- **Stop when confused** — Name what's unclear and ask for clarification

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

Combat the tendency toward overengineering:

- No features beyond what was asked
- No abstractions for single-use code
- No "flexibility" or "configurability" that wasn't requested
- No error handling for impossible scenarios
- If 200 lines could be 50, rewrite it

**The test:** Would a senior engineer say this is overcomplicated? If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting
- Don't refactor things that aren't broken
- Match existing style, even if you'd do it differently
- If you notice unrelated dead code, mention it — don't delete it

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused
- Don't remove pre-existing dead code unless asked

**The test:** Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform imperative tasks into verifiable goals:

| Instead of... | Transform to... |
|--------------|-----------------|
| "Add validation" | "Write tests for invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test that reproduces it, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after" |

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let the LLM loop independently. Weak criteria ("make it work") require constant clarification.

## Install

**Option A: Claude Code Plugin (recommended)**

From within Claude Code, first add the marketplace:
```
/plugin marketplace add forrestchang/andrej-karpathy-skills
```

Then install the plugin:
```
/plugin install andrej-karpathy-skills@karpathy-skills
```

This installs the guidelines as a Claude Code plugin, making the skill available across all your projects.

**Option B: CLAUDE.md (per-project)**

New project:
```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md
```

Existing project (append):
```bash
echo "" >> CLAUDE.md
curl https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md >> CLAUDE.md
```

## Using with Cursor

This repository includes a committed Cursor project rule ([`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)) so the same guidelines apply when you open the project in Cursor. See **[CURSOR.md](CURSOR.md)** for setup, using the rule in other projects, and how this relates to Claude Code.

## Key Insight

From Andrej:

> "LLMs are exceptionally good at looping until they meet specific goals... Don't tell it what to do, give it success criteria and watch it go."

The "Goal-Driven Execution" principle captures this: transform imperative instructions into declarative goals with verification loops.

## How to Know It's Working

These guidelines are working if you see:

- **Fewer unnecessary changes in diffs** — Only requested changes appear
- **Fewer rewrites due to overcomplication** — Code is simple the first time
- **Clarifying questions come before implementation** — Not after mistakes
- **Clean, minimal PRs** — No drive-by refactoring or "improvements"

## Customization

These guidelines are designed to be merged with project-specific instructions. Add them to your existing `CLAUDE.md` or create a new one.

For project-specific rules, add sections like:

```markdown
## Project-Specific Guidelines

- Use TypeScript strict mode
- All API endpoints must have tests
- Follow the existing error handling patterns in `src/utils/errors.ts`
```

## Tradeoff Note

These guidelines bias toward **caution over speed**. For trivial tasks (simple typo fixes, obvious one-liners), use judgment — not every change needs the full rigor.

The goal is reducing costly mistakes on non-trivial work, not slowing down simple tasks.

## License

MIT


translated new version also at the end zip file has such more translated languages which are Portuguese Galician Catalan Romanian Polish Czech Slovak Croatian Slovenian Swedish Icelandic Danish Norwegian Finnish Hungarian Estonian Turkish Azerbaijani Turkmen Indonesian Malay Vietnamese Filipino (Tagalog) Haitian Creole Welsh Basque Quechua Māori Sami Languages 

while this text has german spanish french italian dutch.

---

**German (Deutsch)**

# Karpathy-inspirierte Claude-Code-Richtlinien

**Die vier Prinzipien:**

1. **Denke vor dem Codieren**  
   Mach keine stillschweigenden Annahmen. Verstecke keine Verwirrung. Zeige Trade-offs auf.  
   - Formuliere Annahmen explizit  
   - Stelle bei Mehrdeutigkeit mehrere Interpretationen dar  
   - Dränge zurück, wenn ein einfacherer Ansatz möglich ist  
   - Stoppe und frage nach Klärung, wenn etwas unklar ist

2. **Einfachheit zuerst**  
   Schreibe den minimalen Code, der das Problem löst. Nichts Spekulatives.  
   - Keine Features, die nicht angefordert wurden  
   - Keine Abstraktionen für Einmal-Code  
   - Keine „Flexibilität“ oder Konfigurierbarkeit, die nicht verlangt wurde  
   - Wenn 200 Zeilen auf 50 reduziert werden können, dann tue es

3. **Chirurgische Änderungen**  
   Berühre nur das, was du unbedingt musst. Räume nur dein eigenes Chaos auf.  
   - Verbessere keinen benachbarten Code, Kommentare oder Formatierung  
   - Refaktoriere nichts, was nicht kaputt ist  
   - Passe dich dem bestehenden Stil an  
   - Entferne nur Imports/Variablen/Funktionen, die durch *deine* Änderungen überflüssig geworden sind

4. **Zielgetriebene Ausführung**  
   Definiere klare Erfolgskriterien und arbeite in Schleifen, bis sie erfüllt sind.  
   Verwandele Aufgaben in verifizierbare Ziele (z. B. „Schreibe Tests für ungültige Eingaben und mache sie grün“).

---

**Spanish (Español)**

# Directrices de Código Claude inspiradas en Karpathy

**Los cuatro principios:**

1. **Piensa antes de codificar**  
   No hagas suposiciones silenciosas. No ocultes confusión. Muestra trade-offs.  
   - Declara las suposiciones explícitamente  
   - Presenta múltiples interpretaciones cuando haya ambigüedad  
   - Rechaza enfoques innecesarios si existe uno más simple  
   - Detente y pide aclaración cuando estés confundido

2. **Simplicidad primero**  
   Código mínimo que resuelva el problema. Nada especulativo.  
   - Sin funcionalidades que no se pidieron  
   - Sin abstracciones para código de un solo uso  
   - Sin “flexibilidad” o configurabilidad no solicitada  
   - Si 200 líneas se pueden reducir a 50, hazlo

3. **Cambios quirúrgicos**  
   Toca solo lo que debes. Limpia solo tu propio desorden.  
   - No “mejores” código, comentarios o formato adyacente  
   - No refactorices lo que no está roto  
   - Mantén el estilo existente  
   - Elimina solo las importaciones/variables/funciones que *tus* cambios dejaron sin usar

4. **Ejecución orientada a objetivos**  
   Define criterios de éxito claros y trabaja en bucles hasta verificarlos.  
   Convierte tareas imperativas en metas verificables (ej. “Escribe tests para entradas inválidas y haz que pasen”).

---

**French (Français)**

# Directives de Code Claude inspirées de Karpathy

**Les quatre principes :**

1. **Réfléchis avant de coder**  
   Ne fais pas d’hypothèses silencieuses. Ne cache pas ta confusion. Présente les compromis.  
   - Énonce tes hypothèses explicitement  
   - Présente plusieurs interprétations en cas d’ambiguïté  
   - Pousse en arrière quand une approche plus simple existe  
   - Arrête-toi et demande des clarifications quand tu es confus

2. **Simplicité d’abord**  
   Code minimal qui résout le problème. Rien de spéculatif.  
   - Aucune fonctionnalité au-delà de ce qui a été demandé  
   - Aucune abstraction pour du code à usage unique  
   - Aucune « flexibilité » ou configurabilité non demandée  
   - Si 200 lignes peuvent devenir 50, réécris

3. **Changements chirurgicaux**  
   Ne touche que ce que tu dois absolument. Nettoie seulement ton propre désordre.  
   - N’améliore pas le code, les commentaires ou le formatage adjacent  
   - Ne refactorise pas ce qui n’est pas cassé  
   - Respecte le style existant  
   - Supprime uniquement les imports/variables/fonctions rendus inutiles par *tes* modifications

4. **Exécution orientée objectifs**  
   Définit des critères de succès clairs et boucle jusqu’à vérification.  
   Transforme les tâches en objectifs vérifiables (ex. « Écris des tests pour les entrées invalides et fais-les passer »).

---

**Italian (Italiano)**

# Linee guida per il Codice Claude ispirate a Karpathy

**I quattro principi:**

1. **Pensa prima di codificare**  
   Non fare supposizioni silenziose. Non nascondere confusione. Evidenzia i trade-off.  
   - Dichiarare esplicitamente le assunzioni  
   - Presentare più interpretazioni in caso di ambiguità  
   - Opporsi quando esiste un approccio più semplice  
   - Fermati e chiedi chiarimenti quando sei confuso

2. **Semplicità prima di tutto**  
   Codice minimo che risolve il problema. Niente di speculativo.  
   - Nessuna funzionalità oltre a quanto richiesto  
   - Nessuna astrazione per codice a uso singolo  
   - Nessuna “flessibilità” o configurabilità non richiesta  
   - Se 200 righe possono diventare 50, riscrivi

3. **Modifiche chirurgiche**  
   Toccare solo ciò che è strettamente necessario. Pulire solo il proprio disordine.  
   - Non “migliorare” codice, commenti o formattazione adiacente  
   - Non rifattorizzare ciò che non è rotto  
   - Mantenere lo stile esistente  
   - Rimuovere solo gli import/variabili/funzioni resi inutilizzati dalle *proprie* modifiche

4. **Esecuzione orientata agli obiettivi**  
   Definisci criteri di successo chiari e itera fino alla verifica.  
   Trasforma i compiti in obiettivi verificabili (es. «Scrivi test per input non validi e falli passare»).

---

**Dutch (Nederlands)**

# Karpathy-geïnspireerde Claude Code-richtlijnen

**De vier principes:**

1. **Denk voordat je codeert**  
   Maak geen stille aannames. Verberg geen verwarring. Toon trade-offs.  
   - Formuleer aannames expliciet  
   - Presenteer meerdere interpretaties bij ambiguïteit  
   - Duw terug als een eenvoudigere aanpak mogelijk is  
   - Stop en vraag om verduidelijking als je in de war bent

2. **Eenvoud eerst**  
   Minimale code die het probleem oplost. Niets speculatiefs.  
   - Geen functionaliteiten die niet gevraagd zijn  
   - Geen abstracties voor eenmalige code  
   - Geen “flexibiliteit” of configureerbaarheid die niet is gevraagd  
   - Als 200 regels kunnen worden teruggebracht tot 50, herschrijf dan

3. **Chirurgische wijzigingen**  
   Raak alleen aan wat je echt moet. Ruim alleen je eigen rommel op.  
   - Verbeter geen aangrenzende code, comments of opmaak  
   - Refactor niets wat niet kapot is  
   - Houd de bestaande stijl aan  
   - Verwijder alleen imports/variabelen/functies die door *jouw* wijzigingen ongebruikt zijn geraakt

4. **Doelgerichte uitvoering**  
   Definieer duidelijke succescriteria en werk in lussen tot ze geverifieerd zijn.  
   Zet taken om in verifieerbare doelen (bijv. “Schrijf tests voor ongeldige invoer en laat ze slagen”).


[karpathy-guidelines-multilang.zip](https://github.com/user-attachments/files/27044490/karpathy-guidelines-multilang.zip)

