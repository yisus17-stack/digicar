'use client';

import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'digicar';

export const uploadImage = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    
  // Simulating progress for UX as Supabase JS client v2 doesn't support progress handlers on upload directly.
  // A real implementation might use tus-js-client or a backend endpoint.
  if (onProgress) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        onProgress(progress);
      } else {
        clearInterval(interval);
      }
    }, 100);
  }


  if (uploadError) {
    throw new Error(`Supabase upload error: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    throw new Error('Could not get public URL for the uploaded file.');
  }
  
  return data.publicUrl;
};
