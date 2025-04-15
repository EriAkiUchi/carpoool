import MapsController from "../controller/MapsController.js";
import admin from 'firebase-admin';

class Viagem {
    constructor(nomeEmpresa, enderecoDestino, vagasRestantes, horarioDeSaida, rotaDeViagem = null) {
        if(!nomeEmpresa || !enderecoDestino || !vagasRestantes || !horarioDeSaida) {
            for (const [key, value] of Object.entries({nomeEmpresa, enderecoDestino, vagasRestantes, horarioDeSaida})) {
                if(!value) {
                    throw new Error(`O campo ${key} é obrigatório`);
                }
            }
        }
        this.nomeEmpresa = nomeEmpresa;
        this.enderecoDestino = {
            logradouro: enderecoDestino.logradouro,
            numero: enderecoDestino.numero,
            bairro: enderecoDestino.bairro,
            cidade: enderecoDestino.cidade,
        };
        this.vagasRestantes = vagasRestantes;
        this.horarioDeSaida = this.processarHorarioDeSaida(horarioDeSaida); // Converte para o formato Date do Firestore
        this.rotaDeViagem = rotaDeViagem; // id de uma rota de viagem ou null
    }

    processarHorarioDeSaida(horarioDeSaida) {
        try {
            // Verificar se é no formato de horário HH:MM
            if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horarioDeSaida)) {
                throw new Error("Formato de horário inválido. Use HH:MM (24h).");
            }
        
        } catch (error) {
            console.error("Erro ao processar horário:", error);
        }
        return horarioDeSaida;
    }

    // Método para converter um objeto Anuncio para um documento que será salvo no Firestore
    // para garantir que o objeto seja salvo corretamente no Firestore
    toFirestore() {
        return {
            nomeEmpresa: this.nomeEmpresa,
            enderecoDestino: {
                logradouro: this.enderecoDestino.logradouro,
                numero: this.enderecoDestino.numero,
                bairro: this.enderecoDestino.bairro,
                cidade: this.enderecoDestino.cidade,
            },
            vagasRestantes: this.vagasRestantes,
            horarioDeSaida: this.horarioDeSaida,
            rotaDeViagem: this.rotaDeViagem, // id de uma rota de viagem ou null
        };
    }

    // Método para converter um documento do Firestore para um objeto Anuncio
    // para garantir que o objeto seja recuperado corretamente do Firestore
    static fromFirestore(snapshot) {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            nomeEmpresa: data.nomeEmpresa,
            enderecoDestino: {
                logradouro: data.enderecoDestino.logradouro,
                numero: data.enderecoDestino.numero,
                bairro: data.enderecoDestino.bairro,
                cidade: data.enderecoDestino.cidade,
            },
            vagasRestantes: data.vagasRestantes,
            horarioDeSaida: data.horarioDeSaida,
            rotaDeViagem: data.rotaDeViagem, // id de uma rota de viagem ou null
        }
    }
}

export default Viagem;