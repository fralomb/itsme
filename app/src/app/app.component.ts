import { HostBinding, Component, ChangeDetectionStrategy} from '@angular/core';
import { NavComponent } from './components/nav/nav.component'
import { MainComponent } from './components/main/main.component'
import { FooterComponent } from './components/footer/footer.component'
import { DarkModeService } from './services/dark-mode.service'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ NavComponent, MainComponent, FooterComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  @HostBinding('class.dark')
  get mode(): boolean {
    return this.darkModeService.getDarkMode()
  }

  constructor(private darkModeService: DarkModeService) {
  }
}
