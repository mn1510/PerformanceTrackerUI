## 1. Service Implementation

- [x] 1.1 Create SyncService at src/app/_services/sync.service.ts
- [x] 1.2 Add authenticate8a(username, password) method that calls POST /api/v1/auth/8a-login
- [x] 1.3 Add startSync(userName, sessionCookie) method that calls POST /api/v1/ingestion/user-data
- [x] 1.4 Implement error handling for 401, 403, 500, and network errors
- [x] 1.5 Add proper TypeScript interfaces for API request/response types
- [x] 1.6 Configure service as @Injectable({ providedIn: 'root' }) singleton

## 2. Modal Component Creation

- [x] 2.1 Generate SyncModalComponent using Angular CLI: ng generate component sync/sync-modal
- [x] 2.2 Move component to src/app/sync/ directory structure
- [x] 2.3 Add component to app.module.ts declarations
- [x] 2.4 Import BsModalService from ngx-bootstrap in component
- [x] 2.5 Inject SyncService and ToastrService in constructor

## 3. Modal HTML Template

- [x] 3.1 Create Bootstrap modal structure with modal-dialog and modal-content
- [x] 3.2 Add modal header with "Sync from 8a.nu" title and close button (X)
- [x] 3.3 Create form with username input field (type="text", required)
- [x] 3.4 Create form with password input field (type="password", required)
- [x] 3.5 Add submit button labeled "Start Sync"
- [x] 3.6 Add status message div for displaying state messages
- [x] 3.7 Implement form validation with error message display

## 4. Modal State Management

- [x] 4.1 Create component state enum: IDLE, AUTHENTICATING, SYNCING, ERROR
- [x] 4.2 Add currentState property initialized to IDLE
- [x] 4.3 Add errorMessage property for error display
- [x] 4.4 Add isLoading computed property (true when AUTHENTICATING or SYNCING)
- [x] 4.5 Implement form disable logic based on isLoading state

## 5. Authentication Flow

- [x] 5.1 Implement onSubmit() method to handle form submission
- [x] 5.2 Validate username and password are not empty
- [x] 5.3 Set state to AUTHENTICATING and display "Authenticating with 8a.nu..."
- [x] 5.4 Call syncService.authenticate8a() with credentials
- [x] 5.5 On success, store session cookie in component variable
- [x] 5.6 On error, set state to ERROR and display error message from service

## 6. Sync Trigger Flow

- [x] 6.1 After successful auth, set state to SYNCING
- [x] 6.2 Display "Sync started! This may take a minute. Refresh the page to see your climbs."
- [x] 6.3 Call syncService.startSync() with userName and session cookie
- [x] 6.4 Add X-8a-Session header to the request
- [x] 6.5 On sync trigger success, start 3-second auto-close timer
- [x] 6.6 On sync trigger error, set state to ERROR with error message

## 7. Modal Styling

- [x] 7.1 Add CSS for modal width (500px on desktop, full-width on mobile)
- [x] 7.2 Style status message with appropriate colors (info blue, error red)
- [x] 7.3 Add spinner icon for AUTHENTICATING state
- [x] 7.4 Style form inputs with proper spacing and focus states
- [x] 7.5 Add responsive breakpoints for mobile (<768px) and tablet views

## 8. Activities List Integration

- [x] 8.1 Import SyncModalComponent in ActivitiesListComponent
- [x] 8.2 Inject BsModalService in ActivitiesListComponent constructor
- [x] 8.3 Add "Sync from 8a.nu" button to activities-list.component.html
- [x] 8.4 Implement openSyncModal() method that opens modal using BsModalService
- [x] 8.5 Position button in navigation area (near existing action buttons)

## 9. Error Handling & User Feedback

- [x] 9.1 Add toastr notification for successful sync start
- [x] 9.2 Add toastr error notification for authentication failures
- [x] 9.3 Implement retry logic - re-enable form on error
- [x] 9.4 Add form reset on modal close
- [x] 9.5 Clear error messages when user edits form fields

## 10. Modal Lifecycle

- [x] 10.1 Implement auto-close after 3 seconds when sync starts
- [x] 10.2 Add close button functionality (X button)
- [x] 10.3 Enable backdrop click to close (when not in AUTHENTICATING/SYNCING state)
- [x] 10.4 Add Escape key listener for modal close
- [x] 10.5 Clean up session cookie variable on modal close

## 11. TypeScript Interfaces

- [x] 11.1 Create EightALoginRequest interface { username: string; password: string }
- [x] 11.2 Create EightALoginResponse interface { message: string; session_cookie: string; expires_in: number }
- [x] 11.3 Create UserDataIngestionRequest interface { userName: string }
- [x] 11.4 Create IngestionTaskResponse interface { message: string }
- [x] 11.5 Add interfaces to shared types file or service file

## 12. Testing & Validation

- [x] 12.1 Test modal opens correctly from activities page
- [x] 12.2 Test form validation (empty username/password)
- [x] 12.3 Test successful authentication flow with valid 8a.nu credentials
- [x] 12.4 Test error display for invalid credentials (401)
- [x] 12.5 Test error display for network errors
- [x] 12.6 Test sync trigger and auto-close after 3 seconds
- [x] 12.7 Test modal close via X button, backdrop, and Escape key
- [x] 12.8 Test responsive layout on mobile and desktop viewports
- [x] 12.9 Verify correct headers sent (Authorization + X-8a-Session)
- [x] 12.10 Test refresh after sync shows imported ascents
