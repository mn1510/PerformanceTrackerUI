## 1. TypeScript Interfaces and Models

- [x] 1.1 Create `src/app/types/pyramid.types.ts` with RedpointData, PyramidGradeRow, PyramidMetadata, PyramidResponse interfaces
- [x] 1.2 Add PyramidFilters interface (country_slug, date_from, date_to)
- [x] 1.3 Add PyramidInstance interface (id, filters, data, loading, error)
- [x] 1.4 Add Country interface (slug, name, ascent_count)

## 2. Services Layer

- [x] 2.1 Create `src/app/_services/pyramid.service.ts` with getPyramid() method
- [x] 2.2 Implement HttpParams building for country_slug, date_from, date_to filters
- [x] 2.3 Create `src/app/_services/countries.service.ts` with getCountries() method
- [x] 2.4 Implement caching with shareReplay(1) for countries service
- [x] 2.5 Update environment.ts apiUrl configuration if needed (should already point to ClimbData API)

## 3. Pyramid Visualization Component (Pure Display)

- [x] 3.1 Generate PyramidVisualizationComponent: `ng g c pyramid/pyramid-visualization`
- [x] 3.2 Add @Input() pyramidData: PyramidResponse and @Input() maxCount: number
- [x] 3.3 Implement getBarWidth(count: number) method using maxCount for scaling
- [x] 3.4 Create template with grade rows using *ngFor on pyramidData.pyramid
- [x] 3.5 Add three bars per grade (onsight, flash, redpoint) with dynamic width styling
- [x] 3.6 Apply color classes: bar-onsight (green), bar-flash (yellow), bar-redpoint (blue)
- [x] 3.7 Add tooltips showing counts and redpoint attempts
- [x] 3.8 Add metadata summary section (total onsights, flashes, redpoints, overall count)
- [x] 3.9 Add empty state message for empty pyramid data
- [x] 3.10 Create CSS for bar styling with colors (#4CAF50, #FFC107, #2196F3)

## 4. Pyramid Card Component (Filter + Data)

- [x] 4.1 Generate PyramidCardComponent: `ng g c pyramid/pyramid-card`
- [x] 4.2 Add @Input() pyramidInstance: PyramidInstance
- [x] 4.3 Add @Input() globalMaxCount: number
- [x] 4.4 Add @Input() countries: Country[]
- [x] 4.5 Add @Output() dataLoaded: EventEmitter with {pyramidId, data} payload
- [x] 4.6 Add @Output() removeRequested: EventEmitter with pyramidId payload
- [x] 4.7 Create filter form template with country dropdown (ngModel)
- [x] 4.8 Add date picker inputs for date_from and date_to (type="date", ngModel)
- [x] 4.9 Add "Apply" button that calls loadData() method
- [x] 4.10 Add "×" remove button that emits removeRequested event
- [x] 4.11 Implement loadData() method to call pyramidService.getPyramid() and emit dataLoaded
- [x] 4.12 Add loading spinner display when pyramidInstance.loading is true
- [x] 4.13 Add error message display when pyramidInstance.error exists
- [x] 4.14 Embed PyramidVisualizationComponent with data and maxCount bindings
- [x] 4.15 Create CSS for card layout and styling

## 5. Pyramid Analysis Container Component

- [x] 5.1 Generate PyramidAnalysisComponent: `ng g c pyramid/pyramid-analysis`
- [x] 5.2 Add pyramids: PyramidInstance[] array property
- [x] 5.3 Add globalMaxCount: number property
- [x] 5.4 Add countries: Country[] property
- [x] 5.5 Inject PyramidService and CountriesService
- [x] 5.6 Implement ngOnInit to call addPyramid() and loadCountries()
- [x] 5.7 Implement getDefaultFilters() method (5 years back to today, empty country)
- [x] 5.8 Implement addPyramid() method (max 4 pyramids, generates unique ID)
- [x] 5.9 Implement removePyramid(id) method and recalculate globalMaxCount
- [x] 5.10 Implement calculateGlobalMax() method scanning all pyramid data
- [x] 5.11 Implement onPyramidDataLoaded(event) handler to update pyramid and recalculate max
- [x] 5.12 Implement loadCountries() method to fetch and store countries
- [x] 5.13 Create template with *ngFor loop rendering PyramidCardComponent instances
- [x] 5.14 Pass pyramidInstance, globalMaxCount, countries as inputs to each card
- [x] 5.15 Bind (dataLoaded) and (removeRequested) outputs to handler methods
- [x] 5.16 Add "Add Pyramid" button with *ngIf="pyramids.length < 4" condition
- [x] 5.17 Create CSS Grid layout with responsive breakpoints (4/2/1 columns)
- [x] 5.18 Add mobile horizontal scroll styling for <768px breakpoint

## 6. Routing and Navigation

- [x] 6.1 Add route to app-routing.module.ts: { path: 'pyramid', component: PyramidAnalysisComponent, canActivate: [authGuard] }
- [x] 6.2 Import PyramidAnalysisComponent in app-routing.module.ts
- [x] 6.3 Update nav.component.html to add "Pyramid Analysis" menu item with routerLink="/pyramid"
- [x] 6.4 Add routerLinkActive="active" to pyramid nav item for active state styling

## 7. Module Registration

- [x] 7.1 Ensure FormsModule is imported in AppModule or SharedModule for ngModel support
- [x] 7.2 Add PyramidAnalysisComponent to AppModule declarations
- [x] 7.3 Add PyramidCardComponent to AppModule declarations
- [x] 7.4 Add PyramidVisualizationComponent to AppModule declarations
- [x] 7.5 Verify HttpClientModule is already imported for services

## 8. Testing and Refinement

- [ ] 8.1 Test navigation to /pyramid route
- [ ] 8.2 Test default pyramid loads with last 5 years filter
- [ ] 8.3 Test adding up to 4 pyramids
- [ ] 8.4 Test removing pyramids and verify globalMaxCount recalculation
- [ ] 8.5 Test country dropdown population from countries API
- [ ] 8.6 Test applying different filters to each pyramid independently
- [ ] 8.7 Test global scaling with disparate data (e.g., max 3 vs max 50)
- [ ] 8.8 Test empty state when no ascents match filters
- [ ] 8.9 Test loading states and error states per pyramid
- [ ] 8.10 Test responsive layout on desktop, tablet, mobile viewports
- [ ] 8.11 Verify bar colors match design (green/yellow/blue)
- [ ] 8.12 Verify tooltips show redpoint attempt counts
- [ ] 8.13 Test with real backend API (requires /api/v1/countries endpoint)
- [ ] 8.14 Verify authentication flow works (JWT token in headers)
- [ ] 8.15 Check browser console for errors and warnings

## 9. Documentation

- [ ] 9.1 Add comments to complex methods (calculateGlobalMax, getBarWidth)
- [ ] 9.2 Document component inputs/outputs with JSDoc if needed
- [ ] 9.3 Update CLAUDE.md if architectural patterns are added that future devs should know
