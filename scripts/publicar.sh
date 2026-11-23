#!/usr/bin/env bash
# Publica UNA app: pasa lo que está en su rama dev/<app> a main (de ahí sale el sitio).
# Uso: bash scripts/publicar.sh hungry        (apps: mi-dia, hungry, temple)
set -euo pipefail
app="${1:?Uso: bash scripts/publicar.sh <mi-dia|hungry|temple>}"
rama="dev/$app"
git fetch -q origin
git show-ref --verify --quiet "refs/heads/$rama" || { echo "No existe la rama $rama"; exit 1; }
# Seguridad: la rama de esta app solo puede cambiar SU carpeta (y shared)
otros=$(git diff --name-only main..."$rama" | grep -v "^apps/$app/" | grep -v '^shared/' | grep -v '^docs/' || true)
if [ -n "$otros" ]; then echo "⚠️ La rama $rama toca archivos de otras apps:"; echo "$otros"; echo "Revísalo antes de publicar."; exit 1; fi
git checkout -q main && git pull -q origin main
git merge --no-ff "$rama" -m "Publicar $app"
bash scripts/revisar.sh
git tag -f "punto/$app/$(date +%Y-%m-%d-%H%M)" >/dev/null
git push origin main --tags
git checkout -q "$rama"
echo "✅ $app publicado. En ~1 minuto está en vivo."
