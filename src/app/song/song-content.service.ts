import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { State } from '../../core/auth/model/state.mode';
import { ReadSongInfo, SongContent } from './model/song.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SongContentService {
  public http = inject(HttpClient);

  private play$: WritableSignal<State<SongContent>> = signal(State.Builder<SongContent>().forInit());
  playSig = computed(() => this.play$());

  public songPlayed: WritableSignal<ReadSongInfo | undefined> = signal(undefined);

  public getContent(publicId: string): void {
    let params = new HttpParams().set('publicId', publicId);

    this.http.get<SongContent>(`${environment.API_URL}/songs/get-content`, { params }).subscribe({
      next: (song: SongContent) => this.play$.set(State.Builder<SongContent>().forSuccess(song)),
      error: (err: HttpErrorResponse) => this.play$.set(State.Builder<SongContent>().forError(err)),
    });
  }
}
