import { Component, OnInit } from '@angular/core';
import { DarkModeService } from './../../services/dark-mode.service';
import { LocalStorageService } from './../../services/local-storage.service';
import { AnalyticsService } from './../../services/analytics.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit {
  isDarkModeEnabled: boolean = false;
  preferencesKey: string = "DarkMode"

  constructor(private darkModeService: DarkModeService, private localStorageService: LocalStorageService, private analytics: AnalyticsService) {}

  ngOnInit() {
    // init theme based on preferences (if any yet)
    var preferences: boolean | null = this.localStorageService.getItem(this.preferencesKey)
    if (preferences !== null) {
      this.darkModeService.setDarkMode(preferences);
    }

    this.darkModeService.getDarkMode().subscribe((isDarkMode: boolean) => {
      if(isDarkMode !== this.isDarkModeEnabled) {
        this.isDarkModeEnabled = isDarkMode;
        this.localStorageService.setItem(this.preferencesKey, isDarkMode);
      }
    });
  }

  toggleDarkMode() {
    this.darkModeService.setDarkMode(!this.isDarkModeEnabled);
    this.analytics.trackEvent(this.isDarkModeEnabled ? "DARK_MODE" : "LIGHT_MODE", "Measures the level of interest, the dark mode toggle has been used", "INTEREST")
  }

}
