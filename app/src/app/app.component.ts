import { HostBinding, Component, ChangeDetectionStrategy} from '@angular/core';
import { NavComponent } from './components/nav/nav.component'
import { DarkModeService } from './services/dark-mode.service'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ NavComponent ],
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
