# 3b · Guía de marca del Diseñador (extracto) · My Day

Generada por Luis el 2026-11-27 con el Diseñador de esencia de marca. Este archivo guarda **los valores y reglas que sí aplican a Mi día**. Se omitió el resto (ver abajo). Los valores son decisión de Luis en la herramienta; lo que dice "choque" es observación de Claude y necesita su respuesta antes del paso 3b-1.

## Se omitió a propósito (no aplica a Mi día)
- **Sección 10b (pantallas e interfaz):** las 9 pantallas son de otro proyecto (Zenith: Inicio, Tratamientos, Agendar cita, Mi seguimiento, con textos de pacientes y citas) y todo estaba "por definir". Mi día tiene sus propias pantallas en `03_DISENO.md`.
- **Sección 10c (redes sociales):** es para publicaciones, no para la app.
- **Datos de contexto que no corresponden a Mi día:** "Software o app para salud (un programa clínico)", "se imprime: sí", ejemplos de voz de guías clínicas. Mi día es una app personal de un solo usuario.

## Choques con lo ya decidido (hay que resolverlos antes de aplicar tokens)
1. **Plano contra degradado y atmósfera.** La guía es "Oscuro OLED, plano": fondo `#000000`, sombra ninguna, vidrio 0, textura ninguna, y anti-patrón "no añadas sombras". Luis eligió el 25 nov **mosaicos con degradado suave y atmósfera de fondo**. No caben los dos tal cual.
2. **Un acento contra tres secciones.** La guía dice "no más de un color de acento por pantalla". El Inicio aprobado (v3) tiene tres secciones con color propio (Trabajo azul, Proyectos violeta, Personal verde), siempre con nombre e ícono.
3. **Un solo tema oscuro contra dos temas.** Mi día hoy tiene tema claro y tema oscuro. La guía solo define el oscuro.
4. **Radios.** La guía: 6, 12, 18 y 999 px. Mi día usa hoy 10, 12, 14, 16, 18 y 999 px. Adoptar la escala nueva cambia el aspecto de 20 reglas.
5. **Anillos de progreso.** Son parte de los 4 rasgos de Luis y la guía no los define (grosor, colores, número grande). Hay que definirlos.
6. **Personalidad.** La guía dice "premium, elegante, confiable"; el brief dice "calma, claridad, enfoque, ligereza". Conviven, pero conviene confirmar cuál manda.

## Color (tokens de Luis)
| Token | Valor | Uso |
|---|---|---|
| primary | `#0df2a6` | acciones principales |
| primary-hover | `#0bcb8b` | cursor encima |
| primary-active | `#09ae78` | presionado |
| on-primary | `#111111` | texto sobre primario |
| secondary | `#2e89b8` | apoyo |
| success | `#4e8b23` | éxito |
| warning | `#b36b00` | alerta |
| error | `#c93030` | error real (nunca para atraso) |
| info | `#2563c9` | información y foco |
| background | `#000000` | fondo |
| surface | `#0b0b0d` | paneles y tarjetas |
| text | `#f2f2f2` | texto |
| text-muted | `#8a8a92` | texto secundario |
| border | `#424a46` | separadores de filas y tarjetas |
| border-strong | `#5e6561` | bordes de campos y controles (3:1) |
| link | `#0df2a6` | enlaces, siempre subrayados |

Neutros: 50 `#f2fbf6` · 100 `#e8f1ec` · 200 `#d7e1db` · 300 `#bec7c2` · 400 `#9ea7a2` · 500 `#7a837e` · 600 `#5e6561` · 700 `#424a46` · 800 `#29302c` · 900 `#161c19`.
Escala del primario: 50 `#e9fff2` · 100 `#c6fee0` · 200 `#6cfebd` · 300 `#12eaa1` · 400 `#1fc98a` · 500 `#23a472` · 600 `#24855d` · 700 `#226a4b` · 800 `#1f533c` · 900 `#1a3d2d` · 950 `#08281a`.
Contraste que reporta la herramienta (WCAG 2.2 AA): texto/superficie 17.57:1, texto secundario/superficie 5.74:1, texto sobre primario 12.83:1, primario/superficie 13.36:1, éxito 4.72:1, alerta 4.70:1, error 3.70:1, info 3.47:1, borde de campos 3.29:1, separador 2.15:1. Los estados siempre llevan símbolo o texto además del color (✓ ● ▲ ✕). Daltonismo: éxito se puede confundir con error (deutan) o con alerta (protan), por eso el símbolo es obligatorio.

## Tipografía
- Títulos, texto y números: fuente del sistema `system-ui,-apple-system,'Segoe UI',sans-serif`, cifras tabulares en números.
- Base 16 px, proporción 1.2, interlineado 1.5 (encabezados 1.2). Pesos: texto 400, énfasis 600, títulos 700.
- Escala: xs 11.1 · sm 13.3 · base 16 · lg 19.2 · xl 23 · 2xl 27.6 · 3xl 33.2 · 4xl 39.8 px. El xs solo para notas secundarias.

## Espaciado y formas
- Unidad 4 px. Escala: 0.5→2 · 1→4 · 2→8 · 3→12 · 4→16 · 6→24 · 8→32 · 12→48 · 16→64 px.
- Altura de controles 40 px; **zona táctil mínima 44 px** (si un control mide menos, se amplía el área clicable sin cambiar el aspecto).
- Radios: sm 6 · md 12 · lg 18 · full 999 px. Línea 1 px. Quiebres 640 · 1024 · 1440 px.
- Márgenes de página: 32 px en escritorio, 16 px en celular.

## Profundidad y textura
Sombra ninguna · vidrio 0 · fondo `#000000` · textura ninguna. Límites si se usaran: nunca textura detrás de texto o tablas; vidrio con opacidad mínima 0.70 bajo texto y desenfoque entre 8 y 32 px; grano máximo 3 %; evitar rayas de 6 a 16 px bajo texto.

## Movimiento
Duraciones: rápido 160 ms · base 280 ms · lento 480 ms. Curva por defecto (énfasis) `cubic-bezier(.05,.7,.1,1)`; estándar `cubic-bezier(.2,0,0,1)`; entrada `cubic-bezier(0,0,0,1)`; salida `cubic-bezier(.3,0,1,1)`. Lo que entra dura un poco más que lo que sale. Respetar "reducir movimiento": cambiar desplazamientos y escalas por un fundido corto o cambio instantáneo.

## Componentes (resumen)
- **Botón primario:** fondo primary, texto on-primary, alto 40 px, relleno 16 px, radio 6 px; hover primary-hover; presionado primary-active; foco: contorno de 3 px en info con 2 px de separación; deshabilitado 40 % de opacidad; uno solo por pantalla. Secundario: borde primary, texto primary. Fantasma: sin borde. Destructivo: fondo error.
- **Campo:** borde 1 px en border-strong, alto 40 px, radio 6 px; en error, borde error y mensaje debajo; cifras a la derecha con números tabulares.
- **Tarjeta:** fondo surface, borde 1 px en border, radio 12 px.
- **Avisos:** barra izquierda de 4 px con el color del estado y texto en text.
- **Enlaces:** color link, siempre subrayados.
- **Insignia de estado:** píldora con borde y símbolo del color del estado; siempre símbolo además del color.
- **Vidrio:** solo en barras y controles flotantes, nunca en datos.

## Voz
Cálida y cercana, español de México. Ejemplos de la herramienta: botón «Crear mi guía», éxito «¡Listo! Guía generada.», error «Algo no salió bien. Revisa los datos e inténtalo de nuevo.», vacío «Aún no hay casos. Cuando quieras: importa un escaneo para comenzar.» (son de otro contexto; para Mi día se reescriben con el mismo tono).

## Reglas para la IA (las que aplican)
1. Usar solo los tokens; si falta un dato, escribir PENDIENTE y preguntar.
2. Contraste mínimo 4.5:1 en texto y 3:1 en controles (WCAG 2.2 AA).
3. Un solo botón principal por pantalla.
4. Enlaces con el token link y subrayados; nunca primary como color de texto.
5. Bordes de campos en border-strong; separadores en border.
6. Respetar reducir movimiento.
7. No inventar logos, íconos de marca ni colores fuera de la paleta.

## Pendientes que la propia herramienta marca
Logo; ejemplos bueno y malo con capturas; paleta final (hoy es propuesta del estilo elegido); para qué se usa el color secundario; verificar contraste en la pantalla real.
