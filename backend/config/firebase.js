// backend/config/firebase.js
const adminPkg = require('firebase-admin');

let admin = null;
let db = null;

try {
    if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
    ) {
        admin = adminPkg.initializeApp({
            credential: adminPkg.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });

        db = admin.firestore();
        console.log('Firebase Admin initialized.');
    } else {
        console.warn(
            'Firebase env vars not set – using fallback local storage for workspace/chatHistory.'
        );
    }
} catch (err) {
    console.error(
        'Error initializing Firebase Admin. Falling back to local storage. Error:',
        err && err.message
    );
}

module.exports = { admin, db };