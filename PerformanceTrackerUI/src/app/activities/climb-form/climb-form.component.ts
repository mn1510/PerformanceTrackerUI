import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClimbService } from '../../_services/climb.service';
import { ClimbingType, Discipline, Outcome } from '../../types/climb';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-climb-form',
  templateUrl: './climb-form.component.html',
  styleUrls: ['./climb-form.component.css']
})
export class ClimbFormComponent implements OnInit {
  climbForm!: FormGroup;
  isEditMode = false;
  climbId: string | null = null;
  isLoading = false;
  isSaving = false;

  climbingTypes = Object.values(ClimbingType);
  disciplines = Object.values(Discipline);
  outcomes = Object.values(Outcome);

  constructor(
    private fb: FormBuilder,
    private climbService: ClimbService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.climbId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.climbId;

    this.initForm();
    this.setupSmartValidation();

    if (this.isEditMode && this.climbId) {
      this.loadClimb(this.climbId);
    }
  }

  initForm(): void {
    this.climbForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      location: ['', Validators.required],
      climbingType: [ClimbingType.INDOOR, Validators.required],
      discipline: [Discipline.SPORT, Validators.required],
      rockType: [''],
      incline: [null, [Validators.min(0), Validators.max(180)]],
      holdType: [''],
      setter: [''],
      attemptNumber: [1, [Validators.required, Validators.min(1)]],
      outcome: [Outcome.PROJECT, Validators.required],
      effort: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      overgripping: [false],
      inefficientClips: [false],
      routeReadingIssues: [false],
      learnings: [''],
      comments: ['']
    });
  }

  setupSmartValidation(): void {
    // Smart validation: sync outcome with attempt number
    this.climbForm.get('attemptNumber')?.valueChanges.subscribe(attempts => {
      const outcome = this.climbForm.get('outcome')?.value;

      // If attempt is 1 and outcome is REDPOINT, change to ONSIGHT
      if (attempts === 1 && outcome === Outcome.REDPOINT) {
        this.climbForm.patchValue({ outcome: Outcome.ONSIGHT }, { emitEvent: false });
        this.toastr.info('Outcome changed to ONSIGHT (first attempt)');
      }
    });

    // Reverse validation: sync attempt number with outcome
    this.climbForm.get('outcome')?.valueChanges.subscribe(outcome => {
      const attempts = this.climbForm.get('attemptNumber')?.value;

      // If REDPOINT selected but attempt is 1, suggest increasing attempt
      if (outcome === Outcome.REDPOINT && attempts === 1) {
        this.toastr.info('REDPOINT requires multiple attempts. Consider increasing attempt number.');
      }

      // If ONSIGHT or FLASH selected but attempts > 1, warn user
      if ((outcome === Outcome.ONSIGHT || outcome === Outcome.FLASH) && attempts > 1) {
        this.toastr.warning('ONSIGHT/FLASH are first-attempt outcomes. Consider REDPOINT for multiple attempts.');
      }
    });
  }

  loadClimb(id: string): void {
    this.isLoading = true;
    this.climbService.getClimbById(id).subscribe({
      next: (climb) => {
        const dateStr = new Date(climb.date).toISOString().split('T')[0];
        this.climbForm.patchValue({
          ...climb,
          date: dateStr
        });
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

  onSubmit(): void {
    if (this.climbForm.invalid) {
      this.toastr.error('Please fill in all required fields');
      Object.keys(this.climbForm.controls).forEach(key => {
        const control = this.climbForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    const formValue = this.climbForm.value;
    this.isSaving = true;

    if (this.isEditMode && this.climbId) {
      this.climbService.updateClimb(this.climbId, formValue).subscribe({
        next: () => {
          this.toastr.success('Climb updated successfully');
          this.router.navigate(['/activities']);
        },
        error: (error) => {
          this.toastr.error('Failed to update climb');
          console.error(error);
          this.isSaving = false;
        }
      });
    } else {
      this.climbService.createClimb(formValue).subscribe({
        next: () => {
          this.toastr.success('Climb logged successfully');
          this.router.navigate(['/activities']);
        },
        error: (error) => {
          this.toastr.error('Failed to create climb');
          console.error(error);
          this.isSaving = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/activities']);
  }

  hasError(fieldName: string): boolean {
    const field = this.climbForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
