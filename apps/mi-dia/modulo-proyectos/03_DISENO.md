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

### Decisión de Luis (2026-11-25): quiere las vistas **Prioridad** y **Variables**. La vista **Día (horarios)** queda fuera por ahora (la rutina ya sale en Inicio).

### Tres vistas propuestas dentro del Tablero (solo 2 y 3 entran)
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

## Principio de Luis (2026-11-25): computadora primero, celular para consultar y también editar
- **Computadora** es donde Luis revisa, acomoda y reestructura. Ahí se usa todo el ancho: mapa completo sin arrastrar, tarjeta al lado, mouse con arrastrar y soltar, teclado (Enter abre un proyecto).
- **Celular** es para tener la información práctica a la mano y también para hacer cambios: una columna, botones grandes, una sola mano. Todo cambio que se pueda hacer arrastrando en la computadora debe tener un camino por toque en el celular (botones Subir y Bajar, "Mover a…").
- Para cada pantalla nueva se diseñan los dos anchos. Corte: 900 px. Ya aplicado a Proyectos en 5.1 (dos paneles en computadora, columna en celular). Inicio, el Tablero y el Modo caos se diseñan igual al construirse.
- La edición del 5.2 (siguiente paso, por qué me importa, estado, calificar, archivar) se hace igual de cómoda en celular y en computadora.

## Propuesta nueva del 2026-11-25: Modo caos (Luis aún no la aprueba)

Pedido de Luis: un modo para cuando no tiene idea de qué hacer y ya se enredó, que lo ayude a reestructurar todo.

### Idea
Un botón fijo en Inicio, "Estoy enredado", que abre una guía corta de pocos pasos, de una pantalla cada uno. Reutiliza datos que ya existen (rutina, tareas, proyectos sembrados, columnas del Tablero); no pide campos nuevos.

### Pasos propuestos (a ajustar según lo que responda Luis)
1. **Todo está guardado.** Un mensaje corto: no se pierde nada, nada se borra, sin culpa.
2. **Solo lo fijo de hoy.** Se esconde todo lo demás y se ven solo las cosas con hora: trabajo 9 a 6 si es entre semana, comida, gym si toca.
3. **Elegir UNA cosa.** Máximo 3 candidatos (primero los de trabajo en horario de trabajo; luego lo que esté en "Ahora" del Tablero; luego lo más importante según sus propias calificaciones). Lo que elija se vuelve el siguiente paso de Inicio.
4. **Soltar el resto por hoy.** Un toque manda todo lo demás a "Luego". Con Deshacer. Nada se archiva ni se borra aquí.
5. **Volver a Inicio** con un solo paso y la barra de avance.

### Ajuste tras responder Luis (2026-11-25)
Luis dijo que se enreda por: demasiadas cosas a la vez, se le acumuló y va atrasado, y no sabe qué importa más. No marcó "no sé qué sigue". Entonces el modo se arma para esos tres:
- **Demasiadas a la vez:** el paso 3 (elegir UNA cosa de máximo 3) y el paso 4 (soltar el resto por hoy) son el centro.
- **Atrasado:** un paso nuevo, **"Empezar de cero hoy"**. Junta lo que quedó vencido o sin hacer y lo manda todo a "Luego" con un toque, con Deshacer. Después, si él quiere, lo repasa de a una: Hoy, Luego o Archivar. Atrasarse es un dato, nunca una falta.
- **No sé qué importa:** un paso nuevo, **"¿Cuál importa más?"**. Le muestra dos proyectos a la vez y él elige uno, unas 4 rondas, y de eso sale un orden. El orden es solo una sugerencia: no se guarda como potencia ni importancia a menos que Luis lo confirme.

### Segundo nivel opcional: reestructurar a fondo
Para cuando el enredo es más grande que un día: lleva a la revisión de parados, al Tablero de Prioridad y a la cuadrícula de Variables, en ese orden, con un aviso de "esto toma unos 10 minutos". Sin obligar.

### Reglas
- Nunca castiga ni cuenta "veces que te enredaste". Sin rachas.
- Todo lo que mueve se puede deshacer.
- Funciona sin internet, igual que el resto.
- Entra en el checkpoint 5.3, junto al Tablero, porque usa sus columnas.

## CAMBIO DE DIRECCION del 2026-11-25 (Luis): Inicio tipo tablero en computadora (manda sobre lo anterior)

Lo que dijo Luis, revisando el 5.2a ya publicado:
1. Las **pestañas** sirven en el celular, pero en la computadora son poco prácticas e inconvenientes.
2. El **mapa de ramificaciones** de proyectos le gusta tal cual, porque lo ayuda cuando está perdido, pero **no es como visualizaba la entrega de las tareas**.
3. Lo que visualizaba: una **pantalla de inicio con 3 secciones divididas** (trabajo, proyectos y una tercera por definir) y, **de izquierda a derecha, de lo más prioritario a lo menos prioritario**.

Consecuencias para el diseño (borrador, pendiente de aprobación de Luis):
- **Computadora:** el Inicio es un tablero de una sola pantalla, sin pestañas para lo principal. Tres franjas (secciones) con tarjetas ordenadas de izquierda a derecha por prioridad. El mapa de conexiones pasa a ser un panel que se abre al lado o encima, no una pestaña aparte. La tarjeta de proyecto y su edición se abren en un panel lateral.
- **Celular:** se conservan las pestañas o una sola columna; las tres secciones se apilan y la prioridad se lee de arriba hacia abajo. Todo lo que se haga arrastrando en la computadora tiene botones Subir/Bajar y "Mover a…" en el celular.
- El **Tablero para acomodar** (columnas de prioridad y arrastrar) deja de ser una pestaña futura del 5.3 y **se vuelve el Inicio mismo**. La cuadrícula de Variables (importancia por potencia) queda como ayuda aparte.
- Se adelanta antes del 5.2b, porque cambia dónde viven las demás funciones (archivar, tareas ligadas, Modo caos).
- Definir con Luis: cuál es la tercera sección y qué es cada tarjeta (siguiente paso de proyecto, tarea suelta o ambas).

### Respuestas de Luis (2026-11-25)
- Secciones: **Trabajo**, **Proyectos** y **Personal y rutina**. Además, **Ideas por elegir** como una bandeja aparte (ideas semilla y lo que aún no decide). Si Luis quería solo 3, las ideas van dentro de Personal; se confirma con la maqueta.
- Tarjetas: Luis no contestó esa pregunta; se asume lo recomendado: **el siguiente paso de cada proyecto y las tareas sueltas, cada una con su proyecto**. Pendiente de confirmar con la maqueta.
- Orden: de izquierda a derecha, de lo más prioritario a lo menos. La prioridad la acomoda Luis (arrastrar en compu, Subir/Bajar en celular); nunca se inventa.
- Pasa antes: maqueta para compu y celular, aprobación de Luis y luego se programa.

### Ajuste de Luis tras ver la primera maqueta (2026-11-25)
- Prefiere el tablero en **vertical**: las secciones son **columnas lado a lado** (Trabajo, Proyectos, Personal y rutina) y la prioridad se lee **de arriba hacia abajo** dentro de cada columna (arriba = lo más prioritario). Reemplaza el "de izquierda a derecha" de arriba.
- Dijo "y así" para el resto: se conservan la barra de avance, el botón del Mapa, el botón "Estoy enredado", la bandeja de ideas por elegir y los datos reales de la maqueta.
- Celular: las mismas secciones apiladas una sobre otra, cada una con su lista de arriba hacia abajo; Subir y Bajar en lugar de arrastrar.

## DISENO APROBADO del Inicio v3 (Luis: "APRUEBO diseño", 2026-11-25). La maqueta interactiva NO se guardó como archivo; esto es la especificación.

Luis dijo "Excelente, me agrada" a la versión vertical y pidió que fuera más atractiva pensando en UX/UI y en su **TDAH**. Aprobó la v3.

### Pantalla (computadora, 900 px o más; sin pestañas para lo principal)
1. **Barra superior:** fecha, botón "Mapa" (abre el mapa de conexiones como panel, no como pestaña) y botón "Estoy enredado" (Modo caos).
2. **Bloque de enfoque** (el único punto grande): anillo de avance del día con número grande ("3 de 8"), la etiqueta "EMPIEZA AQUÍ · AHORA", el siguiente paso en texto grande, su proyecto, y botones grandes **✓ Listo** (acento verde) y **Ahora no**. Si no quedan pasos: "DESCANSA · Todo lo de hoy, hecho. Lo demás es tiempo tuyo, sin culpa."
3. **Tres columnas** más una angosta: **Trabajo** (azul), **Proyectos** (violeta), **Personal y rutina** (verde) y **Ideas por elegir** (gris). Prioridad **de arriba hacia abajo** (arriba = más prioritario).
4. **Tarjetas:** título del paso o tarea, proyecto debajo, asa de arrastrar. **Máximo 3 visibles por columna** y "+ N más". La **primera de cada columna** se resalta con un tinte suave de su color (en la versión real puede ser un degradado suave). Las de trabajo sin paso escrito van con borde punteado: "Escribe el siguiente paso".
5. **Modo enfoque** (botón abajo): atenúa todo menos el bloque de enfoque.
6. **Mensajes de logro:** "Listo. Eso ya cuenta." y "Sin culpa: lo mandé al final." Nunca rojo, nunca culpa, nunca rachas.

### Estilo (solo Mi día; el ecosistema se unifica después, como proyecto aparte)
Fondo oscuro `#12161b`, paneles `#1b2129`, bordes `#2a3440`, texto `#eef2f6`, texto apagado `#9aa7b4`. Acentos: Trabajo `#6ea8fe`, Proyectos `#b79cff`, Personal y avance `#5fd3b0`. Un color = un solo significado y **siempre con nombre e icono** (el color nunca es lo único que informa). Anillo con número grande. Dos pesos de letra. Zonas de toque de 44 px o más. Definir todo como variables reutilizables (tokens) para la unificación futura.

### Principios TDAH aplicados
Un solo foco a la vez · poco a la vez (máximo 3 por columna) · avanzar se siente bien (anillo y mensaje) · sin castigo ni urgencia roja · colores estables · botones grandes · modo enfoque para cuando se satura.

### Celular
Las mismas secciones apiladas, cada una con su lista de arriba hacia abajo; el bloque de enfoque va arriba. En lugar de arrastrar: botones **Subir / Bajar** y "Mover a…". Las pestañas pueden quedarse en celular.

### De dónde salen los datos
- **Trabajo:** el siguiente paso de los proyectos con marca `trabajo` (activos).
- **Proyectos:** el siguiente paso de los proyectos activos sin marca `trabajo`.
- **Personal y rutina:** los elementos de la rutina de hoy que ya calcula Mi día (comida, gym según Temple, cena, cierre) y tareas personales.
- **Ideas por elegir:** proyectos en estado "idea semilla".
- **Bloque de enfoque:** en horario de trabajo (lunes a viernes 9:00 a 18:00) sale primero el de Trabajo; fuera de ese horario, el de Proyectos.

### Plan de construcción (pasos chicos, rama dev/mi-dia, sin publicar hasta preguntar)
- **i1** Armazón: en pantalla ancha, el Inicio nuevo (bloque de enfoque + columnas) en lugar de las pestañas; el mapa y la tarjeta de proyecto abren como panel lateral. Solo lectura con los datos de arriba.
- **i2** Orden de prioridad guardado: campo numérico `orden` en `proyectos/*` (ya existe `orden` en `tareas/*`); para Personal y rutina falta decidir dónde se guarda el orden. Mover con Subir/Bajar y "Mover a…" (celular y compu).
- **i3** Arrastrar y soltar con el mouse (compu) y Deshacer visible; mismas reglas de cola sin internet y "gana el más reciente".
- **i4** Modo enfoque, Listo y Ahora no conectados al bloque nuevo, celular apilado, estilo oscuro con tokens.
- Después: 5.2b (archivar y recuperar, proyecto nuevo, tareas ligadas), 5.2c (gym desde Temple) y el Modo caos, que ya vive en este Inicio.
- Pendiente de decidir al construir: dónde se guarda el orden de Personal y rutina; si el total del anillo cuenta pasos de proyecto además de la rutina.

## Principio de Luis (2026-11-27): en Inicio ordeno, en Hoy ejecuto
- **Inicio** sirve para ver todas las opciones y acomodarlas (columnas, prioridad, compras, ideas, avance). **Hoy** solo muestra lo que toca hacer hoy, ya ordenado. Lo que se decide en Inicio manda sobre lo que se ejecuta en Hoy.
- Consecuencia: las compras se ordenan en Inicio (tarjeta Compras dentro de Personal y rutina) y en Hoy solo aparece el Súper como actividad (domingo, 11:00 a 12:30 por defecto, movible) que abre la lista.

## Cambios aprobados el 2026-11-27 (Luis: "APRUEBO 5.2a, i1, i2, i3 y los 4 cambios")
1. **Columnas en orden libre.** Trabajo primero por defecto. Flechas en el encabezado (en celular, arriba y abajo) y arrastrar el encabezado en compu. Se guarda en `inicio/orden`, campo `columnas`, con Deshacer.
2. **"+ N más" desplegable** en cada columna (se abre, se cierra con "Mostrar menos"). No se guarda: al recargar vuelve a mostrar 3. Las tarjetas desplegadas también se arrastran.
3. **Un anillo por columna**, cada uno a su ritmo:
   - Trabajo (diario): pasos hechos hoy entre proyectos de trabajo activos (un paso por proyecto). Se reinicia cada día.
   - Personal y rutina (diario): actividades hechas entre las del día. Se reinicia cada día. El Súper cuenta solo el domingo.
   - Proyectos (largo): tareas ligadas (campo `proyecto`) hechas entre el total. Sin tareas ligadas dice "Sin medir".
   - Ideas: sin anillo. Cada idea muestra n/3 (por qué me importa, un primer paso de 15 minutos, qué falta saber). Con los 3 sale **Pasar a Proyectos**, que la pasa a activo.
   - El anillo grande de arriba sigue siendo el avance del día completo.
4. **Compras.** Tarjeta en Personal y rutina con contador (faltantes de la alacena de Hungry más la lista de la semana), resaltada el día del súper. Abre un panel con la lista y "Comprado". Se quitan de Hoy las tarjetas de compras.

### Datos nuevos
- `proyectos/<id>.falta_saber` (texto, aditivo). Se edita en el formulario de Editar.
- `inicio/orden.columnas` (lista de claves: trabajo, proyectos, personal, ideas).
- La app calcula el avance largo con las tareas de Supabase que traen `proyecto`; no se guarda aparte.

### Pendiente de verificar (no probado con aparatos reales)
- Arrastre con mouse real y con Safari; iPhone real; "Pasar a Proyectos" con una idea real; el Súper en un domingo real.
- Siguiente en el plan: i4 (Modo enfoque, estilo oscuro con tokens, celular), luego 5.2b, 5.2c y el Modo caos.

## Hoy y Proyectos con el estilo nuevo (2026-11-27)
Principio: **en Inicio ordeno, en Hoy ejecuto**. Cada pantalla tiene su versión de escritorio y su versión de celular.

### Hoy
- **Escritorio (900 px o más):** la tira del día y la barra de avance van arriba a todo lo ancho. Debajo, dos columnas: a la izquierda el foco ("Ahora" y "Siguiente paso", con letra más grande), a la derecha "tu día" con la lista de actividades abierta, separada por una línea.
- **Celular:** una columna con el foco primero (tira y barra, "Ahora", "Siguiente paso", luego tu día plegado, y al final la frase, las notas en camino y lo comido).
- **Jerarquía:** "Ahora" es el único bloque con degradado suave. "Siguiente paso" es una tarjeta secundaria con una barra lateral del color de su sección (azul Trabajo, violeta Proyectos).

### Proyectos
- **Mapa:** cada nodo lleva el color de su sección (azul Trabajo, violeta Proyectos, punteado gris para ideas), con ícono y nombre (💼 🚀 💡). Hay una leyenda. En escritorio el lienzo es apaisado para llenar la pantalla; en celular se mueve con el dedo.
- **Panel sin selección:** deja de estar vacío y pasa a ser "Tu mapa": cuántos activos de Trabajo y de Proyectos, ideas, en pausa o bloqueados, y el botón ＋ Nuevo (abre el formulario del Inicio). Se ve a la derecha en escritorio y debajo del mapa en celular.
- **Pendiente:** las pastillas del mapa miden 40 px de alto (el mínimo táctil es 44 px) y aún no existe la revisión de parados.
