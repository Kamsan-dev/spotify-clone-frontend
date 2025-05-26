import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SaveSong } from '../../model/song.model';
import { ToastService } from '../../../layout/toast.service';
import { SongService } from '../../song.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { JsonPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-new-song',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe, FontAwesomeModule],
  templateUrl: './new-song.component.html',
  styleUrl: './new-song.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewSongComponent implements OnDestroy {
  fb = inject(FormBuilder);
  toastService = inject(ToastService);
  songService = inject(SongService);
  dialogDynamicRef = inject(DynamicDialogRef);

  newSongForm!: FormGroup;
  songToCreate: SaveSong = {
    title: { value: '' },
    artist: { value: '' },
    songContent: {
      file: undefined,
      fileContentType: undefined,
    },
    songCover: {
      file: undefined,
      urlDisplay: undefined,
    },
  };

  songCover = signal('https://iili.io/HlHy9Yx.png');
  fileName = signal('');
  loading = signal(false);

  private destroy: Subject<void> = new Subject<void>();

  constructor() {
    this.initForm();
    this.listenToSaveCreation();
    this.onFormsChange();
  }

  private listenToSaveCreation(): void {
    effect(
      () => {
        const state = this.songService.saveSig();
        if (state.status === 'OK' && state.value) {
          this.onSaveOk();
        } else if (state.status === 'ERROR') {
          this.onSaveError();
        }
      },
      { allowSignalWrites: true }
    );
  }

  private initForm(): void {
    this.newSongForm = this.fb.nonNullable.group({
      title: [{ value: this.songToCreate.title.value, disabled: true }, Validators.required],
      artist: [this.songToCreate.artist.value, Validators.required],
      file: ['', Validators.required],
      cover: ['', Validators.required],
    });
  }

  private onFormsChange(): void {
    this.newSongForm?.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy)).subscribe(() => {
      this.songToCreate.title.value = this.newSongForm!.get('title')?.value;
      this.songToCreate.artist.value = this.newSongForm!.get('artist')?.value;
    });
  }

  private extractFileFromTarget(target: EventTarget | null): File | null {
    const htmlInputTarget = target as HTMLInputElement;
    if (target === null || htmlInputTarget.files === null) {
      return null;
    }
    return htmlInputTarget.files[0];
  }

  onUploadCover(target: EventTarget | null) {
    const cover = this.extractFileFromTarget(target);
    if (cover !== null) {
      this.songToCreate.songCover!.file = cover;
      this.songToCreate.songCover!.urlDisplay = URL.createObjectURL(cover);
      // this.newSongForm.get('cover')?.setValue(cover.name);
      this.songCover.set(this.songToCreate.songCover!.urlDisplay);
    }
  }

  onUploadFile(target: EventTarget | null) {
    const file = this.extractFileFromTarget(target);
    if (file !== null) {
      this.songToCreate.songContent!.file = file;
      this.newSongForm.get('title')?.setValue(file.name);
      this.newSongForm.get('title')?.enable();
      this.fileName.set(file.name);
    }
  }

  onSubmit() {
    console.log(this.songToCreate);
    this.loading.set(true);
    this.songService.saveSong(this.songToCreate);
  }

  public onSaveOk() {
    this.loading.set(false);
    this.toastService.send({
      severity: 'success',
      summary: 'Success',
      detail: 'Song has been saved successfully.',
    });
    this.songService.resetSaveSong();
    this.dialogDynamicRef.close();
  }

  public onSaveError() {
    this.loading.set(false);
    this.toastService.send({
      severity: 'error',
      summary: 'Error',
      detail: "Couldn't save your song, please try again.",
    });
  }
  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
