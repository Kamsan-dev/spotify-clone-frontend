import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(value: number | null | undefined, playlistVue: boolean = false): string {
    if (!value || value < 0) return '00:00';

    const totalSeconds = Math.floor(value / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (!playlistVue) {
      if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      } else {
        return `${pad(minutes)}:${pad(seconds)}`;
      }
    } else {
      if (hours > 0) {
        return `${pad(hours)} h ${pad(minutes)} min ${pad(seconds)} s`;
      } else {
        return `${pad(minutes)} min ${pad(seconds)} s`;
      }
    }
  }
}
