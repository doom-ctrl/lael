# Lael — Assessment Manager: Deep Research Report

## Executive Summary

Lael is a personal assessment manager web app that needs to be built with **Vite + React + TypeScript** as the frontend foundation, **Convex** as the full-stack backend (database + serverless functions), and **Better Auth** for authentication. The design should embrace a **minimal aesthetic** with a **top floating navbar**, using **Tailwind CSS + shadcn/ui** for a rich, quality UI. The recommended project structure is **feature-based**, and the data layer should use **Convex queries/mutations** instead of traditional state management libraries. **Bun** is the package manager of choice.

---

## 1. Tech Stack Analysis & Recommendations

### 1.1 Frontend: Vite + React + TypeScript ✅ Confirmed

**Why this stack is the right choice in 2025/2026:**

- **Vite 8** is the standard build tool — lightning-fast HMR, minimal config, SSR support via vinxi/vite-plugin-ssr [1]
- **React 19** brings modern features (Actions, use() hook, no more useEffect for data fetching in many cases) that reduce boilerplate [2]
- **TypeScript 6** with strict mode enabled from day one is non-negotiable for a quality project [3]

**Key Setup Commands:**
```bash
bun create vite lael --template react-ts
cd lael
bun install
```

**Vite Config for Convex SSR (if needed later):**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
export default defineConfig({
  ssr: {
    noExternal: ['@convex-dev/better-auth'],
  },
})
```

[1] [Best Practices for React.js with Vite and TypeScript](https://medium.com/@taedmonds/best-practices-for-react-js-with-vite-and-typescript-what-i-use-and-why-f4482558ed89)  
[2] [React + TypeScript Best Practices in 2025](https://dev.to/harshdeepsingh13/react-typescript-best-practices-in-2025-what-actually-matters-22dn)  
[3] [Production-Ready React + Vite + TypeScript Boilerplate](https://dev.to/singhamandeep007/building-a-production-ready-react-vite-typescript-boilerplate-architecture-choices-dx-2i7l)

---

### 1.2 Backend: Convex ✅ Strong Choice

**Why Convex is ideal for Lael:**

Convex is an all-in-one backend platform that provides a **real-time database**, **serverless functions**, **file storage**, **auth**, and **crons** — all in one TypeScript-native package. For a personal assessment manager, this eliminates the need to set up a separate database, API server, or auth service. [1]

**Key Benefits:**
- **Type-safe end-to-end**: Schema → Query/Mutation functions → React hooks, all TypeScript [2]
- **Real-time by default**: Subscriptions update UI automatically when data changes [3]
- **No separate API layer**: You write `convex/` functions, the client calls them directly with full type inference [4]
- **Free tier is generous**: 0.5 GB storage, 1-6 developers, file storage, text search, auth, crons — all free [5]

**Convex Pricing (2026):**
| Plan | Price | Developers | Storage |
|------|-------|-----------|---------|
| Free | $0 | 1-6 | 0.5 GB |
| Starter | Pay-as-you-go | 1-6 | 0.5 GB + extra |
| Professional | $25/dev/month | 1-20 | 50 GB |

For a personal app like Lael, the **Free plan is more than sufficient**. [5][6]

**Convex Schema for Lael (assessment manager):**
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  assessments: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(), // Unix timestamp
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
    subject: v.optional(v.string()),
    notes: v.optional(v.string()),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_dueDate", ["dueDate"])
    .index("by_status", ["status"]),
}).schema;
```

[1] [React Quickstart | Convex Developer Hub](https://docs.convex.dev/quickstart/react)  
[2] [End-to-end TypeScript with Convex](https://stack.convex.dev/end-to-end-ts)  
[3] [Convex Tutorial: A Chat App](https://docs.convex.dev/tutorial/)  
[4] [How to Build a CRUD Application using React and Convex](https://www.freecodecamp.org/news/build-crud-app-react-and-convex/)  
[5] [Convex Pricing](https://www.convex.dev/pricing)  
[6] [Convex Limits](https://docs.convex.dev/production/state/limits)

---

### 1.3 Authentication: Better Auth ✅ Recommended

**Why Better Auth over Clerk or Auth.js:**

Better Auth is a **TypeScript-first, framework-agnostic, self-hosted** auth library. It has first-class Convex integration, meaning your user data lives in your Convex database, not a third-party service. [1][2]

**Comparison at a Glance (2026):**
| Feature | Better Auth | Clerk | Auth.js v5 |
|---------|------------|-------|-----------|
| Type | Self-hosted library | Hosted service | Self-hosted library |
| Open Source | Yes (Apache 2.0) | No | Yes |
| Convex Integration | ✅ Native | ❌ | ❌ |
| Passkeys | ✅ First-class | ✅ | ✅ |
| 2FA | ✅ | ✅ | Plugin |
| Magic Links | ✅ | ✅ | ✅ |
| Org/Multi-tenancy | ✅ | ✅ | ✅ |
| Pricing | Free | $0-25K+/mo | Free |

Better Auth is the **clear winner** for a Convex project because:
1. Native Convex component (`@convex-dev/better-auth`) handles the database adapter, HTTP routing, and JWT/JWKS management [3]
2. Self-hosted = you own your user data
3. MIT licensed, 40+ contributors, actively maintained (last push April 2026) [4]
4. Feature-complete: OAuth, email/password, magic links, passkeys, 2FA, organizations [5]

**Setup (React Vite SPA with Bun):**
```bash
bun add convex@latest @convex-dev/better-auth better-auth@1.5.3
bunx convex dev # creates project, generates .env.local
bunx convex env set BETTER_AUTH_SECRET=$(openssl rand -hex 32)
bunx convex env set SITE_URL=http://localhost:5173
```

**Convex Auth Config:**
```typescript
// convex/auth.config.ts
import { betterAuth } from "better-auth";
import { convexAdapter } from "@convex-dev/better-auth/adapter";

export default {
  adapter: convexAdapter(),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
};
```

[1] [Better Auth vs NextAuth vs Clerk (2026)](https://apiscout.dev/guides/better-auth-vs-nextauth-vs-clerk-2026)  
[2] [Next.js Auth in 2026: Clerk vs Better Auth vs Auth.js v5](https://www.codercops.com/blog/nextjs-auth-comparison-clerk-better-auth-2026)  
[3] [Introduction | Convex + Better Auth](https://get-convex-better-auth.mintlify.app/introduction)  
[4] [get-convex/better-auth GitHub](https://github.com/get-convex/better-auth)  
[5] [Better Auth vs Clerk vs NextAuth: 2026 SaaS Showdown](https://starterpick.com/guides/better-auth-clerk-nextauth-saas-showdown-2026)

---

### 1.4 State Management: Convex + Minimal Client State

**Recommendation: Skip Redux/Zustand/Jotai for Lael**

For an assessment manager backed by Convex, you don't need a traditional state management library. Here's why and what to use instead:

| Concern | Solution | Why |
|---------|----------|-----|
| Server data (assessments) | **Convex queries** | Real-time, cached, type-safe [1] |
| UI state (modals, theme) | **React useState/useReducer** | Local scope, no global needed |
| Auth state | **Better Auth + Convex** | Handled automatically [2] |
| Form state | **React Hook Form + Zod** | Type-safe validation |

**Why not Zustand/Jotai/TanStack Query?**
- Convex **is** your server state manager. It replaces TanStack Query entirely. [1]
- Zustand/Jotai are for client-side global state — Lael has very little of that
- Using Convex queries + React signals/hooks is the modern 2026 pattern [3]

If you absolutely need client global state (e.g., a UI preferences store), use **Zustand** — it's only 1.1KB and has 5.5M weekly downloads. But for Lael, the cases should be minimal. [4]

[1] [Convex React Overview](https://docs.convex.dev/client/react/overview.md)  
[2] [Better Auth Convex Integration](https://better-auth.com/docs/integrations/convex)  
[3] [React State Management in 2026: Which Approach Actually Makes Sense](https://pristren.com/blog/react-state-management-2026/)  
[4] [State Management Complete Comparison 2025](https://www.youngju.dev/blog/culture/2026-03-24-state-management-react-zustand-jotai-2025.en)

---

### 1.5 UI Layer: Tailwind CSS + shadcn/ui

**Tailwind CSS** is the standard utility-first CSS framework. For Lael's minimal aesthetic, it provides:
- Precise control over spacing, typography, and color
- Built-in dark mode support
- JIT mode for minimal bundle size
- Excellent integration with shadcn/ui

**shadcn/ui** is a component library (not a traditional npm package) — you copy the component code into your project, giving you full ownership and customizability. It pairs perfectly with Tailwind CSS and Radix UI primitives. [1]

**Why shadcn/ui for Lael:**
- **Copy-paste ownership**: No hidden wrappers, no dependency version lock-in [2]
- **Accessible by default**: Built on Radix UI primitives (ARIA-compliant)
- **Minimal aesthetic built-in**: Card, Dialog, Dropdown Menu, Command, Calendar — all with clean, minimal styling
- **Design system ready**: Consistent tokens, typography scale, spacing system

**shadcn/ui components to use for Lael:**
| Component | Use Case |
|-----------|----------|
| `Card` | Assessment item display |
| `Dialog` | Add/Edit assessment modal |
| `Dropdown Menu` | Actions (edit, delete, duplicate) |
| `Command` | Quick search / command palette |
| `Calendar` | Due date picker |
| `Badge` | Status, priority labels |
| `Checkbox` | Mark as complete |
| `Progress` | Completion progress |
| `Toast` | Notifications |
| `Popover` | Date/time pickers |
| `Table` | Assessment list view |
| `Tabs` | View switching (list/kanban/calendar) |

**Install shadcn/ui with Bun:**
```bash
bunx shadcn@latest init
# Choose: Slate, CSS Variables: Yes, Custom: default
bunx shadcn@latest add card dialog dropdown-menu command calendar badge checkbox progress toast popover table tabs input label textarea select
```

[1] [NexUI — Beautifully designed React components](https://www.nexui.dev/)  
[2] [shadcn/ui Official](https://ui.shadcn.com/)

---

## 2. Project Structure Recommendation

**Feature-based folder structure** is the recommended approach for a scalable React project in 2025/2026. [1][2]

```
lael/
├── convex/                    # Convex backend
│   ├── auth.config.ts         # Better Auth configuration
│   ├── schema.ts             # Database schema
│   ├── assessments/          # Assessment CRUD functions
│   │   ├── list.ts           # Query: get all assessments
│   │   ├── get.ts            # Query: get single assessment
│   │   ├── create.ts         # Mutation: create assessment
│   │   ├── update.ts         # Mutation: update assessment
│   │   └── delete.ts         # Mutation: delete assessment
│   └── users.ts              # User-related functions
├── src/
│   ├── app/                  # App shell
│   │   ├── App.tsx           # Root component
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles + Tailwind
│   ├── components/
│   │   ├── ui/               # shadcn/ui components (copied)
│   │   ├── layout/           # Layout components
│   │   │   ├── Navbar.tsx    # Top floating navbar
│   │   │   └── PageContainer.tsx
│   │   └── shared/           # Shared components
│   │       ├── AssessmentCard.tsx
│   │       ├── AssessmentForm.tsx
│   │       ├── EmptyState.tsx
│   │       └── StatusBadge.tsx
│   ├── features/
│   │   ├── assessments/      # Assessment feature module
│   │   │   ├── components/  # Feature-specific components
│   │   │   ├── hooks/       # Feature hooks (useAssessments, etc.)
│   │   │   └── types.ts     # Feature types
│   │   └── auth/             # Auth feature module
│   │       ├── components/
│   │       │   ├── SignInForm.tsx
│   │       │   └── SignUpForm.tsx
│   │       └── hooks/
│   ├── lib/
│   │   ├── convex.ts         # Convex client setup
│   │   └── utils.ts         # Utility functions (cn(), etc.)
│   ├── pages/                # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── Assessments.tsx
│   │   ├── Calendar.tsx
│   │   └── Settings.tsx
│   └── router.tsx           # Client-side routing
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

**Key Architectural Decisions:**
1. **Feature-based `features/` folder**: Each feature (assessments, auth) is self-contained with its own components, hooks, and types. This makes navigation easy and feature isolation clear. [1]
2. **`components/ui/`**: shadcn/ui components live here — copied, not imported from npm
3. **`components/layout/`**: Layout-specific components (Navbar, PageContainer) are separate from business components
4. **`lib/`**: Library setup files (Convex client, utilities) — not business logic
5. **`convex/` functions**: Each function in its own file, named by operation type (list, get, create, update, delete)

[1] [React Folder Architecture](https://github.com/masaud155/react-folder-architecture)  
[2] [A Practical React Project Structure](https://dev.to/fanebytes/a-practical-react-project-structure-you-can-reuse-332e)

---

## 3. Pages & Sections Design

### 3.1 Recommended Page Structure

For a personal assessment manager with a top floating navbar, here's the recommended page hierarchy:

```
/ (Dashboard) — Main landing after login
├── /assessments — Full assessment management
│   ├── /assessments/:id — Single assessment detail
├── /calendar — Calendar view of due dates
├── /analytics — Progress stats and insights (optional, can defer)
└── /settings — User settings, theme, profile
```

### 3.2 Page-by-Page Breakdown

#### **Dashboard (/)** — The Command Center
This is the most important page. It should give a **quick status overview** without overwhelming the user.

**Sections:**
1. **Welcome Header** — Personalized greeting with today's date
2. **Quick Stats Row** — 3-4 cards: "Due Today", "Due This Week", "Completed", "Overdue"
3. **Upcoming Assessments** — Next 5-7 items due, sorted by date and priority
4. **Quick Add** — Prominent "Add Assessment" button (floating action style)
5. **Recent Activity** — Last 3-5 completed items (optional)

#### **Assessments (/assessments)** — The Full List
The main CRUD interface for managing all assessments.

**Sections:**
1. **Filter Bar** — Filter by: type (exam/quiz/assignment), status, priority, subject, date range
2. **View Toggle** — Switch between: List View, Kanban View (by status), Calendar View
3. **Search** — Command palette style (Cmd+K) for quick search
4. **Assessment Grid/List** — The main content area
5. **Add Button** — Floating or prominent CTA

**Assessment Item Fields:**
- Title (required)
- Type: Exam | Quiz | Assignment | Project | Other
- Due Date & Time
- Priority: Low | Medium | High | Urgent
- Status: Pending | In Progress | Completed | Overdue
- Subject/Course (optional)
- Description/Notes (optional)

#### **Calendar (/calendar)** — Temporal View
A calendar-based view showing assessments by due date.

**Sections:**
1. **Month/Week Toggle** — Calendar view controls
2. **Calendar Grid** — Assessments plotted on their due dates
3. **Day Detail Panel** — Click a date to see all items due that day
4. **Add from Calendar** — Click on a date to add a new assessment

#### **Settings (/settings)** — Configuration
User preferences and account management.

**Sections:**
1. **Profile** — Name, email, avatar
2. **Preferences** — Theme (light/dark/system), default view, notification settings
3. **Data** — Export data, import data (optional)

### 3.3 Navigation: Top Floating Navbar

**Design Principles (from NN/g and Smashing Magazine research):** [1][2]

The top floating navbar for Lael should:

1. **Be floating (elevated)** — Use a subtle shadow and/or backdrop blur to create depth above the content. Not a full-width header that merges with the page.

2. **Be sticky** — Remains visible as the user scrolls, so navigation is always accessible.

3. **Contain no more than 5 items** — Smashing Magazine research shows sticky bars shouldn't exceed 5 items to prevent rage taps and cognitive overload. [2]

4. **Include a dynamic hide/show** — Consider hiding the navbar on scroll down, reappearing on scroll up (optional but elegant).

5. **Have semi-transparent background** — `background: rgba(255,255,255,0.85)` with `backdrop-filter: blur(12px)` for a modern glass aesthetic.

**Recommended Navbar Items:**
| Item | Icon | Route |
|------|------|-------|
| Dashboard | 🏠 or grid icon | `/` |
| Assessments | 📋 or list icon | `/assessments` |
| Calendar | 📅 or calendar icon | `/calendar` |
| Settings | ⚙️ or gear icon | `/settings` |
| + Add | ➕ or plus icon | Opens Add dialog |

**+ CTA can be in the navbar center** — like the shadcn pill navbar pattern, with the logo/app name on the left and user avatar/sign-out on the right. [3]

**Visual Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ Lael    [Dashboard] [Assessments] [Calendar]  [+Add]  [👤] │
└─────────────────────────────────────────────────────────────┘
   ↑        ↑ floating pill/bar with backdrop blur, subtle shadow
```

[1] [Sticky Headers: 5 Ways to Make Them Better — NN/g](https://www.nngroup.com/articles/sticky-headers/)  
[2] [Designing Sticky Menus: UX Guidelines — Smashing Magazine](https://www.smashingmagazine.com/2023/05/sticky-menus-ux-guidelines/)  
[3] [Floating Pill Navbar Block — shadcn.io](https://www.shadcn.io/blocks/navbar-floating-pill)

---

## 4. UI/UX Design Direction

### 4.1 Minimal Aesthetic Principles

Based on comprehensive UX research, minimalism in 2025/2026 is **not** about stripping everything away — it's about **clarity, focus, and intentionality**. [1][2][3]

**Core Principles for Lael:**

1. **Clarity over decoration** — Every element must earn its place. If it doesn't communicate information or enable an action, remove it. [4]

2. **Strategic whitespace** — Generous padding and margins create breathing room. Whitespace isn't empty — it's a design element that reduces cognitive load. [1]

3. **Systematic visual hierarchy** — Use typography scale, color intensity, and spacing to create clear hierarchy. The eye should know where to look first. [4]

4. **Purpose-driven microinteractions** — Subtle animations (hover states, transitions, feedback) make the app feel alive and responsive without being distracting. [5]

5. **Functional color** — Use color sparingly and purposefully. One accent color for CTAs, status colors for assessment states (green=complete, red=urgent, amber=pending). [3]

6. **Maximum minimalism consideration** — Jakob Nielsen's research suggests that reducing to only interactive elements (buttons, toggles) can reduce cognitive load dramatically. Apply this selectively. [6]

### 4.2 Color Palette Recommendation

For a minimal, aesthetic assessment manager:

| Role | Color | Usage |
|------|-------|-------|
| Background | `#FAFAFA` (light) / `#0A0A0A` (dark) | Page background |
| Surface | `#FFFFFF` (light) / `#141414` (dark) | Cards, dialogs |
| Border | `#E5E5E5` (light) / `#262626` (dark) | Subtle separators |
| Text Primary | `#171717` (light) / `#FAFAFA` (dark) | Headings, body |
| Text Secondary | `#737373` | Labels, metadata |
| Accent | `#6366F1` (Indigo) or `#8B5CF6` (Violet) | CTAs, focus states |
| Success | `#22C55E` | Completed status |
| Warning | `#F59E0B` | In Progress, Medium priority |
| Danger | `#EF4444` | Overdue, Urgent priority |
| Info | `#3B82F6` | Low priority, informational |

### 4.3 Typography

- **Headings**: Inter or Geist Sans — clean, geometric, modern
- **Body**: Inter — excellent readability at small sizes
- **Monospace** (for dates, codes): JetBrains Mono or Geist Mono
- **Scale**: Use Tailwind's default scale but with custom font sizes for the app's specific needs

### 4.4 Interaction Patterns

| Pattern | Application |
|---------|-------------|
| **Command Palette** (Cmd+K) | Quick search, quick add, navigation |
| **Inline Editing** | Click title to edit in place |
| **Slide-over Panel** | Assessment detail instead of full page |
| **Toast Notifications** | Confirmations, errors, reminders |
| **Drag to reorder** | Change priority or status by dragging |
| **Checkbox to complete** | One-click completion toggle |
| **Date picker** | Calendar popover for due dates |

[1] [Principle of Minimalist UI Design: 7 Key Guidelines](https://creatypestudio.co/principle-of-minimalist-ui-design/)  
[2] [Minimalist UI Design for SaaS Products](https://uitop.design/blog/design/minimalist-ui-design/)  
[3] [Design Minimalism in 2025: Evolved, Not Extinct](https://designshack.net/articles/trends/design-minimalism/)  
[4] [Aesthetic and Minimalist Design in UX](https://uxuiprinciples.com/en/principles/aesthetic-minimalist-design)  
[5] [Minimalist UI Design for Apps](https://ambsandigital.com/minimalist-ui-design-for-apps/)  
[6] [Maximum Minimalism: The Ultimate Evolution of Intuitive Design](https://jakobnielsenphd.substack.com/p/maximum-minimalism)

---

## 5. Recommended Tech Stack Summary

| Layer | Technology | Version/Notes |
|-------|-----------|--------------|
| **Build Tool** | Vite | v8+, latest |
| **Framework** | React | v19 (latest) |
| **Language** | TypeScript | v6, strict mode |
| **Package Manager** | Bun | v1.2+, latest |
| **Backend** | Convex | Latest, Free tier sufficient |
| **Auth** | Better Auth + @convex-dev/better-auth | v1.5.3 (pinned) |
| **Routing** | React Router v7 (or TanStack Router) | File-based or component-based |
| **Styling** | Tailwind CSS | v4 with CSS variables |
| **Components** | shadcn/ui | Copy-paste, Radix primitives |
| **Forms** | React Hook Form + Zod | Type-safe validation |
| **Icons** | Lucide React | Consistent, minimal icons |
| **Animations** | Framer Motion | Optional, for microinteractions |
| **State** | Convex queries (no external lib needed) | + React useState for local |

---

## 6. Phased Development Approach

### **Phase 1: Foundation (Core MVP)**
- [ ] Bun + Vite + React + TypeScript setup
- [ ] Convex project initialization
- [ ] Better Auth integration (email/password)
- [ ] Basic schema and CRUD for assessments
- [ ] Top floating navbar with routing
- [ ] Dashboard page with assessment list
- [ ] Add/Edit/Delete assessment functionality
- [ ] Basic minimalist styling with Tailwind + shadcn/ui

### **Phase 2: Polish & Features**
- [ ] Multiple view modes (List, Kanban, Calendar)
- [ ] Search and filter functionality
- [ ] Priority and status management
- [ ] Due date notifications/reminders
- [ ] Dark mode support
- [ ] Command palette (Cmd+K)
- [ ] Microinteractions and animations

### **Phase 3: Enhancement**
- [ ] Google OAuth sign-in
- [ ] Data export/import
- [ ] Analytics/progress view
- [ ] User settings and preferences
- [ ] PWA support (optional)
- [ ] Mobile optimization

---

## 7. Key Research Sources

| # | Source | Relevance |
|---|--------|-----------|
| [1] | [React (Vite SPA) \| Convex + Better Auth](https://labs.convex.dev/better-auth/framework-guides/react) | Official setup guide |
| [2] | [Better Auth vs NextAuth vs Clerk (2026)](https://apiscout.dev/guides/better-auth-vs-nextauth-vs-clerk-2026) | Auth comparison |
| [3] | [Sticky Headers: 5 Ways to Make Them Better — NN/g](https://www.nngroup.com/articles/sticky-headers/) | Navbar UX research |
| [4] | [Principle of Minimalist UI Design: 7 Key Guidelines](https://creatypestudio.co/principle-of-minimalist-ui-design/) | Minimalist design principles |
| [5] | [Convex Pricing](https://www.convex.dev/pricing) | Pricing and limits |
| [6] | [React + TypeScript Best Practices in 2025](https://dev.to/harshdeepsingh13/react-typescript-best-practices-in-2025-what-actually-matters-22dn) | Project structure |
| [7] | [Floating Pill Navbar Block — shadcn.io](https://www.shadcn.io/blocks/navbar-floating-pill) | Navbar implementation reference |
| [8] | [React State Management in 2026](https://pristren.com/blog/react-state-management-2026/) | State management guidance |
| [9] | [Design Minimalism in 2025: Evolved, Not Extinct](https://designshack.net/articles/trends/design-minimalism/) | Modern minimalism trends |
| [10] | [shadcn/ui Blocks](https://www.shadcn.io/blocks) | Dashboard and task components |
| [11] | [Bun + Vite Guide](https://bun.com/docs/guides/ecosystem/vite) | Bun package manager commands |

---

*Report generated: June 2026*
