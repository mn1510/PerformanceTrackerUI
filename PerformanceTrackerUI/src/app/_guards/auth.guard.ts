import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { map, from, switchMap, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const toastr = inject(ToastrService);
  const router = inject(Router);

  // First check currentUser$ for immediate response
  return accountService.currentUser$.pipe(
    switchMap(user => {
      if (user) {
        return of(true);
      } else {
        // If no user in observable, check Cognito session
        return from(accountService.checkAuthSession()).pipe(
          map(isAuthenticated => {
            if (!isAuthenticated) {
              toastr.error("You must be logged in to access this page");
              router.navigateByUrl('/login');
              return false;
            }
            return true;
          })
        );
      }
    })
  );
};
