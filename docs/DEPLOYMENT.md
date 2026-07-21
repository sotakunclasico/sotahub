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

En infraestructura que pueda ejecutar el extractor se configuran dos llamadas autenticadas con `Authorization: Bearer $CRON_SECRET`:

- `*/10 * * * *` → `POST /api/ranking/refresh?mode=incremental`.
- `0 3 1 * *` → `POST /api/ranking/refresh?mode=full`.

El extractor local necesita Python y `scripts/community-ranking/requirements.txt`. Si YouTube activa protección anti-bot durante un histórico largo, `YOUTUBE_COOKIES_FILE` puede apuntar a un archivo Netscape exportado expresamente por el propietario. El sistema nunca lee sesiones del navegador automáticamente.

## Cloudflare Workers

El proyecto se despliega con OpenNext. En Cloudflare Builds se configura:

- Comando de build: `npm run build` (también se admite `npm run cf:build`).
- Comando de deploy: `npx wrangler deploy`.
- Directorio raíz: `/`.
- Versión de Node.js: 22.

Para probar exactamente el Worker antes de publicarlo se usa `npm run preview`. Tanto `npm run build` como `npm run cf:build` generan `.open-next/worker.js` y los assets que consume Wrangler. OpenNext ejecuta internamente `npm run next:build` para compilar Next.js con Webpack sin recursión.

`wrangler.jsonc` incluye el mismo build de OpenNext como paso de seguridad. Así, `npx wrangler deploy` también genera el Worker si el panel de Cloudflare conserva temporalmente `npm run build`; aun así, se recomienda corregir el comando del panel para evitar compilar Next.js dos veces.

Configurar como secretos de producción `AUTH_SECRET`, `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`, `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `DISCORD_MEMBER_ROLE_ID`, `CRON_SECRET`, `YOUTUBE_OAUTH_CLIENT_ID`, `YOUTUBE_OAUTH_CLIENT_SECRET` y `YOUTUBE_API_KEY`. Configurar además:

- `NEXT_PUBLIC_APP_URL=https://DOMINIO`
- `AUTH_URL=https://DOMINIO`
- `AUTH_TRUST_HOST=true`
- `YOUTUBE_OAUTH_REDIRECT_URI=https://DOMINIO/api/youtube/link/callback`

Discord debe aceptar `https://DOMINIO/api/auth/callback/discord` y Google debe aceptar `https://DOMINIO/api/youtube/link/callback` como URLs de redirección OAuth.

El Worker fija `SOTAHUB_RUNTIME=cloudflare` y desactiva `COMMUNITY_RANKING_AUTOSTART`, porque Workers no puede ejecutar Python, `child_process` ni persistir archivos locales. El recálculo debe ejecutarse en el proceso local actual o migrarse a FastAPI; después, el resultado se publica en PostgreSQL, R2 o KV. Los snapshots públicos versionados permiten que ranking y datos del canal estén disponibles en el primer despliegue.

No cachear en CDN `/admin`, `/dashboard`, `/perfil`, `/settings` ni `/api/auth/*`. Los assets públicos optimizados sí pueden usar caché larga.
