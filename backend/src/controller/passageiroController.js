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

    static async createPassageiro(req, res, firestore) {
        try {
            const { nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero } = req.body;
            const coordenadasOrigem = await geocodeAddress(enderecoOrigem);
            const coordenadasDestino = await geocodeAddress(enderecoDestino);
            const passageiro = new Passageiro(nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero, coordenadasOrigem, coordenadasDestino);

            // Salvando o passageiro no Firestore
            const docRef = await firestore.collection('passageiros').add(passageiro.toFirestore());
            res.status(201).json({ message: 'passageiro criado com sucesso!', id: docRef.id, ...passageiro });
            
        } catch (erro) {
            res.status(500).json({ message: 'erro em criar o passageiro: ' + erro });
        }
    }

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

    static async deletePassageiro(req, res, firestore) {
        try {
            const { id } = req.params;
            await firestore.collection('passageiros').doc(id).delete();
            res.status(200).json({ message: 'passageiro deletado com sucesso!', id });

        } catch (erro) {
            res.status(500).json({ message: 'erro em deletar o passageiro: ' + erro });
        }
    }
}

export default PassageiroController;