import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { TypewriterService } from '../../services/typewriter.service';
import { AnalyticsService } from '../../services/analytics.service';
import { concat, delay, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements AfterViewInit, OnDestroy {
  @ViewChild('line1') line1: ElementRef | undefined;
  @ViewChild('line2') line2: ElementRef | undefined;
  @ViewChild('line3') line3: ElementRef | undefined;
  @ViewChild('line4') line4: ElementRef | undefined;
  @ViewChild('line5') line5: ElementRef | undefined;

  private text_speed: number = 150;
  private text_speed_faster: number = 100;
  private animationSubscription: Subscription | undefined;

  // Public property to control skip button visibility
  public showSkipButton: boolean = false;

  constructor(
    private typewriterService: TypewriterService,
    private renderer: Renderer2,
    private analytics: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    if (this.line1 && this.line2 && this.line3 && this.line4 && this.line5) {
      this.renderer.addClass(this.line1.nativeElement, 'typewrite_ongoing');

      // Show skip button when animation starts
      this.showSkipButton = true;
      // Manually trigger change detection since we're in ngAfterViewInit
      this.cdr.detectChanges();

      const line1$ = this.typewriterService.typeText(this.line1, this.text_speed);
      const line2$ = this.typewriterService.typeText(this.line2, this.text_speed);
      const line3$ = this.typewriterService.typeText(this.line3, this.text_speed);
      const line4$ = this.typewriterService.typeText(this.line4, this.text_speed);
      const line5$ = this.typewriterService.typeText(this.line5, this.text_speed_faster);

      this.animationSubscription = concat(line1$, line2$, line3$, line4$, line5$)
      .subscribe({
        next: (data) => {
          // console.log(data);
          switch (data.elem) {
            case this.line1:
              this.line1!.nativeElement.innerHTML = data.message;
              if (data.skipped) {
                this.switchTypewriteClass(this.line1, undefined);
              }
              break;
            case this.line2:
              if(data.isFirstChar) {
                this.switchTypewriteClass(this.line1, this.line2)
              }
              this.line2!.nativeElement.innerHTML = data.message;
              if (data.skipped) {
                this.switchTypewriteClass(this.line2, undefined);
              }
              break;
            case this.line3:
              if(data.isFirstChar) {
                this.switchTypewriteClass(this.line2, this.line3)
              }
              this.line3!.nativeElement.innerHTML = data.message;
              if (data.skipped) {
                this.switchTypewriteClass(this.line3, undefined);
              }
              break;
            case this.line4:
              if(data.isFirstChar) {
                this.switchTypewriteClass(this.line3, this.line4)
              }
              this.line4!.nativeElement.innerHTML = data.message;
              if (data.skipped) {
                this.switchTypewriteClass(this.line4, undefined);
              }
              break;
            case this.line5:
              if(data.isFirstChar) {
                this.switchTypewriteClass(this.line4, this.line5)
              }
              this.line5!.nativeElement.innerHTML = data.message;
              if (data.skipped) {
                this.switchTypewriteClass(this.line5, undefined);
              }
              break;

            default:
              break;
          }

        },
        error: (error) => {
          console.error("Error:", error);
          this.showSkipButton = false;
        },
        complete: () => {
          // console.log("Observable complete");
          this.showSkipButton = false;
          this.analytics.trackEvent("ANIMATION_FINISHED", "Measures the level of interest, the whole description has been read", "INTEREST")
        },
      });
    }
  }

  skipAnimation() {
    // Hide skip button immediately
    this.showSkipButton = false;

    // Enable fast-forward mode - animations will continue at high speed (5ms)
    this.typewriterService.enableFastForward();

    // Track skip event
    this.analytics.trackEvent("ANIMATION_SKIPPED", "User fast-forwarded the typewriter animation", "INTERACTION");
  }

  switchTypewriteClass(elemPrev: ElementRef | undefined, elemNext: ElementRef | undefined) {
      this.renderer.removeClass(elemPrev!.nativeElement, 'typewrite_ongoing');
      this.renderer.addClass(elemPrev!.nativeElement, 'typewrite_completed');
      this.renderer.addClass(elemNext!.nativeElement, 'typewrite_ongoing');
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.animationSubscription) {
      this.animationSubscription.unsubscribe();
    }
    // Reset fast-forward mode in service
    this.typewriterService.resetFastForward();
  }

}
