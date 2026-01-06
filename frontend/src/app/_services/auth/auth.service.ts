import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/internal/operators/tap';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient, private router: Router) {}

  // Register a new user
  register(userData: any) {
    return this.http.post(`${this.apiUrl}/register`, userData, {
      headers: { 'No-Auth': 'True' }
    }).pipe(
      catchError((error) => {
        console.error('Registration error:', error); // Log detailed error for debugging
        return throwError(() => new Error('Registration failed. Please try again.'));
      })
    );
  }

  // Log in a user
  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // Assuming the response contains the JWT token and the role
        const token = response.token; // Token is returned as part of the response
        this.setToken(token); // Store the token in local storage
        const userRole = this.getUserRole(); // Get the user role from the token

        console.log("Role: "+userRole); 
        console.log(token);
  
        if (userRole === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']); // Redirect to Admin Dashboard
        } else if (userRole === 'USER') {
          this.router.navigate(['/user/dashboard']); // Redirect to User Dashboard
        } else {
          this.router.navigate(['/']); // Redirect to Home if no valid role
        }
      })
    );
  }

  // Log out the user by removing the token
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/home']);
  }

  // Get the stored JWT token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // Check if token exists
  }

  // Decode the token to get the user role
  getUserRole(): string {
    const token = this.getToken();
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || ''; // Return role from token payload
      } catch (e) {
        console.error('Invalid token format', e);
      }
    }
    return '';
  }

  // Store the token upon login
  setToken(token: string) {
    localStorage.setItem('token', token);
  }
}
