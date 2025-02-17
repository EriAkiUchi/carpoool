import admin from 'firebase-admin';

class Passageiro {
    constructor(nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero) {
        if(!nome || !email || !senha || !enderecoOrigem || !enderecoDestino || !dataNascimento) {
            for (const [key, value] of Object.entries({nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento})) {
                if(!value) {
                    throw new Error(`O campo ${key} é obrigatório`);
                }
            }
        }
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.enderecoOrigem = enderecoOrigem;
        this.enderecoDestino = enderecoDestino;
        this.genero = genero;        

        // Se a data de nascimento for passada, converte para um objeto Timestamp
        this.dataNascimento = dataNascimento ? admin.firestore.Timestamp.fromDate(new Date(dataNascimento)) : admin.firestore.Timestamp.now();
    }

    // Método para converter um objeto Passageiro para um documento que será salvo no Firestore
    toFirestore() {
        return {
            nome: this.nome,
            email: this.email,
            senha: this.senha,
            enderecoOrigem: this.enderecoOrigem,
            enderecoDestino: this.enderecoDestino,
            dataNascimento: this.dataNascimento,
            genero: this.genero
        };
    }

    //
    static fromFirestore(snapshot) {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            nome: data.nome,
            email: data.email,
            senha: data.senha,
            enderecoOrigem: data.enderecoOrigem,
            enderecoDestino: data.enderecoDestino,
            genero: data.genero,

            // Convertendo o Timestamp para um objeto Date
            dataNascimento: data.dataNascimento.toDate().toLocaleDateString('pt-BR')
        }
    }
}

export default Passageiro;