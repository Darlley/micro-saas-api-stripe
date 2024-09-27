import Stripe from 'stripe';
import { config } from '../config';
import prisma from './prisma';

// Inicializa a instância do Stripe com a chave secreta e a versão da API
export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-06-20', // Usa a versão mais recente da API do Stripe
  httpClient: Stripe.createFetchHttpClient(),
});

export const getStripeCustomerByEmail = async (email: string) => {
  const customer = await stripe.customers.list({
    email
  });
  return customer.data[0];
};

export const createStripeCustomer = async (userEmail: string, userName?: string) => {
  let customer = await getStripeCustomerByEmail(userEmail);

  if (!customer) {
    customer = await stripe.customers.create({
      email: userEmail,
      name: userName,
    });

    return customer;
  }

  return customer;
}

/**
 * Cria uma sessão de checkout do Stripe para um usuário específico.
 * @param userId - O ID do usuário para quem a sessão de checkout está sendo criada.
 * @returns Um objeto contendo a URL da sessão de checkout ou uma mensagem de erro.
 */
export const createCheckoutSession = async (userId: string, userEmail: string) => {
  try {
    let customer = await createStripeCustomer(userEmail);
    
    // Verifica se o ID de preço do plano Pro está configurado
    if (!config.stripe.proPriceId) {
      throw new Error('ID de preço não configurado');
    }

    // Cria a sessão de checkout com as configurações necessárias
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Aceita pagamentos com cartão
      mode: 'subscription', // Modo de assinatura
      client_reference_id: userId, // Referência ao usuário no sistema
      customer: customer.id,
      success_url: 'http://localhost:3000/?success=true', // URL de redirecionamento em caso de sucesso
      cancel_url: 'http://localhost:3000/?success=false', // URL de redirecionamento em caso de cancelamento
      line_items: [
        {
          price: config.stripe.proPriceId, // ID do preço do plano Pro
          quantity: 1, // Quantidade do item (assinatura)
        },
      ]
    });

    // Retorna a URL da sessão de checkout
    return {
      url: session.url,
    };
  } catch (error) {
    throw error;
  }
};

// Função para processar webhooks de checkout (a ser implementada)
export const handleProcessWebhookCheckout = async (event: Stripe.Checkout.Session) => {
  const clientReferenceId = event.client_reference_id;
  const stripeSubscriptionId = event.subscription as string;
  const stripeCustomerId = event.customer as string;
  const stripeSubscriptionStatus = event.status;

  if (stripeSubscriptionStatus !== 'complete') return;

  if (!clientReferenceId || !stripeSubscriptionId || !stripeCustomerId)
    throw new Error(
      'clientReferenceId, stripeSubscriptionId or stripeCustomerId is missing'
    );

  const userExists = await prisma.user.findUnique({
    where: {
      id: clientReferenceId,
    },
    select: {
      id: true,
    },
  });

  if (!userExists) throw new Error('User not found');

  await prisma.user.update({
    where: {
      id: clientReferenceId,
    },
    data: {
      stripeSubscriptionId,
      stripeSubscriptionStatus,
      stripeCustomerId,
    },
  });
};

// Função para processar webhooks de atualização de assinatura (a ser implementada)
export const handleProcessWebhookUpdatedSubscription = async (event: Stripe.Subscription) => {
  const stripeCustomerId = event.customer as string;
  const stripeSubscriptionId = event.id as string;
  const stripeSubscriptionStatus = event.status;

  const userExists = await prisma.user.findFirst({
    where: {
      stripeCustomerId,
    },
    select: {
      id: true,
    },
  });

  if (!userExists) throw new Error('User of stripeCustomerId not found');

  await prisma.user.update({
    where: {
      id: userExists.id,
    },
    data: {
      stripeSubscriptionId,
      stripeCustomerId,
      stripeSubscriptionStatus,
    },
  });
};
