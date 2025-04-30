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
</template>

<style scoped>
</style>