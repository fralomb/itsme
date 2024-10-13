import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TypewriterService {

  charsTyped = new BehaviorSubject<string>('');

  constructor() { }

  typeText(text: string, speed: number = 50) {
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < text.length) {
        this.charsTyped.next(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, speed);
  }
}
