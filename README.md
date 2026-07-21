# SotaKun

Plataforma oficial de la comunidad SotaKun. Reúne contenido del canal, ranking de participación, sorteos verificables, identidad Discord, vinculación de canales de YouTube y la futura colección certificada SotaKun × Niebla Tattooer.

## Stack

- Next.js 16, React 19 y TypeScript estricto.
- Tailwind CSS 4, Motion y Lucide.
- Auth.js con Discord OAuth.
- PostgreSQL y Prisma 7 preparados para persistencia.
- Motor de ranking Python aislado del frontend.
- Arquitectura preparada para Cloudflare y una futura API FastAPI.

## Desarrollo local

1. Copia `.env.example` como `.env.local` y completa únicamente las credenciales necesarias.
2. Instala dependencias con `npm install`.
3. Arranca la aplicación con `npm run dev`.
4. Abre `http://localhost:3000`.

Validación completa:

```bash
npm run check
```

El comando ejecuta TypeScript, ESLint y el build de producción.

## Integraciones

### Discord

Discord es la identidad principal. El login solicita `identify`, `email` y `guilds.join`. Cuando están configurados el bot, servidor y rol, el acceso añade al usuario al servidor oficial y le asigna el rol de miembro.

### YouTube público

`npm run youtube:sync` actualiza el snapshot público del canal en `data/youtube-channel.json`. La interfaz nunca sustituye un fallo de sincronización por métricas inventadas.

### Vinculación individual con YouTube

El centro de conexiones vive en `/settings`. El flujo usa OAuth 2.0 con PKCE y el alcance `youtube.readonly`. Consulta el canal del usuario, descarta el token del proveedor y conserva temporalmente una prueba firmada ligada a la sesión Discord.

Configura en Google Cloud la URI:

```text
http://localhost:3000/api/youtube/link/callback
```

Después añade `YOUTUBE_OAUTH_CLIENT_ID`, `YOUTUBE_OAUTH_CLIENT_SECRET` y `YOUTUBE_OAUTH_REDIRECT_URI`. La persistencia multidispositivo se activará al aplicar los modelos `ExternalAccount` y `YouTubeChannelLink` de Prisma.

### Community Ranking

El ranking ejecuta una actualización incremental al arrancar y cada 10 minutos en procesos persistentes. Conserva checkpoints por vídeo, vuelve a consultar los vídeos recientes y procesa inmediatamente los nuevos. Cada 30 días ejecuta una reconstrucción completa para detectar comentarios nuevos en cualquier vídeo histórico. En infraestructura serverless se usan crons autenticados contra `POST /api/ranking/refresh?mode=incremental` y `POST /api/ranking/refresh?mode=full`. Los snapshots y checkpoints se guardan en `data/` y no se versionan.

## Documentación

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- [`.env.example`](.env.example)

## Estado de módulos

- Canal, vídeos y listas de reproducción: conectados mediante snapshot oficial.
- Ranking y probabilidades de sorteo: operativos con datos procesados.
- Sorteos: extracción administrativa protegida y registro local.
- Discord: autenticación y alta automática preparadas.
- YouTube individual: OAuth preparado; requiere credenciales.
- Merch: ficha privada; tienda pública oculta.
- Certificados y pedidos: modelo preparado, persistencia pendiente.
