import type { Request, Response } from "express";
import { handleProcessWebhookCheckout, handleProcessWebhookUpdatedSubscription, stripe } from "../lib/stripe";
import { config } from "../config";
import Stripe from "stripe";

export const stripeWebhookController = async (req: Request, res: Response) => {
  let event: Stripe.Event = req.body;

  if(!config.stripe.webhookSecret){
    console.log("STRIPE_WEBHOOK_SECRET is not set");
    return res.sendStatus(400);
  }

  const signature = req.headers['stripe-signature'] as string;

  try {
    event = await stripe.webhooks.constructEventAsync(
      req.body, 
      signature, 
      config.stripe.webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return res.sendStatus(400);
  }

  try {
    // Processa diferentes tipos de eventos do Stripe
    switch (event.type) {
      case 'checkout.session.completed':
        // Lógica para lidar com uma sessão de checkout concluída
        console.log('Checkout concluído:', event.data.object);
        // Implemente aqui a lógica para atualizar o status do pedido, ativar a assinatura, etc.
        await handleProcessWebhookCheckout(event.data.object);
        break;

      case 'customer.subscription.created':
        // Lógica para lidar com uma nova assinatura criada
        console.log('Nova assinatura criada:', event);
        // Implemente aqui a lógica para registrar a nova assinatura no seu sistema
        break;

      case 'customer.subscription.updated':
        // Lógica para lidar com uma assinatura atualizada
        console.log('Assinatura atualizada:', event.data.object);
        // Implemente aqui a lógica para atualizar os detalhes da assinatura no seu sistema
        await handleProcessWebhookUpdatedSubscription(event.data.object);
        break;

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
    console.log(errorMessage);
    return res.status(500).json({ error: errorMessage });
  }


  // Return a response to acknowledge receipt of the event
  res.json({received: true});
}