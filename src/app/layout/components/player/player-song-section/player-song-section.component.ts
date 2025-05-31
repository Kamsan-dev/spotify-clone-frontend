import { ChangeDetectionStrategy, Component, effect, inject, input, OnInit } from '@angular/core';
import { ReadSongInfo } from '../../../../song/model/song.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ToastService } from '../../../toast.service';
import { PlaylistService } from '../../../../playlist/playlist.service';
import { DisplayPlaylist } from '../../../../playlist/model/playlist.model';

@Component({
  selector: 'app-player-song-section',
  standalone: true,
  imports: [FontAwesomeModule, MenuModule],
  templateUrl: './player-song-section.component.html',
  styleUrl: './player-song-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerSongSectionComponent implements OnInit {
  song = input.required<ReadSongInfo | undefined>();
  public currentMenuItems: MenuItem[] = [];
  toastService = inject(ToastService);
  playlistService = inject(PlaylistService);

  constructor() {
    this.listenToFetchPlaylistUser();
  }

  private listenToFetchPlaylistUser(): void {
    effect(
      () => {
        const state = this.playlistService.getAllSig();
        if (state.status === 'OK' && state.value) {
          this.currentMenuItems = this.loadMenu(state.value);
          console.log(this.currentMenuItems);
        } else if (state.status === 'ERROR') {
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: "Unable to play fetch user's playlists.",
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {}

  private loadMenu(playlists: Array<DisplayPlaylist>): any {
    let menu: MenuItem[] = [];

    const contentType = this.song()?.cover?.fileContentType;
    const fileBase64 = this.song()?.cover?.file;

    const image = contentType && fileBase64 ? `data:${contentType};base64,${fileBase64}` : 'https://discussions.apple.com/content/attachment/881765040';

    menu = playlists.map((p) => ({
      label: p.title,
      image: image,
      command: () => this.addCurrentSongToPlaylist(p.publicId, this.song()?.publicId!),
      isFavorite: this.song()?.favorite,
      publicId: p.publicId,
    }));

    return menu;
  }

  public addCurrentSongToPlaylist(playlistPublicId: string, songPublicId: string): void {
    this.playlistService.add(playlistPublicId, songPublicId);
  }

  public isSongInPlaylist(playlistPublicId: string): boolean {
    if (this.song()) {
      return this.song()!.playlistPublicIds.includes(playlistPublicId);
    } else return false;
  }
}
