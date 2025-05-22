import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface MenuItem {
  label: string;
  icon: IconProp;
  routerLink?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
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
}
