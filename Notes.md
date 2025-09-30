# Notes

## Trade-offs due to time constraints

- **Export:** Implemented frame export as PNG instead of full video render. Full MP4 export would require WebCodecs/MediaRecorder.
- **Fonts & Styling:** Only core font size and color editing included in Control Panel. Font family/weight could be extended.
- **Performance:** requestAnimationFrame loop is minimal — enough for overlay sync, but could be optimized for very long videos.

## If I had more time

- Add **multi-track support** (audio + multiple overlay layers).
- Implement **undo/redo** for overlays.
- Integrate **WebCodecs** for real MP4 export.
- Add **drag handles** for video scrubber itself (like Premiere’s diamond marker).
- Improve **accessibility** (ARIA labels, keyboard navigation).

## AI vs Human Written Code

- ~60% AI-assisted (generated scaffolding, Tailwind configs, some hooks logic).
- ~40% Human-written (integration, debugging, timeline drag/resize logic, overlay export, polish).
- Everything was manually reviewed and tested.

## Tools Used

- **Cursor AI** + GitHub Copilot → initial scaffolding.
- **Claude & ChatGPT** → refinement & bug fixing.
- **VSCode** → main IDE.
- **React 18 + Vite + Tailwind** → frontend stack.
