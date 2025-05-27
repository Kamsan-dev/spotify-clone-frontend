import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Pagination } from '../../core/auth/model/request.model';
import { SongCardComponent } from '../../shared/components/song-card/song-card.component';
import { PlaylistHeaderBarComponent } from '../layout/components/playlist-header-bar/playlist-header-bar.component';
import { ToastService } from '../layout/toast.service';
import { ReadSongInfo } from '../song/model/song.model';
import { SongContentService } from '../song/song-content.service';
import { SongService } from '../song/song.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PlaylistHeaderBarComponent, SongCardComponent, FontAwesomeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  songService = inject(SongService);
  toastService = inject(ToastService);
  songContentService = inject(SongContentService);
  songs = signal<Array<ReadSongInfo> | undefined>(undefined);
  loading = signal(false);
  pageRequest: Pagination = { size: 20, page: 0, sort: [] };

  constructor() {
    this.listenToFetchSongs();
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

  private fetchAllSongs(): void {
    this.loading.set(true);
    this.songService.getAll(this.pageRequest);
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
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
