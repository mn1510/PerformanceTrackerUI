## ADDED Requirements

### Requirement: Modal can be opened from activities page
The system SHALL provide a "Sync from 8a.nu" button on the activities page that opens the 8a.nu authentication modal.

#### Scenario: User clicks sync button
- **WHEN** authenticated user clicks "Sync from 8a.nu" button on activities page
- **THEN** system displays the 8a.nu authentication modal overlay

#### Scenario: Modal opens with empty form
- **WHEN** modal is opened
- **THEN** system displays empty username and password fields with submit button enabled

### Requirement: User can enter 8a.nu credentials
The system SHALL provide input fields for 8a.nu username and password within the modal.

#### Scenario: User enters credentials
- **WHEN** user types username "climber@example.com" and password "SecurePass123"
- **THEN** system accepts the input and enables the sync button

#### Scenario: User submits empty form
- **WHEN** user clicks sync button with empty username or password
- **THEN** system displays validation error "Username and password are required"

#### Scenario: Password is masked
- **WHEN** user types in password field
- **THEN** system displays characters as dots/asterisks for security

### Requirement: Modal displays sync status messages
The system SHALL show simple status messages during authentication and sync initiation.

#### Scenario: Initial state shows form
- **WHEN** modal opens for first time
- **THEN** system displays credential form with no status message

#### Scenario: Authenticating message
- **WHEN** user submits credentials and authentication request is sent
- **THEN** system disables form and displays "Authenticating with 8a.nu..."

#### Scenario: Sync started message
- **WHEN** authentication succeeds and sync is triggered
- **THEN** system displays "Sync started! This may take a minute. Refresh the page to see your climbs."

#### Scenario: Auto-close after sync start
- **WHEN** sync started message is displayed
- **THEN** system automatically closes modal after 3 seconds

#### Scenario: Error message
- **WHEN** authentication or sync fails
- **THEN** system displays error message and re-enables form with "Try Again" option

### Requirement: User can close the modal
The system SHALL allow users to close the modal via close button or backdrop click.

#### Scenario: Close button closes modal
- **WHEN** user clicks the X close button
- **THEN** system closes the modal and returns to activities page

#### Scenario: Backdrop click closes modal
- **WHEN** user clicks outside modal area on backdrop
- **THEN** system closes the modal

#### Scenario: Escape key closes modal
- **WHEN** user presses Escape key while modal is open
- **THEN** system closes the modal

### Requirement: Modal handles authentication errors
The system SHALL display clear error messages when 8a.nu authentication fails.

#### Scenario: Invalid credentials error
- **WHEN** user submits incorrect 8a.nu credentials and backend returns 401
- **THEN** system displays "Invalid 8a.nu credentials. Please check your username and password." and re-enables form

#### Scenario: Network error
- **WHEN** authentication request fails due to network issue
- **THEN** system displays "Unable to connect. Please try again later." and re-enables form

#### Scenario: Server error
- **WHEN** backend returns 500 error
- **THEN** system displays "Server error occurred. Please try again later." and re-enables form

### Requirement: Modal is responsive
The system SHALL render the modal properly on desktop, tablet, and mobile viewports.

#### Scenario: Desktop displays centered modal
- **WHEN** modal opens on desktop viewport (>992px width)
- **THEN** system displays modal centered with 500px width

#### Scenario: Mobile displays full-width modal
- **WHEN** modal opens on mobile viewport (<768px width)
- **THEN** system displays modal full-width with proper padding
