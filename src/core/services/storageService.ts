'use client';

import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'digicar';

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
  
  // Construct the permanent public URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const permanentUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;

  return permanentUrl;
};
