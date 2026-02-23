# Awana Clubber Manager — Frontend

A React single-page application for managing children's ministry progress tracking in [Awana](https://www.awana.org/) clubs. Volunteers use this app on club nights to look up individual kids, mark curriculum sections complete, update team assignments, and view live team scores and historical reports.

> **Context:** Awana is a global children's ministry program. Clubbers (kids) work through curriculum books divided into sections. Volunteers review and check off completed sections in real time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Language | TypeScript |
| Build Tool | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [DaisyUI v5](https://daisyui.com/) |
| Auth | [Clerk](https://clerk.com/) (`@clerk/clerk-react`) |
| Deployment | [Cloudflare Workers](https://workers.cloudflare.com/) via Wrangler |
| Testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) + [MSW](https://mswjs.io/) |

---

## Features

### Club Night Workflow

- **Club selection** — volunteers pick their club (Cubbies, Sparks Boys/Girls, T&T Boys/Girls, Trek) from a home screen
- **Clubber picker** — filtered list of kids in the selected club; searchable/scrollable
- **Section tracking** — each clubber's curriculum book is shown as collapsible units; volunteers tap to mark sections complete; unchecking requires a confirmation modal to prevent accidents
- **Progress bar** — live overall completion percentage across all units in the current book
- **Progress history chart** — visual history of the clubber's completion activity over time
- **Book management** — assign or switch a clubber's current curriculum book inline
- **Team assignment** — assign clubbers to color teams (Red, Blue, Green, Yellow) that feed the points leaderboard
- **Gender management** — update gender, which affects club/roster filtering (Sparks Boys vs Girls, etc.)

### Reporting

- **Live points report** — team leaderboard showing scores from the last 24 hours, weighted by a configurable multiplier
- **Historical reports viewer** — browse all past club sessions with per-day completion counts and team scores

### UX Details

- URL-param-driven navigation — club and clubber selections are reflected in the URL, making the back button work naturally and allowing bookmarking
- Responsive layout — optimized for tablets and phones used on club nights
- Clerk auth gate — unauthenticated users are redirected to the sign-in page; only allowlisted volunteers can access the app

---

## Project Structure

```
src/
├── components/          # UI components
│   ├── ClubPicker        # Home screen club selection grid
│   ├── ClubberPicker     # Roster list for a selected club
│   ├── ClubberInfo       # Main clubber detail view
│   ├── ClubberUnitBlock  # Collapsible unit of curriculum sections
│   ├── ClubberHistoryChart  # Completion history chart
│   ├── BookUpdater       # Inline book assignment
│   ├── TeamUpdater       # Team color picker
│   ├── GenderPicker      # Gender selector
│   ├── ConfirmationModal # Guard for destructive actions
│   ├── PointsReport      # Live team score leaderboard
│   ├── ReportsViewer     # Historical session reports
│   └── ...
├── contexts/            # React context providers
│   ├── globalAppContext  # Shared refresh triggers
│   ├── BookCacheContext  # Cached book data
│   ├── ClubberCacheContext
│   ├── ReviewerCacheContext
│   └── SectionCacheContext
├── hooks/
│   ├── useUrlParams      # URL search-param state management
│   ├── useClubberReport  # Clubber history data fetching
│   └── useReports        # Historical reports fetching
└── lib/                 # API utilities
```

---

## Testing

The test suite is focused on data integrity — ensuring that API response handling and data transformations work correctly before anything reaches the UI.

```bash
# Run tests in watch mode
npm test

# Run once (CI mode)
npm run test:run

# Run with coverage report
npm run test:coverage

# Lint
npm run lint
```

**What's covered:**
- Unit tests for API functions and utility logic
- Data transformation tests for section/progress processing
- Integration tests for component behavior and data flow
- MSW (Mock Service Worker) for reliable, network-independent API mocking

Tests run automatically in CI on pushes to `main` and on pull requests.

---

## Local Development

```bash
# Install dependencies
npm install

# Start local dev server (connects to the backend API)
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Workers
npx wrangler deploy
```

### Environment Variables

Create a `.env.local` file (never commit this):

```
VITE_API_URL=http://localhost:8787       # or your deployed backend URL
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Related

- **Backend API:** [awana-manager-public](https://github.com/NeckbeardThePirate/awana-manager-public) — the Hono/Cloudflare Workers API this app consumes
