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

  // Simulate progress for UX
  if (onProgress) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        onProgress(progress);
      } else {
        clearInterval(interval);
      }
    }, 150); // Adjust time for a more realistic feel
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (onProgress) {
    onProgress(100); // Ensure it completes to 100
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


export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) {
    console.warn('No image URL provided for deletion.');
    return;
  }

  try {
    const url = new URL(imageUrl);
    // Pathname looks like: /storage/v1/object/public/digicar/0.123-456.png
    // We need to extract the part after the bucket name.
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.indexOf(BUCKET_NAME);

    if (bucketIndex === -1 || bucketIndex + 1 >= pathParts.length) {
      throw new Error('Could not determine file path from URL.');
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (deleteError) {
      // It's often okay if the file doesn't exist, so we can choose to ignore 'Not Found' errors.
      if (deleteError.message.includes('Not Found')) {
        console.warn(`File not found in Supabase storage, skipping deletion: ${filePath}`);
      } else {
        throw new Error(`Supabase delete error: ${deleteError.message}`);
      }
    } else {
      console.log(`Successfully deleted image: ${filePath}`);
    }

  } catch (error) {
    console.error('Error deleting image:', error);
    // We don't re-throw the error to prevent the entire Firestore delete operation from failing
    // if only the image deletion fails. This makes the system more resilient.
  }
};
