<script setup lang="ts">
import { RouterLink } from 'vue-router';  
</script>

<template>
    <main class="login-container">
        <h2>Bem-vindo ao Carpoool</h2>
        <p>Escolha como deseja entrar:</p>
        <section class="login-options">
            <RouterLink to="/login/passageiro" class="login-button">
                Entrar como Passageiro
            </RouterLink>
    
            <RouterLink to="/login/motorista" class="login-button">
                Entrar como Motorista
            </RouterLink>
        </section>
    
        <section class="register-section">
            <p>Ainda não tem conta?</p>
            <div class="register-options">
                <RouterLink to="/cadastro/passageiro">Cadastrar como Passageiro</RouterLink> | 
                <RouterLink to="/cadastro/motorista">Cadastrar como Motorista</RouterLink>
            </div>
        </section>
    </main>

</template>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h2 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: #336699;
}

.login-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
}

.login-button {
  display: block;
  padding: 1rem;
  background-color: #336699;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #264d73;
}

.register-section {
  margin-top: 2rem;
  font-size: 0.9rem;
}

.register-options {
  margin-top: 0.5rem;
}

.register-options a {
  color: #336699;
  text-decoration: none;
}

.register-options a:hover {
  text-decoration: underline;
}
</style>