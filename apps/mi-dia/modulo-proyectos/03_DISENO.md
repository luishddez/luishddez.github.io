# 03 · Diseño pantalla por pantalla (Fase 3, borrador del 2026-11-25)

Las maquetas se mostraron en la conversación con datos reales de Luis. Los tiempos de "última vez que lo toqué" y de "parado" de las maquetas son de ejemplo: ese dato todavía no existe.

Navegación: dos pestañas abajo, **Inicio** y **Proyectos**. La tarjeta y la revisión de parados se abren desde Proyectos.

## Pantalla 1 · Inicio ligero
- Arriba: fecha, hora y en qué bloque estás (trabajo o libre).
- **Un solo siguiente paso**, grande, con botones "Empezar" y "Otro paso". En horario de trabajo (9:00 a 18:00, lunes a viernes) el paso viene primero del trabajo; después, de los proyectos.
- **Hoy**: comida (1 h entre 1 y 3 pm), gym si hoy toca (se lee de Temple) y cena.
- **Próximo en el calendario**: los siguientes 2 o 3 eventos. El bloque de trabajo no se pinta.
- Abajo, una línea tranquila: cuántos proyectos activos hay a un toque.
- Fin de semana: la mañana se muestra como hueco de proyectos, sin obligar.

## Pantalla 2 · Proyectos (el mapa)
- Filtros por área: Todas, Yo, Profesional, Conocimiento (Amor y Familia solo como área general, sin detalles).
- Grupos: Activos, Bloqueados, Ideas semilla. Los archivados no se muestran; hay un contador y un acceso para verlos.
- Cada tarjeta chica: punto de color del área, nombre y hace cuánto lo tocaste. Un toque abre la tarjeta completa.

## Pantalla 3 · Tarjeta de proyecto
- Siguiente paso, por qué me importa y última vez que lo toqué.
- Potencia e importancia de 1 a 5, que califica Luis (siempre arrancan "sin calificar").
- Conexiones con otros proyectos e ideas (v1: lista; el dibujo de líneas viene en el checkpoint 5.3).
- Tareas del proyecto, tomadas del campo `proyecto` de las tareas.
- Botones: Pausar, Hecho, Archivar.

## Pantalla 4 · Revisar parados
- Lista corta de lo que lleva demasiado sin tocarse. Cada uno con **Mantener** o **Archivar**.
- Archivar no borra: queda un aviso con **Recuperar**. Siempre sin culpa.
- Si no hay nada parado: "Nada parado por ahora. Todo al día."

## Umbrales propuestos (a ajustar usando la app)
- Idea semilla: avisa a los 30 días sin tocar.
- Proyecto activo: 14 días.
- Investigación: 21 días.
- En pausa o bloqueado: no avisa.
- Tope de proyectos activos sugerido: 5 (hoy hay 6). Si se pasa, lo muestra sin bloquear.
- Estos avisos solo se ven al abrir la pantalla; no hay notificaciones.

## Pendiente de decidir en las maquetas
- Si el aviso de parados es una pestaña propia o un acceso desde Proyectos (propuesta: acceso desde Proyectos).
- Cómo se ven los puntos y niveles (checkpoint 5.3).

## Cambios del 2026-11-25 tras revisar las maquetas con Luis (mandan sobre lo de arriba)

### Inicio v2
- **Barra de avance del día**: un segmento por actividad del día (rutina más los pasos de trabajo elegidos), con "n de N" y porcentaje. Un solo color neutro; nunca rojo ni culpa si va atrás. Se marca tocando cada actividad o con "Listo".
- **Siguiente paso con contexto**: proyecto, qué hacer exactamente, por qué ahora, qué queda al terminar y cuánto tarda.
- **Botones**: "Listo" (marca el paso y avanza la barra) y "Ahora no" (lo manda al final de la cola de hoy y muestra el siguiente, sin culpa). Sustituye a "Otro paso", que no se entendía. Con una explicación corta debajo.
- En horario de trabajo la cola solo trae pasos de trabajo; después de las 18:00, pasos de proyectos.
- **Pendiente de datos**: hoy nada marca qué es "trabajo". Propuesta: marca `trabajo` por proyecto que sus tareas heredan, con cambio manual por tarea. Luis aún no responde.

### Proyectos v2 (reemplaza las pantallas 2 y 3 de arriba en lo visual)
- Es un **mapa de conexiones**, no una lista. Cada proyecto es una pastilla; el área va escrita ("Yo · activo"), **sin colores por área**.
- Pastilla blanca = activo o bloqueado; pastilla gris = idea semilla. Las ideas semilla están ocultas al arrancar, con un botón para mostrarlas.
- Al tocar un proyecto se resaltan sus líneas (único color de acento), el resto se atenúa y abajo se lee con qué se conecta y por qué.
- Línea sólida = conexión que ya existe en las notas de Luis. Línea punteada = propuesta de Claude, Luis confirma o descarta. Propuestas abiertas: Mi día con Almacén de implantes (misma base de datos) y Mi día con el Diseñador de estética.
- Con muchos elementos habrá que acomodar los nodos solos y apoyarse en el filtro por área (se resuelve al construir).

### Estética (se aplica al final, después de cerrar la estructura)
Luis eligió: fondo oscuro con un solo acento, anillos de progreso con número grande (barra de avance del día y avance por proyecto), mosaicos con degradado suave solo en lo importante, y atmósfera de fondo (degradado o imagen difuminada, sin fotos en cada tarjeta). Las referencias son diseños de otras personas: solo inspiración, no se copian ni se guardan aquí.

## Cambio nuevo del 2026-11-25: Tablero para acomodar (propuesta, Luis aún no la aprueba)

Pedido de Luis: poder arrastrar cosas en horarios o prioridades, como un dashboard que se manipula un poco, para cuando está confundido y no sabe qué va antes y qué después: ver las variables y acomodarlas.

### Idea
Una tercera pestaña, **Tablero** (Inicio, Proyectos, Tablero). Lo que se acomoda ahí manda sobre lo que muestra Inicio: el "siguiente paso" es el primero de la cola que Luis ordenó. Así hay una sola fuente de orden y no dos que compiten.

### Tres vistas dentro del Tablero (Luis elige cuáles quiere)
1. **Día (horarios)**: línea de horas de hoy. El bloque de trabajo de 9:00 a 18:00 aparece como una franja fija y no se arrastra. Comida, gym y los pasos de proyectos son bloques que se arrastran a otra hora. Los huecos libres se ven como huecos.
2. **Prioridad (columnas)**: Ahora, Siguiente, Luego, Soltar. Se arrastran tareas y proyectos entre columnas y dentro de cada una. "Soltar" lleva a archivar con aviso y Recuperar, nunca borra.
3. **Variables (cuadrícula)**: ejes importancia y potencia, de 1 a 5. Arrastrar un proyecto a una celda le pone esos valores. Las pone Luis al soltar; nada se calcula ni se inventa.

### Reglas
- Un toque largo para arrastrar en iPhone, para no chocar con el desplazamiento. Cada elemento tiene además botones "Subir" y "Bajar" por si arrastrar falla o es incómodo.
- "Deshacer" visible después de cada movimiento. Sin culpa si se acomoda mal.
- Mover algo cambia datos que ya existen: `orden`, `hora`, `fecha`, `prioridad` y `bloque` en tareas; `potencia`, `importancia` y el orden en proyectos. Por ahora no hace falta un campo nuevo en tareas (se verifica al construir).
- Mismas reglas de siempre: Supabase manda, gana el cambio más reciente, funciona sin internet y se sincroniza al volver.
- Escribir en Supabase desde la app (lo que ya hace con tareas) no cambia; escribir `proyectos/*` desde Claude sigue necesitando la autorización de la Fase 4.
- Entra en el checkpoint 5.3 (después de que Inicio y el mapa funcionen con datos reales). La vista Día es la candidata a salir primero.
