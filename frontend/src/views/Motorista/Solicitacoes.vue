<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { userAuthStore } from '@/store/auth';
import viagemService from '@/services/viagemService';
import type Viagem from '@/interfaces/IViagem';
import passageiroService from '@/services/passageiroService';

const authStore = userAuthStore();
const route = useRoute();
const user = ref(authStore.user);
const viagens = ref<Viagem[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

</script>

<template>
<section class="solicitacoes_container">

</section>
</template>

<style scoped></style>