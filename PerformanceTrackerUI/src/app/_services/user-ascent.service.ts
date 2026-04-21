import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserAscent, UserAscentQueryParams } from '../types/user-ascent';

@Injectable({
  providedIn: 'root'
})
export class UserAscentService {
  private baseUrl = 'http://localhost:8000/api/v1';

  private ascentsSource = new BehaviorSubject<UserAscent[]>([]);
  public ascents$: Observable<UserAscent[]> = this.ascentsSource.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load ascents for the authenticated user
   */
  loadAscents(queryParams?: UserAscentQueryParams): void {
    this.getMyAscents(queryParams).subscribe({
      next: (ascents) => {
        const sorted = ascents.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        this.ascentsSource.next(sorted);
      },
      error: (error) => {
        console.error('Error loading ascents:', error);
        this.ascentsSource.next([]);
      }
    });
  }

  /**
   * Get all ascents for the authenticated user from the API
   * Requires authentication - uses JWT token from auth headers
   */
  getMyAscents(queryParams?: UserAscentQueryParams): Observable<UserAscent[]> {
    let params = new HttpParams();

    if (queryParams) {
      if (queryParams.skip !== undefined) {
        params = params.set('skip', queryParams.skip.toString());
      }
      if (queryParams.limit !== undefined) {
        params = params.set('limit', queryParams.limit.toString());
      }
      if (queryParams.start_date) {
        params = params.set('start_date', queryParams.start_date);
      }
      if (queryParams.end_date) {
        params = params.set('end_date', queryParams.end_date);
      }
      if (queryParams.grade) {
        params = params.set('grade', queryParams.grade);
      }
      if (queryParams.ascent_type) {
        params = params.set('ascent_type', queryParams.ascent_type);
      }
      if (queryParams.crag_name) {
        params = params.set('crag_name', queryParams.crag_name);
      }
    }

    return this.http.get<UserAscent[]>(`${this.baseUrl}/my-ascents`, { params });
  }

  /**
   * Get a single ascent by ID (must belong to authenticated user)
   */
  getAscentById(ascentId: number): Observable<UserAscent> {
    return this.http.get<UserAscent>(`${this.baseUrl}/user-ascents/${ascentId}`);
  }

  /**
   * Get currently loaded ascents (synchronous)
   */
  getAscents(): UserAscent[] {
    return this.ascentsSource.value;
  }

  /**
   * Filter ascents by date range
   */
  filterByDateRange(startDate?: Date, endDate?: Date): UserAscent[] {
    const ascents = this.ascentsSource.value;

    if (!startDate && !endDate) {
      return ascents;
    }

    return ascents.filter(ascent => {
      if (!ascent.date) return false;
      const ascentDate = new Date(ascent.date);
      const afterStart = !startDate || ascentDate >= startDate;
      const beforeEnd = !endDate || ascentDate <= endDate;
      return afterStart && beforeEnd;
    });
  }

  /**
   * Filter ascents by grade
   */
  filterByGrade(grade: string): UserAscent[] {
    return this.ascentsSource.value.filter(ascent => ascent.grade === grade);
  }

  /**
   * Filter ascents by ascent type (e.g., 'onsight', 'flash', 'redpoint')
   */
  filterByAscentType(ascentType: string): UserAscent[] {
    return this.ascentsSource.value.filter(ascent =>
      ascent.ascent_type?.toLowerCase() === ascentType.toLowerCase()
    );
  }

  /**
   * Group ascents by crag
   */
  groupByCrag(): Map<string, UserAscent[]> {
    const grouped = new Map<string, UserAscent[]>();

    this.ascentsSource.value.forEach(ascent => {
      const crag = ascent.crag_name || 'Unknown';
      if (!grouped.has(crag)) {
        grouped.set(crag, []);
      }
      grouped.get(crag)!.push(ascent);
    });

    return grouped;
  }

  /**
   * Group ascents by grade
   */
  groupByGrade(): Map<string, UserAscent[]> {
    const grouped = new Map<string, UserAscent[]>();

    this.ascentsSource.value.forEach(ascent => {
      const grade = ascent.grade || 'Unknown';
      if (!grouped.has(grade)) {
        grouped.set(grade, []);
      }
      grouped.get(grade)!.push(ascent);
    });

    return grouped;
  }

  /**
   * Get ascent statistics
   */
  getStats() {
    const ascents = this.ascentsSource.value;

    return {
      total: ascents.length,
      onsights: ascents.filter(a => a.ascent_type?.toLowerCase() === 'onsight').length,
      flashes: ascents.filter(a => a.ascent_type?.toLowerCase() === 'flash').length,
      redpoints: ascents.filter(a => a.ascent_type?.toLowerCase() === 'redpoint').length,
      uniqueCrags: new Set(ascents.map(a => a.crag_name).filter(Boolean)).size,
      averageRating: this.calculateAverageRating(ascents),
      gradesClimbed: new Set(ascents.map(a => a.grade).filter(Boolean)).size
    };
  }

  private calculateAverageRating(ascents: UserAscent[]): number {
    const rated = ascents.filter(a => a.rating !== undefined && a.rating !== null);
    if (rated.length === 0) return 0;

    const sum = rated.reduce((acc, a) => acc + (a.rating || 0), 0);
    return Math.round((sum / rated.length) * 10) / 10;
  }
}
