import express from 'express';
import admin from './src/config/firebaseConfig.js';
import routes from './src/routes/routes.js';
import { swaggerUi, specs } from './src/config/swaggerConfig.js';
import cors from 'cors';
import dotenv from 'dotenv';

const app  = express(); // Create an Express app
const firestore = admin.firestore(); // Get the Firestore instance from the admin SDK

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json()); // Middleware to parse JSON

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs)); // Middleware to serve the Swagger UI

app.listen(process.env.SERVER_PORT, () => {
    console.log('Server está escutando...');
});

// Pass the app and firestore to the routes
routes(app, firestore); 