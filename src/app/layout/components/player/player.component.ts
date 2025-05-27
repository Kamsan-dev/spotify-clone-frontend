import { ChangeDetectionStrategy, Component, effect, inject, signal, WritableSignal } from '@angular/core';
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

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [FontAwesomeModule, DurationPipe, FormsModule, DurationHowlerPipe],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerComponent {
  songService = inject(SongService);
  toastService = inject(ToastService);
  songContentService = inject(SongContentService);

  songContent: SongContent | undefined = undefined;
  song: WritableSignal<ReadSongInfo | undefined> = signal(undefined);
  currentHowlInstance: Howl | undefined;

  isPlaying = signal(false);

  currentVolume = signal(0.2);
  volumeIcon: WritableSignal<IconProp> = signal('volume-high');
  progress = signal(0.0);
  duration = signal(0.0);
  private animationFrameId: number | undefined;

  constructor() {
    this.listenToFetchSongContent();
    this.listenToFetchSongInfo();
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
        console.log(this.song());
      },
      { allowSignalWrites: true }
    );
  }

  private initHowlInstance(): void {
    console.log('initHowlinstance');
    const newHowlInstance = new Howl({
      src: [`data:${this.songContent?.fileContentType};base64,${this.songContent?.file}`],
      html5: true,
      volume: this.currentVolume(),
      onplay: () => {
        this.trackProgress();
        this.onPlay();
      },
      onpause: () => this.onPause(),
      onvolume: () => this.setVolumeIcon(),
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
    }
  }

  public onVolumeUpdate(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (this.currentHowlInstance) {
      this.currentHowlInstance.volume(value);
    }
  }

  private setVolumeIcon(): void {
    if (this.currentHowlInstance) {
      const volume = this.currentHowlInstance.volume();
      if (volume === 0) {
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
      }
      this.animationFrameId = requestAnimationFrame(updateProgress);
    };
    this.animationFrameId = requestAnimationFrame(updateProgress);
  }
}
