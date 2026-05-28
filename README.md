# Alice — bot personal de WhatsApp + Dashboard web

**Alice** es un asistente personal compuesto por dos superficies que comparten una sola base de datos:

1. **Bot de WhatsApp** (un único número) que funciona como asistente multimódulo.
2. **Dashboard web** para visualizar, editar y borrar los registros con comodidad desde la PC.

Todo el sistema corre dentro del plan de Cloudflare existente, sin servicios extra.

## Módulos

- **Gastos** — registrar y consultar gastos (soporta `PEN` y `USD`; los totales nunca se mezclan entre monedas).
- **Recordatorios** — crear, listar y disparar recordatorios programados.
- **Watchlist** — guardar películas, series y enlaces (TikTok, YouTube, etc.) para ver después.

## Stack técnico

| Capa | Tecnología |
|---|---|
| Bot runtime | Cloudflare Workers (TypeScript) + Hono |
| Base de datos | Cloudflare D1 (SQLite serverless) |
| IA / NLP | Cloudflare Workers AI |
| Scheduling | Cron Triggers de Workers |
| Mensajería | WhatsApp Cloud API |
| Frontend web | Next.js 16 (App Router) + TypeScript |
| Hosting web | Cloudflare Pages |
| Auth web | Cloudflare Access (email OTP) |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Validación | Zod (compartido entre worker y web) |

## Arquitectura

Un único Cloudflare Worker (`bot.alice.dyorch.com`) expone el webhook de WhatsApp, una API REST (`/api/*`) y un cron que dispara recordatorios cada minuto. El dashboard Next.js (`dashboard.alice.dyorch.com`) consume esa API; nunca accede a la base de datos directamente.

## Estructura del repositorio (monorepo)

```
alice/
├── apps/
│   ├── worker/      # Cloudflare Worker (bot + API REST + cron)
│   └── web/         # Dashboard Next.js en Cloudflare Pages
├── packages/
│   └── shared/      # Tipos y schemas Zod compartidos
└── .env.example     # Documenta todas las variables de entorno
```

## Estado

Proyecto en fase inicial. El desarrollo arranca por la **Fase 1 (MVP del bot)**: webhook, router por comandos, CRUD en D1 y cron de recordatorios.

## Convenciones

- Código en inglés; comentarios, documentación y textos visibles al usuario en español.
- Gestor de paquetes: `pnpm` (monorepo con workspaces).
- TypeScript en modo `strict`. Lint y formato con ESLint + Prettier.
