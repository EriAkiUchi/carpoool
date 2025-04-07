<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { computed } from 'vue';
import { userAuthStore } from './store/auth';

const authStore = userAuthStore();
authStore.init(); // Inicializa o store com dados do localStorage

const isAuthenticated = computed(() => authStore.isAuthenticated);
const userType = computed(() => authStore.userType);

function logout() {
  authStore.logout();
}
</script>

<template>
  <header>
    <div class="logo-container">
      <RouterLink to="/">
        <h1>Carpoool</h1>
      </RouterLink>
    </div>

    <nav>
      <RouterLink to="/">Home</RouterLink>

      <!-- Liniks para usuários autenticados baseado no tipo -->
      <template v-if="isAuthenticated && userType === 'passageiro'">
      <RouterLink to="/passageiro">Meu Dashboard</RouterLink>
      </template>

      <template v-if="isAuthenticated && userType === 'motorista'">
        <RouterLink to="/motorista">Meu Dashboard</RouterLink>
      </template>

      <!-- Links para login/logout -->
      <template v-if="isAuthenticated">
        <a href="#" @click.prevent="logout">Sair</a>
      </template>
      <template v-else>
        <RouterLink to="/login">Login</RouterLink>
      </template>

    </nav>
  </header>

  <main>
    <RouterView />
  </main>

  <footer>
    <p>&copy; {{ new Date().getFullYear() }} Carpoool. Todos os direitos reservados.</p>
  </footer>
</template>

<style scoped>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #336699;
  color: white;
}

.logo-container h1 {
  margin: 0;
  font-size: 1.8rem;
}

.logo-container a {
  color: white;
  text-decoration: none;
}

nav {
  display: flex;
  gap: 1.5rem;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

nav a:hover {
  opacity: 0.8;
}

main {
  min-height: calc(100vh - 160px);
  padding: 2rem;
}

footer {
  text-align: center;
  padding: 1rem;
  background-color: #f5f5f5;
  border-top: 1px solid #eee;
}
</style>
