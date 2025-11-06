# FocusFlow

Welcome to FocusFlow — your personal hub to organize job searching, daily routines and personal finances in one place. The project favors privacy: by default data is stored locally in the browser (localStorage).

## Overview

FocusFlow helps job seekers stay focused and organized with a set of features that cover the full workflow:

- Dashboard: quick view of today's tasks, active applications, finances and goals.
- Job Tracker: manage application stages (Wishlist → Applied → Interviewing → Offer).
- Daily Routines: checklists for morning/afternoon/evening tasks that can be completed daily.
- Goals: track short-, mid- and long-term objectives.
- Finances: record incomes, expenses and payments; monthly logs and optional AI suggestions.
- Time Tracking: log sessions (e.g., gaming, social media) and visualize time-wasters.
- Roadmap: a visual tree to structure learning and next steps.
- Charts & analytics: trends for progress, spending, and routine completion.

Notes: Auth0 is optional for authentication; some suggestion features use Genkit (Google Gemini) if configured. Nothing is sent to external services unless you configure integrations.

## Tech stack

- Next.js (app router)
- React 19 + TypeScript
- Tailwind CSS
- ShadCN UI
- Recharts (charts)
- react-d3-tree (roadmap)
- Optional: Auth0 and Genkit/Gemini for AI suggestions

## Project structure (short)

```
src/
  app/(features)/       # Main pages: dashboard, applications, finances, goals, etc.
  components/           # Shared UI (buttons, dialogs, cards)
  lib/                  # Types, utilities, placeholder data
  hooks/                # Hooks: useLocalStorage, useDataLogger, useToast
  ai/                   # Genkit flows and AI helpers
```

## Install & development

Recommended: Node.js 18+ and npm/yarn.

From PowerShell in the project root:

```powershell
npm install
npm run dev
```

The development server runs by default at `http://localhost:9002`.

Common npm scripts (see `package.json`):

- `npm run dev` — start dev server
- `npm run build` — build for production
- `npm run start` — start production server (after build)
- `npm run typecheck` — run TypeScript checks
- `npm run lint` — run linter
- `npm run genkit:dev` — run Genkit dev UI (if present)

## Environment variables

If you use Auth0 or Genkit, add a `.env.local` file with:

```
GEMINI_API_KEY=your_key_here
AUTH0_SECRET=random_string
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_BASE_URL=http://localhost:9002
```

The app works for most local features without these variables.

## Contributing

1. Fork or clone the repo
2. Create a feature/bugfix branch
3. Make changes and add simple tests/validation when possible
4. Open a pull request describing changes

Quick guidelines:

- Use `crypto.randomUUID()` for locally generated IDs
- Keep PRs focused and small

## Troubleshooting

- Port 9002 already in use: change the `dev` script to `next dev -p <port>`.
- Auth0 errors: confirm credentials in `.env.local` and client settings.
- AI suggestions not available: check `GEMINI_API_KEY` and service availability.

## License

Distributed under the MIT License. See `LICENSE` if present.

## Contact / notes

If you connect external services for authentication or AI, review privacy and data flow. For questions or issues, open an issue in the repository.
