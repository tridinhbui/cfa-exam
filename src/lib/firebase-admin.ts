import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Thay thế các ký tự \n trong private key để tránh lỗi formatting
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase Admin initialization error', error);
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
