import Stripe from 'stripe';
import { config } from '../config';

// Inicializa a instância do Stripe com a chave secreta e a versão da API
export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-06-20', // Usa a versão mais recente da API do Stripe
});

/**
 * Cria uma sessão de checkout do Stripe para um usuário específico.
 * @param userId - O ID do usuário para quem a sessão de checkout está sendo criada.
 * @returns Um objeto contendo a URL da sessão de checkout ou uma mensagem de erro.
 */
export const createCheckoutSession = async (userId: string) => {
  try {
    // Verifica se o ID de preço do plano Pro está configurado
    if (!config.stripe.proPriceId) {
      throw new Error('ID de preço não configurado');
    }

    // Cria a sessão de checkout com as configurações necessárias
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Aceita pagamentos com cartão
      mode: 'subscription', // Modo de assinatura
      client_reference_id: userId, // Referência ao usuário no sistema
      success_url: 'http://localhost:3000/success.html', // URL de redirecionamento em caso de sucesso
      cancel_url: 'http://localhost:3000/cancel.html', // URL de redirecionamento em caso de cancelamento
      line_items: [
        {
          price: config.stripe.proPriceId, // ID do preço do plano Pro
          quantity: 1, // Quantidade do item (assinatura)
        },
      ],
    });

    // Retorna a URL da sessão de checkout
    return {
      url: session.url,
    };
  } catch (error) {
    // Loga o erro e retorna uma mensagem de erro genérica
    console.error('Erro ao criar sessão de checkout:', error);
    return {
      error: 'Erro ao gerar o checkout: ' + (error as Error).message,
    };
  }
};

// Função para processar webhooks de checkout (a ser implementada)
export const handleProcessWebhookCheckout = () => {};

// Função para processar webhooks de atualização de assinatura (a ser implementada)
export const handleProcessWebhookUpdatedSubscription = () => {};
