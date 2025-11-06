/**
 * seed.ts
 *
 * Default routine items and flash reminders for initial setup
 * Based on Well's personal routine structure
 */

import type { RoutineItem, FlashReminder } from "./types";

export const defaultRoutines: RoutineItem[] = [
  // Manhã (Morning)
  {
    id: "routine-morning-1",
    category: "Manhã",
    title: "Arrumar a cama",
    frequency: "daily",
    active: true,
    order: 1,
  },
  {
    id: "routine-morning-2",
    category: "Manhã",
    title: "Hidratação (água ao acordar)",
    frequency: "daily",
    active: true,
    order: 2,
  },
  {
    id: "routine-morning-3",
    category: "Manhã",
    title: "Meditação ou respiração (5 min)",
    frequency: "daily",
    active: true,
    order: 3,
  },
  {
    id: "routine-morning-4",
    category: "Manhã",
    title: "Revisar metas do dia",
    frequency: "daily",
    active: true,
    order: 4,
  },

  // Durante o Dia
  {
    id: "routine-day-1",
    category: "Durante o Dia",
    title: "Trabalhar em tarefa prioritária (pomodoro)",
    frequency: "daily",
    active: true,
    order: 5,
  },
  {
    id: "routine-day-2",
    category: "Durante o Dia",
    title: "Pausas ativas a cada 2h",
    frequency: "daily",
    active: true,
    order: 6,
  },
  {
    id: "routine-day-3",
    category: "Durante o Dia",
    title: "Refeição sem tela",
    frequency: "daily",
    active: true,
    order: 7,
  },
  {
    id: "routine-day-4",
    category: "Durante o Dia",
    title: "Revisar aplicações de emprego",
    frequency: "daily",
    active: true,
    order: 8,
  },

  // Noite (Evening)
  {
    id: "routine-evening-1",
    category: "Noite",
    title: "Organizar ambiente para o dia seguinte",
    frequency: "daily",
    active: true,
    order: 9,
  },
  {
    id: "routine-evening-2",
    category: "Noite",
    title: "Diário (3 linhas)",
    frequency: "daily",
    active: true,
    order: 10,
  },
  {
    id: "routine-evening-3",
    category: "Noite",
    title: "Desligar telas 1h antes de dormir",
    frequency: "daily",
    active: true,
    order: 11,
  },
  {
    id: "routine-evening-4",
    category: "Noite",
    title: "Rotina de sono consistente",
    frequency: "daily",
    active: true,
    order: 12,
  },

  // Rotina Semanal
  {
    id: "routine-weekly-1",
    category: "Rotina Semanal",
    title: "Revisar progresso semanal",
    frequency: "weekly",
    active: true,
    order: 13,
  },
  {
    id: "routine-weekly-2",
    category: "Rotina Semanal",
    title: "Planejar próxima semana",
    frequency: "weekly",
    active: true,
    order: 14,
  },
  {
    id: "routine-weekly-3",
    category: "Rotina Semanal",
    title: "Limpar e organizar espaço de trabalho",
    frequency: "weekly",
    active: true,
    order: 15,
  },

  // Propósito e Direção
  {
    id: "routine-purpose-1",
    category: "Propósito e Direção",
    title: "Revisar objetivos de longo prazo",
    frequency: "monthly",
    active: true,
    order: 16,
  },
  {
    id: "routine-purpose-2",
    category: "Propósito e Direção",
    title: "Atualizar roadmap de aprendizado",
    frequency: "monthly",
    active: true,
    order: 17,
  },

  // Manutenção
  {
    id: "routine-maintenance-1",
    category: "Manutenção",
    title: "Fazer backup de dados importantes",
    frequency: "monthly",
    active: true,
    order: 18,
  },
  {
    id: "routine-maintenance-2",
    category: "Manutenção",
    title: "Revisar e atualizar finanças",
    frequency: "weekly",
    active: true,
    order: 19,
  },
  {
    id: "routine-maintenance-3",
    category: "Manutenção",
    title: "Exercício físico (30 min)",
    frequency: "every3days",
    active: true,
    order: 20,
  },
];

/**
 * Default flash reminders
 */
export const defaultReminders: FlashReminder[] = [
  {
    id: "reminder-app-open",
    text: "Seja gentil consigo mesmo. Hoje é mais um dia de 1% de progresso.",
    trigger: "app-open",
    enabled: true,
  },
  {
    id: "reminder-pomodoro-start",
    text: "Foco nos próximos 25 minutos. Você consegue.",
    trigger: "pomodoro-start",
    enabled: true,
    allowInFocus: false,
  },
  {
    id: "reminder-morning",
    text: "Bom dia! Revise suas 3 principais prioridades para hoje.",
    trigger: "time",
    timeOfDay: "09:00",
    enabled: true,
  },
  {
    id: "reminder-lunch",
    text: "Hora de uma pausa para refeição. Desligue as telas por 30 minutos.",
    trigger: "time",
    timeOfDay: "12:30",
    enabled: true,
  },
  {
    id: "reminder-afternoon",
    text: "Faça uma pausa ativa. Alongue-se e respire.",
    trigger: "time",
    timeOfDay: "15:00",
    enabled: true,
  },
  {
    id: "reminder-evening",
    text: "Que tal registrar seu dia no diário? 3 linhas bastam.",
    trigger: "time",
    timeOfDay: "20:00",
    enabled: true,
  },
];

/**
 * Initialize default routines if none exist
 * Call this on app initialization
 */
export function initializeRoutines(
  existingRoutines: RoutineItem[]
): RoutineItem[] {
  if (existingRoutines.length > 0) {
    return existingRoutines;
  }

  console.info("[seed] Initializing default routines");
  return defaultRoutines;
}

/**
 * Initialize default reminders if none exist
 */
export function initializeReminders(
  existingReminders: FlashReminder[]
): FlashReminder[] {
  if (existingReminders.length > 0) {
    return existingReminders;
  }

  console.info("[seed] Initializing default reminders");
  return defaultReminders;
}
