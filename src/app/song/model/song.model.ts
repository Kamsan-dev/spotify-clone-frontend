import { SongArtistVO, SongDurationVO, SongTitleVO } from './song-vo.model';

export interface SaveSong {
  title: SongTitleVO;
  artist: SongArtistVO;
  duration: SongDurationVO;
  songContent?: SongContent;
  songCover?: SongCover;
}

export interface SongContent {
  file: File;
  fileContentType: string;
}

export interface SongCover {
  file: File;
  fileContentType: string;
}
export interface ReadSongInfo {
  title: SongTitleVO;
  artist: SongArtistVO;
  duration: SongDurationVO;
  songCover?: SongCover;
  publicId: string;
  isFavorite: boolean;
}
