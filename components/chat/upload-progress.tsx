"use client";

import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadProgressProps {
  file: File;
  progress: number;
  onCancel: () => void;
}

export function UploadProgress({
  file,
  progress,
  onCancel,
}: UploadProgressProps) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{file.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(progress)}%</span>
          <span>{(file.size / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    </div>
  );
}