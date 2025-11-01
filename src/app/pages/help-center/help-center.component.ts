import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Help Center</h2>
      <p>Get help and support for any issues you're facing.</p>
      
      <div class="card">
        <h3>Frequently Asked Questions</h3>
        <p>Find answers to common questions and issues.</p>
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
export class HelpCenterComponent {}