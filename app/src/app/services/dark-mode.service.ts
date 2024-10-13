import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {

  private isDarkMode = new BehaviorSubject<boolean>(true);
  constructor() { }

  setDarkMode(mode: boolean) {
    this.isDarkMode.next(mode);
  }
  getDarkMode(): Observable<boolean> {
    return this.isDarkMode.asObservable();
  }
}
