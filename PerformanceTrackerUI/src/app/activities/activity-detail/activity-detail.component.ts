import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClimbService } from '../../_services/climb.service';
import { Climb } from '../../types/climb';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.css']
})
export class ActivityDetailComponent implements OnInit {
  climb: Climb | undefined;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private climbService: ClimbService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClimb(id);
    }
  }

  loadClimb(id: string): void {
    this.isLoading = true;
    this.climbService.getClimbById(id).subscribe({
      next: (climb) => {
        this.climb = climb;
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Climb not found');
        console.error(error);
        this.router.navigate(['/activities']);
        this.isLoading = false;
      }
    });
  }

  deleteClimb(): void {
    if (!this.climb) return;

    if (confirm('Are you sure you want to delete this climb?')) {
      this.isLoading = true;
      this.climbService.deleteClimb(this.climb.id).subscribe({
        next: () => {
          this.toastr.success('Climb deleted successfully');
          this.router.navigate(['/activities']);
        },
        error: (error) => {
          this.toastr.error('Failed to delete climb');
          console.error(error);
          this.isLoading = false;
        }
      });
    }
  }

  editClimb(): void {
    if (this.climb) {
      this.router.navigate(['/activities', this.climb.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/activities']);
  }
}
