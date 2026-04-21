import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserAscentService } from '../../_services/user-ascent.service';
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
  climbId: number | null = null;
  isLoading = false;
  isSaving = false;

  climbingTypes = Object.values(ClimbingType);
  disciplines = Object.values(Discipline);
  outcomes = Object.values(Outcome);

  constructor(
    private fb: FormBuilder,
    private userAscentService: UserAscentService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.climbId = idParam ? Number(idParam) : null;
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

  loadClimb(id: number): void {
    this.isLoading = true;
    this.userAscentService.getAscentById(id).subscribe({
      next: (ascent) => {
        const dateStr = ascent.date ? new Date(ascent.date).toISOString().split('T')[0] : '';
        this.climbForm.patchValue({
          ...ascent,
          date: dateStr
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Ascent not found');
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

    // Manual climb creation disabled - using 8a.nu data only
    this.toastr.info('Manual climb logging is currently disabled');
    this.isSaving = false;
    this.router.navigate(['/activities']);
  }

  cancel(): void {
    this.router.navigate(['/activities']);
  }

  hasError(fieldName: string): boolean {
    const field = this.climbForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
