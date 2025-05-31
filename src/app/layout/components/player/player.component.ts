import { AfterViewInit, ChangeDetectionStrategy, Component, effect, ElementRef, inject, signal, ViewChild, WritableSignal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastService } from '../../toast.service';
import { SongService } from '../../../song/song.service';
import { SongContentService } from '../../../song/song-content.service';
import { ReadSongInfo, SongContent } from '../../../song/model/song.model';
import { DurationPipe } from '../../../../shared/pipe/duration.pipe';
import { Howl } from 'howler';
import { FormsModule } from '@angular/forms';
import { DurationHowlerPipe } from '../../../../shared/pipe/duration-format.pipe';
import { Icon, IconProp } from '@fortawesome/fontawesome-svg-core';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { DisplayPlaylist } from '../../../playlist/model/playlist.model';
import { PlaylistService } from '../../../playlist/playlist.service';
import { PlayerSongSectionComponent } from './player-song-section/player-song-section.component';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [FontAwesomeModule, DurationPipe, FormsModule, DurationHowlerPipe, MenuModule, PlayerSongSectionComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerComponent implements AfterViewInit {
  songService = inject(SongService);
  toastService = inject(ToastService);
  songContentService = inject(SongContentService);
  playlistService = inject(PlaylistService);

  songContent: SongContent | undefined = undefined;
  song: WritableSignal<ReadSongInfo | undefined> = signal(undefined);
  currentHowlInstance: Howl | undefined;

  isPlaying = signal(false);

  currentVolume = signal(0.2);
  volumeIcon: WritableSignal<IconProp> = signal('volume-high');
  private volumeBeforeMute = 0;
  progress = signal(0.0);
  duration = signal(0.0);
  private animationFrameId: number | undefined;

  // Detect WebKit-based browsers to apply browser-specific styles for the range input
  isWebkit = /AppleWebKit/.test(navigator.userAgent);

  @ViewChild('audioSlider') audioSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('volumeSlider') volumeSlider!: ElementRef<HTMLInputElement>;

  constructor() {
    this.listenToFetchSongContent();
    this.listenToFetchSongInfo();
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
          this.initHowlInstance();
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

  private initHowlInstance(): void {
    const newHowlInstance = new Howl({
      src: [`data:${this.songContent?.fileContentType};base64,${this.songContent?.file}`],
      html5: true,
      volume: 0.2,
      onplay: () => {
        this.trackProgress();
        this.onPlay();
      },
      onpause: () => this.onPause(),
      onvolume: () => this.setVolumeIcon(),
      onmute: () => this.setVolumeIcon(),
      onend: () => this.onPause(),
    });

    if (this.currentHowlInstance) {
      this.currentHowlInstance.stop();
    }

    this.currentHowlInstance = newHowlInstance;
    this.currentHowlInstance.play();
  }

  private onPlay(): void {
    this.isPlaying.set(true);
  }
  private onPause(): void {
    this.isPlaying.set(false);
  }

  //#region player buttons

  public play(event: MouseEvent | TouchEvent) {
    event.stopImmediatePropagation();
    if (this.currentHowlInstance) {
      this.currentHowlInstance.play();
    }
  }

  public pause(event: MouseEvent | TouchEvent): void {
    event.stopImmediatePropagation();
    if (this.currentHowlInstance) {
      this.currentHowlInstance.pause();
      this.currentHowlInstance.seek();
    }
  }

  public onSeekPosition(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.currentHowlInstance) {
      this.currentHowlInstance.seek(Number(value));
      this.progress.set(Number(value));

      /* visual update for webkit browsers */
      const v = (this.progress() * 100) / this.duration();
      updateSliderVisual(this.audioSlider, v.toString());
    }
  }

  public onVolumeUpdate(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (this.currentHowlInstance) {
      this.currentVolume.set(value);
      this.currentHowlInstance.volume(value);

      /* visual update for webkit browsers */
      const v = (this.currentVolume() * 100) / 1;
      updateSliderVisual(this.volumeSlider, v.toString());
    }
  }

  public onMuteVolume(event: TouchEvent | MouseEvent): void {
    event.stopImmediatePropagation();
    if (this.currentHowlInstance) {
      if (this.currentHowlInstance.mute()) {
        this.currentHowlInstance.mute(false);
        this.currentHowlInstance.volume(this.volumeBeforeMute);
        this.currentVolume.set(this.volumeBeforeMute);
      } else {
        this.volumeBeforeMute = this.currentHowlInstance.volume();
        this.currentHowlInstance.mute(true);
        this.currentVolume.set(0);
      }
      /* visual update for webkit browsers */
      const v = (this.currentVolume() * 100) / 1;
      updateSliderVisual(this.volumeSlider, v.toString());
    }
  }

  private setVolumeIcon(): void {
    if (this.currentHowlInstance) {
      const volume = this.currentHowlInstance.volume();
      if (volume === 0 || this.currentHowlInstance.mute()) {
        this.volumeIcon.set('volume-xmark');
      } else if (volume > 0 && volume <= 0.3) {
        this.volumeIcon.set('volume-low');
      } else {
        this.volumeIcon.set('volume-high');
      }
    }
  }

  private trackProgress(): void {
    const updateProgress = () => {
      if (this.currentHowlInstance?.playing()) {
        const progress = this.currentHowlInstance.seek() as number;
        this.progress.set(Math.floor(progress));
        this.duration.set(this.currentHowlInstance.duration());

        /* visual update for webkit browsers */
        const v = (this.progress() * 100) / this.duration();
        this.audioSlider.nativeElement.style.setProperty('--value', v.toString() + '%');
      }
      this.animationFrameId = requestAnimationFrame(updateProgress);
    };
    this.animationFrameId = requestAnimationFrame(updateProgress);
  }
}

function updateSliderVisual(el: ElementRef<HTMLInputElement>, v: string) {
  if (el.nativeElement) {
    el.nativeElement.style.setProperty('--value', v + '%');
  }
}
