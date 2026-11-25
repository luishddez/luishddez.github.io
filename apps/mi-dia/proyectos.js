/* Mi día · capa Proyectos (checkpoint 5.1, solo lectura).
   Se carga ANTES de app.js: aquí solo se declaran funciones, que app.js llama después. Usa las variables de app.js (datos, esc, dur...) cuando ya existen.
   Los datos vienen de Supabase (proyectos/<id>) y se guardan en 'tablero-datos'. En 5.1 no se escribe nada en tu cuenta. */
let proySel = null;                 // id del proyecto abierto (en variable, no en el DOM, para sobrevivir a cada pintado)
let proyArea = 'todas';             // 'todas' | 'Yo' | 'Profesional' | 'Conocimiento'
let proyIdeas = false;              // las ideas semilla están ocultas al arrancar
const proyPos = { x: 0, y: 0, listo: false };   // dónde quedó el mapa al arrastrarlo con el dedo
const PROY_AREAS = ['Yo', 'Profesional', 'Conocimiento'];
const proyCache = { clave: '', pos: null };

const proyLista = () => Array.isArray(datos.proyectos) ? datos.proyectos.filter(p => p && p.id && p.nombre) : [];
const proyPorId = id => proyLista().find(p => p.id === id);
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
  let h = `<div class="pbar">${chips}${ideasBtn}</div><div class="nota" style="margin:2px 2px 6px">${vis.length} a la vista${cerrados ? ` · ${cerrados} hechos o archivados guardados` : ''}. Toca uno para ver sus conexiones.</div>`;

  if (!vis.length) return h + `<div class="card"><b>Nada para mostrar con este filtro.</b></div>`;
  const lineas = aristas.map(([a, b]) => `<line class="pe${sel ? (a === sel || b === sel ? ' on' : ' dim') : ''}" x1="${P[a].x.toFixed(1)}" y1="${P[a].y.toFixed(1)}" x2="${P[b].x.toFixed(1)}" y2="${P[b].y.toFixed(1)}"/>`).join('');
  const nodos = vis.map(p => {
    const q = P[p.id], w = q.w, cl = ['pn', p.estado === 'idea semilla' ? 'idea' : '', sel === p.id ? 'sel' : '', sel && !vecinos.has(p.id) ? 'dim' : ''].filter(Boolean).join(' ');
    return `<g class="${cl}" data-a="proySel" data-v="${esc(p.id)}" role="button" tabindex="0" aria-label="${esc(p.nombre)}. ${esc(p.area)}, ${esc(p.estado)}"><rect x="${(q.x - w / 2).toFixed(1)}" y="${(q.y - 20).toFixed(1)}" width="${w}" height="40" rx="14"/><text x="${q.x.toFixed(1)}" y="${(q.y - 3).toFixed(1)}" text-anchor="middle" class="nm">${esc(proyCorto(p))}</text><text x="${q.x.toFixed(1)}" y="${(q.y + 12).toFixed(1)}" text-anchor="middle" class="sub">${esc(p.area)} · ${esc(p.estado)}</text></g>`;
  }).join('');
  h += `<div class="pmapa${sel ? ' cc' : ''}" id="pmapa"><svg width="${VB.w}" height="${VB.h}" viewBox="${VB.x.toFixed(0)} ${VB.y.toFixed(0)} ${VB.w} ${VB.h}" role="group" aria-label="Mapa de proyectos y sus conexiones">${lineas}${nodos}</svg></div>`;
  if (sel) h += proyTarjeta(proyPorId(sel));
  return h;
}

function proyTarjeta(p) {
  const d = proyDias(p), cons = (p.conexiones || []).map(proyPorId).filter(Boolean);
  const cal = v => (v === null || v === undefined || v === '') ? 'sin calificar' : `${esc(v)} de 5`;
  return `<section class="pcard" aria-live="polite"><div class="ptop"><div><b class="pt">${esc(p.nombre)}</b><div class="nota">${esc(p.area)} · ${esc(p.estado)} · ${esc(p.tipo)}${p.trabajo ? ' · trabajo' : ''}</div></div><button class="pcls2" data-a="proyCerrar" aria-label="Cerrar">✕</button></div>
  <div class="pk">Siguiente paso</div><div>${p.siguiente_paso ? esc(p.siguiente_paso) : '<span class="nota">Todavía no lo escribes.</span>'}</div>
  <div class="pk">Por qué me importa</div><div>${p.porque ? esc(p.porque) : '<span class="nota">Todavía no lo escribes.</span>'}</div>
  <div class="pg"><div><div class="pk">Última vez que lo toqué</div><div>${proyHace(d)} <span class="nota">· según tus notas</span></div></div>
  <div><div class="pk">Potencia · importancia</div><div>${cal(p.potencia)} · ${cal(p.importancia)}</div></div></div>
  <div class="pk">Se conecta con</div><div>${cons.length ? cons.map(c => `<button class="pfil" data-a="proySel" data-v="${esc(c.id)}">${esc(c.nombre)}</button>`).join(' ') : '<span class="nota">Con nada todavía.</span>'}</div>
  <div class="nota" style="margin-top:10px">Por ahora solo se mira. Editar, pausar y archivar llegan en el siguiente paso.</div></section>`;
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

function proyAccion(a, v) {
  switch (a) {
    case 'proySel': proySel = proySel === v ? null : v; return true;
    case 'proyCerrar': proySel = null; return true;
    case 'proyArea': proyArea = PROY_AREAS.concat('todas').includes(v) ? v : 'todas'; proySel = null; return true;
    case 'proyIdeas': proyIdeas = !proyIdeas; proySel = null; return true;
  }
  return false;
}
