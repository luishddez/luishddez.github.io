/* Mi día · capa Proyectos (checkpoint 5.1, solo lectura).
   Se carga ANTES de app.js: aquí solo se declaran funciones, que app.js llama después. Usa las variables de app.js (datos, est, esc...) cuando ya existen. */
let proySel = null;          // id del proyecto abierto (en variable, no en el DOM, para que sobreviva a cada pintado)
function proyAccion() { return false; }
function vistaProyectos() {
  return `<div class="nota" style="padding:16px 2px">Proyectos: ${(datos.proyectos || []).length} leídos de tu cuenta. El mapa viene en el siguiente paso.</div>`;
}
