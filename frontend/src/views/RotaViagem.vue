<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { userAuthStore } from '@/store/auth';
import viagemService from '@/services/viagemService';
import mapaRotaService from '@/services/mapaRotaService';
import type Viagem from '@/interfaces/IViagem';
import { GoogleMap, Polyline, AdvancedMarker } from 'vue3-google-map';

// Define Library enum manually since it's not exported
enum Library {
  PLACES = 'places',
  GEOMETRY = 'geometry',
  MARKER = 'marker'
}

const route = useRoute();
const router = useRouter();
const authStore = userAuthStore();
const viagem = ref<Viagem | null>(null);
const rota = ref<any | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const viagemId = route.params.id as string;
const mapInstance = ref<google.maps.Map | null>(null);
const markersArray = ref([]);

// Centro do mapa (inicialmente São Paulo)
const center = ref({
    lat: -23.550520, 
    lng: -46.633308
});

// Adicionar logs para debug
function logMapData() {
    console.log('---- DEBUG DA ROTA ----');
    console.log('Viagem:', viagem.value);
    console.log('Rota completa:', rota.value);
    console.log('Rotas de passageiros computadas:', rotasPassageiros.value);
    console.log('Rota final computada:', rotaFinal.value);
    console.log('Marcadores:', marcadoresEmbarque.value);
    console.log('Marcador destino:', marcadorDestino.value);
}

// Carregar detalhes da viagem
async function carregarViagem() {
    if (!viagemId) return;
    
    try {
        isLoading.value = true;
        error.value = null;
        
        // Buscar viagem pelo ID
        const viagemData = await viagemService.getById(viagemId);
        viagem.value = viagemData;
        console.log('Dados da viagem:', viagem.value);
        
        // Se a viagem tem um ID de rota, buscar a rota
        if (viagem.value && viagem.value.rotaDeViagem) {
            console.log('ID da rota:', viagem.value.rotaDeViagem);
            const rotaData = await mapaRotaService.getRotaById(viagem.value.rotaDeViagem);
            rota.value = rotaData;
            console.log('Dados da rota:', rota.value);
            
            // Ajustar o centro do mapa para o primeiro ponto da rota
            if (rota.value?.rotas?.[0]?.rota?.legs?.[0]?.start_location) {
                const startLoc = rota.value.rotas[0].rota.legs[0].start_location;
                center.value = {
                    lat: parseFloat(startLoc.lat),
                    lng: parseFloat(startLoc.lng)
                };
            }
            
            logMapData(); // Adicionar log após carregar os dados
        }
        
    } catch (err) {
        console.error('Erro ao carregar detalhes da viagem:', err);
        error.value = 'Erro ao carregar detalhes da viagem. Tente novamente mais tarde.';
    } finally {
        isLoading.value = false;
    }
}

// Preparar polylines para rotas de passageiros
const rotasPassageiros = computed(() => {
    const result: Array<{
        path: string;
        options: {
            strokeColor: string;
            strokeWeight: number;
            strokeOpacity: number;
            zIndex: number;
        };
        passageiroId: string;
    }> = [];
    
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
                        zIndex: 1
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
        path: rota.value?.rotaFinal?.overview_polyline?.points,
        options: {
            strokeColor: '#2ecc71',
            strokeWeight: 6,
            strokeOpacity: 0.9,
            zIndex: 2
        }
    };
});

// Preparar marcadores para os pontos de embarque
const marcadoresEmbarque = computed(() => {
    const marcadores: Array<{
        position: {
            lat: number;
            lng: number;
        };
        title: string;
        passageiroId: string;
    }> = [];
    
    if (!rota.value?.rotas) return marcadores;
    
    for (const rotaItem of rota.value.rotas) {
        if (rotaItem.rota?.legs?.[0]?.start_location) {
            const loc = rotaItem.rota.legs[0].start_location;
            marcadores.push({
                position: {
                    lat: parseFloat(loc.lat),
                    lng: parseFloat(loc.lng)
                },
                title: `Local de embarque do passageiro ${rotaItem.passageiroId}`,
                passageiroId: rotaItem.passageiroId
            });
        }
    }
    
    return marcadores;
});

// Marcador para o destino final
const marcadorDestino = computed(() => {
    if (!rota.value?.rotaFinal?.legs?.[0]?.end_location) return null;
    
    const endLoc = rota.value.rotaFinal.legs[0].end_location;
    return {
        position: {
            lat: parseFloat(endLoc.lat),
            lng: parseFloat(endLoc.lng)
        },
        title: 'Destino final'
    };
});

// Função para lidar com o evento de carregamento do mapa
function onMapLoad(map: google.maps.Map) {
    console.log("Mapa carregado:", map);
    mapInstance.value = map;
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
const googleMapsApiKey = import.meta.env.VITE_MAPS_API_KEY;

// Carregar bibliotecas adicionais do Google Maps
const libraries = [Library.MARKER, Library.GEOMETRY, Library.PLACES];
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
          <p>
            {{ viagem.enderecoDestino?.logradouro }}, 
            {{ viagem.enderecoDestino?.numero }} - 
            {{ viagem.enderecoDestino?.bairro }}, 
            {{ viagem.enderecoDestino?.cidade }}
          </p>
          
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
        <div v-if="rota" class="debug-info">
          <details>
            <summary>Dados da rota (debug)</summary>
            <div>
              <p>Rota final: {{ rotaFinal !== null ? 'Presente' : 'Ausente' }}</p>
              <p>Rotas passageiros: {{ rotasPassageiros.length }}</p>
              <p>Total de marcadores: {{ marcadoresEmbarque.length + (marcadorDestino ? 1 : 0) }}</p>
              <button @click="logMapData" class="debug-button">Mostrar detalhes no console</button>
            </div>
          </details>
        </div>
        <div v-if="rota">
          <GoogleMap
            :api-key="googleMapsApiKey"
            :center="center"
            :zoom="12"
            :libraries="libraries"
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
            
            <!-- Marcadores de embarque com AdvancedMarker -->
            <AdvancedMarker
              v-for="(marcador, idx) in marcadoresEmbarque"
              :key="`embarque-${idx}`"
              :options="{
                position: marcador.position,
                title: marcador.title
              }"
            >
              <template #default>
                <div style="background-color: #3498db; width: 24px; height: 24px; border-radius: 50%; 
                           display: flex; justify-content: center; align-items: center; color: white; 
                           font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                  P
                </div>
              </template>
            </AdvancedMarker>
            
            <!-- Marcador de destino com AdvancedMarker -->
            <AdvancedMarker
              v-if="marcadorDestino"
              :options="{
                position: marcadorDestino.position,
                title: marcadorDestino.title
              }"
            >
              <template #default>
                <div style="background-color: #2ecc71; width: 28px; height: 28px; border-radius: 50%; 
                           display: flex; justify-content: center; align-items: center; color: white; 
                           font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                  D
                </div>
              </template>
            </AdvancedMarker>
          </GoogleMap>
        </div>
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
}

.error-message {
  color: #e74c3c;
}

.retry-button, .debug-button {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
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
}

.info-section ul {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
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
  height: 400px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.no-route-message {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
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
}

.btn-voltar:hover {
  background-color: #264d73;
}

.debug-info {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9rem;
}

.debug-info details summary {
  cursor: pointer;
  color: #3498db;
  font-weight: bold;
}

.debug-info details div {
  padding: 0.5rem;
}
</style>