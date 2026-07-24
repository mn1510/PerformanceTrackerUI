import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PyramidResponse } from '../../types/pyramid.types';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-pyramid-visualization',
  templateUrl: './pyramid-visualization.component.html',
  styleUrls: ['./pyramid-visualization.component.css']
})
export class PyramidVisualizationComponent implements OnChanges {
  @Input() pyramidData!: PyramidResponse;

  public barChartLegend = true;

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.x;
            return `${label}: ${value} ascents`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Ascents'
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Grade'
        }
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pyramidData'] && this.pyramidData) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    if (!this.pyramidData?.pyramid || this.pyramidData.pyramid.length === 0) {
      this.barChartData = {
        labels: [],
        datasets: []
      };
      return;
    }

    // Extract grade labels
    const labels = this.pyramidData.pyramid.map(row => row.grade);

    // Create datasets for each ascent type
    const onsightData = this.pyramidData.pyramid.map(row => row.onsights);
    const flashData = this.pyramidData.pyramid.map(row => row.flashes);
    const redpointData = this.pyramidData.pyramid.map(row => row.redpoints.count);

    this.barChartData = {
      labels,
      datasets: [
        {
          label: 'Onsight',
          data: onsightData,
          backgroundColor: 'rgba(76, 175, 80, 0.7)',  // Green
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1
        },
        {
          label: 'Flash',
          data: flashData,
          backgroundColor: 'rgba(255, 152, 0, 0.7)',  // Orange
          borderColor: 'rgba(255, 152, 0, 1)',
          borderWidth: 1
        },
        {
          label: 'Redpoint',
          data: redpointData,
          backgroundColor: 'rgba(244, 67, 54, 0.7)',  // Red
          borderColor: 'rgba(244, 67, 54, 1)',
          borderWidth: 1
        }
      ]
    };
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

  get isEmpty(): boolean {
    return !this.pyramidData?.pyramid || this.pyramidData.pyramid.length === 0;
  }
}
