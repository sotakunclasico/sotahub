# Despliegue

La aplicación se mantiene compatible con Web APIs en Route Handlers. Para Cloudflare se incorporará el adaptador oficial vigente al preparar el entorno, evitando fijar aquí una integración obsoleta. Los secretos `AUTH_SECRET`, credenciales Discord y `DATABASE_URL` deben configurarse en el proveedor y nunca versionarse.

Antes de desplegar: ejecutar `npm run check`, generar Prisma, aplicar migraciones en un job separado y comprobar `/api/health`.

El cálculo local de ranking requiere Python, las dependencias del proyecto SotaKunJson y `COMMUNITY_RANKING_SCRIPT_PATH`. Para un proceso Node persistente, `COMMUNITY_RANKING_AUTOSTART=true` activa el cálculo al arranque y cada 24 horas. Para infraestructura serverless se configura un cron diario contra `POST /api/ranking/refresh` y se protege con `CRON_SECRET`.

Instalar el extractor con `python -m pip install -r scripts/community-ranking/requirements.txt`. Si YouTube activa su protección anti-bot durante un histórico largo, se proporciona mediante `YOUTUBE_COOKIES_FILE` un archivo Netscape exportado expresamente por el propietario; el sistema no lee sesiones del navegador automáticamente.
