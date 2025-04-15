import Viagem from '../models/Viagem.js';
import MapsController from './MapsController.js';

class ViagemController {
    /**
     * @swagger
     * /viagens:
     *   get:
     *     summary: Retorna todos os viagens
     *     responses:
     *       200:
     *         description: Lista de viagens
     *       500:
     *         description: Erro em pegar os viagens
     */
    static async getViagens(req, res, firestore) {
        try {
            const snapshot = await firestore.collection('viagens').get();

            // Convertendo os documentos do Firestore para objetos Viagem
            const viagens = snapshot.docs.map(doc => Viagem.fromFirestore(doc));
            res.status(200).json(viagens);

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar as viagens: ' + erro });
        }
    }

    /**
     * @swagger
     * /viagens/{id}:
     *   get:
     *     summary: Retorna um viagem pelo ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Viagem encontrada
     *       404:
     *         description: Viagem não encontrada
     *       500:
     *         description: Erro em pegar a viagem
     */
    static async getViagemId(req, res, firestore) {
        try {
            const { id } = req.params;
            const doc = await firestore.collection('viagens').doc(id).get();
            
            if(!doc.exists){
                return res.status(404).json({ message: 'Viagem não encontrada' });
            }

            // Convertendo o documento do Firestore para um objeto Viagem
            const viagem = Viagem.fromFirestore(doc); 

            res.status(200).json(viagem);

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar a viagem: ' + erro });
        }
    }

    /**
     * @swagger
     * /viagens:
     *   post:
     *     summary: Cria uma nova viagem
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
     *         description: Viagem criada com sucesso
     *       500:
     *         description: Erro em criar a viagem
     */
    static async createViagem(req, res, firestore) {
        try {
            const { motoristaId, passageirosIds, nomeEmpresa, enderecoDestino, vagasRestantes, horarioDeSaida, rotaDeViagem } = req.body;
            const viagem = new Viagem(motoristaId, passageirosIds, nomeEmpresa, enderecoDestino, vagasRestantes, horarioDeSaida, rotaDeViagem);

            // Salvando a viagem no Firestore
            const docRef = await firestore.collection('viagens').add(viagem.toFirestore());
            res.status(201).json({ message: 'viagem criada com sucesso!', id: docRef.id, ...viagem });
            
        } catch (erro) {
            res.status(500).json({ message: 'erro em criar a viagem: ' + erro });
        }
    }

    /**
     * @swagger
     * /viagens/{id}:
     *   put:
     *     summary: Atualiza uma viagem pelo ID
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
     *         description: Viagem atualizada com sucesso
     *       404:
     *         description: Viagem não encontrada
     *       500:
     *         description: Erro em atualizar a viagem
     */
    static async updateViagem(req, res, firestore) {
        try {
            const { id } = req.params;
            const docRef = firestore.collection('viagens').doc(id); // Referência para o documento da viagem
            const docSnap = await docRef.get(); // Busca o documento no Firestore
    
            if (!docSnap.exists) {
                return res.status(404).json({ message: 'Viagem não encontrada' });
            }
    
            const { nomeEmpresa, vagasRestantes, horarioDeSaida, passageirosIds, status } = req.body;
            const existingData = docSnap.data();
    
            // Crie um objeto apenas com os campos enviados
            const updatedFields = {};
    
            if (nomeEmpresa) updatedFields.nomeEmpresa = nomeEmpresa;
            if (vagasRestantes) updatedFields.vagasRestantes = vagasRestantes;
            if (horarioDeSaida) updatedFields.horarioDeSaida = horarioDeSaida;
            if (status) updatedFields.status = status;

            if (passageirosIds) { //atualizar ids dos passageiros e a rota
                const listaAtualizadaPassageiros = existingData.passageirosIds.filter(passageiro => passageirosIds.includes(passageiro));
                updatedFields.passageirosIds = [...listaAtualizadaPassageiros];

                if (updatedFields.passageirosIds.length > existingData.vagasRestantes){
                    res.status(400).json({ message: 'Quantidade inválida de passageiros. Há mais passageiros que permitido' });
                }
                const parametros = {
                    motoristaId: existingData.motoristaId,
                    passageirosIds: updatedFields.passageirosIds,
                    status: status || existingData.status,
                    destinoComum: {...existingData.enderecoDestino},
                    id: existingData.rotaDeViagem
                }
                const idNovaRota = await MapsController.updateRotaViagem(parametros, firestore);
                updatedFields.rotaDeViagem = idNovaRota;
            }

            // Atualize somente o que foi definido
            await docRef.update(updatedFields);
            res.status(200).json({ message: 'viagem atualizada com sucesso!', id, ...updatedFields });

        } catch (erro) {
            res.status(500).json({ message: 'erro em atualizar a viagem: ' + erro });
        }
    }

    /**
     * @swagger
     * /viagens/{id}:
     *   delete:
     *     summary: Deleta uma viagem pelo ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Viagem deletada com sucesso
     *       404:
     *         description: Viagem não encontrada
     *       500:
     *         description: Erro em deletar a viagem
     */
    static async deleteViagem(req, res, firestore) {
        try {
            const { id } = req.params;
            const docRef = firestore.collection('viagens').doc(id);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return res.status(404).json({ message: 'Viagem não encontrada' });
            }

            // Deletando a viagem
            await docRef.delete();
            res.status(200).json({ message: 'Viagem deletada com sucesso!', id });
            
        } catch (erro) {
            res.status(500).json({ message: 'erro em deletar a viagem: ' + erro });
        }
    }
}

export default ViagemController;