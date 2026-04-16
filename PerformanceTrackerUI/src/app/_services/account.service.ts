import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, Observable } from 'rxjs';
import { User } from '../types/user';
import { signIn, signUp, signOut, getCurrentUser, fetchAuthSession, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl= 'https://localhost:5001/api/';
  private currentUserSource=new BehaviorSubject<User | null>(null);
  currentUser$= this.currentUserSource.asObservable();
  constructor(private http:HttpClient) { }


  login(model: any): Observable<any> {
    return from(
      signIn({
        username: model.username,
        password: model.password
      }).then(async (result) => {
        console.log('Cognito signIn result:', result);
        // Get user attributes after successful sign in
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();

        const user: User = {
          username: currentUser.username,
          token: session.tokens?.idToken?.toString() || ''
        };

        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSource.next(user);
        return user;
      }).catch((error) => {
        console.error('Cognito signIn error:', error);
        throw error;
      })
    );
  }

  register(model: any): Observable<any> {
    // Use username if provided, otherwise use email as username
    const username = model.username || model.email;

    const userAttributes: any = {
      email: model.email,
      family_name: model.familyName,
      birthdate: model.birthdate,
      gender: model.gender,
      address: model.address,
      zoneinfo: model.timezone,
      phone_number: model.phoneNumber,
      updated_at: Math.floor(Date.now() / 1000).toString()
    };

    return from(
      signUp({
        username: username,
        password: model.password,
        options: {
          userAttributes: userAttributes
        }
      }).then((result) => {
        console.log('Cognito signUp result:', result);
        // Note: User needs to verify email before they can sign in
        return {
          username: username,
          requiresVerification: !result.isSignUpComplete
        };
      }).catch((error) => {
        console.error('Cognito signUp error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      })
    );
  }

  setCurrentUser(user:User){
    this.currentUserSource.next(user);
  }


  logout(): Observable<void> {
    return from(
      signOut().then(() => {
        localStorage.removeItem('user');
        this.currentUserSource.next(null);
      })
    );
  }

  async checkAuthSession(): Promise<boolean> {
    try {
      const session = await fetchAuthSession();
      return session.tokens !== undefined;
    } catch {
      return false;
    }
  }

  confirmSignUp(username: string, code: string): Observable<any> {
    return from(
      confirmSignUp({
        username: username,
        confirmationCode: code
      }).then((result) => {
        console.log('Cognito confirmSignUp result:', result);
        return result;
      }).catch((error) => {
        console.error('Cognito confirmSignUp error:', error);
        throw error;
      })
    );
  }

  resendSignUpCode(username: string): Observable<any> {
    return from(
      resendSignUpCode({
        username: username
      }).then((result) => {
        console.log('Cognito resendSignUpCode result:', result);
        return result;
      }).catch((error) => {
        console.error('Cognito resendSignUpCode error:', error);
        throw error;
      })
    );
  }
}
