<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { userAuthStore } from '@/store/auth';

import viagemService from '@/services/viagemService';
import calculoMotoristasProximosService from '@/services/calculoMotoristasProximos';
import type Viagem from '@/interfaces/IViagem';
import type MotoristasProximos from '@/interfaces/IMotoristasProximos';

const route = useRoute();
const authStore = userAuthStore();
const passageiroId = authStore.user?.id as string;

const distanciaMaxima = ref<number>(0);
const motoristasProximos = ref<MotoristasProximos[]>([]);
const motoristasIds = ref<string[]>([]);
const viagens = ref<Viagem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function obterMotoristasProximos (passageiroId: string, distanciaMaxima: number) {
    const motoristas: MotoristasProximos[] = await calculoMotoristasProximosService.getMotoristasProximos(passageiroId, distanciaMaxima);
    if(!motoristas) {
        console.error('Erro ao obter motoristas próximos:', motoristas);
        return [];
    }
    else 
    {
        return motoristas;
    }
        
}

async function obterViagensEspecificas (motoristasIds: string[]): Promise<Viagem[]> {
    const motoristas = await viagemService.getViagensEspecificas(motoristasIds)
        
    return motoristas;
}

async function buscar() {
    loading.value = true;
    error.value = null;
    viagens.value = [];
    motoristasProximos.value = await obterMotoristasProximos(passageiroId, distanciaMaxima.value);

    motoristasIds.value = motoristasProximos.value.map((motorista) => motorista.id);
    console.log(motoristasIds.value);

    if (motoristasIds.value.length > 0) {
        viagens.value = await obterViagensEspecificas(motoristasIds.value);
    }
    else {
        error.value = 'Nenhum motorista encontrado.';
    }

    if (viagens.value.length === 0) {
        error.value = 'Nenhuma viagem encontrada.';
    }
    loading.value = false;
}
</script>

<template>
    <section class="buscar-viagens">
        <h2>Buscar viagens próximas</h2>
        <div class="form-group">
            <label>Distância Máxima (Km)</label>
            <input type="number" v-model.number="distanciaMaxima" >
            <button @click="buscar">Buscar</button>
        </div>

        <div v-if="loading">Carregando...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <ul v-else>
            <li v-for="viagem in viagens" :key="viagem.id">
                <h3>Motorista: {{ viagem.nomeMotorista }}</h3>
                <p>Hora: {{ viagem.horarioDeSaida }}</p>
                <p>Vagas: {{ viagem.vagasRestantes }}</p>
            </li>
        </ul>
    </section>    
</template>

<style scoped>
.buscar-viagens {
    max-width: 60%;
    margin: auto;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    margin-bottom: 1rem;
}

.error {
    color: red;
}
</style>