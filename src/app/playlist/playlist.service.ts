import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { State } from '../../core/auth/model/state.mode';
import { environment } from '../../environments/environment';
import { DisplayPlaylist, DisplayPlaylistDetail } from './model/playlist.model';
import { ReadSongInfo } from '../song/model/song.model';
import { SongContentService } from '../song/song-content.service';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  public http = inject(HttpClient);
  songContentService = inject(SongContentService);

  private getAll$: WritableSignal<State<Array<DisplayPlaylist>>> = signal(State.Builder<Array<DisplayPlaylist>>().forInit());
  getAllSig = computed(() => this.getAll$());

  private getOne$: WritableSignal<State<DisplayPlaylistDetail>> = signal(State.Builder<DisplayPlaylistDetail>().forInit());
  getOneSig = computed(() => this.getOne$());

  private create$: WritableSignal<State<DisplayPlaylist>> = signal(State.Builder<DisplayPlaylist>().forInit());
  createSig = computed(() => this.create$());

  private add$: WritableSignal<State<ReadSongInfo>> = signal(State.Builder<ReadSongInfo>().forInit());
  addSig = computed(() => this.add$());

  private delete$: WritableSignal<State<ReadSongInfo>> = signal(State.Builder<ReadSongInfo>().forInit());
  deleteSig = computed(() => this.delete$());

  public create(title: string): void {
    const params = new HttpParams().set('title', title);
    this.http.post<DisplayPlaylist>(`${environment.API_URL}/playlist/create`, {}, { params }).subscribe({
      next: (playlist: DisplayPlaylist) => this.create$.set(State.Builder<DisplayPlaylist>().forSuccess(playlist)),
      error: (err: HttpErrorResponse) => this.create$.set(State.Builder<DisplayPlaylist>().forError(err)),
    });
  }

  public getAll(): void {
    this.http.get<Array<DisplayPlaylist>>(`${environment.API_URL}/playlist/get-all`).subscribe({
      next: (playlists: Array<DisplayPlaylist>) => this.getAll$.set(State.Builder<Array<DisplayPlaylist>>().forSuccess(playlists)),
      error: (err: HttpErrorResponse) => this.getAll$.set(State.Builder<Array<DisplayPlaylist>>().forError(err)),
    });
  }

  public getOne(playlistPublicId: string): void {
    const params = new HttpParams().set('playlistPublicId', playlistPublicId);
    this.http.get<DisplayPlaylistDetail>(`${environment.API_URL}/playlist/get-one`, { params }).subscribe({
      next: (playlist: DisplayPlaylistDetail) => this.getOne$.set(State.Builder<DisplayPlaylistDetail>().forSuccess(playlist)),
      error: (err: HttpErrorResponse) => this.getOne$.set(State.Builder<DisplayPlaylistDetail>().forError(err)),
    });
  }

  public add(playlistPublicId: string, songPublicId: string) {
    let params = new HttpParams().set('playlistPublicId', playlistPublicId).set('songPublicId', songPublicId);
    this.http.post<ReadSongInfo>(`${environment.API_URL}/playlist/add-song-to-playlist`, {}, { params }).subscribe({
      next: (song: ReadSongInfo) => {
        this.add$.set(State.Builder<ReadSongInfo>().forSuccess(song));
        this.songContentService.songPlayed.set(song);
      },
      error: (err: HttpErrorResponse) => this.add$.set(State.Builder<ReadSongInfo>().forError(err)),
    });
  }

  public delete(playlistPublicId: string, songPublicId: string) {
    let params = new HttpParams().set('playlistPublicId', playlistPublicId).set('songPublicId', songPublicId);
    this.http.delete<ReadSongInfo>(`${environment.API_URL}/playlist/delete-song-from-playlist`, { params }).subscribe({
      next: (song: ReadSongInfo) => {
        this.delete$.set(State.Builder<ReadSongInfo>().forSuccess(song));
        this.songContentService.songPlayed.set(song);
      },
      error: (err: HttpErrorResponse) => this.delete$.set(State.Builder<ReadSongInfo>().forError(err)),
    });
  }

  public resetAll(): void {
    this.getAll$.set(State.Builder<Array<DisplayPlaylist>>().forInit());
  }

  public resetCreate(): void {
    this.create$.set(State.Builder<DisplayPlaylist>().forInit());
  }

  public resetDelete(): void {
    this.delete$.set(State.Builder<ReadSongInfo>().forInit());
  }

  public resetAdd(): void {
    this.add$.set(State.Builder<ReadSongInfo>().forInit());
  }
}
