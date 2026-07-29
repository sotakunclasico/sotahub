# Despliegue del motor de Community Ranking

SotaHub mantiene la interfaz y la autenticación en Cloudflare. El análisis de
YouTube se ejecuta en un servicio Python separado y publica snapshots en R2.
Así, actualizar el ranking no requiere commits ni nuevos despliegues.

## Componentes

- `sotahub`: aplicación Next.js desplegada en Cloudflare Workers.
- `sotahub-ranking-engine`: FastAPI + `yt-dlp` desplegado en Render.
- `sotahub-ranking`: bucket R2 privado con snapshots y checkpoints.
- `sotahub-ranking-scheduler`: Worker pequeño con dos Cron Triggers.

## 1. Crear el bucket R2

Desde la raíz del repositorio:

```powershell
npx wrangler r2 bucket create sotahub-ranking
```

En Cloudflare, abre **R2 > Manage R2 API Tokens** y crea un token limitado al
bucket `sotahub-ranking`, con permisos de lectura y escritura de objetos. Guarda:

- Account ID.
- Access Key ID.
- Secret Access Key.

No pegues esas claves en Git ni en archivos versionados.

## 2. Migrar el ranking y los 543 checkpoints actuales

Instala las dependencias del motor:

```powershell
python -m pip install -r services/ranking-engine/requirements.txt
```

Define temporalmente las credenciales en PowerShell y ejecuta la migración:

```powershell
$env:CLOUDFLARE_ACCOUNT_ID="TU_ACCOUNT_ID"
$env:R2_ACCESS_KEY_ID="TU_ACCESS_KEY_ID"
$env:R2_SECRET_ACCESS_KEY="TU_SECRET_ACCESS_KEY"
$env:R2_BUCKET_NAME="sotahub-ranking"
python services/ranking-engine/scripts/seed_r2.py
```

El script publica el ranking, el estado y un archivo comprimido con todos los
checkpoints. Después pueden retirarse las variables de la terminal:

```powershell
Remove-Item Env:CLOUDFLARE_ACCOUNT_ID
Remove-Item Env:R2_ACCESS_KEY_ID
Remove-Item Env:R2_SECRET_ACCESS_KEY
Remove-Item Env:R2_BUCKET_NAME
```

## 3. Crear el secreto interno

Genera un valor aleatorio largo. Este mismo valor debe configurarse en Render,
SotaHub y el Worker programador:

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToHexString($bytes).ToLower()
```

## 4. Desplegar FastAPI en Render

1. Conecta el repositorio de SotaHub en Render.
2. Crea un Blueprint usando `render.yaml`.
3. Selecciona el plan **Free**.
4. Completa las variables marcadas como secretas:
   - `RANKING_ENGINE_SECRET`
   - `YOUTUBE_API_KEY`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
5. Espera a que `/health` responda con `{"status":"ok", ...}`.
6. Copia la URL `https://sotahub-ranking-engine-....onrender.com`.

## 5. Configurar SotaHub en Cloudflare

Guarda la URL y el secreto como secretos del Worker principal:

```powershell
npx wrangler secret put RANKING_ENGINE_URL
npx wrangler secret put RANKING_ENGINE_SECRET
```

Despliega SotaHub para activar el binding `RANKING_BUCKET`:

```powershell
npm run deploy
```

## 6. Activar los análisis programados

Configura los dos secretos para el Worker programador:

```powershell
npx wrangler secret put RANKING_ENGINE_URL --config wrangler.ranking-scheduler.jsonc
npx wrangler secret put RANKING_ENGINE_SECRET --config wrangler.ranking-scheduler.jsonc
npx wrangler deploy --config wrangler.ranking-scheduler.jsonc
```

El programador inicia:

- Análisis incremental cada 10 minutos, en los minutos 03, 13, 23, 33, 43 y 53.
- Análisis completo el día 1 de cada mes a las 03:00 UTC.

Cada llamada de diez minutos también mantiene activo el servicio gratuito de
Render. Si ya existe un análisis ejecutándose, el motor devuelve `409` y el
programador espera a la siguiente ejecución sin crear duplicados.

## 7. Comprobación

1. Inicia sesión con la cuenta administradora.
2. Abre `/ranking`.
3. Pulsa **Usar backup**.
4. El panel debe mostrar el estado `Analizando`.
5. Se puede cerrar la página: el trabajo continúa en Render.
6. Al finalizar, `/api/ranking?fresh=1` debe devolver el nuevo estado y ranking.

Si el proceso se interrumpe, el siguiente trabajo recupera los checkpoints de
R2. El snapshot público solo se reemplaza cuando el análisis termina sin errores.
