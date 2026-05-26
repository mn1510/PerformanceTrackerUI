import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PyramidInstance, Country, PyramidResponse } from '../../types/pyramid.types';
import { PyramidService } from '../../_services/pyramid.service';

@Component({
  selector: 'app-pyramid-card',
  templateUrl: './pyramid-card.component.html',
  styleUrls: ['./pyramid-card.component.css']
})
export class PyramidCardComponent {
  @Input() pyramidInstance!: PyramidInstance;
  @Input() globalMaxCount!: number;
  @Input() countries!: Country[];

  @Output() dataLoaded = new EventEmitter<{ pyramidId: string; data: PyramidResponse }>();
  @Output() removeRequested = new EventEmitter<string>();

  constructor(private pyramidService: PyramidService) {}

  loadData(): void {
    this.pyramidInstance.loading = true;
    this.pyramidInstance.error = null;

    this.pyramidService.getPyramid(this.pyramidInstance.filters)
      .subscribe({
        next: (data) => {
          this.pyramidInstance.data = data;
          this.pyramidInstance.loading = false;

          this.dataLoaded.emit({
            pyramidId: this.pyramidInstance.id,
            data: data
          });
        },
        error: (err) => {
          this.pyramidInstance.loading = false;
          this.pyramidInstance.error = 'Failed to load pyramid data';
          console.error('Pyramid load error:', err);
        }
      });
  }

  remove(): void {
    this.removeRequested.emit(this.pyramidInstance.id);
  }
}
