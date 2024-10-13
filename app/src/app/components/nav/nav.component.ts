import { Component, OnInit } from '@angular/core';
import { DarkModeService } from './../../services/dark-mode.service';
import { LocalStorageService } from './../../services/local-storage.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
// export class NavComponent implements OnInit {
//   theme: string = "light";
//   preferencesKey: string = "DarkMode"
//
//
//   ngOnInit() {
//     var preferences: boolean | null = this.localStorageService.getItem(this.preferencesKey)
//     if (preferences !== null) {
//       this.darkModeService.setDarkMode(preferences);
//       this.setTheme(!preferences)
//     }
//   }
//
//   toggleDarkMode() {
//     var darkMode: boolean = this.darkModeService.getDarkMode();
//     this.setTheme(darkMode)
//     this.darkModeService.setDarkMode(!darkMode);
//     this.localStorageService.setItem(this.preferencesKey, this.darkModeService.getDarkMode());
//   }
//
//   setTheme(darkMode: boolean) {
//     this.theme = darkMode ? "dark" : "light";
//   }
// }
export class NavComponent implements OnInit {
  isDarkModeEnabled: boolean = false;
  preferencesKey: string = "DarkMode"

  constructor(private darkModeService: DarkModeService, private localStorageService: LocalStorageService) {}

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
  }

}
