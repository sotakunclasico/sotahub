# Arquitectura SotaKun

## Principios

SotaKun aplica separación por capas y dominio. `app` es una capa de entrega; no contiene reglas de negocio. `features` agrupa casos de uso por capacidad. `services` define puertos que hoy pueden consumir Next.js y mañana FastAPI. `database` contiene el esquema y los adaptadores de persistencia. Los componentes genéricos viven en `components/ui`; los componentes ligados al producto viven en `features`.

## Límites

- Los Server Components consultan servicios directamente, nunca Route Handlers internos.
- Las Server Actions son mutaciones y deben volver a autorizar al usuario.
- Los Route Handlers son API pública y validan entrada, identidad y permisos.
- `proxy.ts` realiza protección optimista; la autorización definitiva pertenece al caso de uso o DAL.
- PostgreSQL es la fuente de verdad. La sesión Auth.js usa JWT para desacoplar el arranque de la disponibilidad de base de datos.
- Para migrar a FastAPI se implementa `HttpClient` contra `BACKEND_API_URL` sin cambiar componentes.

## Fases

1. Fundación, UI, rutas, modelo de dominio y autenticación.
2. Persistencia real, migraciones, repositorios, validación Zod y panel CRUD.
3. Pagos, almacén, certificados QR firmados y transferencias.
4. Ranking transaccional, eventos, observabilidad y moderación.
5. Adaptador Cloudflare, colas, caché, rate limits y extracción gradual a FastAPI.

## Community Ranking

El motor original de `SotakunJson/V_Codex/Community` continúa siendo la única fuente de reglas de puntuación. SotaKun lo ejecuta mediante un adaptador Node aislado, valida su JSON con Zod y publica una proyección de solo lectura. `instrumentation.ts` inicia un cálculo al arrancar y un temporizador diario en servidores persistentes. En Cloudflare Workers, donde no existe `child_process` ni un proceso permanente, un Cron Trigger debe invocar `POST /api/ranking/refresh` con `Authorization: Bearer $CRON_SECRET`; en esa fase el motor se ejecutará desde el servicio Python/FastAPI.

La extracción mantenida vive en `scripts/community-ranking` y usa `yt-dlp` para comentarios y replays. Enumera por separado vídeos, directos y Shorts, y solo elimina duplicados cuando coinciden en `video_id`; títulos iguales con IDs diferentes conservan chats independientes. Los cálculos incompletos se guardan como snapshots parciales y se fusionan sin sustituir el último resultado completo. Los checkpoints por vídeo permiten reanudar ejecuciones interrumpidas.

Los usuarios técnicos, cuentas propias y bots se excluyen antes de ordenar o publicar el ranking. La lista base vive en `src/config/ranking.ts` y puede ampliarse sin desplegar código mediante `COMMUNITY_RANKING_EXCLUDED_USERS`, usando valores separados por comas. La comparación ignora mayúsculas, tildes, espacios, guiones y sufijos.
