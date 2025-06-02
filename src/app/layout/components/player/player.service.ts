import { Injectable, signal } from '@angular/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { BehaviorSubject } from 'rxjs';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  currentHowlInstance: Howl | undefined;
  isPlaying = signal(false);

  private progress$ = new BehaviorSubject<number>(0);
  private duration$ = new BehaviorSubject<number>(0);
  private volume$ = new BehaviorSubject<number>(0);
  private volumeIcon$ = new BehaviorSubject<IconProp>('volume-low');
  progressObs = this.progress$.asObservable();
  durationObs = this.duration$.asObservable();
  volumeObs = this.volume$.asObservable();
  volumeIconObs = this.volumeIcon$.asObservable();
  private animationFrameId: number | undefined;
  private volumeBeforeMute = 0;

  constructor() {}

  public initHowlInstance(fileContentType: string, file: File): void {
    const newHowlInstance = new Howl({
      src: [`data:${fileContentType};base64,${file}`],
      html5: true,
      volume: 0.2,
      onplay: () => {
        this.trackProgress();
        this.onPlay();
      },
      onpause: () => {
        this.onPause();
      },
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

  public play() {
    if (this.currentHowlInstance) {
      this.currentHowlInstance.play();
    }
  }

  public pause(): void {
    if (this.currentHowlInstance) {
      this.currentHowlInstance.pause();
    }
  }

  public onSeekPosition(value: number): void {
    if (this.currentHowlInstance) {
      this.currentHowlInstance.seek(value);
    }
  }

  public onVolumeUpdate(value: number): void {
    if (this.currentHowlInstance) {
      this.currentHowlInstance.volume(value);
      this.volume$.next(value);
    }
  }

  private setVolumeIcon(): IconProp | undefined {
    if (this.currentHowlInstance) {
      const volume = this.currentHowlInstance.volume();
      if (volume === 0 || this.currentHowlInstance.mute()) {
        this.volumeIcon$.next('volume-xmark');
      } else if (volume > 0 && volume <= 0.3) {
        this.volumeIcon$.next('volume-low');
      } else {
        this.volumeIcon$.next('volume-high');
      }
    }
    return undefined;
  }

  public onMuteVolume(): void {
    if (this.currentHowlInstance) {
      if (this.currentHowlInstance.mute()) {
        this.currentHowlInstance.mute(false);
        this.currentHowlInstance.volume(this.volumeBeforeMute);
        this.volume$.next(this.volumeBeforeMute);
      } else {
        this.volumeBeforeMute = this.currentHowlInstance.volume();
        this.currentHowlInstance.mute(true);
        this.volume$.next(0);
      }
      /* visual update for webkit browsers */
      // const v = (this.currentVolume() * 100) / 1;
      // updateSliderVisual(this.volumeSlider, v.toString());
    }
  }

  private trackProgress(): void {
    const updateProgress = () => {
      if (this.currentHowlInstance?.playing()) {
        const progress = this.currentHowlInstance.seek() as number;
        this.progress$.next(Math.floor(progress));
        this.duration$.next(this.currentHowlInstance.duration());
      }
      this.animationFrameId = requestAnimationFrame(updateProgress);
    };
    this.animationFrameId = requestAnimationFrame(updateProgress);
  }
}
