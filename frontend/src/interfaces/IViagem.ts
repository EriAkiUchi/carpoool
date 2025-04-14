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
  passageirosIds: string[];
  destinoComum: Endereco;
  rotas: Rota[];
  rotaFinal: any;
  dataCriacao: {
    seconds: number;
    nanoseconds: number;
  };
  status: string;
  formattedDate?: string; // Para apresentação no front
}