import { z } from 'zod';

/**
 * Schema permisivo del payload que Meta envia al webhook. Solo se valida lo
 * que realmente consume el bot; el resto queda en `passthrough` para no
 * romper si Meta agrega campos en el futuro.
 *
 * Doc: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
 */

export const WhatsAppTextMessage = z
  .object({
    from: z.string(),
    id: z.string(),
    timestamp: z.string(),
    type: z.literal('text'),
    text: z.object({ body: z.string() }),
  })
  .passthrough();

export const WhatsAppOtherMessage = z
  .object({
    from: z.string(),
    id: z.string(),
    timestamp: z.string(),
    type: z.string(),
  })
  .passthrough();

export const WhatsAppMessage = z.union([WhatsAppTextMessage, WhatsAppOtherMessage]);
export type WhatsAppMessage = z.infer<typeof WhatsAppMessage>;

export const WhatsAppContact = z
  .object({
    profile: z.object({ name: z.string() }).optional(),
    wa_id: z.string().optional(),
  })
  .passthrough();

export const WhatsAppChangeValue = z
  .object({
    messaging_product: z.literal('whatsapp').optional(),
    metadata: z
      .object({
        display_phone_number: z.string().optional(),
        phone_number_id: z.string().optional(),
      })
      .passthrough()
      .optional(),
    contacts: z.array(WhatsAppContact).optional(),
    messages: z.array(WhatsAppMessage).optional(),
    statuses: z.array(z.record(z.unknown())).optional(),
  })
  .passthrough();

export const WhatsAppWebhookPayload = z
  .object({
    object: z.literal('whatsapp_business_account'),
    entry: z.array(
      z
        .object({
          id: z.string().optional(),
          changes: z.array(
            z
              .object({
                field: z.string().optional(),
                value: WhatsAppChangeValue,
              })
              .passthrough(),
          ),
        })
        .passthrough(),
    ),
  })
  .passthrough();
export type WhatsAppWebhookPayload = z.infer<typeof WhatsAppWebhookPayload>;
