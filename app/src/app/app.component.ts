import { OnInit, HostBinding, Component, ChangeDetectionStrategy} from '@angular/core';
import { NavComponent } from './components/nav/nav.component'
import { MainComponent } from './components/main/main.component'
import { FooterComponent } from './components/footer/footer.component'
import { DarkModeService } from './services/dark-mode.service'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ NavComponent, MainComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  isDarkModeEnabled: boolean = false;

  @HostBinding('class.dark')
  get dark(): boolean {
    return this.isDarkModeEnabled === true;
  }

  @HostBinding('class.light')
  get light(): boolean {
    return this.isDarkModeEnabled === false;
  }

  constructor(private darkModeService: DarkModeService) {
  }

  ngOnInit() {
    this.darkModeService.getDarkMode().subscribe((darkMode: boolean) => {
      this.isDarkModeEnabled = darkMode;
    });
  }
}
