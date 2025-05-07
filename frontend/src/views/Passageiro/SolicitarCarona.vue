<script setup lang="ts">
import { ref } from 'vue';
import { userAuthStore } from '@/store/auth';

import viagemService from '@/services/viagemService';
import calculoMotoristasProximosService from '@/services/calculoMotoristasProximosService';
import type Viagem from '@/interfaces/IViagem';
import type MotoristasProximos from '@/interfaces/IMotoristasProximos';
import passageiroService from '@/services/passageiroService';
import solicitacaoService from '@/services/solicitacaoService';
import type { Solicitacao } from '@/interfaces/ISolicitacao';
import type { Passageiro } from '@/interfaces/IPassageiro';

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
    const viagensFiltradas = await viagemService.getViagensEspecificas(motoristasIds, passageiroId);
    const viagensProcessadas:Viagem[] = [];

    for (const viagem of viagensFiltradas) {
      const detalhesPassageiros: string[] = [];
        const iterador:string[] = Object.values(viagem.passageirosIds);

        // Procurar nome dos passageiros para cada id
        for (let i = 0;i < iterador.length; i++) {
          const p:string = iterador[i];
          try {
            const res = await passageiroService.getById(p);
            if (res.nome) {
              detalhesPassageiros.push(res.nome);
            }
          } catch (err) {
            console.error('Erro ao buscar passageiro', p, err);
          }
        }
                
        viagensProcessadas.push({
          ...viagem,
          passageirosIds: detalhesPassageiros,
        });
    }
    return viagensProcessadas;
}

async function buscar() {
    loading.value = true;
    error.value = null;
    viagens.value = [];
    motoristasProximos.value = await obterMotoristasProximos(passageiroId, distanciaMaxima.value);

    motoristasIds.value = motoristasProximos.value.map((motorista) => motorista.id);

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

async function solicitarViagem(id: string) {
  if(!window.confirm('Você tem certeza que deseja solicitar essa viagem?')) return;
	const viagem:Viagem = await viagemService.getById(id);

  const buscarSolicitacao:Solicitacao = await solicitacaoService.getSolicitacaoByIds(passageiroId, viagem.id);
  if(Object.values(buscarSolicitacao).length > 0) {
    alert('Você já solicitou essa viagem!');
    return;
  }
	// const passageirosIdsAtualizado = [...viagem.passageirosIds, passageiroId];

	// try {
  //   const resposta = await viagemService.adicionarPassageiro(id, passageirosIdsAtualizado);

  //   alert('Viagem solicitada com sucesso!');

  //   loading.value = true;
  //   error.value = null;
  //   await buscar(); // Atualiza a lista de viagens após a solicitação

	// } catch (error) {
	//   console.error('Erro ao solicitar viagem:', error);
	// }

  const passageiro:Passageiro = await passageiroService.getById(passageiroId);
  const solicitarViagem = {
    idPassageiro: passageiroId,
    idViagem: id,
    nomeEmpresa: viagem.nomeEmpresa,
    nomePassageiro: passageiro.nome,
    genero: passageiro.genero,
    enderecoOrigem: {
      logradouro: passageiro.enderecoOrigem.logradouro,
      numero: passageiro.enderecoOrigem.numero,
      bairro: passageiro.enderecoOrigem.bairro,
      cidade: passageiro.enderecoOrigem.cidade,
    }
  }

  try {
    const resposta = await solicitacaoService.createSolicitacao(solicitarViagem);
    alert('Viagem solicitada com sucesso!');
    
    await buscar(); // Atualiza a lista de viagens após a solicitação
  } catch (error) {
    console.error('Erro ao solicitar viagem:', error);
  }
}
</script>

<template>
    <section class="buscar-viagens">
        <h2 class="titulo">Buscar viagens próximas</h2>
        <div class="form-group">
          <div>
            <label class="form-label">Digite uma distância máxima de raio de busca em kilômetros(Km): </label>
            <input class="form-input" type="number" v-model.number="distanciaMaxima" >
          </div>
            <button class="form-button" @click="buscar">Buscar</button>
        </div>

        <div v-if="loading">Carregando...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <ul v-else class="viagens-container">
            <li v-for="viagem in viagens" :key="viagem.id" class="viagem-item">
                <div class="viagem-header">
                    <h3>Viagem para {{ viagem.nomeEmpresa }}</h3>                    
                </div>
            
                <div class="viagem-info">
                    <p><strong>Horário:</strong> {{ viagem.horarioDeSaida }}</p>
                    <p><strong>Motorista:</strong> {{ viagem.nomeMotorista }}</p>
                    <p><strong>Carro:</strong> {{ viagem.carro.marca }} - {{ viagem.carro.modelo }}</p>
                    <p><strong>Vagas restantes:</strong> {{ viagem.vagasRestantes }}</p>
                    <div v-if="viagem.passageirosIds.length > 0">
                      <p><strong>Passageiros:</strong></p>
                      <ul>
                          <li v-for="passageiro in viagem.passageirosIds" :key="passageiro">
                              {{ passageiro }}
                          </li>
                      </ul>
                    </div>
                    <div v-else>
                      <p><strong>Passageiros: Ainda não há passageiros</strong></p>
                    </div>
                </div>
                
                <button 
                    v-if="viagem.status === 'em-andamento'"
                    @click="solicitarViagem(viagem.id)"
                    class="btn-solicitacao form-button">
                    Solicitar Carona
                </button>
            </li>
        </ul>

        <div class="back-link">
            <router-link to="/passageiro" class="btn-voltar">Voltar ao Dashboard</router-link>
        </div>
    </section>    
</template>

<style scoped>
.buscar-viagens {
    max-width: 60%;
    margin: auto;
}

.titulo{
  padding-top: 2rem;
  font-size: 2rem;
  text-align: center;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    
    margin-bottom: 1rem;
    align-items: center;
}

.form-label {
    font-size: 1.25rem;
}

.form-input {
  font-size: 1rem;
  border-radius: 4px;
}

.form-input:focus {
  outline: none;
}

.form-button {
    padding: 0.5rem 1rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.3s;
}

.form-button:hover {
    background-color: #2980b9;
    cursor: pointer;
}

.error {
    color: red;
}

.viagens-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  list-style-type: none;
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

.viagem-item {
    border: 1px solid #ccc;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
    background-color: #f9f9f9;
    color: #336699;
}

.back-link {
  text-align: center;
  margin-top: 2rem;
}

.btn-voltar {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-voltar {
  background-color: #336699;
  color: white;
  margin-top: 2rem;
}

.btn-voltar:hover {
  background-color: #264d73;
}

@media (max-width: 1024px) {
  .buscar-viagens {
    max-width: 90%;
    margin: 0 auto;
  }
}
</style>