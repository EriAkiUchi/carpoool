import admin from 'firebase-admin';

class Passageiro {
    constructor(id, nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero) {
        if(!nome || !email || !senha || !enderecoOrigem || !enderecoDestino || !dataNascimento) {
            for (const [key, value] of Object.entries({nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento})) {
                if(!value) {
                    throw new Error(`O campo ${key} é obrigatório`);
                }
            }
        }
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.enderecoOrigem = enderecoOrigem;
        this.enderecoDestino = enderecoDestino;
        this.dataNascimento = dataNascimento;
        this.genero = genero;        
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
            dataNascimento: data.dataNascimento,
            genero: data.genero
        }
    }
}

export default Passageiro;