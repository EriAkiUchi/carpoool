import api from '@/config/axios';
import type Viagem from '@/interfaces/IViagem';

class ViagemService {

    //Obter rota pelo id
    async getById(id: string): Promise<Viagem> {
        try {
            const resposta = await api.get(`viagens/${id}`);

            return resposta.data;
        } catch (error) {
            console.error('Erro ao buscar viagem:', error);
            throw error;
        }
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

    async finalizarViagem(viagemId: string) {
        try {
            const resposta = await api.put(`viagens/${viagemId}`, {
                status: 'finalizada',
            });
            return resposta.data;
        } catch (error) {
            console.error('Erro ao finalizar a viagem:', error);
            throw error;
        }
    }


    // Criar uma nova rota de viagem
    async criarAnuncio(viagemData: any) {
        try {
            // Cria a viagem com os dados fornecidos
            const resposta = await api.post('viagens', {
                ...viagemData,
                status: 'ativa' // Define o status inicial como 'ativa'
            });

            return resposta.data;

        } catch (error) {
            console.error('Erro ao criar a viagem:', error);
            throw error;
        }
    }

    async adicionarPassageiro(viagemId: string, passageirosIds: string[]) {
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