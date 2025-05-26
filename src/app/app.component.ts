import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../core/auth/service/auth.service';
import { fontAwesomeIcons } from '../shared/font-awesome-icon';
import { ToastService } from './layout/toast.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SidebarComponent } from './layout/components/sidebar/sidebar.component';
import { LoginComponent } from '../core/auth/components/login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, SidebarComponent, LoginComponent],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private faIconLibrary: FaIconLibrary = inject(FaIconLibrary);
  public authService = inject(AuthService);
  private toastService: ToastService = inject(ToastService);
  private messageService = inject(MessageService);

  public ngOnInit(): void {
    this.initFontAwesome();
    this.listenToastService();
    //this.authService.initAuthentication();
  }

  private initFontAwesome(): void {
    this.faIconLibrary.addIcons(...fontAwesomeIcons);
  }

  private listenToastService(): void {
    this.toastService.sendSub.subscribe({
      next: (newMessage) => {
        if (newMessage && newMessage.summary !== this.toastService.INIT_STATE) {
          console.log('message service add');
          this.messageService.add(newMessage);
        }
      },
    });
  }
}
