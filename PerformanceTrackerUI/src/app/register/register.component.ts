import { Component, EventEmitter, Output } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
@Output() cancelRegister= new EventEmitter();
model:any={}
showVerificationStep = false;
registeredUsername = '';

constructor(private accountService:AccountService, private toastr:ToastrService) {
}

register()
{
  this.accountService.register(this.model).subscribe({
    next: (response) => {
      if (response.requiresVerification) {
        this.registeredUsername = response.username;
        this.showVerificationStep = true;
        this.toastr.info('Registration successful! Please enter the verification code sent to your email.');
      } else {
        this.toastr.success('Registration successful!');
        this.cancel();
      }
    },
    error: error => {
      this.toastr.error(error?.message || 'Registration failed');
    }
  });
}

verifyCode()
{
  if (!this.model.verificationCode) {
    this.toastr.error('Please enter the verification code');
    return;
  }

  this.accountService.confirmSignUp(this.registeredUsername, this.model.verificationCode).subscribe({
    next: () => {
      this.toastr.success('Email verified successfully! You can now log in.');
      this.cancel();
    },
    error: error => {
      this.toastr.error(error?.message || 'Verification failed');
    }
  });
}

resendCode()
{
  this.accountService.resendSignUpCode(this.registeredUsername).subscribe({
    next: () => {
      this.toastr.success('Verification code resent! Check your email.');
    },
    error: error => {
      this.toastr.error(error?.message || 'Failed to resend code');
    }
  });
}

cancel(){
  this.showVerificationStep = false;
  this.registeredUsername = '';
  this.model = {};
  this.cancelRegister.emit(false);
}
}
