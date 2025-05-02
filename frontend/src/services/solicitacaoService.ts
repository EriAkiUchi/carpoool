import api from '../config/axios';
import type { Solicitacao } from '@/interfaces/ISolicitacao';

class SolicitacaoService {
    async getAllSolicitacoes() {
        try {
            const response = await api.get('/motoristas/solicitacoes');
            return response.data;
        } catch (error) {
            console.error('Error fetching solicitacoes:', error);
            throw error;
        }
    }

    async getSolicitacaoByIds(passageiroId: string, viagemId: string) {
        try {
            const response = await api.get(`/motoristas/solicitacoes/verificar`, {
                params: {
                    idPassageiro: passageiroId,
                    idViagem: viagemId,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching solicitacao:', error);
            throw error;
        }
    }
    async createSolicitacao(solicitacao: any) {
        try {
            const response = await api.post('/motoristas/solicitacoes', solicitacao);
            return response.data;
        } catch (error) {
            console.error('Error creating solicitacao:', error);
            throw error;
        }
    }
}

export default new SolicitacaoService();