import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Pagination } from '../../core/auth/model/request.model';
import { SongCardComponent } from '../../shared/components/song-card/song-card.component';
import { PlaylistHeaderBarComponent } from '../layout/components/playlist-header-bar/playlist-header-bar.component';
import { ToastService } from '../layout/toast.service';
import { ReadSongInfo } from '../song/model/song.model';
import { SongContentService } from '../song/song-content.service';
import { SongService } from '../song/song.service';
import { PlaylistService } from '../playlist/playlist.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PlaylistHeaderBarComponent, SongCardComponent, FontAwesomeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  songService = inject(SongService);
  toastService = inject(ToastService);
  songContentService = inject(SongContentService);
  playlistService = inject(PlaylistService);
  songs = signal<Array<ReadSongInfo>>([]);
  loading = signal(false);
  pageRequest: Pagination = { size: 20, page: 0, sort: [] };

  constructor() {
    this.listenToFetchSongs();
    this.listenToAddSongInPlaylist();
    this.listenToDeleteSongFromPlaylist();
  }

  private listenToFetchSongs(): void {
    effect(
      () => {
        const state = this.songService.getAllSig();
        if (state.status === 'OK' && state.value) {
          this.songs.set(state.value.content);
          this.loading.set(false);
        } else if (state.status === 'ERROR') {
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong when fetching songs library',
          });
          this.loading.set(false);
        }
      },
      { allowSignalWrites: true }
    );
  }

  private listenToAddSongInPlaylist(): void {
    effect(
      () => {
        const stateAdd = this.playlistService.addSig();
        if (stateAdd.status === 'OK' && stateAdd.value) {
          this.updateSongsCollection(stateAdd.value);
          this.toastService.send({
            severity: 'success',
            summary: 'Success',
            detail: 'Song has been successfully add to the playlist',
          });
          this.playlistService.resetAdd();
        } else if (stateAdd.status === 'ERROR') {
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong when adding this song to the playlist',
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  private listenToDeleteSongFromPlaylist(): void {
    effect(
      () => {
        const stateDelete = this.playlistService.deleteSig();
        if (stateDelete.status === 'OK' && stateDelete.value) {
          console.log('home delete');
          this.updateSongsCollection(stateDelete.value);
          this.toastService.send({
            severity: 'success',
            summary: 'Success',
            detail: 'Song has been successfully deleted from the playlist',
          });
          this.playlistService.resetDelete();
        } else if (stateDelete.status === 'ERROR') {
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong when deleting this song from the playlist',
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  private fetchAllSongs(): void {
    this.loading.set(true);
    this.songService.getAll(this.pageRequest);
  }

  private updateSongsCollection(song: ReadSongInfo): void {
    const index = this.songs().findIndex((i) => i.publicId === song.publicId);
    if (index !== undefined && index !== -1) {
      const updated = [...this.songs()];
      updated.splice(index, 1, song);
      this.songs.set(updated);
    }
  }
  ngOnInit(): void {
    this.fetchAllSongs();
  }

  //#region Events

  public onPlaySong(song: ReadSongInfo) {
    this.songContentService.getContent(song.publicId);
    this.songContentService.songPlayed.set(song);
  }
}
