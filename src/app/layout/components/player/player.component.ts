import { AfterViewInit, ChangeDetectionStrategy, Component, effect, ElementRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { MenuModule } from 'primeng/menu';
import { combineLatest } from 'rxjs';
import { DurationHowlerPipe } from '../../../../shared/pipe/duration-format.pipe';
import { DurationPipe } from '../../../../shared/pipe/duration.pipe';
import { PlaylistService } from '../../../playlist/playlist.service';
import { ReadSongInfo, SongContent } from '../../../song/model/song.model';
import { SongContentService } from '../../../song/song-content.service';
import { SongService } from '../../../song/song.service';
import { ToastService } from '../../toast.service';
import { PlayerSongSectionComponent } from './player-song-section/player-song-section.component';
import { PlayerService } from './player.service';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [FontAwesomeModule, DurationPipe, FormsModule, DurationHowlerPipe, MenuModule, PlayerSongSectionComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerComponent implements OnInit, AfterViewInit {
  songService = inject(SongService);
  toastService = inject(ToastService);
  songContentService = inject(SongContentService);
  playlistService = inject(PlaylistService);
  player = inject(PlayerService);

  songContent: SongContent | undefined = undefined;
  song: WritableSignal<ReadSongInfo | undefined> = signal(undefined);

  currentVolume = signal(0.2);
  volumeIcon: WritableSignal<IconProp> = signal('volume-high');

  progress = signal(0.0);
  duration = signal(0.0);

  // Detect WebKit-based browsers to apply browser-specific styles for the range input
  isWebkit = /AppleWebKit/.test(navigator.userAgent);

  @ViewChild('audioSlider') audioSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('volumeSlider') volumeSlider!: ElementRef<HTMLInputElement>;

  constructor() {
    this.listenToFetchSongContent();
    this.listenToFetchSongInfo();
  }
  public ngOnInit(): void {
    combineLatest([this.player.progressObs, this.player.durationObs]).subscribe(([progress, duration]) => {
      this.listenToTrackProgress(progress, duration);
    });

    this.player.volumeObs.subscribe((volume) => this.listenToVolumeUpdate(volume));
    this.player.volumeIconObs.subscribe((icon: IconProp) => this.setVolumeIcon(icon));
  }
  public ngAfterViewInit(): void {
    /* visual update for webkit browsers */
    /* update volume slider on init component lifecycle */
    const v = (this.currentVolume() * 100) / 1;
    updateSliderVisual(this.volumeSlider, v.toString());
  }

  private listenToFetchSongContent(): void {
    effect(
      () => {
        const state = this.songContentService.playSig();
        if (state.status === 'OK' && state.value) {
          this.songContent = state.value;
          // play music here
          this.player.initHowlInstance(this.songContent.fileContentType!, this.songContent.file!);
        } else if (state.status === 'ERROR') {
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to play this music now. Please try later.',
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  private listenToFetchSongInfo(): void {
    effect(
      () => {
        this.song.set(this.songContentService.songPlayed());
      },
      { allowSignalWrites: true }
    );
  }

  //#region player buttons

  public play(event: MouseEvent | TouchEvent) {
    event.stopImmediatePropagation();
    this.player.play();
  }

  public pause(event: MouseEvent | TouchEvent): void {
    event.stopImmediatePropagation();
    this.player.pause();
  }

  public onSeekPosition(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.player.currentHowlInstance) {
      this.player.onSeekPosition(Number(value));
      this.progress.set(Number(value));
      /* visual update for webkit browsers */
      const v = (this.progress() * 100) / this.duration();
      updateSliderVisual(this.audioSlider, v.toString());
    }
  }

  public onVolumeUpdate(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (this.player.currentHowlInstance) {
      this.player.onVolumeUpdate(value);
    }
  }

  public onMuteVolume(event: TouchEvent | MouseEvent): void {
    event.stopImmediatePropagation();
    if (this.player.currentHowlInstance) {
      this.player.onMuteVolume();
      /* visual update for webkit browsers */
      const v = (this.currentVolume() * 100) / 1;
      updateSliderVisual(this.volumeSlider, v.toString());
    }
  }

  private setVolumeIcon(icon: IconProp): void {
    this.volumeIcon.set(icon);
  }

  private listenToTrackProgress(progress: number, duration: number): void {
    if (this.player.currentHowlInstance) {
      this.progress.set(progress);
      this.duration.set(duration);
      /* visual update for webkit browsers */
      const v = (this.progress() * 100) / this.duration();
      updateSliderVisual(this.audioSlider, v.toString());
    }
  }

  private listenToVolumeUpdate(volume: number): void {
    if (this.player.currentHowlInstance) {
      /* visual update for webkit browsers */
      this.currentVolume.set(volume);
      const v = (this.currentVolume() * 100) / 1;
      updateSliderVisual(this.volumeSlider, v.toString());
    }
  }
}

function updateSliderVisual(el: ElementRef<HTMLInputElement>, v: string) {
  if (el.nativeElement) {
    el.nativeElement.style.setProperty('--value', v + '%');
  }
}
