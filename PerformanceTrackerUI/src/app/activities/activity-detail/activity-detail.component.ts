import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserAscentService } from '../../_services/user-ascent.service';
import { UserAscent } from '../../types/user-ascent';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.css']
})
export class ActivityDetailComponent implements OnInit {
  ascent: UserAscent | undefined;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userAscentService: UserAscentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAscent(Number(id));
    }
  }

  loadAscent(id: number): void {
    this.isLoading = true;
    this.userAscentService.getAscentById(id).subscribe({
      next: (ascent) => {
        this.ascent = ascent;
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

  getRatingStars(rating?: number): string {
    if (!rating || rating < 1) return '';
    // 8a.nu uses 0-4 star rating system (4 being highest)
    const maxStars = 4;
    const stars = Math.min(rating, maxStars); // Cap at max stars
    return '★'.repeat(stars) + '☆'.repeat(Math.max(0, maxStars - stars));
  }

  goBack(): void {
    this.router.navigate(['/activities']);
  }
}
