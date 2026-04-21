import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, from, switchMap, catchError, throwError } from 'rxjs';
import { fetchAuthSession } from 'aws-amplify/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only add auth token to ClimbData API requests
    if (request.url.includes('localhost:8000')) {
      return from(fetchAuthSession()).pipe(
        switchMap(session => {
          const token = session.tokens?.idToken?.toString();

          if (token) {
            const clonedRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            return next.handle(clonedRequest);
          }

          return next.handle(request);
        }),
        catchError(error => {
          console.error('Error fetching auth session:', error);
          return next.handle(request);
        })
      );
    }

    return next.handle(request);
  }
}
