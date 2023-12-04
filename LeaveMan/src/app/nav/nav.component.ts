import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppModule } from '../app.module';
import { login } from '../_models/login';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {

  changeMode: boolean = false;

  login: login= {userName: '', password: ''};
  @ViewChild('staticModal') staticModal: any;

  changeForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;

  constructor(public accountService: AccountService, private router: Router,
    private toastr: ToastrService, private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.InitializeForm();
  }
  
  changePassword() {
    this.staticModal.show();
    this.changeMode = true;
  }

  clear() {
    this.changeForm.reset();
  }

  InitializeForm() {
    this.changeForm = this.fb.group({
      oldPassword : new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(12),
        this.requireUppercaseLowercaseNumber(),
      ]),
      confirmPassword: new FormControl('', [Validators.required, this.matchValues('password')])
    });
    //below for matching password and confirm password. after user changes the password, it will check if the confirm password matches
    this.changeForm.controls['password'].valueChanges.subscribe({
      next: () => this.changeForm.controls['confirmPassword'].updateValueAndValidity()
    })
  }

  matchValues(matchTo: string) : ValidatorFn {
    return (control: AbstractControl) => {
      return control?.value === control?.parent?.get(matchTo)?.value ? null : {notMatching: true}
    }
  }

  requireUppercaseLowercaseNumber(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
  
      if (!hasUppercase || !hasLowercase || !hasNumber) {
        return { requireUppercaseLowercaseNumber: true };
      }
  
      return null;
    };
  }

  change() {
    var values = {
      currentPassword: this.changeForm.get('oldPassword')?.value,
      newPassword: this.changeForm.get('password')?.value
    }   
    this.accountService.changePassword(values).subscribe({
      next: (result) => {
        if (result.v) {
          this.toastr.success('Şifre değiştirildi.');
        }
        else {
          this.toastr.error('Şifre değiştirilemedi.');
        }
        this.clear();

      }
    }) 
    // this.accountService.changePassword(this.changeForm.value).subscribe({
    //   next: () => {
    //     this.toastr.success('Şifre değiştirildi.');
    //     this.clear();
    //   },
    //   error: (error: string[] | undefined) => {
    //     this.validationErrors = error;
    //   }
    // })
  }









  Login() {
    console.log("login: ", this.login);
    this.accountService.login(this.login).subscribe({
      next: () => {
        this.toastr.success(this.login.userName + ' olarak giriş yapıldı.');
        this.login = {userName: '', password: ''};
        this.router.navigateByUrl('/transactions');
      }
    })
  }

  Logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
