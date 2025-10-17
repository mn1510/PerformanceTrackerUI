import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClimbService } from '../../_services/climb.service';
import { Climb, ClimbingType, Discipline } from '../../types/climb';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-activities-list',
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.css']
})
export class ActivitiesListComponent implements OnInit, OnDestroy {
  climbs: Climb[] = [];
  filteredClimbs: Climb[] = [];
  editingClimbId: string | null = null;
  editingClimb: Partial<Climb> = {};
  isLoading = false;

  selectedType: string = 'ALL';
  selectedDiscipline: string = 'ALL';
  searchTerm: string = '';

  climbingTypes = ['ALL', ...Object.values(ClimbingType)];
  disciplines = ['ALL', ...Object.values(Discipline)];

  private destroy$ = new Subject<void>();

  constructor(
    private climbService: ClimbService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.climbService.climbs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(climbs => {
        this.climbs = climbs;
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters(): void {
    this.filteredClimbs = this.climbs.filter(climb => {
      const typeMatch = this.selectedType === 'ALL' || climb.climbingType === this.selectedType;
      const disciplineMatch = this.selectedDiscipline === 'ALL' || climb.discipline === this.selectedDiscipline;
      const searchMatch = this.searchTerm === '' ||
        climb.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (climb.comments?.toLowerCase().includes(this.searchTerm.toLowerCase()));
      return typeMatch && disciplineMatch && searchMatch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  startEdit(climb: Climb): void {
    this.editingClimbId = climb.id;
    this.editingClimb = { ...climb };
  }

  saveEdit(climbId: string): void {
    this.isLoading = true;
    this.climbService.updateClimb(climbId, this.editingClimb).subscribe({
      next: () => {
        this.toastr.success('Climb updated successfully');
        this.cancelEdit();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to update climb');
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  cancelEdit(): void {
    this.editingClimbId = null;
    this.editingClimb = {};
  }

  deleteClimb(climbId: string): void {
    if (confirm('Are you sure you want to delete this climb?')) {
      this.isLoading = true;
      this.climbService.deleteClimb(climbId).subscribe({
        next: () => {
          this.toastr.success('Climb deleted successfully');
          this.isLoading = false;
        },
        error: (error) => {
          this.toastr.error('Failed to delete climb');
          console.error(error);
          this.isLoading = false;
        }
      });
    }
  }

  isEditing(climbId: string): boolean {
    return this.editingClimbId === climbId;
  }
}
