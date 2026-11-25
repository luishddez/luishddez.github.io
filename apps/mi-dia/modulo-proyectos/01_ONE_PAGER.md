# 01 · Investigación en 4 cajas (Fase 1, borrador del 2026-11-25)

Etiquetas: **verificado** (visto en el código o los datos de Luis), **por confirmar** (fuente de terceros o sin probar).

## Caja 1 · Competencia: ¿ya existe algo?
- Se compararon Sunsama, Akiflow y Motion contra las 3 pruebas de éxito. Son planificadores de calendario y tareas; ninguno ofrece un mapa de ideas y proyectos con archivo de parados (por confirmar: solo se leyeron comparativas de terceros, no se probó ninguno).
- Precios mensuales por confirmar (las fuentes se contradicen): Sunsama alrededor de 17 a 22 USD, Akiflow alrededor de 19 a 34 USD, Motion alrededor de 29 a 49 USD. Sin plan gratis, solo prueba.
- Lo que ya tiene Luis: el Segundo Cerebro (mapa de áreas y conexiones, solo para observar, lee el Sheet). Cubre "ver conexiones" y parte de "qué existe". No cubre siguiente paso, tareas ni archivar. **Conclusión:** ninguna opción cubre cerca del 80% de las pruebas; se construye dentro de Mi día y se reutilizan las ideas del Segundo Cerebro, sin crear un segundo mapa que compita.

## Caja 2 · Dolor y datos de hoy (verificado)
- Los proyectos viven en dos pestañas del Sheet (Tablero con unas 18 filas y SC Nodos con unos 49 nodos). Las tareas viven en Supabase (14). Ningún dato une una tarea con su proyecto.
- Mi día ya tiene Hoy, Mañana, Semana, Menú y Plan. Ya modela la entrada a las 9:00, la salida a las 18:00 y la comida flexible.
- La columna de potencia del Segundo Cerebro está vacía: las calificaciones de 1 a 5 las debe poner Luis; no se inventan.
- El gym del código solo cae lunes a miércoles; Luis dijo entrenar 3 a 4 días (por confirmar, se verá en Fase 2).

## Caja 3 · Viabilidad y datos
- La app solo lee Supabase (el Sheet de datos está despublicado). Para que la capa Proyectos lea algo, los proyectos tienen que vivir en Supabase en una ruta nueva (por ejemplo `proyectos/<id>`).
- Propuesta: **fuente única = Supabase**, y una copia de solo lectura en el Sheet para que el Segundo Cerebro siga funcionando. Sembrar una sola vez desde el Tablero y SC Nodos.
- Agregar un campo `proyecto` a las tareas (cambio aditivo) para saber qué siguiente paso pertenece a qué proyecto.
- La pestaña nueva se agrega como una vista más de Mi día (misma forma que Hoy, Semana y Menú).
- Pendiente de decidir en Fase 2: dónde se escribe una calificación o un descarte hecho desde el celular sin internet (cola offline, como Hungry).

## Caja 4 · Reglas, privacidad, costos
- Privacidad: solo Luis, con login. Personas no entran al mapa; Amor y Familia, si entran, solo como área general, sin detalles. El repositorio es público: no se escriben datos personales en estos documentos.
- Escribir una ruta nueva en Supabase necesita autorización expresa de Luis (hoy Claude solo escribe en tareas y comida).
- Costo adicional: 0. Supabase Free se pausa tras una semana sin actividad (documentación de Supabase); Mi día ya mantiene actividad con su latido. Los datos son diminutos, lejos del límite de 500 MB.
- "Nunca rachas": los puntos y niveles no pueden castigar ni borrar progreso; solo reconocer.

## 3 funciones ganadoras (propuesta)
1. **Inicio con un solo siguiente paso**, respetando el orden del bloque de trabajo.
2. **Mapa de proyectos** por estado y área, con la tarjeta completa.
3. **Revisión de parados**: aviso según el tipo y descartar = archivar, recuperable.

Después de esas tres: conexiones, puntos y niveles, y editar tareas desde Proyectos (checkpoints 5.2 y 5.3).
