import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SaveSong } from '../../model/song.model';

@Component({
  selector: 'app-new-song',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-song.component.html',
  styleUrl: './new-song.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewSongComponent {
  fb = inject(FormBuilder);

  songToCreate: SaveSong = {
    title: { value: '' },
    artist: { value: '' },
    duration: { value: 100 },
  };

  newSongForm!: FormGroup;

  loading = signal(false);

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.newSongForm = this.fb.nonNullable.group({
      title: [this.songToCreate.title.value, Validators.required],
      artist: [this.songToCreate.artist.value, Validators.required],
      duration: [this.songToCreate.artist.value, Validators.required],
      file: this.fb.control<File | null>(null, Validators.required), // MP3 file
      cover: this.fb.control<File | null>(null, Validators.required), // Image file
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
      //this.songToCreate.songCover?.fileContentType = cover.type;
    }
  }

  onUploadFile(target: EventTarget | null) {
    const file = this.extractFileFromTarget(target);
    if (file !== null) {
      this.songToCreate.songContent!.file = file;
      //this.songToCreate.fileContentType = file.type;
    }
  }

  onSubmit() {
    console.log(this.songToCreate);
  }
}
