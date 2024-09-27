import type { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Listar todos (Read - List)
export const listTodoController = async (request: Request, response: Response) => {
  try {
    const todos = await prisma.todo.findMany({
      include: { user: true },
    });
    response.status(200).json(todos);
  } catch (error) {
    console.error('Erro ao listar todos:', error);
    response.status(500).json({ message: 'Erro interno do servidor ao listar todos' });
  }
};

// Criar todo (Create)
export const createTodoController = async (request: Request, response: Response) => {
  try {
    const { title, userId } = request.body;

    if(!userId){
      return response.send({
        error: 'Not authorized'
      })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }, 
      select: {
        id: true,
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
        _count: {
          select: {
            todos: true
          }
        }
      } 
    })

    if(!user){
      return response.send({
        error: 'Not authorized'
      })
    }

    console.log("todos - ", user._count.todos)

    const hasQuotaAvailable = user._count.todos < 5
    const hasActiveSubscription = !!user.stripeSubscriptionId

    if (!hasQuotaAvailable && !hasActiveSubscription && user.stripeSubscriptionStatus !== 'complete') {
      return response.send({
        error: 'Not quota vailable. Please upgrade to pro plan.'
      });
    }

    const newTodo = await prisma.todo.create({
      data: { title, userId: userId },
      include: { user: true },
    });
    response.status(201).json(newTodo);
  } catch (error) {
    console.error('Erro ao criar todo:', error);
    response.status(500).json({ message: 'Erro interno do servidor ao criar todo' });
  }
};

// Obter um todo específico (Read - Single)
export const getTodoController = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const todo = await prisma.todo.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });
    if (todo) {
      response.status(200).json(todo);
    } else {
      response.status(404).json({ message: 'Todo não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter todo:', error);
    response.status(500).json({ message: 'Erro interno do servidor ao obter todo' });
  }
};

// Atualizar todo (Update)
export const updateTodoController = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const { title, done } = request.body;
    const updatedTodo = await prisma.todo.update({
      where: { id: Number(id) },
      data: { title, done },
      include: { user: true },
    });
    response.status(200).json(updatedTodo);
  } catch (error) {
    console.error('Erro ao atualizar todo:', error);
    response.status(500).json({ message: 'Erro interno do servidor ao atualizar todo' });
  }
};

// Excluir todo (Delete)
export const deleteTodoController = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    await prisma.todo.delete({
      where: { id: Number(id) },
    });
    response.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir todo:', error);
    response.status(500).json({ message: 'Erro interno do servidor ao excluir todo' });
  }
};
