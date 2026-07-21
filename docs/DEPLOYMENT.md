# Despliegue

## Comprobaciones previas

1. Ejecutar `npm run check`.
2. Validar y generar Prisma.
3. Aplicar migraciones en un job separado.
4. Comprobar `/api/health`.
5. Confirmar que ninguna credencial forma parte del repositorio.

## Secretos

Configurar como mínimo `AUTH_SECRET`, las credenciales Discord y `NEXT_PUBLIC_APP_URL`. PostgreSQL requiere `DATABASE_URL`; el cron del ranking requiere `CRON_SECRET`.

Para YouTube individual se crea un cliente OAuth web y se registra `https://DOMINIO/api/youtube/link/callback`. Configurar `YOUTUBE_OAUTH_CLIENT_ID`, `YOUTUBE_OAUTH_CLIENT_SECRET` y `YOUTUBE_OAUTH_REDIRECT_URI`.

## Ranking

Un proceso Node persistente puede usar `COMMUNITY_RANKING_AUTOSTART=true` para ejecutar una actualización al arrancar, cada 10 minutos y una reconstrucción completa cada 30 días. Los intervalos se configuran con `COMMUNITY_RANKING_INCREMENTAL_MINUTES`, `COMMUNITY_RANKING_INCREMENTAL_VIDEO_LIMIT` y `COMMUNITY_RANKING_FULL_INTERVAL_DAYS`.

En infraestructura serverless se configuran dos llamadas autenticadas con `Authorization: Bearer $CRON_SECRET`:

- `*/10 * * * *` → `POST /api/ranking/refresh?mode=incremental`.
- `0 3 1 * *` → `POST /api/ranking/refresh?mode=full`.

El extractor local necesita Python y `scripts/community-ranking/requirements.txt`. Si YouTube activa protección anti-bot durante un histórico largo, `YOUTUBE_COOKIES_FILE` puede apuntar a un archivo Netscape exportado expresamente por el propietario. El sistema nunca lee sesiones del navegador automáticamente.

## Cloudflare

El frontend y los Route Handlers compatibles con Web APIs podrán adaptarse a Workers. El motor Python y `child_process` deben salir a FastAPI o a un worker de cálculo independiente. `/api/youtube/link/*` usa runtime Node hasta sustituir HMAC por Web Crypto.

No cachear en CDN `/admin`, `/dashboard`, `/perfil`, `/settings` ni `/api/auth/*`. Los assets públicos optimizados sí pueden usar caché larga.
