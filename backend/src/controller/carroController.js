import Carro from '../models/Carro.js'

class CarroController{

    static async getCarros(req, res, firestore) {
        try {
            const snapshot = await firestore.collection('carros').get();

            // Convertendo os documentos do Firestore para objetos Carro
            const carros = snapshot.docs.map(doc => Carro.fromFirestore(doc));
            res.status(200).json(carros);

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar os carros: ' + erro });
        }
    }

    static async getCarroId(req, res, firestore) {
        try {
            const { id } = req.params;
            const doc = await firestore.collection('carros').doc(id).get();
            
            if(!doc.exists){
                return res.status(404).json({ message: 'Carro não encontrado' });
            }

            // Convertendo o documento do Firestore para um objeto Carro
            const carro = Carro.fromFirestore(doc); 

            res.status(200).json(carro);

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar o carro: ' + erro });
        }
    }

    static async createCarro(req, res, firestore) {
        try {
            const { nomeModelo, marca, placa, cor} = req.body;
            const carro = new Carro(nomeModelo, marca, placa, cor);

            // Salvando o carro no Firestore
            const docRef = await firestore.collection('carros').add(carro.toFirestore());
            res.status(201).json({ message: 'carro criado com sucesso!', id: docRef.id, ...carro });
            
        } catch (erro) {
            res.status(500).json({ message: 'erro em criar o carro: ' + erro });
        }
    }

    static async updateCarro(req, res, firestore) {
        try {
            const { id } = req.params;
            const docRef = firestore.collection('carros').doc(id); // Referência para o documento do motorista
            const docSnap = await docRef.get(); // Busca o documento no Firestore
    
            if (!docSnap.exists) {
                return res.status(404).json({ message: 'Carro não encontrado' });
            }
    
            const { nomeModelo, marca, placa, cor } = req.body;    
            // Crie um objeto apenas com os campos enviados
            const updatedFields = {};
    
            if (nomeModelo) updatedFields.nomeModelo = nomeModelo;
            if (marca) updatedFields.marca = marca;
            if (placa) updatedFields.placa = placa;
            if (cor) updatedFields.cor = cor;
    
            // Atualize somente o que foi definido
            await docRef.update(updatedFields);
            res.status(200).json({ message: 'carro atualizado com sucesso!', id, ...updatedFields });

        } catch (erro) {
            res.status(500).json({ message: 'erro em atualizar o carro: ' + erro });
        }
    }

    static async deleteCarro(req, res, firestore) {
        try {
            const { id } = req.params;
            await firestore.collection('carros').doc(id).delete();
            res.status(200).json({ message: 'carro deletado com sucesso!', id });

        } catch (erro) {
            res.status(500).json({ message: 'erro em deletar o carro: ' + erro });
        }
    }
}

export default CarroController;