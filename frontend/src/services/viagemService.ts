import api from '@/config/axios';
import type Viagem from '@/interfaces/IViagem';

class ViagemService {

    //Obter rota pelo id
    async getById(id: string) {
        const resposta = await api.get(`viagens/${id}`);
        return resposta.data;
    }

    async getViagensEspecificas(motoristasIds: string[], passageiroId: string): Promise<Viagem[]> {
        try {
            const resposta = await api.get('viagens/motoristas-mais-proximos', {
                params: {
                    // Passando os IDs como uma string separada por vírgulas
                    motoristasIds: motoristasIds.join(','),
                    passageiroId: passageiroId,
                }
            });
            return resposta.data;
        } catch (error) {
            console.error('Erro ao buscar viagens:', error);
            return [];
        }

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
                    return id !== userId;
                });    
                //Atualizar a rota sem o passageiro
                const resposta = await api.put(`viagens/${viagemId}`, {
                    passageirosIds: [...passageirosAtualizados],
                });
                return resposta.data;
            } 
            else { //motorista cancelou a viagem
                const resposta = await api.put(`viagens/${viagemId}`, {
                    status: 'cancelada'
                });
                return resposta.data;
            }

        } catch (error) {
            throw error;
        }
    }


    // Criar uma nova rota de viagem
    async create(viagemData: any) {
        return api.post('maps/rotas', viagemData);
    }

    async updateViagem(viagemId: string, passageirosIds: string[]) {
        try {                        
            // Atualiza a viagem com o novo passageiro
            const resposta = await api.put(`viagens/${viagemId}`, {
                passageirosIds: passageirosIds
            });

            return resposta.data;
        } catch (error) {
            console.error('Erro ao atualizar a viagem:', error);
            throw error;
        }
    }
}

export default new ViagemService();