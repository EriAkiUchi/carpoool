import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.log(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);    
} else {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON not found in environment variables');
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://carpoool-a2be9.firebaseapp.com'
});

export default admin;