# Development Guidelines

This document outlines the principles and standards to be followed for all development and code modification within this application. The goal is to maintain a high-quality, scalable, and maintainable codebase.

## Core Principles

- **SOLID**:
  - **S**ingle Responsibility Principle: Each component, function, or module should have one, and only one, reason to change.
  - **O**pen/Closed Principle: Software entities should be open for extension but closed for modification.
  - **L**iskov Substitution Principle: Subtypes must be substitutable for their base types.
  - **I**nterface Segregation Principle: No client should be forced to depend on methods it does not use.
  - **D**ependency Inversion Principle: Depend on abstractions, not on concretions.

- **KISS (Keep It Simple, Stupid)**: Avoid unnecessary complexity. The simplest solution is often the best.

- **DRY (Don't Repeat Yourself)**: Every piece of knowledge must have a single, unambiguous, authoritative representation within a system. Reuse code through components, hooks, and utility functions.

## Code Quality & Style

- **Clean Code**: Write code that is readable, understandable, and maintainable. Use meaningful names for variables, functions, and components. Keep functions small and focused.

- **TypeScript Best Practices**:
  - **Strong Typing**: Always provide explicit types for variables, function parameters, and return values.
  - **Avoid `any`**: The `any` type should be avoided at all costs. Use more specific types, `unknown`, or generics.
  - **ESLint & Prettier**: Adhere strictly to the rules defined in the project's ESLint and Prettier configurations to ensure consistent code style and catch potential errors early.

- **React Best Practices**:
  - **Direct Hook Imports**: Always import React hooks directly from the `react` package (e.g., `import { useState } from 'react';`) rather than accessing them through the `React` namespace (e.g., `React.useState`).

## Design System

- **ShadCN UI & Tailwind CSS**: The application's UI is built exclusively with ShadCN UI components and styled with Tailwind CSS.
  - **Consistency**: Leverage the existing theme (`globals.css`) and component library to maintain a consistent visual and interactive experience.
  - **Reusability**: When creating new UI elements, prioritize composing them from existing ShadCN components or creating new reusable components that follow the established design patterns.

## Documentation

- **Keep It Updated**: Whenever a feature is added or modified, all relevant documentation must be updated to reflect the changes. This includes the `app-context.md` file and any inline code comments or other related documents.
