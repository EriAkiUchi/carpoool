<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { userAuthStore } from '@/store/auth';
import viagemService from '@/services/viagemService';
import motoristaService from '@/services/motoristaService';
import type Viagem from '@/interfaces/IViagem';

const authStore = userAuthStore();
const router = useRouter();
const user = ref(authStore.user);
const viagens = ref<Viagem[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Função para carregar viagens do passageiro
async function carregarViagens() {
  if (!user.value?.id) return;

  try {
    isLoading.value = true;
    error.value = null;
    
    // Buscar viagens
    const viagensData: Viagem[] = await viagemService.getByUsuarioId('passageiro', user.value.id);
    
    if (Array.isArray(viagensData)) {
      // Processar cada viagem
      const viagensProcessadas = [];
      
      for (const viagem of viagensData) {
        // Buscar nome do motorista
        let motoristaNome = 'Motorista não encontrado';
        try {
          const motoristaResponse = await motoristaService.getById(viagem.motoristaId);
          if (motoristaResponse.data && motoristaResponse.data.nome) {
            motoristaNome = motoristaResponse.data.nome;
          }
        } catch (err) {
          console.error('Erro ao buscar motorista:', err);
        }
        
        viagensProcessadas.push({
          ...viagem,
          motoristaNome,          
        });
      }
      
      viagens.value = viagensProcessadas;
    } else {
      error.value = 'Formato de resposta inválido';
      viagens.value = [];
    }
  } catch (err) {
    console.error('Erro ao carregar viagens:', err);
    error.value = 'Erro ao carregar suas viagens. Tente novamente mais tarde.';
    viagens.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Função para visualizar detalhes da viagem
function verDetalhes(viagemId: string) {
  router.push(`/viagem/${viagemId}`);
}

// Função para cancelar viagem
async function cancelarViagem(viagemId: string) {
  if (!user.value?.id) return;

  try {
    isLoading.value = true;
    await viagemService.cancelarViagem(viagemId, user.value.id, user.value.tipo);
    // Recarregar viagens após cancelamento
    await carregarViagens();
  } catch (err) {
    console.error('Erro ao cancelar viagem:', err);
    error.value = 'Não foi possível cancelar a viagem. Tente novamente.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  // Verificar autenticação
  if (!authStore.isAuthenticated || authStore.userType !== 'passageiro') {
    router.push('/login');
    return;
  }

  // Carregar as viagens do passageiro
  await carregarViagens();
});
</script>

<template>
  <main class="lista-viagens">
    <h2 class="lista-titulo">Suas viagens</h2>
    
    <div v-if="isLoading" class="loading">
      Carregando suas viagens...
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="carregarViagens" class="retry-button">Tentar novamente</button>
    </div>
    
    <div v-else-if="viagens.length === 0" class="empty-state">
      <p>Você ainda não tem viagens agendadas.</p>
      <router-link to="/passageiro" class="btn-primary">Voltar ao Dashboard</router-link>
    </div>
    
    <div v-else class="viagens-container">
      <div class="viagem-card" v-for="viagem in viagens" :key="viagem.id">
        <div class="viagem-header">
          <h3>Viagem para {{ viagem.nomeEmpresa }}</h3>
          <span v-if="viagem.status === 'em-andamento'" class="viagem-status" :class="viagem.status">
            em andamento
          </span>
          <span v-else class="viagem-status" :class="viagem.status">
            {{ viagem.status }}
          </span>
        </div>
        
        <div class="viagem-info">
          <p><strong>Horário:</strong> {{ viagem.horarioDeSaida }}</p>
          <p><strong>Motorista:</strong> {{ viagem.motoristaNome }}</p>
        </div>
        
        <div class="viagem-acoes">
          <button @click="verDetalhes(viagem.id)" class="btn-detalhes">
            Ver detalhes
          </button>
          
          <button 
            v-if="viagem.status === 'em-andamento'"
            @click="cancelarViagem(viagem.id)" 
            class="btn-cancelar">
            Cancelar viagem
          </button>
        </div>
      </div>
    </div>
    
    <div class="back-link">
      <router-link to="/passageiro" class="btn-voltar">Voltar ao Dashboard</router-link>
    </div>
  </main>
</template>

<style scoped>
.lista-viagens {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.lista-titulo {
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

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.viagens-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.viagem-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.viagem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.viagem-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #336699;
}

.viagem-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.viagem-status.em-andamento {
  background-color: #3498db;
  color: white;
}

.viagem-status.finalizada {
  background-color: #2ecc71;
  color: white;
}

.viagem-status.cancelada {
  background-color: #e74c3c;
  color: white;
}

.viagem-info {
  border-top: 1px solid #336699;
  border-bottom: 1px solid #336699;
  padding: 0.75rem 0;
  margin: 0.75rem 0;
}

.viagem-info p {
  color: #336699;
  margin: 0.5rem 0;
}

.viagem-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.btn-detalhes, .btn-cancelar, .btn-voltar, .btn-primary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-detalhes {
  background-color: #3498db;
  color: white;
}

.btn-detalhes:hover {
  background-color: #2980b9;
}

.btn-cancelar {
  background-color: #e74c3c;
  color: white;
}

.btn-cancelar:hover {
  background-color: #c0392b;
}

.btn-voltar, .btn-primary {
  background-color: #336699;
  color: white;
  margin-top: 2rem;
}

.btn-voltar:hover, .btn-primary:hover {
  background-color: #264d73;
}

.back-link {
  text-align: center;
  margin-top: 2rem;
}
</style>