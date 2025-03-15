import Anuncio from '../models/Anuncio.js';

class AnuncioController {
    /**
     * @swagger
     * /anuncios:
     *   get:
     *     summary: Retorna todos os anúncios
     *     responses:
     *       200:
     *         description: Lista de anúncios
     *       500:
     *         description: Erro em pegar os anúncios
     */
    static async getAnuncios(req, res, firestore) {
        try {
            const snapshot = await firestore.collection('anuncios').get();

            // Convertendo os documentos do Firestore para objetos Anuncio
            const anuncios = snapshot.docs.map(doc => Anuncio.fromFirestore(doc));
            res.status(200).json(anuncios);

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar os anuncios: ' + erro });
        }
    }

    /**
     * @swagger
     * /anuncios/{id}:
     *   get:
     *     summary: Retorna um anúncio pelo ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Anúncio encontrado
     *       404:
     *         description: Anúncio não encontrado
     *       500:
     *         description: Erro em pegar o anúncio
     */
    static async getAnuncioId(req, res, firestore) {
        try {
            const { id } = req.params;
            const doc = await firestore.collection('anuncios').doc(id).get();
            
            if(!doc.exists){
                return res.status(404).json({ message: 'Anuncio não encontrado' });
            }

            // Convertendo o documento do Firestore para um objeto Anuncio
            const anuncio = Anuncio.fromFirestore(doc); 

            res.status(200).json(anuncio);

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar o anuncio: ' + erro });
        }
    }

    /**
     * @swagger
     * /anuncios:
     *   post:
     *     summary: Cria um novo anúncio
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               nomeEmpresa:
     *                 type: string
     *               enderecoDestino:
     *                 type: object
     *                 properties:
     *                   logradouro:
     *                     type: string
     *                   numero:
     *                     type: number
     *                   bairro:
     *                     type: string
     *                   cidade:
     *                     type: string
     *               vagasRestantes:
     *                 type: number
     *               horarioDeSaida:
     *                 type: string
     *     responses:
     *       201:
     *         description: Anúncio criado com sucesso
     *       500:
     *         description: Erro em criar o anúncio
     */
    static async createAnuncio(req, res, firestore) {
        try {
            const { nomeEmpresa, enderecoDestino, vagasRestantes, horarioDeSaida } = req.body;
            const anuncio = new Anuncio(nomeEmpresa, enderecoDestino, vagasRestantes, horarioDeSaida);

            // Salvando o anuncio no Firestore
            const docRef = await firestore.collection('anuncios').add(anuncio.toFirestore());
            res.status(201).json({ message: 'anuncio criado com sucesso!', id: docRef.id, ...anuncio });
            
        } catch (erro) {
            res.status(500).json({ message: 'erro em criar o anuncio: ' + erro });
        }
    }

    /**
     * @swagger
     * /anuncios/{id}:
     *   put:
     *     summary: Atualiza um anúncio pelo ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               nomeEmpresa:
     *                 type: string
     *               enderecoDestino:
     *                 type: object
     *                 properties:
     *                   logradouro:
     *                     type: string
     *                   numero:
     *                     type: number
     *                   bairro:
     *                     type: string
     *                   cidade:
     *                     type: string
     *               vagasRestantes:
     *                 type: number
     *               horarioDeSaida:
     *                 type: string
     *     responses:
     *       200:
     *         description: Anúncio atualizado com sucesso
     *       404:
     *         description: Anúncio não encontrado
     *       500:
     *         description: Erro em atualizar o anúncio
     */
    static async updateAnuncio(req, res, firestore) {
        try {
            const { id } = req.params;
            const docRef = firestore.collection('anuncios').doc(id); // Referência para o documento do anuncio
            const docSnap = await docRef.get(); // Busca o documento no Firestore
    
            if (!docSnap.exists) {
                return res.status(404).json({ message: 'Anuncio não encontrado' });
            }
    
            const { nomeEmpresa, enderecoDestino, vagasRestantes, horarioDeSaida } = req.body;
            const existingData = docSnap.data();
    
            // Crie um objeto apenas com os campos enviados
            const updatedFields = {};
    
            if (nomeEmpresa) updatedFields.nomeEmpresa = nomeEmpresa;
            if (vagasRestantes) updatedFields.vagasRestantes = vagasRestantes;
            if (horarioDeSaida) updatedFields.horarioDeSaida = horarioDeSaida;
                
            if (enderecoDestino) {
                updatedFields.enderecoDestino = {
                    ...(existingData.enderecoDestino || {}),
                    ...enderecoDestino
                };
            }
    
            // Atualize somente o que foi definido
            await docRef.update(updatedFields);
            res.status(200).json({ message: 'anuncio atualizado com sucesso!', id, ...updatedFields });

        } catch (erro) {
            res.status(500).json({ message: 'erro em atualizar o anuncio: ' + erro });
        }
    }

    /**
     * @swagger
     * /anuncios/{id}:
     *   delete:
     *     summary: Deleta um anúncio pelo ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Anúncio deletado com sucesso
     *       404:
     *         description: Anúncio não encontrado
     *       500:
     *         description: Erro em deletar o anúncio
     */
    static async deleteAnuncio(req, res, firestore) {
        try {
            const { id } = req.params;
            const docRef = firestore.collection('anuncios').doc(id);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return res.status(404).json({ message: 'Anuncio não encontrado' });
            }

            // Deletando o anuncio
            await docRef.delete();
            res.status(200).json({ message: 'anuncio deletado com sucesso!', id });
            
        } catch (erro) {
            res.status(500).json({ message: 'erro em deletar o anuncio: ' + erro });
        }
    }
}

export default AnuncioController;