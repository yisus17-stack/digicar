
import admin from 'firebase-admin';

// Check if the service account key is available in environment variables
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add it to your .env file.');
}

// Parse the service account key from the environment variable
let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountKey);
} catch (error) {
  throw new Error('Failed to parse the FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string.');
}

// Initialize Firebase Admin SDK only if it hasn't been initialized yet
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
    // Throw a more descriptive error to make debugging easier
    throw new Error('Firebase admin initialization failed. Please check your service account credentials.');
  }
}

export { admin };
