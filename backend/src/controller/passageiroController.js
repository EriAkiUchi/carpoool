import axios from 'axios';
import Passageiro from '../models/Passageiro.js'

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

class PassageiroController{

    /**
     * @swagger
     * /passageiros:
     *   get:
     *     summary: Retorna todos os passageiros
     *     responses:
     *       200:
     *         description: Lista de passageiros
     *       500:
     *         description: Erro em pegar os passageiros
     */
    static async getPassageiros(req, res, firestore) {
        try {
            const snapshot = await firestore.collection('passageiros').get();

            // Convertendo os documentos do Firestore para objetos Passageiro
            const passageiros = snapshot.docs.map(doc => Passageiro.fromFirestore(doc));
            res.status(200).json(passageiros);

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar os passageiros: ' + erro });
        }
    }

    /**
     * @swagger
     * /passageiros/{id}:
     *   get:
     *     summary: Retorna um passageiro pelo ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Passageiro encontrado
     *       404:
     *         description: Passageiro não encontrado
     *       500:
     *         description: Erro em pegar o passageiro
     */
    static async getPassageiroId(req, res, firestore) {
        try {
            const { id } = req.params;
            const doc = await firestore.collection('passageiros').doc(id).get();
            
            if(!doc.exists){
                return res.status(404).json({ message: 'Passageiro não encontrado' });
            }

            // Convertendo o documento do Firestore para um objeto Passageiro
            const passageiro = Passageiro.fromFirestore(doc); 

            res.status(200).json(passageiro);

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar o passageiro: ' + erro });
        }
    }

    /**
     * @swagger
     * /passageiros:
     *   post:
     *     summary: Cria um novo passageiro
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
     *       201:
     *         description: Passageiro criado com sucesso
     *       500:
     *         description: Erro em criar o passageiro
     */
    static async createPassageiro(req, res, firestore) {
        try {
            const { nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero } = req.body;
        
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
            const passageiro = new Passageiro(nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimentoFormatada, genero, coordenadasOrigem, coordenadasDestino);

            // Salvando o passageiro no Firestore
            const docRef = await firestore.collection('passageiros').add(passageiro.toFirestore());
            res.status(201).json({ message: 'passageiro criado com sucesso!', id: docRef.id, ...passageiro });
            
        } catch (erro) {
            res.status(500).json({ message: 'erro em criar o passageiro: ' + erro });
        }
    }

    /**
     * @swagger
     * /passageiros/{id}:
     *   put:
     *     summary: Atualiza um passageiro pelo ID
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
     *         description: Passageiro atualizado com sucesso
     *       404:
     *         description: Passageiro não encontrado
     *       500:
     *         description: Erro em atualizar o passageiro
     */
    static async updatePassageiro(req, res, firestore) {
        try {
            const { id } = req.params;
            const docRef = firestore.collection('passageiros').doc(id); // Referência para o documento do motorista
            const docSnap = await docRef.get(); // Busca o documento no Firestore
    
            if (!docSnap.exists) {
                return res.status(404).json({ message: 'Passageiro não encontrado' });
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
            }
    
            if (enderecoDestino) {
                updatedFields.enderecoDestino = {
                    ...(existingData.enderecoDestino || {}),
                    ...enderecoDestino
                };
            }
    
            // Atualize somente o que foi definido
            await docRef.update(updatedFields);
            res.status(200).json({ message: 'passageiro atualizado com sucesso!', id, ...updatedFields });

        } catch (erro) {
            res.status(500).json({ message: 'erro em atualizar o passageiro: ' + erro });
        }
    }

    /**
     * @swagger
     * /passageiros/{id}:
     *   delete:
     *     summary: Deleta um passageiro pelo ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Passageiro deletado com sucesso
     *       404:
     *         description: Passageiro não encontrado
     *       500:
     *         description: Erro em deletar o passageiro
     */

    static async deletePassageiro(req, res, firestore) {
        try {
            const { id } = req.params;
            const docRef = firestore.collection('passageiros').doc(id);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return res.status(404).json({ message: 'Passageiro não encontrado' });
            }

            res.status(200).json({ message: 'Passageiro deletado com sucesso!', id });

        } catch (erro) {
            res.status(500).json({ message: 'erro em deletar o Passageiro: ' + erro });
        }
    }
}

export default PassageiroController;