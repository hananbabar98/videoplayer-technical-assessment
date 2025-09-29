import React from "react";
import type { TextOverlay } from "@/types/video";

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoUrl: string | null;
  activeOverlays: TextOverlay[];
  isLoading: boolean;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoRef,
  videoUrl,
  activeOverlays,
  isLoading,
  onLoadedMetadata,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
}) => {
  return (
    <div className="relative w-full aspect-video bg-player-bg rounded-lg overflow-hidden shadow-strong">
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          preload="metadata"
        />
      )}

      {/* Text Overlays Canvas */}
      <div className="absolute inset-0 pointer-events-none">
        {activeOverlays.map((overlay) => (
          <div
            key={overlay.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 select-none"
            style={{
              left: `${overlay.position.x}%`,
              top: `${overlay.position.y}%`,
              fontSize: `clamp(${Math.max(
                overlay.style.fontSize * 0.5,
                12
              )}px, ${overlay.style.fontSize}px, ${overlay.style.fontSize}px)`,
              color: overlay.style.color,
              fontFamily: overlay.style.fontFamily,
              fontWeight: overlay.style.fontWeight,
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              WebkitTextStroke: "1px rgba(0, 0, 0, 0.5)",
            }}
          >
            {overlay.text}
          </div>
        ))}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-player-overlay flex items-center justify-center">
          <div className="text-text-primary text-lg">Loading video...</div>
        </div>
      )}

      {/* No Video State */}
      {!videoUrl && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-text-secondary">
            <div className="text-6xl mb-4">🎬</div>
            <div className="text-xl font-medium">No video loaded</div>
            <div className="text-sm text-text-muted mt-2">
              Upload a video file to get started
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
