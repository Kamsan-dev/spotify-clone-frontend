import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { State } from '../../core/auth/model/state.mode';
import { ReadSongInfo, SaveSong } from './model/song.model';
import { environment } from '../../environments/environment';
import { createPaginationOption, Page, Pageable, Pagination } from '../../core/auth/model/request.model';
import { delay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  public http = inject(HttpClient);

  private save$: WritableSignal<State<ReadSongInfo>> = signal(State.Builder<ReadSongInfo>().forInit());
  saveSig = computed(() => this.save$());

  private getAll$: WritableSignal<State<Page<ReadSongInfo>>> = signal(State.Builder<Page<ReadSongInfo>>().forInit());
  getAllSig = computed(() => this.getAll$());

  public saveSong(song: SaveSong): void {
    const formData = new FormData();
    formData.append('cover', song.songCover!.file!);
    formData.append('file', song.songContent!.file!);

    const clone = structuredClone(song);
    clone.songContent = undefined;
    clone.songCover = undefined;
    formData.append('dto', JSON.stringify(clone));
    this.http.post<ReadSongInfo>(`${environment.API_URL}/songs/save`, formData).subscribe({
      next: (savedSong: ReadSongInfo) => this.save$.set(State.Builder<ReadSongInfo>().forSuccess(savedSong)),
      error: (err: HttpErrorResponse) => this.save$.set(State.Builder<ReadSongInfo>().forError(err)),
    });
  }

  public getAll(pageRequest: Pagination): void {
    let params = createPaginationOption(pageRequest);
    this.http
      .get<Page<ReadSongInfo>>(`${environment.API_URL}/songs/get-all`, { params })
      .pipe(delay(800))
      .subscribe({
        next: (songs: Page<ReadSongInfo>) => this.getAll$.set(State.Builder<Page<ReadSongInfo>>().forSuccess(songs)),
        error: (err: HttpErrorResponse) => this.getAll$.set(State.Builder<Page<ReadSongInfo>>().forError(err)),
      });
  }

  public resetAll(): void {
    this.getAll$.set(State.Builder<Page<ReadSongInfo>>().forInit());
  }

  public resetSaveSong(): void {
    this.save$.set(State.Builder<ReadSongInfo>().forInit());
  }
}
