import Passageiro from '../models/Passageiro.js'

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
            const passageiro = new Passageiro(nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero);

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
            const { nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero } = req.body;
            const updatedFields = { nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero };

            // Remover campos não fornecidos
            Object.keys(updatedFields).forEach(key => {
                if (updatedFields[key] === undefined) {
                    delete updatedFields[key];
                }
            });

            // Atualizando o passageiro no Firestore
            await firestore.collection('passageiros').doc(id).update(updatedFields);
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