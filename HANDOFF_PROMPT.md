# Lael Handoff Prompt

> Copy everything below this line into a new chat session to continue work on Lael.

---

## Project: Lael — Personal Assessment Manager

I'm building **Lael**, a personal assessment/exam manager web app. Users can add, edit, and remove assessments (exams, quizzes, assignments, projects), set priorities and due dates, and see them in list, kanban, or calendar views.

---

## Tech Stack (Locked In)

- **Package Manager**: Bun
- **Build Tool**: Vite
- **Framework**: React 19 + TypeScript 6 (strict mode)
- **Backend**: Convex (real-time DB + serverless functions)
- **Auth**: Better Auth via `@convex-dev/better-auth`
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (copy-paste, Radix-based)
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **State**: Convex queries only (no Zustand/Jotai/Redux)

---

## Design Direction: B · Warm Editorial

- **Background**: warm cream `#FBF8F3` / surface `#FFFEFA`
- **Accent**: forest green `#166534` (light variant `#F0FDF4`)
- **Borders**: `#E2DAD0` / `#EDE6DC`
- **Text**: `#1C1917` (primary), `#78716C` (secondary), `#A8A29E` (tertiary)
- **Typography**:
  - Display/headings: **Newsreader** italic serif
  - Body/UI: **Inter**
  - Monospace: **JetBrains Mono**
- **Aesthetic**: Minimal, no borders-only cards (use subtle borders + shadows), no left-border accent (that's slop), generous whitespace, italic serif for emotion
- **Layout pattern**: **Top floating navbar** (sticky, blurred, pill-style), no sidebar
- **Density**: Compact rows, 1500px max width, fit-in-viewport (no scroll for primary views)

---

## What's Been Done (In This Project)

### 1. Research Report → `LAEL_RESEARCH_REPORT.md`
Comprehensive deep-dive covering Vite + Convex + Better Auth setup, all the design research, and the original 3 design directions (A vs B vs C comparison).

### 2. Frontend Plan → `LAEL_FRONTEND_PLAN.md`
6-phase build plan with folder structure, Convex schema, routing strategy, component patterns, and 2-3 week effort estimate.

### 3. Design Prototype → `design-demos/`
A **working HTML prototype** that proves the visual design. Built with React + Babel in the browser (no build step). Use it as the reference for what the real app should look like.

```
design-demos/
├── shared.js         # Design system: colors, typography, Navbar, PageHeader, Modal, AddAssessmentForm, sample data (10 assessments)
├── index.html        # Page launcher hub
├── dashboard.html    # Greeting "Good morning, Léo" + Due Today spotlight + 4 stat tiles + Upcoming + Completed
├── assessments.html  # 3 views (List/Grid/Kanban) + filters + sort + search
├── calendar.html     # Full 6-week month grid, no scroll, fills viewport
└── settings.html     # 2-column layout, 6 sections (Profile/Appearance/Calendar/Notifications/Data/Account)
```

**To view locally**: `cd design-demos && bunx serve` then open `http://localhost:3000` (or run any static server). You must use a server — `file://` breaks due to CORS.

### Key Design Decisions Made
- **Page kickers removed** (no "DASHBOARD" label above page titles)
- **Personalized greeting**: `${greeting}, ${USER_NAME}` where `USER_NAME = 'Léo'`
- **Add Assessment is a modal**, not a separate page
- **Compact row pattern**: `checkbox · 40px date badge · title+meta · status pill · hover actions`
- **StatCard with 2px top accent line** in the color
- **Filled checkboxes turn green** when item is completed (with strikethrough title)
- **Calendar fills viewport**, no scroll, today highlighted with "TODAY" pill
- **Settings in 2-column grid**, all 6 sections visible at once

---

## What's Next: Phase 1 — Design System & Shared Components

**Goal**: Build the foundation components in the real Vite + React + TypeScript project that every page will use. We haven't started the real project yet — Phase 0 (project init) is the immediate next step, then Phase 1 is the components.

### Phase 0 First: Initialize the Project

```bash
# In a fresh directory (NOT in the design-demos folder)
bun create vite lael --template react-ts
cd lael

# Install runtime deps
bun add react-router-dom convex @convex-dev/better-auth better-auth
bun add lucide-react clsx tailwind-merge class-variance-authority
bun add react-hook-form @hookform/resolvers zod
bun add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover
bun add @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-toggle-group

# Install dev deps
bun add -d @types/node tailwindcss postcss autoprefixer

# Init Tailwind
bunx tailwindcss init -p

# Init shadcn/ui
bunx shadcn@latest init

# Add shadcn components we'll need
bunx shadcn@latest add button input label select textarea checkbox
bunx shadcn@latest add dialog dropdown-menu popover calendar
bunx shadcn@latest add card badge avatar separator tooltip
bunx shadcn@latest add form sonner toggle switch

# Init Convex (creates convex/ folder, asks to log in)
bunx convex dev
```

After setup, the project structure should match what's in the plan:
```
lael/
├── convex/                  # Backend
│   ├── auth.config.ts       # Better Auth config
│   ├── schema.ts            # Users + assessments tables
│   └── assessments.ts       # CRUD functions (Phase 3)
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn primitives
│   │   ├── layout/          # Navbar, PageHeader, PageContainer
│   │   ├── modals/          # AddAssessmentModal
│   │   └── common/          # EmptyState, LoadingState, ErrorBoundary
│   ├── features/
│   │   ├── auth/            # SignInForm, SignUpForm, useAuth, ProtectedRoute
│   │   ├── assessments/     # AssessmentRow, AssessmentCard, AssessmentFilters
│   │   └── calendar/        # CalendarGrid
│   ├── lib/
│   │   ├── convex.ts        # Convex client
│   │   ├── auth.ts          # Better Auth client
│   │   ├── utils.ts         # cn(), formatters
│   │   └── design-tokens.ts # Color/spacing/typography constants
│   ├── pages/               # DashboardPage, AssessmentsPage, etc.
│   ├── routes/              # Router config
│   └── main.tsx, App.tsx, index.css
```

### Phase 1 Components to Build

**Priority order** (build in this order so each builds on the last):

1. **`lib/design-tokens.ts`** — TypeScript constants for all colors, spacing, typography (mirror what's in `design-demos/shared.js`)
2. **`lib/utils.ts`** — `cn()` class merger (clsx + tailwind-merge), `formatDateBadge()`, `daysUntil()`, `isOverdue()` helpers
3. **`components/common/EmptyState.tsx`** — illustrated empty state with icon, title, description, optional action button
4. **`components/common/LoadingState.tsx`** — skeleton loaders matching the row/card layouts
5. **`components/common/ErrorBoundary.tsx`** — wraps the app, shows a fallback on error
6. **`components/layout/PageContainer.tsx`** — max-width 1500px wrapper with consistent padding
7. **`components/layout/PageHeader.tsx`** — title + subtitle + actions row (italic serif title, no kicker)
8. **`components/layout/Navbar.tsx`** — sticky top bar with logo, nav links, Add Assessment CTA, avatar
9. **`features/assessments/AssessmentRow.tsx`** — compact row with checkbox, date badge, title, type, subject, status, hover actions
10. **`features/assessments/AssessmentCard.tsx`** — grid view card with priority accent line on top
11. **`features/assessments/AssessmentFilters.tsx`** — search input + type chips + status chips
12. **`features/calendar/CalendarGrid.tsx`** — 6-week month grid with today highlight, day pills
13. **`components/modals/AddAssessmentModal.tsx`** — centered floating modal with sticky footer, 2-column form, type buttons, priority buttons

### Reference: Use the Prototype as the Source of Truth

**Open `design-demos/shared.js`** to see the exact:
- Color tokens (PALETTE object)
- Typography definitions (TYPOGRAPHY object)
- Sample assessment data (10 items in ASSESSMENTS array)
- Component implementations (Navbar, PageHeader, AssessmentRow, Modal, AddAssessmentForm)

**Open the .html files** to see the visual reference:
- `dashboard.html` for dashboard layout
- `assessments.html` for list/grid/kanban
- `calendar.html` for the calendar grid
- `settings.html` for the 2-column section pattern
- Click "Add Assessment" in any page to see the modal

The goal of Phase 1 is to **port these designs into proper React + TypeScript + Tailwind + shadcn/ui components**. The visual result should be near-identical to the prototype.

### Sample Data (for development)

Use this exact data in your components (will come from Convex later, but for now hardcode for testing):

```ts
export const SAMPLE_ASSESSMENTS = [
  { id: 1, title: 'Calculus II — Midterm Exam', type: 'exam', dueDate: '2026-06-15', priority: 'high', status: 'pending', subject: 'Mathematics', description: 'Chapters 5-8, focus on integration techniques and series convergence.' },
  { id: 2, title: 'Organic Chemistry Quiz 4', type: 'quiz', dueDate: '2026-06-16', priority: 'medium', status: 'pending', subject: 'Chemistry', description: 'Aromatic compounds, electrophilic substitution reactions.' },
  { id: 3, title: 'Data Structures Assignment', type: 'assignment', dueDate: '2026-06-17', priority: 'low', status: 'in_progress', subject: 'Computer Science', description: 'Implement balanced BST with insert, delete, traverse operations.' },
  { id: 4, title: 'Thermodynamics Project', type: 'project', dueDate: '2026-06-18', priority: 'high', status: 'pending', subject: 'Physics', description: 'Group project on heat engine efficiency analysis with simulation.' },
  { id: 5, title: 'Machine Learning Essay', type: 'assignment', dueDate: '2026-06-19', priority: 'medium', status: 'pending', subject: 'Computer Science', description: '3000-word essay on transformer architectures and attention mechanisms.' },
  { id: 6, title: 'Linear Algebra Final Exam', type: 'exam', dueDate: '2026-06-20', priority: 'urgent', status: 'pending', subject: 'Mathematics', description: 'Comprehensive final covering eigenvalues, vector spaces, linear maps.' },
  { id: 7, title: 'Physics Lab Report', type: 'assignment', dueDate: '2026-06-14', priority: 'medium', status: 'completed', subject: 'Physics', description: 'Pendulum period vs. amplitude investigation report.' },
  { id: 8, title: 'Biochemistry Quiz 3', type: 'quiz', dueDate: '2026-06-13', priority: 'low', status: 'completed', subject: 'Chemistry', description: 'Enzyme kinetics and Michaelis-Menten parameters.' },
  { id: 9, title: 'Statistics Problem Set', type: 'assignment', dueDate: '2026-06-21', priority: 'medium', status: 'pending', subject: 'Mathematics', description: 'Hypothesis testing, p-values, confidence intervals.' },
  { id: 10, title: 'Quantum Mechanics Quiz', type: 'quiz', dueDate: '2026-06-22', priority: 'high', status: 'pending', subject: 'Physics', description: 'Schrödinger equation, particle in a box, quantum tunneling.' },
];
```

### Conventions to Follow

1. **Use TypeScript strictly** — every prop typed, no `any`
2. **shadcn/ui first** — for any UI primitive (Button, Input, Dialog, etc.), use the shadcn version
3. **Tailwind for everything** — no inline styles except for dynamic values (e.g., computed pixel positions)
4. **Use the `cn()` helper** for conditional classes: `cn('base-classes', condition && 'extra-classes')`
5. **Component files use PascalCase**, utility files use camelCase
6. **One component per file** in `components/` and `features/`
7. **Use Lucide icons** (`import { IconName } from 'lucide-react'`)
8. **User-facing dates**: format with `toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })` style
9. **Colors map to Tailwind config** — use `bg-accent`, `text-text-primary`, etc., not hex codes in components
10. **No emojis in production UI** — use Lucide icons instead

### What NOT to Build in Phase 1

- ❌ Don't wire up to Convex yet (use sample data)
- ❌ Don't add auth (use a hardcoded user)
- ❌ Don't add routing yet (build components, render them in a single test page)
- ❌ Don't add dark mode yet
- ❌ Don't add keyboard shortcuts yet
- ❌ Don't add toasts/notifications yet

**Just build the components. Verify they match the prototype visually. Use sample data.**

---

## Test Your Work

After Phase 1, build a temporary `App.tsx` that renders:
- `<Navbar />`
- A `<PageHeader title="Good morning, Léo" />`
- 4 `<StatCard />` instances (with hardcoded data)
- 3 `<AssessmentRow />` instances
- 1 `<AssessmentCard />`
- An `<EmptyState />`
- A button that opens an `<AddAssessmentModal />`

Compare side-by-side with `design-demos/dashboard.html`. They should look near-identical.

---

## Reference Files (in Order of Importance)

1. **`design-demos/shared.js`** — THE source of truth for design tokens and component logic. Read this first.
2. **`design-demos/dashboard.html`** — Visual reference for dashboard layout
3. **`design-demos/assessments.html`** — Visual reference for list/grid/kanban
4. **`design-demos/calendar.html`** — Visual reference for the full-screen calendar
5. **`design-demos/settings.html`** — Visual reference for 2-column settings
6. **`LAEL_RESEARCH_REPORT.md`** — Why we chose this stack
7. **`LAEL_FRONTEND_PLAN.md`** — Full build plan (Phases 0-6)

---

## Quick Commands Reference

```bash
# Run dev server
bun run dev

# Run Convex dev (in another terminal)
bunx convex dev

# Add a shadcn component
bunx shadcn@latest add <component-name>

# Type check
bunx tsc --noEmit

# Build for production
bun run build
```

---

## My Ask

Please start with **Phase 0 (project init)** and then build **Phase 1 (design system components)**. Use the prototype (`design-demos/`) as the visual reference. Use sample data, not Convex. Match the design as closely as possible — I care about the visual fidelity.

When you're done with Phase 1, I want to be able to look at a page that uses all the components side-by-side with the prototype and see the same design.

Let me know if you have questions before starting, or just go. 🚀
