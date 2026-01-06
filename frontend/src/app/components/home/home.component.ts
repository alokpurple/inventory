import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../_services/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(
    public authService: AuthService,
  ) {}
  
  welcomeMessage = 'Welcome to the Inventory Management System!';
  
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
