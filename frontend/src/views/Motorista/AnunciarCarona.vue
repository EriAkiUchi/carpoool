<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userAuthStore } from '@/store/auth';
import motoristaService from '@/services/motoristaService';
import viagemService from '@/services/viagemService';
import type Viagem from '@/interfaces/IViagem';
import type { Motorista } from '@/interfaces/IMotorista';

const authStore = userAuthStore();
const router = useRouter();
const user = ref(authStore.user);
const userId = ref<string>(user.value?.id || '');

const vagas = ref('');
const horario = ref('');
const empresa = ref('');
const error = ref('');

function validarCampos() {
  return vagas.value && horario.value && empresa.value;
}

async function handleSubmit() {
  if (!validarCampos()) {
    error.value = 'Preencha todos os campos.';
    return;
  }
  if (!window.confirm('Você tem certeza que deseja criar o anúncio?')) return;
  error.value = '';

  const informacoesMotorista:Motorista = await motoristaService.getById(userId.value);
  const dadosViagem = {
    motoristaId: informacoesMotorista.id,
    nomeMotorista: informacoesMotorista.nome,
    nomeEmpresa: empresa.value,
    enderecoDestino: {...informacoesMotorista.enderecoDestino},
    horarioDeSaida: horario.value,
    vagasRestantes: Number(vagas.value),
    carro: {...informacoesMotorista.carro},
  }
  try {
    const viagemNova:Viagem = await viagemService.criarAnuncio(dadosViagem);
    if (viagemNova) {
      alert('Anúncio criado com sucesso!');
      router.push(`/viagem/${viagemNova.id}`);
    }

  } catch (err) {
    console.error('Erro ao criar o anúncio:', err);
    error.value = 'Erro ao criar o anúncio. Tente novamente.';
  }
}
</script>

<template>
  <section class="anunciar-container">
    <h2 class="titulo">Criar anúncio</h2>
    <p class="descricao">Preencha todos os campos.</p>
    <form @submit.prevent="handleSubmit" class="formulario">
      <div class="form-group">
        <label for="vagas">Vagas Disponíveis:</label>
        <input
          id="vagas"
          type="number"
          class="input"
          v-model="vagas"
          min="1"
          required
        />
      </div>
      <div class="form-group">
        <label for="horario">Horário de saída:</label>
        <input
          id="horario"
          type="time"
          class="input"
          v-model="horario"
          required
        />
      </div>
      <div class="form-group">
        <label for="empresa">Nome da empresa:</label>
        <input
          id="empresa"
          type="text"
          class="input"
          v-model="empresa"
          required
        />
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div class="field">
        <button
          class="btn-primary"
          type="submit"
          :disabled="!validarCampos()"
        >
          Criar Anúncio
        </button>
      </div>
    </form>
  </section>
  <div class="back-link">
    <router-link to="/motorista" class="btn-voltar">Voltar ao Dashboard</router-link>
  </div>
</template>

<style scoped>
.anunciar-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.titulo {
  font-size: 1.75rem;
  color: #336699;
  margin-bottom: 1rem;
  text-align: center;
}

.descricao {
  text-align: center;
  margin-bottom: 2rem;
  color: #555;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  color: #264d73;
}

.input {
  padding: 0.6rem 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  background: #e6e6e6;
  color: #264d73;
}

.input:focus {
  outline: none;
  border-color: #264d73;
  background: #fff;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-bottom: 0.5rem;
}

.btn-primary, .btn-voltar {
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

.btn-primary, .btn-voltar {
  background-color: #336699;
  color: white;
  margin-top: 2rem;
  text-align: center;
}

.btn-primary:disabled {
  background-color: #b0b8c1;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled), .btn-voltar:hover {
  background-color: #264d73;
}

.back-link {
  text-align: center;
  margin-top: 2rem;
}
</style>