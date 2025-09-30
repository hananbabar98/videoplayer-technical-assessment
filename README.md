# Video Timeline Editor

This is my submission for the **Video Timeline Editor Technical Assessment**.  
It’s a browser-based video editing tool with timeline scrubbing, text overlays, and preview export.

---

## Features

### 📹 Video Player

- Upload local MP4/WebM/MOV.
- Responsive player with loading states.
- Play, pause, seek, volume, mute.

### Text Overlays

- Add overlays at current time.
- Edit text, color, font size, and position.
- Move & resize overlays directly on the timeline.
- Live rendering on video.

### Timeline

- Draggable **playhead/scrubber** synced with playback.
- Zoom in/out with mouse wheel or buttons.
- Keyboard shortcuts for play/pause, seek, home/end.

### Export

- Export current video frame + overlays as PNG.
- Demonstrates “burning in” overlays for video export.

---

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)
- Canvas API for export
- Custom hooks: `useVideoPlayer`, `useTimeline`, `useTextOverlays`

---

## Project Structure

```
src/
  components/
    VideoPlayer.tsx
    Timeline.tsx
    ControlPanel.tsx
    VideoEditor.tsx
  hooks/
    useVideoPlayer.ts
    useTimeline.ts
    useTextOverlays.ts
  types/
    video.ts
  utils/
    timeFormat.ts
```

---

## Getting Started

```bash
git clone https://github.com/hananbabar98/videoplayer-technical-assessment.git
cd videoplayer-technical-assessment
npm install
npm run dev
```

---

## Demo

- Demo [Loom Video Link](https://www.loom.com/share/6768af258895487aaa6fc1893b53a1a1?sid=f8688bc2-b539-4b54-94eb-e69a01ae1483)
- Technical Explanation [Video Link - part 1](https://www.loom.com/share/0196da9070f54bb194ab9eebc3b0376a?sid=49e82854-4354-41ee-bce3-ba68f5894b07)
- Technical Explanation [Video Link - part 2](https://www.loom.com/share/efb217406a194c28aa66fd2eebe71520?sid=91327c8d-e357-4c58-809b-bdcb1e7519fb)

---

## Author

**Hanan Babar**  
Technical Assessment Submission
