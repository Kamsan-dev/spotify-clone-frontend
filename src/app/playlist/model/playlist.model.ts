export interface DisplayPlaylist {
  title: string;
  isLikedSongs: boolean;
  publicId: string;
  cover: PlaylistCover;
}

export interface PlaylistCover {
  file?: File;
  fileContentType?: string;
}
