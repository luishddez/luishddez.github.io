/* Mi día · Inicio tipo tablero (paso i1: armazón, solo lectura).
   Se carga después de proyectos.js y antes de app.js; aquí solo se declaran funciones que app.js llama después.
   Diseño aprobado: bloque de enfoque (un solo paso) + columnas Trabajo, Proyectos, Personal y rutina + Ideas por elegir.
   Prioridad de arriba hacia abajo. Por ahora el orden es automático (importancia, luego lo menos tocado); acomodarlo a mano llega en i2. */
const INI_MAX = 3;   // máximo de tarjetas visibles por columna (poco a la vez); el resto queda en "+ N más"

// Primero los que ya tienen siguiente paso; dentro de cada grupo, lo más importante y lo menos tocado
function iniOrden(l) {
  const paso = p => String(p.siguiente_paso || '').trim() ? 0 : 1;
  return l.slice().sort((a, b) => paso(a) - paso(b) || (Number(b.importancia) || 0) - (Number(a.importancia) || 0) || (proyDias(b) ?? 0) - (proyDias(a) ?? 0) || String(a.nombre).localeCompare(String(b.nombre)));
}

function iniTarjetaProyecto(p, i) {
  const paso = String(p.siguiente_paso || '').trim();
  return `<button class="icd${i === 0 && paso ? ' top' : ''}${paso ? '' : ' vacio'}" data-a="proySel" data-v="${esc(p.id)}"><span class="icd-x">${paso ? esc(paso) : 'Escribe el siguiente paso'}</span><span class="icd-p">${esc(p.nombre)}</span></button>`;
}

function iniColumna(titulo, icono, color, tarjetas, vacio) {
  const vis = tarjetas.slice(0, INI_MAX).join(''), mas = tarjetas.length - INI_MAX;
  return `<section class="icol" style="--a:${color}"><div class="icol-h"><span aria-hidden="true">${icono}</span>${esc(titulo)}<small>${tarjetas.length}</small></div>${vis || `<div class="nota">${vacio}</div>`}${mas > 0 ? `<div class="imas">+ ${mas} más</div>` : ''}</section>`;
}

function iniHero(real, m) {
  const c = proyCola(m), p = c.cola[0], { D, N } = proyAvance(real, m), C = 213.6, off = N ? Math.round(C * (1 - D / N)) : C;
  const anillo = `<div class="iring" role="img" aria-label="${D} de ${N} actividades de hoy"><svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="34" fill="none" stroke="var(--line)" stroke-width="8"/><circle cx="42" cy="42" r="34" fill="none" stroke="var(--now)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}"/></svg><b>${D}<small>de ${N}</small></b></div>`;
  if (!p) {
    const t = c.trab ? 'No tienes pasos de trabajo anotados' : c.hechos ? 'Hiciste los pasos de hoy' : 'Ningún proyecto activo tiene siguiente paso';
    const s = c.trab ? 'Toca un proyecto de Trabajo y escribe su siguiente paso. Aquí saldrá primero.' : c.hechos ? 'Lo demás es tiempo tuyo, sin culpa.' : 'Toca un proyecto y escribe su siguiente paso.';
    return `<section class="ihero">${anillo}<div><div class="ieb">${c.hechos && !c.trab ? 'DESCANSA' : c.trab ? 'HORARIO DE TRABAJO' : 'SIN PASO ANOTADO'}</div><h2>${t}</h2><div class="nota">${s}</div></div></section>`;
  }
  const sig = c.cola[1];
  return `<section class="ihero">${anillo}<div><div class="ieb">EMPIEZA AQUÍ · ${c.trab ? 'TRABAJO' : 'PROYECTOS'}</div><h2>${esc(p.siguiente_paso)}</h2><div class="nota">${esc(p.nombre)} · ${esc(p.area)}</div></div><div class="iacts"><button class="pri" data-a="pasoListo" data-v="${esc(p.id)}">✓ Listo</button>${sig ? `<button data-a="pasoLuego" data-v="${esc(p.id)}">Ahora no</button>` : ''}</div></section>`;
}

function vistaInicio() {
  const m = ahoraMin(), dia = construirDia(m), real = dia.items.filter(i => i.tipo !== 'ctx');
  const todos = proyLista(), hechos = est.proyHechos || {};
  const activos = todos.filter(p => p.estado === 'activo' && !hechos[p.id]);
  const trab = iniOrden(activos.filter(p => p.trabajo)), proy = iniOrden(activos.filter(p => !p.trabajo));
  const ideas = todos.filter(p => p.estado === 'idea semilla');
  // Personal y rutina: lo de hoy que ya calcula Mi día (comida, gym, cena, cierre…) y las tareas, en orden de hora
  const per = real.filter(i => (i.tipo === 'base' || i.tipo === 'tarea') && i.id !== 'pregunta' && !hecho(i) && i.fin > i.ini && i.fin > m).sort((a, b) => a.ini - b.ini)
    .map(i => `<div class="icd per"><span class="icd-x">${esc(i.titulo)}</span><span class="icd-p">${fmt(i.ini)}–${fmt(i.fin)}</span></div>`);
  const f = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  let h = `<div class="ihead"><b>${esc(f.charAt(0).toUpperCase() + f.slice(1))}</b></div>` + iniHero(real, m);
  h += `<div class="icols">`
    + iniColumna('Trabajo', '💼', 'var(--cal)', trab.map(iniTarjetaProyecto), 'Sin proyectos de trabajo activos.')
    + iniColumna('Proyectos', '🚀', 'var(--k-rut)', proy.map(iniTarjetaProyecto), 'Sin proyectos activos.')
    + iniColumna('Personal y rutina', '🌿', 'var(--now)', per, 'Nada más por hoy.')
    + `<section class="icol" style="--a:var(--mute)"><div class="icol-h"><span aria-hidden="true">💡</span>Ideas<small>${ideas.length}</small></div>${ideas.map(p => `<button class="iidea" data-a="proySel" data-v="${esc(p.id)}">${esc(p.nombre)}</button>`).join('') || '<div class="nota">Sin ideas por elegir.</div>'}</section>`
    + `</div>`;
  const sel = proySel && proyPorId(proySel);
  if (sel) h += `<aside class="ipanel" aria-label="Tarjeta del proyecto">${proyTarjeta(sel)}</aside>`;
  return h;
}
