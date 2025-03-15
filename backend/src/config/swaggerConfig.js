import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Configuração do Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Carpoool API',
      version: '1.0.0',
      description: 'API documentation for Carpoool project',
    },
    servers: [
      {
        url: `http://localhost:${process.env.SERVER_PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controller/*.js'], // Caminho para os arquivos que contêm as anotações do Swagger
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };