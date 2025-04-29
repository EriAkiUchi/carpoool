import Viagem from '../models/Viagem.js';
import { calcularRotaViagem, updateRotaViagem, deleteRotaViagem } from './MapsController.js';

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

    static async getViagensEspecificas(req, res, firestore) {
        try {
            
            let { motoristasIds } = req.query;

            // Verifica se o parâmetro viagensIds está presente e não é vazio
            if (!motoristasIds || motoristasIds.trim() === '') {
                return res.status(400).json({ message: 'Parâmetro viagensIds não fornecido ou vazio' });
            }

            if(typeof motoristasIds === 'string') {
                //Divide a string em um array
                motoristasIds = motoristasIds.split(',').map(id => id.trim());
            }
            if (!Array.isArray(motoristasIds)) {
                return res.status(400).json({ message: 'Parâmetro viagensIds deve ser uma string ou um array' });
            }
            
            const viagensRef = firestore.collection('viagens');
            const viagensEncontradas = [];
            // Busca as viagens onde o motoristaId está na lista de motoristasIds
            // O operador 'in' permite buscar documentos onde o campo especificado está em uma lista de valores
            // const viagensSnapshot = await viagensRef.where('motoristaId', 'in', motoristasIds).get();
            for (let i = 0; i < motoristasIds.length; i++) {
                const motoristaId = motoristasIds[i];
                const viagensSnapshot = await viagensRef.where('motoristaId', '==', motoristaId).get();

                // Transformar os documentos do Firestore em objetos Viagem
                const viagens = viagensSnapshot.docs.map(doc => Viagem.fromFirestore(doc));

                if (viagens.length > 0) {
                    viagensEncontradas.push(...viagens);
                }
            }

            if (viagensEncontradas.empty) {
                return res.status(404).json({ message: 'Nenhuma viagem encontrada' });
            }

            // Convertendo os documentos do Firestore para objetos Viagem
            res.status(200).json(viagensEncontradas);

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar as viagens: ' + erro });
        }
    }

    static async getViagemId(req, res, firestore) {
        try {
            const { id } = req.params;
            const docRef = firestore.collection('viagens').doc(id);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return res.status(404).json({ message: 'Viagem não encontrada' });
            }

            const viagem = Viagem.fromFirestore(docSnap);
            res.status(200).json({ id: docSnap.id, ...viagem });

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar a viagem: ' + erro });
        }
    }

    /**
     * @swagger
     * /viagens/{id}:
     *   get:
     *     summary: Retorna uma lista de viagens pelo ID
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
    static async getViagensByUserId(req, res, firestore) {
        try {
            const { userType, id } = req.params;
            const tipoID = userType === 'motorista' ? 'motoristaId' : 'passageirosIds';
            const viagensRef = await firestore.collection('viagens');
            let viagensSnapshot;

            //Buscar viagens onde o id do usuário está incluído
            if(userType === 'motorista') {
                viagensSnapshot = await viagensRef.where(tipoID, '==', id).get();
                if (viagensSnapshot.empty) {
                    return res.status(404).json({ message: 'Nenhuma viagem encontrada para o motorista' });
                }
            }
            else if(userType === 'passageiro') {
                viagensSnapshot = await viagensRef.where(tipoID, 'array-contains', id).get();
                if (viagensSnapshot.empty) {
                    return res.status(404).json({ message: 'Nenhuma viagem encontrada para o passageiro' });
                }                
            }
            // Se houver viagens, mapeia os documentos para o formato desejado
            // Convertendo os documentos do Firestore para objetos Viagem
            let viagens = viagensSnapshot.docs.map(doc => {
                const viagem = Viagem.fromFirestore(doc);
                return { id: doc.id, ...viagem };
            });

            //retornar o ids dos passageiros caso o usuário seja motorista
            if(userType === 'motorista') {
                //Para cada viagem, busca os detalhes dos passageiros
                for (let i = 0; i < viagens.length; i++) {
                    const viagem = viagens[i];

                    if(viagem.passageirosIds && viagem.passageirosIds.length > 0) {
                        const passageirosData = [];
                        for (const passageiroId of viagem.passageirosIds) {
                            const passageiroDoc = await firestore.collection('passageiros').doc(passageiroId).get();
                            if(passageiroDoc.exists) {
                                passageirosData.push(
                                    passageiroId
                                );
                            } 
                            else {
                                return res.status(404).json({ message: 'Passageiro não encontrado na viagem' });
                            }
                        }
                        // Substitui os IDs pelos dados dos passageiros
                        viagem.passageirosIds = [...passageirosData];
                        viagens[i] = viagem;
                    }
                }
            }

            res.status(200).json(viagens);
        } catch (erro) {
            res.status(500).json({ message: 'Erro ao buscar viagens: ' + erro });
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
            const { motoristaId, nomeEmpresa, enderecoDestino, vagasRestantes, horarioDeSaida, nomeMotorista } = req.body;
            const viagem = new Viagem(motoristaId, nomeEmpresa, enderecoDestino, vagasRestantes, horarioDeSaida, nomeMotorista);

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
    
            const { horarioDeSaida, passageirosIds, status } = req.body;
            const existingData = docSnap.data();
    
            if (existingData.status === 'finalizada' || existingData.status === 'cancelada') {
                return res.status(400).json({ message: 'Viagem já finalizada ou cancelada' });
            }

            // Crie um objeto apenas com os campos enviados
            const updatedFields = {};
                
            if (horarioDeSaida) updatedFields.horarioDeSaida = horarioDeSaida;
            if (status) updatedFields.status = status;

            //array vazio de passageirosIds
            if (!passageirosIds) { 
                updatedFields.passageirosIds = existingData.passageirosIds;
            }
            // todos os passageiros cancelaram a viagem
            else if(passageirosIds.length === 0 && existingData.passageirosIds.length > 0) {
                await firestore.collection('rotas').doc(existingData.rotaDeViagem).delete();
                updatedFields.rotaDeViagem = "";
                updatedFields.passageirosIds = [];
                updatedFields.vagasRestantes = existingData.vagasRestantes + 1;
            }
            //atualizar ids dos passageiros e a rota
            else if (passageirosIds && existingData.passageirosIds.length > 0) { 
                
                //alterar numero de vagas
                if (passageirosIds.length > existingData.passageirosIds.length) {
                    updatedFields.vagasRestantes = --existingData.vagasRestantes;
                    updatedFields.passageirosIds = [...passageirosIds];
                }
                else {
                    updatedFields.vagasRestantes = ++existingData.vagasRestantes;
                    const listaAtualizadaPassageiros = existingData.passageirosIds.filter(passageiro => passageirosIds.includes(passageiro));
                    updatedFields.passageirosIds = [...listaAtualizadaPassageiros];
                }
                
                if (existingData.vagasRestantes < 0) {
                    existingData.vagasRestantes = 0;
                    res.status(400).json({ message: 'Quantidade inválida de passageiros. Há mais passageiros que permitido' });
                    return;
                }

                const parametros = {
                    motoristaId: existingData.motoristaId,
                    passageirosIds: updatedFields.passageirosIds,
                    status: status || existingData.status,
                    destinoComum: {...existingData.enderecoDestino},
                    id: existingData.rotaDeViagem
                }
                const idNovaRota = await updateRotaViagem(parametros, firestore);
                updatedFields.rotaDeViagem = idNovaRota;
            } 
            //Criar nova rota
            else if (passageirosIds && existingData.passageirosIds.length === 0) {
                updatedFields.vagasRestantes = --existingData.vagasRestantes;
                updatedFields.passageirosIds = [...passageirosIds];
                const idNovaRota = await calcularRotaViagem(existingData.enderecoDestino, existingData.motoristaId, passageirosIds, firestore);
                updatedFields.rotaDeViagem = idNovaRota.id;
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