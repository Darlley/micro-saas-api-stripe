import type { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Listar usuários (Read - List)
export const listUserController = async (request: Request, response: Response) => {
  try {
    const users = await prisma.user.findMany();
    response.status(200).json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    response.status(500).json({ message: 'Erro interno do servidor ao listar usuários' });
  }
};

// Criar usuário (Create)
export const createUserController = async (request: Request, response: Response) => {
  try {
    const { nome, email } = request.body;
    const newUser = await prisma.user.create({
      data: { nome, email },
    });
    response.status(201).json(newUser);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    response.status(500).json({ message: 'Erro interno do servidor ao criar usuário' });
  }
};

// Obter um usuário específico (Read - Single)
export const getUserController = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const user = await prisma.user.findUnique({
      where: { id: id as string },
    });
    if (user) {
      response.status(200).json(user);
    } else {
      response.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    response.status(500).json({ message: 'Erro interno do servidor ao obter usuário' });
  }
};

// Atualizar usuário (Update)
export const updateUserController = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const { nome, email } = request.body;
    const updatedUser = await prisma.user.update({
      where: { id: id as string },
      data: { nome, email },
    });
    response.status(200).json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    response.status(500).json({ message: 'Erro interno do servidor ao atualizar usuário' });
  }
};

// Excluir usuário (Delete)
export const deleteUserController = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    await prisma.user.delete({
      where: { id: id },
    });
    response.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    response.status(500).json({ message: 'Erro interno do servidor ao excluir usuário' });
  }
};
