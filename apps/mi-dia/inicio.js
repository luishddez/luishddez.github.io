/* Mi día · Inicio tipo tablero (paso i1: armazón, solo lectura).
   Se carga después de proyectos.js y antes de app.js; aquí solo se declaran funciones que app.js llama después.
   Diseño aprobado: bloque de enfoque (un solo paso) + columnas Trabajo, Proyectos, Personal y rutina + Ideas por elegir.
   Prioridad de arriba hacia abajo. Por ahora el orden es automático (importancia, luego lo menos tocado); acomodarlo a mano llega en i2. */
const INI_MAX = 3;   // máximo de tarjetas visibles por columna (poco a la vez); el resto queda en "+ N más"

// Primero el orden que acomodó Luis; lo que no acomodó, con paso primero, luego lo más importante y lo menos tocado
function iniOrden(l) {
  const paso = p => String(p.siguiente_paso || '').trim() ? 0 : 1;
  return l.slice().sort((a, b) => proyRangoCmp(a, b) || paso(a) - paso(b) || (Number(b.importancia) || 0) - (Number(a.importancia) || 0) || (proyDias(b) ?? 0) - (proyDias(a) ?? 0) || String(a.nombre).localeCompare(String(b.nombre)));
}
// La lista de una columna, completa (también lo que queda en "+ N más"), en el orden en que se ve
const iniLista = esTrabajo => iniOrden(proyLista().filter(p => p.estado === 'activo' && !(est.proyHechos || {})[p.id] && !!p.trabajo === esTrabajo));

// ---------- Acomodar la prioridad (i2): Subir, Bajar y Mover a… Se guarda en inicio/orden ----------
let iniUndo = null;   // el orden anterior de la columna que se movió, para Deshacer
function iniMover(id, destino) {
  const p = proyPorId(id); if (!p) return;
  const lista = iniLista(!!p.trabajo), de = lista.findIndex(x => x.id === id);
  if (de < 0) return;
  destino = Math.max(0, Math.min(lista.length - 1, destino));
  if (destino === de) { toast(destino === 0 ? 'Ya está hasta arriba' : 'Ya está hasta abajo'); return; }
  const ids = lista.map(x => x.id); ids.splice(de, 1); ids.splice(destino, 0, id);
  const doc = { ...(proyOrdenDoc() || {}), id: 'orden' }, col = p.trabajo ? 'trabajo' : 'proyectos';
  iniUndo = { col, antes: Array.isArray(doc[col]) ? doc[col].slice() : null };
  doc[col] = ids;
  proyEncola('inicio/orden', 'inicio-orden', doc);
}
function iniDeshacer() {
  if (!iniUndo) return;
  const doc = { ...(proyOrdenDoc() || {}), id: 'orden' };
  if (iniUndo.antes) doc[iniUndo.col] = iniUndo.antes; else delete doc[iniUndo.col];
  iniUndo = null;
  proyEncola('inicio/orden', 'inicio-orden', doc);
}
function iniAccion(a, v) {
  switch (a) {
    case 'iniSubir': { const p = proyPorId(v), l = p && iniLista(!!p.trabajo); if (l) iniMover(v, l.findIndex(x => x.id === v) - 1); return true; }
    case 'iniBajar': { const p = proyPorId(v), l = p && iniLista(!!p.trabajo); if (l) iniMover(v, l.findIndex(x => x.id === v) + 1); return true; }
    case 'iniDeshacer': iniDeshacer(); toast('Orden anterior restaurado'); return true;
  }
  return false;
}
document.addEventListener('change', e => { const t = e.target; if (t && t.dataset && t.dataset.ini === 'mover' && proySel) { iniMover(proySel, Number(t.value)); render(); } });
// Fila de prioridad en el panel: posición, Subir, Bajar, Mover a… y Deshacer (sirve igual con mouse que con el dedo)
function iniFilaPrioridad(p) {
  if (p.estado !== 'activo' || (est.proyHechos || {})[p.id] || proyEditando()) return '';
  const l = iniLista(!!p.trabajo), pos = l.findIndex(x => x.id === p.id); if (pos < 0) return '';
  const nom = p.trabajo ? 'Trabajo' : 'Proyectos';
  return `<section class="ipri"><div class="pk">Prioridad en ${nom}</div><div>Posición <b>${pos + 1}</b> de ${l.length}. Arriba es lo más prioritario.</div>
  <div class="acc"><button data-a="iniSubir" data-v="${esc(p.id)}">▲ Subir</button><button data-a="iniBajar" data-v="${esc(p.id)}">▼ Bajar</button>
  <select data-ini="mover" aria-label="Mover a la posición">${l.map((_, k) => `<option value="${k}"${k === pos ? ' selected' : ''}>Mover a la posición ${k + 1}</option>`).join('')}</select>
  ${iniUndo ? `<button data-a="iniDeshacer">↶ Deshacer</button>` : ''}</div></section>`;
}

// ---------- Arrastrar y soltar con el mouse (i3, solo compu) ----------
// Mover dentro de la misma columna guarda igual que Subir/Bajar (inicio/orden, con Deshacer). Entre columnas NO mueve:
// pasar de Trabajo a Proyectos cambia la marca "trabajo" del proyecto y eso se hace con Editar, no arrastrando.
// En celular no hay arrastre: se usan Subir, Bajar y Mover a… del panel.
let iniArr = null;   // { id, col } de lo que se está arrastrando
function iniLimpiaArr() { document.querySelectorAll('.idrag.arr,.idrag.sobre').forEach(n => n.classList.remove('arr', 'sobre')); }
document.addEventListener('dragstart', e => {
  const d = e.target.closest && e.target.closest('.idrag'); if (!d) return;
  iniArr = { id: d.dataset.id, col: d.dataset.col };
  e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', d.dataset.id); } catch (_) { }
  d.classList.add('arr');
});
document.addEventListener('dragover', e => {
  const d = e.target.closest && e.target.closest('.idrag'); if (!d || !iniArr) return;
  if (d.dataset.col !== iniArr.col) return;   // otra columna: no se puede soltar aquí
  e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('.idrag.sobre').forEach(n => { if (n !== d) n.classList.remove('sobre'); });
  if (d.dataset.id !== iniArr.id) d.classList.add('sobre');
});
document.addEventListener('drop', e => {
  const d = e.target.closest && e.target.closest('.idrag'); if (!d || !iniArr) return;
  e.preventDefault();
  const a = iniArr; iniArr = null; iniLimpiaArr();
  if (d.dataset.col !== a.col || d.dataset.id === a.id) return;
  const p = proyPorId(a.id); if (!p) return;
  const dest = iniLista(!!p.trabajo).findIndex(x => x.id === d.dataset.id);
  if (dest >= 0) { iniMover(a.id, dest); render(); }
});
document.addEventListener('dragend', () => { iniArr = null; iniLimpiaArr(); });   // soltar fuera de una tarjeta de su columna no mueve nada

function iniTarjetaProyecto(p, i) {
  const paso = String(p.siguiente_paso || '').trim();
  const col = p.trabajo ? 'trabajo' : 'proyectos';
  return `<div class="idrag" draggable="true" data-id="${esc(p.id)}" data-col="${col}"><button class="icd${i === 0 && paso ? ' top' : ''}${paso ? '' : ' vacio'}" data-a="proySel" data-v="${esc(p.id)}"><span class="icd-x">${paso ? esc(paso) : 'Escribe el siguiente paso'}</span><span class="icd-p">${esc(p.nombre)}</span></button></div>`;
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
  const todos = proyLista();
  const trab = iniLista(true), proy = iniLista(false);
  const ideas = todos.filter(p => p.estado === 'idea semilla');
  // Personal y rutina: lo de hoy que ya calcula Mi día (comida, gym, cena, cierre…) y las tareas, en orden de hora
  const per = real.filter(i => (i.tipo === 'base' || i.tipo === 'tarea') && i.id !== 'pregunta' && !hecho(i) && i.fin > i.ini && i.fin > m).sort((a, b) => a.ini - b.ini)
    .map(i => `<div class="icd per"><span class="icd-x">${esc(i.titulo)}</span><span class="icd-p">${fmt(i.ini)}–${fmt(i.fin)}</span></div>`);
  const f = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  let h = `<div class="ihead"><b>${esc(f.charAt(0).toUpperCase() + f.slice(1))}</b>${iniUndo ? ` <button class="ideshacer" data-a="iniDeshacer">↶ Deshacer el último movimiento</button>` : ''}</div>` + iniHero(real, m);
  h += `<div class="icols">`
    + iniColumna('Trabajo', '💼', 'var(--cal)', trab.map(iniTarjetaProyecto), 'Sin proyectos de trabajo activos.')
    + iniColumna('Proyectos', '🚀', 'var(--k-rut)', proy.map(iniTarjetaProyecto), 'Sin proyectos activos.')
    + iniColumna('Personal y rutina', '🌿', 'var(--now)', per, 'Nada más por hoy.')
    + `<section class="icol" style="--a:var(--mute)"><div class="icol-h"><span aria-hidden="true">💡</span>Ideas<small>${ideas.length}</small></div>${ideas.map(p => `<button class="iidea" data-a="proySel" data-v="${esc(p.id)}">${esc(p.nombre)}</button>`).join('') || '<div class="nota">Sin ideas por elegir.</div>'}</section>`
    + `</div>`;
  const sel = proySel && proyPorId(proySel);
  if (sel) h += `<aside class="ipanel" aria-label="Tarjeta del proyecto">${proyTarjeta(sel)}${iniFilaPrioridad(sel)}</aside>`;
  return h;
}
