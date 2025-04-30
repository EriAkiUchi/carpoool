<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { userAuthStore } from '@/store/auth';

const authStore = userAuthStore();
const router = useRouter();
const user = ref(authStore.user);

const motoristaId = ref(authStore.user?.id);
</script>

<template>
    <h2>Criar anúncio</h2>

    <div class="back-link">
      <router-link to="/motorista" class="btn-voltar">Voltar ao Dashboard</router-link>
    </div>
</template>

<style scoped>

.btn-voltar, .btn-primary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-block;
}
.btn-voltar, .btn-primary {
  background-color: #336699;
  color: white;
  margin-top: 2rem;
}

.btn-voltar:hover, .btn-primary:hover {
  background-color: #264d73;
}

.back-link {
  text-align: center;
  margin-top: 2rem;
}
</style>