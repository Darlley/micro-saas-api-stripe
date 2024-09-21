import type { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createCheckoutSession } from '../lib/stripe';

export const createCheckoutController = async (req: Request, res: Response) => {
  const { userId } = req.body;

  // Verificar se o userId foi fornecido
  if (!userId) {
    return res.status(400).json({ error: 'ID do usuário não fornecido' });
  }

  try {
    // Verificar se o usuário existe no banco de dados
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Continuar com a lógica de criação do checkout
    const checkout = await createCheckoutSession(userId);
    return res.send(checkout);
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
