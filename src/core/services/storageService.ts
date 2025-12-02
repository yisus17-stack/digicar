'use client';

import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'car_images';

export const uploadImage = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`Supabase upload error: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    throw new Error('Could not get public URL for the uploaded file.');
  }

  return data.publicUrl;
};
