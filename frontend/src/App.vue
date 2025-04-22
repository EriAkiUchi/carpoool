<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { computed } from 'vue';
import { userAuthStore } from './store/auth';
import router from './router';

const authStore = userAuthStore();
authStore.init(); // Inicializa o store com dados do localStorage

const isAuthenticated = computed(() => authStore.isAuthenticated);
const userType = computed(() => authStore.userType);

function logout() {
  authStore.logout();
  router.push('/login');
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
      <RouterLink to="/passageiro" v-if="isAuthenticated && userType === 'passageiro'">
        Meu Dashboard
      </RouterLink>

      <RouterLink to="/motorista" v-if="isAuthenticated && userType === 'motorista'">
        Meu Dashboard
      </RouterLink>

      <!-- Links para login/logout -->
      <a href="#" @click.prevent="logout" v-if="isAuthenticated">Sair</a>

      <RouterLink v-else to="/login">Login</RouterLink>

    </nav>
  </header>

  <main>
    <RouterView />
  </main>

  <footer>
    <p>&copy; {{ new Date().getFullYear() }} Carpoool. Todos os direitos reservados.</p>
  </footer>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  min-height: 100vh;
}

html {
  height: 100%;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>

<style scoped>

header {
  width: 100%;
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

/* main {} */

footer {
  text-align: center;
  padding: 1rem;

  background-color: var(--bg-color);
  color: var(--text-color);

}
</style>
