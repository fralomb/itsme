import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { TypewriterService } from '../../services/typewriter.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements AfterViewInit {
  @ViewChild('line1') line1: any;
  @ViewChild('line2') line2: any;
  @ViewChild('line3') line3: any;
  @ViewChild('line4') line4: any;
  @ViewChild('line5') line5: any;
  private text_speed: number = 120;

  constructor(private typewriterService: TypewriterService) {}

  ngAfterViewInit() {
    console.log(this.line1.nativeElement.innerHTML)
    var line1_text = this.line1.nativeElement.innerHTML;
    this.typewriterService.typeText(line1_text, this.text_speed);
    this.typewriterService.charsTyped.subscribe(text => {
      this.line1.nativeElement.innerHTML = text;
    });
  }

}
