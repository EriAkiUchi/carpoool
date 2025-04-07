import api from '../config/axios';
import type { User } from '@/interfaces/IUser';


class AuthService {
    async loginPassageiro(email: string, senha: string): Promise<User> {
        try {
            const resposta = await api.post('/login/passageiro', { email, senha });
            if (resposta.data) {
                this.setUserData({
                    ...resposta.data,
                    tipo: 'passageiro',
                });
            }
            return resposta.data;
        } catch (error) {
            throw error;
        }
    }

    async loginMotorista(email: string, senha: string): Promise<User> {
        try {
            const resposta = await api.post('/login/motorista', { email, senha });
            if (resposta.data) {
                this.setUserData({
                    ...resposta.data,
                    tipo: 'motorista',
                });
            }
            return resposta.data;
        } catch (error) {
            throw error;
        }
    }

    // Armazenar dados do usuário no localStorage
    setUserData(userData: User) {
        localStorage.setItem('user', JSON.stringify(userData));
    }

    // Obter dados do usuário do localStorage
    getUserData(): User | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    // Verificar se o usuário está autenticado
    isAuthenticated(): boolean {
        return !!this.getUserData();
    }

    // Verificar tipo do usuário
    getUserType(): string | null {
        const user = this.getUserData();
        return user ? user.tipo : null;
    }

    // Logout do usuário
    logout() {
        localStorage.removeItem('user');
    }
}

export default new AuthService();