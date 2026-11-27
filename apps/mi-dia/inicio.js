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
  toast(`Ahora es la ${destino + 1}.ª de ${ids.length} · ↶ Deshacer arriba`);
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
    case 'iniColIzq': case 'iniColDer': { const l = iniColOrden(); iniColMover(v, l.indexOf(v) + (a === 'iniColIzq' ? -1 : 1)); return true; }
    case 'iniMas': iniAbierto[v] = !iniAbierto[v]; return true;
    case 'iniFoco': iniFoco = !iniFoco; return true;
    case 'iniPleg': iniPlegar(v, proyCola(ahoraMin()).trab ? 'trabajo' : 'proyectos'); return true;
    case 'iniCompras': iniCompAb = !iniCompAb; if (iniCompAb) { proySel = null; iniArchAb = false; iniNuevo = null; } return true;
    case 'iniArch': iniArchAb = !iniArchAb; if (iniArchAb) { proySel = null; iniCompAb = false; iniNuevo = null; } return true;
    case 'iniNuevoAbrir': proySel = null; iniCompAb = false; iniArchAb = false; iniNuevo = { nombre: '', tipo: 'proyecto', area: 'Yo', trabajo: false }; return true;
    case 'iniNuevoCancel': iniNuevo = null; return true;
    case 'nfTipo': if (iniNuevo) iniNuevo.tipo = v === 'idea' ? 'idea' : 'proyecto'; return true;
    case 'nfArea': if (iniNuevo && PROY_AREAS.includes(v)) iniNuevo.area = v; return true;
    case 'iniNuevoCrear': return iniCrear();
  }
  return false;
}

// ---------- Orden de las columnas (lo mueve Luis; Trabajo va primero por defecto). Se guarda en inicio/orden, campo "columnas" ----------
const INI_COLS = ['trabajo', 'proyectos', 'personal', 'ideas'];
let iniAbierto = {};      // qué columnas tienen abierto el "+ N más" (no se guarda: al recargar vuelven a mostrar 3)
let iniCompAb = false;    // el panel de Compras está abierto
// 5.2b: panel "Nuevo" (proyecto o idea) y panel "Archivados". Un solo panel a la vez.
let iniNuevo = null;      // { nombre, tipo, area, trabajo } mientras el formulario está abierto (vive en variable: sobrevive a cualquier pintado)
let iniArchAb = false;
const iniSlug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'nuevo';
function iniCrear() {
  const n = iniNuevo, nombre = String(n && n.nombre || '').trim().slice(0, 80);
  if (!nombre) { toast('Ponle un nombre primero'); return true; }
  const usados = new Set(proyLista().map(p => p.id)); let id = iniSlug(nombre), k = 2; const base = id; while (usados.has(id)) id = base + '-' + (k++);
  const idea = n.tipo === 'idea';
  proyGuardaDoc({ id, nombre, area: PROY_AREAS.includes(n.area) ? n.area : 'Yo', tipo: idea ? 'idea' : 'proyecto', estado: idea ? 'idea semilla' : 'activo', trabajo: !!n.trabajo, siguiente_paso: '', porque: '', falta_saber: '', potencia: null, importancia: null, conexiones: [], ultima_vez: hoyKey(), origen: 'app ' + hoyKey() });
  iniNuevo = null; proySel = id; toast(idea ? 'Idea creada. Complétala con ✎ Editar' : 'Proyecto creado. Escribe su siguiente paso con ✎ Editar');
  return true;
}
document.addEventListener('input', e => { const t = e.target, f = t && t.dataset && t.dataset.nf; if (f && iniNuevo && t.type !== 'checkbox') iniNuevo[f] = t.value; });
document.addEventListener('change', e => { const t = e.target, f = t && t.dataset && t.dataset.nf; if (f && iniNuevo && t.type === 'checkbox') iniNuevo[f] = t.checked; });
function iniNuevoHtml() {
  const n = iniNuevo, chip = (a, v, txt, on) => `<button type="button" class="pfil${on ? ' on' : ''}" data-a="${a}" data-v="${v}" aria-pressed="${on}">${txt}</button>`;
  return `<aside class="ipanel" aria-label="Nuevo"><section class="pcard pform"><div class="ptop"><div><b class="pt">＋ Nuevo</b><div class="nota">Lo demás lo llenas después con ✎ Editar. Nada de esto se borra.</div></div><button class="pcls2" data-a="iniNuevoCancel" aria-label="Cerrar">✕</button></div>
  <label class="pl" for="nf-n">Nombre</label><input id="nf-n" type="text" data-nf="nombre" maxlength="80" autocomplete="off" placeholder="Cómo lo llamas" value="${esc(n.nombre)}">
  <div class="pl">Qué es</div><div class="pfils">${chip('nfTipo', 'proyecto', '🚀 Proyecto', n.tipo === 'proyecto')}${chip('nfTipo', 'idea', '💡 Idea', n.tipo === 'idea')}</div>
  <div class="pl">Área</div><div class="pfils">${PROY_AREAS.map(a => chip('nfArea', a, esc(a), n.area === a)).join('')}</div>
  <label class="pchk"><input type="checkbox" class="sw-in" role="switch" data-nf="trabajo"${n.trabajo ? ' checked' : ''}> Es de trabajo (MegaGen)</label>
  <div class="acc" style="margin-top:12px"><button class="pri" data-a="iniNuevoCrear">Crear</button><button data-a="iniNuevoCancel">Cancelar</button></div></section></aside>`;
}
function iniArchHtml() {
  const l = proyLista().filter(p => p.estado === 'archivado').sort((a, b) => String(b.archivado_fecha || '').localeCompare(String(a.archivado_fecha || '')));
  return `<aside class="ipanel" aria-label="Archivados"><section class="pcard"><div class="ptop"><div><b class="pt">🗄 Archivados</b><div class="nota">Archivar no borra nada. Recuperar los regresa a donde estaban.</div></div><button class="pcls2" data-a="iniArch" aria-label="Cerrar">✕</button></div>
  ${l.length ? l.map(p => `<div class="ptar"><span class="ptar-t">${esc(p.nombre)} <small class="nota">· ${esc(p.area)}${p.archivado_fecha ? ' · ' + esc(p.archivado_fecha) : ''}</small></span><button data-a="proyRecuperar" data-v="${esc(p.id)}">↩ Recuperar</button></div>`).join('') : '<div class="nota" style="margin-top:8px">Nada archivado todavía.</div>'}</section></aside>`;
}
// Secciones plegables en celular (D, 2026-11-27): cada columna se abre o se cierra con su flecha; cerrada deja visible su encabezado y su anillo.
// Por defecto solo está abierta la sección del foco (Trabajo en horario de trabajo, si no Proyectos). Lo que eliges se recuerda en este aparato. En compu no aplica.
let iniPleg = null;   // { clave: true } = cerrada; null = todavía sin elegir (se usa el valor por defecto)
try { const g = safe.get('tablero-ini-pleg', null); if (g && typeof g === 'object') iniPleg = g; } catch (_) { }
const iniCerrada = (key, foco) => iniPleg ? !!iniPleg[key] : key !== foco;
function iniPlegar(key, foco) {
  if (!iniPleg) { iniPleg = {}; INI_COLS.forEach(k => { iniPleg[k] = k !== foco; }); }
  iniPleg[key] = !iniPleg[key]; try { safe.set('tablero-ini-pleg', iniPleg); } catch (_) { }
}
// Modo enfoque (i4): atenúa todo menos el bloque "Empieza aquí", para cuando se satura. No se guarda: al recargar vuelve a verse todo. Escape también sale.
let iniFoco = false;
document.addEventListener('keydown', e => { if (e.key === 'Escape' && iniFoco && vistaSel === 'ini') { iniFoco = false; render(); } });
function iniColOrden() {
  const d = proyOrdenDoc(), l = d && Array.isArray(d.columnas) ? d.columnas.filter(k => INI_COLS.includes(k)) : [];
  return l.concat(INI_COLS.filter(k => !l.includes(k)));
}
function iniColMover(key, destino) {
  const l = iniColOrden(), de = l.indexOf(key); if (de < 0) return;
  destino = Math.max(0, Math.min(l.length - 1, destino));
  if (destino === de) { toast(destino === 0 ? 'Ya es la primera' : 'Ya es la última'); return; }
  l.splice(de, 1); l.splice(destino, 0, key);
  const doc = { ...(proyOrdenDoc() || {}), id: 'orden' };
  iniUndo = { col: 'columnas', antes: Array.isArray(doc.columnas) ? doc.columnas.slice() : null };
  doc.columnas = l;
  proyEncola('inicio/orden', 'inicio-orden', doc);
}
// Arrastrar el encabezado de una columna a otra (solo compu; en celular se usan los botones)
document.addEventListener('dragstart', e => {
  const h = e.target.closest && e.target.closest('.icol-h[data-colkey]'); if (!h) return;
  iniArr = { id: h.dataset.colkey, col: '__cols' };
  e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', h.dataset.colkey); } catch (_) { }
  const c = h.closest('.icol'); if (c) c.classList.add('arr');
});
document.addEventListener('dragover', e => {
  const c = e.target.closest && e.target.closest('.icol[data-key]'); if (!c || !iniArr || iniArr.col !== '__cols') return;
  e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('.icol.sobre').forEach(n => { if (n !== c) n.classList.remove('sobre'); });
  if (c.dataset.key !== iniArr.id) c.classList.add('sobre');
});
document.addEventListener('drop', e => {
  const c = e.target.closest && e.target.closest('.icol[data-key]'); if (!c || !iniArr || iniArr.col !== '__cols') return;
  e.preventDefault();
  const a = iniArr; iniArr = null; iniLimpiaArr(); document.querySelectorAll('.icol.arr,.icol.sobre').forEach(n => n.classList.remove('arr', 'sobre'));
  if (c.dataset.key === a.id) return;
  iniColMover(a.id, iniColOrden().indexOf(c.dataset.key)); render();
});
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

// ¿Hay mouse? Solo entonces las tarjetas y encabezados se arrastran (en táctil el arrastre estorba al desplazarte; ahí se usan los botones)
const iniFino = () => { try { return !!(window.matchMedia && matchMedia('(pointer:fine)').matches); } catch (_) { return true; } };
// ---------- Arrastrar y soltar con el mouse (i3, solo compu) ----------
// Mover dentro de la misma columna guarda igual que Subir/Bajar (inicio/orden, con Deshacer). Entre columnas NO mueve:
// pasar de Trabajo a Proyectos cambia la marca "trabajo" del proyecto y eso se hace con Editar, no arrastrando.
// En celular no hay arrastre: se usan Subir, Bajar y Mover a… del panel.
let iniArr = null;   // { id, col } de lo que se está arrastrando
function iniLimpiaArr() { document.querySelectorAll('.idrag.arr,.idrag.sobre,.icol.arr,.icol.sobre').forEach(n => n.classList.remove('arr', 'sobre')); }
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
  // Subir y Bajar van EN la tarjeta (se ven en celular y con teclado; en compu con mouse se arrastra). Arrastrar solo con mouse: en pantallas táctiles estorbaría al desplazarte.
  const mv = `<span class="imv"><button data-a="iniSubir" data-v="${esc(p.id)}" aria-label="Subir ${esc(p.nombre)}">▲</button><button data-a="iniBajar" data-v="${esc(p.id)}" aria-label="Bajar ${esc(p.nombre)}">▼</button></span>`;
  return `<div class="idrag" ${iniFino() ? 'draggable="true" ' : ''}data-id="${esc(p.id)}" data-col="${col}"><button class="icd${i === 0 && paso ? ' top' : ''}${paso ? '' : ' vacio'}" data-a="proySel" data-v="${esc(p.id)}"><span class="icd-x">${paso ? esc(paso) : 'Escribe el siguiente paso'}</span><span class="icd-p">${esc(p.nombre)}</span></button>${mv}</div>`;
}

// Anillo chico de una columna (cada columna avanza a su ritmo: Trabajo y Personal se reinician cada día; Proyectos es avance largo; Ideas no tiene anillo)
function iniAnillo(D, N) {
  const r = 17, C = 2 * Math.PI * r, off = N ? C * (1 - Math.min(1, D / N)) : C;
  return `<div class="icr" role="img" aria-label="${N ? `${D} de ${N}` : 'sin medir'}"><svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true"><circle cx="23" cy="23" r="${r}" fill="none" stroke="var(--line)" stroke-width="5"/><circle cx="23" cy="23" r="${r}" fill="none" stroke="var(--a)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/></svg><b>${N ? D : '–'}</b></div>`;
}
const iniResumen = (anillo, texto) => `<div class="icol-r">${anillo}<span class="nota">${texto}</span></div>`;

// key = trabajo | proyectos | personal | ideas. Con más de 3 tarjetas, "+ N más" se despliega (y vuelve a cerrarse con "Mostrar menos").
function iniColumna(key, titulo, icono, color, tarjetas, vacio, resumen, foco) {
  const abierto = !!iniAbierto[key], mas = tarjetas.length - INI_MAX, cerrada = iniCerrada(key, foco);
  const vis = tarjetas.slice(0, abierto ? tarjetas.length : INI_MAX).join('');
  const ord = iniColOrden(), pos = ord.indexOf(key), n = ord.length;
  const flechas = `<span class="icol-mv"><button data-a="iniColIzq" data-v="${key}" aria-label="Mover la columna ${esc(titulo)} antes"${pos === 0 ? ' disabled' : ''}><span class="hz">◀</span><span class="vt">▲</span></button><button data-a="iniColDer" data-v="${key}" aria-label="Mover la columna ${esc(titulo)} después"${pos === n - 1 ? ' disabled' : ''}><span class="hz">▶</span><span class="vt">▼</span></button></span>`;
  const tg = `<button class="icol-tg" data-a="iniPleg" data-v="${key}" aria-expanded="${!cerrada}" aria-label="${cerrada ? 'Abrir' : 'Cerrar'} la sección ${esc(titulo)}">${cerrada ? '▾' : '▴'}</button>`;
  return `<section class="icol${cerrada ? ' cerrada' : ''}" data-key="${key}" style="--a:${color}"><div class="icol-h" ${iniFino() ? 'draggable="true" ' : ''}data-colkey="${key}" title="Arrastra para cambiar el orden de las columnas"><span aria-hidden="true">${icono}</span>${esc(titulo)}<small>${tarjetas.length}</small>${flechas}${tg}</div>${resumen || ''}${vis || `<div class="nota">${vacio}</div>`}${mas > 0 ? `<button class="imas" data-a="iniMas" data-v="${key}" aria-expanded="${abierto}">${abierto ? 'Mostrar menos' : `+ ${mas} más`}</button>` : ''}</section>`;
}
const iniTarjetaIdea = p => `<button class="iidea" data-a="proySel" data-v="${esc(p.id)}"><span>${esc(p.nombre)}</span><span class="ibadge" title="Camino a proyecto">${proyIdeaN(p)}/3</span></button>`;

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
  const trab = iniLista(true), proy = iniLista(false);
  const ideas = todos.filter(p => p.estado === 'idea semilla');
  // Personal y rutina: lo de hoy que ya calcula Mi día (comida, gym, cena, súper…) y las tareas, en orden de hora
  const rut = real.filter(i => (i.tipo === 'base' || i.tipo === 'tarea') && i.id !== 'pregunta' && i.fin > i.ini);
  const per = rut.filter(i => !hecho(i) && i.fin > m).sort((a, b) => a.ini - b.ini)
    .map(i => `<div class="icd per"><span class="icd-x">${esc(i.titulo)}</span><span class="icd-p">${fmt(i.ini)}–${fmt(i.fin)}</span></div>`);
  // Compras: una sola tarjeta (no la lista); abre el panel con todo. Resaltada el día del súper (domingo).
  const nC = comprasTotal(), toca = new Date().getDay() === 0;
  per.unshift(`<button class="icd compras${toca ? ' top' : ''}" data-a="iniCompras"><span class="icd-x">🛒 Compras · ${nC ? `${nC} por comprar` : 'nada por comprar'}</span><span class="icd-p">${toca ? 'Hoy toca el súper' : 'Súper: domingo'}</span></button>`);
  // Un anillo por columna, cada uno a su ritmo
  const actT = todos.filter(p => p.estado === 'activo' && p.trabajo), dT = actT.filter(p => hechos[p.id]).length;
  const rutD = rut.filter(i => hecho(i)).length;
  const actP = todos.filter(p => p.estado === 'activo' && !p.trabajo);
  let ph = 0, pt = 0; actP.forEach(p => { const a = proyAvanceLargo(p); if (a) { ph += a.h; pt += a.t; } });
  const listas = ideas.filter(p => proyIdeaN(p) === 3).length;
  const res = {
    trabajo: iniResumen(iniAnillo(dT, actT.length), `${dT} de ${actT.length} pasos hoy · se reinicia cada día`),
    proyectos: iniResumen(iniAnillo(ph, pt), pt ? `${Math.round(ph / pt * 100)}% · ${ph} de ${pt} tareas ligadas (avance largo)` : 'Sin medir · liga tareas a tus proyectos'),
    personal: iniResumen(iniAnillo(rutD, rut.length), `${rutD} de ${rut.length} de hoy · se reinicia cada día`),
    ideas: `<div class="icol-r"><span class="nota">${listas ? `${listas} lista${listas > 1 ? 's' : ''} para pasar a Proyectos` : 'Sube a Proyectos con 3 datos: por qué, primer paso y qué falta saber'}</span></div>`
  };
  const fk = proyCola(m).trab ? 'trabajo' : 'proyectos';   // la sección del foco: es la que arranca abierta en celular
  const cols = {
    trabajo: () => iniColumna('trabajo', 'Trabajo', '💼', 'var(--cal)', trab.map(iniTarjetaProyecto), 'Sin proyectos de trabajo activos.', res.trabajo, fk),
    proyectos: () => iniColumna('proyectos', 'Proyectos', '🚀', 'var(--k-rut)', proy.map(iniTarjetaProyecto), 'Sin proyectos activos.', res.proyectos, fk),
    personal: () => iniColumna('personal', 'Personal y rutina', '🌿', 'var(--now)', per, 'Nada más por hoy.', res.personal, fk),
    ideas: () => iniColumna('ideas', 'Ideas', '💡', 'var(--mute)', ideas.map(iniTarjetaIdea), 'Sin ideas por elegir.', res.ideas, fk)
  };
  const f = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  let h = `<div class="ihead"><b>${esc(f.charAt(0).toUpperCase() + f.slice(1))}</b>${iniUndo ? ` <button class="ideshacer" data-a="iniDeshacer">↶ Deshacer el último movimiento</button>` : ''}<button class="inuevo" data-a="iniNuevoAbrir">＋ Nuevo</button><button class="ifoco${iniFoco ? ' on' : ''}" data-a="iniFoco" aria-pressed="${iniFoco}">${iniFoco ? '✕ Salir del modo enfoque' : '🎯 Modo enfoque'}</button></div>` + iniHero(real, m);
  h += `<div class="icols${iniFoco ? ' foco' : ''}"${iniFoco ? ' aria-hidden="true" inert' : ''}>${iniColOrden().map(k => cols[k]()).join('')}</div>${iniFoco ? '<div class="nota ifoco-n">Modo enfoque: solo lo que toca ahora. Lo demás sigue guardado.</div>' : ''}`;
  const sel = proySel && proyPorId(proySel);
  if (sel) { iniCompAb = false; iniArchAb = false; iniNuevo = null; }   // un solo panel a la vez; abrir un proyecto cierra los demás
  const nArch = proyLista().filter(p => p.estado === 'archivado').length;
  h += `<div class="iarch"><button data-a="iniArch" aria-expanded="${iniArchAb}">🗄 Archivados (${nArch})</button></div>`;
  if (iniNuevo) h += iniNuevoHtml();
  else if (iniArchAb) h += iniArchHtml();
  else if (iniCompAb) h +=`<aside class="ipanel" aria-label="Compras"><section class="pcard"><div class="ptop"><div><b class="pt">🛒 Compras</b><div class="nota">${toca ? 'Hoy toca el súper' : 'El súper es el domingo'}</div></div><button class="pcls2" data-a="iniCompras" aria-label="Cerrar">✕</button></div>${comprasHtml()}</section></aside>`;
  else if (sel) h += `<aside class="ipanel" aria-label="Tarjeta del proyecto">${proyTarjeta(sel)}${iniFilaPrioridad(sel)}</aside>`;
  return h;
}
