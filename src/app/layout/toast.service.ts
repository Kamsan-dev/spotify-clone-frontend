import { Injectable } from '@angular/core';
import { Message } from 'primeng/api';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  public INIT_STATE: string | undefined = 'INIT';
  private send$: BehaviorSubject<Message> = new BehaviorSubject<Message>({ summary: this.INIT_STATE });
  public sendSub: Observable<Message> = this.send$.asObservable();
  public send(message: Message): void {
    this.send$.next(message);
  }

  constructor() {}
}
