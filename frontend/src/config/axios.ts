import axios from 'axios';

//criando uma instância do axios com a URL base
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // URL base da API
    headers: {
        'Content-Type': 'application/json',
    },
});

// Adicionando um interceptor para adicionar o token de autenticação em todas as requisições
// (se existir) antes de enviá-las
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;