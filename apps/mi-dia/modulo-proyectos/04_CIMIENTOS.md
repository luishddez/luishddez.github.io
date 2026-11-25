# 04 · Cimientos en Supabase (Fase 4, borrador del 2026-11-25)

Fase 3 (diseño) aprobada por Luis el 2026-11-25. Esta fase solo prepara los datos. Nada se escribe en Supabase hasta que Luis conteste la lista de abajo.

## Lo que se verificó hoy (solo lectura)
- Supabase tiene una sola tabla de datos (`docs`, un documento por ruta). Raíces actuales: `app`, `comida`, `dia`, `feedback`, `tareas`. No existe `proyectos`.
- **Temple sí guarda en Supabase**, en el documento `app` y en `app/sessions/*`. Ahí hay: días por semana (hoy 3), minutos por sesión (hoy 60), rutinas A a E y cada sesión hecha con su día, inicio y fin.
- **Temple NO guarda qué días de la semana entrena.** Solo cuántos días por semana. El gym fijo de lunes a miércoles que trae Mi día hoy es una suposición del código, no un dato de Luis.
- Propuesta para el gym: Inicio muestra "toca gym" cuando en la semana llevas menos sesiones que tus días por semana, leyendo las sesiones de Temple. Sin días fijos. Mi día solo lee; nunca escribe en los datos de Temple.

## Lista de autorizaciones (sí o no)
1. Crear la colección nueva `proyectos/<id>` en Supabase (documentos nuevos, nada existente se toca).
2. Sembrarla una sola vez desde el Tablero (unas 18 filas) y SC Nodos (unas 49), **después de mostrarle a Luis la lista final** y recibir su sí. Si algo sale mal, todo lo sembrado se quita de una vez por su ruta.
3. Campo `proyecto` en tareas: aditivo. No se modifican las 14 tareas actuales; la app trata "sin campo" como "sin proyecto" y solo escribe el campo cuando Luis liga una tarea.
4. Marca `trabajo` por proyecto, que sus tareas heredan, con cambio manual por tarea. Es lo que permite que en horario de trabajo salga primero lo de MegaGen.
5. Gym: leer de Temple (solo lectura), con la regla de arriba.
6. Las 2 conexiones punteadas del mapa (Mi día con Almacén, Mi día con Diseñador): confirmar o descartar antes de sembrar.

## Respuestas de Luis (2026-11-25)
- 1 y 2: **Sí**, crear `proyectos/*` y sembrar una vez, **con lista previa** que él aprueba antes de escribir.
- 4: **Sí**, marca `trabajo` por proyecto.
- 5: **Toca gym si me faltan sesiones** (sin días fijos).
- 3: sin pregunta aparte (campo aditivo, no toca las 14 tareas).
- 6: conexiones punteadas: **descartadas** ("Sí, descártalas"). Criterio de conexión: una cosa alimenta o depende de la otra; compartir la base de datos no cuenta, porque casi todas las apps la comparten.

## Reglas para armar la lista de siembra (propuestas el 2026-11-25)
- No se siembran: las 5 áreas (son filtros, no proyectos), las personas, los logros y lo intimo de Amor. La lista con nombres se le muestra a Luis en la conversación y no se guarda en este repositorio, que es público.
- Estado inicial según el tipo de sus notas: proyecto = activo, idea = idea semilla, investigación cerrada o terminada = hecho; lo que el Tablero dice en pausa, bloqueado o cerrado manda sobre eso.
- `siguiente_paso` y `porque` quedan vacíos salvo donde sus notas ya lo dicen; `potencia` e `importancia` quedan sin calificar.
- `ultima_vez` viene de la "última actividad" de SC Nodos o de la fecha del Tablero.
- Duplicados entre Tablero y SC Nodos se unen en un solo proyecto, y Luis lo ve en la lista.

## Queda para después (no se pide hoy)
- Copia de solo lectura en el Sheet para el Segundo Cerebro: se decide en el checkpoint 5.2.
- Puntos y niveles: checkpoint 5.3.
