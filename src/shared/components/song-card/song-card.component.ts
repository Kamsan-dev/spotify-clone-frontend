import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { ReadSongInfo } from '../../../app/song/model/song.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-song-card',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './song-card.component.html',
  styleUrl: './song-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SongCardComponent implements OnInit {
  ngOnInit(): void {}
  song = input.required<ReadSongInfo>();
}
