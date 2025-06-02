import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { MenuPlaylistComponent } from '../../../../../shared/components/menu-playlist/menu-playlist.component';
import { PlaylistService } from '../../../../playlist/playlist.service';
import { ReadSongInfo } from '../../../../song/model/song.model';
import { ToastService } from '../../../toast.service';

@Component({
  selector: 'app-player-song-section',
  standalone: true,
  imports: [FontAwesomeModule, MenuModule, MenuPlaylistComponent],
  templateUrl: './player-song-section.component.html',
  styleUrl: './player-song-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerSongSectionComponent {
  song = input.required<ReadSongInfo | undefined>();
  public currentMenuItems: MenuItem[] = [];
  toastService = inject(ToastService);
  playlistService = inject(PlaylistService);
}
