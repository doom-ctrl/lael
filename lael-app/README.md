# Lael

Personal assessment/exam manager. Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui (manual) + Convex (Phase 3) + Better Auth (Phase 2).

## Status: **Phase 1 — Complete ✅**

Phase 0 (project init) and Phase 1 (component library + 4 pages) are done. The app currently runs all 4 pages from the prototype (`design-demos/*.html`) with sample data.

## Scripts

```bash
bun dev         # Start dev server (http://localhost:5173)
bun run build   # Type-check + production build
bun run typecheck
bun run preview # Preview production build
```

## Pages

| Route         | Page              | Mirrors prototype                |
| ------------- | ----------------- | -------------------------------- |
| `/`           | DashboardPage     | `design-demos/dashboard.html`    |
| `/assessments`| AssessmentsPage   | `design-demos/assessments.html`  |
| `/calendar`   | CalendarPage      | `design-demos/calendar.html`     |
| `/settings`   | SettingsPage      | `design-demos/settings.html`     |
| `*`           | 404 fallback      | —                                |

The Add Assessment modal is mounted once at the App root via `AddAssessmentDialogProvider` — the Navbar's CTA opens it from any page.

## Folder layout

```
src/
├── main.tsx                              # Entry point
├── App.tsx                               # Root shell: ErrorBoundary + DialogProvider + Router
├── index.css                             # Tailwind v4 + design tokens (@theme block)
│
├── components/
│   ├── ui/                               # shadcn-style primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   ├── layout/
│   │   ├── Navbar.tsx                    # Sticky, blur, scroll-aware
│   │   ├── PageContainer.tsx             # max-w 1500, optional fillHeight
│   │   └── PageHeader.tsx                # Italic serif title, no kicker
│   ├── common/
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingState.tsx (+ Skeleton, LoadingCards)
│   │   ├── SegmentedControl.tsx
│   │   ├── SettingsSection.tsx (+ SettingsRow)
│   │   ├── SortSelect.tsx
│   │   ├── StatCard.tsx
│   │   ├── Toggle.tsx                    # iOS-style switch
│   │   └── ViewToggle.tsx                # List/Grid/Kanban segmented control
│   └── modals/
│       ├── AddAssessmentModal.tsx
│       └── AddAssessmentDialogProvider.tsx  # Global dialog context
│
├── features/
│   ├── assessments/
│   │   ├── AssessmentCard.tsx            # grid view (3px top priority line)
│   │   ├── AssessmentFilters.tsx         # search + chips (sticky variant)
│   │   ├── AssessmentRow.tsx             # list view
│   │   └── KanbanCard.tsx                # kanban column card
│   └── calendar/
│       └── CalendarGrid.tsx              # 6-week month view, today highlight
│
├── lib/
│   ├── design-tokens.ts                  # PALETTE, enums, per-type/priority/status style maps
│   ├── sample-data.ts                    # 10 demo assessments + SAMPLE_USER
│   └── utils.ts                          # cn(), formatDateBadge, daysUntil, isOverdue, …
│
├── pages/
│   ├── DashboardPage.tsx
│   ├── AssessmentsPage.tsx               # 3 views (List/Grid/Kanban) + filters + sort + search
│   ├── CalendarPage.tsx                  # Full 6-week grid, month nav, Today button
│   └── SettingsPage.tsx                  # 2-col grid of 6 sections
│
└── routes/
    └── index.tsx                         # createBrowserRouter config
```

## Design system (Direction B: Warm Editorial)

- Background: `#FBF8F3` cream
- Surface: `#FFFEFA` paper
- Accent: forest green `#166534` (light `#F0FDF4`)
- Borders: `#E2DAD0` (default) / `#EDE6DC` (light)
- Display: **Newsreader** italic serif
- Body: **Inter**
- Mono: **JetBrains Mono**

All design tokens live in:
- `src/index.css` (Tailwind v4 `@theme` block → exposes `bg-bg`, `text-accent`, `border-border`, `border-border-light`, etc.)
- `src/lib/design-tokens.ts` (typed constants + style maps for inline styles + shared `Assessment` type)

## What's not wired up yet (per the phase plan)

- Convex backend (no `convex/` folder yet)
- Better Auth (no login page, hardcoded `SAMPLE_USER`)
- Real CRUD (uses `SAMPLE_ASSESSMENTS`)
- Dark mode (theme toggle is a UI placeholder only)
- Keyboard shortcuts, toasts/notifications

## Next phase

**Phase 2**: Set up Convex + Better Auth, add a `SignInPage` and `SignUpPage`, wrap protected routes in a `ProtectedRoute` guard, and replace `SAMPLE_USER` with the real authenticated user.

**Phase 3**: Define the Convex schema, wire up `useQuery`/`useMutation` for assessment CRUD, replace sample data with live queries.
