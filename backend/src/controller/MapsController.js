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

    /**
     * @swagger
     * /maps/distancia/{passageiroId}:
     *   get:
     *    summary: Calcula o motorista mais próximo de um passageiro
     *    parameters:
     *     - in: path
     *       name: passageiroId
     *       required: true
     *       schema:
     *        type: string
     *    responses:
     *      200:
     *        description: Motorista mais próximo encontrado
     *      404:
     *        description: Passageiro não encontrado
     *      500:
     *        description: Erro em calcular o motorista mais próximo
     */

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

    /**
     * @swagger
     *  /maps/rota:
     *   post:
     *    summary: Calcula a rota da viagem
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            type: object
     *            properties:
     *              motoristaId:
     *                type: string
     *              passageiroId:
     *                type: string
     *              destinoComum:
     *                type: string
     *    responses:
     *      200:
     *         description: Rota da viagem calculada
     *      404:
     *         description: Motorista ou passageiro não encontrado
     *      500:
     *         description: Erro em calcular a rota da viagem
     */

    //TODO: implementar caso tenha mais de um passageiro
    static async calcularRotaViagem(req, res, firestore) {
        try {
            const { motoristaId, passageirosIds, destinoComum } = req.body;

            // Validar que passageirosIds é um array e tem entre 1 e 3 passageiros
            if (!Array.isArray(passageirosIds) || passageirosIds.length < 1 || passageirosIds.length > 3) {
                return res.status(400).json({ message: 'Forneça de 1 a 3 passageiros' });
            }

            // Buscar dados do motorista
            const motoristaDoc = await firestore.collection('motoristas').doc(motoristaId).get();
            if (!motoristaDoc.exists) {
                return res.status(404).json({ message: 'Motorista não encontrado' });
            }
            const motorista = motoristaDoc.data();

            const passageiros = [];
            for (const passageiroId of passageirosIds) {
                const passageiroDoc = await firestore.collection('passageiros').doc(passageiroId).get();
                if(!passageiroDoc.exists) {
                    return res.status(404).json({ message: `Passageiro ${passageiroId} não encontrado` });
                } 
                
                const passageiro = passageiroDoc.data();
                passageiro.id = passageiroId;
                passageiros.push(passageiro);
            }
            

            const origemMotorista = `${motorista.coordenadasOrigem.lat},${motorista.coordenadasOrigem.lng}`;
            // Caso de apenas um passageiro (mantendo a lógica original)
            if (passageiros.length === 1) {
                const passageiro = passageiros[0];
                const origemPassageiro = `${passageiro.coordenadasOrigem.lat},${passageiro.coordenadasOrigem.lng}`;
                
                const rotaData = await calcularRota(origemMotorista, origemPassageiro);
                const rotaParaPassageiro = rotaData.routes[0];
                
                const rotaFinalData = await calcularRota(origemPassageiro, destinoComum);
                const rotaFinal = rotaFinalData.routes[0];
                
                return res.status(200).json({ 
                    rotas: [rotaParaPassageiro],
                    rotaFinal 
                });
            }
            // Caso de múltiplos passageiros
            // Precisamos determinar a ordem ótima para buscar os passageiros
            let pontoAtual = origemMotorista;
            const rotasParaPassageiros = [];
            const passageirosRestantes = [...passageiros];

            // Para cada passageiro que precisamos buscar
            while (passageirosRestantes.length > 0) {
                let melhorPassageiro = null; //meljor passageiro para buscar
                let menorDistancia = Infinity;
                let melhorRota = null; //melhor rota para buscar o passageiro
                let melhorIndex = -1;
                
                // Encontrar o passageiro mais próximo do ponto atual
                for (let i = 0; i < passageirosRestantes.length; i++) {
                    const passageiro = passageirosRestantes[i];
                    const origemPassageiro = `${passageiro.coordenadasOrigem.lat},${passageiro.coordenadasOrigem.lng}`;
                    
                    const distanciaData = await calcularDistancia(pontoAtual, origemPassageiro);
                    const distancia = distanciaData.rows[0].elements[0].distance.value;
                    
                    if (distancia < menorDistancia) {
                        menorDistancia = distancia;
                        melhorPassageiro = passageiro;
                        melhorIndex = i;
                        
                        // Também calculamos a rota para não precisar calcular novamente
                        const rotaData = await calcularRota(pontoAtual, origemPassageiro);
                        melhorRota = rotaData.routes[0];
                    }
                }
                
                // Adicionar a rota para o melhor passageiro
                rotasParaPassageiros.push({
                    passageiroId: melhorPassageiro.id,
                    rota: melhorRota
                });
                
                // Atualizar o ponto atual e remover o passageiro da lista
                pontoAtual = `${melhorPassageiro.coordenadasOrigem.lat},${melhorPassageiro.coordenadasOrigem.lng}`;
                passageirosRestantes.splice(melhorIndex, 1);
            }

            // Calcular a rota final do último passageiro até o destino comum
            const rotaFinalData = await calcularRota(pontoAtual, destinoComum);
            const rotaFinal = rotaFinalData.routes[0];
            
            res.status(200).json({ 
                rotas: rotasParaPassageiros,
                rotaFinal 
            });


        } catch (erro) {
            res.status(500).json({ message: 'erro em calcular a rota da viagem: ' + erro });
        }
    }
}

export default MapsController;