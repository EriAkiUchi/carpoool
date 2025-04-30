import type { Carro } from "./ICarro";
import type { Endereco } from "./IEndereco";

export interface Motorista {
    id: string;
    nome: string;
    email: string;
    senha?: string;
    enderecoOrigem: Endereco;
    enderecoDestino: Endereco;
    dataNascimento: string;
    genero?: string;
    carro: Carro;
}