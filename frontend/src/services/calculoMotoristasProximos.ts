import api from '@/config/axios';

class CalculoMotoristasProximosService {
    async getMotoristasProximos(passageiroId: string, distancia: number) {
        distancia *= 1000; // Converte de km para metros
        try {
            const resposta = await api.get(`maps/distancia/${passageiroId}`, {
                params: {
                    passageiroId: passageiroId,
                    distanciaMaxima: distancia,
                }
            });
            return resposta.data;
        } catch (error) {
            console.error('Erro ao buscar motoristas próximos:', error);
            return null;
        }
    }
}

export default new CalculoMotoristasProximosService();