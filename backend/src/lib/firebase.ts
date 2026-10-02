import admin from 'firebase-admin';

let isFirebaseInitialized = false;

export function initializeFirebase() {
  if (isFirebaseInitialized || admin.apps.length > 0) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Unescape newlines if stored as single-line string with \n
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isFirebaseInitialized = true;
      console.log('✔ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
    }
  } else {
    console.warn('⚠ Firebase credentials incomplete in .env. Token verification will run in development mode.');
  }

  return admin;
}

export const firebaseAdmin = initializeFirebase();
export default firebaseAdmin;
