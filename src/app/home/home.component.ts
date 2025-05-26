import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { SidebarComponent } from '../layout/components/sidebar/sidebar.component';
import { PlaylistViewComponent } from '../layout/components/playlist-view/playlist-view.component';
import { SongCardComponent } from '../../shared/components/song-card/song-card.component';
import { SongService } from '../song/song.service';
import { ReadSongInfo } from '../song/model/song.model';
import { Pagination } from '../../core/auth/model/request.model';
import { ToastService } from '../layout/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, PlaylistViewComponent, SongCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  songService = inject(SongService);
  toastService = inject(ToastService);
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
}
