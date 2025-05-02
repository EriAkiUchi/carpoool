import admin from 'firebase-admin';

class Solicitacao {
    constructor(nomeEmpresa, nomePassageiro, enderecoOrigem, genero)  {
        if(!nomeEmpresa || !nomePassageiro || !enderecoOrigem || !genero) {
            throw new Error('Todos os campos são obrigatórios!');
        }
        this.nomeEmpresa = nomeEmpresa;
        this.nomePassageiro = nomePassageiro;
        this.enderecoOrigem = {
            logradouro: enderecoOrigem.logradouro,
            numero: enderecoOrigem.numero,
            bairro: enderecoOrigem.bairro,
            cidade: enderecoOrigem.cidade,
        };
        this.genero = genero;
    }


    toFirestore() {
        return {
            nomeEmpresa: this.nomeEmpresa,
            nomePassageiro: this.nomePassageiro,
            enderecoOrigem: {
                logradouro: this.enderecoOrigem.logradouro,
                numero: this.enderecoOrigem.numero,
                bairro: this.enderecoOrigem.bairro,
                cidade: this.enderecoOrigem.cidade,
            },
            genero: this.genero,
        };
    }

    static fromFirestore(snapshot) {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            nomeEmpresa: data.nomeEmpresa,
            nomePassageiro: data.nomePassageiro,
            enderecoOrigem: {
                logradouro: data.enderecoOrigem.logradouro,
                numero: data.enderecoOrigem.numero,
                bairro: data.enderecoOrigem.bairro,
                cidade: data.enderecoOrigem.cidade,
            },
            genero: data.genero,
        };
    }
}

export default Solicitacao;