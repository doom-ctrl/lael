# Graph Report - .  (2026-06-19)

## Corpus Check
- 142 files · ~64,151 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 584 nodes · 649 edges · 77 communities (52 shown, 25 thin omitted)
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 117 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Auth & Convex Components|Auth & Convex Components]]
- [[_COMMUNITY_Convex DB & Schema|Convex DB & Schema]]
- [[_COMMUNITY_Convex QueryMutation API|Convex Query/Mutation API]]
- [[_COMMUNITY_Dev Dependencies (package.json)|Dev Dependencies (package.json)]]
- [[_COMMUNITY_TypeScript App Config|TypeScript App Config]]
- [[_COMMUNITY_App Dependencies|App Dependencies]]
- [[_COMMUNITY_Assessment Cards & Rows|Assessment Cards & Rows]]
- [[_COMMUNITY_Shadcn Alias Config|Shadcn Alias Config]]
- [[_COMMUNITY_TypeScript Node Config|TypeScript Node Config]]
- [[_COMMUNITY_UI Common Components|UI Common Components]]
- [[_COMMUNITY_TypeScript Root Config|TypeScript Root Config]]
- [[_COMMUNITY_Settings & Export|Settings & Export]]
- [[_COMMUNITY_Assessment Hooks|Assessment Hooks]]
- [[_COMMUNITY_Performance Audit Skills|Performance Audit Skills]]
- [[_COMMUNITY_Skill Icon Assets|Skill Icon Assets]]
- [[_COMMUNITY_Add Assessment Form|Add Assessment Form]]
- [[_COMMUNITY_Error Boundary|Error Boundary]]
- [[_COMMUNITY_Global Shortcuts|Global Shortcuts]]
- [[_COMMUNITY_Performance Patterns|Performance Patterns]]
- [[_COMMUNITY_Theme & Preferences Hooks|Theme & Preferences Hooks]]
- [[_COMMUNITY_Calendar Grid|Calendar Grid]]
- [[_COMMUNITY_Dialog & Calendar|Dialog & Calendar]]
- [[_COMMUNITY_Auth Pages|Auth Pages]]
- [[_COMMUNITY_Shadcn Dialog|Shadcn Dialog]]
- [[_COMMUNITY_Shadcn Popover|Shadcn Popover]]
- [[_COMMUNITY_Convex Skills Router|Convex Skills Router]]
- [[_COMMUNITY_Design System & Fonts|Design System & Fonts]]
- [[_COMMUNITY_Navbar|Navbar]]
- [[_COMMUNITY_Shadcn Card|Shadcn Card]]
- [[_COMMUNITY_Assessment Filters|Assessment Filters]]
- [[_COMMUNITY_SignIn Form|SignIn Form]]
- [[_COMMUNITY_SignUp Form|SignUp Form]]
- [[_COMMUNITY_Convex Quickstart Templates|Convex Quickstart Templates]]
- [[_COMMUNITY_Loading States|Loading States]]
- [[_COMMUNITY_Settings Section|Settings Section]]
- [[_COMMUNITY_Sort Select|Sort Select]]
- [[_COMMUNITY_View Toggle|View Toggle]]
- [[_COMMUNITY_Advanced Component Patterns|Advanced Component Patterns]]
- [[_COMMUNITY_Brand Assets & Icons|Brand Assets & Icons]]
- [[_COMMUNITY_Page Transition|Page Transition]]
- [[_COMMUNITY_Segmented Control|Segmented Control]]
- [[_COMMUNITY_Stat Card|Stat Card]]
- [[_COMMUNITY_Component API Wrappers|Component API Wrappers]]
- [[_COMMUNITY_Schema Migration Patterns|Schema Migration Patterns]]
- [[_COMMUNITY_Convex Migrations Component|Convex Migrations Component]]
- [[_COMMUNITY_Assessments Page|Assessments Page]]
- [[_COMMUNITY_Button Component|Button Component]]
- [[_COMMUNITY_Empty State|Empty State]]
- [[_COMMUNITY_Toggle Component|Toggle Component]]
- [[_COMMUNITY_Page Container|Page Container]]
- [[_COMMUNITY_Page Header|Page Header]]
- [[_COMMUNITY_App Router|App Router]]
- [[_COMMUNITY_App Root|App Root]]
- [[_COMMUNITY_TSConfig References|TSConfig References]]
- [[_COMMUNITY_Assessment Types|Assessment Types]]
- [[_COMMUNITY_Convex Config|Convex Config]]
- [[_COMMUNITY_Auth Client|Auth Client]]
- [[_COMMUNITY_Convex Client|Convex Client]]
- [[_COMMUNITY_Dev vs Prod|Dev vs Prod]]
- [[_COMMUNITY_Auth Core Pattern|Auth Core Pattern]]
- [[_COMMUNITY_Clerk Provider|Clerk Provider]]
- [[_COMMUNITY_Input Component|Input Component]]
- [[_COMMUNITY_Label Component|Label Component]]
- [[_COMMUNITY_Textarea Component|Textarea Component]]
- [[_COMMUNITY_Vercel Config|Vercel Config]]
- [[_COMMUNITY_AI Guidelines|AI Guidelines]]
- [[_COMMUNITY_AI Guidelines|AI Guidelines]]
- [[_COMMUNITY_Convex Dev CLI|Convex Dev CLI]]
- [[_COMMUNITY_Hybrid Components|Hybrid Components]]
- [[_COMMUNITY_Packaged Components|Packaged Components]]
- [[_COMMUNITY_Convex Doctor|Convex Doctor]]
- [[_COMMUNITY_Auth0 Provider|Auth0 Provider]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 47 edges
2. `compilerOptions` - 21 edges
3. `compilerOptions` - 16 edges
4. `compilerOptions` - 14 edges
5. `convex-create-component Skill` - 13 edges
6. `Lael App` - 10 edges
7. `useAuth()` - 9 edges
8. `convex-migration-helper Skill` - 9 edges
9. `convex-performance-audit Skill` - 9 edges
10. `convex-setup-auth Skill` - 9 edges

## Surprising Connections (you probably didn't know these)
- `EmptyState()` --calls--> `cn()`  [INFERRED]
  src/components/common/EmptyState.tsx → src/lib/utils.ts
- `Skeleton()` --calls--> `cn()`  [INFERRED]
  src/components/common/LoadingState.tsx → src/lib/utils.ts
- `LoadingState()` --calls--> `cn()`  [INFERRED]
  src/components/common/LoadingState.tsx → src/lib/utils.ts
- `SegmentedControl()` --calls--> `cn()`  [INFERRED]
  src/components/common/SegmentedControl.tsx → src/lib/utils.ts
- `SettingsSection()` --calls--> `cn()`  [INFERRED]
  src/components/common/SettingsSection.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Lael Tech Stack** — lael_app, readme_vite, readme_react19, readme_typescript, readme_tailwindv4, readme_shadcn, readme_convex, readme_betterauth [EXTRACTED 1.00]
- **Convex Skills Ecosystem** — convex_router, convex_quickstart, convex_setupauth, convex_createcomponent, convex_migrationhelper, convex_performanceaudit, convex_ai_files_install [EXTRACTED 1.00]
- **Convex Auth Providers** — setupauth_convexauth, setupauth_clerk, setupauth_workosauthkit, setupauth_auth0 [EXTRACTED 1.00]
- **Convex Performance Problem Classes** — performance_hotpath, performance_occconflicts, performance_subscriptioncost, performance_functionbudget [EXTRACTED 1.00]
- **Zero-Downtime Migration Strategies** — migrationhelper_dualwrite, migrationhelper_dualread, migrationhelper_onlinemigrations [EXTRACTED 0.85]
- **Convex Skill Suite** — convex_skill, convex_quickstart_skill, convex_setup_auth_skill, convex_create_component_skill, convex_migration_helper_skill, convex_performance_audit_skill [EXTRACTED 1.00]
- **Component Shape Options** — local_components_reference, packaged_components_reference, hybrid_components_reference [EXTRACTED 1.00]
- **Convex Auth Provider Options** — convex_auth_concept, clerk_concept, workos_authkit_concept, auth0_concept [EXTRACTED 1.00]
- **Convex Skill Icon Family** — convex_create_component_icon, convex_migration_helper_icon, convex_performance_audit_icon, convex_quickstart_icon, convex_setup_auth_icon [EXTRACTED 1.00]

## Communities (77 total, 25 thin omitted)

### Community 0 - "Auth & Convex Components"
Cohesion: 0.09
Nodes (36): Advanced Component Patterns, App Wrapper, Auth0, Auth0 Convex Setup, Auth Providers, Clerk, Clerk Convex Setup, Component Boundary (+28 more)

### Community 1 - "Convex DB & Schema"
Cohesion: 0.06
Nodes (27): AssessmentId, counts, create, get, list, listByMonth, markComplete, priorityV (+19 more)

### Community 2 - "Convex Query/Mutation API"
Cohesion: 0.07
Nodes (33): Convex Database (ctx.db), Convex Mutation Function Pattern, Convex Query Function Pattern, app.use() Installation, defineComponent, Local Component Shape, Lael App, ConvexProvider Wiring (+25 more)

### Community 3 - "Dev Dependencies (package.json)"
Cohesion: 0.07
Nodes (26): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, tailwindcss, @tailwindcss/postcss (+18 more)

### Community 4 - "TypeScript App Config"
Cohesion: 0.08
Nodes (24): compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib, module (+16 more)

### Community 5 - "App Dependencies"
Cohesion: 0.08
Nodes (24): dependencies, better-auth, class-variance-authority, clsx, cmdk, convex, @convex-dev/better-auth, @hookform/resolvers (+16 more)

### Community 6 - "Assessment Cards & Rows"
Cohesion: 0.14
Nodes (15): AssessmentCard(), AssessmentCardProps, AssessmentRow(), AssessmentRowProps, KanbanCard(), KanbanCardProps, daysUntil(), DEMO_TODAY (+7 more)

### Community 7 - "Shadcn Alias Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 8 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 9 - "UI Common Components"
Cohesion: 0.16
Nodes (12): FullPageSpinner(), AuthLayout(), cn(), Toaster(), Command(), CommandGroup(), CommandInput(), CommandItem() (+4 more)

### Community 10 - "TypeScript Root Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+8 more)

### Community 11 - "Settings & Export"
Cohesion: 0.18
Nodes (8): assessmentToCSVRow(), buildCSVExport(), buttonClass, CSV_HEADER, csvCell(), dangerButtonClass, inputClass, TIMEZONE_OPTIONS

### Community 12 - "Assessment Hooks"
Cohesion: 0.23
Nodes (9): AssessmentId, useAssessmentCounts(), useAssessmentMutations(), useAssessments(), useDashboardData(), getGreeting(), AddAssessmentModal(), DashboardPage() (+1 more)

### Community 13 - "Performance Audit Skills"
Cohesion: 0.32
Nodes (12): convex-performance-audit OpenAI Agent Config, convex-performance-audit Skill, Denormalization, Digest Table, Function Budget Rules, Hot Path Rules, OCC Conflict Resolution, Optimistic Concurrency Control (+4 more)

### Community 14 - "Skill Icon Assets"
Cohesion: 0.22
Nodes (11): Arrow Path Icon (migration/sync symbol), Sparkles Icon (convex-create-component), Arrow Path Icon (convex-migration-helper), CPU Chip Icon (convex-performance-audit), Play Target Icon (convex-quickstart), Lock Icon (convex-setup-auth), CPU Chip Icon (performance/compute symbol), Heroicons Outlined Style (skill icons) (+3 more)

### Community 15 - "Add Assessment Form"
Cohesion: 0.20
Nodes (8): AddAssessmentFormValues, AddAssessmentModalProps, AddAssessmentMode, defaults(), Field(), FormErrors, formSchema, todayDateStr()

### Community 16 - "Error Boundary"
Cohesion: 0.20
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 17 - "Global Shortcuts"
Cohesion: 0.24
Nodes (6): useGlobalShortcuts(), CommandPaletteContext, CommandPaletteContextValue, useCommandPalette(), useCommandPaletteHotkey(), GlobalShortcuts()

### Community 18 - "Performance Patterns"
Cohesion: 0.24
Nodes (10): Aggregate Component (@convex-dev/aggregate), npx convex insights --details, Denormalization, Digest Tables, Function Budget, Hot Path Rules, Push Filters to Storage (Indexes), OCC Conflict Resolution (+2 more)

### Community 19 - "Theme & Preferences Hooks"
Cohesion: 0.27
Nodes (7): useTheme(), useDefaultView(), UserPreferencesDoc, useThemePreference(), useUserPreferences(), useWeekStart(), ThemeProvider()

### Community 20 - "Calendar Grid"
Cohesion: 0.25
Nodes (7): CalendarGrid(), CalendarGridProps, DayCell, dayHeaders(), DAYS_FULL, DAYS_SHORT, MONTHS

### Community 21 - "Dialog & Calendar"
Cohesion: 0.25
Nodes (6): useAssessmentsByMonth(), AddAssessmentDialogContext, AddAssessmentDialogContextValue, DialogState, useAddAssessmentDialog(), CalendarPage()

### Community 22 - "Auth Pages"
Cohesion: 0.32
Nodes (4): ProtectedRoute(), useAuth(), SignInPage(), SignUpPage()

### Community 23 - "Shadcn Dialog"
Cohesion: 0.25
Nodes (7): DialogBody(), DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay, DialogTitle

### Community 24 - "Shadcn Popover"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 25 - "Convex Skills Router"
Cohesion: 0.29
Nodes (7): npx convex ai-files install, Convex Create Component Skill, Convex Migration Helper Skill, Convex Performance Audit Skill, Convex Quickstart Skill, Convex Router Skill, Convex Setup Auth Skill

### Community 26 - "Design System & Fonts"
Cohesion: 0.38
Nodes (7): Google Fonts, Design Tokens, Direction B: Warm Editorial, Inter Font, JetBrains Mono Font, Newsreader Font, Warm Editorial Design

### Community 27 - "Navbar"
Cohesion: 0.29
Nodes (6): NAV_ITEMS, Navbar(), NavbarProps, NavItem, getInitials(), SettingsPage()

### Community 28 - "Shadcn Card"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 29 - "Assessment Filters"
Cohesion: 0.33
Nodes (4): AssessmentFilters(), AssessmentFiltersProps, FilterChip(), STATUS_FILTERS

### Community 30 - "SignIn Form"
Cohesion: 0.33
Nodes (5): inputClass, schema, SignInForm(), SignInFormProps, SignInValues

### Community 31 - "SignUp Form"
Cohesion: 0.33
Nodes (5): inputClass, schema, SignUpForm(), SignUpFormProps, SignUpValues

### Community 32 - "Convex Quickstart Templates"
Cohesion: 0.33
Nodes (6): CONVEX_AGENT_MODE=anonymous, Anonymous Local Deployment, New Project Path, nextjs-shadcn Template, npx convex dev --once, react-vite-shadcn Template

### Community 33 - "Loading States"
Cohesion: 0.40
Nodes (3): LoadingState(), Skeleton(), SkeletonProps

### Community 34 - "Settings Section"
Cohesion: 0.40
Nodes (4): SettingsRow(), SettingsRowProps, SettingsSection(), SettingsSectionProps

### Community 35 - "Sort Select"
Cohesion: 0.40
Nodes (4): SORT_LABELS, SortKey, SortSelect(), SortSelectProps

### Community 36 - "View Toggle"
Cohesion: 0.40
Nodes (4): VIEW_OPTIONS, ViewOption, ViewToggle(), ViewToggleProps

### Community 37 - "Advanced Component Patterns"
Cohesion: 0.40
Nodes (5): Advanced Component Patterns, Class-based Client Wrapper, Deriving Validators from Schema, Function Handles for Callbacks, Globals Table Pattern

### Community 38 - "Brand Assets & Icons"
Cohesion: 0.50
Nodes (5): Documentation Icon (purple outlined), Lael App Brand Logo (favicon), Social & UI Icons Sprite (icons.svg), Purple-Blue Gradient Brand Identity, Social Media Icon Set (Bluesky, Discord, GitHub, X)

### Community 39 - "Page Transition"
Cohesion: 0.40
Nodes (3): useRouteTransition(), PageTransition(), PageTransitionProps

### Community 40 - "Segmented Control"
Cohesion: 0.50
Nodes (3): SegmentedControl(), SegmentedControlProps, SegmentedOption

### Community 41 - "Stat Card"
Cohesion: 0.67
Nodes (3): StatCard(), StatCardData, StatCardProps

### Community 42 - "Component API Wrappers"
Cohesion: 0.50
Nodes (4): Client-Facing API Wrappers, ComponentApi Boundary, ctx.runMutation, ctx.runQuery

### Community 43 - "Schema Migration Patterns"
Cohesion: 0.50
Nodes (4): Breaking Schema Changes, Dual Read Strategy, Dual Write Strategy, Widen-Migrate-Narrow Pattern

### Community 44 - "Convex Migrations Component"
Cohesion: 0.50
Nodes (4): @convex-dev/migrations Component, Dry Run Migration, Online Migrations, Small Table Shortcut (internalMutation)

### Community 45 - "Assessments Page"
Cohesion: 0.50
Nodes (3): AssessmentsPage(), KANBAN_COLUMNS, PRIORITY_ORDER

### Community 46 - "Button Component"
Cohesion: 0.50
Nodes (3): Button, ButtonProps, buttonVariants

## Knowledge Gaps
- **297 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+292 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Common Components` to `Assessment Cards & Rows`, `Assessment Hooks`, `Add Assessment Form`, `Calendar Grid`, `Dialog & Calendar`, `Shadcn Dialog`, `Shadcn Popover`, `Navbar`, `Assessment Filters`, `SignIn Form`, `SignUp Form`, `Loading States`, `Settings Section`, `Sort Select`, `View Toggle`, `Page Transition`, `Segmented Control`, `Stat Card`, `Empty State`, `Toggle Component`, `Page Container`, `Page Header`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `SettingsPage()` connect `Navbar` to `UI Common Components`, `Settings & Export`, `Assessment Hooks`, `Theme & Preferences Hooks`, `Auth Pages`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `Navbar()` connect `Navbar` to `UI Common Components`, `Dialog & Calendar`, `Auth Pages`, `Global Shortcuts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 46 inferred relationships involving `cn()` (e.g. with `AssessmentCard()` and `AssessmentFilters()`) actually correct?**
  _`cn()` has 46 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _298 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth & Convex Components` be split into smaller, more focused modules?**
  _Cohesion score 0.08571428571428572 - nodes in this community are weakly interconnected._
- **Should `Convex DB & Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.06349206349206349 - nodes in this community are weakly interconnected._