import type { Endereco } from "./IEndereco";

export interface Passageiro {
    id?: string;
    nome: string;
    email: string;
    senha?: string;
    enderecoOrigem: Endereco;
    enderecoDestino: Endereco;
    dataNascimento: string;
    genero?: string;
}