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

interface Passageiros {
  id: string;
  nome: string;
}

export default interface Viagem {
  id: string;
  motoristaId: string;
  motoristaNome?: string;
  nomeEmpresa: string;
  passageirosIds: Passageiros[];
  enderecoDestino: Endereco;
  rotaDeViagem: string;
  status: string;
  horarioDeSaida: string;
  vagasRestantes: number;
}