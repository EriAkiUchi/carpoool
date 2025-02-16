import Motorista from '../models/Motorista.js'

class MotoristaController{

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

    static async createMotorista(req, res, firestore) {
        try {
            const { nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero } = req.body;
            const motorista = new Motorista(nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero);

            // Salvando o motorista no Firestore
            const docRef = await firestore.collection('motoristas').add(motorista.toFirestore());
            res.status(201).json({ message: 'motorista criado com sucesso!', id: docRef.id, ...motorista });
            
        } catch (erro) {
            res.status(500).json({ message: 'erro em criar o motorista: ' + erro });
        }
    }

    static async updateMotorista(req, res, firestore) {
        try {
            const { id } = req.params;
            const { nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero } = req.body;
            const updatedFields = { nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero };

            // Remover campos não fornecidos
            Object.keys(updatedFields).forEach(key => {
                if (updatedFields[key] === undefined) {
                    delete updatedFields[key];
                }
            });

            // Atualizando o motorista no Firestore
            await firestore.collection('motoristas').doc(id).update(updatedFields);
            res.status(200).json({ message: 'motorista atualizado com sucesso!', id, ...updatedFields });

        } catch (erro) {
            res.status(500).json({ message: 'erro em atualizar o motorista: ' + erro });
        }
    }

    static async deleteMotorista(req, res, firestore) {
        try {
            const { id } = req.params;
            await firestore.collection('motoristas').doc(id).delete();
            res.status(200).json({ message: 'motorista deletado com sucesso!', id });
            
        } catch (erro) {
            res.status(500).json({ message: 'erro em deletar o motorista: ' + erro });
        }
    }
}

export default MotoristaController;