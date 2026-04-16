import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AccountService } from './_services/account.service';
import { User } from './types/user';
import { Amplify } from 'aws-amplify';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'PerformanceTrackerUI';
  users:any;

  constructor(private http:HttpClient , private accountService:AccountService) {
    // Configure Amplify for Cognito
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: environment.cognito.userPoolId,
          userPoolClientId: environment.cognito.userPoolWebClientId
        }
      }
    });
  }

  ngOnInit(): void {
    this.setCurrentUser();
  }

  getUsers()
  {
    this.http.get('https://localhost:5001/api/users').subscribe({
      next: response=>this.users=response,
      error:error=>console.log(error),
      complete:()=>console.log('Request completed')
    })
  }

  setCurrentUser(){
    const userString = localStorage.getItem('user')
    if(!userString) return;
    const user:User=JSON.parse(userString);
    this.accountService.setCurrentUser(user);
  }
}
