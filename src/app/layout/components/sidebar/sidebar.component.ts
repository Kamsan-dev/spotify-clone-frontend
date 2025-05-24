import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NewSongComponent } from '../../../song/dialog/new-song/new-song.component';

export interface MenuItem {
  label: string;
  icon: IconProp;
  routerLink?: string;
  command?: Function;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FontAwesomeModule, NewSongComponent],
  providers: [DialogService],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
  dialogService = inject(DialogService);
  ref: DynamicDialogRef | undefined;

  itemMenu1: MenuItem[] = [];
  itemMenu2: MenuItem[] = [];

  public ngOnInit(): void {
    this.loadMenu();
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
}
