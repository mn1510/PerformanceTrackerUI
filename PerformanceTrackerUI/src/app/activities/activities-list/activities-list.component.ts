import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserAscentService } from '../../_services/user-ascent.service';
import { UserAscent } from '../../types/user-ascent';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-activities-list',
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.css']
})
export class ActivitiesListComponent implements OnInit, OnDestroy {
  ascents: UserAscent[] = [];
  filteredAscents: UserAscent[] = [];
  isLoading = false;

  selectedAscentType: string = 'ALL';
  selectedGrade: string = 'ALL';
  searchTerm: string = '';

  ascentTypes = ['ALL', 'os', 'f', 'rp', 'repeat'];
  uniqueGrades: string[] = ['ALL'];

  private destroy$ = new Subject<void>();

  constructor(
    private userAscentService: UserAscentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Load ascents from the API
    this.userAscentService.loadAscents();

    // Subscribe to ascents updates
    this.userAscentService.ascents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ascents => {
        this.ascents = ascents;
        this.extractUniqueGrades();
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  extractUniqueGrades(): void {
    const grades = new Set(this.ascents.map(a => a.grade).filter((g): g is string => !!g));
    this.uniqueGrades = ['ALL', ...Array.from(grades).sort()];
  }

  applyFilters(): void {
    this.filteredAscents = this.ascents.filter(ascent => {
      const ascentTypeMatch = this.selectedAscentType === 'ALL' ||
        ascent.ascent_type?.toLowerCase() === this.selectedAscentType.toLowerCase();
      const gradeMatch = this.selectedGrade === 'ALL' || ascent.grade === this.selectedGrade;
      const searchMatch = this.searchTerm === '' ||
        ascent.route_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ascent.crag_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ascent.comment?.toLowerCase().includes(this.searchTerm.toLowerCase());
      return ascentTypeMatch && gradeMatch && searchMatch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getAscentTypeBadgeClass(ascentType?: string): string {
    if (!ascentType) return 'bg-secondary';

    switch (ascentType.toLowerCase()) {
      case 'os':
      case 'onsight':
        return 'bg-success';
      case 'f':
      case 'flash':
        return 'bg-info';
      case 'rp':
      case 'redpoint':
        return 'bg-primary';
      case 'repeat':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

  getAscentTypeDisplayName(ascentType: string): string {
    const typeMap: { [key: string]: string } = {
      'ALL': 'All Types',
      'os': 'Onsight',
      'f': 'Flash',
      'rp': 'Redpoint',
      'repeat': 'Repeat'
    };
    return typeMap[ascentType] || ascentType;
  }

  getRatingStars(rating?: number): string {
    if (!rating || rating < 1) return '';
    // 8a.nu uses 0-4 star rating system (4 being highest)
    const maxStars = 4;
    const stars = Math.min(rating, maxStars); // Cap at max stars
    return '★'.repeat(stars) + '☆'.repeat(Math.max(0, maxStars - stars));
  }
}
