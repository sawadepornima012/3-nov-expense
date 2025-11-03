import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingsComponent {
  profile = {
    name: 'Dezykode',
    email: 'dezykode@example.com',
    password: ''
  };

  darkMode = false;

  preferences = {
    notifications: 'all',
    language: 'en'
  };

  saveProfileSettings() {
    alert('✅ Profile settings saved successfully!');
    console.log('Profile:', this.profile);
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-theme', this.darkMode);
    alert(`🌙 Theme changed to ${this.darkMode ? 'Dark' : 'Light'} mode`);
  }

  savePreferences() {
    alert('⚙️ Preferences saved successfully!');
    console.log('Preferences:', this.preferences);
  }
}
