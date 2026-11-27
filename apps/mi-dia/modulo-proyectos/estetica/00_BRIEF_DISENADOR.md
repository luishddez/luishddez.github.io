# 3b · Brief para el Diseñador de esencia de marca (Mi día)

Escrito el 2026-11-27 con lo que Luis ya dijo en conversaciones anteriores. Sirve para llenar las 4 etapas del Diseñador sin repetir. Lo que Luis cambie en la herramienta manda sobre este brief.

## Regla del SOP que aplica
La estética es el paso 3b y va al final, después de cerrar la estructura. Luis la decide en el Diseñador; Claude no inventa estética. El archivo de decisión (tokens, variables CSS y especificación de interfaz) se guarda en esta carpeta y Claude lo lee de aquí. Solo se aplica a Mi día; Hungry y Temple quedan como están. La unificación del ecosistema es un proyecto aparte, y por eso todo va como tokens reutilizables.

## Qué es Mi día (para la etapa de marca)
- App personal de un solo usuario. Organiza el día, los proyectos y la comida. No es un consultorio ni un producto para vender.
- Se usa en computadora para ordenar y en celular (iPhone) para consultar y ejecutar. Computadora primero, celular también edita.
- Luz mixta, uso diario, sesiones cortas.

## Personalidad y tono
- Adjetivos: calma, claridad, enfoque, ligereza.
- Tono: directo y cálido. Sin culpa, sin presión, sin rachas. El atraso es un dato, no una falta.
- Idioma: español de México.

## Los 4 rasgos que Luis eligió (2026-11-25)
1. Fondo oscuro con **un solo acento fuerte**.
2. **Anillos de progreso** con número grande.
3. **Mosaicos o tarjetas con degradado suave**, solo en lo importante.
4. **Atmósfera de fondo** (degradado o imagen difuminada), sin fotos en cada tarjeta.
Las referencias que le gustaron son diseños de otras personas: solo inspiración, no se copian ni se guardan en el repo.

## Restricciones que no se negocian
- Pensado para TDAH: un solo foco a la vez, poco a la vez (máximo 3 tarjetas por columna), avanzar se siente bien, sin castigo, colores estables.
- **Nunca rojo de culpa.** El error real sí puede usar su color de estado, pero el atraso no.
- **El color nunca es lo único que informa:** cada sección y estado lleva nombre e ícono.
- Zonas de toque de 44 px o más. Texto legible a 16 px en celular.
- Contraste suficiente en oscuro (AA como mínimo).
- Respetar "reducir movimiento" del sistema.
- Números tabulares en anillos, contadores y horas.

## Significado de color ya en uso (conservar la idea, el tono lo decide el Diseñador)
| Sección | Idea | Color actual (v3) |
|---|---|---|
| Trabajo | MegaGen y trabajo | azul `#6ea8fe` |
| Proyectos | proyectos propios | violeta `#b79cff` |
| Personal y rutina | día a día, avance | verde `#5fd3b0` |
| Ideas | semillas, sin avance | gris apagado |
Fondo oscuro de la v3: `#12161b`, paneles `#1b2129`, bordes `#2a3440`, texto `#eef2f6`, texto apagado `#9aa7b4`. Son propuestas aprobadas con el diseño del Inicio, no una decisión final de estética.

## Qué pantallas debe cubrir la especificación
Inicio (bloque de enfoque, anillo grande, cuatro columnas con anillo propio, tarjetas con ▲ ▼, panel lateral, Modo enfoque), Hoy (hero de "ahora", actividades), Proyectos (mapa de conexiones y tarjeta), formularios de edición, avisos y mensajes de logro.

## Qué pedir al exportar
1. Tokens DTCG (`.tokens.json`).
2. Variables CSS (`.css`).
3. Especificación de interfaz (`.md`).
4. Guía de marca (`.md`).
Guardarlos en `apps/mi-dia/modulo-proyectos/estetica/`.

## Cómo se aplica después (lo hace Claude)
1. Paso 3b-0, ya posible: reemplazar los colores y medidas fijos de `index.html` por variables, con **los mismos valores de hoy**, para que no cambie nada a la vista.
2. Paso 3b-1: cargar los tokens del Diseñador en esas variables y revisar a mano los pocos colores fijos del código (aviso de comida, etc.).
3. Verificar con la pestaña "Verificar pantallas" del Diseñador, y probar en computadora y celular antes de publicar.
