import { Injectable } from '@angular/core';

/**
 * Types a single line of plain text into an element with a human-like cadence:
 * each keystroke's delay jitters around a base speed, with a little extra
 * "breath" after spaces and a longer pause after punctuation - the way someone
 * actually typing pauses to think, rather than a fixed-interval typewriter.
 *
 * A blinking block cursor (▋) trails the text while it's typing and disappears
 * the moment the line is complete.
 */
@Injectable({
  providedIn: 'root'
})
export class TypewriterService {
  private skipped = false;

  /** Re-arms the service for a fresh animation run (e.g. after navigating away and back). */
  reset(): void {
    this.skipped = false;
  }

  /** Instantly completes any in-flight/future typeLine() calls until reset() is called again. */
  skip(): void {
    this.skipped = true;
  }

  typeLine(el: HTMLElement, text: string, baseSpeed: number = 60): Promise<void> {
    return new Promise((resolve) => {
      if (this.skipped) {
        el.textContent = text;
        resolve();
        return;
      }

      let i = 0;
      const tick = () => {
        if (this.skipped) {
          el.textContent = text;
          resolve();
          return;
        }

        i++;
        const done = i >= text.length;
        el.innerHTML = this.escapeHtml(text.slice(0, i)) + (done ? '' : '<span class="typed-cursor">▋</span>');

        if (done) {
          resolve();
          return;
        }

        const ch = text[i - 1];
        // +/-35% jitter around the base speed, plus a beat after spaces and a longer one after punctuation
        let delay = baseSpeed + (Math.random() - 0.5) * baseSpeed * 0.7;
        if (ch === ' ') delay += baseSpeed * 0.55;
        if (/[.,!]/.test(ch)) delay += baseSpeed * 2.2;
        setTimeout(tick, Math.max(14, delay));
      };
      tick();
    });
  }

  private escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }
}
