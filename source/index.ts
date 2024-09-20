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

const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});