import axios from 'axios';
import Motorista from '../models/Motorista.js'

const MAPS_API_KEY = process.env.MAPS_API_KEY;

// Função para converter um endereço em coordenadas
async function geocodeAddress(address) {
    const resposta = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address.logradouro},${address.numero},${address.bairro},${address.cidade}&key=${MAPS_API_KEY}`);
    if (resposta.data.status === 'OK') {
        const { lat, lng } = resposta.data.results[0].geometry.location;
        return { lat, lng };
    } else {
        throw new Error('Endereço não encontrado:', resposta.data.status);
    }
}

class MotoristaController{

    /** 
     * @swagger
     * /motoristas:
     *  get:
     *    summary: Retorna todos os motoristas
     *    responses:
     *       200:
     *         description: Lista de motoristas
     *       500:
     *         description: Erro em pegar os motoristas
     */

    static async getMotoristas(req, res, firestore) {
        try {
            const snapshot = await firestore.collection('motoristas').get();

            // Convertendo os documentos do Firestore para objetos Motorista
            const motoristas = snapshot.docs.map(doc => Motorista.fromFirestore(doc));
            res.status(200).json(motoristas);

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar os motoristas: ' + erro });
        }
    }

    /**
     * @swagger
     * /motoristas/{id}:
     *  get:
     *    summary: Retorna um motorista pelo ID
     *    parameters:
     *      - in: path 
     *        name: id
     *        required: true
     *        schema:
     *          type: string
     *    responses:
     *      200:
     *        description: Motorista encontrado
     *      404:
     *        description: Motorista não encontrado
     *      500:
     *        description: Erro em pegar o motorista
     */
    static async getMotoristaId(req, res, firestore) {
        try {
            const { id } = req.params;
            const doc = await firestore.collection('motoristas').doc(id).get();
            
            if(!doc.exists){
                return res.status(404).json({ message: 'Motorista não encontrado' });
            }

            // Convertendo o documento do Firestore para um objeto Motorista
            const motorista = Motorista.fromFirestore(doc); 

            res.status(200).json(motorista);

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar o motorista: ' + erro });
        }
    }

    /**
     * @swagger
     * /motoristas:
     *  post:
     *    summary: Cria um motorista
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            type: object
     *            properties:
     *              nome:
     *                type: string
     *              email:
     *                type: string
     *              senha:
     *                type: string
     *              enderecoOrigem:
     *                type: object
     *                properties:
     *                 logradouro:
     *                   type: string
     *                 numero:
     *                   type: number
     *                 bairro:
     *                   type: string
     *                 cidade:
     *                   type: string
     *              enderecoDestino:
     *                type: object
     *                properties:
     *                  logradouro:
     *                    type: string
     *                  numero:
     *                    type: number
     *                  bairro:
     *                    type: string
     *                  cidade:
     *                    type: string
     *              dataNascimento:
     *                type: string
     *              genero:
     *                type: string
     *    responses:
     *      201:
     *        description: Motorista criado com sucesso
     *      400:
     *        description: Data de nascimento inválida. Use o formato DD/MM/YYYY
     *      500:
     *        description: Erro em criar o motorista
     */

    static async createMotorista(req, res, firestore) {
        try {
            const { nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero, carro } = req.body;


        // Parse dataNascimento to ensure Brazilian format (DD/MM/YYYY)
        let dataNascimentoFormatada;
        if (dataNascimento) {
            const partes = dataNascimento.split('/');
            if (partes.length === 3) {
                // Assume Brazilian format: DD/MM/YYYY
                const dia = parseInt(partes[0], 10);
                const mes = parseInt(partes[1], 10) - 1; // Months are 0-indexed in JS
                const ano = parseInt(partes[2], 10);
                dataNascimentoFormatada = new Date(ano, mes, dia);
                
                // Validate if the date is valid
                if (isNaN(dataNascimentoFormatada.getTime())) {
                    return res.status(400).json({ message: 'Data de nascimento inválida. Use o formato DD/MM/YYYY.' });
                }
            } else {
                return res.status(400).json({ message: 'Data de nascimento inválida. Use o formato DD/MM/YYYY.' });
            }
        }

            const coordenadasOrigem = await geocodeAddress(enderecoOrigem);
            const coordenadasDestino = await geocodeAddress(enderecoDestino);
            const motorista = new Motorista(nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimentoFormatada, genero, coordenadasOrigem, coordenadasDestino, carro);

            // Salvando o motorista no Firestore
            const docRef = await firestore.collection('motoristas').add(motorista.toFirestore());
            res.status(201).json({ message: 'motorista criado com sucesso!', id: docRef.id, ...motorista });
            
        } catch (erro) {
            res.status(500).json({ message: 'erro em criar o motorista: ' + erro });
        }
    }

    /**
     * @swagger
     * /motoristas/{id}:
     *   put:
     *     summary: Atualiza um motorista pelo ID
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
     *               nome:
     *                 type: string
     *               email:
     *                 type: string 
     *               senha:
     *                 type: string
     *               enderecoOrigem:
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
     *               dataNascimento:
     *                 type: string
     *               genero:
     *                 type: string
     *     responses:
     *       200:
     *         description: Motorista atualizado com sucesso
     *       404:
     *         description: Motorista não encontrado
     *       500:
     *         description: Erro em atualizar o motorista
     */

    static async updateMotorista(req, res, firestore) {
        try {
            const { id } = req.params;
            const docRef = firestore.collection('motoristas').doc(id); // Referência para o documento do motorista
            const docSnap = await docRef.get(); // Busca o documento no Firestore
    
            if (!docSnap.exists) {
                return res.status(404).json({ message: 'Motorista não encontrado' });
            }
    
            const { nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero } = req.body;
            const existingData = docSnap.data();
    
            // Crie um objeto apenas com os campos enviados
            const updatedFields = {};
    
            if (nome) updatedFields.nome = nome;
            if (email) updatedFields.email = email;
            if (senha) updatedFields.senha = senha;
            if (dataNascimento) updatedFields.dataNascimento = dataNascimento;
            if (genero) updatedFields.genero = genero;
    
            // fazer merge com os campos existentes para não sobrescrever
            if (enderecoOrigem) {
                updatedFields.enderecoOrigem = { 
                    ...(existingData.enderecoOrigem || {}), // Se existir, mantenha os campos existentes
                    ...enderecoOrigem // Atualize os campos existentes
                };
                updatedFields.coordenadasOrigem = await geocodeAddress(updatedFields.enderecoOrigem);
            }
    
            if (enderecoDestino) {
                updatedFields.enderecoDestino = {
                    ...(existingData.enderecoDestino || {}),
                    ...enderecoDestino
                };
                updatedFields.coordenadasDestino = await geocodeAddress(updatedFields.enderecoDestino);
            }
    
            // Atualize somente o que foi definido
            await docRef.update(updatedFields);
            res.status(200).json({ message: 'motorista atualizado com sucesso!', id, ...updatedFields });

        } catch (erro) {
            res.status(500).json({ message: 'erro em atualizar o motorista: ' + erro });
        }
    }

    /**
     * @swagger
     * /motoristas/{id}:
     *   delete:
     *     summary: Deleta um motorista pelo ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Motorista deletado com sucesso
     *       404:
     *         description: Motorista não encontrado
     *       500:
     *         description: Erro em deletar o motorista
     */

    static async deleteMotorista(req, res, firestore) {
        try {
            const { id } = req.params;
            const docRef = firestore.collection('motoristas').doc(id); // Referência para o documento do motorista
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return res.status(404).json({ message: 'Motorista não encontrado' });
            }
            
            await firestore.collection('motoristas').doc(id).delete();
            res.status(200).json({ message: 'motorista deletado com sucesso!', id });
            
        } catch (erro) {
            res.status(500).json({ message: 'erro em deletar o motorista: ' + erro });
        }
    }
}

export default MotoristaController;