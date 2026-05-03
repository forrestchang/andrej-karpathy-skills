# Diretrizes para Claude Code Inspiradas em Karpathy

> Confira meu novo projeto [Multica](https://github.com/multica-ai/multica) — uma plataforma open-source para executar e gerenciar agentes de codificação com skills reutilizáveis.
>
> Me siga no X: [https://x.com/jiayuan_jy](https://x.com/jiayuan_jy)

Um único arquivo `CLAUDE.md` para melhorar o comportamento do Claude Code, derivado das [observações de Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876) sobre as armadilhas dos LLMs ao codificar.

[English](./README.md) | [简体中文](./README.zh.md) | Português (BR)

## Os Problemas

Do post do Andrej:

> "Os modelos fazem suposições erradas em seu nome e simplesmente seguem em frente sem verificar. Eles não gerenciam sua confusão, não buscam esclarecimentos, não expõem inconsistências, não apresentam tradeoffs, não contestam quando deveriam."

> "Eles realmente gostam de complicar demais o código e as APIs, inflar abstrações, não limpar código morto... implementam uma construção inflada de mais de 1000 linhas quando 100 dariam conta."

> "Eles ainda às vezes alteram/removem comentários e código que não compreendem suficientemente como efeitos colaterais, mesmo que ortogonais à tarefa."

## A Solução

Quatro princípios em um único arquivo que abordam diretamente esses problemas:

| Princípio | Resolve |
|-----------|---------|
| **Pensar Antes de Codar** | Suposições erradas, confusão oculta, tradeoffs ausentes |
| **Simplicidade Primeiro** | Complicação excessiva, abstrações infladas |
| **Mudanças Cirúrgicas** | Edições ortogonais, mexer em código que não devia |
| **Execução Guiada por Objetivo** | Alavancagem via testes-primeiro, critérios de sucesso verificáveis |

## Os Quatro Princípios em Detalhe

### 1. Pensar Antes de Codar

**Não suponha. Não esconda confusão. Exponha tradeoffs.**

LLMs frequentemente escolhem uma interpretação silenciosamente e seguem com ela. Esse princípio força raciocínio explícito:

- **Declare suposições explicitamente** — Se em dúvida, pergunte em vez de adivinhar
- **Apresente múltiplas interpretações** — Não escolha em silêncio quando houver ambiguidade
- **Conteste quando justificado** — Se houver uma abordagem mais simples, diga
- **Pare quando estiver confuso** — Nomeie o que não está claro e peça esclarecimento

### 2. Simplicidade Primeiro

**Código mínimo que resolve o problema. Nada especulativo.**

Combata a tendência ao overengineering:

- Sem funcionalidades além do que foi pedido
- Sem abstrações para código de uso único
- Sem "flexibilidade" ou "configurabilidade" não solicitadas
- Sem tratamento de erro para cenários impossíveis
- Se 200 linhas poderiam ser 50, reescreva

**O teste:** Um engenheiro sênior diria que isso está complicado demais? Se sim, simplifique.

### 3. Mudanças Cirúrgicas

**Toque apenas no que precisa. Limpe apenas a sua própria bagunça.**

Ao editar código existente:

- Não "melhore" código adjacente, comentários ou formatação
- Não refatore o que não está quebrado
- Combine com o estilo existente, mesmo que você fizesse diferente
- Se notar código morto não relacionado, mencione — não delete

Quando suas mudanças criarem órfãos:

- Remova imports/variáveis/funções que SUAS mudanças tornaram não utilizadas
- Não remova código morto pré-existente sem ser pedido

**O teste:** Cada linha alterada deve rastrear diretamente para o pedido do usuário.

### 4. Execução Guiada por Objetivo

**Defina critérios de sucesso. Itere até verificar.**

Transforme tarefas imperativas em objetivos verificáveis:

| Em vez de... | Transforme em... |
|--------------|------------------|
| "Adicionar validação" | "Escreva testes para inputs inválidos, depois faça-os passar" |
| "Corrigir o bug" | "Escreva um teste que reproduza, depois faça-o passar" |
| "Refatorar X" | "Garanta que os testes passam antes e depois" |

Para tarefas multi-passo, declare um plano breve:

```
1. [Passo] → verificar: [check]
2. [Passo] → verificar: [check]
3. [Passo] → verificar: [check]
```

Critérios de sucesso fortes permitem que o LLM itere de forma independente. Critérios fracos ("faça funcionar") exigem esclarecimento constante.

## Instalação

**Opção A: Plugin do Claude Code (recomendado)**

Dentro do Claude Code, primeiro adicione o marketplace:
```
/plugin marketplace add forrestchang/andrej-karpathy-skills
```

Depois instale o plugin:
```
/plugin install andrej-karpathy-skills@karpathy-skills
```

Isso instala as diretrizes como um plugin do Claude Code, tornando a skill disponível em todos os seus projetos.

**Opção B: CLAUDE.md (por projeto)**

Projeto novo:
```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md
```

Projeto existente (append):
```bash
echo "" >> CLAUDE.md
curl https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md >> CLAUDE.md
```

## Usando com Cursor

Este repositório inclui uma regra de projeto Cursor commitada ([`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)) para que as mesmas diretrizes se apliquem ao abrir o projeto no Cursor. Veja **[CURSOR.md](CURSOR.md)** para configuração, uso da regra em outros projetos e como isso se relaciona com o Claude Code.

## Insight Central

De Andrej:

> "LLMs são excepcionalmente bons em iterar até atingir objetivos específicos... Não diga o que fazer, dê critérios de sucesso e veja-os agir."

O princípio "Execução Guiada por Objetivo" captura isso: transforme instruções imperativas em objetivos declarativos com loops de verificação.

## Como Saber Se Está Funcionando

Estas diretrizes estão funcionando se você observar:

- **Menos mudanças desnecessárias nos diffs** — Apenas mudanças solicitadas aparecem
- **Menos reescritas por complicação excessiva** — Código sai simples de primeira
- **Perguntas de esclarecimento vêm antes da implementação** — Não depois dos erros
- **PRs limpos e mínimos** — Sem refatoração drive-by ou "melhorias"

## Customização

Estas diretrizes foram feitas para serem combinadas com instruções específicas do projeto. Adicione-as ao seu `CLAUDE.md` existente ou crie um novo.

Para regras específicas do projeto, adicione seções como:

```markdown
## Diretrizes Específicas do Projeto

- Usar TypeScript em strict mode
- Todos os endpoints da API devem ter testes
- Seguir os padrões de tratamento de erro existentes em `src/utils/errors.ts`
```

## Nota sobre Tradeoff

Estas diretrizes pendem para **cautela em vez de velocidade**. Para tarefas triviais (correções simples de typo, one-liners óbvios), use bom senso — nem toda mudança precisa do rigor completo.

O objetivo é reduzir erros caros em trabalho não-trivial, não desacelerar tarefas simples.

## Licença

MIT
