import express from 'express';

const app  = express(); // Create an Express app
app.use(express.json()); // Middleware to parse JSON


app.listen(process.env.SERVER_PORT, () => {
    console.log('Server está escutando...');
});