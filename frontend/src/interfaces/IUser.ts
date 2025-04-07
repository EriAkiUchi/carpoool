// Tipo para usuário autenticado
export interface User {
    id: string;
    nome: string;
    email: string;
    tipo: 'passageiro' | 'motorista';
}