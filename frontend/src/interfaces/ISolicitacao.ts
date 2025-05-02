import type { Endereco } from "./IViagem";

export interface Solicitacao {
    id: string;
    idPassageiro: string;
    idViagem: string;
    nomeEmpresa: string;
    nomePassageiro: string;
    enderecoOrigem: Endereco;
    genero: string;
}