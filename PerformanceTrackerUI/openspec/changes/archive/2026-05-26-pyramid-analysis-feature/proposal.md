## Why

Users need to visualize their climbing performance distribution across grades to understand their pyramid structure and identify training gaps. Currently, the app only shows individual ascent logs without aggregate grade distribution analysis. Temporal comparison (this year vs last year) is the primary use case to track progression over time.

## What Changes

- Add new "Pyramid Analysis" top-level navigation menu item
- Create pyramid visualization component displaying grade distribution with onsight/flash/redpoint breakdown
- Support side-by-side comparison of up to 4 pyramids with independent filters
- Add country and date range filters (default: all countries, last 5 years)
- Implement global scaling across pyramids for accurate visual comparison
- Integrate with existing ClimbData API pyramid endpoint (`/api/v1/users/pyramid-analysis`)
- Add countries service to fetch user's climbing countries from new backend endpoint

## Capabilities

### New Capabilities

- `pyramid-visualization`: Display climbing grade distribution as horizontal bar chart with ascent type breakdown (OS/F/RP)
- `pyramid-comparison`: Side-by-side comparison of up to 4 pyramids with independent filters and global scaling
- `pyramid-filters`: Country and date range filtering for pyramid data
- `countries-api`: Fetch list of countries where user has climbed

### Modified Capabilities

<!-- No existing capabilities are being modified -->

## Impact

### New Components
- `PyramidAnalysisComponent` (container for managing multiple pyramids)
- `PyramidCardComponent` (individual pyramid with filters)
- `PyramidVisualizationComponent` (pure display of pyramid bars)

### New Services
- `PyramidService` (API calls to `/api/v1/users/pyramid-analysis`)
- `CountriesService` (API calls to `/api/v1/countries`)

### New Types
- `pyramid.types.ts` (PyramidResponse, PyramidGradeRow, PyramidFilters, PyramidInstance, Country)

### Routing
- New route: `/pyramid` (protected by authGuard)

### Navigation
- Update `nav.component.html` to include "Pyramid Analysis" menu item

### Backend Dependencies
- Requires existing endpoint: `GET /api/v1/users/pyramid-analysis` (already documented)
- Requires new endpoint: `GET /api/v1/countries` (returns user's countries with ascent counts)

### Styling
- Reuses existing Bootstrap/Bootswatch "United" theme
- New CSS for pyramid bar charts with ascent type colors (OS=green, F=yellow, RP=blue)
- Responsive grid layout (4/2/1 columns based on screen size)
