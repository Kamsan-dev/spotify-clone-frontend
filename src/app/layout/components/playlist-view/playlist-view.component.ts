import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { map, Subject, takeUntil } from 'rxjs';
import { MenuPlaylistComponent } from '../../../../shared/components/menu-playlist/menu-playlist.component';
import { DurationPipe } from '../../../../shared/pipe/duration.pipe';
import { DisplayPlaylistDetail } from '../../../playlist/model/playlist.model';
import { PlaylistService } from '../../../playlist/playlist.service';
import { ReadSongInfo } from '../../../song/model/song.model';
import { SongContentService } from '../../../song/song-content.service';
import { ToastService } from '../../toast.service';
import { PlayerService } from '../player/player.service';
import { PlaylistHeaderBarComponent } from '../playlist-header-bar/playlist-header-bar.component';

@Component({
  selector: 'app-playlist-view',
  standalone: true,
  imports: [PlaylistHeaderBarComponent, DurationPipe, DatePipe, FontAwesomeModule, NgClass, MenuPlaylistComponent, RouterModule],
  templateUrl: './playlist-view.component.html',
  styleUrl: './playlist-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistViewComponent implements OnInit, OnDestroy {
  toastService = inject(ToastService);

  songContentService = inject(SongContentService);

  playlistService = inject(PlaylistService);

  activatedRoute = inject(ActivatedRoute);

  player = inject(PlayerService);

  playlist: WritableSignal<DisplayPlaylistDetail | undefined> = signal(undefined);

  songs: WritableSignal<Array<ReadSongInfo>> = signal([]);

  songPlayed: WritableSignal<ReadSongInfo | undefined> = signal(undefined);

  isPlaying = signal(false);

  loading = signal(false);

  totalDuration = signal(0);

  hoveredIndex: WritableSignal<number | null> = signal(null);

  private destroy: Subject<void> = new Subject<void>();

  constructor() {
    this.listenToGetPlaylist();
    this.listenToMusicPlayed();
    this.listenToDeleteFromPlaylist();
  }

  public ngOnInit(): void {
    this.listenToRouteParameter();
  }

  private listenToRouteParameter(): void {
    this.activatedRoute.queryParams
      .pipe(
        map((params) => params['publicId']),
        takeUntil(this.destroy)
      )
      .subscribe({
        next: (id) => {
          this.playlistService.getOne(id);
          this.loading.set(true);
        },
      });
  }

  private listenToGetPlaylist(): void {
    effect(
      () => {
        const state = this.playlistService.getOneSig();
        if (state.status === 'OK' && state.value) {
          this.songs.set(state.value.songs);
          state.value.songs = [];
          this.playlist.set(state.value);
          this.loading.set(false);
          this.setPlaylistTotalDuration();
          this.playlistService.resetOne();
        } else if (state.status === 'ERROR') {
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong when displaying this playlist',
          });
          this.loading.set(false);
        }
      },
      { allowSignalWrites: true }
    );
  }

  private listenToMusicPlayed(): void {
    effect(
      () => {
        this.songPlayed.set(this.songContentService.songPlayed());
      },
      { allowSignalWrites: true }
    );
  }

  private listenToDeleteFromPlaylist(): void {
    effect(
      () => {
        const state = this.playlistService.deleteSig();
        if (state.status === 'OK' && state.value) {
          console.log('playlist-view delete');
          console.log(this.songs());
          this.deleteSongFromPlaylist(state.value);
          console.log(this.songs());
          this.playlistService.resetDelete();
          this.toastService.send({
            severity: 'success',
            summary: 'Success',
            detail: 'Song has been successfully deleted from the playlist',
          });
        } else if (state.status === 'ERROR') {
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong when deleting this song from playlist',
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  public setPlaylistTotalDuration(): void {
    if (this.songs().length > 0) {
      const durations = this.songs().map((song) => song.duration.value);
      let total = durations.reduce((acc, value) => acc + value);
      this.totalDuration.set(total);
    } else {
      this.totalDuration.set(0);
    }
  }

  private deleteSongFromPlaylist(song: ReadSongInfo): void {
    const updatedSongs = this.songs().filter((s) => s.publicId !== song.publicId);
    this.songs.set([...updatedSongs]);
    this.setPlaylistTotalDuration();
  }

  //#region player buttons

  public play(song: ReadSongInfo) {
    if (this.songContentService.songPlayed()?.publicId !== song.publicId) {
      this.songContentService.getContent(song.publicId);
      this.songContentService.songPlayed.set(song);
    } else {
      this.player.play();
    }
  }

  public pause(event: MouseEvent | TouchEvent): void {
    event.stopImmediatePropagation();
    this.player.pause();
  }
}
