import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EightALoginRequest {
  username: string;
  password: string;
}

export interface EightALoginResponse {
  message: string;
  session_cookie: string;
  expires_in: number;
}

export interface UserDataIngestionRequest {
  userName: string;
}

export interface IngestionTaskResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  authenticate8a(username: string, password: string): Observable<EightALoginResponse> {
    const body: EightALoginRequest = { username, password };
    return this.http.post<EightALoginResponse>(`${this.baseUrl}/auth/8a-login`, body);
  }

  startSync(userName: string, sessionCookie: string): Observable<IngestionTaskResponse> {
    const body: UserDataIngestionRequest = { userName };
    const headers = new HttpHeaders({
      'X-8a-Session': sessionCookie
    });
    return this.http.post<IngestionTaskResponse>(
      `${this.baseUrl}/ingestion/user-data`,
      body,
      { headers }
    );
  }
}
