import { useState, useRef, useCallback, useEffect } from 'react';
import { VideoState } from '@/types/video';

export const useVideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoState, setVideoState] = useState<VideoState>({
    url: null,
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    volume: 1,
    muted: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const loadVideo = useCallback((file: File | string) => {
    setIsLoading(true);
    const url = typeof file === 'string' ? file : URL.createObjectURL(file);
    
    setVideoState(prev => ({
      ...prev,
      url,
      currentTime: 0,
      isPlaying: false,
    }));
  }, []);

  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setVideoState(prev => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setVideoState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (videoState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [videoState.isPlaying, play, pause]);

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, videoState.duration));
      setVideoState(prev => ({ ...prev, currentTime: videoRef.current!.currentTime }));
    }
  }, [videoState.duration]);

  const setVolume = useCallback((volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, volume));
      setVideoState(prev => ({ ...prev, volume: videoRef.current!.volume }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setVideoState(prev => ({ ...prev, muted: videoRef.current!.muted }));
    }
  }, []);

  // Video event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setVideoState(prev => ({
        ...prev,
        duration: videoRef.current!.duration,
        volume: videoRef.current!.volume,
        muted: videoRef.current!.muted,
      }));
      setIsLoading(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setVideoState(prev => ({
        ...prev,
        currentTime: videoRef.current!.currentTime,
      }));
    }
  }, []);

  const handlePlay = useCallback(() => {
    setVideoState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const handlePause = useCallback(() => {
    setVideoState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleEnded = useCallback(() => {
    setVideoState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekTo(videoState.currentTime - 5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(videoState.currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(videoState.volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(videoState.volume - 0.1);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, seekTo, setVolume, toggleMute, videoState.currentTime, videoState.volume]);

  return {
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
  };
};