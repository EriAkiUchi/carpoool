import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import authService from '@/services/authService';
import Home from '@/views/Home.vue';

const rotas: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
    props: (router) => ({
      isAuthenticaded: authService.isAuthenticated(),
      userType: authService.getUserType(),
    })
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/login/passageiro',
    name: 'login-passageiro',

    //fazendo lazy loading do componente LoginView
    //o componente só será carregado quando a rota for acessada
    component: () => import('../views/PassageiroLogin.vue'),
  },
  {
    path: '/login/motorista',
    name: 'login-motorista',
    component: () => import('../views/MotoristaLogin.vue'),
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: () => import('../views/CadastroView.vue'),
  },
  {
    path: '/cadastro/passageiro',
    name: 'cadastro-passageiro',
    component: () => import('../views/PassageiroCadastro.vue'),
  },
  {
    path: '/cadastro/motorista',
    name: 'cadastro-motorista',
    component: () => import('../views/MotoristaCadastro.vue'),
  },
  {
    path: '/passageiro',
    name: 'passageiro-dashboard',
    component: () => import('../views/Passageiro/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'passageiro' }
  },
  {
    path: '/motorista',
    name: 'motorista-dashboard',
    component: () => import('../views/Motorista/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'motorista' }
  },
]

const router = createRouter({

  //history com finalidade de manter o histórico de navegação
  // e permitir o uso do botão voltar do navegador
  history: createWebHistory(),
  routes: rotas,
});

// Proteção de rotas
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const userType = authService.getUserType();
  const isAuthenticated = authService.isAuthenticated();

  if(requiresAuth && !isAuthenticated) {
    // Se a rota requer autenticação e o usuário não está autenticado
    // redireciona para a página de login
    next('/login');
  }
  else if(requiresAuth && isAuthenticated) {

    // Verificar permisão baseada no tipo de usuario
    if (to.meta.role && to.meta.role !== userType) {
      // Redirecionar para dashboard apropriado se tentar acessar área não autorizada
      next(userType === 'passageiro' ? '/passageiro' : '/motorista');
    }
    else {
      next();
    }

  }
  else {
    next();
  }
})

export default router
