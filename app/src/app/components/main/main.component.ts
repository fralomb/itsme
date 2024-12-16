import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { TypewriterService } from '../../services/typewriter.service';
import { AnalyticsService } from '../../services/analytics.service';
import { concat, delay } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements AfterViewInit {
  @ViewChild('line1') line1: ElementRef | undefined;
  @ViewChild('line2') line2: ElementRef | undefined;
  @ViewChild('line3') line3: ElementRef | undefined;
  @ViewChild('line4') line4: ElementRef | undefined;
  @ViewChild('line5') line5: ElementRef | undefined;

  private text_speed: number = 150;
  private text_speed_faster: number = 100;

  constructor(private typewriterService: TypewriterService, private renderer: Renderer2, private analytics: AnalyticsService) {}

  ngAfterViewInit() {
    if (this.line1 && this.line2 && this.line3 && this.line4 && this.line5) {
      this.renderer.addClass(this.line1.nativeElement, 'typewrite_ongoing');

      concat(
        this.typewriterService.typeText(this.line1, this.text_speed),
        this.typewriterService.typeText(this.line2, this.text_speed),
        this.typewriterService.typeText(this.line3, this.text_speed),
        this.typewriterService.typeText(this.line4, this.text_speed),
        this.typewriterService.typeText(this.line5, this.text_speed_faster),
      )
      .subscribe({
        next: (data) => {
          // console.log(data);
          switch (data.elem) {
            case this.line1:
              this.line1!.nativeElement.innerHTML = data.message;
              break;
            case this.line2:
              if(data.isFirstChar) {
                this.switchTypewriteClass(this.line1, this.line2)
              }
              this.line2!.nativeElement.innerHTML = data.message;
              break;
            case this.line3:
              if(data.isFirstChar) {
                this.switchTypewriteClass(this.line2, this.line3)
              }
              this.line3!.nativeElement.innerHTML = data.message;
              break;
            case this.line4:
              if(data.isFirstChar) {
                this.switchTypewriteClass(this.line3, this.line4)
              }
              this.line4!.nativeElement.innerHTML = data.message;
              break;
            case this.line5:
              if(data.isFirstChar) {
                this.switchTypewriteClass(this.line4, this.line5)
              }
              this.line5!.nativeElement.innerHTML = data.message;
              break;

            default:
              break;
          }

        },
        error: (error) => {
          console.error("Error:", error);
        },
        complete: () => {
          // console.log("Observable complete");
          this.analytics.trackEvent("ANIMATION_FINISHED", "Measures the level of interest, the whole description has been read", "INTEREST")
        },
      });
    }
  }

  switchTypewriteClass(elemPrev: ElementRef | undefined, elemNext: ElementRef | undefined) {
      this.renderer.removeClass(elemPrev!.nativeElement, 'typewrite_ongoing');
      this.renderer.addClass(elemPrev!.nativeElement, 'typewrite_completed');
      this.renderer.addClass(elemNext!.nativeElement, 'typewrite_ongoing');
  }

}
