import admin from 'firebase-admin';

class MapaDeRota {
    constructor(rotas, rotaFinal){
        this.rotas = [...rotas];
        this.rotaFinal = {...rotaFinal};
    }

    toFirestore() {
        return {
            rotas: this.rotas,
            rotaFinal: this.rotaFinal,
        };
    }

    static fromFirestore(snapshot) {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            rotas: data.rotas,
            rotaFinal: data.rotaFinal,
        }
    }
}

export default MapaDeRota;