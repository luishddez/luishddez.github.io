#!/usr/bin/env bash
# Regresa UNA app a un punto anterior sin tocar las demás.
# Uso: bash scripts/regresar.sh hungry punto/hungry/2026-11-23-1500   (ver puntos: git tag -l 'punto/hungry/*')
set -euo pipefail
app="${1:?Uso: bash scripts/regresar.sh <app> <punto|commit>}"
punto="${2:?Falta el punto de regreso (git tag -l 'punto/$app/*')}"
git checkout -q main && git pull -q origin main
git checkout "$punto" -- "apps/$app"
git commit -m "Regresar $app a $punto"
bash scripts/revisar.sh
git push origin main
echo "✅ $app regresó a $punto. Las otras apps no se tocaron."
