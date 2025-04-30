import api from "@/config/axios";
import type { Motorista } from "@/interfaces/IMotorista";

class MotoristaService {
    // Obter todos os motoristas
    async getAll() {
        return api.get('/motoristas');
    }

    // Obter motorista por ID
    async getById(id: string):Promise<Motorista> {
        try {
            const resultado = await api.get(`/motoristas/${id}`);
            return resultado.data;
        } catch (error) {
            console.error('Erro ao buscar motorista:', error);
            throw error;
        }
    }

    // Criar motorista
    async create(motorista: Motorista) {
        return api.post('/motoristas', motorista);
    }

    // Atualizar motorista
    async update(id: string, motorista: Partial<Motorista>) {
        return api.put(`/motoristas/${id}`, motorista);
    }

    // Deletar motorista
    async delete(id: string) {
        return api.delete(`/motoristas/${id}`);
    }
}

export default new MotoristaService();