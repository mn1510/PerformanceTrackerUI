import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  model: any = {};
  showRegister = false;

  constructor(
    public accountService: AccountService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Redirect to activities if already logged in
    this.accountService.currentUser$.subscribe(user => {
      if (user) {
        this.router.navigateByUrl('/activities');
      }
    });
  }

  login() {
    this.accountService.login(this.model).subscribe({
      next: _ => {
        this.toastr.success('Logged in successfully');
        this.router.navigateByUrl('/activities');
      },
      error: error => {
        this.toastr.error(error?.message || 'Login failed');
      }
    });
  }

  toggleRegister() {
    this.showRegister = !this.showRegister;
  }

  cancelRegister(event: boolean) {
    this.showRegister = event;
  }
}
