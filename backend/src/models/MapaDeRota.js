import admin from 'firebase-admin';

class MapaDeRota {
    constructor(motoristaId, passageirosIds, destinoComum, rotas, rotaFinal, dataCriacao, status){
        this.motoristaId = motoristaId;
        this.passageirosIds = passageirosIds;
        this.destinoComum = {
            logradouro: destinoComum.logradouro,
            numero: destinoComum.numero,
            bairro: destinoComum.bairro,
            cidade: destinoComum.cidade,
        };
        this.rotas = [...rotas];
        this.rotaFinal = {...rotaFinal};
        this.dataCriacao = admin.firestore.Timestamp.fromDate(dataCriacao);
        this.status = status;
    }

    toFirestore() {
        return {
            motoristaId: this.motoristaId,
            passageirosIds: this.passageirosIds,
            destinoComum: this.destinoComum,
            rotas: this.rotas,
            rotaFinal: this.rotaFinal,
            dataCriacao: this.dataCriacao,
            status: this.status
        };
    }

    static fromFirestore(snapshot) {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            motoristaId: data.motoristaId,
            passageirosIds: data.passageirosIds,
            destinoComum: data.destinoComum,
            rotas: data.rotas,
            rotaFinal: data.rotaFinal,
            dataCriacao: data.dataCriacao,
            statu: data.status
        }
        ;
    }
}

export default MapaDeRota;