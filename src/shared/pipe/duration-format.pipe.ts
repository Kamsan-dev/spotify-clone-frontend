import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationHowlerFormat',
  standalone: true,
})
export class DurationHowlerPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (!value || value < 0) return '00:00';

    const totalSeconds = Math.floor(value);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else {
      return `${pad(minutes)}:${pad(seconds)}`;
    }
  }
}
