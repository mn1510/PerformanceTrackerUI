import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Climb } from '../types/climb';

@Injectable({
  providedIn: 'root'
})
export class ClimbService {
  private baseUrl = 'https://localhost:5001/api/';

  private climbsSource = new BehaviorSubject<Climb[]>([]);
  public climbs$: Observable<Climb[]> = this.climbsSource.asObservable();

  constructor(private http: HttpClient) {
    this.loadClimbs();
  }

  loadClimbs(): void {
    this.http.get<Climb[]>(this.baseUrl + 'climbs')
      .subscribe({
        next: (climbs) => {
          const sorted = climbs.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          this.climbsSource.next(sorted);
        },
        error: (error) => {
          console.error('Error loading climbs:', error);
          this.climbsSource.next([]);
        }
      });
  }

  getClimbs(): Climb[] {
    return this.climbsSource.value;
  }

  getClimbById(id: string): Observable<Climb> {
    return this.http.get<Climb>(this.baseUrl + 'climbs/' + id);
  }

  createClimb(climb: Omit<Climb, 'id' | 'createdAt' | 'updatedAt'>): Observable<Climb> {
    return this.http.post<Climb>(this.baseUrl + 'climbs', climb).pipe(
      tap(newClimb => {
        const climbs = [newClimb, ...this.climbsSource.value];
        this.climbsSource.next(climbs);
      })
    );
  }

  updateClimb(id: string, updatedClimb: Partial<Climb>): Observable<Climb> {
    return this.http.put<Climb>(this.baseUrl + 'climbs/' + id, updatedClimb).pipe(
      tap(updated => {
        const climbs = this.climbsSource.value.map(c =>
          c.id === id ? updated : c
        );
        this.climbsSource.next(climbs);
      })
    );
  }

  deleteClimb(id: string): Observable<any> {
    return this.http.delete(this.baseUrl + 'climbs/' + id).pipe(
      tap(() => {
        const climbs = this.climbsSource.value.filter(c => c.id !== id);
        this.climbsSource.next(climbs);
      })
    );
  }
}
