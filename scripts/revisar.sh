#!/usr/bin/env bash
# Revisa todas las apps: sintaxis de cada .js, JSON válido y que cada app tenga su index.html.
# Si algo falla, dice QUÉ app y QUÉ archivo, y la publicación se detiene.
set -u
fallas=0
for app in apps/*/; do
  n=$(basename "$app")
  [ -f "$app/index.html" ] || { echo "❌ [$n] falta index.html"; fallas=$((fallas+1)); }
  while IFS= read -r f; do
    node --check "$f" 2>/tmp/err.txt || { echo "❌ [$n] error de sintaxis en $f"; head -5 /tmp/err.txt; fallas=$((fallas+1)); }
  done < <(find "$app" -name '*.js' -not -path '*/node_modules/*')
  while IFS= read -r f; do
    node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" "$f" 2>/dev/null || { echo "❌ [$n] JSON inválido: $f"; fallas=$((fallas+1)); }
  done < <(find "$app" \( -name '*.json' -o -name '*.webmanifest' \))
done
while IFS= read -r f; do
  node --check "$f" 2>/tmp/err.txt || { echo "❌ [shared] error de sintaxis en $f"; head -5 /tmp/err.txt; fallas=$((fallas+1)); }
done < <(find shared -name '*.js')
if [ "$fallas" -gt 0 ]; then echo "Revisión fallida: $fallas problema(s). No se publica."; exit 1; fi
echo "✅ Revisión correcta: $(ls -d apps/*/ | wc -l) apps sin errores."
