import { supabase } from './supabase/config';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (
  file: File,
  bucket: string,
  folder: string = ''
): Promise<{ path: string; error: Error | null }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { path: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { path: '', error: error as Error };
  }
};

export const deleteFile = async (
  path: string,
  bucket: string
): Promise<{ error: Error | null }> => {
  try {
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (deleteError) throw deleteError;

    return { error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { error: error as Error };
  }
};

export const getFileUrl = (path: string, bucket: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return publicUrl;
};