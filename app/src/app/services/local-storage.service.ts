import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setItem(key: string, value: boolean): void {
    localStorage.setItem(key, value.toString());
  }

  getItem(key: string): boolean | null {
    var preferences = localStorage.getItem(key)
    if( preferences !== null) {
      return preferences === 'true';
    }
    return preferences;
  }

  clear(): void {
    localStorage.clear();
  }
}
