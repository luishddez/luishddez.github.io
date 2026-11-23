# Mis apps en un solo repositorio

Un repositorio (`luishddez/luishddez.github.io`), tres apps, cada una trabaja por separado.

| App | Carpeta | Dirección (la de siempre) |
|---|---|---|
| Mi día (centro) | `apps/mi-dia` | luishddez.github.io/tablero-de-arranque/ |
| Hungry (alimentación) | `apps/hungry` | luishddez.github.io/hungry/ |
| Temple (entrenamiento) | `apps/temple` | luishddez.github.io/temple/ |
| Código común | `shared/` | luishddez.github.io/shared/ (botón 💬 de comentarios) |

Todas comparten la misma cuenta de Supabase (tabla `docs`, un documento = una ruta) y el mismo dominio, por eso la información se
mueve entre ellas sin conectar repositorios.

## Ramas
- `main`: lo que está publicado. Solo recibe cambios ya probados.
- `dev/mi-dia`, `dev/hungry`, `dev/temple`: donde se trabaja cada app. Cada rama solo cambia su carpeta (y `shared/`).
- Para publicar una app: `bash scripts/publicar.sh <app>` (la mezcla en `main`, revisa y marca un punto de regreso).
- Para regresar una app a un punto anterior: `bash scripts/regresar.sh <app> <punto>` (las demás no se tocan).

## Publicación automática
Al llegar algo a `main`, GitHub revisa que ninguna app tenga errores (`scripts/revisar.sh`) y, solo si todo está bien, arma y
publica el sitio (`scripts/armar.sh`). En las ramas `dev/**` solo se revisa; nunca se publica.
Un cambio en una app no altera los archivos de las otras: lo que no cambió queda idéntico en el sitio.

## Reglas para Claude
- Trabajar una app a la vez, en su rama `dev/<app>`; no tocar carpetas de otras apps.
- Antes de publicar, probar. Después de publicar, comprobar la dirección en vivo (`/<ruta>/version.json` trae el commit publicado).
- Guía para procesar la entrevista de Hungry y los comentarios 💬: `apps/hungry/PROCESAR.md`.

## Historial anterior
Los repositorios antiguos `luishddez/tablero-de-arranque` (Mi día y Hungry) y `luishddez/temple` quedan como respaldo, sin publicarse.
