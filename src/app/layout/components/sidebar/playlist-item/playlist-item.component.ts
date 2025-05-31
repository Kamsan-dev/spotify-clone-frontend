import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { DisplayPlaylist } from '../../../../playlist/model/playlist.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-playlist-item',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './playlist-item.component.html',
  styleUrl: './playlist-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistItemComponent {
  playlist = input.required<DisplayPlaylist>();
  owner = input.required<string>();

  @Output()
  playlistClick = new EventEmitter<DisplayPlaylist>();

  public onPlaylistClick(event: MouseEvent | TouchEvent): void {
    this.playlistClick.emit(this.playlist());
  }
}
