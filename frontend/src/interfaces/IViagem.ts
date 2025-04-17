export interface Endereco {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
}

export interface Rota {
  passageiroId: string;
  rota: any; // Objeto de rota do Google Maps
}

export default interface Viagem {
  id: string;
  motoristaId: string;
  motoristaNome?: string;
  nomeEmpresa: string;
  passageirosIds: string[];
  destinoComum: Endereco;
  rotas: string;
  status: string;
  horarioDeSaida: string;
}