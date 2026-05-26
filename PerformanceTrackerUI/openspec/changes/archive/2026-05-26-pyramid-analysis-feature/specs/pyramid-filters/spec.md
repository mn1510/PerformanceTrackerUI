## ADDED Requirements

### Requirement: Country filter dropdown
The system SHALL provide a country dropdown filter that allows users to select a specific country or all countries.

#### Scenario: Country dropdown populated with user's countries
- **WHEN** pyramid filter form is displayed
- **THEN** country dropdown contains "All Countries" option plus countries where user has climbed

#### Scenario: Select specific country
- **WHEN** user selects a specific country from dropdown
- **THEN** country filter is set to that country's slug (e.g., "spain", "uk")

#### Scenario: Select all countries
- **WHEN** user selects "All Countries" option
- **THEN** country filter is set to empty string (no country filtering applied)

### Requirement: Date range filter inputs
The system SHALL provide date picker inputs for start date (from) and end date (to) to filter pyramid data by date range.

#### Scenario: Date inputs accept ISO format dates
- **WHEN** user enters or selects dates in the date pickers
- **THEN** dates are stored in ISO format YYYY-MM-DD

#### Scenario: Date range validation
- **WHEN** user sets date_from after date_to
- **THEN** system accepts the input (backend will handle empty result if dates are invalid)

### Requirement: Default filter values
The system SHALL initialize filters with default values when a new pyramid is created.

#### Scenario: Default country is all countries
- **WHEN** a new pyramid is added
- **THEN** country filter defaults to empty string (all countries selected)

#### Scenario: Default date range is last 5 years
- **WHEN** a new pyramid is added
- **THEN** date_from defaults to 5 years before current date and date_to defaults to current date

### Requirement: Apply filters on user action
The system SHALL only fetch pyramid data when user explicitly clicks "Apply" button, not automatically on filter changes.

#### Scenario: Filters editable without auto-reload
- **WHEN** user changes country or date filters
- **THEN** pyramid data is not automatically reloaded

#### Scenario: Apply button triggers data fetch
- **WHEN** user clicks "Apply" button
- **THEN** system fetches pyramid data using current filter values and updates the visualization

### Requirement: Persist filter values during editing
The system SHALL maintain filter input values visible in the form even after data is loaded.

#### Scenario: Filters remain visible after apply
- **WHEN** user clicks "Apply" and data loads
- **THEN** filter inputs remain visible with their current values, allowing user to adjust and re-apply

### Requirement: Independent filters per pyramid
The system SHALL maintain separate filter state for each pyramid in a comparison view.

#### Scenario: Changing one pyramid's filters does not affect others
- **WHEN** user modifies filters on Pyramid 1
- **THEN** filters on Pyramid 2, 3, and 4 remain unchanged

### Requirement: Filter state survives data errors
The system SHALL preserve filter values even if API call fails.

#### Scenario: Filters preserved after error
- **WHEN** API call fails due to network or server error
- **THEN** filter input values remain unchanged, allowing user to retry with same or modified filters
