# Lael — Frontend Build Plan

> From prototype to production: a step-by-step plan to build Lael's frontend with Vite + React + TypeScript + Bun + Convex + Better Auth + Tailwind + shadcn/ui.

---

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Lael Stack                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────┐    ┌─────────────────────────┐     │
│  │  Vite + React 19 + TS  │    │  Convex (Backend)       │     │
│  │  (Bun package manager) │◄──►│  - Real-time DB         │     │
│  │                        │    │  - Serverless functions │     │
│  │  ┌──────────────────┐  │    │  - File storage         │     │
│  │  │ Tailwind CSS     │  │    │  - Auth integration     │     │
│  │  │ shadcn/ui        │  │    └─────────────────────────┘     │
│  │  │ React Router v7  │  │              ▲                     │
│  │  │ React Hook Form  │  │              │                     │
│  │  │ Zod validation   │  │    ┌─────────────────────────┐     │
│  │  │ Lucide icons     │  │    │  Better Auth            │     │
│  │  │ Convex React     │  │    │  (via @convex-dev/better│     │
│  │  │   hooks          │  │    │   -auth component)      │     │
│  │  └──────────────────┘  │    └─────────────────────────┘     │
│  └────────────────────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Stack

| Choice | Why |
|--------|-----|
| **Vite** | Fastest dev server, native ESM, Bun-compatible |
| **React 19** | Actions, use() hook, modern patterns |
| **TypeScript 6** | End-to-end type safety with Convex |
| **Bun** | Faster than npm/pnpm, native TS, great DX |
| **Convex** | Real-time DB + serverless + auth adapter in one |
| **Better Auth** | Open-source, self-hosted, Convex-native |
| **Tailwind 4** | CSS variables theming, no config drama |
| **shadcn/ui** | Own your components, copy-paste, Radix primitives |
| **React Router v7** | File-based routing, modern data APIs |

---

## 📁 Target Folder Structure

```
lael/
├── convex/                      # Convex backend
│   ├── _generated/             # Auto-generated types (don't edit)
│   ├── auth.config.ts          # Better Auth config
│   ├── schema.ts               # Database schema
│   ├── assessments.ts          # Assessment CRUD functions
│   ├── users.ts                # User-related queries
│   └── crons.ts                # Scheduled tasks (reminders)
│
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Root component with providers
│   ├── index.css               # Global styles + Tailwind
│   │
│   ├── components/             # Shared/reusable components
│   │   ├── ui/                 # shadcn/ui primitives (Button, Input, etc.)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── PageContainer.tsx
│   │   ├── modals/
│   │   │   └── AddAssessmentModal.tsx
│   │   └── common/
│   │       ├── EmptyState.tsx
│   │       ├── LoadingState.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── features/               # Feature-specific modules
│   │   ├── auth/
│   │   │   ├── SignInForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   ├── useAuth.ts
│   │   │   └── ProtectedRoute.tsx
│   │   ├── assessments/
│   │   │   ├── AssessmentRow.tsx
│   │   │   ├── AssessmentCard.tsx
│   │   │   ├── AssessmentForm.tsx
│   │   │   ├── AssessmentFilters.tsx
│   │   │   └── useAssessments.ts
│   │   └── calendar/
│   │       ├── CalendarGrid.tsx
│   │       └── useCalendarData.ts
│   │
│   ├── lib/                    # Library setup & utilities
│   │   ├── convex.ts           # Convex client + hooks
│   │   ├── auth.ts             # Better Auth client config
│   │   ├── utils.ts            # cn(), formatters, helpers
│   │   └── design-tokens.ts    # Colors, spacing, typography
│   │
│   ├── pages/                  # Route components
│   │   ├── DashboardPage.tsx
│   │   ├── AssessmentsPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── SignInPage.tsx
│   │   ├── SignUpPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── routes/                 # Route definitions
│   │   └── index.tsx
│   │
│   └── types/                  # Shared TypeScript types
│       ├── assessment.ts
│       └── user.ts
│
├── public/                     # Static assets
│   ├── favicon.svg
│   └── og-image.png
│
├── .env.local                  # Local secrets (gitignored)
├── .env.example                # Template for team
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── components.json             # shadcn/ui config
└── README.md
```

### Why Feature-Based

Each feature (`auth/`, `assessments/`, `calendar/`) is self-contained with its own components, hooks, and types. This makes it:
- **Easy to delete** a feature without breaking the app
- **Easy to test** in isolation
- **Easy to navigate** — everything related lives together
- **Scalable** — new features just get a new folder

---

## 🎨 Design System Setup

### Step 1: Tailwind Config with Custom Tokens

Map our design tokens to Tailwind:

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cream/warm backgrounds
        bg: { DEFAULT: '#FBF8F3', warm: '#F5F0E8' },
        surface: { DEFAULT: '#FFFEFA', alt: '#F5F0E8' },
        border: { DEFAULT: '#E2DAD0', light: '#EDE6DC' },
        
        // Text
        text: { 
          primary: '#1C1917', 
          secondary: '#78716C', 
          tertiary: '#A8A29E' 
        },
        
        // Forest green accent
        accent: { 
          DEFAULT: '#166534',
          hover: '#14532D',
          light: '#F0FDF4',
          border: '#BBF7D0',
        },
        
        // Status colors
        success: { DEFAULT: '#15803D', light: '#F0FDF4' },
        warning: { DEFAULT: '#B45309', light: '#FFFBEB' },
        danger:  { DEFAULT: '#B91C1C', light: '#FEF2F2' },
        info:    { DEFAULT: '#1D4ED8', light: '#EFF6FF' },
        purple:  { DEFAULT: '#7C3AED', light: '#FAF5FF' },
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '4px', 'md': '6px', 'lg': '8px', 'xl': '10px', '2xl': '12px', '3xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 4px rgba(28,25,23,0.05)',
        'md': '0 4px 16px rgba(28,25,23,0.08)',
        'lg': '0 12px 40px rgba(28,25,23,0.10)',
        'xl': '0 24px 80px rgba(28,25,23,0.25)',
      },
    },
  },
}
```

### Step 2: shadcn/ui Setup

```bash
# Initialize shadcn (style: new-york or default)
bunx shadcn@latest init

# Add components we need
bunx shadcn@latest add button input label select textarea checkbox
bunx shadcn@latest add dialog dropdown-menu popover calendar
bunx shadcn@latest add card badge avatar separator tooltip
bunx shadcn@latest add form sonner toggle switch
```

### Step 3: Custom Components to Build

shadcn/ui doesn't have these — we need to build them:

- **CompactRow** (assessment item row with date badge, status pill)
- **AssessmentCard** (grid view card)
- **KanbanCard** (kanban view card)
- **StatCard** (dashboard stats)
- **PageHeader** (page title + actions)
- **Navbar** (top floating bar)
- **AddAssessmentModal** (the floating modal)
- **EmptyState** (no items)
- **LoadingState** (skeletons)
- **ToggleSwitch** (iOS-style)

---

## 🗄️ Database Schema (Convex)

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    timezone: v.optional(v.string()),
    weekStart: v.optional(v.union(v.literal("sunday"), v.literal("monday"))),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("auto"))),
    defaultView: v.optional(v.union(v.literal("list"), v.literal("grid"), v.literal("kanban"))),
    emailNotifications: v.optional(v.boolean()),
    reminderTiming: v.optional(v.string()),
  }).index("by_email", ["email"]),

  assessments: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    subject: v.optional(v.string()),
    type: v.union(
      v.literal("exam"),
      v.literal("quiz"),
      v.literal("assignment"),
      v.literal("project"),
      v.literal("other")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("overdue")
    ),
    dueDate: v.number(), // Unix timestamp
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_dueDate", ["userId", "dueDate"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_type", ["userId", "type"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId"],
    }),
});
```

---

## 🛣️ Routing Strategy

Use **React Router v7** with this structure:

```tsx
// src/routes/index.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "@/App";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "sign-in", element: <SignInPage /> },
      { path: "sign-up", element: <SignUpPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "assessments", element: <AssessmentsPage /> },
          { path: "calendar", element: <CalendarPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
```

---

## 🧩 Component Patterns

### Pattern 1: Convex Hooks for Data

```tsx
// src/features/assessments/useAssessments.ts
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function useAssessments(filters?: { type?: string; status?: string }) {
  return useQuery(api.assessments.list, { ...filters });
}
```

### Pattern 2: Form with React Hook Form + Zod

```tsx
// src/features/assessments/AssessmentForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  type: z.enum(["exam", "quiz", "assignment", "project", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: z.string().min(1, "Due date is required"),
  subject: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function AssessmentForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... */}
    </form>
  );
}
```

### Pattern 3: Modal as a Controlled Component

```tsx
// Using Radix Dialog (which shadcn/ui wraps)
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Assessment</DialogTitle>
    </DialogHeader>
    <AssessmentForm onSubmit={handleSave} />
    <DialogFooter>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button type="submit" form="assessment-form">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Pattern 4: Protected Routes

```tsx
// src/features/auth/ProtectedRoute.tsx
import { useConvexAuth } from "convex/react";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  
  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/sign-in" replace />;
  
  return <Outlet />;
}
```

---

## 🚀 Phased Build Plan

### **Phase 0: Project Initialization** (~1 day)

```bash
# 1. Create the project
bun create vite lael --template react-ts
cd lael

# 2. Install core dependencies
bun install
bun add react-router-dom convex @convex-dev/better-auth better-auth

# 3. Install dev dependencies
bun add -d @types/node tailwindcss postcss autoprefixer
bun add -d @tanstack/react-query  # optional, for non-Convex data

# 4. Install UI dependencies
bun add lucide-react clsx tailwind-merge class-variance-authority
bun add react-hook-form @hookform/resolvers zod
bun add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover
bun add @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-toggle-group

# 5. Initialize Tailwind
bunx tailwindcss init -p

# 6. Initialize shadcn/ui
bunx shadcn@latest init

# 7. Add shadcn components
bunx shadcn@latest add button input label select textarea checkbox
bunx shadcn@latest add dialog dropdown-menu popover calendar
bunx shadcn@latest add card badge avatar separator tooltip
bunx shadcn@latest add form sonner toggle switch

# 8. Initialize Convex
bunx convex dev
# This creates the convex/ folder and asks you to log in
```

**Setup tasks:**
- [ ] Configure `vite.config.ts` for path aliases (`@/`)
- [ ] Set up `tsconfig.json` with strict mode + path aliases
- [ ] Configure Tailwind with design tokens
- [ ] Add Google Fonts (Newsreader + Inter + JetBrains Mono) or use `@fontsource`
- [ ] Create `lib/design-tokens.ts` with all colors/typography
- [ ] Set up Convex environment variables in `.env.local`
- [ ] Set up Better Auth environment variables

---

### **Phase 1: Design System & Shared Components** (~2-3 days)

Build the foundation that every page will use.

- [ ] `components/layout/Navbar.tsx` — sticky top bar with logo, nav, Add CTA, avatar
- [ ] `components/layout/PageHeader.tsx` — title + subtitle + actions row
- [ ] `components/layout/PageContainer.tsx` — max-width wrapper
- [ ] `components/common/EmptyState.tsx` — when there's no data
- [ ] `components/common/LoadingState.tsx` — skeleton loaders
- [ ] `components/common/ErrorBoundary.tsx` — graceful error handling
- [ ] `features/assessments/AssessmentRow.tsx` — compact list item
- [ ] `features/assessments/AssessmentCard.tsx` — grid view card
- [ ] `features/assessments/AssessmentFilters.tsx` — type/status chips
- [ ] `features/calendar/CalendarGrid.tsx` — month grid (will need iteration)
- [ ] `components/modals/AddAssessmentModal.tsx` — the floating modal
- [ ] `lib/utils.ts` — `cn()` class merger, formatters (date, days until)

**Test:** Build a dummy page that renders the Navbar, a PageHeader, an empty state, and a few hardcoded AssessmentRows. Visual parity with the prototype.

---

### **Phase 2: Auth & User Management** (~2 days)

- [ ] Set up Better Auth schema in Convex (`convex/auth.config.ts`)
- [ ] Configure Better Auth client (`lib/auth.ts`)
- [ ] Create AuthProvider context (`features/auth/AuthProvider.tsx`)
- [ ] Build `SignInPage` and `SignUpPage` (minimal, focused)
- [ ] Build `useAuth` hook for accessing current user
- [ ] Build `ProtectedRoute` wrapper
- [ ] Create `users` table + sync logic (Better Auth → Convex users)
- [ ] Add sign-out functionality
- [ ] Handle auth state loading (full-page spinner)

**Test:** Sign up, sign in, sign out, refresh while authenticated, redirect to sign-in when not.

---

### **Phase 3: Core CRUD — Assessments** (~3-4 days)

This is the heart of the app.

- [ ] Define Convex schema (already in Phase 0 setup)
- [ ] `convex/assessments.ts` — list, get, create, update, delete mutations
- [ ] `convex/assessments.ts` — listByMonth for calendar
- [ ] `convex/assessments.ts` — markComplete toggle
- [ ] `features/assessments/useAssessments.ts` — query hooks with filters
- [ ] Wire up `DashboardPage` to real data
  - Greeting based on user's name + time
  - Due Today spotlight (first item due today)
  - 4 stat tiles
  - Upcoming list (next N pending)
  - Recently Completed
- [ ] Wire up `AssessmentsPage`
  - List/Grid/Kanban views (all using same data)
  - Search + type + status filters
  - Sort dropdown
  - Mark complete checkbox
- [ ] Wire up `AddAssessmentModal`
  - React Hook Form + Zod
  - Convex mutation on submit
  - Optimistic updates for instant feel
  - Error handling with toast
- [ ] Edit assessment (reuse modal in edit mode)
- [ ] Delete assessment (with confirmation)
- [ ] Empty state when no assessments

**Test:** Add/edit/delete/mark-complete assessments, verify real-time updates across tabs.

---

### **Phase 4: Calendar & Settings** (~2-3 days)

- [ ] `CalendarPage` — full month grid with real data
  - Highlight today
  - Show assessments per day as pills
  - Click day to expand
  - Month navigation
- [ ] `SettingsPage` — 2-column section layout
  - Profile: name, email, avatar (read from Convex)
  - Preferences: theme, default view, week start
  - Notifications: email reminders, reminder timing
  - Data: export JSON/CSV
  - Account: sign out, delete account
- [ ] Persist settings to Convex users table
- [ ] Apply theme (light/dark) using `next-themes` or custom hook
- [ ] Add dark mode (warm dark palette: dark backgrounds, light cream text)
- [ ] Update navbar avatar from real user data

**Test:** Calendar reflects new assessments in real-time. Settings persist across sessions.

---

### **Phase 5: Polish & Real-time** (~2 days)

- [ ] Optimistic UI updates (mark complete → instant feedback, sync in background)
- [ ] Loading states everywhere (skeletons, not spinners)
- [ ] Error states with retry buttons
- [ ] Toast notifications (success, error, info) using `sonner`
- [ ] Keyboard shortcuts (Cmd+K for search, N for new, Esc to close modal)
- [ ] Search command palette (using `cmdk` from shadcn)
- [ ] Smooth page transitions
- [ ] Form validation feedback (inline errors)
- [ ] Date picker polish (custom styling to match design)
- [ ] Empty states for calendar, dashboard, etc.
- [ ] Mobile responsive (the prototype is desktop-first — adapt)

**Test:** Lighthouse audit, performance check, accessibility scan (axe).

---

### **Phase 6: Deployment** (~1-2 days)

- [ ] Set up Convex production deployment (`bunx convex deploy`)
- [ ] Set up Vercel (or Netlify/Cloudflare Pages) for frontend
- [ ] Configure environment variables in hosting platform
- [ ] Set up custom domain (optional)
- [ ] Set up Convex scheduled functions (cron) for:
  - Daily reminder emails (using Resend or similar)
  - Auto-marking overdue items
- [ ] Add PWA manifest + service worker (optional, for install prompt)
- [ ] Analytics (Plausible or PostHog, optional)
- [ ] Error monitoring (Sentry, optional)

---

## 📊 Effort Estimate

| Phase | Days | Cumulative |
|-------|------|-----------|
| Phase 0: Setup | 1 | 1 day |
| Phase 1: Design system | 2-3 | 3-4 days |
| Phase 2: Auth | 2 | 5-6 days |
| Phase 3: Core CRUD | 3-4 | 8-10 days |
| Phase 4: Calendar & Settings | 2-3 | 10-13 days |
| Phase 5: Polish | 2 | 12-15 days |
| Phase 6: Deploy | 1-2 | 13-17 days |

**Total: ~2-3 weeks for an MVP**, ~3-4 weeks for polished production-ready.

---

## 🔑 Key Technical Decisions

### 1. **Convex for Everything Server**
No separate API server. Convex queries/mutations ARE the API. React hooks are auto-generated types.

### 2. **No Client State Management Library**
- Server state → Convex queries (real-time, cached, type-safe)
- UI state → React useState/useReducer
- Form state → React Hook Form
- Auth state → Convex auth helpers

Don't add Zustand/Jotai/Redux unless you hit a real need.

### 3. **shadcn/ui Not MUI/Chakra**
shadcn/ui gives you the source code — no dependency, fully customizable. We already have a design system to follow.

### 4. **TanStack Query — Optional**
Convex has its own real-time query system. TanStack Query is for non-Convex data (3rd party APIs). Skip unless needed.

### 5. **File-Based Routing — Optional**
React Router v7 has file-based routing via `@react-router/fs-routes` if you want it. Otherwise, manual routes are fine for a small app.

### 6. **Testing Strategy**
- **Unit**: Vitest for utility functions, hooks
- **Component**: React Testing Library for key components
- **E2E**: Playwright for critical flows (sign up, add assessment, mark complete)
- Skip exhaustive tests for Phase 0-4. Add in Phase 5.

### 7. **Performance**
- Lazy load routes with `React.lazy`
- Use Convex's automatic request batching
- Optimize images (use Convex file storage, not imgur)
- Lighthouse score > 90

### 8. **Accessibility**
- shadcn/ui is built on Radix (ARIA-compliant)
- Add focus management in modals
- Keyboard navigation for calendar
- Screen reader labels for icon buttons

---

## 🛡️ Risk Areas & Mitigations

| Risk | Mitigation |
|------|-----------|
| Convex schema changes require migrations | Plan schema carefully upfront; use Convex's `revalidations` |
| Better Auth + Convex integration is new | Follow the official docs, build auth early (Phase 2) to find issues |
| Calendar performance with many items | Limit pills per cell, add "+N more", virtualize if needed |
| Real-time updates can be jarring | Use subtle animations, not jarring refreshes |
| Date/time zone bugs | Store UTC timestamps, render in user's timezone |
| Form validation edge cases | Use Zod schemas everywhere, test with edge cases |
| Dark mode contrast issues | Use proper light/dark tokens, test in both modes |

---

## 📚 Learning Resources

- [Vite docs](https://vite.dev/)
- [Convex docs](https://docs.convex.dev/)
- [Better Auth + Convex](https://labs.convex.dev/better-auth/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Hook Form + Zod](https://react-hook-form.com/)

---

## 🎯 Definition of Done

The MVP is "done" when:

- [ ] User can sign up, sign in, sign out
- [ ] User can add, edit, delete, mark complete assessments
- [ ] All 4 main pages work (Dashboard, Assessments, Calendar, Settings)
- [ ] Data persists across sessions and devices (real-time)
- [ ] Add modal works from any page
- [ ] Filters and views work on assessments page
- [ ] Calendar shows assessments by due date
- [ ] Settings persist
- [ ] App is responsive on mobile (basic)
- [ ] Lighthouse accessibility score > 90
- [ ] Deployed to production with custom domain (optional)

---

## 🚦 How to Start

**Right now, the next step is Phase 0**:

```bash
bun create vite lael --template react-ts
cd lael
bun install
```

Then follow the rest of Phase 0 in order. Once setup is done, we'll have a clean Vite + React + TypeScript project ready to start building.

Let me know when you want to start! 🚀
