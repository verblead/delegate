"use client";

import { Button } from "@/components/ui/button";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  MonitorOff,
  MonitorUp,
  PhoneOff,
} from "lucide-react";

interface MeetingControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
}

export function MeetingControls({
  isMuted,
  isVideoEnabled,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
}: MeetingControlsProps) {
  return (
    <div className="p-4 flex items-center justify-center space-x-4">
      <Button
        variant={isMuted ? "destructive" : "secondary"}
        size="icon"
        onClick={onToggleMute}
      >
        {isMuted ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
      <Button
        variant={isVideoEnabled ? "secondary" : "destructive"}
        size="icon"
        onClick={onToggleVideo}
      >
        {isVideoEnabled ? (
          <Camera className="h-5 w-5" />
        ) : (
          <CameraOff className="h-5 w-5" />
        )}
      </Button>
      <Button
        variant={isScreenSharing ? "secondary" : "outline"}
        size="icon"
        onClick={onToggleScreenShare}
      >
        {isScreenSharing ? (
          <MonitorUp className="h-5 w-5" />
        ) : (
          <MonitorOff className="h-5 w-5" />
        )}
      </Button>
      <Button variant="destructive" size="icon">
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  );
}