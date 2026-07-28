# Diretrizes para Claude Code inspiradas em Karpathy

> Conheça meu novo projeto [Multica](https://github.com/multica-ai/multica) — uma plataforma open-source para rodar e gerenciar agentes de código com skills reutilizáveis.
>
> Me siga no X: [https://x.com/jiayuan_jy](https://x.com/jiayuan_jy)

Um único arquivo `CLAUDE.md` para melhorar o comportamento do Claude Code, derivado das [observações de Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876) sobre as armadilhas de LLMs ao programar.

[English](./README.md) | [简体中文](./README.zh.md) | Português

## Os Problemas

Do post do Andrej:

> "Os modelos fazem suposições erradas em seu nome e simplesmente seguem em frente com elas sem verificar. Não gerenciam a própria confusão, não buscam esclarecimentos, não expõem inconsistências, não apresentam tradeoffs, não questionam quando deveriam."

> "Eles adoram complicar demais código e APIs, inchar abstrações, não limpam código morto... implementam uma construção inflada de mais de 1000 linhas quando 100 bastariam."

> "Às vezes ainda alteram/removem comentários e código que não compreendem o suficiente, como efeitos colaterais, mesmo quando ortogonais à tarefa."

## A Solução

Quatro princípios em um único arquivo que atacam diretamente esses problemas:

| Princípio | Resolve |
|-----------|---------|
| **Pensar Antes de Codar** | Suposições erradas, confusão escondida, tradeoffs omitidos |
| **Simplicidade Primeiro** | Complicação excessiva, abstrações infladas |
| **Mudanças Cirúrgicas** | Edições ortogonais, mexer em código que não devia |
| **Execução Orientada a Objetivos** | Alavancagem via testes-primeiro, critérios de sucesso verificáveis |

## Os Quatro Princípios em Detalhe

### 1. Pensar Antes de Codar

**Não assuma. Não esconda confusão. Exponha os tradeoffs.**

LLMs muitas vezes escolhem uma interpretação silenciosamente e seguem com ela. Este princípio força o raciocínio explícito:

- **Declare as suposições explicitamente** — Se estiver incerto, pergunte em vez de adivinhar
- **Apresente múltiplas interpretações** — Não escolha silenciosamente quando houver ambiguidade
- **Questione quando fizer sentido** — Se existe uma abordagem mais simples, diga
- **Pare quando estiver confuso** — Nomeie o que está confuso e peça esclarecimento

### 2. Simplicidade Primeiro

**Código mínimo que resolve o problema. Nada especulativo.**

Combata a tendência ao over-engineering:

- Nenhuma funcionalidade além do que foi pedido
- Nenhuma abstração para código de uso único
- Nenhuma "flexibilidade" ou "configurabilidade" não solicitada
- Nenhum tratamento de erro para cenários impossíveis
- Se 200 linhas poderiam ser 50, reescreva

**O teste:** Um engenheiro sênior diria que isso está complicado demais? Se sim, simplifique.

### 3. Mudanças Cirúrgicas

**Toque só no necessário. Limpe apenas a sua própria bagunça.**

Ao editar código existente:

- Não "melhore" código, comentários ou formatação adjacentes
- Não refatore coisas que não estão quebradas
- Siga o estilo existente, mesmo que você fizesse diferente
- Se notar código morto não relacionado, mencione — não delete

Quando suas mudanças criam órfãos:

- Remova imports/variáveis/funções que AS SUAS mudanças tornaram não utilizados
- Não remova código morto pré-existente sem ser pedido

**O teste:** Cada linha alterada deve se rastrear diretamente ao pedido do usuário.

### 4. Execução Orientada a Objetivos

**Defina critérios de sucesso. Itere até verificar.**

Transforme tarefas imperativas em metas verificáveis:

| Em vez de... | Transforme em... |
|--------------|------------------|
| "Adicione validação" | "Escreva testes para entradas inválidas, depois faça-os passar" |
| "Corrija o bug" | "Escreva um teste que o reproduza, depois faça-o passar" |
| "Refatore X" | "Garanta que os testes passem antes e depois" |

Para tarefas multi-passo, declare um plano breve:

```
1. [Passo] → verificar: [checagem]
2. [Passo] → verificar: [checagem]
3. [Passo] → verificar: [checagem]
```

Critérios de sucesso fortes permitem que a LLM itere de forma independente. Critérios fracos ("faça funcionar") exigem esclarecimento constante.

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

Isso instala as diretrizes como um plugin do Claude Code, deixando a skill disponível em todos os seus projetos.

**Opção B: CLAUDE.md (por projeto)**

Projeto novo:
```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md
```

Projeto existente (anexar ao final):
```bash
echo "" >> CLAUDE.md
curl https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md >> CLAUDE.md
```

## Usando com o Cursor

Este repositório inclui uma regra de projeto do Cursor versionada ([`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)), para que as mesmas diretrizes valham ao abrir o projeto no Cursor. Veja **[CURSOR.md](CURSOR.md)** para configuração, uso da regra em outros projetos e como isso se relaciona com o Claude Code.

## O Insight Principal

Do Andrej:

> "As LLMs são excepcionalmente boas em iterar até atingir metas específicas... Não diga o que fazer; dê critérios de sucesso e veja acontecer."

O princípio "Execução Orientada a Objetivos" captura isso: transforme instruções imperativas em metas declarativas com laços de verificação.

## Como Saber que Está Funcionando

As diretrizes estão funcionando se você observar:

- **Menos mudanças desnecessárias nos diffs** — Só as mudanças pedidas aparecem
- **Menos reescritas por complicação excessiva** — O código já sai simples de primeira
- **Perguntas de esclarecimento vêm antes da implementação** — Não depois dos erros
- **PRs limpos e mínimos** — Sem refatoração oportunista ou "melhorias" de carona

## Personalização

Estas diretrizes foram feitas para se combinar com instruções específicas do projeto. Adicione-as ao seu `CLAUDE.md` existente ou crie um novo.

Para regras específicas do projeto, adicione seções como:

```markdown
## Diretrizes Específicas do Projeto

- Use o modo strict do TypeScript
- Todos os endpoints de API devem ter testes
- Siga os padrões de tratamento de erro existentes em `src/utils/errors.ts`
```

## Nota sobre Tradeoffs

Estas diretrizes pendem para **cautela em vez de velocidade**. Para tarefas triviais (correção de typo, one-liners óbvios), use o bom senso — nem toda mudança precisa do rigor completo.

O objetivo é reduzir erros custosos em trabalhos não triviais, não desacelerar tarefas simples.

## Licença

MIT
