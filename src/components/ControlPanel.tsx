import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Upload,
  Plus,
  Download,
} from "lucide-react";
import type { VideoState, TextOverlay } from "@/types/video";
import { formatTime } from "@/utils/timeFormat";

interface ControlPanelProps {
  videoState: VideoState;
  selectedOverlay: TextOverlay | null;
  onLoadVideo: (file: File) => void;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onAddOverlay: () => void;
  onUpdateOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  onDeleteOverlay: (id: string) => void;
  onExport: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  videoState,
  selectedOverlay,
  onLoadVideo,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onAddOverlay,
  onUpdateOverlay,
  onDeleteOverlay,
  onExport,
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      onLoadVideo(file);
    }
  };

  return (
    <div className="bg-editor-panel border-r lg:border-r border-b lg:border-b-0 border-editor-border w-full lg:w-80 flex flex-col lg:h-full">
      {/* Video Upload */}
      <div className="p-2 sm:p-4 border-b border-editor-border">
        <Label
          htmlFor="video-upload"
          className="text-text-primary font-medium text-sm sm:text-base"
        >
          Load Video
        </Label>
        <div className="mt-2">
          <label htmlFor="video-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-editor-border hover:border-accent-blue rounded-lg p-2 sm:p-4 text-center transition-colors">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-text-muted" />
              <div className="text-xs sm:text-sm text-text-secondary">
                Click to upload video
              </div>
              <div className="text-xs text-text-muted mt-1 hidden sm:block">
                MP4, WebM, MOV
              </div>
            </div>
          </label>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Playback Controls */}
      <div className="p-2 sm:p-4 border-b border-editor-border">
        <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={videoState.isPlaying ? onPause : onPlay}
            disabled={!videoState.url}
            className="px-2 sm:px-3"
          >
            {videoState.isPlaying ? (
              <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <Play className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSeek(0)}
            disabled={!videoState.url}
            className="px-2 sm:px-3"
          >
            <Square className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>

          <div className="flex-1 text-center">
            <div className="text-xs sm:text-sm font-mono text-text-primary">
              {formatTime(videoState.currentTime)} /{" "}
              {formatTime(videoState.duration)}
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMute}
            disabled={!videoState.url}
            className="px-2 sm:px-3"
          >
            {videoState.muted ? (
              <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </Button>
          <Slider
            value={[videoState.muted ? 0 : videoState.volume * 100]}
            onValueChange={([value]) => onVolumeChange(value / 100)}
            disabled={!videoState.url}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
      </div>

      {/* Text Overlays */}
      <div className="p-2 sm:p-4 border-b border-editor-border">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <Label className="text-text-primary font-medium text-sm sm:text-base">
            Text Overlays
          </Label>
          <Button
            variant="secondary"
            size="sm"
            onClick={onAddOverlay}
            disabled={!videoState.url}
            className="px-2 sm:px-3"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>

        {selectedOverlay && (
          <div className="space-y-3">
            <div>
              <Label
                htmlFor="overlay-text"
                className="text-text-secondary text-sm"
              >
                Text Content
              </Label>
              <Input
                id="overlay-text"
                value={selectedOverlay.text}
                onChange={(e) =>
                  onUpdateOverlay(selectedOverlay.id, { text: e.target.value })
                }
                className="mt-1"
                placeholder="Enter overlay text..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label
                  htmlFor="start-time"
                  className="text-text-secondary text-sm"
                >
                  Start Time (s)
                </Label>
                <Input
                  id="start-time"
                  type="number"
                  value={selectedOverlay.startTime.toFixed(1)}
                  onChange={(e) =>
                    onUpdateOverlay(selectedOverlay.id, {
                      startTime: Math.max(0, parseFloat(e.target.value) || 0),
                    })
                  }
                  className="mt-1"
                  step="0.1"
                />
              </div>
              <div>
                <Label
                  htmlFor="duration"
                  className="text-text-secondary text-sm"
                >
                  Duration (s)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={selectedOverlay.duration.toFixed(1)}
                  onChange={(e) =>
                    onUpdateOverlay(selectedOverlay.id, {
                      duration: Math.max(
                        0.1,
                        parseFloat(e.target.value) || 0.1
                      ),
                    })
                  }
                  className="mt-1"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="font-size"
                className="text-text-secondary text-sm"
              >
                Font Size: {selectedOverlay.style.fontSize}px
              </Label>
              <Slider
                value={[selectedOverlay.style.fontSize]}
                onValueChange={([value]) =>
                  onUpdateOverlay(selectedOverlay.id, {
                    style: { ...selectedOverlay.style, fontSize: value },
                  })
                }
                min={12}
                max={72}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label
                htmlFor="overlay-color"
                className="text-text-secondary text-sm"
              >
                Text Color
              </Label>
              <Input
                id="overlay-color"
                type="color"
                value={selectedOverlay.style.color}
                onChange={(e) =>
                  onUpdateOverlay(selectedOverlay.id, {
                    style: { ...selectedOverlay.style, color: e.target.value },
                  })
                }
                className="mt-1 h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="pos-x" className="text-text-secondary text-sm">
                  X Position (%)
                </Label>
                <Input
                  id="pos-x"
                  type="number"
                  value={selectedOverlay.position.x}
                  onChange={(e) =>
                    onUpdateOverlay(selectedOverlay.id, {
                      position: {
                        ...selectedOverlay.position,
                        x: Math.max(
                          0,
                          Math.min(100, parseFloat(e.target.value) || 0)
                        ),
                      },
                    })
                  }
                  className="mt-1"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="pos-y" className="text-text-secondary text-sm">
                  Y Position (%)
                </Label>
                <Input
                  id="pos-y"
                  type="number"
                  value={selectedOverlay.position.y}
                  onChange={(e) =>
                    onUpdateOverlay(selectedOverlay.id, {
                      position: {
                        ...selectedOverlay.position,
                        y: Math.max(
                          0,
                          Math.min(100, parseFloat(e.target.value) || 0)
                        ),
                      },
                    })
                  }
                  className="mt-1"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteOverlay(selectedOverlay.id)}
              className="w-full"
            >
              Delete Overlay
            </Button>
          </div>
        )}

        {!selectedOverlay && (
          <div className="text-center text-text-muted text-sm py-4">
            Select an overlay to edit its properties
          </div>
        )}
      </div>

      {/* Export */}
      <div className="p-2 sm:p-4">
        <Button
          onClick={onExport}
          disabled={!videoState.url}
          className="w-full"
        >
          <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          <span className="text-xs sm:text-sm">Export Preview</span>
        </Button>
      </div>
    </div>
  );
};
