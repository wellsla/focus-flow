# Dashboard Integration

## Overview

Dashboard integrado com sistema de rotinas e Pomodoro para ADHD-friendly workflow.

## Componentes Implementados

### 1. PomodoroWidget

- **Localização**: `/features/pomodoro/PomodoroWidget.tsx`
- **Função**: Widget compacto para dashboard
- **Features**:
  - Exibe timer quando ativo
  - Botão "Iniciar" quando idle
  - Link para página completa `/pomodoro`
  - Estado do ciclo atual

### 2. RoutineChecklist

- **Localização**: `/features/routines/RoutineChecklist.tsx`
- **Função**: Lista de rotinas com checkboxes
- **Features**:
  - Filtra rotinas devidas hoje (baseado em `frequency`)
  - Checkboxes para marcar conclusão
  - Agrupamento por categoria (opcional)
  - Limite de itens exibidos (opcional)
  - Estado visual: riscado quando completo
  - Badges de frequência

### 3. CommandPalette

- **Localização**: `/components/command-palette.tsx`
- **Função**: Navegação rápida global
- **Features**:
  - Atalho: `Ctrl+K` / `Cmd+K`
  - Navegação para todas as páginas principais
  - Agrupamento por categoria
  - Busca por nome
  - Ícones visuais

## Hooks Implementados

### useRoutines()

- **Localização**: `/hooks/use-routines.ts`
- **Função**: Gerenciar lista de rotinas
- **Retorna**:
  - `routines`: Array de RoutineItem
  - `setRoutines`: Atualizar lista
- **Features**:
  - Inicializa com `defaultRoutines` se vazio
  - Persiste em localStorage com namespace

### useTodayCheckmarks()

- **Localização**: `/hooks/use-routines.ts`
- **Função**: Gerenciar checkmarks do dia atual
- **Retorna**:
  - `checkmarks`: Array de Checkmark de hoje
  - `toggleCheck(routineId, checked)`: Alternar check
- **Features**:
  - Carrega checks do dia específico (eficiência)
  - Salva automaticamente em localStorage
  - Cria novo check se não existir

### useRoutinesWithChecks()

- **Localização**: `/hooks/use-routines.ts`
- **Função**: Hook combinado
- **Retorna**: routines + checkmarks + toggleCheck

## Integração no Dashboard

### Estrutura Atualizada

```tsx
/dashboard
├── PomodoroWidget (sidebar)
├── RoutineChecklist (sidebar, limit 5)
│   └── Link: "Ver Todas" → /routine
└── RecentApplications (main area)
```

### Navegação

- **Sidebar**: Novo grupo "Focus Flow"
  - Pomodoro (`/pomodoro`)
  - Routine (`/routine`)
  - Journal (`/journal`)
  - Focus Mode (`/focus`)
- **Command Palette**: `Ctrl+K` para acesso rápido
- **Header**: Botão "Buscar..." com hint visual do atalho

## Padrões ADHD-Friendly Mantidos

1. **Single CTA por seção**: Cada card tem uma ação clara
2. **Feedback visual imediato**: Checkboxes respondem instantaneamente
3. **Redução de distrações**: Layout limpo, cores consistentes
4. **Atalhos de teclado**: Command palette para navegação rápida
5. **Estado visual claro**: Riscado, opacidade, badges
6. **Limite de itens**: Apenas 5 rotinas no dashboard (não sobrecarrega)

## Próximos Passos

- [ ] Criar página `/routine` completa com CRUD
- [ ] Implementar streak calculation visual
- [ ] Adicionar estatísticas de conclusão
- [ ] Integrar recompensas por rotinas completas
- [ ] Notificações para rotinas não realizadas
