import { Component } from '@angular/core';
import { AnalyticsService } from './../../services/analytics.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  constructor(private analytics: AnalyticsService) {
  }

  onClick(type: string) {
    this.analytics.trackEvent(type.toUpperCase(), "Measures the number of interactions with the social buttons", "SOCIAL")
  }

}
