import express from 'express';
import PassageiroController from '../controller/passageiroController.js';
import MotoristaController from '../controller/motoristaController.js';
import CarroController from '../controller/carroController.js';
import AnuncioController from '../controller/anuncioController.js';

const routes = (app, firestore) => {
    app.use(express.json());

    app.get('/', (req, res) => {
        res.status(200).json({ message: 'A API está rodando...' });
    });

    app.get('/passageiros', async (req, res) => PassageiroController.getPassageiros(req, res, req.app.locals.firestore));
    app.get('/motoristas', async (req, res) => MotoristaController.getMotoristas(req, res, req.app.locals.firestore));
    app.get('/carros', async (req, res) => CarroController.getCarros(req, res, req.app.locals.firestore));
    app.get(`/anuncios`, async (req, res) => AnuncioController.getAnuncios(req, res, req.app.locals.firestore));

    app.get('/passageiros/:id', async (req, res) => PassageiroController.getPassageiroId(req, res, req.app.locals.firestore));
    app.get('/motoristas/:id', async (req, res) => MotoristaController.getMotoristaId(req, res, req.app.locals.firestore));
    app.get('/carros/:id', async (req, res) => CarroController.getCarroId(req, res, req.app.locals.firestore));
    app.get(`/anuncios/:id`, async (req, res) => AnuncioController.getAnuncioId(req, res, req.app.locals.firestore));

    app.post('/passageiros', async (req, res) => PassageiroController.createPassageiro(req, res, req.app.locals.firestore));
    app.post('/motoristas', async (req, res) => MotoristaController.createMotorista(req, res, req.app.locals.firestore));
    app.post('/carros', async (req, res) => CarroController.createCarro(req, res, req.app.locals.firestore));
    app.post(`/anuncios`, async (req, res) => AnuncioController.createAnuncio(req, res, req.app.locals.firestore));

    app.put('/passageiros/:id', async (req, res) => PassageiroController.updatePassageiro(req, res, req.app.locals.firestore));
    app.put('/motoristas/:id', async (req, res) => MotoristaController.updateMotorista(req, res, req.app.locals.firestore));
    app.put('/carros/:id', async (req, res) => CarroController.updateCarro(req, res, req.app.locals.firestore));
    app.put(`/anuncios/:id`, async (req, res) => AnuncioController.updateAnuncio(req, res, req.app.locals.firestore));

    app.delete('/passageiros/:id', async (req, res) => PassageiroController.deletePassageiro(req, res, req.app.locals.firestore));
    app.delete('/motoristas/:id', async (req, res) => MotoristaController.deleteMotorista(req, res, req.app.locals.firestore));
    app.delete('/carros/:id', async (req, res) => CarroController.deleteCarro(req, res, req.app.locals.firestore));
    app.delete(`/anuncios/:id`, async (req, res) => AnuncioController.deleteAnuncio(req, res, req.app.locals.firestore));

}

export default (app, firestore) => {
    app.locals.firestore = firestore; // Passando o firestore para o app
    routes(app, firestore); 
}