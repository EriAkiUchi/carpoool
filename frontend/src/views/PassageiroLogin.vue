<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'; 
import { userAuthStore } from '@/store/auth';

// instanciar o store de autenticação
const router = useRouter();
const authStore = userAuthStore();

const email = ref('');
const senha = ref('');
const error = ref('');
const isLoading = ref(false);

async function handleLogin() {
    if (!email.value || !senha.value) {
        error.value = 'Por favor, preencha todos os campos.';
        return;
    }

    try {
        isLoading.value = true;
        await authStore.loginPassageiro(email.value, senha.value);

        // Redirecionar para a página de passageiro após o login
        router.push('/passageiro');
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais e tente novamente.';
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <section class="login-container">
        <h2>Login de Passageiro</h2>

        <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
                <label for="email">Email:</label>
                <input 
                type="text"
                id="email"
                v-model="email"
                placeholder="Digite seu email"
                required
                >
            </div>

            <div class="form-group">
                <label for="senha">Senha:</label>
                <input 
                type="password"
                id="senha"
                v-model="senha"
                placeholder="Digite sua senha"
                required
                >
            </div>

            <div v-if="error" class="error-message">
                {{ error }}
            </div>

            <button type="submit" class="login-button" :disabled="isLoading">
                {{ isLoading ? 'Entrando...' : 'Entrar' }}
            </button>
        </form>

        <footer class="links-section">
            <RouterLink to="/login">Voltar</RouterLink>
            <RouterLink to="/cadastro/passageiro">Criar conta</RouterLink>
        </footer>
    </section>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  margin-bottom: 2rem;
  text-align: center;
  color: #336699;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: bold;
}

input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.login-button {
  padding: 0.75rem;
  background-color: #336699;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover:not(:disabled) {
  background-color: #264d73;
}

.login-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.links-section {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
}

.links-section a {
  color: #336699;
  text-decoration: none;
}

.links-section a:hover {
  text-decoration: underline;
}

footer {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}
</style>