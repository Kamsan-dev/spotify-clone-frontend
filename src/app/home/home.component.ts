import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidebarComponent } from '../layout/components/sidebar/sidebar.component';
import { PlaylistViewComponent } from '../layout/components/playlist-view/playlist-view.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, PlaylistViewComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
