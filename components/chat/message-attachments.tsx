"use client";

import { Attachment } from "@/lib/types";
import { FileIcon, ImageIcon, PlayIcon } from "lucide-react";

interface MessageAttachmentsProps {
  attachments: Attachment[];
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  const renderAttachment = (attachment: Attachment) => {
    if (attachment.file_type.startsWith("image/")) {
      return (
        <div className="relative group">
          <img
            src={attachment.url}
            alt={attachment.file_name}
            className="max-w-xs rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline"
            >
              Open original
            </a>
          </div>
        </div>
      );
    }

    const icon = attachment.file_type.startsWith("video/") ? (
      <PlayIcon className="h-4 w-4" />
    ) : (
      <FileIcon className="h-4 w-4" />
    );

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 p-2 rounded-lg bg-muted hover:bg-muted/80"
      >
        {icon}
        <span className="text-sm">{attachment.file_name}</span>
        <span className="text-xs text-muted-foreground">
          ({Math.round(attachment.file_size / 1024)}KB)
        </span>
      </a>
    );
  };

  return (
    <div className="space-y-2 mt-2">
      {attachments.map((attachment) => (
        <div key={attachment.id}>{renderAttachment(attachment)}</div>
      ))}
    </div>
  );
}