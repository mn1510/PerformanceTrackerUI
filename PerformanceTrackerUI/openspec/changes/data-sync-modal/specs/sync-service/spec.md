## ADDED Requirements

### Requirement: Service authenticates with 8a.nu
The system SHALL provide a method to authenticate with 8a.nu using username and password.

#### Scenario: Successful authentication
- **WHEN** service calls authenticate8a() with valid username "user@example.com" and password "pass123"
- **THEN** system sends POST request to /api/v1/auth/8a-login with credentials
- **THEN** system receives session cookie in response
- **THEN** service returns Observable containing session cookie

#### Scenario: Authentication failure
- **WHEN** service calls authenticate8a() with invalid credentials
- **THEN** system sends POST request to /api/v1/auth/8a-login
- **THEN** system receives 401 Unauthorized response
- **THEN** service emits error with message "Authentication failed"

#### Scenario: Network timeout
- **WHEN** service calls authenticate8a() and request exceeds 30 second timeout
- **THEN** service emits timeout error
- **THEN** error message is "Request timed out"

### Requirement: Service triggers data sync
The system SHALL provide a method to trigger 8a.nu data ingestion with session cookie.

#### Scenario: Successful sync trigger
- **WHEN** service calls startSync() with userName "johndoe" and session cookie
- **THEN** system sends POST request to /api/v1/ingestion/user-data
- **THEN** request includes Authorization header with Cognito JWT token
- **THEN** request includes X-8a-Session header with session cookie value
- **THEN** request body contains {userName: "johndoe"}
- **THEN** service returns Observable with success response

#### Scenario: Missing session cookie
- **WHEN** service calls startSync() with empty session cookie
- **THEN** service emits error "Session cookie required"
- **THEN** no HTTP request is sent

#### Scenario: Sync trigger fails
- **WHEN** service calls startSync() and backend returns 403
- **THEN** service emits error with message "Sync failed to start"

### Requirement: Service includes authentication headers
The system SHALL automatically include Cognito JWT token in all API requests.

#### Scenario: JWT token included
- **WHEN** service makes any API request to /api/v1/* endpoints
- **THEN** AuthInterceptor adds Authorization: Bearer <jwt-token> header
- **THEN** request proceeds with authentication

#### Scenario: Session cookie header added
- **WHEN** service calls startSync() with session cookie "abc123"
- **THEN** system adds X-8a-Session: abc123 header to request

### Requirement: Service handles API errors
The system SHALL emit user-friendly error messages for API failures.

#### Scenario: 401 Unauthorized error
- **WHEN** API returns 401 status code
- **THEN** service emits error message "Invalid credentials"

#### Scenario: 403 Forbidden error
- **WHEN** API returns 403 status code
- **THEN** service emits error message "8a.nu session required. Please try logging in again."

#### Scenario: 500 Server error
- **WHEN** API returns 500 status code
- **THEN** service emits error message "Server error. Please try again later."

#### Scenario: Network error
- **WHEN** network connection fails
- **THEN** service emits error message "Network error. Please check your connection."

### Requirement: Service is injectable
The system SHALL provide the sync service as an Angular injectable service.

#### Scenario: Service can be injected
- **WHEN** component declares SyncService in constructor
- **THEN** Angular dependency injection provides service instance

#### Scenario: Service is singleton
- **WHEN** multiple components inject SyncService
- **THEN** all components receive the same service instance
