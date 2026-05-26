import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PyramidInstance, Country, PyramidResponse } from '../../types/pyramid.types';
import { PyramidService } from '../../_services/pyramid.service';
import { UserAscent } from '../../types/user-ascent';

@Component({
  selector: 'app-pyramid-card',
  templateUrl: './pyramid-card.component.html',
  styleUrls: ['./pyramid-card.component.css']
})
export class PyramidCardComponent implements OnChanges {
  @Input() pyramidInstance!: PyramidInstance;
  @Input() countries!: Country[];
  @Input() ascents!: UserAscent[];

  @Output() dataLoaded = new EventEmitter<{ pyramidId: string; data: PyramidResponse }>();
  @Output() removeRequested = new EventEmitter<string>();

  constructor(private pyramidService: PyramidService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Only proceed if we have the required data
    if (!this.pyramidInstance) return;

    // Update available areas/crags when ascents or country changes
    if (changes['ascents'] || changes['pyramidInstance']) {
      this.updateAvailableFilters();

      // Auto-load data when ascents become available for the first time
      if (changes['ascents'] && this.ascents && this.ascents.length > 0 && !this.pyramidInstance.data) {
        this.loadData();
      }
    }
  }

  loadData(): void {
    if (!this.ascents || !this.pyramidInstance) {
      console.error('Cannot load pyramid data: missing ascents or pyramid instance');
      return;
    }

    this.pyramidInstance.loading = true;
    this.pyramidInstance.error = null;

    try {
      // Calculate pyramid data client-side from ascents
      const data = this.pyramidService.calculatePyramidData(
        this.ascents,
        this.pyramidInstance.filters
      );

      this.pyramidInstance.data = data;
      this.pyramidInstance.loading = false;

      this.dataLoaded.emit({
        pyramidId: this.pyramidInstance.id,
        data: data
      });
    } catch (err) {
      this.pyramidInstance.loading = false;
      this.pyramidInstance.error = 'Failed to calculate pyramid data';
      console.error('Pyramid calculation error:', err);
    }
  }

  /**
   * Update available areas and crags based on current country selection
   */
  updateAvailableFilters(): void {
    if (!this.ascents || !this.pyramidInstance) return;

    const countrySlug = this.pyramidInstance.filters.country_slug;

    // Update available areas
    this.pyramidInstance.availableAreas = this.pyramidService.getUniqueAreas(
      countrySlug,
      this.ascents
    );

    // Update available crags
    this.pyramidInstance.availableCrags = this.pyramidService.getUniqueCrags(
      countrySlug,
      this.pyramidInstance.filters.areaName,
      this.ascents
    );
  }

  /**
   * Handle country change - reset area and crag filters
   */
  onCountryChange(): void {
    this.pyramidInstance.filters.areaName = '';
    this.pyramidInstance.filters.cragName = '';
    this.updateAvailableFilters();
  }

  /**
   * Handle area change - reset crag filter
   */
  onAreaChange(): void {
    this.pyramidInstance.filters.cragName = '';
    this.updateAvailableFilters();
  }

  remove(): void {
    this.removeRequested.emit(this.pyramidInstance.id);
  }
}
