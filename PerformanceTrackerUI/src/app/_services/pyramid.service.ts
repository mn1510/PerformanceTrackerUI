import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PyramidFilters, PyramidResponse } from '../types/pyramid.types';

@Injectable({
  providedIn: 'root'
})
export class PyramidService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPyramid(filters: PyramidFilters): Observable<PyramidResponse> {
    let params = new HttpParams();

    if (filters.country_slug) {
      params = params.set('country_slug', filters.country_slug.toLowerCase());
    }
    if (filters.date_from) {
      params = params.set('date_from', filters.date_from);
    }
    if (filters.date_to) {
      params = params.set('date_to', filters.date_to);
    }

    return this.http.get<PyramidResponse>(
      `${this.baseUrl}/users/pyramid-analysis`,
      { params }
    );
  }
}
