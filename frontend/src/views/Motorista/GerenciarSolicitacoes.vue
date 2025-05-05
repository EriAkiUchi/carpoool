<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { userAuthStore } from '@/store/auth';
import solicitacaoService from '@/services/solicitacaoService';
import type { Solicitacao } from '@/interfaces/ISolicitacao';
import viagemService from '@/services/viagemService';
import type Viagem from '@/interfaces/IViagem';

const authStore = userAuthStore();
const router = useRouter();
const solicitacoes = ref<Solicitacao[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

async function carregarSolicitacoes(){
    solicitacoes.value = [];
    isLoading.value = true;
    error.value = null;

    try {
        const resposta:Solicitacao[] = await solicitacaoService.getAllSolicitacoes();
        if(resposta.length === 0){
            error.value = 'Nenhuma solicitação encontrada.';
            return;
        }
        //modificar o genero para masculino ou feminino
        resposta.forEach((solicitacao) => {
            if (solicitacao.genero === 'M') {
                solicitacao.genero = 'Masculino';
            } else if (solicitacao.genero === 'F') {
                solicitacao.genero = 'Feminino';
            }
        });
        solicitacoes.value = resposta;

    } catch (err) {
        error.value = 'Erro ao carregar as solicitações.';
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

onMounted(async () => {
    if (!authStore.isAuthenticated || authStore.userType !== 'motorista') {
        router.push('/login');
        return;
    } else {
        await carregarSolicitacoes();
    }
});

async function aceitarSolicitacao(aceitar: boolean, idSolicitacao: string, passageiroId: string, viagemId: string) {
    const viagem:Viagem = await viagemService.getById(viagemId);

    if (aceitar) {
      const passageirosIdsAtualizado = [...viagem.passageirosIds, passageiroId];

      try {
        const resposta = await viagemService.adicionarPassageiro(viagem.id, passageirosIdsAtualizado);

        if(resposta) {
            const respostaDelecao = await solicitacaoService.deletarSolicitacao(idSolicitacao);
            alert('Solicitação aceita com sucesso!');
        }
        else {
            alert('Erro ao aceitar a solicitação.');
        }
        
        await carregarSolicitacoes(); // Atualiza a lista de viagens após a solicitação

      } catch (error) {
        console.error('Erro ao solicitar viagem:', error);
      }
    } 
    else {
      try {
          const respostaDelecao = await solicitacaoService.deletarSolicitacao(idSolicitacao);
          if(respostaDelecao) {
              alert('Solicitação recusada com sucesso!');
          }
          else {
              alert('Erro ao recusar a solicitação.');
          }

          await carregarSolicitacoes();
      } catch (error) {
          console.error('Erro ao recusar a solicitação:', error);
      }
    }
}

</script>

<template>
    <section class="lista-solicitacoes">
        <h2>Solicitações de Carona</h2>

        <div v-if="isLoading" class="loading">Carregando...</div>

        <div v-else-if="error" class="error">
            {{ error }}
            <button class="retry" @click="carregarSolicitacoes">Tentar novamente</button>
        </div>

        <div v-else-if="solicitacoes.length === 0" class="no-solicitacoes">
            Nenhuma solicitação encontrada.
            <button class="retry" @click="carregarSolicitacoes">Tentar novamente</button>
        </div>

        <section class="solicitacoes-container">
            <div class="solicitacoes-card" v-for="solicitacao in solicitacoes" :key="solicitacao.nomePassageiro">
                <div class="header">
                    <h3>Solicitação para {{ solicitacao.nomeEmpresa }}</h3>                    
                </div>

                <div class="solicitacao-info">
                    <p><strong>Nome do Passageiro:</strong> {{ solicitacao.nomePassageiro }}</p>
                    <p><strong>Gênero:</strong> {{ solicitacao.genero }}</p>
                    <p><strong>Endereço de Origem:</strong></p>
                    <p> 
                        {{ solicitacao.enderecoOrigem.logradouro }},
                        {{ solicitacao.enderecoOrigem.numero }} - 
                        {{ solicitacao.enderecoOrigem.bairro }}, 
                        {{ solicitacao.enderecoOrigem.cidade }}
                    </p>
                </div>
                <div class="viagem-acoes">
                    
                    <button @click="aceitarSolicitacao(true, solicitacao.id, solicitacao.idPassageiro, solicitacao.idViagem)" class="btn-primary">
                        Aceitar Solicitação
                    </button>
    
                    <button @click="aceitarSolicitacao(false, solicitacao.id, solicitacao.idPassageiro, solicitacao.idViagem)" class="btn-primary">
                        Recusar Solicitação
                    </button>
                </div>
            </div>

            <div class="back-link">
                <router-link to="/motorista" class="btn-voltar">Voltar ao Dashboard</router-link>
            </div>
        </section>

        
    </section>
</template>

<style scoped>
.lista-solicitacoes {
  max-width: 50%;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  font-size: 1.75rem;
  color: #336699;
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading, .error, .no-solicitacoes {
  text-align: center;
  padding: 2rem 0;
}

.error {
  color: #e74c3c;
}

.retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.solicitacoes-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.solicitacoes-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #336699;
}

.solicitacao-info {
  border-top: 1px solid #336699;
  border-bottom: 1px solid #336699;
  padding: 0.75rem 0;
  margin: 0.75rem 0;
}

.solicitacao-info p {
  color: #336699;
  margin: 0.5rem 0;
}

.viagem-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.btn-primary, .btn-voltar {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-block;
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-voltar {
  background-color: #336699;
  color: white;
  margin-top: 2rem;
}

.btn-voltar:hover {
  background-color: #264d73;
}

.back-link {
  text-align: center;
  margin-top: 2rem;
}
</style>