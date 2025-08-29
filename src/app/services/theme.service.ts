import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
private darkThemeClass = 'dark-theme';

  toggleTheme(): void {
    document.body.classList.toggle(this.darkThemeClass);
    localStorage.setItem('theme', document.body.classList.contains(this.darkThemeClass) ? 'dark' : 'light');
  }

  loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add(this.darkThemeClass);
    }
  }
}