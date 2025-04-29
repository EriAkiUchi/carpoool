import axios from 'axios';
import MapaDeRota from '../models/MapaDeRota.js';

const MAPS_API_KEY = process.env.MAPS_API_KEY;

const quickSort = (arr) => {
    if (arr.length <= 1) {
      return arr;
    }
  
    let pivot = arr[0];
    let leftArr = [];
    let rightArr = [];
  
    for (let i = 1; i < arr.length; i++) {
      if (arr[i].distancia < pivot.distancia) {
        leftArr.push(arr[i]);
      } else {
        rightArr.push(arr[i]);
      }
    }
  
    return [...quickSort(leftArr), pivot, ...quickSort(rightArr)];
  };

async function calcularDistancia(origem, destino) {
    const resposta = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origem}&destinations=${destino}&key=${MAPS_API_KEY}`);
    return resposta.data;
}

async function calcularRota(origem, destino) {
    const resposta = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${origem}&destination=${destino}&key=${MAPS_API_KEY}`);
    return resposta.data;
}

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

    /**
     * @swagger
     * /maps/rota/calcular-viagem:
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

export async function calcularRotaViagem(destinoComum, motoristaId, passageirosIds, firestore) {
    try {        
        // Buscar dados do motorista
        const motoristaDoc = await firestore.collection('motoristas').doc(motoristaId).get();
        if (!motoristaDoc.exists) {
            return { erro: 'Motorista não encontrado' };
        }
        const motorista = motoristaDoc.data();

        const passageiros = [];
        for (const passageiroId of passageirosIds) {
            const passageiroDoc = await firestore.collection('passageiros').doc(passageiroId).get();
            if(!passageiroDoc.exists) {
                return { erro: `Passageiro ${passageiroId} não encontrado` };
            } 
            
            const passageiro = passageiroDoc.data();
            passageiro.id = passageiroId;
            passageiros.push(passageiro);
        }
        
        let pontoAtual
        const rotasParaPassageiros = [];
        const origemMotorista = `${motorista.coordenadasOrigem.lat},${motorista.coordenadasOrigem.lng}`;
        // Caso de apenas um passageiro (mantendo a lógica original)
        if (passageiros.length === 1) {
            const passageiro = passageiros[0];
            const origemPassageiro = `${passageiro.coordenadasOrigem.lat},${passageiro.coordenadasOrigem.lng}`;
            
            const rotaData = await calcularRota(origemMotorista, origemPassageiro);
            rotasParaPassageiros.push({
                passageiroId: passageiro.id,
                rota: rotaData.routes[0]
            });
                            
            pontoAtual = origemPassageiro;
            // return res.status(200).json({ 
            //     rotas: [rotaParaPassageiro],
            //     rotaFinal 
            // });
        }
        // Caso de múltiplos passageiros
        else {
            // Precisamos determinar a ordem ótima para buscar os passageiros
            pontoAtual = origemMotorista;
            // const rotasParaPassageiros = [];
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
        }

        // Calcular a rota final do último passageiro até o destino comum
        const destinoComumCoordenadas = await geocodeAddress(destinoComum);
        const destinoComumString = `${destinoComumCoordenadas.lat},${destinoComumCoordenadas.lng}`;
        const rotaFinalData = await calcularRota(pontoAtual, destinoComumString);
        const rotaFinal = rotaFinalData.routes[0];
        
        const rotaViagem = new MapaDeRota(rotasParaPassageiros, rotaFinal);

        const rotaRef = await firestore.collection('rotas').add(rotaViagem.toFirestore());
        const novaRota = {
            id: rotaRef.id,
            rotas: rotasParaPassageiros,
            rotaFinal: rotaFinal
        }
        return novaRota;

    } catch (erro) {
        throw new Error('erro em calcular a rota da viagem: ' + erro);
    }
}

export async function updateRotaViagem(parametros, firestore) {
    try {
        const id = parametros.id;
        const passageirosIds = parametros.passageirosIds;
        const motoristaId = parametros.motoristaId;
        const destinoComum = parametros.destinoComum;
        const docRef = firestore.collection('rotas').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return { message: 'Rota não encontrada' };
        }
        else {
            const novaRota = await calcularRotaViagem(destinoComum, motoristaId, passageirosIds, firestore);
            await firestore.collection('rotas').doc(id).delete();
            return novaRota.id;
        }            

    } catch (erro) {
        throw new Error('Erro ao atualizar a rota:' + erro);
    }
}

export async function deleteRotaViagem(idRota, firestore) {
    try {
        const id = idRota;
        const docRef = firestore.collection('rotas').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return { erro: 'Rota não encontrada' };
        }

        await firestore.collection('rotas').doc(id).delete();
        
        return { message: 'Rota deletada por falta de passageiros', id };
        

    } catch (erro) {
        throw new Error('erro em deletar a Rota: '+ erro);
    }
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

    static async calcularMotoristaMaisProximo(req, res, firestore) {
        try {
            const { passageiroId } = req.params;
            const { distanciaMaxima } = req.query; //distancia máxima em metros
            const passageiroDoc = await firestore.collection('passageiros').doc(passageiroId).get();
            if(!passageiroDoc.exists) {
                return res.status(404).json({ message: 'Passageiro não encontrado' });                
            }

            const passageiro = passageiroDoc.data();
            const coordenadasPassageiro = `${passageiro.coordenadasOrigem.lat},${passageiro.coordenadasOrigem.lng}`;

            const motoristasSnapshot = await firestore.collection('motoristas').get();
            const motoristas = [];
            motoristasSnapshot.forEach(doc => { //busca todos os motoristas
                const motorista = doc.data();
                motorista.id = doc.id;
                motoristas.push(motorista);
            });

            let motoristasMaisProximos = []; //array de objetos com os motoristas mais próximos
            let distanciaMinima = Infinity;

            for (const motorista of motoristas) {
                const coordenadasMotorista = `${motorista.coordenadasOrigem.lat},${motorista.coordenadasOrigem.lng}`;
                const distanciaData = await calcularDistancia(coordenadasMotorista, coordenadasPassageiro);
                const distancia = distanciaData.rows[0].elements[0].distance.value;
                
                if(distancia < distanciaMaxima) {
                    const objMotorista = {
                        id: motorista.id,
                        distancia: distancia,
                    }
                    motoristasMaisProximos.push(objMotorista);
                    motoristasMaisProximos = quickSort(motoristasMaisProximos); // ordena o array de motoristas mais próximos
                    if(motoristasMaisProximos.length > 7) { // limita o array a 7 motoristas mais próximos
                        motoristasMaisProximos.pop();
                    }
                    distanciaMinima = motoristasMaisProximos[motoristasMaisProximos.length - 1].distancia; // atualiza a distância mínima
                }
            }

            res.status(200).json(motoristasMaisProximos);

        } catch (erro) {
            res.status(500).json({ message: 'erro em calcular o motorista mais próximo' + erro });
        }
    }

    /**
     * @swagger
     * /maps/rota/{id}:
     *   get:
     *    summary: Retorna uma rota pelo ID
     *    parameters:
     *     - in: path
     *       name: id
     *       required: true
     *       schema:
     *        type: string
     *    responses:
     *      200:
     *        description: Rota encontrada
     *      404:
     *        description: Rota não encontrada
     *      500:
     *        description: Erro em pegar a rota
     */
    static async getRotaId(req, res, firestore) {
        try {
            const { id } = req.params;
            const doc = await firestore.collection('rotas').doc(id).get();
            
            if(!doc.exists){
                return res.status(404).json({ message: 'Rota não encontrada' });
            }

            // Convertendo o documento do Firestore para um objeto MapaDeRota
            const rota = MapaDeRota.fromFirestore(doc); 

            res.status(200).json(rota);

        } catch (erro) {
            res.status(500).json({ message: 'erro em pegar a rota: ' + erro });
        }
    }

    static async getRotasUsuarioId(req, res, firestore) {
        try {
            const { userType, id } = req.params;
            const tipoID = userType === 'motorista' ? 'motoristaId' : 'passageirosIds';
            const rotasRef = await firestore.collection('rotas');

            //Buscar rotas onde o id do usuário está incluído
            if(userType === 'motorista') {
                const rotasSnapshot = await rotasRef.where(tipoID, '==', id).get();
                if (rotasSnapshot.empty) {
                    return res.status(404).json({ message: 'Nenhuma rota encontrada para o motorista' });
                }
            }
            else if(userType === 'passageiro') {
                const rotasSnapshot = await rotasRef.where(tipoID, 'array-contains', id).get();
                if (rotasSnapshot.empty) {
                    return res.status(404).json({ message: 'Nenhuma rota encontrada para o passageiro' });
                }                
            }
            // Se houver rotas, mapeia os documentos para o formato desejado
            // Convertendo os documentos do Firestore para objetos MapaDeRota
            const rotas = rotasSnapshot.docs.map(doc => {
                const rota = MapaDeRota.fromFirestore(doc);
                return { id: doc.id, ...rota };
            });
            res.status(200).json(rotas);
        } catch (erro) {
            res.status(500).json({ message: 'Erro ao buscar rotas: ' + erro });
        }
    }

    /**
     * @swagger
     * /maps/rota:
     *   post:
     *     summary: Cria uma nova rota
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               motoristaId:
     *                 type: string
     *               passageirosIds:
     *                 type: array
     *               destinoComum:
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
     *               rotas:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     passageiroId:
     *                       type: string
     *                     rota:
     *                       type: object
     *               rotaFinal:
     *                 type: object      
     *               status:
     *                 type: string
     *     responses:
     *       201:
     *         description: Rota criada com sucesso
     *       500:
     *         description: Erro ao criar rota
     * 
    */
    static async createRota(req, res, firestore) {
        try {
            const { motoristaId, passageirosIds, destinoComum, rotas, rotaFinal } = req.body;
            const dataCriacao = new Date();
            const status = 'em andamento';

            const mapaDeRota = new MapaDeRota(motoristaId, passageirosIds, destinoComum, rotas, rotaFinal, dataCriacao, status);
            const rotaRef = await firestore.collection('rotas').add(mapaDeRota.toFirestore());

            res.status(201).json({ id: rotaRef.id });
        } catch (erro) {
            res.status(500).json({ message: 'Erro ao criar rota: ' + erro });
        }
    }

    

}

export default MapsController;