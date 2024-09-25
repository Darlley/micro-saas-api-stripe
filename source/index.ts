import express from 'express';
import {
  listUserController,
  createUserController,
  getUserController,
  updateUserController,
  deleteUserController
} from './controllers/user.controller';
import {
  listTodoController,
  createTodoController,
  getTodoController,
  updateTodoController,
  deleteTodoController
} from './controllers/todo.controller';
import { createCheckoutController } from './controllers/checkout.controller';
import { stripeWebhookController } from './controllers/stripe.controller';

const app = express();
const port = 3000;

app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhookController);

app.use(express.json()); // Adiciona middleware para parsing de JSON

// Rotas de usuário
app.get('/users', listUserController);
app.post('/users', createUserController);
app.get('/users/:id', getUserController);
app.put('/users/:id', updateUserController);
app.delete('/users/:id', deleteUserController);

// Rotas de todo
app.get('/todos', listTodoController);
app.post('/todos', createTodoController);
app.get('/todos/:id', getTodoController);
app.put('/todos/:id', updateTodoController);
app.delete('/todos/:id', deleteTodoController);

app.post('/checkout', createCheckoutController);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});