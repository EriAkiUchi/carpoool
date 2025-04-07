<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { userAuthStore } from '@/store/auth';

const authStore = userAuthStore();
const router = useRouter();
const user = ref(authStore.user);

function handleLogout() {
    authStore.logout();
    router.push('/login');
}

onMounted(() => {
    if(!authStore.isAuthenticated || authStore.userType !== 'motorista') {
        router.push('/login');
    }
});

</script>

<template>
    <main class="dashboard-container">
        <section class="dashboard-header">
            <h2>Pagina do Motorista</h2>
            <button @click="handleLogout" class="logout-button">Sair</button>
        </section>

        <section class="welcome-section">
            <h3>Bem vindo, {{ user?.nome }}</h3>
            <p>Aqui você pode gerenciar suas caronas e visualizar passageiros.</p>
        </section>

        <section class="dashboard-content">
            <div class="dashboard-card">
                <h4>Oferecer carona</h4>
                <p>Crie um novo anúncio de carona para passageiros.</p>
                <button class="card-button">Criar anúncio</button>
            </div>

            <section class="dashboard-card">
                <h4>Minhas Caronas</h4>
                <p>Gerencie as suas caronas.</p>
                <button class="card-button">Ver viagens</button>
            </section>
    
            <section class="dasboard-card">
                <h4>Meu Perfil</h4>
                <p>Edite suas informações pessoais e preferências.</p>
                <button class="card-button">Editar perfil</button>
            </section>
        </section>
    </main>
</template>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #c0392b;
}

.welcome-section {
  margin-bottom: 2rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.dashboard-card {
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-card h4 {
  margin-bottom: 1rem;
  color: #336699;
}

.card-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #336699;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.card-button:hover {
  background-color: #264d73;
}
</style>