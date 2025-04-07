import type { Passageiro } from '@/interfaces/IPassageiro';
import api from '../config/axios';

class PassageiroService {

    // Obter todos os passageiros
    async getAll() {
        return api.get('/passageiros');
    }

    // Obter passageiro por ID
    async getById(id: string) {
        return api.get(`/passageiros/${id}`);
    }

    // Criar passageiro
    async create(passageiro: Passageiro) {
        return api.post('/passageiros', passageiro);
    }

    // Atualizar passageiro
    async update(id: string, passageiro: Partial<Passageiro>) {
        return api.put(`/passageiros/${id}`, passageiro);
    }

    // Deletar passageiro
    async delete(id: string) {
        return api.delete(`/passageiros/${id}`);
    }
}

export default new PassageiroService();