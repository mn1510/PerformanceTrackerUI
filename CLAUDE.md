# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Performance Tracker UI is an Angular 16 application for tracking climbing performance. It uses AWS Cognito for authentication and includes a mock backend interceptor for development without a real API server.

## Working Directory

**IMPORTANT**: The Angular project is located in `PerformanceTrackerUI/PerformanceTrackerUI/`, NOT in the repository root. Always navigate to this directory before running Angular CLI commands.

```bash
cd PerformanceTrackerUI/PerformanceTrackerUI
```

## Development Commands

### Running the Application
```bash
npm start              # Start dev server with HTTPS on https://localhost:4200
ng serve              # Alternative to npm start
```

The application is configured to run with SSL using certificates in `ssl/` directory (`localhost.pem` and `localhost-key.pem`).

### Building
```bash
npm run build         # Production build (outputs to dist/performance-tracker-ui)
npm run watch         # Development build with watch mode
ng build              # Direct Angular CLI build
```

### Testing
```bash
npm test              # Run tests with Karma
ng test              # Alternative test command
```

## Architecture

### Authentication Flow

The application uses **AWS Cognito** for authentication with AWS Amplify SDK:
- Cognito configuration is in `src/environments/environment.ts`
- Amplify is initialized in `AppComponent.ngOnInit()`
- `AccountService` handles all auth operations (login, register, logout, confirmSignUp)
- Auth state is managed via RxJS `BehaviorSubject` (`currentUser$` observable)
- `authGuard` protects routes requiring authentication by checking both the observable and Cognito session
- User data and JWT tokens are stored in localStorage

### Mock Backend System

**CRITICAL**: The app uses `MockBackendInterceptor` to simulate API calls during development:
- Intercepts HTTP requests to `/api/climbs` endpoints
- Stores data in browser localStorage under `mock_climbs_data` key
- Provides full CRUD operations (GET, POST, PUT, DELETE)
- Does NOT intercept auth-related requests (login, register) - those go to Cognito
- Simulates 300ms network delay
- Located at `src/app/_interceptors/mock-backend.interceptor.ts`

When working with climbing data, remember that changes are only persisted in localStorage, not a real backend.

### Services Architecture

**ClimbService** (`src/app/_services/climb.service.ts`):
- Manages climbing log data with reactive state pattern
- Exposes `climbs$` observable (BehaviorSubject) for reactive updates
- All CRUD operations automatically update the local state
- Data sorted by date (newest first)

**AccountService** (`src/app/_services/account.service.ts`):
- Manages authentication state via `currentUser$` observable
- Wraps AWS Amplify auth functions in RxJS observables using `from()`
- Handles user registration with Cognito user attributes

### Error Handling

`ErrorInterceptor` provides centralized HTTP error handling:
- 400: Displays validation errors or generic bad request
- 401: Shows "Unauthorised" toast
- 404: Redirects to `/not-found`
- 500: Redirects to `/server-error` with error state
- Default: Shows generic error toast

Toastr notifications appear at `toast-bottom-right` position.

### Routing Structure

Routes are protected by `authGuard`:
- Public: `/`, `/login`
- Protected: `/activities`, `/activities/new`, `/activities/:id`, `/activities/:id/edit`
- Error pages: `/errors`, `/not-found`, `/server-error`

### Data Model

**Climb** interface (`src/app/types/climb.ts`):
- Core climb tracking entity with enums for ClimbingType, Discipline, Outcome
- Includes performance metrics (effort 1-10, overgripping, inefficientClips, routeReadingIssues)
- Supports both indoor and outdoor climbing with discipline-specific fields

### Shared Module

`SharedModule` bundles commonly used third-party modules:
- ngx-bootstrap (dropdown, datepicker)
- ngx-toastr (notifications)

Import this instead of importing these modules individually in components.

## Key Angular Patterns

- **Reactive Forms**: Used in climb-form and registration
- **Route Guards**: Functional guard pattern (`CanActivateFn`) with dependency injection via `inject()`
- **HTTP Interceptors**: Chained interceptors for error handling and mock backend
- **Observable State Management**: Services use BehaviorSubject for reactive state

## Styling

- Bootstrap 5 with Bootswatch "United" theme
- Font Awesome 4.7 for icons
- Component-specific styles kept minimal (2kb warning, 4kb error budget)

## Important Notes

- The baseUrl in services points to `https://localhost:5001/api/` but this is never actually called for climb data due to the mock interceptor
- SSL certificates are required for local development
- User attributes in Cognito include: email, family_name, birthdate, gender, address, timezone, phone_number
