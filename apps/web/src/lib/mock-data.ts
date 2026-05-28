import type {
  Currency,
  Expense,
  MessageLogEntry,
  Reminder,
  WatchlistItem,
  WatchlistKind,
} from './types';

// Datos inventados para el mockup visual. NO hay conexion real con el Worker
// ni con D1; todo se sirve desde estas estructuras en memoria.

/** "Ahora" fijo para que el mockup sea determinista. Zona horaria de Lima. */
export const NOW = new Date('2026-05-27T14:30:00-05:00');

export const EXPENSE_CATEGORIES = [
  'comida',
  'transporte',
  'super',
  'ocio',
  'salud',
  'hogar',
  'servicios',
  'suscripciones',
] as const;

export const expenses: Expense[] = [
  // --- Mayo 2026 (mes actual) ---
  exp(151, 18.5, 'PEN', 'comida', 'menu del dia', '2026-05-27'),
  exp(150, 12, 'PEN', 'transporte', 'pasaje combi ida y vuelta', '2026-05-27'),
  exp(149, 220.4, 'PEN', 'super', 'compra semanal Plaza Vea', '2026-05-26'),
  exp(148, 35, 'PEN', 'ocio', 'entradas al cine', '2026-05-25'),
  exp(147, 9.9, 'USD', 'suscripciones', 'ChatGPT Plus', '2026-05-25'),
  exp(146, 28, 'PEN', 'transporte', 'uber a casa', '2026-05-24'),
  exp(145, 64.5, 'PEN', 'comida', 'almuerzo con Dani', '2026-05-23'),
  exp(144, 159.9, 'PEN', 'servicios', 'recibo de luz', '2026-05-22'),
  exp(143, 30, 'USD', 'transporte', 'uber al aeropuerto', '2026-05-22'),
  exp(142, 230, 'PEN', 'super', 'super del mes', '2026-05-20'),
  exp(141, 44.9, 'PEN', 'suscripciones', 'Netflix + Spotify', '2026-05-19'),
  exp(140, 22, 'PEN', 'comida', 'desayuno', '2026-05-19'),
  exp(139, 85, 'PEN', 'salud', 'farmacia', '2026-05-18'),
  exp(138, 15, 'PEN', 'transporte', 'taxi corto', '2026-05-17'),
  exp(137, 120, 'PEN', 'ocio', 'cena de cumple', '2026-05-16'),
  exp(136, 52.3, 'PEN', 'comida', 'mercado verduras', '2026-05-15'),
  exp(135, 18, 'USD', 'ocio', 'juego en Steam', '2026-05-14'),
  exp(134, 99.9, 'PEN', 'servicios', 'internet fibra', '2026-05-12'),
  exp(133, 38, 'PEN', 'transporte', 'uber reunion', '2026-05-11'),
  exp(132, 175, 'PEN', 'hogar', 'utiles de limpieza', '2026-05-10'),
  exp(131, 27.5, 'PEN', 'comida', 'pollo a la brasa', '2026-05-09'),
  exp(130, 200, 'PEN', 'salud', 'consulta dentista', '2026-05-07'),
  exp(129, 13.5, 'PEN', 'transporte', 'pasajes', '2026-05-06'),
  exp(128, 245.8, 'PEN', 'super', 'compra grande Tottus', '2026-05-04'),
  exp(127, 49, 'PEN', 'comida', 'pizza familiar', '2026-05-03'),
  exp(126, 60, 'PEN', 'ocio', 'salida amigos', '2026-05-02'),
  exp(125, 110, 'PEN', 'servicios', 'recibo de agua', '2026-05-01'),

  // --- Abril 2026 (mes anterior, para la comparativa) ---
  exp(124, 230, 'PEN', 'super', 'super del mes', '2026-04-28'),
  exp(123, 159.9, 'PEN', 'servicios', 'recibo de luz', '2026-04-22'),
  exp(122, 44.9, 'PEN', 'suscripciones', 'Netflix + Spotify', '2026-04-19'),
  exp(121, 320, 'PEN', 'salud', 'examenes de laboratorio', '2026-04-15'),
  exp(120, 99.9, 'PEN', 'servicios', 'internet fibra', '2026-04-12'),
  exp(119, 180, 'PEN', 'ocio', 'concierto', '2026-04-10'),
  exp(118, 250, 'PEN', 'super', 'compra quincena', '2026-04-05'),
  exp(117, 75, 'PEN', 'comida', 'varios', '2026-04-03'),
];

export const reminders: Reminder[] = [
  rem(42, 'pagar recibo de luz', '2026-06-01T14:00:00Z', false), // 09:00 Lima
  rem(41, 'renovar SOAT del auto', '2026-05-29T13:00:00Z', false), // 08:00 Lima
  rem(40, 'llamar al dentista para control', '2026-05-28T18:30:00Z', false), // 13:30 Lima
  rem(39, 'comprar regalo de mama', '2026-05-27T23:00:00Z', false), // 18:00 Lima hoy
  rem(38, 'reunion con el contador', '2026-06-03T15:00:00Z', false), // 10:00 Lima
  rem(37, 'sacar pasaje a Cusco', '2026-06-10T16:00:00Z', false),
  rem(36, 'tomar la pastilla', '2026-05-26T13:00:00Z', true),
  rem(35, 'enviar informe mensual', '2026-05-25T22:00:00Z', true),
  rem(34, 'pagar tarjeta de credito', '2026-05-20T14:00:00Z', true),
];

export const watchlist: WatchlistItem[] = [
  watch(28, 'movie', 'Dune: Parte Dos', null, 'recomendada por Dani', false, '2026-05-26'),
  watch(
    27,
    'series',
    'Severance — Temporada 2',
    null,
    'seguir desde el ep. 3',
    false,
    '2026-05-24',
  ),
  watch(
    26,
    'tiktok',
    'Receta de lomo saltado en 1 min',
    'https://www.tiktok.com/@cocinaperu/video/7300000000000000000',
    null,
    false,
    '2026-05-23',
  ),
  watch(
    25,
    'video',
    'Cloudflare Workers en 100 segundos',
    'https://www.youtube.com/watch?v=H7Qe96fqg1M',
    'para el proyecto Alice',
    false,
    '2026-05-21',
  ),
  watch(24, 'movie', 'Oppenheimer', null, null, false, '2026-05-18'),
  watch(
    23,
    'series',
    'The Last of Us — Temporada 2',
    null,
    null,
    false,
    '2026-05-15',
  ),
  watch(
    22,
    'other',
    'Articulo: arquitectura serverless',
    'https://example.com/serverless-architecture',
    null,
    false,
    '2026-05-12',
  ),
  watch(21, 'movie', 'Pobres Criaturas', null, null, true, '2026-04-30', '2026-05-10'),
  watch(
    20,
    'video',
    'Tutorial Next.js App Router',
    'https://www.youtube.com/watch?v=gSSsZReIFRk',
    null,
    true,
    '2026-04-22',
    '2026-05-02',
  ),
  watch(
    19,
    'tiktok',
    'Tip de productividad',
    'https://www.tiktok.com/@productividad/video/7290000000000000000',
    null,
    true,
    '2026-04-18',
    '2026-04-20',
  ),
];

const ALLOWED_PHONE = '51987654321';

export const messageLog: MessageLogEntry[] = [
  logIn(312, ALLOWED_PHONE, 'Yorch', 'menu del dia 18.50 comida', 'expense', '2026-05-27T19:31:00Z'),
  logOut(311, ALLOWED_PHONE, 'Gasto registrado: S/ 18.50 comida (ID #151)', '2026-05-27T19:31:02Z'),
  logIn(310, ALLOWED_PHONE, 'Yorch', '/recordar 2026-06-01 09:00 pagar recibo de luz', 'reminder', '2026-05-27T16:05:00Z'),
  logOut(309, ALLOWED_PHONE, 'Recordatorio creado para el 01 jun 09:00 (ID #42)', '2026-05-27T16:05:01Z'),
  logIn(308, ALLOWED_PHONE, 'Yorch', 'https://www.tiktok.com/@cocinaperu/video/7300000000000000000', 'watch', '2026-05-27T15:40:00Z'),
  logOut(307, ALLOWED_PHONE, 'Guardado en watchlist (tiktok) ID #26', '2026-05-27T15:40:01Z'),
  logRejected(306, '51900111222', 'Maria L.', 'Hola, vendo seguros, le interesa?', 'rejected_unknown_sender', '2026-05-27T11:20:00Z'),
  logIn(305, ALLOWED_PHONE, 'Yorch', '/gastos hoy', 'expense', '2026-05-27T08:15:00Z'),
  logOut(304, ALLOWED_PHONE, 'Hoy: S/ 30.50 (2 gastos)', '2026-05-27T08:15:00Z'),
  logRejected(303, '14155550199', null, 'Your package could not be delivered. Confirm here: bit.ly/xxxx', 'rejected_unknown_sender', '2026-05-26T22:48:00Z'),
  logRejected(302, '51900111222', 'Maria L.', 'Le envio mas info?', 'rejected_unknown_sender', '2026-05-26T18:02:00Z'),
  logIn(301, ALLOWED_PHONE, 'Yorch', 'compra semanal 220.40 super plaza vea', 'expense', '2026-05-26T16:30:00Z'),
  logOut(300, ALLOWED_PHONE, 'Gasto registrado: S/ 220.40 super (ID #149)', '2026-05-26T16:30:02Z'),
  logIn(299, ALLOWED_PHONE, 'Yorch', '/ver lista', 'watch', '2026-05-25T20:10:00Z'),
  logOut(298, ALLOWED_PHONE, 'Pendientes: 7 (3 pelis, 2 series, 2 enlaces)', '2026-05-25T20:10:00Z'),
  logInvalidSignature(297, '2026-05-25T03:14:00Z'),
  logIn(296, ALLOWED_PHONE, 'Yorch', 'recuerdame llamar al dentista mañana 1:30pm', 'reminder', '2026-05-24T17:00:00Z'),
  logOut(295, ALLOWED_PHONE, 'Recordatorio creado para el 28 may 13:30 (ID #40)', '2026-05-24T17:00:01Z'),
  logRejected(294, '5219991234567', 'Promo Tienda', 'PROMO: 50% dscto solo hoy!!', 'rejected_unknown_sender', '2026-05-23T13:05:00Z'),
  logIn(293, ALLOWED_PHONE, 'Yorch', 'anota la peli Dune Parte Dos', 'watch', '2026-05-26T01:00:00Z'),
];

// ---------------------------------------------------------------------------
// Helpers derivados que consumen las paginas
// ---------------------------------------------------------------------------

const MONTH_CURRENT = '2026-05';
const MONTH_PREVIOUS = '2026-04';

export interface CurrencyTotal {
  currency: Currency;
  total: number;
  count: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

function sumByCurrency(items: Expense[]): CurrencyTotal[] {
  const map = new Map<Currency, { total: number; count: number }>();
  for (const e of items) {
    const acc = map.get(e.currency) ?? { total: 0, count: 0 };
    acc.total += e.amount;
    acc.count += 1;
    map.set(e.currency, acc);
  }
  return [...map.entries()].map(([currency, v]) => ({ currency, ...v }));
}

export function expensesInMonth(month: string): Expense[] {
  return expenses.filter((e) => e.spentAt.startsWith(month));
}

export function expensesToday(): Expense[] {
  return expenses.filter((e) => e.spentAt === '2026-05-27');
}

/** Total del mes actual por moneda + diferencia porcentual vs mes anterior (PEN). */
export function monthSummary() {
  const current = expensesInMonth(MONTH_CURRENT);
  const previous = expensesInMonth(MONTH_PREVIOUS);
  const totalsByCurrency = sumByCurrency(current);

  const penNow = current
    .filter((e) => e.currency === 'PEN')
    .reduce((s, e) => s + e.amount, 0);
  const penPrev = previous
    .filter((e) => e.currency === 'PEN')
    .reduce((s, e) => s + e.amount, 0);
  const penDeltaPct = penPrev === 0 ? 0 : ((penNow - penPrev) / penPrev) * 100;

  return { totalsByCurrency, penNow, penPrev, penDeltaPct };
}

/** Top categorias del mes actual (solo PEN, que es el grueso). */
export function topCategories(limit = 3): CategoryTotal[] {
  return categoryTotals('PEN', MONTH_CURRENT).slice(0, limit);
}

export function categoryTotals(currency: Currency, month = MONTH_CURRENT): CategoryTotal[] {
  const map = new Map<string, number>();
  for (const e of expensesInMonth(month)) {
    if (e.currency !== currency) continue;
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  }
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export interface DailyTotal {
  /** Dia del mes, 1-31. */
  day: number;
  total: number;
}

/** Gasto en PEN por dia del mes actual (para la grafica de barras). */
export function dailyTotalsCurrentMonth(): DailyTotal[] {
  const daysInMonth = 31;
  const totals = new Map<number, number>();
  for (const e of expensesInMonth(MONTH_CURRENT)) {
    if (e.currency !== 'PEN') continue;
    const day = Number(e.spentAt.slice(8, 10));
    totals.set(day, (totals.get(day) ?? 0) + e.amount);
  }
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return { day, total: Math.round((totals.get(day) ?? 0) * 100) / 100 };
  });
}

export function pendingReminders(): Reminder[] {
  return reminders
    .filter((r) => !r.sent)
    .sort((a, b) => a.fireAt.localeCompare(b.fireAt));
}

export function sentReminders(): Reminder[] {
  return reminders
    .filter((r) => r.sent)
    .sort((a, b) => b.fireAt.localeCompare(a.fireAt));
}

/** Recordatorios pendientes dentro de los proximos `days` dias. */
export function upcomingReminders(days = 7): Reminder[] {
  const limit = new Date(NOW.getTime() + days * 86_400_000);
  return pendingReminders().filter((r) => new Date(r.fireAt) <= limit);
}

export function watchlistPending(): WatchlistItem[] {
  return watchlist.filter((w) => !w.watched);
}

export function watchlistWatched(): WatchlistItem[] {
  return watchlist.filter((w) => w.watched);
}

export function watchlistCountsByKind(): Record<WatchlistKind, number> {
  const counts = { movie: 0, series: 0, tiktok: 0, video: 0, other: 0 };
  for (const w of watchlistPending()) counts[w.kind] += 1;
  return counts;
}

export function incomingMessages(): MessageLogEntry[] {
  return messageLog
    .filter((m) => m.direction === 'in')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface MessageLogStats {
  receivedToday: number;
  rejectedToday: number;
  distinctUnknownSenders30d: number;
  rejectionsLast24h: number;
}

export function messageLogStats(): MessageLogStats {
  const incoming = messageLog.filter((m) => m.direction === 'in');
  const today = '2026-05-27';
  const since24h = new Date(NOW.getTime() - 86_400_000);
  const since30d = new Date(NOW.getTime() - 30 * 86_400_000);

  const receivedToday = incoming.filter((m) => m.createdAt.startsWith(today)).length;
  const rejectedToday = incoming.filter(
    (m) => m.createdAt.startsWith(today) && m.status.startsWith('rejected'),
  ).length;
  const rejectionsLast24h = incoming.filter(
    (m) => m.status.startsWith('rejected') && new Date(m.createdAt) >= since24h,
  ).length;
  const distinctUnknownSenders30d = new Set(
    incoming
      .filter(
        (m) =>
          m.status === 'rejected_unknown_sender' &&
          m.senderPhone &&
          new Date(m.createdAt) >= since30d,
      )
      .map((m) => m.senderPhone),
  ).size;

  return { receivedToday, rejectedToday, distinctUnknownSenders30d, rejectionsLast24h };
}

// ---------------------------------------------------------------------------
// Constructores compactos
// ---------------------------------------------------------------------------

function exp(
  id: number,
  amount: number,
  currency: Currency,
  category: string,
  description: string,
  spentAt: string,
): Expense {
  const ts = `${spentAt}T12:00:00Z`;
  return { id, amount, currency, category, description, spentAt, createdAt: ts, updatedAt: ts };
}

function rem(id: number, text: string, fireAt: string, sent: boolean): Reminder {
  return { id, text, fireAt, sent, createdAt: '2026-05-20T12:00:00Z' };
}

function watch(
  id: number,
  kind: WatchlistKind,
  title: string,
  url: string | null,
  notes: string | null,
  watched: boolean,
  createdAt: string,
  watchedAt: string | null = null,
): WatchlistItem {
  return {
    id,
    kind,
    title,
    url,
    notes,
    watched,
    createdAt: `${createdAt}T12:00:00Z`,
    watchedAt: watchedAt ? `${watchedAt}T12:00:00Z` : null,
  };
}

function rawPayload(phone: string, name: string | null, body: string, waId: string): string {
  return JSON.stringify(
    {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                contacts: name ? [{ profile: { name }, wa_id: phone }] : undefined,
                messages: [
                  { from: phone, id: waId, type: 'text', text: { body }, timestamp: '1779999999' },
                ],
              },
            },
          ],
        },
      ],
    },
    null,
    2,
  );
}

function logIn(
  id: number,
  phone: string,
  name: string,
  body: string,
  intent: MessageLogEntry['intent'],
  createdAt: string,
): MessageLogEntry {
  const waId = `wamid.IN${id}`;
  return {
    id,
    direction: 'in',
    senderPhone: phone,
    senderName: name,
    waMessageId: waId,
    body,
    messageType: 'text',
    intent,
    status: 'allowed',
    rejectionReason: null,
    rawPayload: rawPayload(phone, name, body, waId),
    createdAt,
  };
}

function logOut(id: number, phone: string, body: string, createdAt: string): MessageLogEntry {
  return {
    id,
    direction: 'out',
    senderPhone: phone,
    senderName: null,
    waMessageId: `wamid.OUT${id}`,
    body,
    messageType: 'text',
    intent: null,
    status: 'sent',
    rejectionReason: null,
    rawPayload: '{}',
    createdAt,
  };
}

function logRejected(
  id: number,
  phone: string,
  name: string | null,
  body: string,
  status: MessageLogEntry['status'],
  createdAt: string,
): MessageLogEntry {
  const waId = `wamid.RJ${id}`;
  return {
    id,
    direction: 'in',
    senderPhone: phone,
    senderName: name,
    waMessageId: waId,
    body,
    messageType: 'text',
    intent: null,
    status,
    rejectionReason: 'remitente no autorizado (distinto de ALLOWED_PHONE)',
    rawPayload: rawPayload(phone, name, body, waId),
    createdAt,
  };
}

function logInvalidSignature(id: number, createdAt: string): MessageLogEntry {
  return {
    id,
    direction: 'in',
    senderPhone: '',
    senderName: null,
    waMessageId: null,
    body: '(cuerpo no leido: firma invalida)',
    messageType: 'other',
    intent: null,
    status: 'rejected_invalid_signature',
    rejectionReason: 'X-Hub-Signature-256 no coincide con WHATSAPP_APP_SECRET',
    rawPayload: '{"warning":"firma invalida, payload descartado"}',
    createdAt,
  };
}
