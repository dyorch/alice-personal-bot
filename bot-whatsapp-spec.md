# Alice — Bot de WhatsApp + Dashboard

Asistente personal compuesto por dos superficies que comparten una sola base de datos:

1. **Bot de WhatsApp** (un único número) que actúa como asistente personal multi-módulo:
   - **Gastos** — registrar y consultar gastos.
   - **Recordatorios** — crear, listar y disparar recordatorios programados.
   - **Watchlist** — guardar películas, series y enlaces (TikTok, YouTube, etc.) para ver después.
2. **Dashboard web** (`dashboard.alice.dyorch.com`) para visualizar, editar y borrar los registros desde la PC con comodidad, protegido con Cloudflare Access.

Todo el sistema corre dentro de un plan Cloudflare (~5 USD/mes).

---

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Cloudflare Workers (TypeScript) |
| HTTP framework (worker bot) | Hono |
| Base de datos | Cloudflare D1 (SQLite serverless) |
| IA / NLP | Cloudflare Workers AI (Llama 3.1) |
| Scheduling | Cron Triggers de Workers |
| Mensajería | WhatsApp Cloud API (Meta) |
| Frontend | Vite + React 19 + TypeScript |
| Routing | TanStack Router (file-based + loaders) |
| Data fetching | TanStack Query |
| UI | Tailwind v4 + shadcn/ui + Recharts |
| Hosting frontend | Cloudflare Workers con `[assets]` (worker proxy + SPA) |
| Auth web | Cloudflare Access (email OTP) |
| Validación | Zod (en paquete `@alice/shared`) |
| Tests | Vitest |
| Dominio | `bot.alice.dyorch.com` (worker bot), `dashboard.alice.dyorch.com` (worker web) |

---

## Arquitectura

```
                ┌─────────────────────────────────────────────────┐
                │              Cloudflare D1 (SQLite)             │
                │   expenses · reminders · watchlist · log        │
                └──────────────────────────┬──────────────────────┘
                                           │
              ┌────────────────────────────┴────────────────────────────┐
              ▼                                                         ▼
   ┌──────────────────────┐                              ┌──────────────────────────┐
   │  alice-bot Worker    │◄── Bearer API_SHARED_TOKEN ──┤  alice-web Worker        │
   │  bot.alice.dyorch    │       (server-side)          │  dashboard.alice.dyorch  │
   │                      │                              │                          │
   │  ├─ /webhook (WSP)   │                              │  ├─ Sirve SPA (Vite)     │
   │  ├─ /api/* (REST)    │                              │  └─ Proxy /api/* → bot   │
   │  └─ cron 1 min       │                              └────────────┬─────────────┘
   └──────────┬───────────┘                                           │
              │                                                       ▼
              ▼                                            ┌────────────────────┐
     ┌────────────────┐                                    │ Cloudflare Access  │
     │  Meta Cloud    │                                    │  (email OTP gate)  │
     │   API (WSP)    │                                    └─────────┬──────────┘
     └────────┬───────┘                                              │
              ▲                                                      ▼
              │                                            ┌────────────────────┐
       ┌──────┴──────┐                                     │      Browser       │
       │  Usuario    │                                     │  (sesión 24h CF)   │
       │  (WhatsApp) │                                     └────────────────────┘
       └─────────────┘
```

### Patrón "1 número, varios módulos"

El worker bot recibe **todos** los mensajes en un solo webhook. Un router de intención decide a qué módulo va cada mensaje:

1. **Comando explícito** (`/gasto`, `/recordar`, `/ver`) → handler directo.
2. **Enlace pelado** (http/https) → watchlist.
3. **Fallback a IA**: el mensaje libre se envía a Workers AI, que devuelve JSON con `intent` + `data`.
4. **Confirmación**: el bot responde con el resumen y un ID corto para poder rectificar.

### Proxy server-side del dashboard

El bundle JS de la web nunca contiene el `API_SHARED_TOKEN`. El bundle hace llamadas relativas a `/api/*` (mismo origen); el worker `alice-web` intercepta esos paths, inyecta el `Authorization: Bearer` server-side desde un secret, y reenvía al worker `alice-bot`. En desarrollo el proxy de Vite hace el mismo papel (ver `apps/web/vite.config.ts`).

---

## Setup de WhatsApp Cloud API (Meta)

1. Crear una **Meta Business Account** en https://business.facebook.com.
2. Crear una **App** tipo "Business" en https://developers.facebook.com/apps.
3. Añadir el producto **WhatsApp** a la app.
4. En "WhatsApp → API Setup":
   - Obtener un **Phone Number ID** (Meta da uno de prueba gratis).
   - Generar un **Access Token permanente** vía System User (no el temporal de 24h).
5. Configurar el **webhook**:
   - Callback URL: `https://bot.alice.dyorch.com/webhook`.
   - Verify Token: cadena aleatoria guardada como secret (`WHATSAPP_VERIFY_TOKEN`).
   - Suscribirse al evento `messages`.
6. Añadir el número personal del usuario como **número de prueba** mientras la app esté en modo desarrollo.

Después setear los secrets:

```powershell
pnpm --filter @alice/worker exec wrangler secret put WHATSAPP_TOKEN
pnpm --filter @alice/worker exec wrangler secret put WHATSAPP_PHONE_ID
pnpm --filter @alice/worker exec wrangler secret put WHATSAPP_APP_SECRET
```

(`WHATSAPP_VERIFY_TOKEN`, `ALLOWED_PHONE` y `API_SHARED_TOKEN` ya están seteados desde el bootstrap.)

---

## Módulos del bot

### Gastos

**Trigger:** `/gasto` o mensaje libre clasificado como gasto.

**Moneda:**
- Por defecto `PEN` (soles peruanos).
- Si el monto va seguido de `usd`, `$`, `dolares` o `dólares`, se registra como `USD`.
- También se acepta antes del monto: `/gasto $30 viaje uber`.

| Comando | Qué hace |
|---|---|
| `/gasto <monto> <categoría> <descripción>` | Registra un gasto en soles |
| `/gasto <monto> usd <categoría> <descripción>` | Registra un gasto en dólares |
| `/gasto $<monto> <categoría> <descripción>` | Alias para registrar en dólares |
| `/gastos` o `/gastos hoy` | Lista del día (totales separados por moneda) |
| `/gastos semana` | Resumen semanal por categoría y moneda |
| `/gastos mes` | Total mensual + top 3 categorías |
| `/gastos borrar <id>` | Borra |

Los resúmenes **nunca suman PEN + USD** en un mismo total. Se muestran subtotales por moneda.

### Recordatorios

**Trigger:** `/recordar` o mensajes tipo "recuérdame…", "avísame…".

| Comando | Qué hace |
|---|---|
| `/recordar <fecha> <hora> <texto>` | Crea recordatorio |
| `/recordatorios` | Lista pendientes |
| `/recordar borrar <id>` | Cancela uno |

**Disparo:** un Cron Trigger corre cada minuto, consulta D1 por `fire_at <= now() AND sent = 0`, envía el mensaje y marca `sent = 1`.

**Zona horaria:** todo se guarda en UTC, se convierte usando `USER_TZ` (`America/Lima`).

### Watchlist

**Trigger:** `/ver`, enlaces, o mensajes libres tipo "anota la peli…".

| Comando | Qué hace |
|---|---|
| `/ver <tipo> <título>` | Guarda con kind (movie/series/tiktok/video/other) |
| `/ver` o `/ver lista` | Lista pendientes |
| `/ver visto <id>` | Marca como visto |
| `/ver borrar <id>` | Borra |

---

## Esquema de base de datos (D1)

DDL completo en `apps/worker/migrations/0001_initial.sql`. Resumen:

- **`expenses`** — id, amount, currency (`PEN` | `USD`), category, description, spent_at, timestamps. Índices por `spent_at` y `category`.
- **`reminders`** — id, text, fire_at (UTC), sent (0|1), timestamps. Índice compuesto `(fire_at, sent)` para el cron.
- **`watchlist`** — id, kind (`movie`|`series`|`tiktok`|`video`|`other`), title, url, notes, watched (0|1), timestamps + watched_at. Índice por `watched`.
- **`message_log`** — auditoría de **todos** los mensajes entrantes y salientes. Campos: direction (`in`|`out`), sender_phone, sender_name, wa_message_id (único, para dedupe), body, message_type, intent, status, rejection_reason, raw_payload. Índices por sender, status, created_at y unique en wamid.

Cada tabla incluye `updated_at` para soportar ediciones desde el dashboard.

---

## Router de intención

```typescript
function route(message: string): Intent {
  if (message.startsWith('/gasto'))         return parseExpenseCommand(message);
  if (message.startsWith('/gastos'))        return { type: 'expense_query', ... };
  if (message.startsWith('/recordar'))      return parseReminderCommand(message);
  if (message.startsWith('/recordatorios')) return { type: 'reminder_list' };
  if (message.startsWith('/ver'))           return parseWatchCommand(message);
  if (/^https?:\/\//.test(message))         return { type: 'watch_add', url: message };
  return classifyWithAI(message);
}
```

### Prompt de clasificación (Workers AI)

```
Eres un clasificador de mensajes de un asistente personal en español.
Devuelve EXCLUSIVAMENTE un JSON:
{ "intent": "expense" | "reminder" | "watch" | "unknown", "data": { ... } }

expense → { amount, currency: "PEN" | "USD", category, description }
           (si no se menciona moneda, currency = "PEN")
reminder → { fire_at: "YYYY-MM-DD HH:mm", text }   (relativo a NOW={{NOW}}, tz={{USER_TZ}})
watch    → { kind, title, url|null }

Si dudas, "unknown" con data:{}. No añadas texto fuera del JSON.

Mensaje: {{MESSAGE}}
```

La respuesta de la IA se valida con un schema Zod (en `packages/shared/src/schemas/ai.ts`); si no encaja, cae a `intent='unknown'`.

---

## API REST del worker bot

Todos los endpoints requieren `Authorization: Bearer <API_SHARED_TOKEN>`. Respuesta envuelta como `{ ok, data, error }`.

```
GET    /api/health                              liveness check

GET    /api/expenses              ?from=YYYY-MM-DD&to=...&category=...&currency=...&limit=...
GET    /api/expenses/summary      ?period=day|week|month   → totales + por categoría
GET    /api/expenses/:id
POST   /api/expenses              { amount, currency, category, description, spentAt }
PATCH  /api/expenses/:id          campos parciales
DELETE /api/expenses/:id

GET    /api/reminders             ?status=pending|sent|all
GET    /api/reminders/:id
POST   /api/reminders             { text, fireAt }
PATCH  /api/reminders/:id
DELETE /api/reminders/:id

GET    /api/watchlist             ?status=pending|watched|all
GET    /api/watchlist/counts      → contador por kind
GET    /api/watchlist/:id
POST   /api/watchlist             { kind, title, url, notes }
PATCH  /api/watchlist/:id         (ej. { watched: true })
DELETE /api/watchlist/:id

GET    /api/message-log           ?from=...&to=...&status=...&sender=...&limit=...
GET    /api/message-log/stats     métricas para la card superior de /activity
GET    /api/message-log/:id       detalle con rawPayload
```

Tipos compartidos en `@alice/shared` para que web y worker no se desincronicen.

---

## Seguridad

### Defensa en capas

- **Verificación de firma** del webhook: validar `X-Hub-Signature-256` contra `WHATSAPP_APP_SECRET` **antes** de leer el body.
- **Verify token** en el handshake `GET /webhook`.
- **Filtro de remitente**: solo se *procesa* lógica de negocio para mensajes cuyo `from` coincida con `ALLOWED_PHONE`.
- **API REST protegida** con `API_SHARED_TOKEN` Bearer.
- **Web protegida** por Cloudflare Access (email OTP). Sin sesión, el worker `alice-web` ni siquiera se ejecuta.
- **Token nunca en el bundle**: la web hace llamadas relativas; el `alice-web` worker inyecta el Bearer server-side desde el secret. DevTools en el browser nunca lo ve.
- **Rate limit** en Cloudflare KV (30 mensajes/min por remitente).
- **Secrets** nunca en el repo; siempre vía `wrangler secret put`.

### Auditoría de mensajes

El bot **guarda TODOS los mensajes entrantes en la tabla `message_log`**, incluidos los rechazados:

- Mensajes válidos del `ALLOWED_PHONE` (`status='allowed'`).
- Mensajes desde números desconocidos (`status='rejected_unknown_sender'`).
- Webhooks con firma inválida (`status='rejected_invalid_signature'`).
- Mensajes que sobrepasen el rate limit (`status='rejected_rate_limit'`).

La decisión de rechazar va **antes** de cualquier llamada a IA o de generar respuesta, pero **después** de loguear. Así nunca se desperdicia cómputo en remitentes desconocidos pero queda rastro.

### Alertas

Si se detecta un mensaje desde un número distinto al `ALLOWED_PHONE`:

1. Se guarda en `message_log` con el motivo.
2. Si `SECURITY_ALERT_WEBHOOK` está configurado, se envía una notificación (Slack/Discord/etc.) con número, nombre de perfil y primer fragmento del mensaje.
3. En el dashboard, la página `/activity` lo muestra resaltado en rojo. Si hubo rechazos en las últimas 24 h, el home muestra un banner de alerta con link a la página.

### Retención

`message_log` se retiene **180 días** por defecto. Un cron diario (`0 3 * * *` en Lima) purga registros más antiguos. Configurable vía secret `MESSAGE_LOG_RETENTION_DAYS`.

---

## Despliegue

### Worker bot (`alice-bot`)

```powershell
# Desde la raíz del repo
pnpm --filter @alice/worker exec wrangler deploy

# Aplicar migraciones D1
pnpm --filter @alice/worker run db:migrate:remote

# Setear/rotar un secret
pnpm --filter @alice/worker exec wrangler secret put <NAME>
```

Custom domain `bot.alice.dyorch.com` configurado en `apps/worker/wrangler.toml`.

### Worker web (`alice-web`)

```powershell
# Build + deploy (corre vite build internamente)
pnpm --filter web run cf-deploy

# Setear/rotar secret (debe coincidir con el del worker bot)
pnpm --filter web exec wrangler secret put API_SHARED_TOKEN
```

Custom domain `dashboard.alice.dyorch.com` configurado en `apps/web/wrangler.toml`.

### Cloudflare Access

Configurado en Cloudflare → Zero Trust → Access → Applications:

- Tipo: Self-hosted
- Domain: `dashboard.alice.dyorch.com`
- Policy: Allow, regla `Emails == deyvidyorchsanchez@elsolnec.org`
- Identity provider: One-Time PIN

Verificar protección: `curl -I https://dashboard.alice.dyorch.com/` debe devolver `HTTP/1.1 302 Found` con header `Www-Authenticate: Cloudflare-Access`.

---

## Criterios de aceptación

**Bot:**
- [ ] `/gasto 50 café desayuno` registra en `PEN` y responde con confirmación.
- [ ] `/gasto 30 usd transporte uber` registra en `USD` y responde con `$`.
- [ ] `/gastos hoy` devuelve la lista del día con totales separados por moneda.
- [ ] `/recordar 2026-06-01 09:00 pagar luz` crea el recordatorio y llega a esa hora.
- [ ] Un enlace de TikTok se guarda en watchlist con `kind=tiktok`.
- [ ] `/ver lista` devuelve los pendientes.
- [ ] Mensajes desde números distintos al `ALLOWED_PHONE` se ignoran pero **se guardan** en `message_log` con `status='rejected_unknown_sender'` y `raw_payload` completo.
- [ ] Si `SECURITY_ALERT_WEBHOOK` está configurado, llega una notificación cuando un número desconocido escribe.
- [ ] Webhook responde el handshake de Meta.

**Web:**
- [ ] `dashboard.alice.dyorch.com` exige login vía Cloudflare Access.
- [ ] `/activity` lista todos los mensajes recibidos, con badge distinto para los rechazados.
- [ ] Filtrar `/activity` por status rechazado muestra solo intentos sospechosos.
- [ ] Si hubo rechazos en las últimas 24 h, el dashboard `/` muestra banner de alerta.
- [ ] El home muestra total del mes, próximos recordatorios y pendientes de watchlist.
- [ ] La tabla de gastos permite filtrar por rango de fechas y categoría.
- [ ] Editar un gasto desde la web persiste el cambio (verificable también desde el bot).
- [ ] Borrar un recordatorio futuro impide que se dispare por WhatsApp.
- [ ] Marcar una entrada de watchlist como vista la mueve al tab "vistos".
- [ ] El bundle JS no contiene el `API_SHARED_TOKEN` (verificable con DevTools → Sources).
