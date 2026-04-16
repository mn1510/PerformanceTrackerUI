import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Observable, of } from 'rxjs';
import { User } from '../types/user';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model:any={};
  loggedIn=true;
  constructor(public accountService:AccountService, private router:Router, private toastr:ToastrService)
  {

  }
  ngOnInit(): void {
  }


  login(){
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


  logout(){
    this.accountService.logout().subscribe({
      next: () => {
        this.toastr.success('Logged out successfully');
        this.router.navigateByUrl('/login');
      },
      error: error => {
        this.toastr.error('Logout failed');
      }
    });
  }
}
