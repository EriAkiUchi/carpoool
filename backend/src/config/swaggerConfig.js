import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Configuração do Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Carpoool API',
      version: '1.0.0',
      description: 'Documentação da API do projeto Carpoool - Sistema de compartilhamento de caronas',
      contact: {
        name: 'Equipe Carpoool',
        email: 'contato@carpoool.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.SERVER_PORT}`,
        description: 'Servidor da API'
      },
    ],
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints relacionados à autenticação de usuários'
      },
      {
        name: 'Passageiros',
        description: 'Endpoints relacionados aos passageiros'
      },
      {
        name: 'Motoristas',
        description: 'Endpoints relacionados aos motoristas'
      },
      {
        name: 'Carros',
        description: 'Endpoints relacionados aos carros'
      },
      {
        name: 'Viagens',
        description: 'Endpoints relacionados às viagens'
      },
      {
        name: 'Solicitações',
        description: 'Endpoints relacionados às solicitações de carona'
      },
      {
        name: 'Mapas e Rotas',
        description: 'Endpoints relacionados a mapas e cálculos de rotas'
      },
      {
        name: 'Status',
        description: 'Endpoints relacionados ao status da API'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controller/*.js'], // Caminho para os arquivos que contêm as anotações do Swagger
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };