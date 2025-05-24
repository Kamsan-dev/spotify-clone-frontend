import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { User } from '../../../../core/auth/model/user.model';
import { AuthService } from '../../../../core/auth/service/auth.service';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-playlist-header-bar',
  standalone: true,
  imports: [AvatarComponent, CommonModule],
  templateUrl: './playlist-header-bar.component.html',
  styleUrl: './playlist-header-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistHeaderBarComponent implements OnInit {
  private http = inject(HttpClient);
  public authService = inject(AuthService);

  private colors: Array<string> = ['from-indigo-500', 'from-blue-500', 'from-green-500', 'from-purple-500', 'from-red-500', 'from-yellow-500', 'from-pink-500'];

  public headerColor: string = this.colors[0];

  public user: WritableSignal<User> = signal({ email: this.authService.notConnected });

  constructor() {
    this.fetchUser();
  }

  public ngOnInit(): void {
    this.pickHeaderColor();
  }

  private fetchUser(): void {
    effect(
      () => {
        const stateUser = this.authService.fetchUser();
        if (stateUser.status === 'OK' && stateUser.value) {
          this.user.set(stateUser.value);
        }
      },
      { allowSignalWrites: true }
    );
  }

  public pickHeaderColor(): void {
    this.headerColor = this.colors[Math.floor(Math.random() * this.colors.length)];
  }
}
