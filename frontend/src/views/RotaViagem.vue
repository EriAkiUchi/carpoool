<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { userAuthStore } from '@/store/auth';
import viagemService from '@/services/viagemService';
import mapaRotaService from '@/services/mapaRotaService';
import type Viagem from '@/interfaces/IViagem';
import passageiroService from '@/services/passageiroService';

// Interfaces para tipar os dados
interface LatLng {
  lat: number;
  lng: number;
}

interface PolylineOptions {
  strokeColor: string;
  strokeWeight: number;
  strokeOpacity: number;
  zIndex: number;
}

// Interface ajustada para usar path decodificado
interface RotaPassageiro {
  path: LatLng[]; // Alterado de string para LatLng[]
  options: PolylineOptions;
  passageiroId: string;
}

interface PointMarker {
  position: LatLng;
  title: string;
  type: 'embarque' | 'destino' | 'inicio';
  key: string; // Adicionado para garantir chave única no v-for
}

const route = useRoute();
const router = useRouter();
const authStore = userAuthStore();
const viagem = ref<Viagem | null>(null);
const passageirosDetalhados = ref<{ id: string; nome: string }[]>([]);
const rota = ref<any | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const viagemId = route.params.id as string;
const mapRef = ref<google.maps.Map | null>(null);
const mapContainer = ref<HTMLDivElement | null>(null);

// Centro do mapa (inicialmente São Paulo)
const center = ref<LatLng>({
  lat: -23.550520, 
  lng: -46.633308
});

// Carregar detalhes da viagem
async function carregarViagem() {
  if (!viagemId) return;
  
  try {
    isLoading.value = true;
    error.value = null;
    
    // Buscar viagem pelo ID
    const viagemData = await viagemService.getById(viagemId);
    viagem.value = viagemData;
    
    // se vier só array de strings/id, buscamos o nome de cada um
  if (Array.isArray(viagemData.passageirosIds) && typeof viagemData.passageirosIds[0] === 'string') {
    passageirosDetalhados.value = await Promise.all(
      (viagemData.passageirosIds as string[]).map(id =>
        passageiroService.getById(id).then(res => ({ id: res.data.id, nome: res.data.nome }))
      )
    );
  } else {
    // caso já venha array de objetos { id, nome }
    passageirosDetalhados.value = viagemData.passageirosIds as any;
  }

    // Se a viagem tem um ID de rota, buscar a rota
    if (viagem.value && viagem.value.rotaDeViagem) {
      const rotaData = await mapaRotaService.getRotaById(viagem.value.rotaDeViagem);
      rota.value = rotaData;
      
      // Ajustar o centro do mapa para o primeiro ponto da rota
      if (rota.value?.rotas?.[0]?.rota?.legs?.[0]?.start_location) {
        const startLoc = rota.value.rotas[0].rota.legs[0].start_location;
        center.value = {
          lat: parseFloat(startLoc.lat),
          lng: parseFloat(startLoc.lng)
        };
      }
    }
    
  } catch (err) {
    console.error('Erro ao carregar detalhes da viagem:', err);
    error.value = 'Erro ao carregar detalhes da viagem. Tente novamente mais tarde.';
  } finally {
    isLoading.value = false;
  }
}

// Helper to decode using Google Maps geometry library
function decodePath(encoded: string): LatLng[] {
  if (typeof google === 'undefined' || !google.maps.geometry) return [];
  const path = google.maps.geometry.encoding.decodePath(encoded);
  return path.map((pt: google.maps.LatLng) => ({ lat: pt.lat(), lng: pt.lng() }));
}

// Preparar polylines para rotas dos passageiros (com decodePath)
const rotasPassageiros = computed<RotaPassageiro[]>(() => {
  const result: RotaPassageiro[] = [];
  if (!rota.value?.rotas) return result;

  for (const rotaItem of rota.value.rotas) {
    const legs = rotaItem.rota?.legs?.[0];
    if (legs?.steps && Array.isArray(legs.steps)) {
      const decodedPath: LatLng[] = [];
      for (const step of legs.steps) {
        if (step.polyline?.points) {
          decodedPath.push(...decodePath(step.polyline.points));
        }
      }
      if (decodedPath.length) {
        result.push({ path: decodedPath, options: { strokeColor: '#e90000', strokeWeight: 5, strokeOpacity: 0.8, zIndex: 3 }, passageiroId: rotaItem.passageiroId });
      }
    }
  }
  return result;
});

// Preparar polyline para a rota final (com decodePath)
const rotaFinal = computed<{ path: LatLng[]; options: PolylineOptions } | null>(() => {
  const encoded = rota.value?.rotaFinal?.overview_polyline?.points;
  if (!encoded) return null;
  const decodedPath = decodePath(encoded);
  if (!decodedPath.length) return null;
  return { path: decodedPath, options: { strokeColor: '#2ecc71', strokeWeight: 6, strokeOpacity: 0.9, zIndex: 2 } };
});

// Preparar marcadores para os pontos de embarque e destino
const marcadores = computed<PointMarker[]>(() => {
  const result: PointMarker[] = [];
  let markerKeyCounter = 0; // Para garantir chaves únicas

  // Adicionar marcadores de embarque e desembarque de cada passageiro
  if (rota.value?.rotas) {

    //Marcador de início da rota
    if (rota.value.rotas[0]?.rota?.legs?.[0]?.start_location) {
      const startLoc = rota.value.rotas[0].rota.legs[0].start_location;
      const lat = parseFloat(startLoc.lat);
      const lng = parseFloat(startLoc.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        result.push({ position: { lat, lng }, title: 'Início da rota', type: 'inicio', key: `marker-${markerKeyCounter++}` });
      }
    }

    for (const [index, rotaItem] of rota.value.rotas.entries()) {
      const leg = rotaItem.rota?.legs?.[0];
      // Marcador de embarque
      if (leg?.end_location) {
        const loc = rotaItem.rota.legs[0].end_location;
        const lat = parseFloat(loc.lat);
        const lng = parseFloat(loc.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          result.push({ position: { lat, lng }, title: `Embarque ${index+1}: ${'Passageiro'}`, type: 'embarque', key: `marker-${markerKeyCounter++}` });
        }
      }
      // Marcador de destino do passageiro
      // if (leg?.end_location) {
      //   const endLoc = leg.end_location;
      //   const lat2 = parseFloat(endLoc.lat);
      //   const lng2 = parseFloat(endLoc.lng);
      //   if (!isNaN(lat2) && !isNaN(lng2)) {
      //     result.push({ position: { lat: lat2, lng: lng2 }, title: `Embarque ${index}: ${'Passageiro'}`, type: 'destino', key: `marker-${markerKeyCounter++}` });
      //   }
      // }
    }
  }
  
  // Adicionar marcador de destino final (rotaFinal)
  if (rota.value?.rotaFinal?.legs?.[0]?.end_location) {
    const endLoc = rota.value.rotaFinal.legs[0].end_location;
    const latf = parseFloat(endLoc.lat);
    const lngf = parseFloat(endLoc.lng);
    if (!isNaN(latf) && !isNaN(lngf)) {
      result.push({ position: { lat: latf, lng: lngf }, title: 'Destino final', type: 'destino', key: `marker-${markerKeyCounter++}` });
    }
  }
  
  return result;
});

// Initialize the map and add all overlays (polylines and markers)
async function initMap() {
  if (!mapContainer.value) return;
  // Load Google Maps script with geometry library if needed
  if (typeof google === 'undefined' || !google.maps.geometry) {
    const loader = new (await import('@googlemaps/js-api-loader')).Loader({
      apiKey: googleMapsApiKey,
      libraries: ['geometry']
    });
    await loader.load();
  }
  mapRef.value = new google.maps.Map(mapContainer.value, {
    center: center.value,
    zoom: 12,
    mapId: mapId
  });
  // Fit bounds
  const bounds = new google.maps.LatLngBounds();
  // Add passenger routes
  for (const rotaP of rotasPassageiros.value) {
    const poly = new google.maps.Polyline({
      path: rotaP.path,
      strokeColor: rotaP.options.strokeColor,
      strokeWeight: rotaP.options.strokeWeight,
      strokeOpacity: rotaP.options.strokeOpacity,
      zIndex: rotaP.options.zIndex,
      map: mapRef.value
    });
    rotaP.path.forEach(pt => bounds.extend(pt));
  }
  // Add final route
  if (rotaFinal.value) {
    new google.maps.Polyline({
      path: rotaFinal.value.path,
      strokeColor: rotaFinal.value.options.strokeColor,
      strokeWeight: rotaFinal.value.options.strokeWeight,
      strokeOpacity: rotaFinal.value.options.strokeOpacity,
      zIndex: rotaFinal.value.options.zIndex,
      map: mapRef.value
    });
    rotaFinal.value.path.forEach(pt => bounds.extend(pt));
  }
  // Add markers
  for (const mk of marcadores.value) {
    let text: string = '';
    if(mk.type === 'embarque') {
      text = 'E';
    } else if(mk.type === 'destino') {
      text = 'D';
    } else if(mk.type === 'inicio') {
      text = 'I';
    }
    new google.maps.Marker({
      position: mk.position,
      title: mk.title,
      map: mapRef.value,
      label: { text: text, color: 'white', fontWeight: 'bold' },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: mk.type === 'embarque' ? '#3498db' : '#e74c3c',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#fff'
      }
    });
    bounds.extend(mk.position);
  }
  mapRef.value.fitBounds(bounds);
}

onMounted(async () => {
  // Verificar autenticação
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  await carregarViagem();
  await initMap();
});

// API Key and Map ID from env
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const mapId = import.meta.env.VITE_MAP_ID;
</script>

<template>
  <main class="viagem-detalhe-container">
    <h2 class="detalhe-titulo">Detalhes da Viagem</h2>
    
    <div v-if="isLoading" class="loading">
      Carregando detalhes da viagem...
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="carregarViagem" class="retry-button">Tentar novamente</button>
    </div>
    
    <div v-else-if="!viagem" class="empty-state">
      <p>Viagem não encontrada.</p>
      <router-link to="/motorista/viagens" class="btn-voltar">Voltar às viagens</router-link>
    </div>
    
    <div v-else class="viagem-detalhe-content">
      <div class="viagem-info-card">
        <h3>{{ viagem.nomeEmpresa }}</h3>
        <div class="status-badge" :class="viagem.status">
          {{ viagem.status }}
        </div>
        
        <div class="info-section">
          <h3>Informações da Viagem</h3>
          <p><strong>Horário de saída:</strong> {{ viagem.horarioDeSaida }}</p>
          <p><strong>Status:</strong> {{ viagem.status }}</p>
          <p><strong>Vagas restantes:</strong> {{ viagem.vagasRestantes }}</p>
          
          <h3>Destino</h3>
          <p v-if="viagem.enderecoDestino">
            {{ viagem.enderecoDestino.logradouro }}, 
            {{ viagem.enderecoDestino.numero }} - 
            {{ viagem.enderecoDestino.bairro }}, 
            {{ viagem.enderecoDestino.cidade }}
          </p>
          <p v-else>Endereço não disponível</p>
          
          <h3>Passageiros</h3>
          <ul v-if="passageirosDetalhados.length">
            <li v-for="passageiro in passageirosDetalhados" :key="passageiro.id">
              {{ passageiro.nome }}
            </li>
          </ul>
          <p v-else>Nenhum passageiro nesta viagem.</p>
        </div>
      </div>
      
      <div class="mapa-container">
        <h3>Rota da viagem</h3>
        <div v-if="rota && googleMapsApiKey">
          <!-- Container para Google Maps -->
          <div ref="mapContainer" class="google-map"></div>
        </div>
        <p v-else-if="!googleMapsApiKey" class="no-route-message">
          Chave da API do Google Maps não configurada. Verifique o arquivo .env.
        </p>
        <p v-else class="no-route-message">
          Não há rota definida ou ocorreu um erro ao carregar a rota para esta viagem.
        </p>
      </div>
      
      <div class="botoes-acoes">
        <router-link :to="`/${authStore.user?.tipo}/viagens`" class="btn-voltar">
          Voltar às viagens
        </router-link>
      </div>
    </div>
  </main>
</template>

<style scoped>
.viagem-detalhe-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.detalhe-titulo {
  font-size: 1.75rem;
  color: #336699;
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading, .error-message, .empty-state {
  text-align: center;
  padding: 2rem 0;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.error-message {
  color: #e74c3c;
  border-left: 4px solid #e74c3c;
  padding-left: 1rem;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #2980b9;
}

.viagem-detalhe-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.viagem-info-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.viagem-info-card h3 {
  font-size: 1.4rem;
  color: #336699;
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.status-badge {
  align-self: flex-start;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.status-badge.em-andamento {
  background-color: #3498db;
  color: white;
}

.status-badge.finalizada {
  background-color: #2ecc71;
  color: white;
}

.status-badge.cancelada {
  background-color: #e74c3c;
  color: white;
}

.info-section {
  margin-top: 1rem;
}

.info-section h3 {
  color: #336699;
  margin: 1.5rem 0 0.5rem;
  border-bottom: 1px solid #c3c3c3;
  padding-bottom: 0.5rem;
}

.info-section p {
  color: #336699;
  margin: 0.5rem 0;
  line-height: 1.5;
}

.info-section ul {
  color: #336699;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.info-section li {
  color: #336699;
  margin-bottom: 0.25rem;
}

.mapa-container {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mapa-container h3 {
  color: #336699;
  margin-top: 0;
  margin-bottom: 1rem;
}

.google-map {
  height: 500px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.no-route-message {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.botoes-acoes {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.btn-voltar {
  padding: 0.75rem 1.5rem;
  background-color: #336699;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
  transition: background-color 0.3s;
  display: inline-block;
}

.btn-voltar:hover {
  background-color: #264d73;
}
</style>