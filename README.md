# React Events App

A React + TypeScript incident-tracking dashboard built as a technical exercise. The app manages a catalogue of "Nexus" events — classified sightings, signals, contacts, anomalies, and redacted incidents — with a full-featured data grid and a chronological timeline view.

---

## Features

- **Dashboard** – summary statistics (total events, open count, critical count) plus a sortable, filterable, paginated data grid and a recent-timeline preview.
- **Data Grid** – column-level sorting, per-column text/select filters, togglable column visibility, paginated rows, inline edit & delete actions with a confirmation dialog.
- **Timeline Page** – events grouped by date and rendered as cards with animated transitions; search by title, filter by category and severity, click any card to open a detail modal.
- **Event Form** – create and edit events via an accessible modal dialog with full field validation.
- **Optimistic UI** – mutations are handled through TanStack Query; loading skeletons are shown while data is fetched.
- **Mock back-end** – 180 deterministically generated events served by an in-memory service (no real API required).

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Language | TypeScript 6 |
| Build tool | [Vite](https://vitejs.dev/) |
| Routing | [React Router v6](https://reactrouter.com/) |
| Data fetching | [TanStack Query v5](https://tanstack.com/query) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Date utilities | [date-fns](https://date-fns.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Styling | CSS Modules + [Tailwind Merge](https://github.com/dcastil/tailwind-merge) + [clsx](https://github.com/lukeed/clsx) |
| Linting | ESLint 9 with TypeScript and React Hooks plugins |

---

## Project Structure

```
my-app/
├── src/
│   ├── components/
│   │   ├── DataGrid/        # Sortable, filterable, paginated table
│   │   ├── EventForm/       # Create / edit event modal
│   │   ├── Layout/          # App header
│   │   ├── Timeline/        # Timeline cards, groups, detail modal
│   │   └── ui/              # Shared primitive components (badge, button, dialog, …)
│   ├── context/
│   │   └── EventContext.tsx # Global form-open / editing state
│   ├── data/
│   │   ├── eventTypes.ts    # TypeScript types and constants
│   │   └── mockEvents.ts    # Deterministic event generator (seed 42, 180 events)
│   ├── hooks/
│   │   └── useEventQueries.ts # TanStack Query hooks for CRUD operations
│   ├── lib/
│   │   ├── queryClient.ts   # Shared QueryClient instance
│   │   ├── useDebounce.ts   # Debounce hook
│   │   └── utils.ts         # Utility helpers
│   ├── routes/
│   │   ├── Dashboard.tsx    # / route
│   │   └── TimelinePage.tsx # /timeline route
│   ├── services/
│   │   └── mockEventsService.ts # In-memory CRUD service
│   ├── App.tsx              # Router + provider setup
│   └── main.tsx             # Entry point
└── package.json
```

---

## Data Model

Each event (`NexusEvent`) has the following shape:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier, e.g. `NX-0001` |
| `title` | `string` | Human-readable event name |
| `date` | `string` | ISO 8601 timestamp |
| `category` | `sighting \| signal \| contact \| anomaly \| classified` | Event type |
| `severity` | `low \| medium \| high \| critical` | Severity level |
| `agent` | `string` | Reporting agent name |
| `location` | `string` | Monitoring site name |
| `coordinates` | `string` *(optional)* | Geographic coordinates |
| `status` | `open \| investigating \| closed \| redacted` | Current status |
| `description` | `string` | Detailed incident description |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install dependencies

```bash
cd my-app
npm install
```

### Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

The output is placed in `my-app/dist/`.

### Preview the production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Routes

| Path | Description |
|---|---|
| `/` | Dashboard – data grid + recent timeline summary |
| `/timeline` | Full timeline view with search and filter controls |
| `/events/:id` | Event detail (placeholder) |