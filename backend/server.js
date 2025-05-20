import express from 'express';
import admin from './src/config/firebaseConfig.js';
import routes from './src/routes/routes.js';
import { swaggerUi, specs } from './src/config/swaggerConfig.js';
import cors from 'cors';
import dotenv from 'dotenv';

const app  = express(); // Create an Express app
const firestore = admin.firestore(); // Get the Firestore instance from the admin SDK

const allowedOrigins = [
    'http://localhost:5173',
    'https://carpoool-rouge.vercel.app',
    'https://carpoool-git-main-erics-projects-95bf1a2f.vercel.app',
    'https://carpoool-4ygy54x49-erics-projects-95bf1a2f.vercel.app'
]

const corsOptions = {
    origin: function (origin, callback) {
        // remove barra no final da URL
        const normalizedOrigin = origin?.endsWith('/') ? origin.slice(0, -1) : origin;
        console.log(normalizedOrigin);

        //permite requsições sem 'origin' ou se a origem estiver na lista
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(`Origin rejected by CORS: ${origin}`);
            callback(null, false); // Reject without throwing error
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

app.use(cors(corsOptions));

app.use(express.json()); // Middleware to parse JSON

// Configurações customizadas para o Swagger UI
const swaggerOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none } .swagger-ui .info { margin: 30px 0 } .swagger-ui .scheme-container { margin: 0 0 20px }',
    customSiteTitle: "Carpoool API Documentation",
    docExpansion: 'none', // none, list, full
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions)); // Middleware to serve the Swagger UI

app.listen(process.env.SERVER_PORT, () => {
    console.log('Server está escutando...');
});

// Pass the app and firestore to the routes
routes(app, firestore); 