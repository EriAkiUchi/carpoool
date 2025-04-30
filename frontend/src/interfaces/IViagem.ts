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

interface Carro {
  modelo: string;
  marca: string;
}

export default interface Viagem {
  id: string;
  motoristaId: string;
  nomeMotorista?: string;
  nomeEmpresa: string;
  passageirosIds: string[];
  enderecoDestino: Endereco;
  rotaDeViagem: string;
  status: string;
  horarioDeSaida: string;
  vagasRestantes: number;
  carro: Carro;
}