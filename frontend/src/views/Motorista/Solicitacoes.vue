<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { userAuthStore } from '@/store/auth';
import solicitacaoService from '@/services/solicitacaoService';
import type { Solicitacao } from '@/interfaces/ISolicitacao';

const authStore = userAuthStore();
const router = useRouter();
const solicitacoes = ref<Solicitacao[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

async function carregarSolicitacoes(){
    isLoading.value = true;
    error.value = null;

    try {
        const resposta:Solicitacao[] = await solicitacaoService.getAllSolicitacoes();
        if(resposta.length === 0){
            error.value = 'Nenhuma solicitação encontrada.';
            return;
        }
        resposta.map((solicitacao) => 
            solicitacao.genero === 'M' ? 'Masculino' : 'Feminino'
        )
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

async function aceitarSolicitacao(aceitar: boolean) {
    if (aceitar) {

    } 
    else {

    }
}

</script>

<template>
    <section class="lista-solicitacoes">
        <h2>Solicitações de Carona</h2>

        <div v-if="isLoading" class="loading">Carregando...</div>

        <div v-else-if="error" class="error">
            {{ error }}
            <button class="retry">Tentar novamente</button>
        </div>

        <div v-else-if="solicitacoes.length === 0" class="no-solicitacoes">
            Nenhuma solicitação encontrada.
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
            </div>

            <div class="viagem-acoes">
                
                <button @click="aceitarSolicitacao(false)" class="btn-primary">
                    Acietar Solicitação
                </button>

                <button @click="aceitarSolicitacao(false)" class="btn-primary">
                    Recusar Solicitação
                </button>
            </div>

            <div class="back-link">
                <router-link to="/motorista" class="btn-voltar">Voltar ao Dashboard</router-link>
            </div>
        </section>

        
    </section>
</template>

<style scoped>

</style>