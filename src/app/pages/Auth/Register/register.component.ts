import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  message = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.message = '';
    if (!this.fullName || !this.email || !this.password) {
      this.message = 'Please fill all fields.';
      return;
    }

    const user = { fullName: this.fullName, email: this.email, password: this.password };

    this.authService.register(user).subscribe({
      next: (res) => {
        // registration success
        this.message = 'Registered successfully. Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        console.error('register error', err);
        this.message = 'Registration failed. Try again.';
      }
    });
  }
}
