export interface TextOverlay {
  id: string;
  text: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  position: {
    x: number;
    y: number;
  };
  style: {
    fontSize: number;
    color: string;
    fontFamily: string;
    fontWeight: string;
  };
}

export interface VideoState {
  url: string | null;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
}

export interface TimelineState {
  scale: number; // pixels per second
  scrollPosition: number;
  viewportWidth: number;
  duration: number;
}

export interface VideoExport {
  frameUrl: string;
  timestamp: number;
}
