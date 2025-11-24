'use client';

import {
  ref,
  uploadBytes,
  getDownloadURL,
  FirebaseStorage,
} from 'firebase/storage';

/**
 * Sube un archivo de imagen a Firebase Storage.
 *
 * @param storage La instancia de FirebaseStorage.
 * @param file El archivo de imagen a subir.
 * @param path La ruta en Firebase Storage donde se almacenará el archivo (ej: 'marcas/id-marca').
 * @returns Una promesa que se resuelve con la URL de descarga pública de la imagen subida.
 */
export async function subirImagen(
  storage: FirebaseStorage,
  file: File,
  path: string
): Promise<string> {
  // Crea una referencia de almacenamiento con un nombre único
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExtension}`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  try {
    // Sube el archivo a la ruta especificada
    const snapshot = await uploadBytes(storageRef, file);

    // Obtiene la URL pública del archivo subido
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    // Vuelve a lanzar el error para ser capturado por la función que llama
    throw new Error('Falló la subida de la imagen.');
  }
}
