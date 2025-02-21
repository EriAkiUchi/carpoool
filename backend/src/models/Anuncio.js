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
        this.enderecoDestino = enderecoDestino;
        this.vagasRestantes = vagasRestantes;

        //TODO: determinar qual formato de data e hora devo usar
        //date? string?
        this.horarioDeSaida = horarioDeSaida; 
    }

    // Método para converter um objeto Anuncio para um documento que será salvo no Firestore
    // para garantir que o objeto seja salvo corretamente no Firestore
    toFirestore() {
        return {
            nomeEmpresa: this.nomeEmpresa,
            enderecoDestino: this.enderecoDestino,
            vagasRestantes: this.vagasRestantes,
            horarioDeSaida: this.horarioDeSaida
        };
    }

    // Método para converter um documento do Firestore para um objeto Anuncio
    // para garantir que o objeto seja recuperado corretamente do Firestore
    static fromFirestore(snapshot) {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            nomeEmpresa: data.nomeEmpresa,
            enderecoDestino: data.enderecoDestino,
            vagasRestantes: data.vagasRestantes,


            horarioDeSaida: data.horarioDeSaida
        }
    }
}

export default Anuncio;