'use client';

import {
  ref,
  uploadBytes,
  getDownloadURL,
  FirebaseStorage,
} from 'firebase/storage';

/**
 * Uploads an image file to Firebase Storage.
 *
 * @param storage The FirebaseStorage instance.
 * @param file The image file to upload.
 * @param path The path in Firebase Storage where the file will be stored (e.g., 'brands/brand-id').
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export async function uploadImage(
  storage: FirebaseStorage,
  file: File,
  path: string
): Promise<string> {
  // Create a storage reference with a unique name
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExtension}`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  try {
    // Upload the file to the specified path
    const snapshot = await uploadBytes(storageRef, file);

    // Get the public URL of the uploaded file
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    // Re-throw the error to be caught by the calling function
    throw new Error('Failed to upload image.');
  }
}
