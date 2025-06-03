import { ReadSongInfo } from '../../song/model/song.model';

export interface DisplayPlaylist {
  title: string;
  likedSongs: boolean;
  publicId: string;
  cover: PlaylistCover;
}

export interface PlaylistCover {
  file?: File;
  fileContentType?: string;
}

export interface DisplayPlaylistDetail {
  title: string;
  likedSongs: boolean;
  publicId: string;
  cover: PlaylistCover;
  songs: Array<ReadSongInfo>;
}
