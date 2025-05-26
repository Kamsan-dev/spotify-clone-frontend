import { SongArtistVO, SongDurationVO, SongTitleVO } from './song-vo.model';

export interface SaveSong {
  title: SongTitleVO;
  artist: SongArtistVO;
  songContent?: SongContent;
  songCover?: NewSongCover;
}

export interface SongContent {
  file?: File;
  fileContentType?: string;
}

export interface SongCover {
  file?: File;
  fileContentType?: string;
}
export interface ReadSongInfo {
  title: SongTitleVO;
  artist: SongArtistVO;
  duration: SongDurationVO;
  cover?: SongCover;
  publicId: string;
  isFavorite: boolean;
}

export interface NewSongCover {
  file?: File;
  urlDisplay?: string;
}
