export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 30); // Assuming 30fps

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
};

export const parseTime = (timeString: string): number => {
  const parts = timeString.split(':').map(Number);
  
  if (parts.length === 4) {
    // HH:MM:SS:FF format
    const [hours, minutes, seconds, frames] = parts;
    return hours * 3600 + minutes * 60 + seconds + frames / 30;
  } else if (parts.length === 3) {
    // MM:SS:FF format
    const [minutes, seconds, frames] = parts;
    return minutes * 60 + seconds + frames / 30;
  }
  
  return 0;
};

export const getTimeMarkers = (duration: number, scale: number): Array<{ time: number; label: string; major: boolean }> => {
  const markers: Array<{ time: number; label: string; major: boolean }> = [];
  
  // Determine appropriate interval based on scale for better precision
  let interval: number;
  let majorInterval: number;
  
  if (scale > 150) {
    interval = 0.5; // 0.5 second intervals
    majorInterval = 5; // Every 5 seconds is major
  } else if (scale > 100) {
    interval = 1; // 1 second intervals
    majorInterval = 5; // Every 5 seconds is major
  } else if (scale > 60) {
    interval = 2; // 2 second intervals
    majorInterval = 10; // Every 10 seconds is major
  } else if (scale > 30) {
    interval = 5; // 5 second intervals
    majorInterval = 10; // Every 10 seconds is major
  } else if (scale > 15) {
    interval = 10; // 10 second intervals
    majorInterval = 30; // Every 30 seconds is major
  } else {
    interval = 30; // 30 second intervals
    majorInterval = 60; // Every minute is major
  }

  for (let time = 0; time <= duration; time += interval) {
    const isMajor = time % majorInterval === 0 || time === 0;
    markers.push({
      time,
      label: formatTime(time),
      major: isMajor,
    });
  }

  return markers;
};