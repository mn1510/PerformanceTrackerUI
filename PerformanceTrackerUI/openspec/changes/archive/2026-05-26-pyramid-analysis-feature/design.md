## Context

The Performance Tracker UI is an Angular 16 application using AWS Cognito for authentication. It follows a reactive pattern with BehaviorSubject state management in services (similar to `UserAscentService`). The app uses Bootstrap "United" theme for styling and integrates with the ClimbData FastAPI backend.

Users currently track individual climbing ascents but lack aggregate visualization. The pyramid analysis feature addresses this by showing grade distribution over time. The primary use case is temporal comparison (e.g., UK 2025 vs UK 2024) to track progression, with secondary geographic comparison support (e.g., UK vs Spain).

**Current Architecture:**
- Component-based with smart/dumb component pattern
- Services use HttpClient with RxJS observables
- Protected routes with functional `authGuard`
- Centralized error handling via interceptors

**Constraints:**
- Must integrate with existing ClimbData API (`/api/v1/users/pyramid-analysis`)
- Backend endpoint returns pre-aggregated data (no client-side aggregation needed)
- Requires new backend endpoint for countries list
- Must maintain existing auth flow (JWT in headers)

## Goals / Non-Goals

**Goals:**
- Enable visual comparison of up to 4 pyramids side-by-side with accurate proportional scaling
- Support independent filter configuration per pyramid (country + date range)
- Provide responsive layout (desktop 4 columns, tablet 2, mobile horizontal scroll)
- Auto-load single pyramid with sensible defaults (all countries, last 5 years)
- Reuse existing patterns (services, guards, styling) for consistency
- Prepare for future filter extensions (style, rock type, ascent-type-only views)

**Non-Goals:**
- Client-side aggregation of ascent data (backend provides pre-aggregated pyramid)
- Preset comparison templates (e.g., "This Year vs Last Year" button)
- URL persistence of filter state (bookmarkable comparisons)
- Export/share functionality
- Animated transitions between filter changes
- Mobile-optimized swipe gestures (basic scroll sufficient)

## Decisions

### Decision 1: Three-Component Architecture

**Choice:** Split into `PyramidAnalysisComponent` (container), `PyramidCardComponent` (filter + data), `PyramidVisualizationComponent` (pure display)

**Rationale:**
- **Container** manages array of pyramids and global scaling logic
- **Card** handles filter UI, API calls, loading states per pyramid
- **Visualization** is stateless and reusable (could be used elsewhere)

**Alternative Considered:** Two-component (container + card with embedded visualization)
- **Rejected because:** Harder to test visualization in isolation, less reusable

**Data Flow:**
```
Container (manages state)
  │
  ├─> [Input] pyramidInstance, globalMaxCount, countries
  │   [Output] dataLoaded, removeRequested
  │
  └─> Card (orchestrates filters + display)
        │
        ├─> [Input] pyramidData, maxCount
        │
        └─> Visualization (pure display)
```

### Decision 2: Global Scaling via Parent-Calculated Max

**Choice:** Container calculates `globalMaxCount` and passes to all children via `@Input()`

**Rationale:**
- Ensures visual consistency across pyramids (temporal comparison requirement)
- Container is single source of truth for scaling
- Recalculated whenever any pyramid loads/unloads data
- Simple change detection propagation

**Alternative Considered:** Shared service with BehaviorSubject
- **Rejected because:** Overkill for view-scoped state, adds complexity without benefit

**Algorithm:**
```typescript
globalMaxCount = max(
  for each pyramid:
    for each grade row:
      max(onsights, flashes, redpoints.count)
)
```

**Example:** If Pyramid 1 max is 3 and Pyramid 2 max is 10, all bars scale to 10
- Pyramid 1's bar of 3 renders at 30% width (3/10)
- Pyramid 2's bar of 10 renders at 100% width (10/10)

### Decision 3: Service Layer Without Reactive State

**Choice:** Services (`PyramidService`, `CountriesService`) return observables but don't manage BehaviorSubject state

**Rationale:**
- Each pyramid card loads independently on user action (click "Apply")
- No cross-component reactivity needed
- Simpler than `UserAscentService` pattern (which auto-loads on init)
- Countries are cached via `shareReplay(1)` for performance

**Alternative Considered:** BehaviorSubject pattern like `UserAscentService`
- **Rejected because:** Pyramid data is ephemeral per view, not persisted like user ascents

### Decision 4: Default Filters Strategy

**Choice:**
- Country: empty string (all countries)
- Date range: 5 years back from today to today
- Calculated at runtime on pyramid creation

**Rationale:**
- Matches "last 5 years" user requirement
- Empty country slug interpreted by backend as "no filter"
- Dynamic calculation ensures current date is always accurate

**Implementation:**
```typescript
getDefaultFilters(): PyramidFilters {
  const today = new Date();
  const fiveYearsAgo = new Date(today);
  fiveYearsAgo.setFullYear(today.getFullYear() - 5);

  return {
    country_slug: '',
    date_from: fiveYearsAgo.toISOString().split('T')[0],
    date_to: today.toISOString().split('T')[0]
  };
}
```

### Decision 5: Bar Visualization Layout

**Choice:** Same-row grouped bars (OS, F, RP side-by-side per grade) with distinct colors

**Rationale:**
- Optimal for temporal comparison (primary use case)
- Easy to compare "Did I onsight more 8c+ this year vs last year?"
- Colors match existing badge patterns: OS=green, F=yellow, RP=blue
- Horizontal bars better for grade labels than vertical

**Alternative Considered:** Stacked bars
- **Rejected because:** Harder to compare individual ascent types across pyramids

**Layout:**
```
8c+ │ [OS:green][F:yellow][RP:blue]
8c  │ [OS][F][RP]
8b+ │ [OS][F][RP]
```

### Decision 6: Countries Source

**Choice:** New backend endpoint `GET /api/v1/countries` returns user-specific countries

**Rationale:**
- Backend already has user's ascent data, can efficiently derive unique countries
- Returns only countries user has climbed (cleaner dropdown than all world countries)
- Cached on first load to avoid repeated calls

**Response Format:**
```json
[
  { "slug": "spain", "name": "Spain", "ascent_count": 42 },
  { "slug": "uk", "name": "United Kingdom", "ascent_count": 18 }
]
```

**Dropdown includes:** "All Countries" option (slug = empty string) + user's countries

### Decision 7: Responsive Strategy

**Choice:** CSS Grid with responsive breakpoints + horizontal scroll on mobile

**Rationale:**
- Desktop (≥1400px): 4 columns (all pyramids visible)
- Tablet (768-1399px): 2 columns (scroll down to see all)
- Mobile (<768px): 1 column with horizontal overflow scroll

**Alternative Considered:** Carousel with swipe gestures
- **Rejected because:** More complex, horizontal scroll sufficient for MVP

### Decision 8: Remove Pyramid Behavior

**Choice:** Immediate removal without confirmation dialog

**Rationale:**
- User explicitly requested no confirmation
- Quick iteration for comparison exploration
- Low risk (can re-add pyramid easily)

**Note:** Could add "undo" toast in future if user feedback indicates accidental removals

## Risks / Trade-offs

### Risk 1: Backend Countries Endpoint Not Ready
**Mitigation:**
- Implement service with stub data initially
- Countries dropdown can start with empty list + "All Countries" option
- Feature degrades gracefully (filtering still works with manual country input if needed in future)

### Risk 2: Global Scaling with Very Disparate Data
**Scenario:** User compares beginner year (max 5 ascents at 6a) with current year (max 50 ascents at 8c)
**Trade-off:** Beginner year bars will be tiny (5/50 = 10% width)
**Mitigation:** This is correct behavior for accurate comparison, but could add toggle for "independent scaling" in future if user feedback indicates need

### Risk 3: 4 Simultaneous API Calls
**Scenario:** User loads 4 pyramids with different filters rapidly
**Impact:** 4 concurrent HTTP requests to backend
**Mitigation:**
- Backend endpoint is read-only and lightweight (< 500ms per API docs)
- Angular HttpClient handles concurrency natively
- No special throttling needed for MVP

### Risk 4: Mobile UX with 4 Pyramids
**Trade-off:** Horizontal scroll on mobile is functional but not ideal for 4 pyramids
**Mitigation:** Most users likely compare 2-3 pyramids; document as known limitation for mobile power users

### Risk 5: Empty State Confusion
**Scenario:** User applies filters that yield no ascents (e.g., "Antarctica")
**Mitigation:**
- Clear empty state message: "No ascents found for these filters"
- Keep filters visible so user can adjust
- Consider hint text if zero results are common

### Risk 6: Future Filter Extensibility
**Scenario:** Adding "style" or "rock type" filters requires API changes
**Trade-off:** Current design assumes query params on same endpoint
**Preparation:**
- `PyramidFilters` interface designed for extension (add optional fields)
- Backend API doc confirms future filters use query params
- No architectural changes needed, just add to filter form

## Open Questions

None - all critical decisions resolved during exploration phase.

## Migration Plan

Not applicable - this is a new feature with no data migration or backward compatibility concerns.

**Deployment:**
1. Backend deploys new `/api/v1/countries` endpoint (dependency)
2. Frontend deploys pyramid feature (safe - behind new route)
3. Update navigation to expose "Pyramid Analysis" menu item

**Rollback:**
- Remove route from `app-routing.module.ts`
- Remove nav menu item
- Feature is isolated with no side effects on existing functionality
