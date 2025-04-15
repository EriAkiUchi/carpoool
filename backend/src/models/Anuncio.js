import MapsController from "../controller/MapsController.js";
import admin from 'firebase-admin';

class Anuncio {
    constructor(nomeEmpresa, enderecoDestino, vagasRestantes, horarioDeSaida) {
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
    }

    processarHorarioDeSaida(horarioDeSaida) {
         // Caso já seja instância de Date (do controller)
        if (horarioDeSaida instanceof Date) {
            return admin.firestore.Timestamp.fromDate(horarioDeSaida);
        }
        
        // Caso seja uma string no formato "HH:MM" (formato 24h)
        else if (typeof horarioDeSaida === 'string') {
            // Verificar se é no formato de horário HH:MM
            if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horarioDeSaida)) {
                const [hours, minutes] = horarioDeSaida.split(':').map(Number);
                
                // Criar uma data para hoje com o horário especificado
                const date = new Date();
                date.setHours(hours, minutes, 0, 0);
                
                return admin.firestore.Timestamp.fromDate(date);
            }
            
            // Se for outro formato de data/hora (como DD/MM/YYYY)
            try {
                // Tenta converter a string para um objeto Date
                const date = new Date(horarioDeSaida);
                if (!isNaN(date.getTime())) {
                    return admin.firestore.Timestamp.fromDate(date);
                }
            } catch (error) {
                console.error("Erro ao processar horário:", error);
            }
        }
    
        // Caso não seja uma data válida, retorna a data atual
        return admin.firestore.Timestamp.now();
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
            horarioDeSaida: data.horarioDeSaida ? data.horarioDeSaida.toDate() : null
        }
    }
}

export default Anuncio;