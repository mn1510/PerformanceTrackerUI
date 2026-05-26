## Why

Users need to import their climbing data from 8a.nu to populate the application with their historical ascents. Currently, the database is empty for new users. This change implements a simple modal interface that allows users to authenticate with 8a.nu and trigger data synchronization.

## What Changes

- Add a modal component for 8a.nu authentication and data synchronization
- Implement a sync service that handles dual authentication (Cognito JWT + 8a.nu session cookie)
- Add a "Sync from 8a.nu" button to the activities page navigation
- Handle session cookie management and secure credential transmission
- Display sync start confirmation and error handling
- Simple "sync started" messaging (no real-time progress tracking)

## Capabilities

### New Capabilities
- `eight-a-auth-modal`: Modal UI for entering 8a.nu credentials and initiating authentication
- `sync-service`: Angular service for managing 8a.nu authentication and data ingestion API calls

### Modified Capabilities
<!-- No existing capabilities are being modified - this is new functionality -->

## Impact

**New Components:**
- `SyncModalComponent`: Bootstrap modal with credential form and status messages
- `SyncService`: API integration for `/api/v1/auth/8a-login` and `/api/v1/ingestion/user-data`

**Modified Components:**
- `ActivitiesListComponent`: Add sync button to trigger modal

**API Dependencies:**
- Backend endpoints: `/api/v1/auth/8a-login`, `/api/v1/ingestion/user-data`
- Requires dual authentication: Cognito JWT (existing) + 8a.nu session cookie (new header)

**Infrastructure:**
- AuthInterceptor already supports required headers
- No queue infrastructure needed (uses existing FastAPI BackgroundTasks)

**User Experience:**
- First-time users can import their complete climbing history
- Simple "sync started" message - user refreshes page when ready
- Session cookies are temporary (not stored persistently for security)
