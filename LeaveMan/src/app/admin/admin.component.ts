import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { User } from '../_models/user';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';
import { MemberService } from '../_services/member.service';
import { AdminService } from '../_services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  usersWithRoles: User[] = [];
  availableRoles = ['Employee', 'Admin'];

  registerForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;

  nameForm: FormGroup = new FormGroup({});
  nameValidationErrors: string[] | undefined;

  passwordForm: FormGroup = new FormGroup({});
  passwordValidationErrors: string[] | undefined;

  addingRole: string = "Member"

  changeS: string = "";

  searchTextUser: string = "";

  sessionUserName: string = "";

  userpchange: string = "";

  constructor(private memberService: MemberService, private accountService: AccountService,
    private fb: FormBuilder, private adminService: AdminService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getUsersWithRoles();
    this.InitializeForm();
    this.InitializeNameForm();
    this.InitializePasswordForm();
    this.sessionUserName = JSON.parse(localStorage.getItem('user')!).userName;
  }

  InitializePasswordForm() {
    this.passwordForm = this.fb.group({
      PnewPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(12),
        this.requireUppercaseLowercaseNumber(),
      ]),
      PconfirmPassword: new FormControl('', [Validators.required, this.matchValues('PnewPassword')])
    });
    //below for matching password and confirm password. after user changes the password, it will check if the confirm password matches
    this.passwordForm.controls['PnewPassword'].valueChanges.subscribe({
      next: () => this.passwordForm.controls['PconfirmPassword'].updateValueAndValidity()
    })
  }

  resetPasswordForm() {
    this.passwordForm.reset();
  }

  changePassword() {
    const password = this.passwordForm.get('PnewPassword')?.value;
    this.adminService.adminpchange(password, this.userpchange).subscribe({
      next: result => {
        if (!result.v) {
          return;
        }
        console.log("result: ", result.v);
        this.toastr.success("Şifre değiştirildi.");
        this.resetPasswordForm();
      }
    })
  }

  updateRoles(user: User, role: string) {
    if (role === "Admin") {
      this.adminService.updateUserRoles(user.userName, "Admin,Employee").subscribe({
        next: () => {
          this.getUsersWithRoles();
        }
      })
    }
    if (role === "Employee") {
      this.adminService.updateUserRoles(user.userName, "Employee").subscribe({
        next: () => {
          this.getUsersWithRoles();
        }
      })
    }
  }

  getUsersWithRoles() {
    this.memberService.getUsersWithRoles().pipe(take(1)).subscribe({
      next: (response) => {
        this.usersWithRoles = response;
      }
    })
  }



  deleteUser(userName: string) {
    if (confirm(userName + 'Kullanıcısını silmek istediğinize emin misiniz?')) {
      this.adminService.deleteUser(userName).subscribe({
        next: () => {
          this.getUsersWithRoles();
        }
      })
    }
  }




  
  clear() {
    this.registerForm.reset();
    this.addingRole = "Employee";
  }

  InitializeForm() {
    this.registerForm = this.fb.group({
      userName: ['', Validators.required],
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(12),
        this.requireUppercaseLowercaseNumber(),
      ]),
      confirmPassword: new FormControl('', [Validators.required, this.matchValues('password')])
    });
    //below for matching password and confirm password. after user changes the password, it will check if the confirm password matches
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => this.registerForm.controls['confirmPassword'].updateValueAndValidity()
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

  InitializeNameForm() {
    this.nameForm = this.fb.group({
      userName: ['', Validators.required],
    });
  }

  register() {
    const values = {...this.registerForm.value};
    this.accountService.register(values , this.addingRole).subscribe({
      next: result => {
        if (!result) {
          return;
        }
        console.log("result: ", result);
        console.log("addingRole: ", this.addingRole);
        if (this.addingRole === "Employee") {
          console.log("Employee");
          this.adminService.updateUserRoles(values.userName, "Employee").subscribe({
            next: () => {
              console.log("updated moderator");
              this.getUsersWithRoles();
              this.clear();
            }
          })
        } else if (this.addingRole === "Admin") {
          console.log("admin")
          this.adminService.updateUserRoles(values.userName, "Admin,Employee").subscribe({
            next: () => {
              console.log("updated admin");
              this.getUsersWithRoles();
              this.clear();
            }
          })
        } else {
          console.log("Employee")
          this.getUsersWithRoles();
          this.clear();
        }
      },
      error: error =>{
        this.validationErrors = error;
      }
    })
  }

  changeName() {
    const values = {...this.nameForm.value};
    console.log("values: ", values);
    console.log(typeof values.userName);
    console.log("changeS: ", this.changeS);
    console.log(typeof this.changeS)
    this.adminService.changeUserName(this.changeS, values.userName).subscribe({
      next: () => {
        this.getUsersWithRoles();
        this.nameForm.reset();
      },
      error: error => {
        this.nameValidationErrors = error;
        this.registerForm.reset();
      }
    })
  }

  resetNameForm() {
    this.nameForm.reset();
  }
}
