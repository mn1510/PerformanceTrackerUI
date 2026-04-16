import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { Climb } from '../types/climb';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockBackendInterceptor implements HttpInterceptor {
  private climbs: Climb[] = [];
  private storageKey = 'mock_climbs_data';

  constructor() {
    this.loadMockData();
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, body } = request;

    // Only intercept API calls to /api/climbs
    if (url.includes('/api/climbs')) {
      return this.handleMockRequest(url, method, body);
    }

    // Pass through all other requests (like login, register)
    return next.handle(request);
  }

  private handleMockRequest(url: string, method: string, body: any): Observable<HttpEvent<any>> {
    // Simulate network delay (300ms)
    return of(null).pipe(
      delay(300),
      switchMap(() => {
        // GET /api/climbs - Get all climbs
        if (url.endsWith('/api/climbs') && method === 'GET') {
          return of(new HttpResponse({
            status: 200,
            body: this.climbs
          }));
        }

        // GET /api/climbs/{id} - Get single climb
        if (url.match(/\/api\/climbs\/[\w-]+$/) && method === 'GET') {
          const id = this.extractId(url);
          const climb = this.climbs.find(c => c.id === id);

          if (climb) {
            return of(new HttpResponse({
              status: 200,
              body: climb
            }));
          } else {
            return throwError(() => ({
              status: 404,
              error: { message: 'Climb not found' }
            }));
          }
        }

        // POST /api/climbs - Create new climb
        if (url.endsWith('/api/climbs') && method === 'POST') {
          const newClimb: Climb = {
            ...body,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          this.climbs.unshift(newClimb);
          this.saveMockData();

          return of(new HttpResponse({
            status: 201,
            body: newClimb
          }));
        }

        // PUT /api/climbs/{id} - Update climb
        if (url.match(/\/api\/climbs\/[\w-]+$/) && method === 'PUT') {
          const id = this.extractId(url);
          const index = this.climbs.findIndex(c => c.id === id);

          if (index !== -1) {
            this.climbs[index] = {
              ...this.climbs[index],
              ...body,
              id,
              updatedAt: new Date().toISOString()
            };
            this.saveMockData();

            return of(new HttpResponse({
              status: 200,
              body: this.climbs[index]
            }));
          } else {
            return throwError(() => ({
              status: 404,
              error: { message: 'Climb not found' }
            }));
          }
        }

        // DELETE /api/climbs/{id} - Delete climb
        if (url.match(/\/api\/climbs\/[\w-]+$/) && method === 'DELETE') {
          const id = this.extractId(url);
          const index = this.climbs.findIndex(c => c.id === id);

          if (index !== -1) {
            this.climbs.splice(index, 1);
            this.saveMockData();

            return of(new HttpResponse({
              status: 204
            }));
          } else {
            return throwError(() => ({
              status: 404,
              error: { message: 'Climb not found' }
            }));
          }
        }

        return throwError(() => ({
          status: 404,
          error: { message: 'Endpoint not found' }
        }));
      })
    );
  }

  private extractId(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  private loadMockData(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.climbs = JSON.parse(stored);
      } else {
        this.climbs = this.getSampleClimbs();
        this.saveMockData();
      }
    } catch (error) {
      console.error('Error loading mock data:', error);
      this.climbs = [];
    }
  }

  private saveMockData(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.climbs));
    } catch (error) {
      console.error('Error saving mock data:', error);
    }
  }

  private getSampleClimbs(): Climb[] {
    return [
      {
        id: uuidv4(),
        name:"Test",
        date: new Date().toISOString(),
        location: 'Brooklyn Boulders',
        climbingType: 'INDOOR' as any,
        discipline: 'BOULDERING' as any,
        rockType: 'Synthetic',
        incline: 45,
        holdType: 'Crimps',
        setter: 'John Doe',
        attemptNumber: 3,
        outcome: 'REDPOINT' as any,
        effort: 7,
        overgripping: true,
        inefficientClips: false,
        routeReadingIssues: false,
        learnings: 'Need to work on finger strength for smaller crimps',
        comments: 'Great session overall',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name:"test2",
        date: new Date(Date.now() - 86400000).toISOString(),
        location: 'Central Rock Gym',
        climbingType: 'INDOOR' as any,
        discipline: 'SPORT' as any,
        rockType: 'Synthetic',
        incline: 90,
        holdType: 'Jugs',
        setter: 'Jane Smith',
        attemptNumber: 1,
        outcome: 'FLASH' as any,
        effort: 4,
        overgripping: false,
        inefficientClips: true,
        routeReadingIssues: false,
        learnings: 'Watched others first, then sent it cleanly',
        comments: 'Easy route but good for warming up',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: uuidv4(),
        name:"test",
        date: new Date(Date.now() - 172800000).toISOString(),
        location: 'The Cliffs',
        climbingType: 'INDOOR' as any,
        discipline: 'BOULDERING' as any,
        rockType: 'Synthetic',
        incline: 60,
        holdType: 'Slopers',
        setter: 'Mike Johnson',
        attemptNumber: 5,
        outcome: 'PROJECT' as any,
        effort: 9,
        overgripping: true,
        inefficientClips: false,
        routeReadingIssues: true,
        learnings: 'Need to figure out the beta for the crux move',
        comments: 'Hard project, will try again next week',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
  }
}
