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
            <h2>Página do Motorista</h2>
            <button @click.prevent="handleLogout" class="logout-button">Sair</button>
        </section>

        <section class="welcome-section">
            <h3>Bem vindo, {{ user?.nome }}</h3>
            <p>Aqui você pode gerenciar suas caronas e visualizar passageiros.</p>
        </section>

        <section class="dashboard-content">
          <div class="dashboard-cards">
            <div class="dashboard-card">
                <h4>Oferecer carona</h4>
                <p>Crie um novo anúncio de carona para passageiros.</p>
                <RouterLink to="/motorista/anunciar-carona" class="card-button">Anunciar Carona</RouterLink>
            </div>

            <div class="dashboard-card">
                <h4>Minhas Caronas</h4>
                <p>Gerencie as suas caronas.</p>
                <RouterLink to="/motorista/viagens" class="card-button">Ver caronas</RouterLink>
            </div>

          </div>
          <div class="dashboard-cards">
            <div class="dashboard-card">
              <h4>Solicitações de Carona</h4>
              <p>Aceite ou rejeite Solicitações de Carona.</p>
              <RouterLink to="/motorista/solicitacoes" class="card-button">Ver Solicitações</RouterLink>
            </div>
    
            <div class="dashboard-card">
                <h4>Meu Perfil</h4>
                <p>Edite suas informações pessoais e preferências.</p>
                <button class="card-button">Editar perfil</button>
            </div>
          </div>
        </section>
    </main>
</template>

<style scoped>
.dashboard-container {
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 3rem;
  /* margin: 0 auto;
  padding: 2rem; */
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14.5rem;
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
  display: flex;
  flex-direction: row;
  justify-content: center;
  
  gap: 2rem;
  width: 100%;
}

.dashboard-cards {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
}

.dashboard-card {
  padding: 1.5rem;
  /* background-color: #f9f9f9; */

  border-radius: 8px;
  border-color: #336699;
  border-style: solid;
  border-width: 5px;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-card h4 {
  margin-bottom: 1rem;
  font-size: 1.3rem;
  color: #336699;
}

.dashboard-card p {
  margin-bottom: 1rem;
}

.card-button {
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

@media (max-width: 1024px) {
  .dashboard-content {
    flex-direction: column;
    width: 40%;
  }
}
</style>