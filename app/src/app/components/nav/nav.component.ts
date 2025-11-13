import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
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

  // Theme colors matching styles.scss
  private readonly DARK_THEME_COLOR = '#212529';
  private readonly LIGHT_THEME_COLOR = '#E6F1FF';

  constructor(
    private darkModeService: DarkModeService,
    private localStorageService: LocalStorageService,
    private analytics: AnalyticsService,
    @Inject(DOCUMENT) private document: Document
  ) {}

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
        // Update theme-color meta tag for mobile browsers
        this.updateThemeColor(isDarkMode);
      }
    });
  }

  toggleDarkMode() {
    this.darkModeService.setDarkMode(!this.isDarkModeEnabled);
    this.analytics.trackEvent(this.isDarkModeEnabled ? "DARK_MODE" : "LIGHT_MODE", "Measures the level of interest, the dark mode toggle has been used", "INTEREST")
  }

  /**
   * Updates the theme-color meta tag to match the current theme
   * This fixes the white bar issue on mobile browser bars
   */
  private updateThemeColor(isDarkMode: boolean): void {
    const themeColor = isDarkMode ? this.DARK_THEME_COLOR : this.LIGHT_THEME_COLOR;

    // Update existing theme-color meta tags
    const metaTags = this.document.querySelectorAll('meta[name="theme-color"]');
    metaTags.forEach((tag) => {
      tag.setAttribute('content', themeColor);
    });

    // If no theme-color meta tag exists, create one
    if (metaTags.length === 0) {
      const meta = this.document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = themeColor;
      this.document.head.appendChild(meta);
    }
  }

}
