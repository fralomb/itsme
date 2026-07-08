import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypewriterService } from '../../services/typewriter.service';
import { AnalyticsService } from '../../services/analytics.service';
import { TerminalComponent } from '../terminal/terminal.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, TerminalComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements AfterViewInit, OnDestroy {
  @ViewChild('introEyebrow') introEyebrow!: ElementRef<HTMLElement>;
  @ViewChild('introHeadline') introHeadline!: ElementRef<HTMLElement>;
  @ViewChild('introTagline') introTagline!: ElementRef<HTMLElement>;
  @ViewChild(TerminalComponent) terminal!: TerminalComponent;

  showSkipButton = false;
  terminalClosed = false;

  private readonly introLines = [
    { text: "Hello, I'm", speed: 65 },
    { text: 'Francesco Lombardo.', speed: 70 },
    { text: 'Type anything below to know more about me.', speed: 48 },
  ];

  private revealedTerminal = false;

  constructor(
    private typewriterService: TypewriterService,
    private analytics: AnalyticsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      this.introEyebrow.nativeElement.textContent = this.introLines[0].text;
      this.introHeadline.nativeElement.textContent = this.introLines[1].text;
      this.introTagline.nativeElement.textContent = this.introLines[2].text;
      this.revealTerminal();
      return;
    }

    this.typewriterService.reset();
    this.showSkipButton = true;
    // Manually trigger change detection since we're in ngAfterViewInit
    this.cdr.detectChanges();
    this.runIntro();
  }

  ngOnDestroy(): void {
    this.typewriterService.reset();
  }

  private async runIntro(): Promise<void> {
    await this.typewriterService.typeLine(this.introEyebrow.nativeElement, this.introLines[0].text, this.introLines[0].speed);
    await this.typewriterService.typeLine(this.introHeadline.nativeElement, this.introLines[1].text, this.introLines[1].speed);
    await this.typewriterService.typeLine(this.introTagline.nativeElement, this.introLines[2].text, this.introLines[2].speed);
    this.showSkipButton = false;
    this.analytics.trackEvent('ANIMATION_FINISHED', 'Measures the level of interest, the whole description has been read', 'INTEREST');
    this.revealTerminal();
    // This resolves at the end of a chain of setTimeout callbacks with no template event
    // attached to it, so under the app root's OnPush strategy it would otherwise never
    // reach the DOM until some unrelated click happened to trigger change detection.
    this.cdr.detectChanges();
  }

  skipAnimation(): void {
    if (!this.showSkipButton) return;
    this.showSkipButton = false;

    // Complete the heading text instantly, then let any in-flight typeLine() promises
    // notice the skip flag and resolve on their own shortly after (harmless no-op writes).
    this.introEyebrow.nativeElement.textContent = this.introLines[0].text;
    this.introHeadline.nativeElement.textContent = this.introLines[1].text;
    this.introTagline.nativeElement.textContent = this.introLines[2].text;
    this.typewriterService.skip();

    this.analytics.trackEvent('ANIMATION_SKIPPED', 'User skipped the hero heading animation', 'INTERACTION');
    this.revealTerminal();
  }

  private revealTerminal(): void {
    if (this.revealedTerminal) return;
    this.revealedTerminal = true;
    this.terminal.reveal();
  }

  onTerminalClosedChange(closed: boolean): void {
    this.terminalClosed = closed;
  }

  reopenTerminal(): void {
    this.terminal.reopen();
  }
}
