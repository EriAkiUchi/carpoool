import { defineStore } from 'pinia';
import authService from '@/services/authService';
import type { User } from '@/interfaces/IUser';
import { ref, computed } from 'vue';

export const userAuthStore = defineStore('auth', () => {
    // user é um objeto reativo que armazena o usuário autenticado
    // reativo para o tipo User ou null
    const user = ref<User | null>(null);

    // indica se a autenticação está em andamento
    const isLoading = ref(false);

    // indica se ouve um erro
    const error = ref<string | null>(null);

    // Verificar se o usuário está autenticado
    const isAuthenticated = computed(() => !!user.value);

    // Verificar tipo de usuário
    // user.value? é uma verificação de segurança para garantir que user.value não seja null antes de acessar a propriedade tipo
    const userType = computed(() => user.value?.tipo || null);

    // Iniciar store com dados da localStorage
    function init() {
        const userData = authService.getUserData();
        if (userData) {
            user.value = userData;
        }
    }

    // Login de passageiro
    async function loginPassageiro(email: string, senha: string) {
        isLoading.value = true;
        error.value = null;

        try {
            const resposta = await authService.loginPassageiro(email, senha);
            user.value = {
                ...resposta,
                tipo: 'passageiro',
            };
            return resposta;
        } catch (err: any) {
            error.value = err.reposta?.data?.message || 'Erro ao fazer login';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Login de motorista
    async function loginMotorista(email: string, senha: string) {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await authService.loginMotorista(email, senha);
            user.value = {
                ...response,
                tipo: 'motorista'
            };
            return response;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Erro ao fazer login';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    function logout() {
        authService.logout();
        user.value = null;
    }

    return {
        user,
        isLoading,
        error,
        isAuthenticated,
        userType,
        init,
        loginPassageiro,
        loginMotorista,
        logout
    }
})