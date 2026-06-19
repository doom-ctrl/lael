# Graph Report - Lael  (2026-06-19)

## Corpus Check
- 129 files · ~97,911 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 66 nodes · 71 edges · 7 communities (6 shown, 1 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c3296c48`
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
1. `assessmentToCSVRow()` - 3 edges
2. `cn()` - 3 edges
3. `AddAssessmentModal()` - 3 edges
4. `useDashboardData()` - 3 edges
5. `csvCell()` - 2 edges
6. `buildCSVExport()` - 2 edges
7. `timestampToDateStr()` - 2 edges
8. `toClient()` - 2 edges
9. `authComponent` - 2 edges
10. `todayDateStr()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `AddAssessmentModal()` --calls--> `cn()`  [INFERRED]
  lael-app/src/components/modals/AddAssessmentModal.tsx → lael-app/src/lib/utils.ts
- `Field()` --calls--> `cn()`  [INFERRED]
  lael-app/src/components/modals/AddAssessmentModal.tsx → lael-app/src/lib/utils.ts
- `AddAssessmentModal()` --calls--> `useAssessmentMutations()`  [INFERRED]
  lael-app/src/components/modals/AddAssessmentModal.tsx → lael-app/src/features/assessments/useAssessments.ts

## Import Cycles
- None detected.

## Communities (7 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (13): AssessmentId, counts, create, get, list, listByMonth, markComplete, priorityV (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.20
Nodes (3): cn(), DEMO_TODAY, Field()

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (7): AddAssessmentFormValues, AddAssessmentModalProps, AddAssessmentMode, defaults(), FormErrors, formSchema, todayDateStr()

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
- **26 isolated node(s):** `inputClass`, `buttonClass`, `dangerButtonClass`, `CSV_HEADER`, `DEMO_TODAY` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AddAssessmentModal()` connect `Community 3` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `cn()` (e.g. with `AddAssessmentModal()` and `Field()`) actually correct?**
  _`cn()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `AddAssessmentModal()` (e.g. with `useAssessmentMutations()` and `cn()`) actually correct?**
  _`AddAssessmentModal()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `inputClass`, `buttonClass`, `dangerButtonClass` to the rest of the system?**
  _26 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._