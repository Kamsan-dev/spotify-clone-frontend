import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { ReadSongInfo } from '../../../app/song/model/song.model';
import { MenuItem } from 'primeng/api';
import { ToastService } from '../../../app/layout/toast.service';
import { PlaylistService } from '../../../app/playlist/playlist.service';
import { MenuModule } from 'primeng/menu';
import { DisplayPlaylist } from '../../../app/playlist/model/playlist.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-menu-playlist',
  standalone: true,
  imports: [MenuModule, FontAwesomeModule],
  templateUrl: './menu-playlist.component.html',
  styleUrl: './menu-playlist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPlaylistComponent {
  song = input.required<ReadSongInfo | undefined>();
  menuFromPlayer = input<boolean>(true);
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
      //image: image,
      image:
        'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/cd-mixtape-album-cover-artwork-template-design-e3e2c2f896f01776f67e015dcfa26fca_screen.jpg?ts=1745348577',
      command: () => this.addOrDeleteSongPlaylist(p.publicId, this.song()?.publicId!),
      publicId: p.publicId,
      likedSongs: p.likedSongs,
    }));

    return menu;
  }

  public addOrDeleteSongPlaylist(playlistPublicId: string, songPublicId: string): void {
    const bool = this.isSongInPlaylist(playlistPublicId);
    if (!bool) {
      this.playlistService.add(playlistPublicId, songPublicId);
    } else {
      this.playlistService.delete(playlistPublicId, songPublicId, this.menuFromPlayer());
    }
  }

  public isSongInPlaylist(playlistPublicId: string): boolean {
    if (this.song()) {
      return this.song()!.playlistPublicIds.includes(playlistPublicId);
    } else return false;
  }
}
