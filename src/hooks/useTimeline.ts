import { useState, useCallback, useRef } from 'react';
import { TimelineState } from '@/types/video';

export const useTimeline = (duration: number) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineState, setTimelineState] = useState<TimelineState>({
    scale: 50, // pixels per second
    scrollPosition: 0,
    viewportWidth: 0,
    duration,
  });

  const [isDragging, setIsDragging] = useState(false);

  const updateViewportWidth = useCallback(() => {
    if (timelineRef.current) {
      setTimelineState(prev => ({
        ...prev,
        viewportWidth: timelineRef.current!.clientWidth,
      }));
    }
  }, []);

  const setScale = useCallback((scale: number) => {
    setTimelineState(prev => ({
      ...prev,
      scale: Math.max(10, Math.min(200, scale)), // Clamp between 10-200 pixels per second
    }));
  }, []);

  const setScrollPosition = useCallback((position: number) => {
    const maxScroll = Math.max(0, duration * timelineState.scale - timelineState.viewportWidth);
    setTimelineState(prev => ({
      ...prev,
      scrollPosition: Math.max(0, Math.min(position, maxScroll)),
    }));
  }, [duration, timelineState.scale, timelineState.viewportWidth]);

  const timeToPixels = useCallback((time: number) => {
    return time * timelineState.scale;
  }, [timelineState.scale]);

  const pixelsToTime = useCallback((pixels: number) => {
    return pixels / timelineState.scale;
  }, [timelineState.scale]);

  const getVisibleTimeRange = useCallback(() => {
    const startTime = pixelsToTime(timelineState.scrollPosition);
    const endTime = pixelsToTime(timelineState.scrollPosition + timelineState.viewportWidth);
    return { startTime, endTime };
  }, [timelineState.scrollPosition, timelineState.viewportWidth, pixelsToTime]);

  const scrollToTime = useCallback((time: number) => {
    const pixelPosition = timeToPixels(time);
    const centerOffset = timelineState.viewportWidth / 2;
    setScrollPosition(pixelPosition - centerOffset);
  }, [timeToPixels, timelineState.viewportWidth, setScrollPosition]);

  const zoom = useCallback((delta: number, centerTime?: number) => {
    const oldScale = timelineState.scale;
    const newScale = Math.max(10, Math.min(200, oldScale + delta));
    
    if (centerTime !== undefined) {
      // Zoom towards a specific time point
      const oldPixelPos = centerTime * oldScale;
      const newPixelPos = centerTime * newScale;
      const pixelDiff = newPixelPos - oldPixelPos;
      setScrollPosition(timelineState.scrollPosition + pixelDiff);
    }
    
    setScale(newScale);
  }, [timelineState.scale, timelineState.scrollPosition, setScale, setScrollPosition]);

  return {
    timelineRef,
    timelineState: { ...timelineState, duration },
    isDragging,
    setIsDragging,
    updateViewportWidth,
    setScale,
    setScrollPosition,
    timeToPixels,
    pixelsToTime,
    getVisibleTimeRange,
    scrollToTime,
    zoom,
  };
};