class Carro {
    constructor(nomeModelo, marca, placa, cor) {
        if(!nomeModelo || !marca || !placa || !cor) {
            for (const [key, value] of Object.entries({nomeModelo, marca, placa, cor})) {
                if(!value) {
                    throw new Error(`O campo ${key} é obrigatório`);
                }
            }
        }
        this.nomeModelo = nomeModelo;
        this.marca = marca;
        this.placa = placa;
        this.cor = cor;
    }

    // Método para converter um objeto Carro para um documento que será salvo no Firestore
    // para garantir que o objeto seja salvo corretamente no Firestore
    toFirestore() {
        return {
            nomeModelo: this.nomeModelo,
            marca: this.marca,
            placa: this.placa,
            cor: this.cor
        };
    }

    // Método para converter um documento do Firestore para um objeto Carro
    // para garantir que o objeto seja recuperado corretamente do Firestore
    static fromFirestore(snapshot) {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            nomeModelo: data.nomeModelo,
            marca: data.marca,
            placa: data.placa,
            cor: data.cor
        }
    }
}

export default Carro;