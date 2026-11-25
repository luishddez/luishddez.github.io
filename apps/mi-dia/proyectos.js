/* Mi día · capa Proyectos (checkpoint 5.1 ver, 5.2a editar).
   Se carga ANTES de app.js: aquí solo se declaran funciones, que app.js llama después. Usa las variables de app.js (datos, esc, dur...) cuando ya existen.
   Los datos vienen de Supabase (proyectos/<id>) y se guardan en 'tablero-datos'.
   5.2a: los cambios se guardan en tu cuenta. Cada guardado REEMPLAZA el documento completo del proyecto y gana el más reciente según data.actualizado.
   Sin internet, el cambio queda en una cola (clave propia en localStorage, no en est, que se reinicia cada día) y se manda solo al volver la conexión. */
let proySel = null;                 // id del proyecto abierto (en variable, no en el DOM, para sobrevivir a cada pintado)
let proyArea = 'todas';             // 'todas' | 'Yo' | 'Profesional' | 'Conocimiento'
let proyIdeas = false;              // las ideas semilla están ocultas al arrancar
const proyPos = { x: 0, y: 0, listo: false };   // dónde quedó el mapa al arrastrarlo con el dedo
const PROY_AREAS = ['Yo', 'Profesional', 'Conocimiento'];
const proyCache = { clave: '', pos: null };

// ---------- Cola de cambios por enviar ----------
const PROY_PEND = 'tablero-proy-pend';
let proyPendMem = null;
const proyPend = () => { if (!proyPendMem) { const v = safe.get(PROY_PEND, []); proyPendMem = Array.isArray(v) ? v.filter(x => x && x.id && x.data) : []; } return proyPendMem; };
const proySetPend = l => { proyPendMem = l; safe.set(PROY_PEND, l); };
// Lo que se ve = lo guardado en la cuenta + tus cambios que todavía no se mandan (así se ven al instante, con o sin internet)
let proyMemo = { base: null, firma: '', v: [] };
function proyLista() {
  const base = Array.isArray(datos.proyectos) ? datos.proyectos : [], pend = proyPend(), firma = pend.map(x => x.id + ':' + x.data.actualizado).join('|');
  if (proyMemo.base === base && proyMemo.firma === firma) return proyMemo.v;
  const m = new Map(); base.forEach(p => { if (p && p.id) m.set(p.id, p); }); pend.forEach(x => m.set(x.id, x.data));
  proyMemo = { base, firma, v: Array.from(m.values()).filter(p => p && p.id && p.nombre) };
  return proyMemo.v;
}
const proyPorId = id => proyLista().find(p => p.id === id);
const proyPendiente = id => proyPend().some(x => x.id === id);
// Pone el cambio en la cola (se ve ya) y lo manda en cuanto se pueda
function proyGuardaDoc(doc) {
  doc.actualizado = Date.now();
  proySetPend(proyPend().filter(x => x.id !== doc.id).concat([{ id: doc.id, data: doc }]));
  return proyEnviar();
}
const proyConectado = () => !!(window.SB && SB.activo() && SB.conSesion()) && navigator.onLine !== false;
let proyEnviando = false;
// Manda la cola. Nunca lanza errores. Si lo mismo se cambió en otro aparato más recientemente, gana ese y se avisa.
async function proyEnviar() {
  if (proyEnviando || !proyPend().length || !proyConectado()) return;
  proyEnviando = true;
  try {
    const srv = await SB.coleccion('proyectos'), porId = new Map(srv.filter(p => p && p.id).map(p => [p.id, p])), perdidos = []; let fallo = false;
    const quita = (id, ts) => proySetPend(proyPend().filter(x => !(x.id === id && x.data.actualizado === ts)));   // solo si no lo volviste a editar mientras se mandaba
    for (const it of proyPend().slice()) {
      const s = porId.get(it.id);
      if (s && Number(s.actualizado || 0) > Number(it.data.actualizado || 0)) { perdidos.push(it.data.nombre); quita(it.id, it.data.actualizado); continue; }
      try { await SB.guardar('proyectos/' + it.id, it.data); porId.set(it.id, it.data); quita(it.id, it.data.actualizado); } catch (e) { fallo = true; break; }
    }
    datos.proyectos = Array.from(porId.values()); safe.set('tablero-datos', datos);
    if (perdidos.length) toast(`“${perdidos[0]}”${perdidos.length > 1 ? ` y ${perdidos.length - 1} más` : ''}: se había cambiado antes en otro aparato y quedó esa versión (la más reciente)`);
    if (!fallo && proyPend().length) setTimeout(proyEnviar, 300);   // lo que se editó mientras se mandaba
  } catch (e) { /* sin conexión o sin sesión: queda en la cola */ }
  proyEnviando = false;
  proyRenderSeguro();
}
// Un pintado que no ocurre mientras escribes en el formulario (sincronizar en segundo plano no debe borrar lo que escribes)
const proyEscribiendo = () => { const a = document.activeElement; return !!(a && a.closest && a.closest('.pform') && /^(TEXTAREA|INPUT|SELECT)$/.test(a.tagName)); };
function proyRenderSeguro() { if (!proyEscribiendo()) render(); }
const proyNombre = p => String(p.nombre);
const proyCorto = p => { const n = proyNombre(p); return n.length > 21 ? n.slice(0, 20) + '…' : n; };
const proyAncho = p => Math.round(proyCorto(p).length * 6.6 + 28);
function proyDias(p) {
  const t = Date.parse(String(p.ultima_vez || '') + 'T00:00:00');
  return isNaN(t) ? null : Math.max(0, Math.floor((Date.now() - t) / 864e5));
}
const proyHace = d => d === null ? 'sin fecha' : d === 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`;
const proyVisible = p => !['hecho', 'archivado'].includes(p.estado) && (proyIdeas || p.estado !== 'idea semilla') && (proyArea === 'todas' || p.area === proyArea);

// Conexiones: se guardan en los dos lados; aquí cada una se cuenta una sola vez
function proyAristas(vis) {
  const ids = new Set(vis.map(p => p.id)), vistos = new Set(), res = [];
  vis.forEach(p => (p.conexiones || []).forEach(o => {
    if (!ids.has(o)) return;
    const k = [p.id, o].sort().join('|'); if (vistos.has(k)) return;
    vistos.add(k); res.push([p.id, o]);
  }));
  return res;
}

// Acomodo del mapa: determinista (sin azar), así los nodos no saltan entre pintados
function proyAcomoda(vis, aristas, W, H) {
  const P = {}, cx = W / 2, cy = H / 2, m = Math.min(W, H);
  vis.forEach(n => {
    const s = Math.max(0, PROY_AREAS.indexOf(n.area)), mis = vis.filter(x => x.area === n.area), k = mis.indexOf(n);
    const ang = (s + (k + 0.5) / mis.length) / 3 * 2 * Math.PI - Math.PI / 2, r = m * (0.26 + (k % 3) * 0.08);
    P[n.id] = { x: cx + Math.cos(ang) * r * 1.25, y: cy + Math.sin(ang) * r, w: proyAncho(n), h: 40 };
  });
  for (let it = 0; it < 320; it++) {
    const f = 1 - it / 320;
    for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
      const a = P[vis[i].id], b = P[vis[j].id];
      let dx = a.x - b.x, dy = a.y - b.y;
      if (dx === 0) dx = (i + j) % 2 ? 0.5 : -0.5;
      const ox = (a.w + b.w) / 2 + 34 - Math.abs(dx), oy = (a.h + b.h) / 2 + 34 - Math.abs(dy);
      if (ox > 0 && oy > 0) {
        if (ox < oy) { const s = Math.sign(dx) * ox * 0.5 * f; a.x += s; b.x -= s; }
        else { const s = (Math.sign(dy) || 1) * oy * 0.5 * f; a.y += s; b.y -= s; }
      } else { const d2 = dx * dx + dy * dy + 1, d = Math.sqrt(d2), fr = 1400 / d2 * f; a.x += dx / d * fr; a.y += dy / d * fr; b.x -= dx / d * fr; b.y -= dy / d * fr; }
    }
    aristas.forEach(([x, y]) => {
      const a = P[x], b = P[y], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, fr = (d - 230) * 0.02 * f;
      a.x += dx / d * fr; a.y += dy / d * fr; b.x -= dx / d * fr; b.y -= dy / d * fr;
    });
    vis.forEach(n => { const a = P[n.id]; a.x += (cx - a.x) * 0.0015; a.y += (cy - a.y) * 0.0015; a.x = Math.max(a.w / 2 + 12, Math.min(W - a.w / 2 - 12, a.x)); a.y = Math.max(34, Math.min(H - 34, a.y)); });
  }
  return P;
}

function vistaProyectos() {
  const todos = proyLista();
  if (!todos.length) return `<div class="card" style="margin-top:12px"><b>Aún no hay proyectos aquí.</b><div class="nota" style="margin-top:6px">Tus proyectos viven en tu cuenta. Entra a tu cuenta y toca “Actualizar” en el Menú para traerlos.</div></div>`;
  const vis = todos.filter(proyVisible);
  const ideasOcultas = todos.filter(p => p.estado === 'idea semilla' && (proyArea === 'todas' || p.area === proyArea)).length;
  const cerrados = todos.filter(p => ['hecho', 'archivado'].includes(p.estado)).length;
  const aristas = proyAristas(vis);
  const n = Math.max(vis.length, 1), W = Math.round(Math.max(380, 270 * Math.sqrt(n))), H = Math.round(W * 0.9);
  const clave = [proyArea, proyIdeas, vis.map(p => p.id).join(','), aristas.length].join('|');
  if (proyCache.clave !== clave) {
    proyCache.clave = clave; proyCache.pos = proyAcomoda(vis, aristas, W, H); proyPos.listo = false;
    // el lienzo se recorta a donde de verdad hay nodos, para no arrastrar por espacio vacío
    const q = Object.values(proyCache.pos), x0 = Math.min(...q.map(a => a.x - a.w / 2)) - 24, x1 = Math.max(...q.map(a => a.x + a.w / 2)) + 24, y0 = Math.min(...q.map(a => a.y - 20)) - 24, y1 = Math.max(...q.map(a => a.y + 20)) + 24;
    proyCache.vb = { x: x0, y: y0, w: Math.round(x1 - x0), h: Math.round(y1 - y0) };
  }
  const P = proyCache.pos, VB = proyCache.vb, sel = proySel && vis.find(p => p.id === proySel) ? proySel : null;
  const vecinos = new Set(sel ? [sel].concat((proyPorId(sel).conexiones || [])) : []);

  const chips = ['todas'].concat(PROY_AREAS).map(a => `<button class="pfil${proyArea === a ? ' on' : ''}" data-a="proyArea" data-v="${a}">${a === 'todas' ? 'Todas' : a}</button>`).join('');
  const ideasBtn = ideasOcultas || proyIdeas ? `<button class="pfil" data-a="proyIdeas">${proyIdeas ? 'Ocultar ideas' : `Mostrar ideas (${ideasOcultas})`}</button>` : '';
  let h = `<div class="pbar">${chips}${ideasBtn}</div><div class="nota" style="margin:2px 2px 6px">${vis.length} a la vista${cerrados ? ` · ${cerrados} hechos o archivados guardados` : ''}. ${proySel ? '' : 'Toca uno para ver sus conexiones.'}</div>`;

  if (!vis.length) return h + `<div class="card"><b>Nada para mostrar con este filtro.</b></div>`;
  const lineas = aristas.map(([a, b]) => `<line class="pe${sel ? (a === sel || b === sel ? ' on' : ' dim') : ''}" x1="${P[a].x.toFixed(1)}" y1="${P[a].y.toFixed(1)}" x2="${P[b].x.toFixed(1)}" y2="${P[b].y.toFixed(1)}"/>`).join('');
  const nodos = vis.map(p => {
    const q = P[p.id], w = q.w, cl = ['pn', p.estado === 'idea semilla' ? 'idea' : '', sel === p.id ? 'sel' : '', sel && !vecinos.has(p.id) ? 'dim' : ''].filter(Boolean).join(' ');
    return `<g class="${cl}" data-a="proySel" data-v="${esc(p.id)}" role="button" tabindex="0" aria-label="${esc(p.nombre)}. ${esc(p.area)}, ${esc(p.estado)}"><rect x="${(q.x - w / 2).toFixed(1)}" y="${(q.y - 20).toFixed(1)}" width="${w}" height="40" rx="14"/><text x="${q.x.toFixed(1)}" y="${(q.y - 3).toFixed(1)}" text-anchor="middle" class="nm">${esc(proyCorto(p))}</text><text x="${q.x.toFixed(1)}" y="${(q.y + 12).toFixed(1)}" text-anchor="middle" class="sub">${esc(p.area)} · ${esc(p.estado)}</text></g>`;
  }).join('');
  h += `<div class="pmapa${sel ? ' cc' : ''}" id="pmapa"><svg width="${VB.w}" height="${VB.h}" viewBox="${VB.x.toFixed(0)} ${VB.y.toFixed(0)} ${VB.w} ${VB.h}" role="group" aria-label="Mapa de proyectos y sus conexiones">${lineas}${nodos}</svg></div>`;
  // Computadora: mapa a la izquierda y tarjeta a la derecha (los dos a la vista). Celular: uno debajo del otro.
  const activos = todos.filter(p => p.estado === 'activo'), propios = activos.filter(p => !p.trabajo).length;
  const vacio = `<div class="pvacio card"><b>Elige un proyecto</b><div class="nota" style="margin-top:6px">Aquí verás su tarjeta: siguiente paso, por qué te importa, última vez y con qué se conecta.</div><div class="nota" style="margin-top:10px">Hoy tienes ${activos.length} activos (${propios} sin contar los de trabajo).</div></div>`;
  return `<div class="pwrap"><div class="pizq">${h}</div><aside class="pder">${sel ? proyTarjeta(proyPorId(sel)) : vacio}</aside></div>`;
}

// ---------- Tarjeta: se mira y se edita (5.2a) ----------
let proyBorrador = null;   // lo que escribes en el formulario, en variable: sobrevive a cualquier pintado
const proyEditando = () => !!(proyBorrador && proyBorrador.id === proySel);
const PROY_ESTADOS = ['activo', 'en pausa', 'bloqueado', 'idea semilla', 'hecho'];   // "archivado" llega en 5.2b
const proyNum = v => { const n = Number(v); return v === null || v === undefined || v === '' || !(n >= 1 && n <= 5) ? null : Math.round(n); };
function proySucio() {
  if (!proyEditando()) return false;
  const o = proyPorId(proyBorrador.id), b = proyBorrador; if (!o) return false;
  return (o.siguiente_paso || '').trim() !== (b.siguiente_paso || '').trim() || (o.porque || '').trim() !== (b.porque || '').trim() || o.estado !== b.estado || !!o.trabajo !== !!b.trabajo || proyNum(o.potencia) !== proyNum(b.potencia) || proyNum(o.importancia) !== proyNum(b.importancia);
}
const proyCal = (v) => (v === null || v === undefined || v === '') ? 'sin calificar' : `${esc(v)} de 5`;
function proyFormulario(p) {
  const b = proyBorrador, cal = campo => `<div class="pcal" role="group" aria-label="${campo === 'potencia' ? 'Potencia' : 'Importancia'} de 1 a 5">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="${proyNum(b[campo]) === n ? 'on' : ''}" data-a="proyCal" data-v="${campo}:${n}">${n}</button>`).join('')}<button type="button" class="${proyNum(b[campo]) === null ? 'on' : ''}" data-a="proyCal" data-v="${campo}:">sin calificar</button></div>`;
  return `<section class="pcard pform"><div class="ptop"><div><b class="pt">${esc(p.nombre)}</b><div class="nota">Editando · ${esc(p.area)} · ${esc(p.tipo)}</div></div></div>
  <label class="pl" for="pf-sp">Siguiente paso</label><textarea id="pf-sp" data-pf="siguiente_paso" rows="2" maxlength="300" placeholder="Lo siguiente concreto que harías">${esc(b.siguiente_paso || '')}</textarea>
  <label class="pl" for="pf-pq">Por qué me importa</label><textarea id="pf-pq" data-pf="porque" rows="2" maxlength="400" placeholder="Una frase">${esc(b.porque || '')}</textarea>
  <label class="pl" for="pf-es">Estado</label><select id="pf-es" data-pf="estado">${PROY_ESTADOS.map(e => `<option value="${e}"${b.estado === e ? ' selected' : ''}>${e}</option>`).join('')}</select>
  <label class="pchk"><input type="checkbox" data-pf="trabajo"${b.trabajo ? ' checked' : ''}> Es de trabajo (MegaGen)</label>
  <div class="pl">Potencia</div>${cal('potencia')}
  <div class="pl">Importancia</div>${cal('importancia')}
  <div class="nota" style="margin-top:8px">Las calificaciones las pones tú; si no calificas, queda “sin calificar”.</div>
  <div class="acc" style="margin-top:12px"><button class="pri" data-a="proyGuardar">Guardar</button><button data-a="proyCancelar">Cancelar</button></div></section>`;
}
function proyTarjeta(p) {
  if (proyEditando()) return proyFormulario(p);
  const d = proyDias(p), cons = (p.conexiones || []).map(proyPorId).filter(Boolean), pend = proyPendiente(p.id);
  return `<section class="pcard" aria-live="polite"><div class="ptop"><div><b class="pt">${esc(p.nombre)}</b><div class="nota">${esc(p.area)} · ${esc(p.estado)} · ${esc(p.tipo)}${p.trabajo ? ' · trabajo' : ''}${pend ? ' · <b style="color:var(--warn)">⏳ por enviar</b>' : ''}</div></div><button class="pcls2" data-a="proyCerrar" aria-label="Cerrar">✕</button></div>
  <div class="pk">Siguiente paso</div><div>${p.siguiente_paso ? esc(p.siguiente_paso) : '<span class="nota">Todavía no lo escribes.</span>'}</div>
  ${p.ultimo_paso_hecho ? `<div class="nota" style="margin-top:4px">Último paso hecho: ${esc(p.ultimo_paso_hecho)}${p.ultimo_paso_fecha ? ' · ' + esc(p.ultimo_paso_fecha) : ''}</div>` : ''}
  <div class="pk">Por qué me importa</div><div>${p.porque ? esc(p.porque) : '<span class="nota">Todavía no lo escribes.</span>'}</div>
  <div class="pg"><div><div class="pk">Última vez que lo toqué</div><div>${proyHace(d)}</div></div>
  <div><div class="pk">Potencia · importancia</div><div>${proyCal(p.potencia)} · ${proyCal(p.importancia)}</div></div></div>
  <div class="pk">Se conecta con</div><div>${cons.length ? cons.map(c => `<button class="pfil" data-a="proySel" data-v="${esc(c.id)}">${esc(c.nombre)}</button>`).join(' ') : '<span class="nota">Con nada todavía.</span>'}</div>
  <div class="acc" style="margin-top:12px"><button class="pri" data-a="proyEditar">✎ Editar</button></div></section>`;
}

// Después de pintar: el mapa conserva dónde lo dejaste (y arranca centrado)
function proyPostRender() {
  const m = document.getElementById('pmapa'); if (!m) return;
  if (!proyPos.listo) { m.scrollLeft = Math.max(0, (m.scrollWidth - m.clientWidth) / 2); m.scrollTop = Math.max(0, (m.scrollHeight - m.clientHeight) / 2); proyPos.x = m.scrollLeft; proyPos.y = m.scrollTop; proyPos.listo = true; }
  else { m.scrollLeft = proyPos.x; m.scrollTop = proyPos.y; }
  // si el proyecto elegido quedó fuera de la vista (el mapa se achica al abrir la tarjeta), se centra en él
  const q = proySel && proyCache.pos && proyCache.pos[proySel], vb = proyCache.vb;
  if (q && vb) {
    const cx = q.x - vb.x, cy = q.y - vb.y, w = m.clientWidth, h = m.clientHeight;
    const fuera = cx - q.w / 2 < m.scrollLeft + 8 || cx + q.w / 2 > m.scrollLeft + w - 8 || cy - 20 < m.scrollTop + 8 || cy + 20 > m.scrollTop + h - 8;
    if (fuera) { m.scrollLeft = Math.max(0, cx - w / 2); m.scrollTop = Math.max(0, cy - h / 2); proyPos.x = m.scrollLeft; proyPos.y = m.scrollTop; }
  }
  m.addEventListener('scroll', () => { proyPos.x = m.scrollLeft; proyPos.y = m.scrollTop; }, { passive: true });
}

// ---------- Inicio v2: barra de avance del día y un siguiente paso (checkpoint 5.1) ----------
// En 5.1 "Listo" y "Ahora no" se guardan solo hoy y solo en este aparato (est se reinicia cada día). Guardarlos en tu cuenta viene en 5.2.
function proyCola(m) {
  const d = new Date(), dow = d.getDay();
  const trab = dow >= 1 && dow <= 5 && m >= 9 * 60 && m < 18 * 60 && modoActual() === 'trabajo';
  const hechos = est.proyHechos || {}, no = est.proyNoAhora || [];
  const base = proyLista().filter(p => p.estado === 'activo' && String(p.siguiente_paso || '').trim() && !hechos[p.id] && !!p.trabajo === trab)
    .sort((a, b) => (Number(b.importancia) || 0) - (Number(a.importancia) || 0) || (proyDias(b) ?? 0) - (proyDias(a) ?? 0) || String(a.nombre).localeCompare(String(b.nombre)));
  const cola = base.filter(p => !no.includes(p.id)).concat(no.map(id => base.find(p => p.id === id)).filter(Boolean));
  return { trab, cola, hechos: Object.keys(hechos).length };
}

// Barra del día: un segmento por actividad (la rutina y los pasos de proyecto), un solo color neutro; atrasarse no cambia el color
function proyBarra(real, m) {
  const rutina = real.filter(i => i.tipo !== 'cal' && i.fin > i.ini), c = proyCola(m);
  const hr = rutina.filter(i => est.hechos[i.id]).length, N = rutina.length + c.hechos + (c.cola.length ? 1 : 0), D = hr + c.hechos;
  if (!N) return '';
  const seg = N <= 24 ? `<div class="pbarra" role="img" aria-label="${D} de ${N} actividades del día">${Array.from({ length: N }, (_, k) => `<i class="${k < D ? 'on' : ''}"></i>`).join('')}</div>` : `<div class="bar"><i style="width:${Math.round(D / N * 100)}%"></i></div>`;
  return `<div class="pbl">${seg}<div class="dc-r"><span><b>${D} de ${N}</b> actividades de hoy</span><span>${Math.round(D / N * 100)}%</span></div></div>`;
}

function proyPaso(m) {
  const c = proyCola(m), p = c.cola[0];
  if (!p) {
    if (c.trab) return `<div class="card" style="margin:0 0 8px"><b>💼 Horario de trabajo</b><div class="nota" style="margin-top:6px">No tienes pasos de trabajo anotados. Cuando puedas escribirlos en la tarjeta de cada proyecto, aquí saldrá primero lo de MegaGen.</div></div>`;
    return `<div class="card" style="margin:0 0 8px"><b>🎯 Pasos de proyectos</b><div class="nota" style="margin-top:6px">${c.hechos ? 'Hiciste los pasos de hoy. Lo demás es tiempo tuyo.' : 'Ningún proyecto activo tiene un siguiente paso anotado.'}</div></div>`;
  }
  const d = proyDias(p), sig = c.cola[1];
  const porque = p.porque ? esc(p.porque) : c.trab ? 'Es horario de trabajo: primero lo de MegaGen.' : d !== null && d >= 3 ? `Lleva ${d} días sin tocarse.` : 'Es el que sigue en tu cola de hoy.';
  const final = sig ? `Después sigue: ${esc(sig.siguiente_paso)} (${esc(sig.nombre)}).` : 'No hay más pasos anotados hoy. Lo demás es tiempo tuyo.';
  return `<section class="hero paso"><div class="cab"><div class="ico k-tar" aria-hidden="true">${c.trab ? '💼' : '🎯'}</div><div><div class="etq">SIGUIENTE PASO · ${c.trab ? 'TRABAJO' : 'PROYECTOS'}</div><h2>${esc(p.siguiente_paso)}</h2></div></div>
  <div class="hora">${esc(p.nombre)} · ${esc(p.area)}</div>
  <div class="pk2">Por qué ahora</div><div class="pv">${porque}</div>
  <div class="pk2">Al terminar</div><div class="pv">${final}</div>
  <div class="acc"><button class="pri" data-a="pasoListo" data-v="${esc(p.id)}">✓ Listo</button>${sig ? `<button data-a="pasoLuego" data-v="${esc(p.id)}">Ahora no</button>` : ''}</div>
  <div class="nota" style="margin-top:8px;font-size:12.5px">“Listo” suma a tu barra. “Ahora no” lo manda al final de la cola de hoy y te muestra el siguiente, sin culpa. En esta prueba se guarda solo hoy, en este aparato.</div></section>`;
}

// Teclado (computadora): Enter o espacio sobre una pastilla enfocada la abre
document.addEventListener('keydown', e => {
  const g = e.target && e.target.closest && e.target.closest('g.pn');
  if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); accion(g.dataset.a, g.dataset.v, g, e); }
});

// Lo que escribes en el formulario se guarda en el borrador al instante (sin repintar, para no perder el cursor)
document.addEventListener('input', e => { const f = e.target && e.target.dataset && e.target.dataset.pf; if (f && proyBorrador && e.target.type !== 'checkbox') proyBorrador[f] = e.target.value; });
document.addEventListener('change', e => { const t = e.target, f = t && t.dataset && t.dataset.pf; if (f && proyBorrador) proyBorrador[f] = t.type === 'checkbox' ? t.checked : t.value; });
// Si hay cambios sin guardar, tocar otra cosa no los pierde en silencio
const proyBloquea = () => { if (proySucio()) { toast('Guarda o cancela tus cambios primero'); return true; } proyBorrador = null; return false; };

function proyAccion(a, v) {
  switch (a) {
    case 'proyEditar': { const p = proyPorId(proySel); if (!p) return true; proyBorrador = { id: p.id, siguiente_paso: p.siguiente_paso || '', porque: p.porque || '', estado: PROY_ESTADOS.includes(p.estado) ? p.estado : 'activo', trabajo: !!p.trabajo, potencia: proyNum(p.potencia), importancia: proyNum(p.importancia) }; return true; }
    case 'proyCancelar': proyBorrador = null; return true;
    case 'proyCal': { const [c, n] = String(v).split(':'); if (proyBorrador && (c === 'potencia' || c === 'importancia')) proyBorrador[c] = proyNum(n); return true; }
    case 'proyGuardar': {
      const b = proyBorrador, o = b && proyPorId(b.id); if (!o) { proyBorrador = null; return true; }
      if (!proySucio()) { proyBorrador = null; toast('Sin cambios'); return true; }
      const aviso = () => toast('Guardado aquí. Se manda solo cuando haya conexión');
      proyGuardaDoc({ ...o, siguiente_paso: String(b.siguiente_paso || '').trim().slice(0, 300), porque: String(b.porque || '').trim().slice(0, 400), estado: PROY_ESTADOS.includes(b.estado) ? b.estado : o.estado, trabajo: !!b.trabajo, potencia: proyNum(b.potencia), importancia: proyNum(b.importancia), ultima_vez: hoyKey() }).then(() => { if (proyPendiente(o.id)) aviso(); });
      proyBorrador = null;
      if (proyConectado()) toast('Guardado ✓'); else aviso();
      return true;
    }
    case 'pasoListo': est.proyHechos = est.proyHechos || {}; est.proyHechos[v] = Date.now(); celebrar('¡Listo! Ese paso ya cuenta.', false); return true;
    case 'pasoLuego': est.proyNoAhora = (est.proyNoAhora || []).filter(x => x !== v).concat(v); toast('Sin culpa: lo mandé al final de la cola de hoy'); return true;
    case 'proySel': if (proyBloquea()) return true; proySel = proySel === v ? null : v; return true;
    case 'proyCerrar': if (proyBloquea()) return true; proySel = null; return true;
    case 'proyArea': if (proyBloquea()) return true; proyArea = PROY_AREAS.concat('todas').includes(v) ? v : 'todas'; proySel = null; return true;
    case 'proyIdeas': if (proyBloquea()) return true; proyIdeas = !proyIdeas; proySel = null; return true;
  }
  return false;
}
