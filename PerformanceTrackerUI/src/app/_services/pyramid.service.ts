import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PyramidFilters, PyramidResponse, PyramidGradeRow } from '../types/pyramid.types';
import { UserAscent } from '../types/user-ascent';

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

  /**
   * Get unique areas from ascents for a given country
   * Returns sorted array of unique area names
   */
  getUniqueAreas(countrySlug: string, ascents: UserAscent[]): string[] {
    const areas = new Set<string>();

    ascents.forEach(ascent => {
      // Filter by country if specified
      if (countrySlug && ascent.country_slug?.toLowerCase() !== countrySlug.toLowerCase()) {
        return;
      }

      // Try to extract area from raw_data if available
      const areaName = this.extractAreaName(ascent);
      if (areaName) {
        areas.add(areaName);
      }
    });

    return Array.from(areas).sort();
  }

  /**
   * Get unique crags from ascents for a given country and optional area
   * Returns sorted array of unique crag names
   */
  getUniqueCrags(countrySlug: string, areaName: string | undefined, ascents: UserAscent[]): string[] {
    const crags = new Set<string>();

    ascents.forEach(ascent => {
      // Filter by country if specified
      if (countrySlug && ascent.country_slug?.toLowerCase() !== countrySlug.toLowerCase()) {
        return;
      }

      // Filter by area if specified
      if (areaName) {
        const ascentArea = this.extractAreaName(ascent);
        if (ascentArea !== areaName) {
          return;
        }
      }

      // Add crag name if present
      if (ascent.crag_name) {
        crags.add(ascent.crag_name);
      }
    });

    return Array.from(crags).sort();
  }

  /**
   * Calculate pyramid data with optional area and crag filters
   * Filters ascents client-side before aggregating
   */
  calculatePyramidData(
    ascents: UserAscent[],
    filters: PyramidFilters
  ): PyramidResponse {
    // Filter ascents based on all criteria
    let filtered = ascents.filter(ascent => {
      // Country filter (only apply if non-empty)
      if (filters.country_slug && filters.country_slug.trim() !== '') {
        if (ascent.country_slug?.toLowerCase() !== filters.country_slug.toLowerCase()) {
          return false;
        }
      }

      // Area filter (only apply if non-empty)
      if (filters.areaName && filters.areaName.trim() !== '') {
        const ascentArea = this.extractAreaName(ascent);
        if (ascentArea !== filters.areaName) {
          return false;
        }
      }

      // Crag filter (only apply if non-empty)
      if (filters.cragName && filters.cragName.trim() !== '') {
        if (ascent.crag_name !== filters.cragName) {
          return false;
        }
      }

      // Date range filter
      if (filters.date_from || filters.date_to) {
        if (!ascent.date) return false;
        const ascentDate = new Date(ascent.date);
        if (filters.date_from && ascentDate < new Date(filters.date_from)) return false;
        if (filters.date_to && ascentDate > new Date(filters.date_to)) return false;
      }

      return true;
    });

    // Group by grade and count by ascent type
    const gradeMap = new Map<string, {
      grade_index: number;
      onsights: number;
      flashes: number;
      redpoint_count: number;
      redpoint_attempts: number;
    }>();

    filtered.forEach(ascent => {
      if (!ascent.grade || ascent.grade_index === undefined) return;

      if (!gradeMap.has(ascent.grade)) {
        gradeMap.set(ascent.grade, {
          grade_index: ascent.grade_index,
          onsights: 0,
          flashes: 0,
          redpoint_count: 0,
          redpoint_attempts: 0
        });
      }

      const gradeData = gradeMap.get(ascent.grade)!;
      const ascentType = ascent.ascent_type?.toLowerCase().trim();

      // Match various ascent type formats
      if (ascentType === 'onsight' || ascentType === 'os') {
        gradeData.onsights++;
      } else if (ascentType === 'flash' || ascentType === 'f') {
        gradeData.flashes++;
      } else if (ascentType === 'redpoint' || ascentType === 'rp' || ascentType === 'red point') {
        gradeData.redpoint_count++;
        gradeData.redpoint_attempts += ascent.tries || 1;
      }
      // If no ascent_type, count it as redpoint by default
      else if (!ascentType && ascent.grade) {
        gradeData.redpoint_count++;
        gradeData.redpoint_attempts += ascent.tries || 1;
      }
    });

    // Convert to pyramid format and sort by grade index
    const pyramid: PyramidGradeRow[] = Array.from(gradeMap.entries())
      .map(([grade, data]) => ({
        grade,
        grade_index: data.grade_index,
        onsights: data.onsights,
        flashes: data.flashes,
        redpoints: {
          count: data.redpoint_count,
          total_attempts: data.redpoint_attempts
        }
      }))
      .sort((b, a) => a.grade_index - b.grade_index);

    return {
      pyramid,
      metadata: {
        total_ascents: filtered.length,
        date_range: {
          from: filters.date_from || null,
          to: filters.date_to || null
        },
        filters_applied: {
          country: filters.country_slug || undefined
        }
      }
    };
  }

  /**
   * Extract area name from ascent raw_data or other fields
   * This is a helper method that can be expanded based on actual data structure
   */
  private extractAreaName(ascent: UserAscent): string | undefined {
    // Try raw_data first (8a.nu data structure)
    if (ascent.raw_data) {
      if (ascent.raw_data['area']) {
        return ascent.raw_data['area'];
      }
      if (ascent.raw_data['areaName']) {
        return ascent.raw_data['areaName'];
      }
      if (ascent.raw_data['area_name']) {
        return ascent.raw_data['area_name'];
      }
    }

    // Could also try parsing from crag_name if it follows a pattern
    // For example: "Catalunya > Montserrat > Coll del Pterodactil"
    // Would extract "Catalunya" as area

    return undefined;
  }
}
