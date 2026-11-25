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
