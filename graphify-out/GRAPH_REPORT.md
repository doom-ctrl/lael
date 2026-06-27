# Graph Report - Lael  (2026-06-19)

## Corpus Check
- 129 files · ~97,874 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 71 nodes · 82 edges · 7 communities (6 shown, 1 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6823f49a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 7 edges
2. `DayItemCard()` - 4 edges
3. `DayDetailPanel()` - 3 edges
4. `assessmentToCSVRow()` - 3 edges
5. `AddAssessmentModal()` - 3 edges
6. `useDashboardData()` - 3 edges
7. `formatDateBadge()` - 2 edges
8. `daysUntil()` - 2 edges
9. `isOverdue()` - 2 edges
10. `CalendarPage()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Field()` --calls--> `cn()`  [INFERRED]
  lael-app/src/components/modals/AddAssessmentModal.tsx → lael-app/src/lib/utils.ts
- `AddAssessmentModal()` --calls--> `cn()`  [INFERRED]
  lael-app/src/components/modals/AddAssessmentModal.tsx → lael-app/src/lib/utils.ts
- `CalendarPage()` --calls--> `cn()`  [INFERRED]
  lael-app/src/pages/CalendarPage.tsx → lael-app/src/lib/utils.ts
- `PanelHeader()` --calls--> `cn()`  [INFERRED]
  lael-app/src/pages/CalendarPage.tsx → lael-app/src/lib/utils.ts
- `DayDetailPanel()` --calls--> `cn()`  [INFERRED]
  lael-app/src/pages/CalendarPage.tsx → lael-app/src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (7 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (13): AssessmentId, counts, create, get, list, listByMonth, markComplete, priorityV (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.21
Nodes (9): cn(), daysUntil(), formatDateBadge(), isOverdue(), CalendarPage(), DayDetailPanel(), DayDetailPanelProps, DayItemCard() (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.20
Nodes (8): AddAssessmentFormValues, AddAssessmentModalProps, AddAssessmentMode, defaults(), Field(), FormErrors, formSchema, todayDateStr()

### Community 3 - "Community 3"
Cohesion: 0.28
Nodes (6): AssessmentId, useAssessmentCounts(), useAssessmentMutations(), useAssessments(), useDashboardData(), AddAssessmentModal()

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (3): additionalOrigins, authComponent, getCurrentUser

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (7): assessmentToCSVRow(), buildCSVExport(), buttonClass, CSV_HEADER, csvCell(), dangerButtonClass, inputClass

## Knowledge Gaps
- **26 isolated node(s):** `DayDetailPanelProps`, `inputClass`, `buttonClass`, `dangerButtonClass`, `CSV_HEADER` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 2`, `Community 3`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Why does `AddAssessmentModal()` connect `Community 3` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `cn()` (e.g. with `AddAssessmentModal()` and `Field()`) actually correct?**
  _`cn()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `DayItemCard()` (e.g. with `cn()` and `formatDateBadge()`) actually correct?**
  _`DayItemCard()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `DayDetailPanel()` (e.g. with `cn()` and `daysUntil()`) actually correct?**
  _`DayDetailPanel()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `AddAssessmentModal()` (e.g. with `useAssessmentMutations()` and `cn()`) actually correct?**
  _`AddAssessmentModal()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `DayDetailPanelProps`, `inputClass`, `buttonClass` to the rest of the system?**
  _26 weakly-connected nodes found - possible documentation gaps or missing edges._