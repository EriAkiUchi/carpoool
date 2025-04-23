<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { userAuthStore } from '@/store/auth';
import viagemService from '@/services/viagemService';
import mapaRotaService from '@/services/mapaRotaService';
import type Viagem from '@/interfaces/IViagem';
import { GoogleMap, Polyline, AdvancedMarker } from 'vue3-google-map';

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

interface RotaPassageiro {
  path: string;
  options: PolylineOptions;
  passageiroId: string;
}

interface PointMarker {
  position: LatLng;
  title: string;
  type: 'embarque' | 'destino';
}

const route = useRoute();
const router = useRouter();
const authStore = userAuthStore();
const viagem = ref<Viagem | null>(null);
const rota = ref<any | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const viagemId = route.params.id as string;
const mapRef = ref<google.maps.Map | null>(null);

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

// Preparar polylines para rotas dos passageiros
const rotasPassageiros = computed<RotaPassageiro[]>(() => {
  const result: RotaPassageiro[] = [];
  
  if (!rota.value?.rotas) return result;
  
  for (const rotaItem of rota.value.rotas) {
    if (rotaItem.rota?.overview_polyline?.points) {
      try {
        result.push({
          path: rotaItem.rota.overview_polyline.points,
          options: {
            strokeColor: '#3498db',
            strokeWeight: 5,
            strokeOpacity: 0.8,
            zIndex: 3
          },
          passageiroId: rotaItem.passageiroId
        });
      } catch (err) {
        console.error('Erro ao processar rota:', err);
      }
    }
  }
  return result;
});

// Preparar polyline para a rota final
const rotaFinal = computed(() => {
  if (!rota.value?.rotaFinal?.overview_polyline?.points) return null;
  
  return {
    path: rota.value.rotaFinal.overview_polyline.points,
    options: {
      strokeColor: '#2ecc71',
      strokeWeight: 6,
      strokeOpacity: 0.9,
      zIndex: 2
    }
  };
});

// Preparar marcadores para os pontos de embarque e destino
const marcadores = computed<PointMarker[]>(() => {
  const result: PointMarker[] = [];
  
  // Adicionar marcadores de embarque
  if (rota.value?.rotas) {
    for (const rotaItem of rota.value.rotas) {
      if (rotaItem.rota?.legs?.[0]?.start_location) {
        const loc = rotaItem.rota.legs[0].start_location;
        result.push({
          position: {
            lat: parseFloat(loc.lat),
            lng: parseFloat(loc.lng)
          },
          title: `Local de embarque de ${rotaItem.passageiroNome || 'passageiro'}`,
          type: 'embarque'
        });
      }
    }
  }
  
  // Adicionar marcador de destino final
  if (rota.value?.rotaFinal?.legs?.[0]?.end_location) {
    const endLoc = rota.value.rotaFinal.legs[0].end_location;
    result.push({
      position: {
        lat: parseFloat(endLoc.lat),
        lng: parseFloat(endLoc.lng)
      },
      title: 'Destino final',
      type: 'destino'
    });
  }
  
  return result;
});

// Manipulador para quando o mapa for carregado
function onMapLoad(map: google.maps.Map) {
  mapRef.value = map;
  
  // Ajustar viewport para mostrar todas as rotas e marcadores
  if (marcadores.value.length > 0) {
    const bounds = new google.maps.LatLngBounds();
    for (const marker of marcadores.value) {
      bounds.extend(marker.position);
    }
    map.fitBounds(bounds);
  }
}

onMounted(async () => {
  // Verificar autenticação
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  await carregarViagem();
});

// API Key (idealmente deve vir do arquivo .env)
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
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
          <h4>Informações da Viagem</h4>
          <p><strong>Horário de saída:</strong> {{ viagem.horarioDeSaida }}</p>
          <p><strong>Status:</strong> {{ viagem.status }}</p>
          <p><strong>Vagas restantes:</strong> {{ viagem.vagasRestantes }}</p>
          
          <h4>Destino</h4>
          <p v-if="viagem.enderecoDestino">
            {{ viagem.enderecoDestino.logradouro }}, 
            {{ viagem.enderecoDestino.numero }} - 
            {{ viagem.enderecoDestino.bairro }}, 
            {{ viagem.enderecoDestino.cidade }}
          </p>
          <p v-else>Endereço não disponível</p>
          
          <h4>Passageiros</h4>
          <ul v-if="viagem.passageirosIds && viagem.passageirosIds.length">
            <li v-for="passageiro in viagem.passageirosIds" :key="passageiro.id">
              {{ passageiro.nome }}
            </li>
          </ul>
          <p v-else>Nenhum passageiro nesta viagem.</p>
        </div>
      </div>
      
      <div class="mapa-container">
        <h4>Rota da viagem</h4>
        <div v-if="rota && googleMapsApiKey">
          <GoogleMap
            :api-key="googleMapsApiKey"
            :center="center"
            :zoom="12"
            map-id=import.meta.env.MAP_ID            
            class="google-map"
            @load="onMapLoad"
          >
            <!-- Polylines para rotas dos passageiros -->
            <Polyline
              v-for="(rotaPassageiro, idx) in rotasPassageiros"
              :key="`rota-passageiro-${idx}`"
              :path="rotaPassageiro.path"
              :options="rotaPassageiro.options"
              :encoded="true"
            />
            
            <!-- Polyline para rota final -->
            <Polyline
              v-if="rotaFinal"
              :path="rotaFinal.path"
              :options="rotaFinal.options"
              :encoded="true"
            />
            
            <!-- Marcadores com AdvancedMarker -->
            <AdvancedMarker
              v-for="(marker) in marcadores" 
              :options="{ position: marker.position, title: marker.title }"
            >
              <template #default>
                <div>
                  {{ marker.type === 'embarque' ? 'P' : 'D' }}
                </div>
              </template>
            </AdvancedMarker>
          </GoogleMap>
        </div>
        <p v-else-if="!googleMapsApiKey" class="no-route-message">
          Chave da API do Google Maps não configurada.
        </p>
        <p v-else class="no-route-message">
          Não há rota definida para esta viagem.
        </p>
      </div>
      
      <div class="botoes-acoes">
        <router-link to="/motorista/viagens" class="btn-voltar">
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

.info-section h4 {
  color: #336699;
  margin: 1.5rem 0 0.5rem;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 0.5rem;
}

.info-section p {
  margin: 0.5rem 0;
  line-height: 1.5;
}

.info-section ul {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.info-section li {
  margin-bottom: 0.25rem;
}

.mapa-container {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mapa-container h4 {
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

/* Marcadores personalizados */
.custom-marker {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 2px solid white;
}

.marker-embarque {
  background-color: #3498db;
  width: 28px;
  height: 28px;
  font-size: 14px;
}

.marker-destino {
  background-color: #2ecc71;
  width: 32px;
  height: 32px;
  font-size: 16px;
}

/* Responsividade para telas menores */
@media (max-width: 768px) {
  .viagem-detalhe-container {
    padding: 1rem;
  }
  
  .google-map {
    height: 350px;
  }
}
</style>