import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaylistHeaderBarComponent } from '../playlist-header-bar/playlist-header-bar.component';

@Component({
  selector: 'app-playlist-view',
  standalone: true,
  imports: [PlaylistHeaderBarComponent],
  templateUrl: './playlist-view.component.html',
  styleUrl: './playlist-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistViewComponent {}
