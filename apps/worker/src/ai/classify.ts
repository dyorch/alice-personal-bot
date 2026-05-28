import { AiClassification } from '@alice/shared';

import type { Env } from '../env.js';

const SYSTEM_PROMPT = `Eres un clasificador de mensajes para un asistente personal en espanol.
Devuelve EXCLUSIVAMENTE un JSON valido sin texto adicional con esta forma:
{ "intent": "expense" | "reminder" | "watch" | "unknown", "data": { ... } }

Reglas por intent:
- expense: data = { "amount": number, "currency": "PEN"|"USD", "category": string, "description": string }
  (si no se menciona moneda, currency = "PEN")
- reminder: data = { "fire_at": "YYYY-MM-DD HH:mm", "text": string }
  Las fechas son relativas a NOW={{NOW}} y zona horaria {{TZ}}.
- watch: data = { "kind": "movie"|"series"|"tiktok"|"video"|"other", "title": string|null, "url": string|null }

Si dudas, intent = "unknown" con data = {}.
No agregues comentarios ni explicaciones.`;

/**
 * Clasifica un mensaje libre usando Workers AI. Si el modelo devuelve algo
 * que no cumple el schema o falla la llamada, retorna `unknown`.
 */
export async function classifyWithAi(
  text: string,
  env: Env,
): Promise<AiClassification> {
  const prompt = SYSTEM_PROMPT.replace('{{NOW}}', new Date().toISOString()).replace(
    '{{TZ}}',
    env.USER_TZ,
  );

  try {
    const result = (await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text },
      ],
    })) as { response?: string };
    const raw = result.response ?? '';
    const json = extractJson(raw);
    if (!json) return { intent: 'unknown', data: {} };
    return AiClassification.parse(json);
  } catch (err) {
    console.error('[ai] clasificacion fallida', err);
    return { intent: 'unknown', data: {} };
  }
}

/** Extrae el primer objeto JSON valido de un string posiblemente sucio. */
function extractJson(text: string): unknown | null {
  const trimmed = text.trim();
  // Caso comun: el modelo devuelve solo el JSON.
  try {
    return JSON.parse(trimmed);
  } catch {
    // Buscar el primer { ... } balanceado.
    const start = trimmed.indexOf('{');
    if (start < 0) return null;
    let depth = 0;
    for (let i = start; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          const candidate = trimmed.slice(start, i + 1);
          try {
            return JSON.parse(candidate);
          } catch {
            return null;
          }
        }
      }
    }
    return null;
  }
}
