import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, input, InputSignal, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [FontAwesomeModule, JsonPipe],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  public imageUrl: InputSignal<string | undefined> = input<string>();
  public username = input<string>();

  @Output()
  logoutClick = new EventEmitter<boolean>();

  onLogoutClick(event: MouseEvent | TouchEvent) {
    event.stopImmediatePropagation();
    this.logoutClick.emit(true);
  }
}
