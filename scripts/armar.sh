#!/usr/bin/env bash
# Arma el sitio: cada app queda en SU dirección de siempre.
#   apps/mi-dia -> /tablero-de-arranque/   (se conserva la dirección que ya tienes instalada en el iPhone)
#   apps/hungry -> /hungry/
#   apps/temple -> /temple/
#   shared      -> /shared/                 (código común, como el botón de comentarios)
set -euo pipefail
rm -rf _site && mkdir -p _site
COMMIT="${COMMIT:-$(git rev-parse HEAD 2>/dev/null || echo local)}"
FECHA="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
EXC=(--exclude 'pruebas' --exclude '*.md' --exclude 'serve.js' --exclude '*.zip')
copia() { # carpeta_origen ruta_destino nombre
  mkdir -p "_site/$2"
  rsync -a "${EXC[@]}" "apps/$1/" "_site/$2/"
  printf '{"app":"%s","commit":"%s","fecha":"%s"}\n' "$3" "$COMMIT" "$FECHA" > "_site/$2/version.json"
}
copia mi-dia tablero-de-arranque mi-dia
copia hungry hungry hungry
copia temple temple temple
mkdir -p _site/shared && rsync -a shared/ _site/shared/
# Vista previa (solo mientras se prueba un cambio de direcciones): VISTA_PREVIA=1
if [ "${VISTA_PREVIA:-}" = "1" ]; then
  mkdir -p _site/_vista && rsync -a "${EXC[@]}" apps/mi-dia/ _site/_vista/mi-dia/ && rsync -a "${EXC[@]}" apps/temple/ _site/_vista/temple/ && rsync -a shared/ _site/_vista/shared/
fi
cp site/index.html _site/index.html
cp site/404.html _site/404.html
touch _site/.nojekyll
echo "Sitio armado:"; find _site -maxdepth 2 -name version.json
