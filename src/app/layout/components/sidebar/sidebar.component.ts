import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NewSongComponent } from '../../../song/dialog/new-song/new-song.component';
import { PlaylistService } from '../../../playlist/playlist.service';
import { DisplayPlaylist } from '../../../playlist/model/playlist.model';
import { ToastService } from '../../toast.service';
import { AuthService } from '../../../../core/auth/service/auth.service';
import { PlaylistItemComponent } from './playlist-item/playlist-item.component';
import { NewPlaylistComponent } from '../../../playlist/dialog/new-playlist/new-playlist.component';
import { take } from 'rxjs';

export interface MenuItem {
  label: string;
  icon: IconProp;
  routerLink?: string;
  command?: Function;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FontAwesomeModule, NewSongComponent, PlaylistItemComponent],
  providers: [DialogService],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
  dialogService = inject(DialogService);
  ref: DynamicDialogRef | undefined;
  playlistService = inject(PlaylistService);
  toastService = inject(ToastService);
  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);

  playlists: WritableSignal<Array<DisplayPlaylist>> = signal<DisplayPlaylist[]>([]);
  loading = signal(false);

  itemMenu1: MenuItem[] = [];
  itemMenu2: MenuItem[] = [];

  constructor() {
    this.listenToFetchPlaylistUser();
  }

  public ngOnInit(): void {
    this.loadMenu();
    this.fetchPlaylist();
  }

  private loadMenu(): void {
    this.itemMenu1 = [
      {
        label: 'Home',
        icon: 'home',
      },
      {
        label: 'Search',
        icon: 'search',
      },
      {
        label: 'Your library',
        icon: 'building',
      },
    ];

    this.itemMenu2 = [
      {
        label: 'Save a new song',
        icon: 'plus',
        command: (event: MouseEvent | TouchEvent) => this.onSaveNewSong(event),
      },
      {
        label: 'Create Playlist',
        icon: 'plus',
        command: (event: MouseEvent | TouchEvent) => this.onCreatePlaylist(event),
      },
      {
        label: 'Your episodes',
        icon: 'video',
      },
      {
        label: 'Liked Songs',
        icon: 'heart',
      },
    ];
  }

  onSaveNewSong(event: MouseEvent | TouchEvent): void {
    event.stopImmediatePropagation();
    this.ref = this.dialogService.open(NewSongComponent, {
      width: '60%',
      header: 'Save a new song now !',
      closable: true,
      focusOnShow: true,
      modal: true,
      showHeader: true,
    });
  }

  onCreatePlaylist(event: MouseEvent | TouchEvent): void {
    event.stopImmediatePropagation();
    this.dialogService
      .open(NewPlaylistComponent, {
        width: '40%',
        header: 'Create a playlist now !',
        closable: true,
        focusOnShow: true,
        modal: true,
        showHeader: true,
      })
      .onClose.pipe(take(1))
      .subscribe((playlist: DisplayPlaylist) => {
        if (playlist) {
          this.playlists().push(playlist);
          this.cdr.detectChanges();
        }
      });
  }

  private listenToFetchPlaylistUser(): void {
    effect(
      () => {
        const state = this.playlistService.getAllSig();
        if (state.status === 'OK' && state.value) {
          this.playlists.set(state.value);
          this.loading.set(false);
        } else if (state.status === 'ERROR') {
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: "Unable to play fetch user's playlists.",
          });
          this.loading.set(false);
        }
      },
      { allowSignalWrites: true }
    );
  }

  private fetchPlaylist(): void {
    this.playlistService.getAll();
    this.loading.set(true);
  }

  onPlaylistClick(playlist: DisplayPlaylist): void {
    console.log(playlist);
  }
}
