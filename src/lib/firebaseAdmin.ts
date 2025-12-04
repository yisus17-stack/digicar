
import admin from 'firebase-admin';

// Reemplaza esto con el contenido de tu archivo de clave de cuenta de servicio
// Idealmente, usa variables de entorno para esto.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Para entornos locales o donde Application Default Credentials esté configurado
    console.warn("Inicializando Firebase Admin sin Service Account. Asegúrate de que ADC esté configurado.");
    admin.initializeApp();
  }
}

export { admin };
