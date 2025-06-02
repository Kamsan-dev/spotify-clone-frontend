import { ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { PlaylistHeaderBarComponent } from '../playlist-header-bar/playlist-header-bar.component';
import { DisplayPlaylistDetail } from '../../../playlist/model/playlist.model';
import { PlaylistService } from '../../../playlist/playlist.service';
import { SongContentService } from '../../../song/song-content.service';
import { ToastService } from '../../toast.service';
import { ActivatedRoute } from '@angular/router';
import { map, Subject, takeUntil } from 'rxjs';
import { ReadSongInfo } from '../../../song/model/song.model';
import { DurationPipe } from '../../../../shared/pipe/duration.pipe';
import { DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-playlist-view',
  standalone: true,
  imports: [PlaylistHeaderBarComponent, DurationPipe, DatePipe, FontAwesomeModule],
  templateUrl: './playlist-view.component.html',
  styleUrl: './playlist-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistViewComponent implements OnInit, OnDestroy {
  toastService = inject(ToastService);
  songContentService = inject(SongContentService);
  playlistService = inject(PlaylistService);
  activatedRoute = inject(ActivatedRoute);
  playlist: WritableSignal<DisplayPlaylistDetail | undefined> = signal(undefined);
  songs: WritableSignal<Array<ReadSongInfo>> = signal([]);
  loading = signal(false);
  totalDuration = signal(0);

  private destroy: Subject<void> = new Subject<void>();

  constructor() {
    this.listenToGetPlaylist();
  }

  public ngOnInit(): void {
    this.fetchPlaylistDetail();
  }

  private fetchPlaylistDetail(): void {
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
}
