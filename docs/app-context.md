# FocusFlow Application Context

## Overview

FocusFlow is a personal dashboard application designed to help users organize their lives and stay focused on their goals. It acts as a "reality check" dashboard, providing tools for tracking key areas of personal development and productivity. All user data is stored exclusively in the browser's local storage.

## Core Features

- **Dashboard**: A central hub displaying dynamic, user-configurable cards with key metrics from other features.
- **Applications**: A Kanban-style board to track job applications through various stages (Wishlist, Applied, Interviewing, etc.).
- **Goals**: A goal-setting feature to define and track short-term, mid-term, and long-term objectives.
- **Routine**: A task manager for organizing daily routines and general to-do items. Routine tasks reset each day.
- **Roadmap**: A visual, tree-based tool for planning and tracking learning paths or complex projects.
- **Time Management**: A feature for logging time spent on "time-sink" activities like gaming and social media.
- **Finances**: A tool for managing income, debts, and recurring expenses. It provides a monthly financial breakdown and offers AI-powered suggestions.
- **Performance**: A page with charts and graphs to visualize progress over time across applications, tasks, and finances.
- **Profile & Settings**: Pages for users to manage their personal information and application preferences.

## Technical Stack

- **Framework**: Next.js (with App Router)
- **Language**: TypeScript
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **Authentication**: Auth0
- **AI/Generative Features**: Genkit
- **State Management**: React Hooks (`useState`, `useEffect`) combined with a `useLocalStorage` custom hook for data persistence on the client-side.
