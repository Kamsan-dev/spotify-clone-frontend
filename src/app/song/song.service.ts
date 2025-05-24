import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { State } from '../../core/auth/model/state.mode';
import { ReadSongInfo, SaveSong } from './model/song.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  public http = inject(HttpClient);

  private save$: WritableSignal<State<ReadSongInfo>> = signal(State.Builder<ReadSongInfo>().forInit());
  saveSig = computed(() => this.save$());

  public saveSong(song: SaveSong): void {
    const formData = new FormData();
    formData.append('cover', song.songCover!.file!);
    formData.append('file', song.songContent!.file!);

    const clone = structuredClone(song);
    clone.songContent = undefined;
    clone.songCover = undefined;
    formData.append('dto', JSON.stringify(clone));
    this.http.post<ReadSongInfo>(`${environment.API_URL}/songs`, formData).subscribe({
      next: (savedSong: ReadSongInfo) => this.save$.set(State.Builder<ReadSongInfo>().forSuccess(savedSong)),
      error: (err: HttpErrorResponse) => this.save$.set(State.Builder<ReadSongInfo>().forError(err)),
    });
  }

  public resetSaveSong(): void {
    this.save$.set(State.Builder<ReadSongInfo>().forInit());
  }
}
