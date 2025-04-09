<script setup lang="ts">

</script>

<template>
    <h1>Carpoool</h1>
    <h2>A plataforma de caronas para sua Empresa</h2>
    <p>Faça deslocamentos e conecte os seus colaboradores usando a Carpoool.</p>

    <section class="buttons">
        <RouterLink to="/login" class="button">Login</RouterLink>
        
        <RouterLink to="/cadastro" class="button">Cadastrar</RouterLink>
    </section>
</template>

<style scoped>
h1 {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
    text-align: center;
}

h2 {
    font-size: 1.75rem;
    color: var(--secondary-color);
    margin-bottom: 1rem;
    text-align: center;
}

p {
    font-size: 1.125rem;
    color: var(--text-color);
    text-align: center;
    max-width: 600px;
    margin: 0 auto 2rem;
}

.buttons {
    align-content: center;
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.button {
    background-color: #1976d2;
    color: #fff;
    border: none;

    padding: 0.75rem 1.5rem;
    margin: 0.5rem;
    border-radius: 4px;

    cursor: pointer;
    transition: background-color 0.3s ease;
}

.button a {
    color: #fff;
    text-decoration: none;
    font-weight: 500;
}


.button:hover {
    background-color: #115293;
}

</style>