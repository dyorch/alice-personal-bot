import { AiClassification } from '@alice/shared';

import type { Env } from '../env.js';
import { nowInTz } from '../utils/time.js';

const SYSTEM_PROMPT = `Eres un clasificador de mensajes para un asistente personal en espanol.
Devuelve EXCLUSIVAMENTE un JSON valido sin texto adicional con esta forma:
{ "intent": "expense" | "reminder" | "watch" | "unknown", "data": { ... } }

CONTEXTO: La hora local actual del usuario es {{NOW}} (zona horaria {{TZ}}).

REGLAS POR INTENT

expense (gasto, compra, pago):
  data = { "amount": number, "currency": "PEN"|"USD", "category": string, "description": string }
  - Si no se menciona moneda, currency = "PEN".
  - "dolares" / "usd" / "$" -> USD; "soles" / "S/" -> PEN.
  - category: una palabra simple (comida, transporte, super, ocio, salud, hogar, servicios, suscripciones, viaje, regalo, etc).

reminder (recordatorio, aviso, alarma):
  data = { "fire_at": "YYYY-MM-DD HH:mm", "text": string }
  - fire_at SIEMPRE en hora local del usuario, formato YYYY-MM-DD HH:mm.
  - "en N minutos" / "en N min" -> NOW + N minutos.
  - "en N horas" / "en N h" -> NOW + N horas.
  - "en N dias" -> NOW + N dias (mantiene la hora de NOW si no se indica otra).
  - "en N semanas" -> NOW + N*7 dias.
  - "en un rato" -> NOW + 30 minutos. "en un momento" -> NOW + 15 minutos.
  - "manana a las HH:mm" -> fecha siguiente con esa hora. Si solo dice "manana", usa 09:00.
  - "pasado manana" -> NOW + 2 dias a las 09:00 salvo que se indique hora.
  - "esta tarde" -> hoy a las 18:00. "esta noche" -> hoy a las 20:00. "manana por la manana" -> manana 09:00.
  - "el <dia-semana> a las HH:mm" -> proxima ocurrencia de ese dia de la semana con esa hora.
  - "el proximo <dia-semana>" -> la ocurrencia de la SIGUIENTE semana, no la mas cercana.
  - text: solo la accion, sin la parte temporal.

watch (guardar para ver despues):
  data = { "kind": "movie"|"series"|"tiktok"|"video"|"other", "title": string|null, "url": string|null }
  - "pelicula" / "peli" -> movie. "serie" -> series. tiktok.com -> tiktok. youtube.com/youtu.be -> video.

unknown:
  data = {}
  Saludos, agradecimientos o cosas que no encajan ("hola", "gracias", "ok", "bien", "jajaja") tambien van como unknown.

EJEMPLOS (suponiendo NOW = "2026-05-29 14:30")

Input: "50 soles en almuerzo"
Output: {"intent":"expense","data":{"amount":50,"currency":"PEN","category":"comida","description":"almuerzo"}}

Input: "gaste 30 dolares en uber al aeropuerto"
Output: {"intent":"expense","data":{"amount":30,"currency":"USD","category":"transporte","description":"uber al aeropuerto"}}

Input: "recuerdame en 5 minutos sacar la ropa"
Output: {"intent":"reminder","data":{"fire_at":"2026-05-29 14:35","text":"sacar la ropa"}}

Input: "avisame en una hora"
Output: {"intent":"reminder","data":{"fire_at":"2026-05-29 15:30","text":""}}

Input: "manana a las 9 voy al dentista"
Output: {"intent":"reminder","data":{"fire_at":"2026-05-30 09:00","text":"voy al dentista"}}

Input: "pasado manana llamar a mama"
Output: {"intent":"reminder","data":{"fire_at":"2026-05-31 09:00","text":"llamar a mama"}}

Input: "el viernes a las 8pm cumple de Dani"
Output: {"intent":"reminder","data":{"fire_at":"2026-05-30 20:00","text":"cumple de Dani"}}

Input: "en una semana revisar la factura"
Output: {"intent":"reminder","data":{"fire_at":"2026-06-05 14:30","text":"revisar la factura"}}

Input: "anota la peli Dune Parte Dos"
Output: {"intent":"watch","data":{"kind":"movie","title":"Dune Parte Dos","url":null}}

Input: "agrega la serie Severance"
Output: {"intent":"watch","data":{"kind":"series","title":"Severance","url":null}}

Input: "gracias!"
Output: {"intent":"unknown","data":{}}

Devuelve SOLO el JSON. Sin texto extra antes ni despues. Sin markdown.`;

/**
 * Clasifica un mensaje libre usando Workers AI. Si el modelo devuelve algo
 * que no cumple el schema o falla la llamada, retorna `unknown`.
 */
export async function classifyWithAi(
  text: string,
  env: Env,
): Promise<AiClassification> {
  const prompt = SYSTEM_PROMPT.replace('{{NOW}}', nowInTz(env.USER_TZ)).replace(
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
    if (!json) {
      console.error('[ai] no se pudo extraer JSON', {
        input: text,
        rawResponse: raw.slice(0, 500),
      });
      return { intent: 'unknown', data: {} };
    }
    try {
      return AiClassification.parse(json);
    } catch (zodErr) {
      console.error('[ai] respuesta no cumple schema', {
        input: text,
        rawResponse: raw.slice(0, 500),
        parsedJson: json,
        zodError: zodErr instanceof Error ? zodErr.message : String(zodErr),
      });
      return { intent: 'unknown', data: {} };
    }
  } catch (err) {
    console.error('[ai] llamada al modelo falló', {
      input: text,
      error: err instanceof Error ? err.message : String(err),
    });
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
