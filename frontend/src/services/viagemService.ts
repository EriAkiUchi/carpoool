import api from '@/config/axios';

class ViagemService {

    //Obter rota pelo id
    async getById(id: string) {
        const resposta = await api.get(`viagens/${id}`);
        return resposta.data;
    }

    //Obter rota filtrando pelo passageiro ou motorista
    async getByUsuarioId(userType: 'passageiro' | 'motorista', id: string) {
        try {
            const resposta = await api.get(`viagens/${userType}/${id}`, {
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
    async cancelarViagem(viagemId: string, userId: string, userType: 'passageiro' | 'motorista') {
        try {
            const viagemResposta = await this.getById(viagemId);
            
            if(userType === 'passageiro') {
                //Filtrar o passageiro da lista de passageiros
                const passageirosAtualizados = viagemResposta.passageirosIds.filter((id: string) => {
                    id !== viagemResposta.passageirosIds.includes(userId);
                });
    
                //Atualizar a rota sem o passageiro
                return api.put(`viagens/${viagemId}`, {
                    passageirosIds: [...passageirosAtualizados],
                });
            } 
            else { //motorista cancelou a viagem
                return api.put(`viagens/${viagemId}`, {
                    status: 'cancelada'
                });
            }

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