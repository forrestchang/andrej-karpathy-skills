# Guías de Claude Code inspiradas en Karpathy

> Echa un vistazo a mi nuevo proyecto [Multica](https://github.com/multica-ai/multica) — una plataforma de código abierto para ejecutar y gestionar agentes de programación con habilidades reutilizables.
>
> Sígueme en X: [https://x.com/jiayuan_jy](https://x.com/jiayuan_jy)

Un único archivo `CLAUDE.md` para mejorar el comportamiento de Claude Code, derivado de [las observaciones de Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876) sobre los errores típicos de los LLM al programar.

[English](./README.md) | [简体中文](./README.zh.md) | Español

## El problema

Del post de Andrej:

> "Los modelos asumen cosas erróneas en tu nombre y siguen adelante sin verificar. No gestionan su confusión, no piden aclaraciones, no exponen contradicciones, no presentan compensaciones, no se oponen cuando deberían."

> "Les encanta sobrecomplicar el código y las APIs, inflar abstracciones, no limpian código muerto… implementan una construcción inflada de 1000 líneas cuando bastaban 100."

> "A veces todavía cambian o eliminan comentarios y código que no entienden lo suficiente como efecto colateral, incluso cuando es ortogonal a la tarea."

## La solución

Cuatro principios en un solo archivo que atacan estos problemas directamente:

| Principio | Qué resuelve |
|-----------|--------------|
| **Pensar antes de programar** | Suposiciones erróneas, confusión oculta, compensaciones omitidas |
| **Simplicidad primero** | Sobrecomplicación, abstracciones infladas |
| **Cambios quirúrgicos** | Ediciones ortogonales, tocar código que no deberías |
| **Ejecución guiada por objetivos** | Apalancarse en tests-first y criterios de éxito verificables |

## Los cuatro principios en detalle

### 1. Pensar antes de programar

**No asumas. No escondas la confusión. Expón las compensaciones.**

Los LLM suelen elegir una interpretación en silencio y seguir adelante con ella. Este principio fuerza el razonamiento explícito:

- **Declara las suposiciones explícitamente** — Si no estás seguro, pregunta en lugar de adivinar
- **Presenta múltiples interpretaciones** — No elijas en silencio cuando hay ambigüedad
- **Opónte cuando corresponda** — Si existe un enfoque más simple, dilo
- **Detente cuando estés confundido** — Nombra lo que no está claro y pide aclaración

### 2. Simplicidad primero

**El mínimo código que resuelva el problema. Nada especulativo.**

Combate la tendencia a la sobreingeniería:

- Nada de funcionalidades más allá de lo que se pidió
- Nada de abstracciones para código de un solo uso
- Nada de "flexibilidad" ni "configurabilidad" que no se haya pedido
- Nada de manejo de errores para escenarios imposibles
- Si 200 líneas pueden ser 50, reescríbelas

**La prueba:** ¿Diría un ingeniero senior que esto está sobrecomplicado? Si sí, simplifica.

### 3. Cambios quirúrgicos

**Toca solo lo que tengas que tocar. Limpia solo tu propio desorden.**

Al editar código existente:

- No "mejores" código, comentarios o formato adyacentes
- No refactorices cosas que no están rotas
- Respeta el estilo existente, aunque tú lo harías distinto
- Si notas código muerto no relacionado, menciónalo — no lo borres

Cuando tus cambios dejan huérfanos:

- Elimina imports/variables/funciones que TUS cambios dejaron sin uso
- No elimines código muerto preexistente salvo que te lo pidan

**La prueba:** Cada línea modificada debería trazar directamente a la petición del usuario.

### 4. Ejecución guiada por objetivos

**Define los criterios de éxito. Itera hasta verificarlos.**

Transforma las tareas imperativas en objetivos verificables:

| En lugar de... | Transforma a... |
|---------------|-----------------|
| "Añade validación" | "Escribe tests para entradas inválidas, después haz que pasen" |
| "Arregla el bug" | "Escribe un test que lo reproduzca, después haz que pase" |
| "Refactoriza X" | "Asegura que los tests pasan antes y después" |

Para tareas multipaso, declara un plan breve:

```
1. [Paso] → verificar: [check]
2. [Paso] → verificar: [check]
3. [Paso] → verificar: [check]
```

Criterios de éxito fuertes permiten que el LLM itere de forma autónoma. Criterios débiles ("haz que funcione") requieren aclaraciones constantes.

## Instalación

**Opción A: Plugin de Claude Code (recomendado)**

Desde Claude Code, primero añade el marketplace:
```
/plugin marketplace add forrestchang/andrej-karpathy-skills
```

Después instala el plugin:
```
/plugin install andrej-karpathy-skills@karpathy-skills
```

Esto instala las guías como plugin de Claude Code, dejando la skill disponible en todos tus proyectos.

**Opción B: CLAUDE.md (por proyecto)**

Proyecto nuevo:
```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md
```

Proyecto existente (anexar):
```bash
echo "" >> CLAUDE.md
curl https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md >> CLAUDE.md
```

## Usando con Cursor

Este repositorio incluye una regla de proyecto de Cursor ya commiteada ([`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)) para que las mismas guías apliquen al abrir el proyecto en Cursor. Consulta **[CURSOR.md](CURSOR.md)** para la configuración, el uso de la regla en otros proyectos, y cómo se relaciona con Claude Code.

## Idea clave

De Andrej:

> "Los LLM son excepcionalmente buenos iterando hasta cumplir objetivos específicos… No le digas qué hacer, dale criterios de éxito y míralo trabajar."

El principio de "Ejecución guiada por objetivos" captura exactamente esto: transforma instrucciones imperativas en objetivos declarativos con bucles de verificación.

## Cómo saber si está funcionando

Estas guías están funcionando si ves:

- **Menos cambios innecesarios en los diffs** — Solo aparecen los cambios pedidos
- **Menos reescrituras por sobrecomplicación** — El código sale simple a la primera
- **Las preguntas de aclaración llegan antes de la implementación** — No después de los errores
- **PRs limpios y mínimos** — Sin refactors de paso ni "mejoras" colaterales

## Personalización

Estas guías están diseñadas para fusionarse con instrucciones específicas del proyecto. Añádelas a tu `CLAUDE.md` existente o crea uno nuevo.

Para reglas específicas del proyecto, añade secciones como:

```markdown
## Guías específicas del proyecto

- Usar TypeScript en modo strict
- Todos los endpoints de API deben tener tests
- Seguir los patrones de manejo de errores existentes en `src/utils/errors.ts`
```

## Nota sobre compensaciones

Estas guías se inclinan hacia **cautela por encima de velocidad**. Para tareas triviales (arreglos de typos, oneliners obvios), usa tu criterio — no todo cambio necesita el rigor completo.

El objetivo es reducir errores costosos en trabajo no trivial, no frenar las tareas simples.

## Licencia

MIT
