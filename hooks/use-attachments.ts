"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/config';
import { Attachment } from '@/lib/supabase/schema';
import { v4 as uuidv4 } from 'uuid';

export function useAttachments() {
  const [uploading, setUploading] = useState(false);

  const uploadAttachment = async (
    channelId: number,
    messageId: number,
    file: File
  ): Promise<Attachment | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${channelId}/${messageId}/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: attachment, error: attachmentError } = await supabase
        .from('attachments')
        .insert([
          {
            message_id: messageId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            url: filePath
          }
        ])
        .select()
        .single();

      if (attachmentError) throw attachmentError;
      return attachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachmentId: number) => {
    try {
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      return false;
    }
  };

  return {
    uploadAttachment,
    deleteAttachment,
    uploading
  };
}