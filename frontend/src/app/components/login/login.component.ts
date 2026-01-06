// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../_services/auth/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: (response: any) => {
          if (response && response.token) {
            this.authService.setToken(response.token);

            console.log(response);
            // Check user role and redirect accordingly
            const role = this.authService.getUserRole();
            if (role === 'ADMIN') {
              this.router.navigate(['/admin/dashboard']);
            } else if (role === 'USER') {
              this.router.navigate(['/user/dashboard']);
            }
          }
        },
        error: (error) => {
          this.errorMessage = 'Invalid username or password';
          console.error(error);
        }
      });
    }
  }
}
