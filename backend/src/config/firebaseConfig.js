import dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://carpoool-a2be9.firebaseapp.com'
});

export default admin;