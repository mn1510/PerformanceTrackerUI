## ADDED Requirements

### Requirement: Support up to 4 pyramids side-by-side
The system SHALL allow users to display and compare up to 4 pyramids simultaneously with independent filter configurations.

#### Scenario: Initial load with one pyramid
- **WHEN** user navigates to pyramid analysis page
- **THEN** one pyramid is displayed with default filters (all countries, last 5 years)

#### Scenario: Add additional pyramids
- **WHEN** fewer than 4 pyramids are displayed and user clicks "Add Pyramid" button
- **THEN** a new pyramid is added with default filters

#### Scenario: Maximum pyramid limit
- **WHEN** 4 pyramids are already displayed
- **THEN** "Add Pyramid" button is hidden or disabled

### Requirement: Independent filter configuration per pyramid
The system SHALL allow each pyramid to have its own country and date range filters that can be configured independently.

#### Scenario: Different countries per pyramid
- **WHEN** user sets Pyramid 1 to "UK" and Pyramid 2 to "Spain"
- **THEN** each pyramid loads and displays data for its respective country filter

#### Scenario: Different date ranges per pyramid
- **WHEN** user sets Pyramid 1 to "2025-01-01 to 2025-12-31" and Pyramid 2 to "2024-01-01 to 2024-12-31"
- **THEN** each pyramid displays ascents within its specified date range

### Requirement: Global scaling for visual comparison
The system SHALL calculate a global maximum count across all loaded pyramids and use it to scale all bars consistently for accurate visual comparison.

#### Scenario: Consistent scaling across pyramids
- **WHEN** Pyramid 1 has max count of 3 and Pyramid 2 has max count of 10
- **THEN** all bars in both pyramids scale to maxCount=10 (Pyramid 1's bar of 3 renders at 30% width, Pyramid 2's bar of 10 at 100% width)

#### Scenario: Scaling updates when pyramid removed
- **WHEN** user removes a pyramid that had the global maximum count
- **THEN** global maximum is recalculated from remaining pyramids and all bars rescale accordingly

#### Scenario: Scaling updates when new data loads
- **WHEN** user applies new filters to a pyramid and data loads
- **THEN** global maximum is recalculated and all pyramid bars rescale if needed

### Requirement: Remove pyramid functionality
The system SHALL allow users to remove any pyramid from the comparison without confirmation.

#### Scenario: Remove pyramid immediately
- **WHEN** user clicks remove button on a pyramid
- **THEN** pyramid is immediately removed from the display without confirmation dialog

#### Scenario: Cannot remove last pyramid
- **WHEN** only one pyramid remains
- **THEN** remove button can still be clicked (allows user to reset view)

### Requirement: Responsive layout
The system SHALL display pyramids in a responsive grid layout that adapts to screen size.

#### Scenario: Desktop layout with 4 columns
- **WHEN** viewport width is >= 1400px and multiple pyramids are displayed
- **THEN** pyramids display in up to 4 columns side-by-side

#### Scenario: Tablet layout with 2 columns
- **WHEN** viewport width is 768-1399px and multiple pyramids are displayed
- **THEN** pyramids display in 2 columns

#### Scenario: Mobile layout with horizontal scroll
- **WHEN** viewport width is < 768px and multiple pyramids are displayed
- **THEN** pyramids display in single column with horizontal scroll enabled

### Requirement: Per-pyramid loading states
The system SHALL display independent loading indicators for each pyramid while its data is being fetched.

#### Scenario: Loading indicator per pyramid
- **WHEN** user clicks "Apply" on a pyramid's filters
- **THEN** that pyramid displays a loading spinner while data is fetched, without affecting other pyramids

#### Scenario: Error state per pyramid
- **WHEN** API call fails for a specific pyramid
- **THEN** that pyramid displays an error message with retry option, without affecting other pyramids
