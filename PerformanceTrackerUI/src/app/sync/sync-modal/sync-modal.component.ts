import { Component, HostListener } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { SyncService } from '../../_services/sync.service';

enum SyncState {
  IDLE = 'IDLE',
  AUTHENTICATING = 'AUTHENTICATING',
  SYNCING = 'SYNCING',
  ERROR = 'ERROR'
}

@Component({
  selector: 'app-sync-modal',
  templateUrl: './sync-modal.component.html',
  styleUrls: ['./sync-modal.component.css']
})
export class SyncModalComponent {
  email = '';
  userName = '';
  password = '';
  currentState = SyncState.IDLE;
  errorMessage = '';
  private sessionCookie = '';
  private cookieHeader = '';
  private autoCloseTimer: any;

  SyncState = SyncState; // Expose enum to template

  constructor(
    public bsModalRef: BsModalRef,
    private syncService: SyncService,
    private toastr: ToastrService
  ) {}

  get isLoading(): boolean {
    return this.currentState === SyncState.AUTHENTICATING ||
           this.currentState === SyncState.SYNCING;
  }

  get statusMessage(): string {
    switch (this.currentState) {
      case SyncState.AUTHENTICATING:
        return 'Authenticating with 8a.nu...';
      case SyncState.SYNCING:
        return 'Sync started! This may take a minute. Refresh the page to see your climbs.';
      case SyncState.ERROR:
        return this.errorMessage;
      default:
        return '';
    }
  }

  onSubmit(): void {
    // Validate inputs
    if (!this.email || !this.userName || !this.password) {
      this.errorMessage = 'Email, username, and password are required';
      this.currentState = SyncState.ERROR;
      return;
    }

    // Start authentication
    this.currentState = SyncState.AUTHENTICATING;
    this.errorMessage = '';

    this.syncService.authenticate8a(this.email, this.password).subscribe({
      next: (response) => {
        this.sessionCookie = response.session_cookie;
        this.cookieHeader = response.cookie_header;
        this.startSync();
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  private startSync(): void {
    this.currentState = SyncState.SYNCING;

    this.syncService.startSync(this.userName, this.sessionCookie, this.cookieHeader).subscribe({
      next: (response) => {
        this.toastr.success('Data sync has been initiated', 'Sync Started');
        // Auto-close after 3 seconds
        this.autoCloseTimer = setTimeout(() => {
          this.close();
        }, 3000);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  private handleError(error: any): void {
    this.currentState = SyncState.ERROR;

    if (error.status === 401) {
      this.errorMessage = 'Invalid 8a.nu credentials. Please check your username and password.';
      this.toastr.error(this.errorMessage, 'Authentication Failed');
    } else if (error.status === 403) {
      this.errorMessage = '8a.nu session required. Please try logging in again.';
      this.toastr.error(this.errorMessage, 'Forbidden');
    } else if (error.status === 500) {
      this.errorMessage = 'Server error. Please try again later.';
      this.toastr.error(this.errorMessage, 'Server Error');
    } else if (error.status === 0) {
      this.errorMessage = 'Network error. Please check your connection.';
      this.toastr.error(this.errorMessage, 'Network Error');
    } else {
      this.errorMessage = 'Unable to connect. Please try again later.';
      this.toastr.error(this.errorMessage, 'Error');
    }
  }

  onInputChange(): void {
    // Clear error when user starts typing
    if (this.currentState === SyncState.ERROR) {
      this.errorMessage = '';
      this.currentState = SyncState.IDLE;
    }
  }

  close(): void {
    // Clean up
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
    this.sessionCookie = '';
    this.cookieHeader = '';
    this.email = '';
    this.userName = '';
    this.password = '';
    this.currentState = SyncState.IDLE;
    this.errorMessage = '';
    this.bsModalRef.hide();
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    // Only allow escape if not currently processing
    if (!this.isLoading) {
      this.close();
    }
  }

  ngOnDestroy(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  }
}
