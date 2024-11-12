"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  selectedFile?: File | null;
  className?: string;
}

export function FileUpload({ onFileSelect, onRemove, selectedFile, className }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      toast({
        title: "Error",
        description: "File size must be less than 50MB",
        variant: "destructive"
      });
      return;
    }

    onFileSelect(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const isImage = selectedFile?.type.startsWith("image/");

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileSelect}
        accept={isImage ? "image/*" : "*"}
      />

      {selectedFile ? (
        <div className="relative group">
          {preview ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
              <NextImage
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
              <FileIcon className="h-4 w-4" />
              <span className="text-sm truncate max-w-[200px]">
                {selectedFile.name}
              </span>
            </div>
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const input = document.getElementById("file-upload") as HTMLInputElement;
              input.accept = "image/*";
              input.click();
            }}
            className="h-9 w-9"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const input = document.getElementById("file-upload") as HTMLInputElement;
              input.accept = "*";
              input.click();
            }}
            className="h-9 w-9"
          >
            <FileIcon className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}