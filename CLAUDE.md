# SPE Exchange Tool

<!--
This file is loaded by Claude Code when working in the spe-exchange-tool folder.
Video game reselling tool with AI scanning and profit tracking.
-->

A reselling tool that scans items, identifies them via AI, calculates profit across platforms, and tracks inventory.

---

## Project Info

| Item | Value |
|------|-------|
| **Git Remote** | `git@github.com:getboring/spe-exchange-tool.git` |
| **Branch** | `main` |
| **Hosting** | Vercel |
| **Live URL** | https://spe-exchange-tool-7q3blb07q-maxtorborings-projects.vercel.app |
| **Supabase** | `sfwetbqgtmhgcgmsmbnb` (TechExchangeApp) |

---

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- shadcn/ui (components.json configured)
- Zustand (state management)
- Supabase (auth, database, storage)
- AI Vision: Claude Sonnet 4 via Vercel serverless (`/api/scan`)

---

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Local dev server
npm run build        # Production build
git push             # Deploy to Vercel (automatic)
```

---

## Key Files

| File/Folder | Purpose |
|-------------|---------|
| `src/app/` | Page components (dashboard, scan, inventory, etc.) |
| `src/components/` | UI components |
| `src/lib/` | Business logic (fees, prompts, utils) |
| `src/stores/` | Zustand stores |
| `src/types/` | TypeScript types |
| `supabase/migrations/` | Database schema |
| `api/scan.ts` | AI scanning endpoint (Vercel serverless) |

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and add:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Price Units

All prices stored as **INTEGER cents** (3500 = $35.00).
Use `toCents()`, `toDollars()`, `formatCents()` from `src/lib/utils.ts`.

---

## Related Plan

Full build plan: `~/.claude/plans/eager-whistling-puzzle.md`
