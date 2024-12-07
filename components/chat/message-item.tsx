"use client";

import { useState } from "react";
import { Message } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { MessageEdit } from "./message-edit";
import { MessageAttachments } from "./message-attachments";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageItemProps {
  message: Message;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageItem({ message, onEdit, onDelete }: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const isOwner = user?.id === message.sender_id;

  const handleEdit = (content: string) => {
    if (onEdit) {
      onEdit(message.id, content);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };

  // Extract username from email or use first part of ID as fallback
  const displayName = message.sender_email 
    ? message.sender_email.split('@')[0] 
    : message.sender_id.split('-')[0];

  return (
    <div className="group flex items-start gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={`https://avatar.vercel.sh/${message.sender_id}`} />
        <AvatarFallback>
          {displayName[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
        {isEditing ? (
          <MessageEdit
            content={message.content}
            onSave={handleEdit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div>
            <p className="text-sm">{message.content}</p>
            {message.attachments && message.attachments.length > 0 && (
              <MessageAttachments attachments={message.attachments} />
            )}
          </div>
        )}
      </div>
      {isOwner && !isEditing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Message
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}