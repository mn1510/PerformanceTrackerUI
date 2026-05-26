## ADDED Requirements

### Requirement: Fetch user's climbing countries
The system SHALL provide a service to fetch the list of countries where the authenticated user has logged climbing ascents.

#### Scenario: Successful countries fetch
- **WHEN** service calls GET /api/v1/countries endpoint with valid JWT token
- **THEN** API returns array of country objects with slug, name, and ascent_count fields

#### Scenario: Empty countries list
- **WHEN** user has no ascents in any country
- **THEN** API returns empty array

#### Scenario: Authentication required
- **WHEN** service calls countries endpoint without valid JWT token
- **THEN** API returns 401 Unauthorized error

### Requirement: Cache countries data
The system SHALL cache the countries list after first successful fetch to avoid repeated API calls during a session.

#### Scenario: First call fetches from API
- **WHEN** service method is called for the first time
- **THEN** HTTP request is made to backend API

#### Scenario: Subsequent calls use cached data
- **WHEN** service method is called after successful first fetch
- **THEN** cached data is returned without making additional HTTP request

### Requirement: Countries data structure
The system SHALL return country data with slug (lowercase identifier), name (display name), and ascent_count (number of user's ascents in that country).

#### Scenario: Country object structure
- **WHEN** countries data is returned
- **THEN** each country object contains slug (string), name (string), and ascent_count (number) fields

### Requirement: Handle API errors gracefully
The system SHALL handle countries API errors without breaking the pyramid feature.

#### Scenario: Countries API fails
- **WHEN** countries endpoint returns error or times out
- **THEN** service returns empty array or cached data if available, allowing pyramid feature to function with manual country selection or all countries option

### Requirement: Countries ordered by usage
The system SHALL return countries ordered by ascent count in descending order (most climbed countries first).

#### Scenario: Countries sorted by usage
- **WHEN** countries data is returned from API
- **THEN** countries are ordered with highest ascent_count first, making most-used countries appear at top of dropdown
