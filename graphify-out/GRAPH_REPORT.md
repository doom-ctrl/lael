# Graph Report - Lael  (2026-06-19)

## Corpus Check
- 129 files · ~97,974 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 53 nodes · 57 edges · 6 communities (5 shown, 1 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a9e64f89`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 3 edges
2. `AddAssessmentModal()` - 3 edges
3. `useDashboardData()` - 3 edges
4. `timestampToDateStr()` - 2 edges
5. `toClient()` - 2 edges
6. `authComponent` - 2 edges
7. `todayDateStr()` - 2 edges
8. `Field()` - 2 edges
9. `defaults()` - 2 edges
10. `useAssessments()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `AddAssessmentModal()` --calls--> `cn()`  [INFERRED]
  lael-app/src/components/modals/AddAssessmentModal.tsx → lael-app/src/lib/utils.ts
- `Field()` --calls--> `cn()`  [INFERRED]
  lael-app/src/components/modals/AddAssessmentModal.tsx → lael-app/src/lib/utils.ts
- `AddAssessmentModal()` --calls--> `useAssessmentMutations()`  [INFERRED]
  lael-app/src/components/modals/AddAssessmentModal.tsx → lael-app/src/features/assessments/useAssessments.ts

## Import Cycles
- None detected.

## Communities (6 total, 1 thin omitted)

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

## Knowledge Gaps
- **22 isolated node(s):** `DEMO_TODAY`, `typeV`, `priorityV`, `statusV`, `list` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AddAssessmentModal()` connect `Community 3` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `cn()` (e.g. with `AddAssessmentModal()` and `Field()`) actually correct?**
  _`cn()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `AddAssessmentModal()` (e.g. with `useAssessmentMutations()` and `cn()`) actually correct?**
  _`AddAssessmentModal()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `DEMO_TODAY`, `typeV`, `priorityV` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._