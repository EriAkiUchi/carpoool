// Interfaces para tipar os dados
export interface LatLng {
    lat: number;
    lng: number;
}

export interface PolylineOptions {
    strokeColor: string;
    strokeWeight: number;
    strokeOpacity: number;
    zIndex: number;
}

// Interface ajustada para usar path decodificado
export interface RotaPassageiro {
    path: LatLng[]; // Alterado de string para LatLng[]
    options: PolylineOptions;
    passageiroId: string;
}

export interface PointMarker {
    position: LatLng;
    title: string;
    type: 'embarque' | 'destino' | 'inicio';
    key: string; // Adicionado para garantir chave única no v-for
}