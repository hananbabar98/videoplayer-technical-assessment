import { useState, useCallback } from 'react';
import { TextOverlay } from '@/types/video';

export const useTextOverlays = () => {
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);

  const addOverlay = useCallback((startTime: number) => {
    const newOverlay: TextOverlay = {
      id: `overlay-${Date.now()}`,
      text: 'New Text Overlay',
      startTime,
      duration: 3, // Default 3 seconds
      position: { x: 50, y: 50 }, // Center position as percentage
      style: {
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '600',
      },
    };

    setOverlays(prev => [...prev, newOverlay]);
    return newOverlay.id;
  }, []);

  const updateOverlay = useCallback((id: string, updates: Partial<TextOverlay>) => {
    setOverlays(prev => prev.map(overlay => 
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  }, []);

  const deleteOverlay = useCallback((id: string) => {
    setOverlays(prev => prev.filter(overlay => overlay.id !== id));
  }, []);

  const getActiveOverlays = useCallback((currentTime: number) => {
    return overlays.filter(overlay => 
      currentTime >= overlay.startTime && 
      currentTime < overlay.startTime + overlay.duration
    );
  }, [overlays]);

  const moveOverlay = useCallback((id: string, newStartTime: number) => {
    setOverlays(prev => prev.map(overlay => 
      overlay.id === id ? { ...overlay, startTime: Math.max(0, newStartTime) } : overlay
    ));
  }, []);

  const resizeOverlay = useCallback((id: string, newDuration: number) => {
    setOverlays(prev => prev.map(overlay => 
      overlay.id === id ? { ...overlay, duration: Math.max(0.1, newDuration) } : overlay
    ));
  }, []);

  return {
    overlays,
    addOverlay,
    updateOverlay,
    deleteOverlay,
    getActiveOverlays,
    moveOverlay,
    resizeOverlay,
  };
};