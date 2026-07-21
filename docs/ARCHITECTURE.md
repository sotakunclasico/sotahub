# Arquitectura SotaKun

## Principios

SotaKun aplica separación por capas y dominio. `app` es una capa de entrega; no contiene reglas de negocio. `features` agrupa casos de uso por capacidad. `services` define puertos que hoy consumen Next.js y mañana podrán consumir FastAPI. `database` contiene el esquema y los futuros adaptadores de persistencia. Los componentes genéricos viven en `components/ui`; los componentes ligados al producto viven en `features`.

## Límites

- Los Server Components consultan servicios directamente, nunca Route Handlers internos.
- Las mutaciones reautorizan siempre al usuario.
- Los Route Handlers validan entrada, identidad y permisos.
- `proxy.ts` realiza protección optimista; la autorización definitiva pertenece al caso de uso o DAL.
- PostgreSQL será la fuente de verdad. La sesión Auth.js usa JWT durante la fase de arranque.
- Para migrar a FastAPI se implementará el puerto HTTP sin cambiar los componentes.

## Estado por fases

1. Fundación, UI, rutas, modelo de dominio y autenticación: operativa.
2. Datos oficiales de YouTube, ranking y sorteos locales: operativos.
3. Persistencia PostgreSQL, repositorios y panel CRUD: preparada en esquema.
4. Pedidos, certificados QR firmados y transferencias: pendientes.
5. Adaptador Cloudflare, colas, caché y extracción gradual a FastAPI: pendiente.

## Community Ranking

El motor original de Community continúa siendo la única fuente de reglas de puntuación. SotaKun lo ejecuta mediante un adaptador Node aislado, valida su JSON con Zod y publica una proyección de solo lectura. `instrumentation.ts` inicia una actualización al arrancar y un temporizador incremental cada 10 minutos en servidores persistentes. El scheduler cambia automáticamente a modo completo cuando han transcurrido 30 días desde el último histórico correcto.

En Cloudflare Workers no existen `child_process` ni procesos permanentes. Un Cron Trigger incremental deberá invocar `POST /api/ranking/refresh?mode=incremental` y otro mensual `POST /api/ranking/refresh?mode=full`, ambos con `Authorization: Bearer $CRON_SECRET`. El cálculo se trasladará al servicio Python/FastAPI.

La extracción vive en `scripts/community-ranking` y usa la API de YouTube para comentarios y `yt-dlp` para replays. Solo elimina duplicados cuando coincide el `video_id`; títulos iguales con IDs diferentes conservan chats independientes. Los checkpoints son persistentes: el modo incremental reutiliza el histórico, refresca los últimos vídeos y procesa los nuevos; el modo completo ignora el caché de lectura y vuelve a analizar todos los IDs.

Las cuentas propias, bots y usuarios técnicos se excluyen antes de publicar. La lista base vive en `src/config/ranking.ts` y puede ampliarse con `COMMUNITY_RANKING_EXCLUDED_USERS`.

## Vinculación de identidades

Discord es el proveedor principal de autenticación y autorización. YouTube se conecta mediante un flujo OAuth independiente para no reemplazar la sesión ni crear dos usuarios para una misma persona.

El flujo usa `state`, PKCE, cookie `HttpOnly` firmada y el alcance `youtube.readonly`. El token de Google se utiliza una sola vez para consultar `channels.list(mine=true)` y después se descarta. La prueba local queda ligada al identificador Discord durante 30 días.

Los modelos `ExternalAccount` y `YouTubeChannelLink` preparan la persistencia multidispositivo. Cuando PostgreSQL sea la fuente de verdad, cualquier token estrictamente necesario se guardará cifrado. La conexión de una cuenta no crea puntos; solo confirma identidad.

## Merch y certificados

La colección SotaKun × Niebla Tattooer se mantiene como borrador privado hasta confirmar precio, unidades y producción. El certificado público no se activará hasta disponer de piezas físicas numeradas y una fuente persistente. UUID, número, producto, colección, diseñador, propietario, fecha, QR y estado ya están modelados.
