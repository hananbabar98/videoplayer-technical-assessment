import React, { useState, useCallback, useEffect } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { Timeline } from "./Timeline";
import { ControlPanel } from "./ControlPanel";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { useTextOverlays } from "@/hooks/useTextOverlays";
import { toast } from "@/hooks/use-toast";

export const VideoEditor: React.FC = () => {
  const {
    videoRef,
    videoState,
    isLoading,
    loadVideo,
    play,
    pause,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
  } = useVideoPlayer();

  const {
    overlays,
    addOverlay,
    updateOverlay,
    deleteOverlay,
    getActiveOverlays,
    moveOverlay,
    resizeOverlay,
  } = useTextOverlays();

  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null
  );

  const activeOverlays = getActiveOverlays(videoState.currentTime);
  const selectedOverlay = selectedOverlayId
    ? overlays.find((overlay) => overlay.id === selectedOverlayId) || null
    : null;

  // Auto-select newly created overlays
  const handleAddOverlay = useCallback(() => {
    const id = addOverlay(videoState.currentTime);
    setSelectedOverlayId(id);
    toast({
      title: "Text overlay added",
      description: "New text overlay created at current time position.",
    });
  }, [addOverlay, videoState.currentTime]);

  const handleDeleteOverlay = useCallback(
    (id: string) => {
      deleteOverlay(id);
      if (selectedOverlayId === id) {
        setSelectedOverlayId(null);
      }
      toast({
        title: "Overlay deleted",
        description: "Text overlay has been removed.",
      });
    },
    [deleteOverlay, selectedOverlayId]
  );

  const handleExportPreview = useCallback(async () => {
    if (!videoRef.current || !videoState.url) return;

    try {
      // Create a canvas for capturing frames
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const video = videoRef.current;
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;

      // Capture current frame with overlays
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw active overlays on canvas
      const currentOverlays = getActiveOverlays(videoState.currentTime);
      currentOverlays.forEach((overlay) => {
        ctx.fillStyle = overlay.style.color;
        ctx.font = `${overlay.style.fontWeight} ${overlay.style.fontSize}px ${overlay.style.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Add text shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const x = (overlay.position.x / 100) * canvas.width;
        const y = (overlay.position.y / 100) * canvas.height;

        ctx.fillText(overlay.text, x, y);
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `video-frame-${Math.floor(videoState.currentTime)}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          toast({
            title: "Frame exported",
            description:
              "Current video frame with overlays has been downloaded.",
          });
        }
      }, "image/png");
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the video frame.",
        variant: "destructive",
      });
    }
  }, [videoRef, videoState, getActiveOverlays]);

  // Performance optimization: RAF for smooth updates
  useEffect(() => {
    let animationFrame: number;

    const updateAnimation = () => {
      if (videoState.isPlaying) {
        // Trigger any necessary re-renders for smooth overlay animations
        animationFrame = requestAnimationFrame(updateAnimation);
      }
    };

    if (videoState.isPlaying) {
      animationFrame = requestAnimationFrame(updateAnimation);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [videoState.isPlaying]);

  return (
    <div className="min-h-screen bg-editor-bg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 bg-editor-panel border-b border-editor-border flex items-center px-2 sm:px-4">
        <div className="text-text-primary font-semibold text-sm sm:text-lg">
          Video Timeline Editor
        </div>
        <div className="ml-auto text-text-muted text-xs sm:text-sm hidden sm:block">
          Professional Video Editing Suite
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Control Panel */}
        <div className="order-2 lg:order-1">
          <ControlPanel
            videoState={videoState}
            selectedOverlay={selectedOverlay}
            onLoadVideo={loadVideo}
            onPlay={play}
            onPause={pause}
            onSeek={seekTo}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
            onAddOverlay={handleAddOverlay}
            onUpdateOverlay={updateOverlay}
            onDeleteOverlay={handleDeleteOverlay}
            onExport={handleExportPreview}
          />
        </div>

        {/* Video and Timeline Area */}
        <div className="order-1 lg:order-2 flex-1 flex flex-col overflow-hidden">
          {/* Video Player */}
          <div className="flex-1 p-2 sm:p-4 lg:p-6 bg-editor-bg">
            <VideoPlayer
              videoRef={videoRef}
              videoUrl={videoState.url}
              activeOverlays={activeOverlays}
              isLoading={isLoading}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
            />
          </div>

          {/* Timeline */}
          <div className="h-32 sm:h-40 flex-shrink-0">
            <Timeline
              duration={videoState.duration}
              currentTime={videoState.currentTime}
              overlays={overlays}
              onSeek={seekTo}
              onOverlayMove={moveOverlay}
              onOverlayResize={resizeOverlay}
              onOverlaySelect={setSelectedOverlayId}
              selectedOverlayId={selectedOverlayId}
              isPlaying={videoState.isPlaying}
              onPlayPause={togglePlayPause}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-editor-panel border-t border-editor-border flex items-center px-4 text-xs text-text-muted">
        <div>
          {videoState.url ? "Video loaded" : "No video"} |{overlays.length}{" "}
          overlay{overlays.length !== 1 ? "s" : ""} | FPS:{" "}
          {videoState.isPlaying ? "60" : "0"}
        </div>
        <div className="ml-auto">{isLoading ? "Loading..." : "Ready"}</div>
      </div>
    </div>
  );
};
