# ClimbData API Integration

This document describes the integration with the ClimbData backend API for fetching user ascent data.

## Files Created

- `/src/app/types/user-ascent.ts` - TypeScript interfaces for user ascent data
- `/src/app/_services/user-ascent.service.ts` - Angular service for fetching ascents
- `/src/app/_interceptors/auth.interceptor.ts` - HTTP interceptor for JWT authentication

## Setup

### 1. Register the Auth Interceptor

Add the auth interceptor to `app.module.ts`:

```typescript
import { AuthInterceptor } from './_interceptors/auth.interceptor';

// In the providers array:
{
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
}
```

### 2. Ensure Backend is Running

Start the ClimbData API server:

```bash
cd /Users/mohsinnaveed/Documents/Training/ClimbApp/ClimbData
uv run python api_main.py
```

The API will be available at `http://localhost:8000`

## Usage

### Basic Example

```typescript
import { Component, OnInit } from '@angular/core';
import { UserAscentService } from './_services/user-ascent.service';
import { UserAscent } from './types/user-ascent';

@Component({
  selector: 'app-my-ascents',
  template: `
    <div *ngFor="let ascent of ascents">
      <h3>{{ ascent.route_name }}</h3>
      <p>Grade: {{ ascent.grade }}</p>
      <p>Date: {{ ascent.date | date }}</p>
      <p>Type: {{ ascent.ascent_type }}</p>
      <p>Crag: {{ ascent.crag_name }}</p>
    </div>
  `
})
export class MyAscentsComponent implements OnInit {
  ascents: UserAscent[] = [];

  constructor(private ascentService: UserAscentService) {}

  ngOnInit(): void {
    // Load ascents for authenticated user
    this.ascentService.loadAscents();

    // Subscribe to changes
    this.ascentService.ascents$.subscribe(ascents => {
      this.ascents = ascents;
    });
  }
}
```

### With Query Parameters

```typescript
// Filter by date range
this.ascentService.loadAscents({
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});

// Filter by grade
this.ascentService.loadAscents({
  grade: '7a'
});

// Filter by ascent type
this.ascentService.loadAscents({
  ascent_type: 'onsight'
});

// Pagination
this.ascentService.loadAscents({
  skip: 0,
  limit: 50
});
```

### Get Statistics

```typescript
const stats = this.ascentService.getStats();
console.log(`Total ascents: ${stats.total}`);
console.log(`Onsights: ${stats.onsights}`);
console.log(`Flashes: ${stats.flashes}`);
console.log(`Unique crags: ${stats.uniqueCrags}`);
console.log(`Average rating: ${stats.averageRating}`);
```

### Filter Client-Side

```typescript
// Filter by grade
const sevenAs = this.ascentService.filterByGrade('7a');

// Filter by date range
const recent = this.ascentService.filterByDateRange(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

// Filter by ascent type
const onsights = this.ascentService.filterByAscentType('onsight');
```

### Group Data

```typescript
// Group by crag
const byCrag = this.ascentService.groupByCrag();
byCrag.forEach((ascents, cragName) => {
  console.log(`${cragName}: ${ascents.length} ascents`);
});

// Group by grade
const byGrade = this.ascentService.groupByGrade();
```

## API Endpoints

The service calls these ClimbData API endpoints:

- `GET /api/v1/my-ascents` - Get all ascents for authenticated user
- `GET /api/v1/user-ascents/{ascent_id}` - Get a specific ascent

## Authentication

The service uses JWT token authentication via AWS Cognito. The `AuthInterceptor` automatically adds the Bearer token to all requests to `localhost:8000`.

The token is obtained from the user's Cognito session and added to the `Authorization` header.

## Data Model

See `/src/app/types/user-ascent.ts` for the complete TypeScript interface.

Key fields:
- `id` - Database ID
- `cognito_sub` - User identifier
- `route_name` - Name of the route
- `grade` - Route grade (e.g., "7a", "5.11d")
- `ascent_type` - Type of ascent (onsight, flash, redpoint)
- `date` - Date of ascent
- `crag_name` - Name of the climbing crag
- `tries` - Number of attempts
- `rating` - User's rating (1-3 stars)
- `comment` - User's comment
- `raw_data` - Raw API response data
- `custom_data` - Custom user data

## CORS Configuration

If you encounter CORS issues, ensure the ClimbData backend has CORS configured for `http://localhost:4200` (or your Angular dev server port).
