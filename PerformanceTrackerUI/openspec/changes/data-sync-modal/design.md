## Context

The ClimbData backend API provides two-level authentication for 8a.nu data ingestion:
1. **Level 1**: Cognito JWT validates the ClimbData user identity
2. **Level 2**: 8a.nu session cookie enables access to 8a.nu's scraping endpoints

The backend ingestion process runs as a FastAPI BackgroundTask, which:
- Launches a Playwright headless browser to log into 8a.nu
- Scrapes user ascent data (250+ ascents = ~25-30 seconds with rate limiting)
- Stores data in the database linked to the user's `cognito_sub`

**Current State:**
- AuthInterceptor already adds Cognito JWT to API requests matching `/api/v1/`
- UserAscentService fetches ascents from `/api/v1/my-ascents`
- No UI exists for triggering 8a.nu sync

**Constraints:**
- Backend uses Playwright automation (no official 8a.nu API)
- Session cookies expire after ~1 hour
- Sync is long-running (25-30+ seconds for typical users)
- Backend returns immediately but processes in background

## Goals / Non-Goals

**Goals:**
- Provide a modal UI for users to enter 8a.nu credentials securely
- Display simple status messages (authenticating, sync started, complete)
- Handle errors gracefully (invalid credentials, network issues, sync failures)
- Support initial data import for new users
- Allow re-sync to fetch new ascents

**Non-Goals:**
- Real-time progress tracking (use simple "sync started" message instead)
- Status polling (no percentage or live updates)
- Automatic background syncing (manual trigger only)
- Persistent storage of 8a.nu credentials (security risk)
- Queue-based architecture (use existing BackgroundTasks)
- Two-way sync (8a.nu → ClimbData only, not bidirectional)
- Incremental sync (full re-import each time for MVP)

## Decisions

### 1. Modal vs Dedicated Page

**Decision:** Use a Bootstrap modal dialog

**Rationale:**
- Quick access from activities page without navigation
- Non-intrusive - doesn't disrupt current workflow
- Fits the "occasional operation" usage pattern
- Bootstrap modal already available in SharedModule

**Alternatives Considered:**
- Dedicated settings page: Too heavy for MVP, requires routing changes
- Inline form: Clutters activities page UI

### 2. Status Messaging Strategy

**Decision:** Simple "sync started" message without real-time progress tracking

**Rationale:**
- MVP approach - minimize complexity
- Backend process runs in background (25-30 seconds typical)
- User can refresh activities page when ready to see imported data
- Avoids polling overhead and state management complexity

**User Flow:**
1. User enters credentials
2. Modal shows "Authenticating..."
3. On success: "Sync started! This may take a minute. Refresh the page to see your climbs."
4. Modal closes automatically after 3 seconds

**Alternatives Considered:**
- Real-time progress polling: Adds complexity, not essential for MVP
- WebSockets: Overkill for occasional operation
- Current choice: Simple and functional, can enhance later if needed

### 3. Session Cookie Storage

**Decision:** Store session cookie only in component state (not localStorage)

**Rationale:**
- Session cookies grant full access to user's 8a.nu account
- Minimize security risk by keeping in-memory only
- Cookie valid for ~1 hour, sufficient for sync operation
- Forces users to re-authenticate for each sync (acceptable for MVP)

**Flow:**
```
1. User enters credentials
2. Call /auth/8a-login → receive session cookie
3. Store cookie in component variable
4. Immediately call /ingestion/user-data with cookie in header
5. Cookie discarded when modal closes
```

**Alternatives Considered:**
- localStorage: Security risk, cookies persist after close
- Backend storage: Would require backend changes, same security concerns

### 4. Error Handling Levels

**Decision:** Three-tier error handling

**Tiers:**
1. **Authentication Errors** (401): "Invalid 8a.nu credentials. Please check your username and password."
2. **Network Errors** (503, timeout): "Unable to connect to 8a.nu. Please try again later."
3. **Sync Errors** (partial failure): "Sync started but may be incomplete. Check logs for details."

**Rationale:**
- Clear, actionable error messages for users
- Different recovery paths for different failure modes
- Matches backend error patterns

### 5. Component Structure

**Decision:** Single `SyncModalComponent` with embedded form and progress UI

**Rationale:**
- Small, focused component (~150-200 lines)
- State machine: Idle → Authenticating → Syncing → Complete/Error
- All sync-related logic contained in one place

**Structure:**
```
sync-modal/
├── sync-modal.component.ts
├── sync-modal.component.html
├── sync-modal.component.css
└── sync-modal.component.spec.ts
```

**State Flow:**
```
IDLE (show form)
  ↓ [user submits]
AUTHENTICATING (disable form, show "Authenticating...")
  ↓ [auth success]
SYNCING (show "Sync started! Refresh page in a minute.")
  ↓ [auto-close after 3s]
CLOSED

  Any state → ERROR (show error, allow retry)
```

**Alternatives Considered:**
- Separate form and progress components: Over-engineering for MVP
- Multi-step wizard: Too complex for 2-field form

## Risks / Trade-offs

### Risk: No Real-Time Feedback
**Impact:** User doesn't know when sync completes
**Mitigation:**
- Clear messaging: "Refresh page in a minute to see your climbs"
- Acceptable for MVP (most users will understand)
- Can add progress tracking in future iteration if users request it

### Risk: Session Cookie Exposure
**Impact:** Cookie grants full 8a.nu access if stolen
**Mitigation:**
- Never store in localStorage (memory-only)
- Clear on modal close
- Use HTTPS for transmission (already required)
- Future: Backend could store encrypted credentials

### Risk: User Leaves Page Mid-Sync
**Impact:** Background task continues, but user loses progress visibility
**Mitigation:**
- Show warning: "Sync is in progress. Closing will continue in background."
- User can check sync status by re-opening modal
- Logs persist in `/api/v1/ingestion/user-logs`

### Risk: Sync Fails Partially
**Impact:** Some ascents imported, others missing
**Mitigation:**
- Display last sync status from logs
- Allow re-running sync (backend handles deduplication via `cognito_sub + ascent_id`)
- Future: Track which page failed, resume from there

### Trade-off: No Queue Architecture
**Current:** Uses FastAPI BackgroundTasks
**Limitation:** Task lost if server restarts during sync
**Acceptable Because:**
- MVP scope, server restarts are rare
- User can re-trigger sync if needed
- Queue adds significant complexity (Redis, workers, monitoring)
- Can upgrade later without changing Angular UI

### Trade-off: Full Re-Import (No Incremental)
**Current:** Fetches all ascents every sync
**Limitation:** Slow for users with 500+ ascents
**Acceptable Because:**
- Backend deduplicates (no duplicate database entries)
- Sync is occasional (not daily)
- MVP focuses on initial import
- Incremental sync requires tracking last sync date (future enhancement)

## Migration Plan

Not applicable - this is new functionality with no existing data or users to migrate.

**Deployment:**
1. Deploy Angular changes (modal component + service)
2. No backend changes needed (endpoints already exist)
3. Feature is immediately available to all users

**Rollback:**
- Remove "Sync from 8a.nu" button
- Keep modal code (no harm if not invoked)

## Open Questions

1. **Should we show detailed error logs in the UI?**
   - Current: Generic error messages
   - Alternative: Link to full log viewer showing backend error details
   - Decision: Start with generic, add detailed logs if users request

2. **Should we cache the countries list?**
   - Related: CountriesService calls `/api/v1/countries` for pyramid filters
   - After sync, countries list is populated
   - Could add caching to avoid repeated API calls
   - Decision: Defer to separate optimization change

3. **Should modal be reusable for other sync operations?**
   - Future: Sync from 27Crags, TheCrag, etc.
   - Current: Hardcoded for 8a.nu
   - Decision: Keep simple for now, refactor if second sync source is added
