import admin from 'firebase-admin';

class Solicitacao {
    constructor(idPassageiro, idViagem, nomeEmpresa, nomePassageiro, enderecoOrigem, genero)  {
        if(!idPassageiro || !idViagem || !nomeEmpresa || !nomePassageiro || !enderecoOrigem || !genero) {
            throw new Error('Todos os campos são obrigatórios!');
        }
        this.idPassageiro = idPassageiro;
        this.idViagem = idViagem;
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
            idPassageiro: this.idPassageiro,
            idViagem: this.idViagem,
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
            idPassageiro: data.idPassageiro,
            idViagem: data.idViagem,
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