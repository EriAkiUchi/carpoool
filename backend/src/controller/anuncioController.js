import Anuncio from '../models/Anuncio.js';

class AnuncioController {
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