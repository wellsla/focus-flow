# FocusFlow

Your personal command center for job searching. Track applications, organize tasks, manage money, and stay motivated—all in one place. Everything stays private in your browser.

## What it does

You're job hunting and need to stay organized. FocusFlow gives you:

- **Dashboard**: See what matters today—applications sent, tasks due, money left, goals in progress
- **Job Tracker**: Move applications through stages (Wishlist → Applied → Interviewing → Offer)
- **Daily Routine**: Morning/afternoon/evening tasks that auto-reset each day
- **Goals**: Track short, mid, and long-term wins
- **Finances**: Log income, expenses, and debts; get AI suggestions on your spending
- **Time Tracking**: See how much you game or scroll (to stay accountable)
- **Roadmap**: Visual tree of your learning path
- **Charts**: Spot trends over time

Auth0 handles login. Gemini AI powers financial advice. All your data lives in browser localStorage—no server storage.

## Quickstart

```bash
npm install
npm run dev
```

Open [http://localhost:9002](http://localhost:9002).

## Project layout

```
src/
  app/(features)/     # Main pages: dashboard, applications, finances, goals, etc.
  components/         # Shared UI (buttons, dialogs, cards)
  lib/                # Types, utilities, mock data
  hooks/              # useLocalStorage, useDataLogger, useToast
  ai/                 # Genkit flows for financial tips
```

## Common tasks

**Add a dependency**  
`npm install <package>`

**Type check**  
`npm run typecheck`

**Build for production**  
`npm run build`

**Run Genkit dev UI** (for testing AI flows)  
`npm run genkit:dev`

## Environment variables

Create a `.env.local` file:

```bash
GEMINI_API_KEY=your_key_here
AUTH0_SECRET=random_string
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_BASE_URL=http://localhost:9002
```

## Troubleshooting

**Port 9002 already in use?**  
Change the port in `package.json` scripts: `"dev": "next dev -p <new_port>"`

**Auth0 errors?**  
Double-check your `.env.local` credentials match your Auth0 app settings.

**AI suggestions not working?**  
Verify `GEMINI_API_KEY` is set and valid.

## Tech stack

Next.js 15, React 19, TypeScript, Tailwind CSS, ShadCN UI, Auth0, Genkit (Google Gemini).
