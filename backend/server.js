import express from 'express';
import admin from './src/config/firebaseConfig.js';
import routes from './src/routes/routes.js';

const app  = express(); // Create an Express app
const firestore = admin.firestore(); // Get the Firestore instance from the admin SDK

app.use(express.json()); // Middleware to parse JSON

app.listen(process.env.SERVER_PORT, () => {
    console.log('Server está escutando...');
});

// Pass the app and firestore to the routes
routes(app, firestore); 