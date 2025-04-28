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
const motoristasProximos = ref<MotoristasProximos>();
const motoristasIds = ref<string[]>([]);
const viagens = ref<Viagem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function obterMotoristasProximos (passageiroId: string, distanciaMaxima: number) {
    const motoristas = await calculoMotoristasProximosService.getMotoristasProximos(passageiroId, distanciaMaxima);
    if (motoristas.status === 200) {
        console.log('Motoristas próximos:', motoristas.data);
        return motoristas.data;
    } else {
        console.error('Erro ao obter motoristas próximos:', motoristas.statusText);
        return [];
    }
        
}

async function obterViagensEspecificas (motoristasIds: string[]): Promise<Viagem[]> {
    return await viagemService.getViagensEspecificas(motoristasIds)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error('Erro ao obter viagens:', error);
            return [];
        });
}

async function buscar() {
    loading.value = true;
    error.value = null;
    viagens.value = [];
    motoristasProximos.value = await obterMotoristasProximos(passageiroId, distanciaMaxima.value);
    console.log('Motoristas próximos:', motoristasProximos.value);

    motoristasIds.value = motoristasProximos.value.(motorista => motorista.id);

    if (motoristasIds.value.length > 0) {
        viagens.value = await obterViagensEspecificas(motoristasIds.value);
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
                <h3>Motorista: {{ viagem.motoristaNome }}</h3>
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