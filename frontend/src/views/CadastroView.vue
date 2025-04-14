<script setup lang="ts">
import { RouterLink } from 'vue-router';  
</script>

<template>
    <main class="cadastro-container">
        <h2>Bem-vindo ao Carpoool</h2>
        <p>Escolha como deseja cadastrar:</p>
        <section class="cadastro-options">
            <RouterLink to="/cadastro/passageiro" class="cadastro-button">
                Cadastrar como Passageiro
            </RouterLink>
    
            <RouterLink to="/cadastro/motorista" class="cadastro-button">
                Cadastrar como Motorista
            </RouterLink>
        </section>
    
        <section class="login-section">
            <p>Já possui uma conta?</p>
            <div class="login-options">
                <RouterLink to="/login/passageiro">Entrar como Passageiro</RouterLink> | 
                <RouterLink to="/login/motorista">Entrar como Motorista</RouterLink>
            </div>
        </section>

        <RouterLink to="/" class="botao-voltar">Voltar</RouterLink>
    </main>

</template>

<style scoped>
.cadastro-container {
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

.cadastro-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
}

.cadastro-button {
  display: block;
  padding: 1rem;
  background-color: #336699;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.cadastro-button:hover {
  background-color: #264d73;
}

.login-section {
  margin-top: 2rem;
  font-size: 0.9rem;
}

.login-options {
  margin-top: 0.5rem;
}

.login-options a {
  color: #336699;
  text-decoration: none;
}

.login-options a:hover {
  text-decoration: underline;
}

.botao-voltar {
  background-color: #336699;
  color: #fff;
  border: none;

  padding: 0.75rem 1.5rem;
  margin-top: 1.5rem;
  border-radius: 4px;

  display: inline-block;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.botao-voltar a {
    color: #fff;
    text-decoration: none;
    font-weight: 500;
}


.botao-voltar:hover {
    background-color: #264d73;
}
</style>