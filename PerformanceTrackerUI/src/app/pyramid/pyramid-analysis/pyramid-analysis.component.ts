import { Component, OnInit } from '@angular/core';
import { PyramidInstance, PyramidFilters, Country, PyramidResponse } from '../../types/pyramid.types';
import { PyramidService } from '../../_services/pyramid.service';
import { CountriesService } from '../../_services/countries.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pyramid-analysis',
  templateUrl: './pyramid-analysis.component.html',
  styleUrls: ['./pyramid-analysis.component.css']
})
export class PyramidAnalysisComponent implements OnInit {
  pyramids: PyramidInstance[] = [];
  globalMaxCount: number = 0;
  countries: Country[] = [];

  constructor(
    private pyramidService: PyramidService,
    private countriesService: CountriesService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.addPyramid();
    this.loadCountries();
  }

  /**
   * Get default filter values: all countries, last 5 years
   */
  private getDefaultFilters(): PyramidFilters {
    const today = new Date();
    const fiveYearsAgo = new Date(today);
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);

    return {
      country_slug: '',
      date_from: fiveYearsAgo.toISOString().split('T')[0],
      date_to: today.toISOString().split('T')[0]
    };
  }

  /**
   * Add a new pyramid with default filters (max 4 pyramids)
   */
  addPyramid(): void {
    if (this.pyramids.length >= 4) {
      this.toastr.warning('Maximum 4 pyramids allowed');
      return;
    }

    const newPyramid: PyramidInstance = {
      id: this.generateId(),
      filters: this.getDefaultFilters(),
      data: null,
      loading: false,
      error: null
    };

    this.pyramids.push(newPyramid);
  }

  /**
   * Remove pyramid and recalculate global max
   */
  removePyramid(id: string): void {
    this.pyramids = this.pyramids.filter(p => p.id !== id);

    if (this.pyramids.length > 0) {
      this.calculateGlobalMax();
    } else {
      this.globalMaxCount = 0;
    }
  }

  /**
   * Calculate global maximum count across all pyramids for consistent scaling
   */
  calculateGlobalMax(): void {
    let max = 0;

    this.pyramids.forEach(pyramid => {
      if (!pyramid.data?.pyramid) return;

      pyramid.data.pyramid.forEach(gradeRow => {
        const gradeMax = Math.max(
          gradeRow.onsights,
          gradeRow.flashes,
          gradeRow.redpoints.count
        );
        max = Math.max(max, gradeMax);
      });
    });

    this.globalMaxCount = max || 1;
  }

  /**
   * Handle pyramid data loaded event
   */
  onPyramidDataLoaded(event: { pyramidId: string; data: PyramidResponse }): void {
    const pyramid = this.pyramids.find(p => p.id === event.pyramidId);
    if (pyramid) {
      pyramid.data = event.data;
      pyramid.loading = false;
      pyramid.error = null;
    }

    this.calculateGlobalMax();
  }

  /**
   * Load countries for dropdown filter
   */
  loadCountries(): void {
    this.countriesService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: (err) => {
        console.error('Failed to load countries:', err);
        this.countries = [];
      }
    });
  }

  /**
   * Generate unique ID for pyramid instances
   */
  private generateId(): string {
    return `pyramid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
