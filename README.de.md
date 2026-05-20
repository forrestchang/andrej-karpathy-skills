# Karpathy-inspirierte Claude-Code-Richtlinien

> Schau dir mein neues Projekt [Multica](https://github.com/multica-ai/multica) an — eine Open-Source-Plattform zum Ausführen und Verwalten von Coding-Agenten mit wiederverwendbaren Skills.
>
> Folge mir auf X: [https://x.com/jiayuan_jy](https://x.com/jiayuan_jy)

Eine einzelne `CLAUDE.md`-Datei, die das Verhalten von Claude Code verbessert — abgeleitet aus [Andrej Karpathys Beobachtungen](https://x.com/karpathy/status/2015883857489522876) zu typischen Fallstricken beim Coden mit LLMs.

[English](./README.md) | [简体中文](./README.zh.md) | Deutsch

## Die Probleme

Aus Andrejs Beitrag:

> „Die Modelle treffen stellvertretend für dich falsche Annahmen und laufen einfach damit weiter, ohne sie zu prüfen. Sie gehen mit ihrer eigenen Verwirrung nicht um, suchen keine Klärung, decken keine Widersprüche auf, zeigen keine Abwägungen auf und widersprechen nicht, wenn sie es sollten."

> „Sie neigen wirklich dazu, Code und APIs zu überkomplizieren, Abstraktionen aufzublähen, toten Code nicht aufzuräumen ... sie bauen eine aufgeblähte Konstruktion über 1000 Zeilen, wo 100 genügen würden."

> „Sie ändern oder entfernen manchmal immer noch Kommentare und Code, die sie nicht ausreichend verstehen, als Nebeneffekt — selbst wenn das nichts mit der Aufgabe zu tun hat."

## Die Lösung

Vier Prinzipien in einer Datei, die diese Probleme direkt adressieren:

| Prinzip | Adressiert |
|---------|------------|
| **Erst denken, dann coden** | Falsche Annahmen, verborgene Verwirrung, fehlende Abwägungen |
| **Einfachheit zuerst** | Überkomplizierung, aufgeblähte Abstraktionen |
| **Chirurgische Änderungen** | Sachfremde Edits, Anfassen von Code, den man nicht anfassen sollte |
| **Zielgetriebene Ausführung** | Hebelwirkung durch Tests-zuerst, überprüfbare Erfolgskriterien |

## Die vier Prinzipien im Detail

### 1. Erst denken, dann coden

**Nichts annehmen. Verwirrung nicht verbergen. Abwägungen offenlegen.**

LLMs wählen oft stillschweigend eine Interpretation und laufen damit los. Dieses Prinzip erzwingt explizites Nachdenken:

- **Annahmen explizit benennen** — Bei Unsicherheit lieber fragen als raten
- **Mehrere Interpretationen aufzeigen** — Bei Mehrdeutigkeit nicht stillschweigend eine auswählen
- **Widersprechen, wo angebracht** — Wenn es einen einfacheren Weg gibt, sag es
- **Anhalten bei Verwirrung** — Benenne, was unklar ist, und bitte um Klärung

### 2. Einfachheit zuerst

**Minimaler Code, der das Problem löst. Nichts Spekulatives.**

Gegen den Hang zum Overengineering:

- Keine Funktionen über das Gefragte hinaus
- Keine Abstraktionen für einmalig genutzten Code
- Keine „Flexibilität" oder „Konfigurierbarkeit", die nicht verlangt wurde
- Keine Fehlerbehandlung für unmögliche Szenarien
- Wenn 200 Zeilen auch 50 sein könnten, schreib es um

**Der Test:** Würde ein Senior-Engineer sagen, das ist überkompliziert? Falls ja, vereinfache.

### 3. Chirurgische Änderungen

**Fass nur an, was du musst. Räum nur deinen eigenen Schlamassel auf.**

Beim Bearbeiten von bestehendem Code:

- Benachbarten Code, Kommentare oder Formatierung nicht „verbessern"
- Nichts refactoren, was nicht kaputt ist
- Den bestehenden Stil übernehmen, auch wenn du es anders machen würdest
- Wenn dir nicht zusammenhängender toter Code auffällt, erwähne ihn — lösche ihn nicht

Wenn deine Änderungen Verwaiste hinterlassen:

- Entferne Imports/Variablen/Funktionen, die DEINE Änderungen ungenutzt gemacht haben
- Entferne keinen bereits vorhandenen toten Code, sofern nicht darum gebeten wird

**Der Test:** Jede geänderte Zeile sollte direkt auf die Anfrage des Nutzers zurückführbar sein.

### 4. Zielgetriebene Ausführung

**Erfolgskriterien definieren. In Schleife laufen, bis verifiziert.**

Verwandle imperative Aufgaben in überprüfbare Ziele:

| Statt ... | Umwandeln in ... |
|-----------|------------------|
| „Validierung hinzufügen" | „Tests für ungültige Eingaben schreiben, dann grün machen" |
| „Den Bug fixen" | „Einen Test schreiben, der ihn reproduziert, dann grün machen" |
| „X refactoren" | „Sicherstellen, dass die Tests vorher und nachher grün sind" |

Für mehrstufige Aufgaben einen kurzen Plan formulieren:

```
1. [Schritt] → verifizieren: [Prüfung]
2. [Schritt] → verifizieren: [Prüfung]
3. [Schritt] → verifizieren: [Prüfung]
```

Starke Erfolgskriterien lassen das LLM eigenständig in der Schleife laufen. Schwache Kriterien („bring es zum Laufen") erfordern ständige Klärung.

## Installation

**Option A: Claude-Code-Plugin (empfohlen)**

Füge in Claude Code zuerst den Marketplace hinzu:
```
/plugin marketplace add forrestchang/andrej-karpathy-skills
```

Dann installiere das Plugin:
```
/plugin install andrej-karpathy-skills@karpathy-skills
```

Das installiert die Richtlinien als Claude-Code-Plugin, sodass der Skill in all deinen Projekten verfügbar ist.

**Option B: CLAUDE.md (pro Projekt)**

Neues Projekt:
```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md
```

Bestehendes Projekt (anhängen):
```bash
echo "" >> CLAUDE.md
curl https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md >> CLAUDE.md
```

## Nutzung mit Cursor

Dieses Repository enthält eine eingecheckte Cursor-Projektregel ([`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)), damit dieselben Richtlinien gelten, wenn du das Projekt in Cursor öffnest. Siehe **[CURSOR.md](CURSOR.md)** für Einrichtung, Nutzung der Regel in anderen Projekten und wie das mit Claude Code zusammenhängt.

## Kernerkenntnis

Von Andrej:

> „LLMs sind außergewöhnlich gut darin, in einer Schleife zu laufen, bis sie bestimmte Ziele erreichen ... Sag ihm nicht, was es tun soll — gib ihm Erfolgskriterien und sieh ihm zu."

Das Prinzip „Zielgetriebene Ausführung" greift genau das auf: imperative Anweisungen in deklarative Ziele mit Verifikationsschleifen verwandeln.

## Woran du erkennst, dass es funktioniert

Diese Richtlinien wirken, wenn du Folgendes siehst:

- **Weniger unnötige Änderungen in Diffs** — Nur die angeforderten Änderungen tauchen auf
- **Weniger Neuschreiben wegen Überkomplizierung** — Code ist gleich beim ersten Mal einfach
- **Klärende Rückfragen kommen vor der Implementierung** — Nicht erst nach Fehlern
- **Saubere, minimale PRs** — Kein nebenbei eingeschleustes Refactoring oder „Verbesserungen"

## Anpassung

Diese Richtlinien sind darauf ausgelegt, mit projektspezifischen Anweisungen kombiniert zu werden. Füge sie deiner bestehenden `CLAUDE.md` hinzu oder lege eine neue an.

Für projektspezifische Regeln ergänze Abschnitte wie:

```markdown
## Projektspezifische Richtlinien

- TypeScript Strict Mode verwenden
- Alle API-Endpoints müssen Tests haben
- Den bestehenden Mustern zur Fehlerbehandlung in `src/utils/errors.ts` folgen
```

## Hinweis zur Abwägung

Diese Richtlinien tendieren zu **Vorsicht statt Geschwindigkeit**. Für triviale Aufgaben (einfache Tippfehler-Korrekturen, offensichtliche Einzeiler) nutze dein Urteilsvermögen — nicht jede Änderung braucht die volle Sorgfalt.

Das Ziel ist, kostspielige Fehler bei nicht-trivialer Arbeit zu reduzieren — nicht, einfache Aufgaben zu verlangsamen.

## Lizenz

MIT
