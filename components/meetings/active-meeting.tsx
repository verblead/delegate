"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MeetingParticipants } from "./meeting-participants";
import { MeetingChat } from "./meeting-chat";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Share2,
  Users,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ActiveMeetingProps {
  meetingId: string;
}

export function ActiveMeeting({ meetingId }: ActiveMeetingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (error) {
        toast({
          title: "Media Error",
          description: "Could not access camera or microphone",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
          setStream(screenStream);
        }
      } else {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      toast({
        title: "Screen Sharing Error",
        description: "Could not start screen sharing",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Mobile Layout */}
      <div className="flex flex-col h-full md:hidden">
        {/* Video Area */}
        <div className="relative flex-1">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />
          
          {/* Video Controls */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-zinc-900/90 hover:bg-zinc-800/90"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-zinc-900/90 hover:bg-zinc-800/90"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-zinc-900/90 hover:bg-zinc-800/90"
              onClick={toggleScreenShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Chat and Participants Area */}
        <div className="h-[35vh] bg-zinc-900">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="justify-start px-2 pt-2 h-12 bg-transparent border-b border-zinc-800">
              <TabsTrigger value="chat" className="data-[state=active]:bg-zinc-800">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="participants" className="data-[state=active]:bg-zinc-800">
                <Users className="h-4 w-4 mr-2" />
                Participants
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 p-0 m-0">
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1">
                  <MeetingChat meetingId={meetingId} />
                </ScrollArea>
                <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Mic className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Camera className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Share2 className="h-5 w-5" />
                    </Button>
                    <Input 
                      placeholder="Type a message..." 
                      className="flex-1 bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="participants" className="flex-1 p-4 m-0">
              <MeetingParticipants meetingId={meetingId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col h-full">
        <div className="flex-1 grid grid-cols-[1fr_300px] h-full">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-900/90 hover:bg-zinc-800/90"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-900/90 hover:bg-zinc-800/90"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-900/90 hover:bg-zinc-800/90"
                onClick={toggleScreenShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="bg-zinc-900 border-l border-zinc-800">
            <Tabs defaultValue="chat" className="h-full flex flex-col">
              <TabsList className="justify-start p-2 bg-transparent border-b border-zinc-800">
                <TabsTrigger value="chat" className="data-[state=active]:bg-zinc-800">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="participants" className="data-[state=active]:bg-zinc-800">
                  <Users className="h-4 w-4 mr-2" />
                  Participants
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="flex-1 p-0 m-0">
                <MeetingChat meetingId={meetingId} />
              </TabsContent>
              <TabsContent value="participants" className="flex-1 p-4 m-0">
                <MeetingParticipants meetingId={meetingId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}