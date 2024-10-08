import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {

  isDarkMode = new BehaviorSubject<boolean>(true);
  constructor() { }

  setDarkMode(mode: boolean) {
    this.isDarkMode.next(mode);
  }
  getDarkMode(): boolean {
    return this.isDarkMode.getValue();
  }
}
