## ADDED Requirements

### Requirement: Display grade distribution as horizontal bar chart
The system SHALL display climbing grade distribution as horizontal bar charts with each grade row showing onsight, flash, and redpoint counts as separate colored bars.

#### Scenario: Pyramid data renders with all ascent types
- **WHEN** pyramid data contains grades with onsight, flash, and redpoint ascents
- **THEN** each grade displays three horizontal bars side-by-side (green for onsight, yellow for flash, blue for redpoint)

#### Scenario: Bar widths scale proportionally
- **WHEN** pyramid data has varying counts across grades
- **THEN** bar widths scale proportionally to the provided maxCount (longer bars for higher counts)

#### Scenario: Empty grade row handling
- **WHEN** a grade has zero ascents for a particular type (e.g., 0 onsights)
- **THEN** that ascent type's bar is not displayed or shows as minimal width with "0" label

### Requirement: Display grade labels
The system SHALL display French sport climbing grade labels (e.g., "8c+", "7a") for each grade row in the pyramid.

#### Scenario: Grades ordered by difficulty
- **WHEN** pyramid data contains multiple grades
- **THEN** grades are displayed in descending order of difficulty (hardest at top) using the grade_index field

### Requirement: Show ascent counts on bars
The system SHALL display the numeric count of ascents on each bar.

#### Scenario: Counts visible on bars
- **WHEN** a bar is rendered
- **THEN** the count number is displayed inside or adjacent to the bar

### Requirement: Display redpoint attempt information
The system SHALL show total attempts for redpoint ascents via tooltip or secondary display.

#### Scenario: Redpoint tooltip with attempts
- **WHEN** user hovers over a redpoint bar
- **THEN** tooltip displays "X redpoints (Y total attempts)"

### Requirement: Display pyramid metadata summary
The system SHALL display aggregate statistics below the bar chart including total onsights, flashes, redpoints, and overall ascent count.

#### Scenario: Metadata summary shown
- **WHEN** pyramid data is loaded
- **THEN** summary shows "Onsights: X", "Flashes: Y", "Redpoints: Z", "Total: N ascents"

### Requirement: Handle empty pyramid data
The system SHALL display an appropriate message when no ascent data matches the filters.

#### Scenario: No ascents for filters
- **WHEN** pyramid data contains an empty pyramid array
- **THEN** display message "No ascents found for these filters"

### Requirement: Use consistent color scheme
The system SHALL use green (#4CAF50) for onsight bars, yellow (#FFC107) for flash bars, and blue (#2196F3) for redpoint bars to match existing application badge colors.

#### Scenario: Colors match application theme
- **WHEN** bars are rendered
- **THEN** onsight bars use green, flash bars use yellow, redpoint bars use blue matching existing badge styles
