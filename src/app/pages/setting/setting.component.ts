import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Settings</h2>
      <p>Configure your application settings and preferences.</p>
      
      <div class="card">
        <h3>Account Settings</h3>
        <p>Manage your account preferences and security settings.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 20px; }
    .card { 
      background: white; 
      padding: 20px; 
      border-radius: 10px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-top: 20px;
    }
  `]
})
export class SettingsComponent {}