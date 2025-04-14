import api from '@/config/axios';

class ViagemService {
    //Obter todas as rotas de viagens
    async getAll() {
        const resposta = await api.get('maps/rota');
        return resposta.data;
    }

    //Obter rota pelo id
    async getById(id: string) {
        const resposta = await api.get(`maps/rota/${id}`);
        return resposta.data;
    }

    //Obter rota filtrando pelo passageiro ou motorista
    async getByUsuarioId(userType: 'passageiro' | 'motorista', id: string) {
        try {
            const resposta = await api.get(`maps/rotas/${userType}/${id}`, {
                params: {
                    userType,
                    id,
                }
            });
            return resposta.data;
        } catch (error) {
            console.error(`Erro ao buscar viagens do ${userType}:`, error);
            return [];
        }
    }
    // Cancelar viagem
    async cancelarViagem(rotaId: string, passageiroId: string) {
        try {
            const rotaResponse = await this.getById(rotaId);
            const rota = rotaResponse.data;

            //Filtrar o passageiro da lista de passageiros
            const passageirosAtualizados = rota.passageirosIds.filter((id: string) => {
                id !== rota.passageirosIds.includes(passageiroId);
            });

            //Atualizar a rota sem o passageiro
            return api.put(`maps/rota/${rotaId}`, {
                passageirosIds: passageirosAtualizados,
            });

        } catch (error) {
            throw error;
        }
    }


    // Criar uma nova rota de viagem
    async create(viagemData: any) {
        return api.post('maps/rotas', viagemData);
    }
}

export default new ViagemService();