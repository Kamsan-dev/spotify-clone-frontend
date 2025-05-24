import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SaveSong } from '../../model/song.model';
import { ToastService } from '../../../layout/toast.service';
import { SongService } from '../../song.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-new-song',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './new-song.component.html',
  styleUrl: './new-song.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewSongComponent implements OnDestroy {
  fb = inject(FormBuilder);
  toastService = inject(ToastService);
  songService = inject(SongService);
  dialogDynamicRef = inject(DynamicDialogRef);

  songToCreate: SaveSong = {
    title: { value: '' },
    artist: { value: '' },
    duration: { value: 100 },
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
  newSongForm!: FormGroup;
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
      title: [this.songToCreate.title.value, Validators.required],
      artist: [this.songToCreate.artist.value, Validators.required],
      duration: [this.songToCreate.artist.value, Validators.required],
      file: this.fb.control<File | null>(null, Validators.required),
      cover: this.fb.control<File | null>(null, Validators.required),
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
      console.log('signals');
      this.songCover.set(this.songToCreate.songCover!.urlDisplay);
      this.newSongForm.get('cover')?.setValue(cover);
    }
  }

  onUploadFile(target: EventTarget | null) {
    const file = this.extractFileFromTarget(target);
    if (file !== null) {
      this.songToCreate.songContent!.file = file;
      this.newSongForm.get('file')?.setValue(file);
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

  private onFormsChange(): void {
    this.newSongForm?.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy)).subscribe(() => {
      this.songToCreate.title.value = this.newSongForm!.get('title')?.value;
      this.songToCreate.artist.value = this.newSongForm!.get('artist')?.value;
      this.songToCreate.duration.value = this.newSongForm!.get('duration')?.value;
    });

    // this.formDecription.statusChanges.pipe(takeUntil(this.destroy)).subscribe(() => {
    //   this.stepValidityChange.emit(this.formDecription.valid);
    // });
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
