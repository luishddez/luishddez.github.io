# 02 · Planos (Fase 2, borrador del 2026-11-25)

Los 7 datos del encargo, con lo que Luis respondió. Nada de esto está construido.

## 1. Qué quiere lograr
Que un día que se siente perdido entre ideas y proyectos abra Mi día y vea, de un vistazo y sin abrumarse: qué sigue, qué existe, qué soltar y cómo se conecta todo.

## 2. Quién lo usa
Solo Luis, con login, en iPhone y computadora por igual.

## 3. Qué datos maneja
**Proyecto o idea** (documento nuevo `proyectos/<id>` en Supabase):
- `nombre`, `area` (Yo, Amor, Familia, Conocimiento, Profesional), `tipo` (proyecto, idea, investigación), `estado` (activo, en pausa, bloqueado, idea semilla, hecho, archivado).
- `siguiente_paso`, `porque` (por qué me importa), `ultima_vez` (última vez que lo toqué).
- `potencia` e `importancia` (1 a 5). **Solo las pone Luis; nunca se inventan.**
- `conexiones` (lista de ids), `actualizado` (marca de tiempo), `archivado_en` (fecha, vacío si no está archivado).
- Las personas NO son proyectos y no entran al mapa. Amor y Familia, si aparecen, solo como área general, sin detalles.

**Tarea** (ya existe en `tareas/<id>`): se agrega un campo `proyecto` (id del proyecto o vacío). Cambio aditivo: las tareas actuales siguen funcionando igual.

**Rutina**: ya viene de Mi día. El gym debe leerse de Temple (por verificar en Fase 3 que Temple publica sus días en Supabase). Entre semana el bloque de trabajo es de 9:00 a 18:00 y no se pinta en el calendario.

## 4. Qué documentos produce
Ninguno. La pantalla solo se mira.

## 5. Reglas
- **Fuente única: Supabase.** El Sheet queda como copia de solo lectura para el Segundo Cerebro. Se siembra una sola vez desde el Tablero y SC Nodos, con autorización de Luis.
- **Conflicto de edición** (lo mismo cambiado en dos aparatos sin internet): gana el cambio más reciente, según `actualizado`. Se avisa con un mensaje corto cuando se sobrescribió algo.
- **Descartar = archivar**, recuperable. Nunca se borra.
- **Parado**: aviso según el tipo (idea, proyecto, investigación). Los umbrales se proponen en Fase 3 y se ajustan usando la app.
- **Tope de proyectos activos**: sin número todavía; se prueba y se ajusta. Al pasarse, avisa sin bloquear y sin culpa.
- **Orden en horario de trabajo** (9:00 a 18:00, lunes a viernes): primero pendientes de trabajo, después proyectos.
- **Fin de semana**: la mañana es el hueco de proyectos; la tarde y noche quedan libres. Se propone un plan al final, sin obligar.
- **Puntos y niveles**: solo reconocen. Nunca rachas, nunca restan, nunca castigan.
- Escribir `proyectos/*` en Supabase por parte de Claude necesita autorización expresa de Luis (Fase 4).

## 6. Qué NO incluye
Notificaciones y avisos que lleguen solos (la pantalla solo se ve al abrirla). Todo lo demás entra a la v1, repartido en 3 checkpoints.

## 7. Cómo sabrá que funciona (5 pruebas de éxito)
1. Abro el inicio y sé qué sigue en 5 segundos.
2. Veo todos mis proyectos sin sentirme abrumado.
3. En la primera semana suelto al menos 2 proyectos parados.
4. En horario de trabajo, el inicio muestra primero lo de MegaGen y luego los proyectos.
5. Sin internet puedo ver mis proyectos y hacer cambios, y se sincronizan al volver la conexión.

Criterios de aceptación de funciones (no son pruebas de éxito, se revisan en el checkpoint 5.2): archivar y recuperar un proyecto lo deja igual que antes; cada tarea muestra su proyecto y el siguiente paso sale de ahí.

## Checkpoints propuestos (para la Fase 5)
- **5.1**: pantallas con datos de prueba (inicio ligero y mapa con tarjetas).
- **5.2**: datos reales y sin internet; archivar y recuperar; tareas ligadas a proyectos; editar tareas desde Proyectos.
- **5.3**: parados y tope de activos, conexiones, y puntos y niveles.
