import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlaylistService } from '../../playlist.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastService } from '../../../layout/toast.service';

@Component({
  selector: 'app-new-playlist',
  standalone: true,
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './new-playlist.component.html',
  styleUrl: './new-playlist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPlaylistComponent {
  dialogDynamicRef = inject(DynamicDialogRef);
  playlistService = inject(PlaylistService);
  toastService = inject(ToastService);
  fb = inject(FormBuilder);

  loading = signal(false);
  createForm!: FormGroup;

  constructor() {
    this.initForm();
    this.listenToCreatePlaylist();
  }

  private initForm(): void {
    this.createForm = this.fb.nonNullable.group({
      title: ['', Validators.required],
    });
  }

  private listenToCreatePlaylist(): void {
    effect(
      () => {
        const state = this.playlistService.createSig();
        if (state.status === 'OK' && state.value) {
          this.loading.set(false);
          this.toastService.send({
            severity: 'success',
            summary: 'Success',
            detail: 'Playlist has been created successfully.',
          });
          this.playlistService.resetCreate();
          this.dialogDynamicRef.close(state.value);
        } else if (state.status === 'ERROR') {
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: 'Something when wrong when creating your playlist.',
          });
          this.loading.set(false);
        }
      },
      { allowSignalWrites: true }
    );
  }

  public onSubmit(): void {
    this.loading.set(true);
    this.playlistService.create(this.createForm.get('title')?.value);
  }
}
