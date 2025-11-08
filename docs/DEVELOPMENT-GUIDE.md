# FocusFlow - Guia de Desenvolvimento Completo

> **📌 IMPORTANTE**: Este documento DEVE ser consultado antes de iniciar qualquer alteração e atualizado após cada mudança significativa no projeto.

**Última Atualização**: 7 de novembro de 2025  
**Status do Projeto**: ✅ Build limpo (0 erros)  
**Versão**: 1.2.5

---

## 🎯 Visão Geral da Aplicação

### Propósito

**FocusFlow** é um painel pessoal integrado para gerenciamento de carreira, produtividade e finanças, projetado com princípios **ADHD-friendly**:

- **Reality Check**: Dashboard realista de progresso profissional
- **Gestão de Candidaturas**: Kanban para acompanhamento de processos seletivos
- **Gestão Financeira**: Controle de orçamento, despesas e investimentos
- **Rotinas e Hábitos**: Sistema de tarefas recorrentes e one-time
- **Análise de Tempo**: Pomodoro e gestão de tempo
- **Roadmap Profissional**: Planejamento de carreira e metas
- **Performance**: Dashboards de progresso e conquistas
- **Feedback Centralizado**: Consolidação de registros com filtros, exportação XLSX e feedback por IA (Markdown)

### Filosofia de Design

1. **Database-First**: Dados armazenados em Vercel Postgres com Prisma ORM
2. **Type-Safe API**: tRPC para comunicação client-server totalmente tipada
3. **ADHD-Friendly**: Interface clara, CTAs únicos, feedback imediato
4. **Type-Safe**: TypeScript estrito, zero uso de `any`
5. **Server State**: React Query para gerenciamento de cache e sincronização
6. **English-Only UI**: Todo conteúdo visível ao usuário DEVE estar em inglês

---

## 🏗️ Arquitetura Técnica

### Stack Principal

| Tecnologia            | Versão  | Propósito                           |
| --------------------- | ------- | ----------------------------------- |
| **Next.js**           | 15.5.6  | Framework React com App Router      |
| **React**             | 19.2.0  | UI Library + React Compiler         |
| **TypeScript**        | 5.9.3   | Type safety (modo strict)           |
| **Prisma**            | 6.19.0  | ORM para Postgres                   |
| **tRPC**              | 10.45.2 | Type-safe API client/server         |
| **React Query**       | 4.36.1  | Server state management             |
| **Vercel Postgres**   | Latest  | Managed PostgreSQL database         |
| **Tailwind CSS**      | 3.4.15  | Utility-first styling               |
| **ShadCN UI**         | Latest  | Component library                   |
| **Radix UI**          | Various | Accessible primitives               |
| **date-fns**          | 4.1.0   | Date manipulation                   |
| **react-hook-form**   | 7.54.2  | Form management                     |
| **zod**               | 3.24.1  | Schema validation                   |
| **Recharts**          | 3.3.0   | Data visualization                  |
| **pdf-lib**           | 1.17.1  | PDF generation                      |
| **Auth0**             | 4.11.1  | Authentication (enabled)            |
| **Genkit** (opcional) | 1.22.0  | AI features (sugestões financeiras) |

### Configurações Críticas

#### Next.js Config (`next.config.js`)

```javascript
experimental: {
  reactCompiler: true, // ⚠️ React Compiler ativo - cuidado com patterns incompatíveis
}
```

#### TypeScript Config (`tsconfig.json`)

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

**🚨 REGRA ABSOLUTA**: Nunca usar `any`. Sempre tipar explicitamente.

---

## 📁 Estrutura de Arquivos

### Organização Principal

```
focus-flow/
├── src/
│   ├── server/                       # Backend tRPC API
│   │   ├── db.ts                    # Prisma client singleton
│   │   ├── context.ts               # tRPC request context
│   │   ├── trpc.ts                  # tRPC initialization
│   │   └── routers/                 # API routers
│   │       ├── index.ts             # Main app router
│   │       ├── task.ts              # Tasks CRUD
│   │       ├── routine.ts           # Routines & checkmarks
│   │       ├── application.ts       # Job applications
│   │       ├── finance.ts           # Financial tracking
│   │       ├── goal.ts              # Goals
│   │       ├── activity.ts          # Pomodoro, time tracking, journal
│   │       ├── feedback.ts          # 🔹 Feedback (agregação + geração AI)
│   │       ├── gamification.ts      # Achievements, rewards
│   │       └── dashboard.ts         # Dashboard, settings
│   │
│   ├── app/                          # Next.js App Router
│   │   ├── (features)/               # Rotas agrupadas
│   │   │   ├── layout.tsx           # Layout compartilhado
│   │   │   ├── applications/        # Gestão de candidaturas
│   │   │   ├── dashboard/           # Dashboard principal
│   │   │   ├── finances/            # Gestão financeira
│   │   │   ├── goals/               # Metas e objetivos
│   │   │   ├── feedback/            # 🔹 Feedback centralizado (/feedback)
│   │   │   ├── home/                # Página inicial
│   │   │   ├── performance/         # Análise de performance
│   │   │   ├── profile/             # Perfil do usuário
│   │   │   ├── roadmap/             # Roadmap profissional
│   │   │   ├── routine/             # Rotinas diárias (LEGACY)
│   │   │   ├── settings/            # Configurações
│   │   │   ├── tasks/               # ✅ Tarefas (migrado para DB)
│   │   │   ├── time-management/     # Gestão de tempo
│   │   │   ├── rewards/             # Rewards (condicionais e compráveis)
│   │   │   └── achievements/        # Achievements (vitalícios)
│   │   ├── api/                     # API routes
│   │   │   └── trpc/[trpc]/        # tRPC API handler
│   │   ├── globals.css              # Estilos globais + CSS vars
│   │   ├── layout.tsx               # Root layout
│   │   ├── providers.tsx            # React Query + tRPC providers
│   │   └── page.tsx                 # Landing page
│   │
│   ├── components/                   # Componentes reutilizáveis
│   │   ├── ui/                      # ShadCN UI components
│   │   ├── form-dialog.tsx          # Diálogos de formulário
│   │   ├── logo.tsx                 # Logo do app
│   │   └── sound.tsx                # Sistema de áudio
│   │
│   ├── features/                     # Componentes específicos de features
│   │   ├── tasks/                   # Task management
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskList.tsx
│   │   ├── achievements/            # UI de achievements
│   │   │   ├── AchievementCard.tsx
│   │   │   └── AchievementGallery.tsx
│   │   ├── rewards/                 # UI de rewards
│   │   │   └── RewardCard.tsx
│   │   ├── roadmap/
│   │   │   └── roadmap-loader.tsx   # Dynamic import para SSR
│   │   ├── pomodoro/
│   │   ├── routines/
│   │   ├── shared/
│   │   │   └── GemBalance.tsx       # Saldo de gemas no header
│   │   └── ...
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-data-logger.ts       # Logging de ações
│   │   ├── use-local-storage.ts     # Persistência local (LEGACY - migrando)
│   │   ├── use-tasks-db.ts          # ✅ Tasks com tRPC (migrado)
│   │   ├── (REMOVIDO) use-reward-system.ts     # Legacy localStorage reward system (substituído por rewardState via tRPC)
│   │   ├── use-feedback.ts          # 🔹 Hooks: registros + geração de feedback
│   │   ├── (REMOVIDO) use-mobile.tsx           # Hook de breakpoint não utilizado (remoção para reduzir superfície)
│   │   └── use-toast.ts             # Notificações
│   │
│   ├── lib/                          # Utilities e tipos
│   │   ├── types.ts                 # ✅ Tipos modernos (Task, RoutineItem)
│   │   ├── trpc.ts                  # ✅ tRPC client configuration
│   │   ├── legacy-data.ts           # ✅ Tipos legacy (LegacyTask)
│   │   ├── data.ts                  # ⚠️ DEPRECATED - usar legacy-data.ts
│   │   ├── schedule.ts              # Scheduling utilities
│   │   ├── storage.ts               # localStorage wrapper (LEGACY)
│   │   ├── utils.ts                 # Utility functions
│   │   ├── motivational-phrases.ts  # Frases motivacionais
│   │   └── placeholder-images.ts    # Imagens placeholder
│   │   ├── initial-achievements.ts  # Achievements padrão (16)
│   │   ├── initial-rewards.ts       # Rewards padrão (condicionais/compráveis)
│   │   └── reward-utils.ts          # Lógica de gemas, resets e unlock
│   │
│   ├── ai/                           # Genkit AI flows
│   │   ├── genkit.ts                # Genkit config
│   │   ├── dev.ts                   # Dev entry point
│   │   └── flows/
│   │       ├── financial-suggestions.ts
│   │       ├── personalized-investment-tips.ts
│   │       └── feedback-insights.ts  # 🔹 Geração de feedback em Markdown (persona “chefe sábio”)
│   │       └── extract-bank-statement-flow.ts
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── docs/                             # Documentação do projeto
│   ├── DEVELOPMENT-GUIDE.md         # 👈 VOCÊ ESTÁ AQUI
│   ├── BACKEND-MIGRATION.md         # ✅ Guia de migração para backend
│   └── EXTERNAL-SETUP.md            # ✅ Setup Vercel Postgres
│
├── prisma/                           # Prisma ORM
│   ├── schema.prisma                # Database schema
│   └── migrations/                  # Migration history
│
├── package.json                      # Dependências e scripts
├── prisma.config.ts                  # Prisma configuration
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
├── next.config.js                    # Next.js config
└── components.json                   # ShadCN config
```

### ⚠️ Padrões de Organização

#### ✅ CORRETO

```typescript
// Componentes de feature dentro de src/features/
src / features / tasks / TaskForm.tsx;
src / features / tasks / TaskList.tsx;

// Imports relativos dentro da mesma feature
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
```

#### ❌ ERRADO

```typescript
// NÃO criar pasta components dentro de app/(features)/
src / app / features / tasks / components / TaskForm.tsx; // ❌

// NÃO usar imports absolutos dentro da mesma feature
import { TaskForm } from "@/features/tasks/TaskForm"; // ❌ (usar relativo)

// NÃO incluir extensão .ts/.tsx em imports
import { flow } from "./flow.ts"; // ❌
import { flow } from "./flow"; // ✅
```

---

## 🎨 Sistema de Design

### Paleta de Cores e Tema (Light/Dark)

```css
/* Primary */
--primary: #293462 (Deep Blue)
--primary-light: #4A5B8C
--primary-dark: #1A2340

/* Background */
--background: #D8E2DC (Light Blue-Gray)
--surface: #FFFFFF

/* Accent */
--accent: #EA906A (Warm Coral)
--accent-light: #F5B89A

/* Semantic */
--success: #10B981
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6

/* Text */
--text-primary: #1F2937
--text-secondary: #6B7280
--text-muted: #9CA3AF
```

#### Dark/Light Theme

- Dark mode é aplicado via classe `dark` no `document.documentElement` (Tailwind: `darkMode: ['class']`).
- Provider: `ThemeProvider` em `src/components/theme-provider.tsx` (sem dependências externas)
  - Persiste preferência em `localStorage` (`theme`: `light` | `dark` | `system`)
  - Respeita `prefers-color-scheme` quando em `system`
  - Emite evento `theme-change` no `window` para integrações opcionais
- Toggle: `ThemeToggle` (`src/components/theme-toggle.tsx`)
  - Botão simples (Sun/Moon) que alterna entre claro/escuro
  - Presente no header público e no shell das features

Notas de compatibilidade e FOUC:

- next-themes não é compatível com React 19 (peer depende de React <= 18). Usamos um `ThemeProvider` próprio.
- Para evitar flash de tema (FOUC), um script inline aplica o tema salvo/sistema antes da hidratação: veja `src/app/layout.tsx` (script `theme-init` com strategy `beforeInteractive`).

Padrões de uso:

- Use sempre tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`) em vez de cores fixas
- Evite inline colors; prefira `text-primary`, `bg-secondary`, etc.
- Cards: use `bg-card` e `bg-card/50` com parcimônia; no dark, evite contrastes extremos

### Tipografia

- **Body**: Inter (Google Fonts)
- **Headlines**: Space Grotesk (Google Fonts)
- **Monospace**: JetBrains Mono (para código)

### Princípios de UI

1. **Single CTA por seção**: Evitar múltiplas ações confusas
2. **Feedback imediato**: Animações e estados visuais claros
3. **Hierarquia visual**: Tamanhos e pesos consistentes
4. **Espaçamento consistente**: Escala de 4px (4, 8, 12, 16, 24, 32, 48)
5. **Acessibilidade**: Contraste mínimo WCAG AA, suporte a teclado

### Componentes Obrigatórios

**🚨 REGRA**: Usar APENAS componentes ShadCN UI + Radix UI. Não criar componentes customizados sem necessidade.

- ✅ Button, Input, Label, Select, Dialog, Sheet
- ✅ Card, Badge, Avatar, Separator
- ✅ Form (react-hook-form + zod)
- ✅ Toast (notificações)
- ✅ Command (command palette)

---

## 🔧 Sistema de Tipos

### Separação Crítica: Task vs LegacyTask

**🚨 IMPORTANTE**: Existem DOIS sistemas de tarefas no projeto:

#### 1. Sistema Moderno (Tasks) - `/tasks`

**Arquivo**: `src/lib/types.ts`

```typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus; // "todo" | "in-progress" | "done" | "cancelled"
  priority?: "low" | "medium" | "high";
  dueDate?: string; // ISO date
  tags?: string[];
  createdAt: string;
  completedDate?: string;
}

export type TaskStatus = "todo" | "in-progress" | "done" | "cancelled";
```

**Uso**: Tarefas one-time, sistema de TODO moderno

#### 2. Sistema Legacy (Routine) - `/routine`

**Arquivo**: `src/lib/legacy-data.ts`

```typescript
export interface LegacyTask {
  id: string;
  title: string;
  status: LegacyTaskStatus; // "todo" | "in-progress" | "done" | "skipped"
  period: RoutinePeriod; // "morning" | "afternoon" | "evening"
  startTime?: string;
  endTime?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  isGeneral?: boolean;
  isRoadmapTask?: boolean;
}

export type LegacyTaskStatus = "todo" | "in-progress" | "done" | "skipped";
export type RoutinePeriod = "morning" | "afternoon" | "evening";
```

**Uso**: Sistema antigo de rotinas diárias, mantido para compatibilidade

### ⚠️ Regras de Uso

1. **NUNCA misturar os tipos** - cada página usa seu próprio tipo
2. `/tasks` usa `Task` de `types.ts`
3. `/routine` usa `LegacyTask` de `legacy-data.ts`
4. `RoutinePeriod` está exportado em `schedule.ts` para uso em utilities

### Outros Tipos Importantes

```typescript
// Rotinas recorrentes (novo sistema)
export interface RoutineItem {
  id: string;
  title: string;
  description?: string;
  category: "health" | "work" | "personal" | "learning";
  frequency: "daily" | "weekly" | "monthly";
  completedDates: string[]; // ISO dates
  streakCount: number;
  createdAt: string;
  routineType?: "study" | "code" | "job-search" | "finances" | "general"; // For reflection questions
  requiresReflection?: boolean; // If true, shows reflection dialog before completing
}
```

**Routine Reflection System**:

O sistema de rotinas suporta **reflexão opcional** antes da conclusão:

- ✅ **requiresReflection: true** → Mostra dialog de reflexão com perguntas baseadas em `routineType`
- ✅ **requiresReflection: false** → Completa imediatamente ao marcar checkbox
- ✅ **routineType** determina as perguntas: study, code, job-search, finances, general
- ✅ Usuário controla no RoutineForm se cada rotina precisa reflexão
- ✅ **Checkbox funciona como toggle**: Rotinas podem ser marcadas/desmarcadas livremente

**Tipos de Perguntas por Routine Type**:

1. **study**: Foco em aprendizado e compreensão

   - Can you explain what you learned?
   - Do you know WHY this matters?
   - How will you apply this? (Be specific)

2. **code**: Foco em qualidade e entendimento do código

   - Did you learn it or just copy it?
   - Can you explain this code to someone?
   - Is this worth committing?
   - What did AI help with? What did YOU solve?

3. **job-search**: Foco em qualidade da candidatura

   - Did you fully read the job description?
   - Did you research the company?
   - Why are you a good fit? (Specific reasons)
   - Did you customize your application?

4. **finances**: Foco em consciência financeira

   - Did you review all transactions?
   - What pattern did you notice?
   - Did you identify one action to improve?

5. **general**: Foco em atenção plena
   - Did you complete this task fully?
   - Did you do it mindfully or on autopilot?
   - What did you notice or learn?

**Quando usar reflexão**:

- ✅ Atividades de estudo profundo
- ✅ Sessões de código importantes
- ✅ Aplicações de emprego
- ✅ Revisões financeiras
- ❌ Tarefas simples (arrumar cama, exercícios de rotina)
- ❌ Atividades mecânicas sem aprendizado

```typescript
// Candidaturas de emprego
export interface Application {
  id: string;
  company: string;
  position: string;
  status: "applied" | "interviewing" | "offer" | "rejected" | "accepted";
  appliedDate: string;
  salary?: string;
  notes?: string;
  contacts?: Contact[];
  interviews?: Interview[];
}

// Dashboard cards dinâmicos
// DashboardCardConfig (v1.2.4) - unified; legacy routinePeriod removed
export interface DashboardCardConfig {
  id: string;
  type:
    | "motivational"
    | "countdown"
    | "applications"
    | "finances"
    | "goals"
    | "routine" // aggregated incomplete Tasks
    | "time"; // weekly time tracking summary
  title: string;
  position: number;
  isVisible: boolean;
  data?: Record<string, unknown>;
  // ⚠️ NÃO tem routinePeriod - removido (legacy)
}
```

### 🚨 Regra Absoluta: Nunca Usar `any`

```typescript
// ❌ PROIBIDO
function processData(data: any) {
  return data.value;
}

// ✅ CORRETO
function processData(data: { value: string }) {
  return data.value;
}

// ✅ CORRETO (tipos genéricos)
function processData<T extends { value: string }>(data: T) {
  return data.value;
}

// ✅ CORRETO (unknown + type guard)
function processData(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: string }).value;
  }
  throw new Error("Invalid data");
}
```

---

## 💾 Sistema de Persistência

### Estratégia Database-First (NEW)

**🎯 Estado Atual**: Migração concluída para Vercel Postgres + Prisma + Auth0 (100%)

**Migrated for Database**:

- ✅ **Tasks** (`/tasks`) - CRUD completo com tRPC

  - Hook: `use-tasks-db.ts`
  - Router: `src/server/routers/task.ts`
  - Prisma Model: `Task`

- ✅ **Routines** (`/routines`) - Dual-model com checkmarks diários

  - Hook: `use-routines-db.ts`
  - Router: `src/server/routers/routine.ts`
  - Prisma Models: `RoutineItem`, `Checkmark`

- ✅ **Applications** (`/applications`) - Job tracking com Kanban

  - Hook: `use-applications-db.ts`
  - Router: `src/server/routers/application.ts`
  - Prisma Model: `JobApplication`

- ✅ **Goals** (`/goals`) - Goals management

  - Hook: `use-goals-db.ts`
  - Router: `src/server/routers/goal.ts`
  - Prisma Model: `Goal`

- ✅ **Journal** (`/journal`) - Daily reflections com upsert

  - Hook: `use-journal-db.ts`
  - Router: `src/server/routers/activity.ts` (journalRouter)
  - Prisma Model: `JournalEntry`

- ✅ **Dashboard Cards** (`/dashboard`) - Custom dashboard cards

  - Hook: `use-dashboard-db.ts`
  - Router: `src/server/routers/dashboard.ts` (dashboardRouter.cards)
  - Prisma Model: `DashboardCard`

- ✅ **Achievements & Rewards** (`/achievements`, `/rewards`) - Gamification system
  - Hooks: `use-achievements-db.ts`, `use-rewards-db.ts`, `use-reward-economy.ts`
  - Router: `src/server/routers/gamification.ts` (achievementRouter, rewardRouter, rewardStateRouter)
  - Prisma Models: `Achievement`, `Reward`, `RewardState`
  - Economy hooks: `grantRoutineGems()`, `grantTaskGems()`, `grantPomodoroGems()`
  - UI: Separate pages for achievements gallery and rewards shop

**Pendente de Migração** (ainda usando localStorage):

- ⏳ **Finances** (`/finances`) - BLOCKER: 1127-line child component
- ⏳ **Pomodoro** (`/pomodoro`) - Complex real-time timer state

### Arquitetura Backend

```
Component → tRPC Hook → API Route → tRPC Router → Prisma → Database
   ↓                                                            ↓
React Query Cache ←──────────────────────────────────────── Response
```

**Stack**:

- **Database**: Vercel Postgres (managed PostgreSQL)
- **ORM**: Prisma 6.19.0
- **API**: tRPC 10.45.2 (type-safe)
- **Cache**: React Query 4.36.1
- **Auth**: Auth0 (session subject mapped to `ctx.userId`)

### Environment Variables

**Arquivo**: `.env` (NÃO commitar - está no .gitignore)

```bash
# Vercel Postgres / Prisma Accelerate
STORAGE_PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
STORAGE_DATABASE_URL="postgres://..." # Direct connection for migrations
STORAGE_POSTGRES_URL="postgres://..." # Optional alternative

# Auth0
AUTH0_SECRET="..."
AUTH0_DOMAIN="wellsla.us.auth0.com"
AUTH0_CLIENT_ID="..."
AUTH0_CLIENT_SECRET="..."
APP_BASE_URL="http://localhost:9002"

# Gemini AI
GEMINI_API_KEY="..."
```

**Setup**: Ver `docs/EXTERNAL-SETUP.md` para instruções completas

### localStorage (LEGACY - Em Migração)

**⚠️ DEPRECATED**: Sistema antigo ainda usado por features não migradas

**Namespace**: `focus-flow:v1:` (todos os dados no localStorage)

**Arquivo**: `src/lib/storage.ts`

```typescript
// ✅ Usar storage.ts para todas as operações de persistência
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearAppStorage,
} from "@/lib/storage";

// Exemplo
const tasks = getStorageItem<Task[]>("tasks") ?? [];
setStorageItem("tasks", updatedTasks);
```

### Custom Hook: useLocalStorage (LEGACY)

**⚠️ DEPRECATED**: Use tRPC hooks para novas features

**Arquivo**: `src/hooks/use-local-storage.ts`

```typescript
import useLocalStorage from "@/hooks/use-local-storage";

function MyComponent() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);

  // React state + auto-sync com localStorage
  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  return <TaskList tasks={tasks} onAdd={addTask} />;
}
```

### ⚠️ Limites e Considerações

- **Quota**: ~5-10MB por domínio (varia por browser)
- **Síncrono**: Não bloquear UI com operações grandes
- **Serialização**: Apenas tipos JSON-serializáveis
- **Segurança**: Não armazenar dados sensíveis (tokens, senhas)

### Fluxo de Dados (NEW - Database)

```
User Action
    ↓
React Component
    ↓
tRPC Hook (useTasks, useCreateTask, etc.)
    ↓
tRPC Client → API Route (/api/trpc/[trpc])
    ↓
tRPC Router (src/server/routers/task.ts)
    ↓
Prisma ORM
    ↓
Vercel Postgres Database
    ↓
Response → React Query Cache
    ↓
Component Re-render (automatic)
```

### Fluxo de Dados (LEGACY - localStorage)

```
User Action
    ↓
React Component
    ↓
useState / useLocalStorage Hook
    ↓
storage.ts (setStorageItem)
    ↓
localStorage.setItem("focus-flow:v1:key", JSON.stringify(data))
    ↓
Custom Event Dispatch (local-storage)
    ↓
Outros Componentes Re-render (se subscribed)
```

---

## 🔄 Padrão de Migração localStorage → Database

### Migration Status

#### Completed ✅

- **Tasks** - Full CRUD with database
- **Routines** - Routines + Checkmarks with date-based queries
- **Applications** - Job applications with drag-and-drop Kanban
- **Goals** - Goals management with action steps
- **Journal** - Daily reflections with upsert pattern
- **Dashboard Cards** - Custom dashboard cards with JSON config
- **Achievements & Rewards** - Gamification system with gem economy
- **Pomodoro** - Sessions + settings with client-side timer state
- **Finances** - Financial accounts, logs, and income settings

**Current Progress**: 9/9 features (100%) migrated to database ✅ COMPLETE

### Pattern: Pomodoro (Migrado) ✅

**Complexidade**: Real-time timer state + database persistence for sessions/settings

**Strategy**: Keep timer state client-side (client-side timer ticks), persist completed/paused sessions to database

**Database Hooks** (`src/hooks/use-pomodoro-db.ts`):

```typescript
// Query all sessions with date normalization
export function usePomodoroSessions() {
  const query = trpc.pomodoro.sessions.getAll.useQuery();
  return {
    sessions: query.data?.map(s => ({
      ...s,
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt?.toISOString(),
    })) ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

// Create completed/paused session
export function useCreatePomodoroSession() {
  const utils = trpc.useUtils();
  return trpc.pomodoro.sessions.create.useMutation({
    onSuccess: () => utils.pomodoro.sessions.getAll.invalidate(),
  });
}

// Update session (productivity validation)
export function useUpdatePomodoroSession() {
  const utils = trpc.useUtils();
  return trpc.pomodoro.sessions.update.useMutation({
    onSuccess: () => utils.pomodoro.sessions.getAll.invalidate(),
  });
}

// Query settings with defaults
export function usePomodoroSettings() {
  const query = trpc.pomodoro.settings.get.useQuery();
  const defaultSettings = { workMin: 25, breakMin: 5, ... };
  return {
    settings: query.data ?? defaultSettings,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

// Upsert settings
export function useUpsertPomodoroSettings() {
  const utils = trpc.useUtils();
  return trpc.pomodoro.settings.upsert.useMutation({
    onSuccess: () => {
      utils.pomodoro.settings.get.invalidate();
      toast({ title: "Settings saved" });
    },
  });
}
```

**Timer Hook** (`src/hooks/use-pomodoro-timer.ts`):

```typescript
export function usePomodoroTimer() {
  const { settings } = usePomodoroSettings();
  const createSession = useCreatePomodoroSession();
  const updateSession = useUpdatePomodoroSession();

  // Client-side timer state (not in DB)
  const [timerState, setTimerState] = useState<PomodoroTimerState>(...);

  const handleCompletion = () => {
    // Persist completed session to DB
    if (sessionId) {
      createSession.mutate({
        id: sessionId,
        startedAt: state.startedAt,
        endedAt: new Date().toISOString(),
        kind: "work",
        completed: true,
        category: state.category,
      });
    }
    // ... transition to next state
  };

  const validateProductivity = (wasTrulyProductive: boolean) => {
    // Update session in DB
    updateSession.mutate({ id: sessionId, wasTrulyProductive });
  };

  return { state, remainingSeconds, start, pause, validateProductivity };
}
```

**Key Decisions**:

- Timer state stays client-side (localStorage + in-memory) for real-time updates
- Only completed/paused sessions are persisted to database
- Settings are fetched from DB on mount, cached by React Query
- Analytics components query sessions from database
- Optimistic updates for settings using queryClient.setQueryData

**Migrated Files**:

- `src/hooks/use-pomodoro-db.ts` (NEW) - 5 database hooks
- `src/hooks/use-pomodoro-timer.ts` - Refactored to use DB hooks
- `src/app/(features)/settings/page.tsx` - Settings management with DB
- `src/features/pomodoro/pomodoro-time-distribution.tsx` - Analytics with DB
- `src/app/(features)/pomodoro/page.tsx` - Main page with DB sessions

### Pattern: Finances (Migrado) ✅

**Complexidade**: Multi-model with accounts, logs, and settings + large component refactoring

**Strategy**: Create complete database hooks, refactor 1127-line component to use async mutations

**Database Hooks** (`src/hooks/use-finances-db.ts`):

```typescript
// Query financial accounts with date normalization
export function useFinancialAccounts() {
  const query = trpc.finance.accounts.getAll.useQuery();
  return {
    accounts: (query.data ?? []).map((account) => ({
      ...account,
      date: account.date?.toISOString(),
      lastPaid: account.lastPaid?.toISOString(),
    })) as FinancialAccount[],
    isLoading: query.isLoading,
  };
}

// CRUD operations for accounts
export function useCreateFinancialAccount() {
  /* ... */
}
export function useUpdateFinancialAccount() {
  /* ... */
}
export function useDeleteFinancialAccount() {
  /* ... */
}

// Financial logs
export function useFinancialLogs() {
  /* ... */
}
export function useCreateFinancialLog() {
  /* ... */
}

// Income settings with defaults
export function useIncomeSettings() {
  const query = trpc.finance.incomeSettings.get.useQuery();
  const defaultSettings = {
    status: "Unemployed",
    amount: 0,
    frequency: "monthly",
    currency: "R$",
  };
  return {
    settings: query.data
      ? {
          ...query.data,
          benefitsEndDate: query.data.benefitsEndDate?.toISOString(),
        }
      : defaultSettings,
    isLoading: query.isLoading,
  };
}

export function useUpsertIncomeSettings() {
  /* ... */
}
```

**Component Refactoring** (`src/features/finances/financials.tsx`):

```typescript
export function Financials({
  incomeSettings,
  financialAccounts,
}: FinancialsProps) {
  // Database mutation hooks
  const createAccount = useCreateFinancialAccount();
  const updateAccount = useUpdateFinancialAccount();
  const deleteAccount = useDeleteFinancialAccount();
  const upsertIncomeSettings = useUpsertIncomeSettings();

  // Replace synchronous handlers with async mutations
  async function handleFinancialItemFormSubmit(item: FinancialAccount) {
    const exists = financialAccounts.some((acc) => acc.id === item.id);

    if (exists) {
      await updateAccount.mutateAsync(item);
    } else {
      await createAccount.mutateAsync(item);
    }

    setIsFinancialItemFormOpen(false);
  }

  async function handleDelete(id: string) {
    await deleteAccount.mutateAsync({ id });
  }

  async function togglePaidStatus(item: FinancialAccount, isPaid: boolean) {
    const updatedItem = {
      ...item,
      lastPaid: isPaid ? format(new Date(), "yyyy-MM-dd") : undefined,
    };
    await updateAccount.mutateAsync(updatedItem);
  }
}
```

**Key Decisions**:

- Removed `onDataUpdate` callback pattern in favor of direct mutations
- All handlers converted to async/await pattern
- Toast notifications handled by mutation hooks
- Error handling with try/catch blocks
- Financial logs creation triggered by useEffect with change detection
- Dashboard cards integration already migrated (use-dashboard-db.ts)

**Migrated Files**:

- `src/hooks/use-finances-db.ts` (NEW) - 8 database hooks (187 lines)
- `src/features/finances/financials.tsx` - Refactored to use DB mutations
- `src/app/(features)/finances/page.tsx` - Updated to use DB hooks

### Pattern: Tasks (Migrado) ✅

**Antes (localStorage)**:

```typescript
// src/hooks/use-tasks.ts (DELETADO)
export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);

  const addTask = (task: Omit<Task, "id">) => {
    const newTask = { ...task, id: `task-${Date.now()}` };
    setTasks([...tasks, newTask]);
  };

  return { tasks, addTask, updateTask, deleteTask };
}
```

**Depois (Database)**:

```typescript
// src/hooks/use-tasks-db.ts (NOVO)
export function useTasks() {
  const query = trpc.task.getAll.useQuery();
  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
  };
}

export function useCreateTask() {
  const utils = trpc.useUtils();
  return trpc.task.create.useMutation({
    onSuccess: () => utils.task.getAll.invalidate(),
  });
}
```

**Componente**:

```typescript
// ANTES
const { tasks, addTask } = useTasks();

// DEPOIS
const { tasks, isLoading } = useTasks();
const createTask = useCreateTask();

// Async mutation
await createTask.mutateAsync({ title: "New task", ... });
```

### Pattern: Routines (Migrado) ✅

**Complexidade**: Dual-model (RoutineItem + Checkmark) com date-based queries

**Antes (localStorage)**:

```typescript
// src/hooks/use-routines.ts (DELETADO)
export function useRoutines() {
  const [routines, setRoutines] = useLocalStorageState<RoutineItem[]>(
    "routines",
    []
  );
  return { routines, setRoutines };
}

export function useTodayCheckmarks() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [checkmarks, setCheckmarks] = useState<Checkmark[]>([]);

  useEffect(() => {
    const checks = loadChecks(today); // Custom storage function
    setCheckmarks(checks);
  }, [today]);

  return { checkmarks, toggleCheck };
}
```

**Depois (Database)**:

```typescript
// src/hooks/use-routines-db.ts (NOVO)
export function useRoutines() {
  const query = trpc.routine.getAll.useQuery();
  return {
    routines:
      query.data?.map((r) => ({
        ...r,
        category: r.category as RoutineCategory, // Type casting
        frequency: r.frequency as Frequency,
      })) ?? [],
    isLoading: query.isLoading,
  };
}

export function useTodayCheckmarks() {
  const today = new Date().toISOString().split("T")[0];
  const query = trpc.routine.getCheckmarks.useQuery({ dateISO: today });
  return {
    checkmarks: query.data ?? [],
    isLoading: query.isLoading,
  };
}

export function useToggleCheckmark() {
  const utils = trpc.useUtils();
  return trpc.routine.toggleCheckmark.useMutation({
    onSuccess: () => {
      utils.routine.getCheckmarks.invalidate();
      toast({ title: "Routine completed! 🎉" });
    },
  });
}

// Convenience hook combining both
export function useRoutinesWithChecks() {
  const { routines, isLoading: routinesLoading } = useRoutines();
  const { checkmarks, isLoading: checkmarksLoading } = useTodayCheckmarks();
  const toggleCheckmark = useToggleCheckmark();

  const toggleCheck = async (
    routineId: string,
    checked: boolean,
    reflection?: any
  ) => {
    const today = new Date().toISOString().split("T")[0];
    await toggleCheckmark.mutateAsync({
      routineId,
      dateISO: today,
      done: checked,
      reflection,
    });
  };

  return {
    routines,
    checkmarks,
    isLoading: routinesLoading || checkmarksLoading,
    toggleCheck,
  };
}
```

**Router (dual-model)**:

```typescript
// src/server/routers/routine.ts
export const routineRouter = router({
  // RoutineItem CRUD
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.routineItem.findMany({
      where: { userId: ctx.userId },
      include: { checkmarks: true },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        category: z.string(),
        frequency: z.enum(["daily", "weekly", "monthly", "every3days"]),
        // ...
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.routineItem.create({
        data: { ...input, userId: ctx.userId! },
      });
    }),

  // Checkmark operations (date-based)
  getCheckmarks: protectedProcedure
    .input(
      z.object({
        routineId: z.string().optional(),
        dateISO: z.string().optional(), // YYYY-MM-DD
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.checkmark.findMany({
        where: {
          userId: ctx.userId!,
          ...(input.routineId && { routineId: input.routineId }),
          ...(input.dateISO && { dateISO: input.dateISO }),
        },
      });
    }),

  toggleCheckmark: protectedProcedure
    .input(
      z.object({
        routineId: z.string(),
        dateISO: z.string(),
        done: z.boolean(),
        reflection: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.checkmark.upsert({
        where: {
          routineId_dateISO: {
            routineId: input.routineId,
            dateISO: input.dateISO,
          },
        },
        create: {
          userId: ctx.userId!,
          routineId: input.routineId,
          dateISO: input.dateISO,
          done: input.done,
          reflection: input.reflection,
        },
        update: {
          done: input.done,
          reflection: input.reflection,
        },
      });
    }),
});
```

**Componente**:

```typescript
// ANTES
const { routines, setRoutines, checkmarks, toggleCheck } =
  useRoutinesWithChecks();

// Synchronous operation
toggleCheck(routineId, true);

// DEPOIS
const {
  routines,
  checkmarks,
  toggleCheck,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  isLoading,
} = useRoutinesWithChecks();

// Async mutation with loading state
if (isLoading) return <div>Loading...</div>;

await toggleCheck(routineId, true, reflection); // Now async
```

**Key Differences from Tasks**:

- Dual-model structure (RoutineItem templates + Checkmark completions)
- Date-based filtering (today's checkmarks only)
- Upsert pattern (toggle creates or updates)
- Type casting needed for Prisma string enums
- Optional reflection data (Json field)

### Pattern: Applications (Migrado) ✅

**Complexidade**: Drag-and-drop with optimistic updates

**Antes (localStorage)**:

```typescript
// src/app/(features)/applications/page.tsx
const [applications, setApplications] = useLocalStorage<JobApplication[]>(
  "jobApplications",
  []
);

// KanbanColumn.tsx - Drag-and-drop
const handleDrop = (e: DragEvent, newStatus: ApplicationStatus) => {
  const applicationId = e.dataTransfer.getData("applicationId");
  setApplications((prev) =>
    prev.map((app) =>
      app.id === applicationId ? { ...app, status: newStatus } : app
    )
  );
};
```

**Depois (Database)**:

```typescript
// src/hooks/use-applications-db.ts
export function useApplications() {
  const query = trpc.application.getAll.useQuery();
  return {
    applications:
      query.data?.map((app) => ({
        ...app,
        dateApplied: app.dateApplied?.toISOString().split("T")[0],
      })) ?? [],
    isLoading: query.isLoading,
  };
}

export function useUpdateApplication() {
  const utils = trpc.useUtils();
  return trpc.application.update.useMutation({
    onSuccess: () => {
      utils.application.getAll.invalidate();
      toast({ title: "Application updated" });
    },
  });
}
```

**Componente com Async Drag-and-Drop**:

```typescript
// KanbanColumn.tsx
const updateApplication = useUpdateApplication();

const handleDrop = async (e: DragEvent, newStatus: ApplicationStatus) => {
  e.preventDefault();
  const applicationId = e.dataTransfer.getData("applicationId");
  const application = applications.find((app) => app.id === applicationId);

  if (application && application.status !== newStatus) {
    try {
      await updateApplication.mutateAsync({
        id: applicationId,
        status: newStatus,
      });
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  }
};
```

**Key Differences**:

- Drag-and-drop requires async mutations
- Optimistic UI updates handled by React Query cache
- JSON fields (comments, deepWorkflow) need type casting
- Date conversion for dateApplied field
- Error handling for drag-and-drop failures

### Pattern: Dashboard Cards (Migrado) ✅

**Complexidade**: Simple CRUD with JSON config field

**Antes (localStorage)**:

```typescript
// src/app/(features)/dashboard/page.tsx
const [dashboardCards, setDashboardCards] = useLocalStorage<DashboardCard[]>(
  "dashboardCards",
  initialDashboardCards
);

// Synchronous CRUD
function handleCardSubmit(cardData: Omit<DashboardCard, "id" | "value">) {
  if (selectedCard) {
    setDashboardCards((prev) =>
      prev.map((c) => (c.id === selectedCard.id ? fullCardData : c))
    );
  } else {
    setDashboardCards((prev) => [...prev, fullCardData]);
  }
}
```

**Depois (Database)**:

```typescript
// src/hooks/use-dashboard-db.ts
export function useDashboardCards() {
  const query = trpc.dashboard.cards.getAll.useQuery();
  return {
    cards: (query.data ?? []).map((card: any) => ({
      ...card,
      config: card.config as any,
    })) as DashboardCard[],
    isLoading: query.isLoading,
  };
}

export function useUpdateDashboardCard() {
  const utils = trpc.useUtils();
  return trpc.dashboard.cards.update.useMutation({
    onSuccess: () => {
      utils.dashboard.cards.getAll.invalidate();
    },
  });
}
```

**Componente**:

```typescript
// ANTES
const [dashboardCards, setDashboardCards] = useLocalStorage<DashboardCard[]>(
  "dashboardCards",
  []
);

// Synchronous
function handleCardSubmit(cardData: Omit<DashboardCard, "id" | "value">) {
  setDashboardCards((prev) => [...prev, fullCardData]);
}

// DEPOIS
const { cards: dashboardCards, isLoading } = useDashboardCards();
const createCard = useCreateDashboardCard();
const updateCard = useUpdateDashboardCard();
const deleteCard = useDeleteDashboardCard();

// Async with loading states
async function handleCardSubmit(cardData: Omit<DashboardCard, "id" | "value">) {
  if (selectedCard) {
    await updateCard.mutateAsync({
      id: selectedCard.id,
      ...cardData,
      position: dashboardCards.findIndex((c) => c.id === selectedCard.id),
    });
  } else {
    await createCard.mutateAsync({
      ...cardData,
      position: dashboardCards.length,
    });
  }
}
```

**Key Features**:

- JSON config field stores DashboardCardConfig
- Position-based ordering with reorder mutation
- Simple CRUD pattern with toast notifications
- Router already had complete nested structure (dashboardRouter.cards)
- No complex child components (unlike Finances)

### Checklist para Migração de Features

1. ✅ **Criar tRPC Router** (`src/server/routers/[feature].ts`)

   - Definir procedures: getAll, getById, create, update, delete
   - Usar Zod para validação de inputs

- Usar `ctx.userId` (via Auth0) em todas as queries/mutations protegidas

2. ✅ **Criar Hooks tRPC** (`src/hooks/use-[feature]-db.ts`)

   - `useFeaturesQuery` - para leitura
   - `useCreateFeature` - para criação
   - `useUpdateFeature` - para atualização
   - `useDeleteFeature` - para deleção
   - Adicionar invalidação de cache no `onSuccess`
   - Adicionar toast notifications

3. ✅ **Atualizar Componentes**

   - Trocar hooks localStorage por hooks tRPC
   - Adicionar `isLoading` states
   - Converter operações síncronas em `async/await`
   - Adicionar error handling com try/catch

4. ✅ **Deletar Código Legacy**

   - Remover hook `use-[feature].ts` antigo
   - Limpar imports não utilizados
   - Atualizar testes (se existirem)

5. ✅ **Testar**
   - CRUD completo no Prisma Studio
   - Validações de formulário
   - Estados de loading
   - Error handling
   - Cache invalidation

---

## 🏛️ Princípios de Desenvolvimento

### 1. SOLID Principles

#### Single Responsibility (S)

**✅ CORRETO**: Cada componente/função tem uma responsabilidade

```typescript
// TaskForm.tsx - apenas formulário
export function TaskForm({ onSubmit }: TaskFormProps) {
  // Lógica de formulário
}

// TaskList.tsx - apenas lista
export function TaskList({ tasks, onToggle }: TaskListProps) {
  // Lógica de lista
}

// page.tsx - orquestra os dois
export default function TasksPage() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);

  return (
    <>
      <TaskForm onSubmit={handleAdd} />
      <TaskList tasks={tasks} onToggle={handleToggle} />
    </>
  );
}
```

#### Open/Closed (O)

**✅ CORRETO**: Aberto para extensão, fechado para modificação

```typescript
// Base genérica
interface Card {
  id: string;
  type: string;
  render: () => JSX.Element;
}

// Extensão sem modificar base
interface MotivationalCard extends Card {
  type: "motivational";
  phrase: string;
}
```

#### Liskov Substitution (L)

**✅ CORRETO**: Subtipos devem ser substituíveis

```typescript
interface Storage {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): boolean;
}

class LocalStorage implements Storage {
  /* implementação */
}
class SessionStorage implements Storage {
  /* implementação */
}

// Ambos podem substituir Storage
```

#### Interface Segregation (I)

**✅ CORRETO**: Interfaces específicas, não genéricas

```typescript
// ❌ Interface gorda
interface TaskOperations {
  create(): void;
  read(): void;
  update(): void;
  delete(): void;
  export(): void;
  import(): void;
}

// ✅ Interfaces segregadas
interface TaskReader {
  read(): void;
}
interface TaskWriter {
  create(): void;
  update(): void;
  delete(): void;
}
interface TaskExporter {
  export(): void;
  import(): void;
}
```

#### Dependency Inversion (D)

**✅ CORRETO**: Depender de abstrações, não implementações

```typescript
// ❌ Depende de implementação concreta
function saveTask(task: Task) {
  localStorage.setItem("task", JSON.stringify(task));
}

// ✅ Depende de abstração
interface Storage {
  setItem(key: string, value: string): void;
}

function saveTask(task: Task, storage: Storage) {
  storage.setItem("task", JSON.stringify(task));
}
```

### 2. DRY (Don't Repeat Yourself)

**✅ CORRETO**: Extrair lógica repetida

```typescript
// ❌ Repetição
function getTasksFromStorage() {
  const data = localStorage.getItem("focus-flow:v1:tasks");
  return data ? JSON.parse(data) : [];
}

function getRoutinesFromStorage() {
  const data = localStorage.getItem("focus-flow:v1:routines");
  return data ? JSON.parse(data) : [];
}

// ✅ DRY
function getStorageItem<T>(key: string): T | null {
  const data = localStorage.getItem(`focus-flow:v1:${key}`);
  return data ? JSON.parse(data) : null;
}

const tasks = getStorageItem<Task[]>("tasks") ?? [];
const routines = getStorageItem<RoutineItem[]>("routines") ?? [];
```

### 3. KISS (Keep It Simple, Stupid)

**✅ CORRETO**: Solução mais simples que funciona

```typescript
// ❌ Over-engineering
class TaskRepository {
  private cache: Map<string, Task>;
  private observers: Set<Observer>;

  constructor(private storage: IStorage) {
    this.cache = new Map();
    this.observers = new Set();
  }

  async findById(id: string): Promise<Task | null> {
    if (this.cache.has(id)) return this.cache.get(id)!;
    const task = await this.storage.get<Task>(id);
    if (task) this.cache.set(id, task);
    return task;
  }
}

// ✅ KISS
function getTask(id: string): Task | null {
  const tasks = getStorageItem<Task[]>("tasks") ?? [];
  return tasks.find((t) => t.id === id) ?? null;
}
```

---

## ⚛️ React Best Practices

### 1. Component Structure

```typescript
"use client"; // Se necessário

import { useState, useEffect } from "react"; // Direto do React
import useLocalStorage from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";

interface MyComponentProps {
  initialData?: Task[];
  onComplete?: (task: Task) => void;
}

export function MyComponent({
  initialData = [],
  onComplete,
}: MyComponentProps) {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", initialData);

  useEffect(() => {
    // Side effects
  }, [tasks]);

  const handleClick = () => {
    // Event handlers
  };

  return <div className="space-y-4">{/* JSX */}</div>;
}
```

### 2. Evitar Re-renders Desnecessários

#### ⚠️ Problema Comum: form.watch() no useEffect

```typescript
// ❌ CAUSA RE-RENDER INFINITO
useEffect(() => {
  const values = form.watch();
  console.log(values);
}, [form]); // form muda a cada render

// ✅ SOLUÇÃO 1: Remover form das dependências
useEffect(() => {
  const values = form.watch();
  console.log(values);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Executar apenas no mount

// ✅ SOLUÇÃO 2: Usar react-hook-form subscription
useEffect(() => {
  const subscription = form.watch((values) => {
    console.log(values);
  });
  return () => subscription.unsubscribe();
}, [form]);
```

#### ⚠️ React Compiler Warnings

```typescript
// ⚠️ React Compiler não consegue memoizar form.watch()
"use no memo"; // Adicionar no topo do componente se necessário

// Preferir useWatch em vez de form.watch() para compatibilidade
import { useForm, useWatch } from "react-hook-form";

export function FinancialsForm() {
  const form = useForm<FinancialData>({
    /* config */
  });
  const type = useWatch({ control: form.control, name: "type" });
  // ... restante do formulário
  return <Form {...form}>{/* fields */}</Form>;
}
```

### 3. Custom Hooks Best Practices

```typescript
// ✅ Naming: sempre começar com "use"
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Hook implementation
}

// ✅ Return tuple para actions
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [...prev, task]);
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, addTask, removeTask }; // Objeto para clarity
}

// ✅ Cleanup em useEffect
useEffect(() => {
  const interval = setInterval(() => {
    // Lógica
  }, 1000);

  return () => clearInterval(interval); // Sempre limpar
}, []);
```

### 4. Server vs Client Components

```typescript
// ✅ Server Component (default no App Router)
export default function Page() {
  // Pode fazer fetch de dados no servidor
  // Não pode usar hooks (useState, useEffect)
  return <div>Static content</div>;
}

// ✅ Client Component (precisa de interatividade)
("use client");

export default function InteractivePage() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 5. Dialog State Management (Reflection Pattern)

**Problema**: Dialog fecha mas estado do checkbox não atualiza

**Causa**: Estado não propagado corretamente após dialog fechar

```typescript
// ❌ ERRADO: Dialog fecha mas não atualiza parent
const handleReflectionComplete = (reflection: RoutineReflection) => {
  onToggleCheck(selectedRoutine.id, true, reflection);
  setSelectedRoutine(null);
  // ❌ Dialog fecha automaticamente, mas estado pode não ter sincronizado
};

// ✅ CORRETO: Garantir fechamento explícito
const handleReflectionComplete = (reflection: RoutineReflection) => {
  if (selectedRoutine) {
    onToggleCheck(selectedRoutine.id, true, reflection);
    setSelectedRoutine(null);
    setReflectionDialogOpen(false); // ✅ Fechar explicitamente
  }
};
```

**Optional Reflection Pattern** (v1.0.2+):

Rotinas podem ter reflexão **opcional** usando `requiresReflection`:

```typescript
// ✅ PATTERN: Conditional reflection based on routine type
const handleCheckboxChange = (routine: RoutineItem, checked: boolean) => {
  if (checked) {
    if (routine.requiresReflection) {
      // Show dialog for important routines
      setSelectedRoutine(routine);
      setReflectionDialogOpen(true);
    } else {
      // Complete immediately for simple tasks
      onToggleCheck(routine.id, true);
    }
  } else {
    onToggleCheck(routine.id, false);
  }
};
```

**Toggle Behavior** (v1.1.0+):

Rotinas funcionam como **toggle completo** - não desaparecem ao serem completadas:

```typescript
// ✅ CORRETO: Show all active routines (toggle functionality)
const activeRoutines = routines
  .filter((r) => r.active)
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// ❌ ERRADO: Filter out completed routines (makes them disappear)
const activeRoutines = routines
  .filter((r) => r.active)
  .filter((r) => {
    const todayCheckmark = getTodayCheckmark(r.id, checkmarks);
    return !todayCheckmark || !todayCheckmark.done; // ❌ Remove completed
  });
```

**UX Behavior**:

- ✅ Usuário pode marcar/desmarcar rotinas livremente
- ✅ Rotinas completadas permanecem visíveis na lista
- ✅ Estado visual claro (line-through, opacity) para completadas
- ✅ Permite correção se marcar errado
- ❌ Rotinas NÃO desaparecem ao serem completadas

**Quando ativar requiresReflection**:

- ✅ Study sessions (deep learning)
- ✅ Coding sessions (intentional practice)
- ✅ Job search activities (track effectiveness)
- ✅ Financial reviews (conscious decisions)
- ❌ Simple tasks (make bed, water plants)
- ❌ Mechanical routines (no learning involved)

**Best Practice para Dialog Forms**:

```typescript
const handleSubmit = async (data: FormData) => {
  setIsSubmitting(true);

  try {
    // 1. Process data
    const result = processData(data);

    // 2. Call completion handler
    onComplete(result);

    // 3. Reset form for next use
    form.reset();

    // 4. Close dialog
    onOpenChange(false);
  } catch (error) {
    // Handle error
  } finally {
    // 5. Always reset submitting state
    setIsSubmitting(false);
  }
};
```

---

## 🎨 Layout & Navigation Patterns

### Sidebar/Header Pattern (ShadCN Standard)

**Estrutura Recomendada**:

```
┌─────────────────────────────────────────────────┐
│ Header (h-14 lg:h-[60px])                      │
│ ┌─────┬──────────┬────────────────────┬──────┐│
│ │Menu │  Logo    │  Content Area      │Avatar││
│ │Btn  │          │                    │      ││
│ └─────┴──────────┴────────────────────┴──────┘│
├─────────┬───────────────────────────────────────┤
│         │                                       │
│ Sidebar │           Main Content                │
│         │                                       │
│  Nav    │                                       │
│ Items   │                                       │
│         │                                       │
└─────────┴───────────────────────────────────────┘
```

**Implementação (FeaturesShell.tsx)**:

```typescript
// ✅ CORRETO: Toggle no header, não no sidebar
<header className="flex h-14 items-center gap-4 border-b bg-card px-4">
  {/* Mobile menu (Sheet) */}
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>
    </SheetTrigger>
    <SheetContent side="left">{sidebarContent}</SheetContent>
  </Sheet>

  {/* Desktop sidebar toggle */}
  <Button
    variant="ghost"
    size="icon"
    className="hidden md:flex"
    onClick={() => setIsCollapsed(!isCollapsed)}
  >
    <Menu className="h-5 w-5" />
  </Button>

  {/* Header content */}
  <div className="flex-1">...</div>
</header>;

// ❌ ERRADO: Toggle dentro do sidebar
<div className="sidebar">
  <nav>...</nav>
  <div className="mt-auto">
    {" "}
    {/* ❌ Não colocar toggle aqui */}
    <Button onClick={() => setIsCollapsed(!isCollapsed)}>Toggle</Button>
  </div>
</div>;
```

**Grid Layout com Sidebar Colapsável**:

```typescript
// ✅ Usar grid com transição suave
<div
  className={cn(
    "grid min-h-screen w-full transition-[grid-template-columns] duration-300",
    isCollapsed ? "md:grid-cols-[80px_1fr]" : "md:grid-cols-[280px_1fr]"
  )}
>
  {/* Sidebar */}
  <div className="hidden md:block border-r bg-card">...</div>

  {/* Main area */}
  <div className="flex flex-col">
    <header>...</header>
    <main>...</main>
  </div>
</div>
```

**Regras de Navegação**:

1. ✅ Toggle sempre no header (desktop) ou Sheet (mobile)
2. ✅ Usar `TooltipProvider` para labels quando colapsado
3. ✅ Persistir estado colapsado no localStorage
4. ✅ Transição suave com `transition-[grid-template-columns]`
5. ✅ Mobile: Sheet com trigger no header
6. ❌ Nunca colocar toggle no rodapé do sidebar
7. ❌ Nunca usar position: fixed para sidebar (usar grid)

---

## 🔍 Integração Entre Features

### Checklist de Integração

Ao criar ou modificar uma feature, SEMPRE verificar:

- [ ] **Dashboard**: Feature aparece no dashboard? Precisa de card?
- [ ] **Navigation**: Adicionado ao menu lateral? Agrupamento correto?
- [ ] **Home**: Precisa de link/preview na página inicial?
- [ ] **Settings**: Tem configurações? Adicionar em `/settings`
- [ ] **Performance**: Gera métricas? Integrar com `/performance`
- [ ] **Data Logger**: Ações importantes logadas com `useDataLogger`?
- [ ] **Local Storage**: Dados persistidos com namespace correto?
- [ ] **Types**: Tipos exportados de `types.ts` ou arquivo dedicado?
- [ ] **Mobile**: Layout responsivo testado?
- [ ] **Accessibility**: Teclado funcional? Screen reader friendly?
- [ ] **English-Only**: TODO conteúdo visível ao usuário está em inglês?

### Integração: Rewards & Achievements (v1.2.0)

- [x] Routines → conceder gemas ao completar (5g normal, 10g com reflexão)
- [x] Tasks → conceder gemas ao concluir (2g low, 5g medium, 10g high)
- [x] Pomodoro → conceder gemas ao finalizar sessão produtiva (3g)
- [x] Navegação → separar `/achievements` (lifetime) e `/rewards` (condicional/comprável)
- [x] Header → exibir saldo de gemas (`GemBalance`)
- [x] Reset automático → rewards diários/semanais/mensais reiniciam progresso
- [ ] Notificações → toast ao desbloquear achievement (próximo passo)
- [ ] Migração → mapear badges/points antigos para novo sistema (próximo passo)

### Integração: Saída de I.A. em Markdown (v1.2.1+)

Todas as I.A.s das features DEVEM retornar texto com formatação Markdown. A UI deve exibir a resposta em uma modal dedicada com renderização Markdown, permitindo seleção e um botão de copiar-tudo.

Padrão implementado:

- Componente: `src/features/shared/MarkdownModal.tsx`

  - Props: `open`, `onOpenChange`, `title?`, `description?`, `content`
  - Renderização: `react-markdown` + `remark-gfm` (sem HTML bruto)
  - Ações: botão de cópia (clipboard) no header
  - Acessível: conteúdo selecionável, rolagem interna, atalho de fechar padrão do Dialog

- Dependências:
  - `react-markdown`
  - `remark-gfm`

Como usar (exemplo):

```tsx
// 1) Estado local na feature
const [aiResult, setAiResult] = useState<string | null>(null);
const [aiModalOpen, setAiModalOpen] = useState(false);

// 2) Após obter a resposta da IA
setAiResult(markdownText);
setAiModalOpen(true); // abre modal automaticamente

// 3) Renderizar a modal
<MarkdownModal
  open={aiModalOpen && !!aiResult}
  onOpenChange={setAiModalOpen}
  title="AI Assistant Result"
  description="Formatted Markdown output"
  content={aiResult || ""}
/>;
```

---

## 🧠 Feedback Centralizado (Novo)

Rota: `/feedback`

Objetivo: substituir e unificar todos os antigos “View History” espalhados pelas features.

Funcionalidades:

- Filtros: intervalo de datas + tipos (applications, goals, tasks, pomodoro, timeTracking, finance, journal)
- Tabela consolidada ordenada por data (desc)
- Exportação XLSX dos registros filtrados (lib: `xlsx`)
- Geração de feedback em Markdown via Genkit + Gemini, com persona “cética e filosófica (chefe sábio)”
  - Seções obrigatórias: “Visão Geral”, “Sinais Positivos”, “Alertas / Riscos”, “Recomendações Prioritárias (Top 5)”, “Métricas e Padrões”, “Perguntas para Reflexão”
  - Linguagem: pt-BR por padrão; usar inglês apenas quando explicitamente necessário
  - Regras: sem promessas, sem emojis, sem números fantasiosos (usar (~aprox) quando estimar)

Arquitetura:

- Router: `src/server/routers/feedback.ts`
  - `getRecords(filters)`: agrega registros por usuário (Auth0 `ctx.userId`) de múltiplos modelos (applications, goals, tasks, pomodoro, timeTracking, finance, journal)
  - `generate({ filters, focusIds? })`: gera markdown a partir dos registros filtrados, com opção de limitar por IDs
- Hooks: `src/hooks/use-feedback.ts`
- Página: `src/app/(features)/feedback/page.tsx`
- Flow AI: `src/ai/flows/feedback-insights.ts`

Notas de migração:

- “View History” foi removido das páginas de Applications, Goals, Routine, Dashboard e Finances.
- O componente genérico `src/features/history-dialog.tsx` foi descontinuado e não deve ser referenciado; a visualização agora é centralizada em `/feedback`.

Extensão futura:

- Adicionar filtros por palavra-chave e por status específicos de cada tipo
- Exportação CSV/JSON além de XLSX
- Botão “Copiar Markdown” no modal (usar `MarkdownModal` compartilhado)

Regras:

- ✅ Sempre abrir a modal automaticamente quando a IA retornar conteúdo
- ✅ Manter um botão secundário (quando fizer sentido) para reabrir a modal
- ✅ O botão de copiar deve copiar TODO o markdown puro (não HTML)
- ✅ Todo texto visível ao usuário em inglês
- ❌ Não renderizar HTML bruto vindo da IA (XSS)

### Exemplo: Integração da Feature "Tasks"

**1. Criar tipos** (`src/lib/types.ts`)

```typescript
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  // ...
}
```

**2. Criar página** (`src/app/(features)/tasks/page.tsx`)

```typescript
export default function TasksPage() {
  // Implementação
}
```

**3. Criar componentes** (`src/features/tasks/`)

```typescript
// TaskForm.tsx
// TaskList.tsx
```

**4. Adicionar ao menu** (`src/app/(features)/layout.tsx`)

```typescript
const navigationItems = [
  // ...
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
];
```

**5. Integrar ao Dashboard** (se necessário)

```typescript
// src/app/(features)/dashboard/page.tsx
import { RecentTasks } from "@/features/tasks/recent-tasks";

export default function Dashboard() {
  return (
    <div>
      {/* outros cards */}
      <RecentTasks />
    </div>
  );
}
```

**6. Adicionar logging**

```typescript
import { useDataLogger } from "@/hooks/use-data-logger";

export function TaskForm() {
  const { logAction } = useDataLogger();

  const handleSubmit = (task: Task) => {
    // Salvar task
    logAction("task_created", { taskId: task.id, title: task.title });
  };
}
```

---

## 🎯 Telas Padrão (Patterns)

### Home Page (`/home`)

**Propósito**: Ponto de entrada, overview rápido

**Estrutura**:

```typescript
export default function HomePage() {
  return (
    <div className="space-y-8">
      <MotivationalHeader /> {/* Frase do dia */}
      <QuickStats /> {/* Métricas principais */}
      <QuickActions /> {/* CTAs para features principais */}
      <RecentActivity /> {/* Últimas ações */}
    </div>
  );
}
```

**Princípios**:

- ✅ Máximo 4 CTAs principais
- ✅ Métricas visuais (números grandes, cores semânticas)
- ✅ Links rápidos para features mais usadas

### Dashboard Page (`/dashboard`)

**Propósito**: Dashboard personalizável com cards dinâmicos

**Estrutura**:

```typescript
export default function DashboardPage() {
  const [cards, setCards] = useLocalStorage<DashboardCardConfig[]>(
    "dashboard-cards",
    defaultCards
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards
        .filter((c) => c.isVisible)
        .sort((a, b) => a.position - b.position)
        .map((card) => (
          <DynamicDashboardCard key={card.id} config={card} />
        ))}
    </div>
  );
}
```

**Princípios**:

- ✅ Cards reordenáveis (drag-and-drop futuro)
- ✅ Cards podem ser ocultados
- ✅ Cada card é independente (não compartilha estado)
- ✅ Loading states para cards assíncronos

### Settings Page (`/settings`)

**Propósito**: Configurações da aplicação

**Estrutura**:

```typescript
export default function SettingsPage() {
  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">Geral</TabsTrigger>
        <TabsTrigger value="appearance">Aparência</TabsTrigger>
        <TabsTrigger value="notifications">Notificações</TabsTrigger>
        <TabsTrigger value="data">Dados</TabsTrigger>
      </TabsList>

      <TabsContent value="general">{/* Configurações gerais */}</TabsContent>
      <TabsContent value="appearance">{/* Tema, cores */}</TabsContent>
      <TabsContent value="notifications">{/* Preferências */}</TabsContent>
      <TabsContent value="data">
        <Button onClick={exportData}>Exportar Dados</Button>
        <Button onClick={clearData} variant="destructive">
          Limpar Dados
        </Button>
      </TabsContent>
    </Tabs>
  );
}
```

**Princípios**:

- ✅ Tabs para organização
- ✅ Export/Import de dados sempre disponível
- ✅ Ações destrutivas com confirmação (AlertDialog)
- ✅ Feedback imediato com toast

---

## 🚀 Workflow de Desenvolvimento

### Fluxo Obrigatório

```
1. PLANEJAR
   ├─ Ler este DEVELOPMENT-GUIDE.md
   ├─ Verificar tipos existentes em types.ts
   ├─ Verificar componentes existentes em /components/ui/
   └─ Verificar integrações necessárias

2. DESENVOLVER
   ├─ Criar/modificar arquivos
   ├─ Seguir padrões de organização de arquivos
   ├─ Usar tipos explícitos (sem 'any')
   └─ Comentar código complexo

3. VALIDAR (CICLO)
   ├─ npm run build          # Build completo
   ├─ Verificar erros        # Se houver erros, corrigir
   ├─ npm run build          # Build novamente
   └─ Repetir até 0 erros

4. QUALIDADE
   ├─ npm run lint           # ESLint
   ├─ npm run typecheck      # TypeScript check (se disponível)
   └─ Corrigir warnings

5. PRÉ-COMMIT (automático via Husky)
   ├─ Lint-staged executa
   ├─ Testes executam (se configurados)
   └─ Build validation

6. COMMIT
   ├─ Seguir Conventional Commits
   ├─ git add .
   ├─ git commit -m "feat: add task filtering"
   └─ Mensagem clara e descritiva

7. PUSH
   ├─ git push origin main
   └─ Verificar CI/CD (se configurado)

8. ATUALIZAR DOCUMENTAÇÃO
   └─ Atualizar este DEVELOPMENT-GUIDE.md se necessário
```

### Conventional Commits

**Formato**: `<type>(<scope>): <subject>`

**Types**:

- `feat`: Nova feature
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `perf`: Performance
- `test`: Testes
- `chore`: Manutenção

**Exemplos**:

```bash
git commit -m "feat(tasks): add task filtering by priority"
git commit -m "fix(finances): resolve calculation error in budget"
git commit -m "docs: update DEVELOPMENT-GUIDE with new patterns"
git commit -m "refactor(components): extract common button logic"
git commit -m "perf(dashboard): optimize card rendering"
```

### Scripts NPM Principais

```json
{
  "dev": "next dev --port 9002", // Desenvolvimento
  "build": "next build", // Build de produção
  "start": "next start", // Servidor de produção
  "lint": "next lint", // ESLint
  "genkit:dev": "genkit start -- tsx --watch src/ai/dev.ts" // AI dev
}
```

---

## 🐛 Problemas Comuns e Soluções

### 1. Module has no exported member 'X'

**Problema**: Tipo não encontrado

```typescript
// ❌ Erro
import { RoutinePeriod } from "./types"; // types.ts não exporta

// ✅ Solução
import { RoutinePeriod } from "./schedule"; // schedule.ts exporta
```

**Ação**: Verificar qual arquivo exporta o tipo necessário

### 2. Type 'X' is not assignable to type 'Y'

**Problema**: Mistura de tipos incompatíveis (Task vs LegacyTask)

```typescript
// ❌ Erro
import { Task } from "./types";
const task: Task = { period: "morning" }; // Task não tem period

// ✅ Solução
import { LegacyTask } from "./legacy-data";
const task: LegacyTask = { period: "morning" }; // LegacyTask tem period
```

**Ação**: Usar o tipo correto para cada contexto

### 3. Module not found

**Problema**: Import com extensão `.ts` ou path incorreto

```typescript
// ❌ Erro
import { flow } from "./flow.ts"; // Não incluir extensão

// ✅ Solução
import { flow } from "./flow";
```

**Ação**: Remover extensões de imports

### 4. setState called in useEffect causing infinite loop

**Problema**: Dependência circular no useEffect

```typescript
// ❌ Causa loop infinito
useEffect(() => {
  setState(newValue);
}, [state]); // state muda, triggera useEffect, muda state...

// ✅ Solução 1: Remover dependência
useEffect(() => {
  setState(newValue);
}, []); // Executar apenas uma vez

// ✅ Solução 2: Usar callback
useEffect(() => {
  setState((prev) => computeNewValue(prev));
}, []); // Não depende de state
```

### 5. React Compiler: Cannot memoize

**Problema**: React Compiler não consegue otimizar certos patterns

```typescript
// ⚠️ Warning: Cannot memoize form.watch()
export function MyForm() {
  const form = useForm();

  useEffect(() => {
    const values = form.watch();
  }, [form]);

  return <Form {...form} />;
}

// ✅ Solução: Adicionar directive
("use no memo");

export function MyForm() {
  // ... mesmo código
}
```

### 6. Import path resolution errors

**Problema**: Imports relativos vs absolutos confusos

```typescript
// ❌ Misturado e inconsistente
import { Button } from "@/components/ui/button"; // Absoluto
import { TaskForm } from "./components/TaskForm"; // Relativo
import { Task } from "../../../lib/types"; // Relativo complexo

// ✅ Pattern recomendado
// Libs e componentes compartilhados: absoluto
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/types";

// Componentes da mesma feature: relativo
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
```

### 7. localStorage quota exceeded

**Problema**: Muito dado no localStorage

```typescript
// ❌ Salvar arrays enormes
setStorageItem("history", arrayWith10000Items);

// ✅ Limitar tamanho
const recentHistory = history.slice(-100); // Últimos 100 apenas
setStorageItem("history", recentHistory);

// ✅ Comprimir dados antigos
const archivedData = compressOldData(history);
setStorageItem("archive", archivedData);
```

### 8. Dialog não fecha após submit (Routine Reflection)

**Problema**: Reflection dialog completa mas checkbox não atualiza

**Causa**: Estado do dialog não sincronizado corretamente

```typescript
// ❌ ERRADO: Dialog fecha mas estado pode não ter propagado
const handleReflectionComplete = (reflection: RoutineReflection) => {
  onToggleCheck(selectedRoutine.id, true, reflection);
  setSelectedRoutine(null);
  // Dialog fecha mas callback pode não ter completado
};

// ✅ CORRETO: Gerenciar estado explicitamente
const handleReflectionComplete = (reflection: RoutineReflection) => {
  if (selectedRoutine) {
    // 1. Update parent state
    onToggleCheck(selectedRoutine.id, true, reflection);
    // 2. Clear local selection
    setSelectedRoutine(null);
    // 3. Explicitly close dialog
    setReflectionDialogOpen(false);
  }
};

// No Dialog Component:
const handleSubmit = async (data: FormData) => {
  setIsSubmitting(true);
  try {
    const result = processData(data);
    onComplete(result); // Call parent handler
    form.reset(); // Reset form for next use
    onOpenChange(false); // Close dialog
  } finally {
    setIsSubmitting(false);
  }
};
```

**Checklist de Debug para Dialogs**:

- [ ] Parent state atualiza ANTES de fechar dialog?
- [ ] Form.reset() é chamado após submit?
- [ ] onOpenChange(false) é chamado explicitamente?
- [ ] isSubmitting tem finally block para sempre resetar?
- [ ] Callback de parent é async-safe?

---

## ✅ Checklist de Qualidade

### Antes de Commitar

- [ ] ✅ Build bem-sucedido (`npm run build`)
- [ ] ✅ Zero erros de TypeScript
- [ ] ✅ Zero uso de `any`
- [ ] ✅ Lint passou sem erros (`npm run lint`)
- [ ] ✅ Imports sem extensões `.ts/.tsx`
- [ ] ✅ Imports relativos dentro da mesma feature
- [ ] ✅ Componentes usando ShadCN UI (não custom)
- [ ] ✅ Tipos explícitos em todas as funções
- [ ] ✅ useEffect com dependências corretas
- [ ] ✅ Cleanup em useEffect (se necessário)
- [ ] ✅ Dados persistidos com namespace `focus-flow:v1:`
- [ ] ✅ Ações importantes logadas com `useDataLogger`
- [ ] ✅ Layout responsivo (mobile-friendly)
- [ ] ✅ Acessibilidade (teclado + screen reader)
- [ ] ✅ TODO conteúdo visível ao usuário está em inglês
- [ ] ✅ Mensagem de commit seguindo Conventional Commits

### Ao Integrar Feature Nova

- [ ] ✅ Tipos adicionados/atualizados em `types.ts`
- [ ] ✅ Componentes em `src/features/<feature>/`
- [ ] ✅ Página em `src/app/(features)/<feature>/`
- [ ] ✅ Adicionado ao menu de navegação
- [ ] ✅ Card no dashboard (se relevante)
- [ ] ✅ Link na home (se feature principal)
- [ ] ✅ Configurações em `/settings` (se necessário)
- [ ] ✅ Logging de ações importantes
- [ ] ✅ TODO texto visível ao usuário está em inglês
- [ ] ✅ Documentação atualizada (este arquivo)

---

## 📊 Performance Best Practices

### 1. Evitar Re-renders

```typescript
// ✅ Usar React.memo para componentes pesados
export const HeavyComponent = React.memo(({ data }: Props) => {
  // Renderização cara
  return <ComplexVisualization data={data} />;
});

// ✅ useCallback para funções passadas como props
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);

// ✅ useMemo para computações caras
const sortedTasks = useMemo(() => {
  return tasks.sort((a, b) => a.priority.localeCompare(b.priority));
}, [tasks]);
```

### 2. Code Splitting

```typescript
// ✅ Dynamic imports para componentes pesados
import dynamic from "next/dynamic";

const RoadmapChart = dynamic(() => import("./roadmap-chart"), {
  ssr: false, // Desabilitar SSR se necessário
  loading: () => <Skeleton />,
});
```

### 3. Otimização de Images

```typescript
// ✅ Usar Next.js Image component
import Image from "next/image";

<Image src="/logo.png" alt="Logo" width={200} height={100} priority />;
```

### 4. Debouncing e Throttling

```typescript
// ✅ Debounce para inputs de busca
import { useDebouncedCallback } from "use-debounce";

const debouncedSearch = useDebouncedCallback((value: string) => {
  performSearch(value);
}, 300);

<Input onChange={(e) => debouncedSearch(e.target.value)} />;
```

---

## 🔐 Segurança e Privacidade

### Princípios

1. **Local-First**: Dados nunca saem do dispositivo por padrão
2. **No Tracking**: Sem analytics externos
3. **No Backend**: Aplicação funciona 100% offline
4. **GDPR Compliant**: Usuário controla todos os dados
5. **Export/Import**: Portabilidade de dados garantida

### Dados Sensíveis

**🚨 NUNCA armazenar**:

- Senhas em plain text
- Tokens de API no código
- Informações de pagamento
- Dados pessoais identificáveis (PII) desnecessários

**✅ Se necessário**:

- Usar variáveis de ambiente (`.env.local`)
- Criptografar dados sensíveis (Web Crypto API)
- Solicitar consentimento explícito

---

## 🧪 Testing (Futuro)

### Estrutura Planejada

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── storage.test.ts
│   │   │   └── schedule.test.ts
│   │   └── hooks/
│   │       └── use-local-storage.test.ts
│   └── integration/
│       └── task-management.test.tsx
```

### Tools Recomendadas

- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **MSW**: API mocking

---

## 🔄 Versionamento e Releases

### Semantic Versioning

**Formato**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

**Exemplo**: `1.3.2`

### Changelog

Manter `CHANGELOG.md` atualizado:

```markdown
## [1.3.0] - 2025-11-06

### Added

- Task filtering by priority and tags
- Export tasks to JSON

### Fixed

- Task status not updating correctly
- Layout overflow on mobile

### Changed

- Improved task form validation
```

---

## 📚 Recursos e Referências

### Documentação Oficial

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [ShadCN UI](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

### Padrões e Arquitetura

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Code (Robert C. Martin)](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Acessibilidade

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project](https://www.a11yproject.com/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

---

## 🆘 Troubleshooting

### Build Falhou

```bash
# 1. Limpar cache
rm -rf .next
rm -rf node_modules/.cache

# 2. Reinstalar dependências
npm install

# 3. Verificar erros de tipo
npm run build

# 4. Se persistir, verificar imports
# - Remover extensões .ts/.tsx
# - Verificar paths relativos vs absolutos
# - Verificar tipos exportados corretamente
```

### TypeScript Errors

```bash
# Verificar configuração
cat tsconfig.json

# Verificar se todos os tipos estão exportados
# Procurar por 'any' no código
grep -r "any" src/

# Verificar importações
grep -r "from.*\.ts" src/ # Não deve encontrar nada
```

### Performance Issues

```bash
# Analisar bundle
npm run build -- --analyze # (se configurado)

# Verificar re-renders
# Usar React DevTools Profiler

# Verificar localStorage size
# Abrir DevTools > Application > Local Storage
```

---

## 📝 Notas de Versão

### v1.2.4 (7 Nov 2025)

**Build**: ✅ 0 erros

**Phase 2 Refinements (ADHD-friendly polish & consistency)**:

- Focus Mode Enhancements:
  - Added keyboard shortcut Shift+F to toggle Focus Mode globally
  - Hides Motivational Header and GemBalance when active to reduce cognitive load
  - Centers main content area with constrained width (`max-w-5xl`) for focus
  - Respects new settings toggle: “Enable Focus Mode by default” (`focusModeDefault` in localStorage)
- Settings Page (Appearance → General):
  - Added theme selector wired to custom `ThemeProvider` (`light` | `dark` | `system`)
  - Added Focus Mode default switch (persists to localStorage)
- Performance Page Progressive Disclosure:
  - Wrapped key charts in Accordion sections: “Key Activity Metrics” and “Deep Dive & Correlations”
  - Reduces initial visual density and improves scan-ability
- Card Style Normalization:
  - Unified dashboard card surfaces to `bg-card/50` + subtle `hover:shadow-sm`
  - Removed legacy visual divergence; consistent borders and spacing
- Dashboard Routine Metrics Cleanup:
  - Removed deprecated `routinePeriod` / `period_incomplete` filtering logic from dynamic dashboard cards
  - Routine metrics now aggregate incomplete modern `Task` items uniformly (legacy period fields eliminated)
  - Eliminated type errors caused by references to removed properties (`period`, `startTime`)
- Documentation Updates:
  - Bumped version to 1.2.4
  - Added notes on Focus Mode hotkey, default setting, accordion usage in Performance, and removal of `routinePeriod` from cards

**Developer Impact**:

- Dashboard card configuration schema simplified (no hidden period-based branch)
- Future enhancement path: introduce separate RoutineItem-based analytics card set
- Cleaner codepath in `dynamic-dashboard-card.tsx` reduces branching and avoids reliance on deprecated legacy task shape

**Next Candidates (Not Implemented Yet)**:

- Friendly date labeling ("Today", "Tomorrow") for task due dates in routine card details
- RoutineItem-based dashboard metrics (streaks, completion rates by category)
- Achievement unlock toasts & performance trend annotations

---

### v1.2.3 (7 Nov 2025)

**Build**: ✅ 0 erros

**Home Enhancements & Landing Polish**:

- Home (/home): Added interactive sections for quicker momentum
  - Today Focus: surfaces weakest performance domain with suggested action
  - Performance Snapshot: overall score and unlocked achievements count
  - High Priority Tasks: top 5 pending “high” priority tasks
  - Recent Achievements: latest 3 unlocks with gem rewards
  - All sections react to the unified `local-storage` event
- Landing (public):
  - Fixed CTA typo: “Find your purpose”
  - Added badges: Privacy-first, Offline-ready, ADHD-friendly
  - Clarified “Time Management & Pomodoro” feature text
- Theming:
  - Added app-wide Light/Dark theme with `ThemeProvider` (class-based)
  - Theme toggle (Sun/Moon) in main headers
  - Guidance added to design section about using semantic tokens
- Documentation:
  - Corrected useLocalStorage import to default export in examples
  - Bumped version to 1.2.3

### v1.2.2 (7 Nov 2025)

**Build**: ✅ 0 erros

**Performance Analysis Expansion**:

- Added daily performance history snapshots (stored under `performanceHistory`).
- New domain score exports in `src/lib/performance-metrics.ts` (`computeDomainScores`, individual domain functions).
- Added components:
  - `DomainBreakdown` (bar chart of per-domain scores)
  - `PerformanceTrend` (30-day line chart of overall score)
  - `GemCorrelation` (scatter chart relating score vs gem balance)
  - `RecentAchievements` (latest 5 achievements + gem balance)
- Updated event listeners to use `local-storage` custom event for consistency.
- Hook `usePerformanceMetrics` now records a daily snapshot if missing.
- Added `usePerformanceHistory` for reactive access to stored trend data.
- Integrated new charts into `/performance` page beneath existing analytics.

**Integration Notes**:

- Gem balance correlated with performance to surface motivational feedback loops.
- Achievements surfaced in performance to reinforce progress contextually.
- Domain breakdown enables targeted improvement (weakest domain now visible).

**Next Ideas**:

- Annotate trend points with achievement unlock markers.
- Add moving average line (7-day smoothing).
- Add percentile ranking (local-only heuristic) for gamified benchmarking.

### v1.2.1 (7 Nov 2025)

**Build**: ✅ 0 erros

**Performance Meta Goal**:

- Adicionado util `src/lib/performance-metrics.ts` calculando score unificado (0–100) baseado em:
  - Tasks concluídas (proporção status `done`)
  - Rotinas (média diária de completion via `dailyLogs`)
  - Candidaturas (status ponderado: Offer/Interviewing > Applied, Rejected=0)
  - Finanças (meses com net ≥ 0)
  - Disciplina de tempo (menos horas em time sinks = melhor)
- Níveis de excelência:
  - Very bad: 0 – 50%
  - Bad: 50.1 – 70%
  - Regular: 70.1 – 80%
  - Good: 80.1 – 90%
  - Great: 90.1 – 95%
  - Excellent: 95.1 – 100%
- Sugestão dinâmica: acima de 95% recomenda aumentar carga (novas rotinas / tarefas mais difíceis)
- UI: `OverallPerformanceGoal` exibido no topo da página `/performance`.
- Hook inicial simples substituído por computação direta + listener de `local-storage`.

### v1.2.0 (7 Nov 2025)

**Build**: ✅ 0 erros

**Gamification Overhaul**:

- ✅ Novo sistema de Rewards (condicionais e compráveis)

  - Condicionais com frequências: daily/weekly/monthly/one-time
  - Compráveis com gemas (luxos): restaurante, spa, viagem, etc.
  - Arquivo: `src/lib/initial-rewards.ts`

- ✅ Sistema de Achievements (vitalícios e revogáveis)

  - 16 achievements padrão (routines, study, career, tasks, finance, milestone)
  - Arquivo: `src/lib/initial-achievements.ts`

- ✅ Economia de Gemas

  - Ganho: rotinas, tasks, pomodoro, achievements
  - Gasto: rewards compráveis
  - Utilitários: `src/lib/reward-utils.ts`

- ✅ Hook de Estado

  - `useRewardSystem()` para gerenciar gems, rewards e achievements
  - Arquivo removido: `src/hooks/use-reward-system.ts` (substituído pelo conjunto de hooks DB: `use-rewards-db.ts` + `use-reward-economy.ts`)

- ✅ UI & Navegação

  - Página `/achievements` (galeria): `src/app/(features)/achievements/page.tsx`
  - Página `/rewards` (loja + condicionais): `src/app/(features)/rewards/page.tsx`
  - Componentes: `AchievementCard`, `AchievementGallery`, `RewardCard`, `GemBalance`
  - Sidebar atualizado: “Achievements” (Trophy) e “Rewards” (Gift)

- ✅ Integração com Features
  - Rotinas: gemas ao completar (+ reflexão)
  - Tasks: gemas por prioridade
  - Pomodoro: gemas por sessão concluída

**Próximos Passos**:

- Toast/feedback ao desbloquear achievements
- Migração de dados antigos (points/badges → gems/achievements)
- Cards no dashboard para saldo de gems e conquistas recentes

### v1.1.0 (7 Nov 2025)

**Build**: ✅ 26 páginas, 0 erros

**Features**:

- ✅ **Routine Toggle Behavior**: Rotinas agora funcionam como checkbox toggle completo
- ✅ **Perguntas Específicas por Tipo**: Cada routine type tem perguntas únicas de reflexão
- ✅ **General Routine Type**: Adicionado tipo "general" com perguntas próprias
- ✅ Rotinas completadas permanecem visíveis e podem ser desmarcadas

**Changes**:

- Rotinas NÃO desaparecem mais ao serem completadas
- Checkbox permite marcar/desmarcar livremente (toggle behavior)
- Melhor UX: usuário pode corrigir se marcar errado
- Estado visual claro para rotinas completadas (line-through + opacity)

**Routine Reflection Questions by Type**:

1. **study**: Foco em aprendizado (explain, why matters, apply)
2. **code**: Foco em qualidade (learn vs copy, explain, commit-worthy, AI vs YOU)
3. **job-search**: Foco em candidatura (read description, research, fit, customize)
4. **finances**: Foco em consciência (review, patterns, action)
5. **general**: Foco em atenção plena (complete, mindful vs autopilot, insights)

**Technical**:

- Removido filtro `!todayCheckmark.done` de activeRoutines
- Adicionado `generalSchema` e `renderGeneralQuestions()`
- Rotinas sempre visíveis quando `active: true`
- Toggle behavior consistente com expectativas do usuário

**Documentation**:

- Atualizado "Routine Reflection System" com tipos de perguntas
- Adicionado "Toggle Behavior" pattern
- Documentado quando usar cada tipo de rotina

### v1.0.3 (7 Nov 2025)

**Build**: ✅ 26 páginas, 0 erros

**Fixes**:

- ✅ Fixed routines disappearing immediately when clicked
- ✅ RoutineChecklist now properly filters completed routines
- ✅ Completed routines no longer shown until due again

**Changes**:

- Improved routine visibility logic in RoutineChecklist
- Routines now disappear after completion (correct behavior)
- Better UX: completed routines removed from list until next due date
- Prevents accidental re-completion of same routine

**Technical**:

- Added `getTodayCheckmark()` filter in activeRoutines calculation
- Routines with `done: true` checkmark are hidden from display
- Maintains clean "to-do" list showing only pending routines

### v1.0.2 (7 Nov 2025)

**Build**: ✅ 26 páginas, 0 erros

**Features**:

- ✅ Added optional reflection system for routines
- ✅ New `requiresReflection` field in RoutineItem
- ✅ New `routineType` field for categorizing routines
- ✅ Routines can now complete immediately without reflection dialog
- ✅ RoutineForm includes switches for reflection settings

**Changes**:

- Reflection dialog now optional based on routine configuration
- Simple tasks (make bed, etc) can complete with one click
- Complex tasks (study, code) can still require reflection
- User has full control over which routines need reflection
- Better UX for routine completion workflow

**Documentation**:

- Added "Optional Reflection Pattern" section
- Documented when to use/not use reflection
- Updated RoutineItem type documentation

### v1.0.1 (7 Nov 2025)

**Build**: ✅ 26 páginas, 0 erros

**Fixes**:

- ✅ Fixed routines checkbox not marking items as complete
- ✅ Fixed reflection dialog state management
- ✅ Moved sidebar toggle to header (ShadCN pattern)
- ✅ Improved dialog close behavior with form reset

**Changes**:

- Sidebar toggle button now in header (standard pattern)
- Reflection dialog properly resets form after submission
- Better state management in RoutineChecklist component

### v1.0.0 (6 Nov 2025)

**Build**: ✅ 26 páginas, 0 erros

**Estrutura**:

- Sistema de tarefas separado (Tasks vs Routine)
- Tipos explícitos (zero `any`)
- Organização de arquivos padronizada
- React Compiler habilitado

**Features**:

- Dashboard personalizável
- Gestão de candidaturas (Kanban)
- Gestão financeira (orçamento + investimentos)
- Sistema de tarefas one-time
- Sistema de rotinas diárias (legacy)
- Roadmap profissional
- Análise de performance
- Time management (Pomodoro)

**Tech Stack**:

- Next.js 15.5.6
- React 19.2.0
- TypeScript 5.9.3 (strict)
- Tailwind + ShadCN UI

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consultar este guia primeiro
2. Verificar documentação oficial das libs
3. Procurar no histórico de commits (`git log`)
4. Criar issue no repositório (se aplicável)

---

**🎉 Fim do Guia de Desenvolvimento**

> Lembre-se: Este documento é uma fonte viva de conhecimento. **SEMPRE atualize após mudanças significativas!**

**Última revisão**: 7 de novembro de 2025  
**Próxima revisão**: Após próxima feature/fix importante
