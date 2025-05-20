# Carpoool

![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## Sobre o Projeto

Carpoool é uma plataforma open source de compartilhamento de caronas que conecta motoristas e passageiros que compartilham destinos semelhantes. O projeto visa reduzir a pegada de carbono, diminuir o congestionamento de tráfego e proporcionar uma opção de transporte mais econômica.

### Principais Funcionalidades

- **Para Motoristas**:
  - Cadastro de perfil e veículo (ainda não implementado)
  - Anúncio de caronas
  - Gerenciamento de solicitações
  - Visualização de rotas em tempo real
  - Histórico de viagens

- **Para Passageiros**:
  - Cadastro de perfil (ainda não implementado)
  - Solicitação de caronas
  - Busca de motoristas próximos
  - Acompanhamento de viagens
  - Histórico de viagens

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

### Backend

Desenvolvido com Node.js e Express, utilizando o Firebase como banco de dados e sistema de autenticação.

```
backend/
├── server.js          # Ponto de entrada da aplicação
├── src/
│   ├── config/        # Configurações (Firebase, Swagger)
│   ├── controller/    # Controladores da aplicação
│   ├── models/        # Modelos de dados
│   └── routes/        # Rotas da API
```

### Frontend

Desenvolvido com Vue.js 3 e TypeScript, utilizando Vite como ferramenta de build.

```
frontend/
├── index.html         # Página HTML principal
├── src/
│   ├── assets/        # Recursos estáticos (CSS, imagens)
│   ├── config/        # Configurações do cliente
│   ├── interfaces/    # Interfaces TypeScript
│   ├── router/        # Configuração de rotas
│   ├── services/      # Serviços para comunicação com a API
│   ├── store/         # Gerenciamento de estado
│   └── views/         # Componentes de página
```

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- Firebase (Firestore)
- Swagger (Documentação da API)

### Frontend
- Vue.js 3
- TypeScript
- Vite
- Axios
- Vue Router
- Google Maps API

## Começando

### Pré-requisitos

- Node.js (v14 ou superior)
- NPM ou Yarn
- Projeto no Google Cloud: permite obter chaves de API

### Instalação local

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/carpoool.git
cd carpoool
```

2. Configure o backend
```bash
cd backend
npm install
```

3. Configure o frontend
```bash
cd frontend
npm install
# Configure o arquivo .env com a URL da API
# Exemplo:
# VITE_API_URL=http://localhost:3000
```

4. Configurar as variáveis de ambiente
### Backend
```bash
SERVER_PATH = http://localhost:PORTA_DO_SERVER
SERVER_PORT = PORTA_DO_SERVER
MAPS_API_KEY = CHAVE_DO_GOOGLE_MAPS_API
FRONTEND_URL = http://localhost:PORTA_DO_FRONT
FIREBASE_SERVICE_ACCOUNT_JSON = CHAVE_DO_FIRESTORE
```

### Frontend
```bash
VITE_GOOGLE_MAPS_API_KEY = CHAVE_DO_GOOGLE_MAPS_API
VITE_MAP_ID = CHAVE_PARA_RENDERIZAR_MAPA
VITE_API_URL = http://localhost:PORTA_DO_SERVER
```

### Executando o Projeto

1. Inicie o servidor backend
```bash
cd backend
npm start
```

2. Inicie o servidor frontend de desenvolvimento
```bash
cd frontend
npm run dev
```

## Documentação da API

A documentação da API está disponível através do Swagger UI em `http://localhost:3000/api-docs` quando o servidor backend está em execução.

## Contribuindo

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas alterações (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença Apache 2.0 - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

Nome do Projeto: [Carpoool](https://github.com/seu-usuario/carpoool)

## Agradecimentos

- [Google Maps API](https://developers.google.com/maps)
- [Firebase](https://firebase.google.com)
- [Vue.js](https://vuejs.org)
- Todos os contribuidores que ajudam a tornar este projeto melhor!