import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Country } from '../types/pyramid.types';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private baseUrl = environment.apiUrl;
  private countriesCache$?: Observable<Country[]>;

  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    if (!this.countriesCache$) {
      this.countriesCache$ = this.http.get<Country[]>(
        `${this.baseUrl}/user-countries`
      ).pipe(
        shareReplay(1)
      );
    }
    return this.countriesCache$;
  }
}
