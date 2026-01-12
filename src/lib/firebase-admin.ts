import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Tự động xử lý: xóa khoảng trắng, xóa dấu ngoặc kép thừa và convert \n
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase Admin initialization error', error);
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
