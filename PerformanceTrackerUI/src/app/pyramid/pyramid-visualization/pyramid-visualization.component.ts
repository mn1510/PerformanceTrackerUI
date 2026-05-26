import { Component, Input } from '@angular/core';
import { PyramidResponse, RedpointData } from '../../types/pyramid.types';

@Component({
  selector: 'app-pyramid-visualization',
  templateUrl: './pyramid-visualization.component.html',
  styleUrls: ['./pyramid-visualization.component.css']
})
export class PyramidVisualizationComponent {
  @Input() pyramidData!: PyramidResponse;
  @Input() maxCount!: number;

  readonly CONTAINER_WIDTH = 400;

  /**
   * Calculate bar width based on count and global max
   * Ensures consistent scaling across all pyramids
   */
  getBarWidth(count: number): number {
    if (this.maxCount === 0) return 0;
    return (count / this.maxCount) * this.CONTAINER_WIDTH;
  }

  getRedpointTooltip(redpoints: RedpointData): string {
    return `${redpoints.count} redpoints (${redpoints.total_attempts} total attempts)`;
  }

  getTotalOnsights(): number {
    if (!this.pyramidData?.pyramid) return 0;
    return this.pyramidData.pyramid.reduce((sum, row) => sum + row.onsights, 0);
  }

  getTotalFlashes(): number {
    if (!this.pyramidData?.pyramid) return 0;
    return this.pyramidData.pyramid.reduce((sum, row) => sum + row.flashes, 0);
  }

  getTotalRedpoints(): number {
    if (!this.pyramidData?.pyramid) return 0;
    return this.pyramidData.pyramid.reduce((sum, row) => sum + row.redpoints.count, 0);
  }
}
