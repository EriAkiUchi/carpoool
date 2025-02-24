import axios from 'axios';
import Passageiro from '../models/Passageiro.js';

const MAPS_API_KEY = process.env.MAPS_API_KEY;

async function calcularDistancia(origem, destino) {
    const resposta = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origem}&destinations=${destino}&key=${MAPS_API_KEY}`);
    return resposta.data;
}

async function calcularRota(origem, destino) {
    const resposta = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${origem}&destination=${destino}&key=${MAPS_API_KEY}`);
    return resposta.data;
}

class MapsController {
    static async calcularMotoristaMaixProximo(req, res, firestore) {
        try {
            const { passageiroId } = req.params;
            const passageiroDoc = await firestore.collection('passageiros').doc(passageiroId).get();
            if(!passageiroDoc.exists) {
                return res.status(404).json({ message: 'Passageiro não encontrado' });                
            }

            const passageiro = passageiroDoc.data();
            const coordenadasPassageiro = `${passageiro.coordenadasOrigem.lat},${passageiro.coordenadasOrigem.lng}`;

            const motoristasSnapshot = await firestore.collection('motoristas').get();
            const motoristas = [];
            motoristasSnapshot.forEach(doc => {
                const motorista = doc.data();
                motorista.id = doc.id;
                motoristas.push(motorista);
            });

            let motoristaMaisProximo = null;
            let menorDistancia = Infinity;

            //TODO: verificar se passageiro e motorista possuem o mesmo destino final
            for (const motorista of motoristas) {
                const coordenadasMotorista = `${motorista.coordenadasOrigem.lat},${motorista.coordenadasOrigem.lng}`;
                const distanciaData = await calcularDistancia(coordenadasMotorista, coordenadasPassageiro);
                const distancia = distanciaData.rows[0].elements[0].distance.value;
                
                if(distancia < menorDistancia) {
                    menorDistancia = distancia;
                    motoristaMaisProximo = motorista;
                }
            }

            res.status(200).json({ motoristaMaisProximo, distancia: menorDistancia })

        } catch (erro) {
            res.status(500).json({ message: 'erro em calcular o motorista mais próximo' + erro });
        }
    }

    //TODO: implementar caso tenha mais de um passageiro
    static async calcularRotaViagem(req, res, firestore) {
        try {
            const { motoristaId, passageiroId, destinoComum } = req.body;
            const motoristaDoc = await firestore.collection('motoristas').doc(motoristaId).get();
            const passageiroDoc = await firestore.collection('passageiros').doc(passageiroId).get();

            if(!motoristaDoc.exists || !passageiroDoc.exists) {
                return res.status(404).json({ message: 'Motorista ou passageiro não encontrado' });
            }

            const motorista = motoristaDoc.data();
            const passageiro = passageiroDoc.data();

            const origemMotorista = `${motorista.coordenadasOrigem.lat},${motorista.coordenadasOrigem.lng}`;
            const origemPassageiro = `${passageiro.coordenadasOrigem.lat},${passageiro.coordenadasOrigem.lng}`;

            const rotaData = await calcularRota(origemMotorista, origemPassageiro);
            const rotaParaPassageiro = rotaData.routes[0];

            const rotaFinalData = await calcularRota(origemPassageiro, destinoComum);
            const rotaFinal = rotaFinalData.routes[0];

            res.status(200).json({ rotaParaPassageiro, rotaFinal });
        } catch (erro) {
            res.status(500).json({ message: 'erro em calcular a rota da viagem: ' + erro });
        }
    }
}

export default MapsController;