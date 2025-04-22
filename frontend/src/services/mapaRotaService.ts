import api from '@/config/axios';

class MapaRotaService {
    async getRotaById(id: string) {
        try {
            const resposta = await api.get(`/maps/rota/${id}`);
            return resposta.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new MapaRotaService();