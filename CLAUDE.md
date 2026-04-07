# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint via next lint
```

No test suite is configured.

## Architecture

**Next.js 14 App Router** project with a mix of server and client components.

### Data Layer (`src/lib/api/f1-api.ts`)

Single API module. All data comes from two sources:
- **Ergast mirror** at `https://api.jolpi.ca/ergast/f1/` — used for historical/season data (schedule, standings, driver stats, qualifying). Note: some older functions still reference the deprecated `https://ergast.com/api/f1` base URL directly; the homepage and championship page already use the jolpi.ca mirror.
- **OpenF1** at `https://api.openf1.org/v1` — defined but not yet actively used.

Key exports: `getCurrentStandings`, `getCurrentSchedule`, `getDriverCareerStats`, `getSeasonResults`, `getChampionshipHistory`. `TEAM_COLORS` and `CONSTRUCTOR_SLUG` are shared maps used across components.

### Pages & Rendering Pattern

Server components fetch data and pass it to `'use client'` components:
- `src/app/standings/page.tsx` → `StandingsClient.tsx` (driver + constructor tabs)
- `src/app/page.tsx` — server component fetching schedule + standings inline

Fully client-side pages (fetch in `useEffect`):
- `src/app/championship/page.tsx` — Bayesian win probability model, fetches round-by-round standings history
- `src/app/predict/page.tsx`, `src/app/compare/page.tsx`, `src/app/simulator/page.tsx`, `src/app/ml-ratings/page.tsx`, `src/app/cards/page.tsx`

Static data pages:
- `src/app/history/page.tsx` — hardcoded `CHAMPIONS` record (1950–2024), client component with filter/search UI

### ML Layer (`src/lib/ml/race-predictor.ts`)

Uses `@tensorflow/tfjs` for browser-side inference. Exports:
- `ruleBasedPrediction` — weighted scoring (qualifying 60%, recent form 25%, circuit history 10%, team strength 5%) with softmax probabilities
- `predictFromQualifying` — wraps rule-based with circuit stats and recent form lookups
- `calculateDriverElo` / `calculateEloRating` — ELO-style cross-era driver ratings
- `LEGEND_RATINGS` — pre-computed all-time great ratings
- `trainPredictionModel` — TF.js neural net (13 features → sigmoid), not wired to any page yet

### Styling

Tailwind CSS with three custom font utility classes defined in `src/styles/globals.css`:
- `f1-heading` — Barlow Condensed 800, uppercase tracking
- `f1-subheading` — Barlow Condensed 600
- `f1-mono` — Share Tech Mono

Brand color: `#E10600` (F1 red). Background: `#080808`. All glass-panel effects use `bg-white/5` or `bg-white/10` borders.

### Key Patterns

- `export const revalidate = 3600` on server pages for ISR
- Fallback data hardcoded in `StandingsClient.tsx` (2024 season) used when API fails
- `TEAM_COLORS` is duplicated locally in `championship/page.tsx` — the canonical version is in `f1-api.ts`
- Driver detail pages live at `/driver/[driverId]` (not yet implemented as a file in the glob, but linked from `StandingsClient`)
