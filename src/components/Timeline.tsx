import React, { useEffect, useCallback, useState, useRef } from "react";
import type { TextOverlay } from "@/types/video";
import { formatTime, getTimeMarkers } from "@/utils/timeFormat";
import { useTimeline } from "@/hooks/useTimeline";
import {
  ZoomIn,
  ZoomOut,
  SkipBack,
  SkipForward,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineProps {
  duration: number;
  currentTime: number;
  overlays: TextOverlay[];
  onSeek: (time: number) => void;
  onOverlayMove: (id: string, newStartTime: number) => void;
  onOverlayResize: (id: string, newDuration: number) => void;
  onOverlaySelect: (id: string | null) => void;
  selectedOverlayId: string | null;
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  overlays,
  onSeek,
  onOverlayMove,
  onOverlayResize,
  onOverlaySelect,
  selectedOverlayId,
  isPlaying = false,
  onPlayPause,
}) => {
  const {
    timelineRef,
    timelineState,
    isDragging,
    setIsDragging,
    updateViewportWidth,
    timeToPixels,
    pixelsToTime,
    setScrollPosition,
    zoom,
  } = useTimeline(duration);

  const [dragState, setDragState] = useState<{
    type: "playhead" | "overlay" | "resize" | null;
    overlayId?: string;
    startX?: number;
    startTime?: number;
    startDuration?: number;
  }>({ type: null });

  const [snapEnabled, setSnapEnabled] = useState(true);
  const [showFrames, setShowFrames] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Snap to grid functionality
  const snapToGrid = useCallback(
    (time: number) => {
      if (!snapEnabled) return time;
      const snapInterval = showFrames ? 1 / 30 : 0.1; // 1 frame or 0.1 second
      return Math.round(time / snapInterval) * snapInterval;
    },
    [snapEnabled, showFrames]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          onPlayPause?.();
          break;
        case "ArrowLeft": {
          e.preventDefault();
          const prevTime = showFrames ? currentTime - 1 / 30 : currentTime - 1;
          onSeek(Math.max(0, prevTime));
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const nextTime = showFrames ? currentTime + 1 / 30 : currentTime + 1;
          onSeek(Math.min(duration, nextTime));
          break;
        }
        case "Home":
          e.preventDefault();
          onSeek(0);
          break;
        case "End":
          e.preventDefault();
          onSeek(duration);
          break;
        case "s":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setSnapEnabled(!snapEnabled);
          }
          break;
        case "f":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowFrames(!showFrames);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, duration, onSeek, onPlayPause, snapEnabled, showFrames]);

  // Update viewport width on mount and resize
  useEffect(() => {
    updateViewportWidth();
    const handleResize = () => updateViewportWidth();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateViewportWidth]);

  // Sync timeline scroll with current time
  useEffect(() => {
    if (!isDragging) {
      const playheadPixels = timeToPixels(currentTime);
      const viewportStart = timelineState.scrollPosition;
      const viewportEnd = viewportStart + timelineState.viewportWidth;

      if (playheadPixels < viewportStart || playheadPixels > viewportEnd) {
        const centerOffset = timelineState.viewportWidth / 2;
        setScrollPosition(playheadPixels - centerOffset);
      }
    }
  }, [
    currentTime,
    timeToPixels,
    timelineState.scrollPosition,
    timelineState.viewportWidth,
    setScrollPosition,
    isDragging,
  ]);

  const handleMouseDown = useCallback(
    (
      e: React.MouseEvent,
      type: "playhead" | "overlay" | "resize",
      overlayId?: string
    ) => {
      e.preventDefault();
      setIsDragging(true);

      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickX = e.clientX - rect.left + timelineState.scrollPosition;
      let clickTime = pixelsToTime(clickX);

      if (type === "playhead") {
        clickTime = snapToGrid(clickTime);
      }

      if (type === "overlay" && overlayId) {
        const overlay = overlays.find((o) => o.id === overlayId);
        if (overlay) {
          setDragState({
            type: "overlay",
            overlayId,
            startX: clickX,
            startTime: overlay.startTime,
          });
          onOverlaySelect(overlayId);
        }
      } else if (type === "resize" && overlayId) {
        const overlay = overlays.find((o) => o.id === overlayId);
        if (overlay) {
          setDragState({
            type: "resize",
            overlayId,
            startX: clickX,
            startDuration: overlay.duration,
          });
        }
      } else if (type === "playhead") {
        setDragState({ type: "playhead" });
        onSeek(clickTime);
      }
    },
    [
      timelineRef,
      timelineState.scrollPosition,
      pixelsToTime,
      overlays,
      onOverlaySelect,
      onSeek,
      setIsDragging,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !dragState.type) return;

      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;

      const currentX = e.clientX - rect.left + timelineState.scrollPosition;
      const currentTime = pixelsToTime(currentX);

      if (dragState.type === "playhead") {
        onSeek(Math.max(0, Math.min(currentTime, duration)));
      } else if (
        dragState.type === "overlay" &&
        dragState.overlayId &&
        dragState.startX &&
        dragState.startTime !== undefined
      ) {
        const deltaPixels = currentX - dragState.startX;
        const deltaTime = pixelsToTime(deltaPixels);
        let newStartTime = Math.max(0, dragState.startTime + deltaTime);
        newStartTime = snapToGrid(newStartTime);
        onOverlayMove(dragState.overlayId, newStartTime);
      } else if (
        dragState.type === "resize" &&
        dragState.overlayId &&
        dragState.startX &&
        dragState.startDuration !== undefined
      ) {
        const deltaPixels = currentX - dragState.startX;
        const deltaTime = pixelsToTime(deltaPixels);
        const newDuration = Math.max(0.1, dragState.startDuration + deltaTime);
        onOverlayResize(dragState.overlayId, newDuration);
      }
    },
    [
      isDragging,
      dragState,
      timelineRef,
      timelineState.scrollPosition,
      pixelsToTime,
      duration,
      onSeek,
      onOverlayMove,
      onOverlayResize,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragState({ type: null });
  }, [setIsDragging]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const rect = timelineRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left + timelineState.scrollPosition;
        const mouseTime = pixelsToTime(mouseX);

        zoom(e.deltaY > 0 ? -10 : 10, mouseTime);
      } else {
        // Scroll
        setScrollPosition(timelineState.scrollPosition + e.deltaX);
      }
    },
    [
      timelineRef,
      timelineState.scrollPosition,
      pixelsToTime,
      zoom,
      setScrollPosition,
    ]
  );

  const timeMarkers =
    duration > 0 ? getTimeMarkers(duration, timelineState.scale) : [];
  const totalWidth = timeToPixels(duration);
  const playheadPosition =
    timeToPixels(currentTime) - timelineState.scrollPosition;

  return (
    <div
      ref={containerRef}
      className="bg-timeline-bg border-t border-editor-border"
    >
      {/* Timeline Header with Controls */}
      <div className="h-8 sm:h-10 bg-editor-panel border-b border-editor-border flex items-center px-2 sm:px-4 gap-2">
        <div className="text-text-secondary text-xs sm:text-sm font-medium">
          Timeline
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1 ml-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              onSeek(Math.max(0, currentTime - (showFrames ? 1 / 30 : 1)))
            }
            className="h-6 w-6 p-0"
          >
            <SkipBack className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onPlayPause}
            className="h-6 w-6 p-0"
          >
            {isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              onSeek(
                Math.min(duration, currentTime + (showFrames ? 1 / 30 : 1))
              )
            }
            className="h-6 w-6 p-0"
          >
            <SkipForward className="h-3 w-3" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 ml-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => zoom(-20)}
            className="h-6 w-6 p-0"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => zoom(20)}
            className="h-6 w-6 p-0"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>

        {/* Settings */}
      </div>

      {/* Timeline Ruler */}
      <div
        ref={timelineRef}
        className="relative h-10 sm:h-16 bg-black/10 overflow-hidden cursor-crosshair select-none border-b border-white/30"
        onMouseDown={(e) => handleMouseDown(e, "playhead")}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="absolute top-0 h-full"
          style={{
            width: `${totalWidth}px`,
            transform: `translateX(-${timelineState.scrollPosition}px)`,
          }}
        >
          {/* Time Markers */}
          {timeMarkers.map((marker) => (
            <div
              key={marker.time}
              className="absolute -top-5 flex flex-col items-center "
              style={{ left: `${timeToPixels(marker.time)}px` }}
            >
              <div
                className={`w-px ${
                  marker.major
                    ? "h-10 sm:h-12 bg-timeline-ruler"
                    : "h-6 sm:h-8 bg-timeline-ruler/30"
                } mt-auto`}
              />
              {marker.major && (
                <div className="text-[10px] sm:text-xs text-text-muted mt-1 whitespace-nowrap font-mono">
                  {showFrames ? formatTime(marker.time) : marker.label}
                </div>
              )}
            </div>
          ))}

          {/* Sub-frame markers when in frame mode */}
          {showFrames && timelineState.scale > 80 && (
            <>
              {Array.from({ length: Math.floor(duration * 30) }, (_, i) => {
                const frameTime = i / 30;
                const framePos = timeToPixels(frameTime);
                const isVisible =
                  framePos >= -50 && framePos <= totalWidth + 50;

                if (!isVisible) return null;

                return (
                  <div
                    key={`frame-${i}`}
                    className="absolute top-0 w-px h-3 bg-amber-300"
                    style={{ left: `${framePos}px` }}
                  />
                );
              })}
            </>
          )}

          {/* Snap indicators */}
          {snapEnabled && isDragging && (
            <div className="absolute top-0 w-full h-full pointer-events-none">
              {overlays.map((overlay) => (
                <React.Fragment key={`snap-${overlay.id}`}>
                  <div
                    className="absolute top-0 w-px h-full bg-amber-300/50"
                    style={{ left: `${timeToPixels(overlay.startTime)}px` }}
                  />
                  <div
                    className="absolute top-0 w-px h-full bg-amber-300/50"
                    style={{
                      left: `${timeToPixels(
                        overlay.startTime + overlay.duration
                      )}px`,
                    }}
                  />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Playhead */}
        {playheadPosition >= 0 &&
          playheadPosition <= timelineState.viewportWidth && (
            <div
              className="absolute top-0 w-0.5 h-full bg-blue-400 shadow-glow-timeline z-30 pointer-events-none"
              style={{ left: `${playheadPosition}px` }}
            >
              <div className="absolute -top-2 -left-3 w-6 h-6 bg-gray-600 rounded-sm shadow-lg" />
              <div className="absolute -bottom-0 left-0 w-0.5 h-2 bg-gray-600" />
            </div>
          )}

        {/* Current time indicator */}
        {playheadPosition >= 0 &&
          playheadPosition <= timelineState.viewportWidth && (
            <div
              className="absolute -top-6 bg-white/40 text-white text-xs px-2 py-1 rounded shadow-lg font-mono whitespace-nowrap z-30"
              style={{
                left: `${Math.max(
                  0,
                  Math.min(
                    playheadPosition - 30,
                    timelineState.viewportWidth - 60
                  )
                )}px`,
                transform: "translateY(-100%)",
              }}
            >
              {formatTime(currentTime)}
            </div>
          )}
      </div>

      {/* Overlay Track */}
      <div
        className="relative h-10 sm:h-16 bg-black/10 border-t border-editor-border/50 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          className="absolute top-0 h-full"
          style={{
            width: `${totalWidth}px`,
            transform: `translateX(-${timelineState.scrollPosition}px)`,
          }}
        >
          {overlays.map((overlay) => {
            const left = timeToPixels(overlay.startTime);
            const width = timeToPixels(overlay.duration);
            const isSelected = overlay.id === selectedOverlayId;

            return (
              <div
                key={overlay.id}
                className={`absolute top-1 sm:top-2 h-8 sm:h-12 rounded-md cursor-move transition-all ${
                  isSelected
                    ? "bg-blue-500 shadow-accent ring-2 ring-blue/50"
                    : "bg-purple-500 hover:bg-purple/80"
                }`}
                style={{
                  left: `${left}px`,
                  width: `${Math.max(width, 20)}px`,
                }}
                onMouseDown={(e) => handleMouseDown(e, "overlay", overlay.id)}
                onClick={() => onOverlaySelect(overlay.id)}
              >
                <div className="p-1 sm:p-2 h-full flex items-center justify-between">
                  <div className="text-white text-xs font-medium truncate">
                    {overlay.text}
                  </div>

                  {/* Resize Handle */}
                  <div
                    className="w-1 sm:w-2 h-full bg-white/20 hover:bg-white/40 cursor-ew-resize ml-1 rounded-r"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, "resize", overlay.id);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Playhead in overlay track */}
        {playheadPosition >= 0 &&
          playheadPosition <= timelineState.viewportWidth && (
            <div
              className="absolute top-0 w-0.5 h-full bg-white z-10 pointer-events-none"
              style={{ left: `${playheadPosition}px` }}
            />
          )}
      </div>
    </div>
  );
};
