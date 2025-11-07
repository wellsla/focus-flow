import type { Reward } from "./types";

/**
 * Default rewards system
 * Users can create custom rewards, these are just examples/templates
 */
export const DEFAULT_CONDITIONAL_REWARDS: Omit<
  Reward,
  | "isUnlocked"
  | "lastResetAt"
  | "timesUsed"
  | "createdAt"
  | "isPurchased"
  | "purchasedAt"
>[] = [
  // Daily Rewards (reset every day)
  {
    id: "reward-coffee",
    title: "Morning Coffee",
    description: "Enjoy your favorite coffee after completing morning routine",
    type: "conditional",
    icon: "Coffee",
    category: "food",
    resetFrequency: "daily",
    conditions: [
      {
        type: "routine-completion",
        description: "Complete morning routine",
        target: 1,
        isMet: false,
        progress: 0,
      },
    ],
  },
  {
    id: "reward-snack",
    title: "Afternoon Snack",
    description: "Treat yourself after 2 productive pomodoro sessions",
    type: "conditional",
    icon: "Cake",
    category: "food",
    resetFrequency: "daily",
    conditions: [
      {
        type: "pomodoro-sessions",
        description: "Complete 2 pomodoro sessions",
        target: 2,
        isMet: false,
        progress: 0,
      },
    ],
  },
  {
    id: "reward-gaming",
    title: "Gaming Time",
    description:
      "Play games after completing daily routine and 3 study sessions",
    type: "conditional",
    icon: "Gamepad2",
    category: "entertainment",
    resetFrequency: "daily",
    conditions: [
      {
        type: "routine-completion",
        description: "Complete daily routine",
        target: 1,
        isMet: false,
        progress: 0,
      },
      {
        type: "pomodoro-sessions",
        description: "Complete 3 study sessions",
        target: 3,
        isMet: false,
        progress: 0,
      },
    ],
  },
  {
    id: "reward-social-media",
    title: "Social Media Break",
    description: "Scroll freely after studying 2 new concepts",
    type: "conditional",
    icon: "Smartphone",
    category: "entertainment",
    resetFrequency: "daily",
    conditions: [
      {
        type: "study-concepts",
        description: "Study 2 new concepts",
        target: 2,
        isMet: false,
        progress: 0,
      },
    ],
  },

  // Weekly Rewards
  {
    id: "reward-movie-night",
    title: "Movie Night",
    description: "Watch a movie after completing all routines this week",
    type: "conditional",
    icon: "Film",
    category: "entertainment",
    resetFrequency: "weekly",
    conditions: [
      {
        type: "routine-completion",
        description: "Complete routines 7 days in a row",
        target: 7,
        isMet: false,
        progress: 0,
      },
    ],
  },
  {
    id: "reward-cheat-meal",
    title: "Cheat Meal",
    description:
      "Enjoy your favorite meal after hitting weekly productivity goals",
    type: "conditional",
    icon: "Pizza",
    category: "food",
    resetFrequency: "weekly",
    conditions: [
      {
        type: "pomodoro-sessions",
        description: "Complete 20 pomodoro sessions this week",
        target: 20,
        isMet: false,
        progress: 0,
      },
    ],
  },

  // Monthly Rewards
  {
    id: "reward-day-off",
    title: "Guilt-Free Day Off",
    description: "Take a complete rest day after a month of consistency",
    type: "conditional",
    icon: "Palmtree",
    category: "break",
    resetFrequency: "monthly",
    conditions: [
      {
        type: "routine-completion",
        description: "Complete routines for 25 days this month",
        target: 25,
        isMet: false,
        progress: 0,
      },
    ],
  },
];

/**
 * Purchasable rewards (bought with gems)
 * These are luxury items that require saving gems
 */
export const DEFAULT_PURCHASABLE_REWARDS: Omit<
  Reward,
  | "isUnlocked"
  | "lastResetAt"
  | "timesUsed"
  | "createdAt"
  | "conditions"
  | "resetFrequency"
  | "isPurchased"
  | "purchasedAt"
>[] = [
  // One-time purchases (expensive luxuries)
  {
    id: "purchase-restaurant",
    title: "Restaurant Dinner",
    description: "Go to your favorite restaurant",
    type: "purchasable",
    icon: "UtensilsCrossed",
    category: "luxury",
    gemCost: 500,
    isOneTime: false, // Can buy multiple times
  },
  {
    id: "purchase-weekend-trip",
    title: "Weekend Trip",
    description: "Plan a weekend getaway",
    type: "purchasable",
    icon: "Plane",
    category: "luxury",
    gemCost: 2000,
    isOneTime: false,
  },
  {
    id: "purchase-new-tech",
    title: "New Tech Gadget",
    description: "Buy that tech gadget you've been eyeing",
    type: "purchasable",
    icon: "Laptop",
    category: "luxury",
    gemCost: 3000,
    isOneTime: false,
  },
  {
    id: "purchase-concert-ticket",
    title: "Concert Ticket",
    description: "See your favorite artist live",
    type: "purchasable",
    icon: "Music",
    category: "entertainment",
    gemCost: 800,
    isOneTime: false,
  },
  {
    id: "purchase-spa-day",
    title: "Spa Day",
    description: "Full day of relaxation and self-care",
    type: "purchasable",
    icon: "Heart",
    category: "luxury",
    gemCost: 1200,
    isOneTime: false,
  },

  // Smaller purchasable treats
  {
    id: "purchase-book",
    title: "New Book",
    description: "Buy that book you've been wanting to read",
    type: "purchasable",
    icon: "BookOpen",
    category: "entertainment",
    gemCost: 150,
    isOneTime: false,
  },
  {
    id: "purchase-game",
    title: "New Video Game",
    description: "Get that new game you've been eyeing",
    type: "purchasable",
    icon: "Gamepad",
    category: "entertainment",
    gemCost: 250,
    isOneTime: false,
  },
  {
    id: "purchase-hobby-supplies",
    title: "Hobby Supplies",
    description: "Invest in materials for your hobby",
    type: "purchasable",
    icon: "Palette",
    category: "custom",
    gemCost: 200,
    isOneTime: false,
  },
];
