/* Hungry · alimentación del ecosistema (Mi día es el centro, Temple es el ejercicio).
   Pantallas: Hoy · Alacena · Compras · Registro · Dieta. Todo se guarda en tu cuenta (HDB) y funciona sin internet. */
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const A = window.HG_ALIM, AM = Object.fromEntries(A.map(a => [a.id, a]));
  const r1 = n => Math.round((Number(n) || 0) * 10) / 10, r0 = n => Math.round(Number(n) || 0);
  const pad = n => String(n).padStart(2, '0');
  const fechaK = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const hoyK = () => fechaK(new Date());
  const toMin = h => { const m = String(h || '').match(/(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : 0; };
  const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'x';
  const nut = (id, g) => { const a = AM[id]; if (!a) return { k: 0, pr: 0, c: 0, gr: 0 }; const f = g / 100; return { k: a.k * f, pr: a.pr * f, c: a.c * f, gr: a.gr * f }; };
  const HG = window.HG = { $, esc, A, AM, r0, r1, nut, hoyK, fechaK, toMin, slug, acc: {}, vistas: {}, tab: 'hoy', sub: {} };

  // ---------- acceso a datos ----------
  const plan = () => HDB.hijos('comida/regimen').filter(p => p && p.id).sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const alacena = () => HDB.hijos('comida/alacena').filter(x => x && x.id);
  const faltantes = () => HDB.hijos('comida/faltantes').filter(x => x && x.id);
  const registro = () => HDB.hijos('comida/registro').filter(x => x && x.id);
  const gustos = () => Object.fromEntries(HDB.hijos('comida/gustos').filter(x => x && x.id).map(x => [x.id, x.voto]));
  const categorias = () => HDB.hijos('comida/categorias').filter(x => x && x.id).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  const perfil = () => HDB.get('comida/perfil/datos') || {};
  const dia = () => { const d = HDB.get('comida/estado/dia'); return d && d.fecha === hoyK() ? d : { id: 'dia', fecha: hoyK(), gym: false }; };
  const alergias = () => perfil().alergias || [];
  // 'lactosa' = tolera la leche deslactosada pero no los lácteos normales; 'lacteos' = ningún lácteo
  const bloqueado = a => a && (gustos()[a.id] === 'no' || (a.al || []).some(x => alergias().includes(x)) || (alergias().includes('lactosa') && (a.al || []).includes('lacteos') && !(a.al || []).includes('leche')));
  Object.assign(HG, { plan, alacena, faltantes, registro, gustos, categorias, perfil, dia, alergias, bloqueado });
  const PASILLOS = ['Frutas y verduras', 'Carnes y pescados', 'Lácteos y huevo', 'Refrigerados', 'Congelados', 'Panadería y tortillas', 'Abarrotes', 'Comida preparada', 'Otros'];
  const UNIDADES = { pza: 1, g: 100, kg: 0.5, l: 0.5, ml: 100, latas: 1, paquete: 1 };
  HG.PASILLOS = PASILLOS; HG.UNIDADES = UNIDADES;

  // ---------- avisos y ventanas ----------
  let toastT = null;
  function toast(t) { let el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); } el.textContent = t; el.classList.remove('hide'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.add('hide'), 2600); }
  function abrir(html, montar) { cerrar(); const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal'; m.innerHTML = '<div>' + html + '</div>'; m.addEventListener('click', e => { if (e.target === m) cerrar(); }); document.body.appendChild(m); if (montar) montar(m); }
  function cerrar() { const m = $('#modal'); if (m) m.remove(); }
  Object.assign(HG, { toast, abrir, cerrar });

  // ---------- alacena ↔ compras ----------
  const baja = x => x.modo === 'aprox' ? (x.nivel === 'poco' || x.nivel === 'no') : (Number(x.cantidad) || 0) <= (Number(x.minimo) || 0);
  const disponible = x => x.modo === 'aprox' ? x.nivel !== 'no' : (Number(x.cantidad) || 0) > 0;
  const textoCant = x => x.modo === 'aprox' ? ({ tengo: 'Tengo', poco: 'Poco', no: 'No tengo' }[x.nivel || 'tengo']) : (r1(x.cantidad) + ' ' + (x.unidad || ''));
  const repo = x => { const m = Number(x.minimo) || 0, c = Number(x.cantidad) || 0; return r1(Math.max(m * 2 - c, m, (UNIDADES[x.unidad] || 1))); };
  Object.assign(HG, { baja, disponible, textoCant });
  function sincronizarFaltantes() {
    const ex = Object.fromEntries(faltantes().map(f => [f.id, f]));
    alacena().forEach(x => {
      const f = ex[x.id];
      if (baja(x)) {
        if (f && f.estado === 'comprado') return;
        const n = { id: x.id, alacena_id: x.id, articulo: x.nombre, emoji: x.emoji || '', estado: 'falta', pasillo: x.pasillo || 'Otros', categoria: x.categoria || '', donde: x.donde || '', ts: Date.now() };
        if (x.modo === 'exacto') { n.reponer = repo(x); n.unidad = x.unidad || ''; n.cantidad_texto = n.reponer + ' ' + n.unidad; } else n.cantidad_texto = 'comprar';
        if (!f || ['pasillo', 'categoria', 'donde', 'cantidad_texto', 'articulo'].some(k => f[k] !== n[k])) HDB.set('comida/faltantes/' + x.id, n);
      } else if (f && f.alacena_id && f.estado === 'falta') HDB.del('comida/faltantes/' + x.id);
    });
  }
  function aplicarComprados() {   // lo que Mi día marcó como comprado y aún no se aplicó
    faltantes().filter(f => f.estado === 'comprado').forEach(f => comprado(f, true));
  }
  function comprado(f, silencio) {
    const x = f.alacena_id && HDB.get('comida/alacena/' + f.alacena_id);
    if (x) { const n = { ...x, ts: Date.now() }; if (x.modo === 'exacto') n.cantidad = r1((Number(x.cantidad) || 0) + (Number(f.reponer) || repo(x))); else n.nivel = 'tengo'; HDB.set('comida/alacena/' + x.id, n); }
    HDB.del('comida/faltantes/' + f.id);
    if (!silencio) toast('✓ Comprado: ' + f.articulo);
  }
  HG.sincronizarFaltantes = sincronizarFaltantes;

  // ---------- registro ----------
  const regHoy = () => registro().filter(r => r.fecha === hoyK()).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const suma = l => l.reduce((s, r) => ({ k: s.k + (r.kcal || 0), pr: s.pr + (r.prot || 0), c: s.c + (r.carb || 0), gr: s.gr + (r.grasa || 0) }), { k: 0, pr: 0, c: 0, gr: 0 });
  function guardarRegistro(o) {
    const d = new Date(), id = hoyK() + '-' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + '-' + Math.floor(Math.random() * 90 + 10);
    const r = { id, fecha: hoyK(), hora: pad(d.getHours()) + ':' + pad(d.getMinutes()), ts: Date.now(), momento: 'extra', aprox: false, origen: 'busqueda', items: [], ...o };
    HDB.set('comida/registro/' + r.id, r); return r;
  }
  HG.guardarRegistro = guardarRegistro; HG.regHoy = regHoy; HG.suma = suma;
  const aplica = p => p.dias !== 'gym' || dia().gym;
  const planHoy = () => plan().filter(aplica);
  const metaKcal = () => { const s = planHoy().reduce((n, p) => n + (Number(p.kcal) || 0), 0); return s || perfil().meta_kcal || 0; };
  const metaProt = () => { const s = planHoy().reduce((n, p) => n + (Number(p.proteina_g) || 0), 0); return s || perfil().meta_prot || 0; };
  Object.assign(HG, { planHoy, metaKcal, metaProt });
  const tipoDe = p => ({ desayuno: 'd', comida: 'c', previa: 'p', cena: 'n' }[p.id] || 'c');
  const ahoraHM = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const horaSel = id => (HG.sub.hr && HG.sub.hr[id]) || ahoraHM();
  const horaIn = id => `<label class="mut" style="display:inline-flex;gap:6px;align-items:center">🕐 ¿A qué hora? <input type="time" data-i="hr" data-m="${id}" value="${horaSel(id)}" style="width:auto"></label>`;
  const conHora = id => { const h = horaSel(id), [a, b] = h.split(':').map(Number), d = new Date(); d.setHours(a, b, 0, 0); return { hora: h, ts: d.getTime() }; };
  const macrosOp = o => (o.i || []).reduce((q, [id, g]) => { const n = nut(id, g); return { k: q.k + n.k, pr: q.pr + n.pr, c: q.c + n.c, gr: q.gr + n.gr }; }, { k: 0, pr: 0, c: 0, gr: 0 });
  // gramos -> medida casera («220 g» => «1 ⅓ tazas»), usando la porción típica del alimento
  const FRAC = [[0, ''], [.25, '¼'], [1 / 3, '⅓'], [.5, '½'], [2 / 3, '⅔'], [.75, '¾'], [1, '']];
  function medida(id, g) {
    const a = AM[id]; if (!a || !a.pl || !a.por) return '';
    const m = a.pl.match(/^\s*(\d+\/\d+|\d+(?:\.\d+)?)\s+([^(]+?)\s*(?:\(|$)/); if (!m) return '';
    const q = m[1].includes('/') ? m[1].split('/')[0] / m[1].split('/')[1] : Number(m[1]); let unit = m[2].trim();
    if (/^(g|ml|porci)/i.test(unit)) return '';
    let n = q * g / a.por; if (n < .2) return '';
    let w = Math.floor(n + 1e-9), fr = n - w;
    if (n >= 5) { w = Math.round(n); fr = 0; }
    const best = FRAC.reduce((x, y) => Math.abs(y[0] - fr) < Math.abs(x[0] - fr) ? y : x);
    if (best[0] === 1) { w += 1; best[1] = ''; }
    const txt = (w ? w : '') + (w && best[1] ? ' ' : '') + (n >= 5 ? '' : best[1]);
    const mas = w > 1 || (w === 1 && best[1]);
    if (mas) unit = unit.split(' ').map((x, i, A) => (A.slice(0, i).includes('de') || x === 'de') ? x : (/ón$/.test(x) ? x.slice(0, -2) + 'ones' : /[aeiouáéíóú]$/.test(x) ? x + 's' : /s$/.test(x) ? x : x + 'es')).join(' ');
    return (txt || '¼') + ' ' + unit;
  }
  HG.medida = medida;
  const barraMacros = m => { const p = m.pr * 4, c = m.c * 4, g = m.gr * 9, t = p + c + g || 1; return `<div class="mbar"><i style="width:${p / t * 100}%;background:var(--ac)"></i><i style="width:${c / t * 100}%;background:#e0b25a"></i><i style="width:${g / t * 100}%;background:#6fa8dc"></i></div><div class="mleg"><span><i style="background:var(--ac)"></i>Proteína ${r0(m.pr)} g</span><span><i style="background:#e0b25a"></i>Carbs ${r0(m.c)} g</span><span><i style="background:#6fa8dc"></i>Grasa ${r0(m.gr)} g</span></div>`; };
  const opcionesHTML = p => {
    const L = p.opciones || []; if (!L.length) return `<p>${esc(p.que_lleva)}</p>`;
    const sel = HG.sub.sel && HG.sub.sel[p.id], S = suma(regHoy()), meta = metaKcal(), mp = metaProt();
    return '<div class="mut" style="margin:8px 0 2px">Toca la que comiste</div>' + L.map((o, j) => {
      const m = macrosOp(o), on = sel === j, em = (o.i || []).slice(0, 5).map(([id]) => AM[id] ? AM[id].e : '').join('');
      let h = `<div class="opc ${on ? 'sel' : ''}" data-a="elige" data-id="${esc(p.id)}" data-o="${j}"><div class="row"><span class="sp"><b>${['A', 'B', 'C', 'D'][j] || j + 1}. ${esc(o.n)}</b><div class="oem">${em} <span class="mut">· ${r0(m.pr)} g prot</span></div></span><span class="okc"><b>${r0(m.k)}</b> kcal</span></div>`;
      if (on) {
        h += barraMacros(m) + '<div class="ing">' + (o.i || []).map(([id, g]) => { const a = AM[id], md = medida(id, g); return `<div class="ig"><span class="ie">${a ? a.e : '•'}</span><span class="sp">${esc(a ? a.n.split(' (')[0] : id)}</span><span class="iq">${md ? '<b>' + esc(md) + '</b><span class="mut"> · ' + g + ' g</span>' : '<b>' + g + ' g</b>'}</span></div>`; }).join('') + '</div>';
        h += `<div class="mut" style="margin-top:8px">Con esto llevarías <b>${r0(S.k + m.k)}</b>${meta ? ' de ' + r0(meta) : ''} kcal y <b>${r0(S.pr + m.pr)}</b>${mp ? ' de ' + r0(mp) : ''} g de proteína.</div><div style="margin-top:8px">${horaIn(p.id)}</div><button class="pri" style="width:100%;margin-top:8px" data-a="comiop" data-id="${esc(p.id)}" data-o="${j}">✓ Comí esta</button>`;
      }
      return h + '</div>';
    }).join('');
  };
  HG.acc.elige = (b, e) => { if (e && e.target.closest('input,label,button[data-a=comiop]')) return; const id = b.dataset.id, o = Number(b.dataset.o); HG.sub.sel = HG.sub.sel || {}; HG.sub.sel[id] = HG.sub.sel[id] === o ? null : o; HG.render(); };
  const proxima = () => planHoy().find(p => !regHoy().some(r => r.momento === p.id));

  // sugerencia de ajuste para la siguiente comida (si te pasaste o te quedaste corto)
  // alimentos que no se sugieren como «ajuste» de una comida (botanas, dulces, embutidos, bebidas)
  const NO_SUG = new Set(['papas-fritas', 'galleta-salada', 'galleta-maria', 'barra-granola', 'palomitas', 'granola', 'cereal-hojuelas', 'tostada', 'mayonesa', 'aceite-coco', 'aceituna', 'coco-rallado', 'mantequilla', 'crema-leche', 'queso-crema', 'queso-parmesano', 'chicharron', 'manteca-cerdo', 'pan-dulce', 'tostada-maiz', 'cajeta', 'leche-condensada', 'crema-agria', 'quesadilla-queso', 'enchiladas-queso', 'taco-res', 'burrito-frijol-res', 'tamal-cerdo', 'tamal-elote', 'arroz-rojo', 'harina-trigo', 'masa-maiz', 'harina-garbanzo', 'chocolate-mesa', 'piloncillo', 'papas-francesa-cong']);
  function equivalente(k, exceso) {
    const gr = exceso ? ['Cereales', 'Grasas'] : ['Cereales', 'Grasas', 'Frutas', 'Lácteos'];
    const enAl = new Set(alacena().filter(disponible).map(x => x.alimento_id));
    let mejor = null;
    A.filter(a => gr.includes(a.g) && !bloqueado(a) && a.por >= 10 && !NO_SUG.has(a.id)).forEach(a => {
      const pk = a.k * a.por / 100; if (pk < 40) return;
      for (let n = 1; n <= 3; n++) { const err = Math.abs(n * pk - k) + (enAl.has(a.id) ? 0 : 30) + (a.g === 'Grasas' ? 20 : 0); if (!mejor || err < mejor.err) mejor = { a, n, kc: n * pk, err }; }
    });
    return mejor ? `por ejemplo ${mejor.n > 1 ? mejor.n + ' × ' : ''}${mejor.a.pl.replace(/^1 /, '')} de ${mejor.a.n.split(' (')[0].toLowerCase()} (≈ ${r0(mejor.kc)} kcal)` : '';
  }
  function ajuste() {
    const hechas = planHoy().filter(p => regHoy().some(r => r.momento === p.id));
    const extras = regHoy().filter(r => r.momento === 'extra');
    if (!hechas.length && !extras.length) return null;
    const S = suma(regHoy()), real = S.k, esperado = hechas.reduce((n, p) => n + (Number(p.kcal) || 0), 0), D = r0(real - esperado);
    const prEsp = hechas.reduce((n, p) => n + (Number(p.proteina_g) || 0), 0), dP = r0(S.pr - prEsp), sig = proxima();
    // proteína: lo único que conviene recuperar el mismo día, con algo ligero
    const faltaP = (!sig && metaProt() ? metaProt() - S.pr : -dP);
    const notaP = faltaP >= 20 ? ` Te faltan ≈${r0(faltaP)} g de proteína${sig ? ` (en «${sig.comida}» elige la opción con más proteína o suma un yogurt griego)` : ': cierra con algo ligero (yogurt griego, 2 huevos o un licuado de proteína)'}.` : '';
    if (Math.abs(D) < 80) return notaP ? { ok: false, t: '💡 Vas al ritmo en calorías.' + notaP } : { ok: true, t: '👌 Vas al ritmo de tu plan.' };
    if (!sig) return { ok: false, t: (D > 0 ? `Cerraste el día con +${D} kcal sobre tu plan. No hace falta compensar: mañana sigue tu plan normal.` : `Cerraste el día con ${D} kcal por debajo de tu plan. Mañana sigue tu plan; no lo compenses de golpe.`) + notaP };
    const tope = Math.min(Math.abs(D), Math.round((Number(sig.kcal) || 600) * 0.5)), eq = equivalente(tope, D > 0);
    return { ok: false, t: (D > 0 ? `Llevas +${D} kcal sobre tu plan. En «${sig.comida}» quita ≈ ${tope} kcal${eq ? ': ' + eq : ''}.` : `Llevas ${D} kcal bajo tu plan. En «${sig.comida}» agrega ≈ ${tope} kcal${eq ? ': ' + eq : ''}. Solo si tienes hambre.`) + notaP };
  }

  // ---------- platillos con lo que hay en la alacena ----------
  function sugerencias(tipo, kcalObj) {
    const disp = new Set(alacena().filter(disponible).map(x => x.alimento_id).filter(Boolean));
    return window.HG_PLATILLOS.filter(p => p.t.includes(tipo) && !p.i.some(([id]) => bloqueado(AM[id]))).map(p => {
      const m = p.i.reduce((s, [id, g]) => { const n = nut(id, g); return { k: s.k + n.k, pr: s.pr + n.pr, c: s.c + n.c, gr: s.gr + n.gr }; }, { k: 0, pr: 0, c: 0, gr: 0 });
      const falta = p.i.filter(([id]) => !disp.has(id)).map(([id]) => AM[id].n);
      const g = gustos(), gusta = p.i.filter(([id]) => g[id] === 'si').length;
      return { p, m, falta, gusta, d: Math.abs(m.k - (kcalObj || m.k)) };
    }).sort((a, b) => (a.falta.length - b.falta.length) || (b.gusta - a.gusta) || (a.d - b.d));
  }
  HG.sugerencias = sugerencias; HG.tipoDe = tipoDe;

  // ---------- vistas ----------
  function pill() {
    const e = HDB.estado(), n = HDB.pendientes();
    const m = { listo: ['', 'Sincronizado'], pendiente: ['w', n + ' sin enviar'], enviando: ['w', 'Enviando…'], sininternet: ['w', 'Sin internet'], error: ['b', 'Sin conexión'], sinsesion: ['b', 'Falta entrar'] }[e] || ['', ''];
    return `<span class="estado ${m[0]}">${m[1]}</span>`;
  }
  HG.pill = pill;
  HG.vistas.hoy = function () {
    const P = planHoy(), R = regHoy(), S = suma(R), meta = metaKcal(), mp = metaProt(), aj = ajuste(), sig = proxima();
    const M = HG.metas ? HG.metas(perfil()) : null, pct = meta ? Math.min(100, S.k / meta * 100) : 0, fal = faltantes().filter(f => f.estado === 'falta');
    const sobra = r0(meta - S.k), over = meta && S.k > meta * 1.05, hr = new Date().getHours(), saludo = hr < 12 ? 'Buenos días' : hr < 19 ? 'Buenas tardes' : 'Buenas noches';
    const mb = (n, v, t, cls) => `<div class="mb"><div class="row"><span class="sp">${n}</span><b>${r0(v)}</b><span class="mut">${t ? ' / ' + r0(t) : ''} g</span></div><div class="bar ${cls || ''}"><i style="width:${t ? Math.min(100, v / t * 100) : 0}%"></i></div></div>`;
    let h = `<div class="row"><div class="sp"><div class="mut">${new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, c => c.toUpperCase())}</div><h1>${saludo}</h1></div>${pill()}</div>`;
    if (!plan().length) h += `<div class="vacio"><img src="icon.svg" alt="Hungry" width="96" height="96" style="border-radius:22px;box-shadow:var(--sh)"><div style="height:10px"></div><b>Bienvenido a Hungry</b><p>Armo tu régimen desde cero: te pregunto por tu cuerpo, tu objetivo, tu salud y tus gustos, y te propongo comidas con calorías y porciones. Son unos 5 minutos.</p><button class="pri" data-a="empezar">Empezar</button>${HDB.hijos('comida/plan').length ? '<div style="margin-top:10px"><button class="sm ghost" data-a="importar">Ya tenía un plan en Mi día: importarlo</button></div>' : ''}</div>`;
    else {
      h += `<div class="hero"><div class="ring ${over ? 'over' : ''}" style="--p:${pct}"><div><b>${r0(S.k)}</b><span>de ${r0(meta)} kcal</span></div></div><div class="hs"><div class="hl">${over ? `Te pasaste <b>${-sobra} kcal</b>` : sobra > 0 ? `Te quedan <b>${sobra} kcal</b>` : '¡Meta cumplida!'}</div>${mb('Proteína', S.pr, mp)}${mb('Carbs', S.c, M && M.carb, 'sec')}${mb('Grasa', S.gr, M && M.grasa, 'sec')}</div></div>`;
      h += `<label class="sw"><input type="checkbox" data-i="gym" ${dia().gym ? 'checked' : ''}><span class="knob"></span> Hoy entreno <span class="mut">(suma tu licuado previo)</span></label>`;
      h += aguaCard(true);
      if (aj) h += aj.ok ? `<div class="aviso ok"><span class="ai">👌</span><span>${esc(aj.t)}</span></div>` : `<details class="aviso"><summary>💡 ${esc(aj.t.split('. ')[0].replace(/ kcal bajo tu plan.*/, ' kcal bajo tu plan').replace(/ kcal sobre tu plan.*/, ' kcal sobre tu plan'))} <span class="mut">· ver qué hacer</span></summary><div style="margin-top:6px">${esc(aj.t)}</div></details>`;
      if (sig) h += `<div class="next"><div class="row"><span class="tag">${sig.hora && sig.hora < ahoraHM() ? 'Pendiente' : 'Sigue'} · ${esc(sig.hora || '')}</span><span class="sp"></span><span class="mut">${esc(sig.kcal)} kcal${sig.proteina_g ? ' · ' + esc(sig.proteina_g) + ' g prot' : ''}</span></div><h2>${esc(sig.comida)}</h2>${opcionesHTML(sig)}${(sig.opciones || []).length ? '' : `<div style="margin:8px 0">${horaIn(sig.id)}</div><button class="pri" style="width:100%;margin-bottom:8px" data-a="comi" data-id="${esc(sig.id)}">✓ Ya comí esto</button>`}<div class="row" style="gap:6px;margin-top:10px">${(sig.opciones || []).length ? `<button class="sm" data-a="comi" data-id="${esc(sig.id)}">✓ Plan</button>` : ''}<button class="sm" data-a="foto" data-m="${esc(sig.id)}">📷</button><button class="sm" data-a="otro" data-m="${esc(sig.id)}">Otra cosa</button><span class="sp"></span><button class="sm ghost" data-a="omiti" data-id="${esc(sig.id)}">✗ No la comí</button></div>${sig.nota ? `<div class="nota" style="margin-top:10px;font-size:12px">ℹ️ ${esc(sig.nota)}</div>` : ''}</div>`;
      else h += `<div class="aviso ok"><span class="ai">🎉</span><span>Completaste todas las comidas de hoy.</span></div>`;
      const resto = P.filter(p => !sig || p.id !== sig.id);
      if (resto.length) {
        h += `<h2>El resto de tu día</h2><div class="card lista">`;
        resto.forEach(p => {
          const reg = R.filter(r => r.momento === p.id), hecho = reg.length, kr = suma(reg).k, omit = hecho && reg.every(r => r.omitida);
          h += `<details class="dl ${hecho ? 'hecho' : ''} ${omit ? 'omit' : ''}"><summary><span class="dot">${omit ? '✗' : hecho ? '✓' : ''}</span><span class="sp"><b>${esc(p.comida)}</b><span class="mut"> · ${esc(p.hora || '')}${p.dias === 'gym' ? ' · gym' : ''}</span></span><span class="mut">${omit ? 'no se cumplió' : hecho ? r0(kr) + ' kcal' + (reg.some(r => r.aprox) ? ' ~' : '') : esc(p.kcal) + ' kcal'}</span></summary><div class="dd">${opcionesHTML(p)}<div class="row" style="margin-top:8px">${hecho ? `<button class="sm ghost" data-a="deshacer" data-id="${esc(p.id)}">Deshacer</button>` : `<div style="width:100%;margin-bottom:6px">${horaIn(p.id)}</div><button class="pri sm" data-a="comi" data-id="${esc(p.id)}">✓ Ya comí esto</button><button class="sm" data-a="foto" data-m="${esc(p.id)}">📷</button><button class="sm" data-a="otro" data-m="${esc(p.id)}">Otra cosa</button><button class="sm ghost" data-a="omiti" data-id="${esc(p.id)}">✗ No se cumplió</button>`}</div></div></details>`;
        });
        h += '</div>';
      }
    }
    h += `<div class="row" style="margin-top:18px"><h2 class="sp" style="margin:0">🛒 Por comprar</h2>${fal.length ? `<span class="chip w">${fal.length}</span>` : ''}</div>`;
    h += fal.length ? `<div class="card">${fal.slice(0, 5).map(f => `<div class="it" style="padding:7px 0"><span class="em" style="font-size:20px;width:26px">${esc(f.emoji || '•')}</span><span class="sp">${esc(f.articulo)}</span><span class="mut">${esc(f.cantidad_texto || '')}</span></div>`).join('')}${fal.length > 5 ? `<div class="mut" style="padding-top:6px">y ${fal.length - 5} más…</div>` : ''}<button class="sm" style="margin-top:8px" data-a="tab" data-t="compras">Abrir lista completa</button></div>` : `<div class="card mut">Nada urgente: tu alacena está al día ✨</div>`;
    if (sig) {
      const sg = sugerencias(tipoDe(sig), Number(sig.kcal)).slice(0, 3);
      h += `<details class="ideas"><summary><b>👩‍🍳 Ideas para «${esc(sig.comida)}»</b> <span class="mut">· con lo que hay en tu alacena</span></summary>`;
      sg.forEach(s => { h += `<div class="card sug"><div class="row"><b class="sp">${esc(s.p.n)}</b></div><div class="macros" style="margin:4px 0"><span><b>${r0(s.m.k)}</b> kcal</span><span>P <b>${r0(s.m.pr)}</b></span><span>C <b>${r0(s.m.c)}</b></span><span>G <b>${r0(s.m.gr)}</b></span></div><div class="nota">${s.p.i.map(([id, g]) => esc(AM[id].n.split(' (')[0]) + ' ' + g + ' g').join(' · ')}</div><div style="margin-top:6px">${s.falta.length ? `<span class="chip w">Te falta: ${esc(s.falta.join(', '))}</span>` : `<span class="chip">✓ Tienes todo</span>`}</div><div class="row" style="margin-top:8px"><button class="sm pri" data-a="cocine" data-p="${esc(s.p.id)}" data-m="${esc(sig.id)}">Lo comí</button>${s.falta.length ? `<button class="sm" data-a="faltaplato" data-p="${esc(s.p.id)}">Pasar lo que falta a compras</button>` : ''}</div></div>`; });
      h += '</details>';
    }
    return h;
  };
  HG.acc.empezar = () => { HG.tab = 'dieta'; HG.sub.dsec = 'entrevista'; HG.render(); window.scrollTo(0, 0); };
  HG.acc.alregimen = () => {
    const ya = new Set(alacena().map(x => x.id)); let n = 0;
    plan().forEach(p => (p.opciones || []).forEach(o => (o.i || []).forEach(([id]) => { const a = AM[id]; if (!a || ya.has(id)) return; ya.add(id); n++; HDB.set('comida/alacena/' + id, { id, alimento_id: id, nombre: a.n.replace(/ \(.*\)/, ''), emoji: a.e, modo: 'aprox', nivel: 'no', cantidad: 0, unidad: a.u, minimo: 0, categoria: '', pasillo: a.p, donde: '', ts: Date.now() }); })));
    sincronizarFaltantes(); toast(n ? n + ' ingredientes creados: marca los que ya tienes' : 'Ya estaban todos'); HG.tab = 'alacena'; HG.render();
  };
  HG.acc.tab = b => { HG.tab = b.dataset.t; HG.render(); };
  HG.acc.comi = b => {
    const p = plan().find(x => x.id === b.dataset.id); if (!p) return;
    guardarRegistro({ ...conHora(p.id), id: hoyK() + '-plan-' + p.id, momento: p.id, nombre: p.comida, kcal: Number(p.kcal) || 0, prot: Number(p.proteina_g) || 0, aprox: true, origen: 'plan', items: [{ nombre: p.que_lleva }] });
    const hh = conHora(p.id).hora; if (HG.sub.hr) delete HG.sub.hr[p.id]; toast('Anotado: ' + p.comida + ' · ' + hh); HG.render();
  };
  // «No se cumplió»: queda registrada la ausencia (0 kcal) para ver cuántas comidas del plan se saltan
  HG.acc.comiop = b => {
    const p = plan().find(x => x.id === b.dataset.id), o = p && (p.opciones || [])[Number(b.dataset.o)]; if (!o) return;
    const m = macrosOp(o), hh = conHora(p.id);
    guardarRegistro({ ...hh, id: hoyK() + '-plan-' + p.id, momento: p.id, nombre: p.comida + ': ' + o.n, kcal: r0(m.k), prot: r0(m.pr), carb: r0(m.c), grasa: r0(m.gr), aprox: false, origen: 'plan', items: (o.i || []).map(([id, g]) => ({ nombre: AM[id] ? AM[id].n : id, gramos: g })) });
    if (HG.sub.sel) delete HG.sub.sel[p.id]; if (HG.sub.hr) delete HG.sub.hr[p.id]; toast('Anotado: ' + o.n + ' · ' + hh.hora); HG.render();
  };
  HG.acc.omiti = b => {
    const p = plan().find(x => x.id === b.dataset.id); if (!p) return;
    guardarRegistro({ ...conHora(p.id), id: hoyK() + '-plan-' + p.id, momento: p.id, nombre: p.comida, kcal: 0, prot: 0, carb: 0, grasa: 0, aprox: false, omitida: true, origen: 'omitida', items: [] });
    toast('Anotado: no se cumplió ' + p.comida); HG.render();
  };
  HG.acc.deshacer = b => { regHoy().filter(r => r.momento === b.dataset.id).forEach(r => HDB.del('comida/registro/' + r.id)); HG.render(); };
  HG.acc.cocine = b => {
    const s = window.HG_PLATILLOS.find(p => p.id === b.dataset.p), mom = plan().find(p => p.id === b.dataset.m); if (!s) return;
    const m = s.i.reduce((q, [id, g]) => { const n = nut(id, g); return { k: q.k + n.k, pr: q.pr + n.pr, c: q.c + n.c, gr: q.gr + n.gr }; }, { k: 0, pr: 0, c: 0, gr: 0 });
    guardarRegistro({ momento: mom ? mom.id : 'extra', nombre: s.n, kcal: r0(m.k), prot: r0(m.pr), carb: r0(m.c), grasa: r0(m.gr), origen: 'platillo', items: s.i.map(([id, g]) => ({ nombre: AM[id].n, gramos: g })) });
    toast('Anotado: ' + s.n); HG.render();
  };
  HG.acc.faltaplato = b => {
    const s = window.HG_PLATILLOS.find(p => p.id === b.dataset.p), disp = new Set(alacena().filter(disponible).map(x => x.alimento_id));
    s.i.filter(([id]) => !disp.has(id)).forEach(([id]) => { const a = AM[id]; HDB.set('comida/faltantes/m-' + id, { id: 'm-' + id, articulo: a.n, emoji: a.e, estado: 'falta', pasillo: a.p, categoria: '', donde: '', cantidad_texto: 'comprar', ts: Date.now() }); });
    toast('Agregado a compras'); HG.render();
  };

  // ---------- Alacena ----------
  HG.vistas.alacena = function () {
    const q = (HG.sub.alq || '').toLowerCase(), f = HG.sub.alf || 'todo', todos = alacena(), nb = todos.filter(baja).length, L = todos.filter(x => (!q || x.nombre.toLowerCase().includes(q)) && (f === 'todo' || baja(x))), cats = categorias();
    let h = `<div class="row"><div class="sp"><h1>Alacena</h1><div class="mut">${todos.length} artículos · <b style="color:${nb ? 'var(--warn)' : 'var(--ok)'}">${nb} por reponer</b></div></div>${pill()}</div><div class="row" style="margin:10px 0"><input class="sp" style="min-width:120px" placeholder="🔎 Buscar…" data-i="alq" value="${esc(HG.sub.alq || '')}"><button class="pri" data-a="alta">＋ Agregar</button></div><div class="seg"><button data-a="alfil" data-v="todo" class="${f === 'todo' ? 'on' : ''}">Todo</button><button data-a="alfil" data-v="bajo" class="${f === 'bajo' ? 'on' : ''}">Por reponer</button><button data-a="cats">Categorías</button></div>`;
    if (!alacena().length) h += `<div class="vacio"><div class="big">🥫</div><b>Tu alacena está vacía</b><p>Agrega lo que tienes en casa. Si ya armaste tu régimen, puedo crearla desde ahí y tú solo marcas lo que sí tienes.</p><div class="row" style="justify-content:center"><button class="pri" data-a="alta">＋ Agregar</button>${plan().length ? '<button data-a="alregimen">Crear desde mi régimen</button>' : ''}</div></div>`;
    const grupos = {}; L.forEach(x => { const c = (x.categoria && (cats.find(k => k.id === x.categoria) || {}).nombre) || 'Sin categoría'; (grupos[c] = grupos[c] || []).push(x); });
    Object.keys(grupos).sort().forEach(c => {
      h += `<h3>${esc(c)}</h3><div class="card">`;
      grupos[c].sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach(x => {
        const b = baja(x);
        h += `<div class="it"><div class="em">${esc(x.emoji || '🍽️')}</div><div class="sp" data-a="editar" data-id="${esc(x.id)}"><div><b>${esc(x.nombre)}</b></div><div class="nota">${esc(x.donde ? x.donde + ' · ' : '')}${esc(x.pasillo || '')}</div></div>`;
        if (x.modo === 'aprox') h += `<button class="sm" data-a="nivel" data-id="${esc(x.id)}"><span class="estado ${x.nivel === 'no' ? 'b' : x.nivel === 'poco' ? 'w' : ''}">${textoCant(x)}</span></button>`;
        else h += `<div class="q"><button data-a="mas" data-d="-1" data-id="${esc(x.id)}">−</button><span class="${b ? 'chip w' : ''}">${textoCant(x)}</span><button data-a="mas" data-d="1" data-id="${esc(x.id)}">+</button></div>`;
        h += '</div>';
      });
      h += '</div>';
    });
    return h;
  };
  function guardarAlacena(x) { x.ts = Date.now(); HDB.set('comida/alacena/' + x.id, x); sincronizarFaltantes(); HG.render(); }
  HG.acc.alfil = b => { HG.sub.alf = b.dataset.v; HG.render(); };
  HG.acc.nivel = b => { const x = HDB.get('comida/alacena/' + b.dataset.id); guardarAlacena({ ...x, nivel: { tengo: 'poco', poco: 'no', no: 'tengo' }[x.nivel || 'tengo'] }); };
  HG.acc.mas = b => { const x = HDB.get('comida/alacena/' + b.dataset.id), st = UNIDADES[x.unidad] || 1; guardarAlacena({ ...x, cantidad: Math.max(0, r1((Number(x.cantidad) || 0) + st * Number(b.dataset.d))) }); };
  HG.acc.importar = () => {
    if (!confirm('Voy a copiar a Hungry el plan y la lista que tenías en Mi día. ¿Continuar?')) return;
    HDB.hijos('comida/plan').filter(p => p && p.id).forEach(p => HDB.set('comida/regimen/' + p.id, { ...p, origen: 'Importado de Mi día' }));
    const mapa = { 'leche-lala-100': ['leche-entera', 'l'], 'proteina-simi': [null, 'paquete'], 'avena-hojuelas': ['avena', 'paquete'], 'avena-polvo': ['avena', 'paquete'], platano: ['platano', 'pza'], 'crema-cacahuate': ['crema-cacahuate', 'pza'], espinacas: ['espinaca', 'paquete'], huevo: ['huevo', 'pza'], tortillas: ['tortilla-maiz', 'kg'], frijoles: ['frijol-pinto', 'kg'], pollo: ['pollo-pechuga', 'g'], 'carne-magra': ['res-bistec', 'g'], 'atun-agua': ['atun-agua', 'latas'], arroz: ['arroz-crudo', 'paquete'], papa: ['papa', 'pza'], pasta: ['pasta-cocida', 'paquete'], verduras: [null, 'paquete'], 'aguacate-aceite': ['aguacate', 'pza'] };
    HDB.hijos('comida/compras').filter(c => c && c.id).forEach(c => {
      const [aid, u] = mapa[c.id] || [null, 'pza'], a = aid && AM[aid];
      HDB.set('comida/alacena/' + c.id, { id: c.id, alimento_id: aid, nombre: c.articulo, emoji: a ? a.e : '🛒', modo: 'aprox', nivel: 'tengo', cantidad: 0, unidad: u, minimo: 0, categoria: '', pasillo: a ? a.p : 'Otros', donde: '', ts: Date.now() });
    });
    toast('Importado. Ya vive en Hungry'); HG.render();
  };
  function formAlacena(x) {
    const cats = categorias();
    return `<h2>${x.nuevo ? 'Agregar a la alacena' : esc(x.nombre)}</h2>
    ${x.nuevo ? `<label>Nombre</label><input id="f-n" value="${esc(x.nombre || '')}" placeholder="Ej. Arroz">` : ''}
    <label>Cómo la llevas</label><div class="seg"><button data-a="fmodo" data-v="exacto" class="${x.modo === 'exacto' ? 'on' : ''}">Cantidad exacta</button><button data-a="fmodo" data-v="aprox" class="${x.modo === 'aprox' ? 'on' : ''}">Aproximada</button></div>
    <div id="f-ex" class="${x.modo === 'exacto' ? '' : 'hide'}"><div class="row"><div class="sp"><label>Cantidad</label><input id="f-c" type="number" step="any" inputmode="decimal" value="${esc(x.cantidad ?? 0)}"></div><div class="sp"><label>Unidad</label><select id="f-u">${Object.keys(UNIDADES).map(u => `<option ${x.unidad === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div><div class="sp"><label>Avísame si baja a</label><input id="f-m" type="number" step="any" inputmode="decimal" value="${esc(x.minimo ?? 0)}"></div></div></div>
    <div id="f-ap" class="${x.modo === 'aprox' ? '' : 'hide'}"><label>Nivel</label><select id="f-l"><option value="tengo" ${x.nivel === 'tengo' ? 'selected' : ''}>Tengo</option><option value="poco" ${x.nivel === 'poco' ? 'selected' : ''}>Poco</option><option value="no" ${x.nivel === 'no' ? 'selected' : ''}>No tengo</option></select></div>
    <label>Categoría (tuya)</label><select id="f-k"><option value="">Sin categoría</option>${cats.map(c => `<option value="${esc(c.id)}" ${x.categoria === c.id ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('')}</select>
    <label>Pasillo del súper</label><select id="f-p">${PASILLOS.map(p => `<option ${x.pasillo === p ? 'selected' : ''}>${p}</option>`).join('')}</select>
    <label>¿Dónde lo consigo? (opcional)</label><input id="f-d" value="${esc(x.donde || '')}" placeholder="Walmart, mercado, tienda de la esquina…">
    <div class="row" style="margin-top:14px"><button class="pri sp" data-a="fguardar">Guardar</button>${x.nuevo ? '' : '<button class="bad" data-a="feliminar">Eliminar</button>'}<button data-a="cerrar">Cancelar</button></div>`;
  }
  let formX = null;
  HG.acc.cerrar = () => cerrar();
  HG.acc.editar = b => { formX = { ...HDB.get('comida/alacena/' + b.dataset.id) }; abrir(formAlacena(formX)); };
  HG.acc.fmodo = b => { formX.modo = b.dataset.v; document.querySelectorAll('#modal [data-a=fmodo]').forEach(e => e.classList.toggle('on', e === b)); $('#f-ex').classList.toggle('hide', formX.modo !== 'exacto'); $('#f-ap').classList.toggle('hide', formX.modo !== 'aprox'); };
  HG.acc.fguardar = () => {
    const x = formX; if (x.nuevo) { x.nombre = ($('#f-n').value || '').trim(); if (!x.nombre) { toast('Escribe el nombre'); return; } if (!x.id) x.id = slug(x.nombre); }
    x.cantidad = Number($('#f-c').value) || 0; x.unidad = $('#f-u').value; x.minimo = Number($('#f-m').value) || 0; x.nivel = $('#f-l').value; x.categoria = $('#f-k').value; x.pasillo = $('#f-p').value; x.donde = $('#f-d').value.trim();
    delete x.nuevo; cerrar(); guardarAlacena(x); toast('Guardado');
  };
  HG.acc.feliminar = () => { HDB.del('comida/alacena/' + formX.id); HDB.del('comida/faltantes/' + formX.id); cerrar(); HG.render(); };
  HG.acc.alta = () => {
    abrir(`<h2>Agregar a la alacena</h2><input id="bq" placeholder="Busca un alimento…" data-i="bq"><div id="bres" style="margin-top:8px"></div><div class="row" style="margin-top:10px"><button data-a="altalibre">Escribirlo yo (no está en la lista)</button><button data-a="cerrar">Cancelar</button></div>`, () => listaAlta(''));
  };
  function listaAlta(q) { q = q.toLowerCase(); const l = A.filter(a => !q || a.n.toLowerCase().includes(q)).sort((a, b) => a.g.localeCompare(b.g) || a.n.localeCompare(b.n)).slice(0, 70); $('#bres').innerHTML = l.map(a => `<div class="it" data-a="altaelige" data-id="${a.id}"><div class="em">${a.e}</div><div class="sp"><b>${esc(a.n)}</b></div><span class="mut">${a.k} kcal/100 g</span></div>`).join('') || '<div class="mut">Sin resultados</div>'; }
  HG.listaAlta = listaAlta;
  HG.acc.altaelige = b => { const a = AM[b.dataset.id]; formX = { nuevo: true, id: a.id, alimento_id: a.id, nombre: a.n.replace(/ \(.*\)/, ''), emoji: a.e, modo: 'exacto', cantidad: 0, unidad: a.u, minimo: 0, nivel: 'tengo', categoria: '', pasillo: a.p, donde: '' }; abrir(formAlacena(formX)); };
  HG.acc.altalibre = () => { formX = { nuevo: true, id: '', alimento_id: null, nombre: '', emoji: '🛒', modo: 'aprox', cantidad: 0, unidad: 'pza', minimo: 0, nivel: 'tengo', categoria: '', pasillo: 'Otros', donde: '' }; abrir(formAlacena(formX)); };
  HG.acc.cats = () => {
    const l = categorias();
    abrir(`<h2>Mis categorías</h2><div class="nota">Úsalas para agrupar tu alacena y tu lista de compras como tú quieras.</div>${l.map(c => `<div class="it"><div class="sp"><b>${esc(c.nombre)}</b></div><button class="sm" data-a="catren" data-id="${esc(c.id)}">Renombrar</button><button class="sm bad" data-a="catdel" data-id="${esc(c.id)}">Borrar</button></div>`).join('')}<div class="row" style="margin-top:10px"><input class="sp" id="cn" placeholder="Nueva categoría (ej. Para el gym)"><button class="pri" data-a="catadd">Crear</button></div><div style="margin-top:12px"><button data-a="cerrar">Listo</button></div>`);
  };
  HG.acc.catadd = () => { const n = ($('#cn').value || '').trim(); if (!n) return; const id = slug(n); HDB.set('comida/categorias/' + id, { id, nombre: n }); HG.acc.cats(); };
  HG.acc.catren = b => { const c = HDB.get('comida/categorias/' + b.dataset.id), n = prompt('Nuevo nombre', c.nombre); if (n && n.trim()) { HDB.set('comida/categorias/' + c.id, { ...c, nombre: n.trim() }); HG.acc.cats(); } };
  HG.acc.catdel = b => { const id = b.dataset.id; alacena().filter(x => x.categoria === id).forEach(x => HDB.set('comida/alacena/' + x.id, { ...x, categoria: '' })); HDB.del('comida/categorias/' + id); HG.acc.cats(); };

  // ---------- Compras ----------
  HG.vistas.compras = function () {
    const modo = HG.sub.cmodo || 'pasillo', F = faltantes().filter(f => f.estado === 'falta'), cats = categorias();
    let h = `<div class="row"><div class="sp"><h1>Compras</h1><div class="mut">${faltantes().filter(f => f.estado === 'falta').length} por comprar</div></div>${pill()}</div><div class="seg">${[['pasillo', 'Por pasillo'], ['cat', 'Por categoría'], ['tienda', 'Por tienda']].map(([v, t]) => `<button data-a="cmodo" data-v="${v}" class="${modo === v ? 'on' : ''}">${t}</button>`).join('')}</div>`;
    const clave = f => modo === 'pasillo' ? (PASILLOS.includes(f.pasillo) ? f.pasillo : 'Otros') : modo === 'cat' ? ((cats.find(c => c.id === f.categoria) || {}).nombre || 'Sin categoría') : (f.donde || 'Sin tienda definida');
    const g = {}; F.forEach(f => (g[clave(f)] = g[clave(f)] || []).push(f));
    const orden = modo === 'pasillo' ? PASILLOS : Object.keys(g).sort();
    if (!F.length) h += `<div class="card mut">Nada por comprar. Cuando algo baje de su mínimo en la alacena aparece aquí solo (y también en Mi día).</div>`;
    orden.filter(k => g[k]).forEach(k => {
      h += `<h3>${esc(k)}</h3><div class="card">`;
      g[k].sort((a, b) => a.articulo.localeCompare(b.articulo)).forEach(f => { h += `<div class="it"><input type="checkbox" data-a="compre" data-id="${esc(f.id)}" style="width:22px;height:22px"><div class="em">${esc(f.emoji || '•')}</div><div class="sp"><b>${esc(f.articulo)}</b><div class="nota">${esc(f.cantidad_texto || '')}${f.donde ? ' · ' + esc(f.donde) : ''}</div></div>${f.alacena_id ? '' : `<button class="sm ghost bad" data-a="fdel" data-id="${esc(f.id)}">✕</button>`}</div>`; });
      h += '</div>';
    });
    h += `<div class="row" style="margin-top:10px"><button class="pri" data-a="fmanual">＋ Agregar a la lista</button></div>`;
    return h;
  };
  HG.acc.cmodo = b => { HG.sub.cmodo = b.dataset.v; HG.render(); };
  HG.acc.compre = b => { const f = HDB.get('comida/faltantes/' + b.dataset.id); if (f) { comprado(f); HG.render(); } };
  HG.acc.fdel = b => { HDB.del('comida/faltantes/' + b.dataset.id); HG.render(); };
  HG.acc.fmanual = () => abrir(`<h2>Agregar a la lista</h2><label>¿Qué falta?</label><input id="fm-n" placeholder="Ej. Café"><label>Pasillo</label><select id="fm-p">${PASILLOS.map(p => `<option>${p}</option>`).join('')}</select><label>¿Dónde lo consigo? (opcional)</label><input id="fm-d"><div class="row" style="margin-top:12px"><button class="pri sp" data-a="fmok">Agregar</button><button data-a="cerrar">Cancelar</button></div>`);
  HG.acc.fmok = () => { const n = ($('#fm-n').value || '').trim(); if (!n) return; const id = 'm-' + slug(n); HDB.set('comida/faltantes/' + id, { id, articulo: n, emoji: '•', estado: 'falta', pasillo: $('#fm-p').value, categoria: '', donde: $('#fm-d').value.trim(), cantidad_texto: 'comprar', ts: Date.now() }); cerrar(); HG.render(); };

  // ---------- Registro ----------
  const momentosOpts = sel => planHoy().map(p => `<option value="${esc(p.id)}" ${sel === p.id ? 'selected' : ''}>${esc(p.comida)}</option>`).join('') + `<option value="extra" ${sel === 'extra' ? 'selected' : ''}>Otra comida / colación</option>`;
  HG.momentosOpts = momentosOpts;
  HG.vistas.registro = function () {
    const modo = HG.sub.rmodo || 'hoy';
    let h = `<div class="row"><h1 class="sp">Registro</h1>${pill()}</div>`;
    h += `<div class="acts"><button data-a="foto" data-m=""><b>📷</b>Foto</button><button data-a="otro" data-m=""><b>🔎</b>Buscar</button><button data-a="sicomi"><b>✓</b>Sí comí</button></div>`;
    const pend = HG.fotosPend || [];
    if (pend.length) h += `<h3>Fotos por confirmar</h3>${pend.map(f => `<div class="card"><div class="row"><img src="${f.mini}" width="56" height="56" style="border-radius:10px;object-fit:cover"><div class="sp"><b>${f.res ? 'Análisis listo' : 'Esperando análisis'}</b><div class="nota">${f.err ? esc(f.err) : f.res ? (f.res.items || []).length + ' alimentos detectados' : 'Se analiza cuando haya internet'}</div></div></div><div class="row" style="margin-top:6px">${f.res ? `<button class="pri sm" data-a="fconf" data-id="${f.id}">Revisar y guardar</button>` : `<button class="sm" data-a="fanal" data-id="${f.id}">Analizar ahora</button>`}<button class="sm bad" data-a="fdesc" data-id="${f.id}">Descartar</button></div></div>`).join('')}`;
    const R = regHoy(); h += `<h3>Lo que llevas hoy</h3>`;
    if (!R.length) h += `<div class="card mut">Todavía no registras nada hoy.</div>`;
    R.forEach(r => { if (r.omitida) { h += `<div class="card"><div class="row"><b class="sp">${esc(r.nombre)}</b><span class="chip w">no se cumplió</span></div><div style="margin-top:6px"><button class="sm ghost" data-a="rdel" data-id="${esc(r.id)}">Deshacer</button></div></div>`; return; } h += `<div class="card"><div class="row"><b class="sp">${esc(r.nombre)}</b><span class="mut">${esc(r.hora)}</span></div><div class="macros"><span><b>${r0(r.kcal)}</b> kcal</span><span>P <b>${r0(r.prot)}</b></span><span>C <b>${r0(r.carb)}</b></span><span>G <b>${r0(r.grasa)}</b></span>${r.aprox ? '<span class="chip w">aprox.</span>' : ''}${r.origen === 'foto' ? '<span class="chip">foto</span>' : ''}</div><div style="margin-top:6px"><button class="sm ghost bad" data-a="rdel" data-id="${esc(r.id)}">Quitar</button></div></div>`; });
    return h;
  };
  HG.acc.rmodo = b => { HG.sub.rmodo = b.dataset.v; HG.render(); };

  // ---------- Peso: tú lo capturas, aquí ves el progreso ----------
  const pesos = () => HDB.hijos('comida/peso').filter(x => x && x.fecha && Number(x.kg) > 0).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const fCorta = f => new Date(f + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  function graficaPeso(L) {
    if (L.length < 2) return '<div class="nota">Con 2 registros ya se dibuja la tendencia.</div>';
    const W = 320, H = 130, p = 22, ks = L.map(x => Number(x.kg)), mn = Math.min(...ks) - 0.5, mx = Math.max(...ks) + 0.5;
    const t0 = new Date(L[0].fecha + 'T12:00:00').getTime(), t1 = new Date(L[L.length - 1].fecha + 'T12:00:00').getTime(), dt = Math.max(1, t1 - t0);
    const X = x => p + (new Date(x.fecha + 'T12:00:00').getTime() - t0) / dt * (W - 2 * p), Y = x => H - p - (Number(x.kg) - mn) / (mx - mn) * (H - 2 * p);
    const pts = L.map(x => X(x).toFixed(1) + ',' + Y(x).toFixed(1)).join(' ');
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Gráfica de peso"><polyline points="${pts}" fill="none" stroke="var(--ac)" stroke-width="2.5" stroke-linejoin="round"/>${L.map(x => `<circle cx="${X(x).toFixed(1)}" cy="${Y(x).toFixed(1)}" r="3.5" fill="var(--ac)"/>`).join('')}<text x="${p}" y="12" font-size="11" fill="var(--mut)">${r1(mx - 0.5)} kg</text><text x="${p}" y="${H - 4}" font-size="11" fill="var(--mut)">${r1(mn + 0.5)} kg</text><text x="${W - p}" y="${H - 4}" font-size="11" text-anchor="end" fill="var(--mut)">${esc(fCorta(L[L.length - 1].fecha))}</text><text x="${p + 40}" y="${H - 4}" font-size="11" fill="var(--mut)">${esc(fCorta(L[0].fecha))}</text></svg>`;
  }
  function vistaPeso() {
    const L = pesos(), u = L[L.length - 1], pr = L[0];
    let h = `<div class="card"><label>Peso de hoy (kg)</label><div class="row"><input class="sp" id="pk" type="number" step="0.1" inputmode="decimal" placeholder="Ej. 59.4"><button class="pri" data-a="pesoadd">Guardar</button></div><div class="nota" style="margin-top:6px">Lo ideal: en ayunas, después de ir al baño, 3 veces por semana. Un solo día dice poco; importa la tendencia.</div></div>`;
    if (!L.length) return h + `<div class="card mut">Todavía no hay registros. Captura el primero cuando te pesues.</div>`;
    const dif = r1(u.kg - pr.kg), s7 = L.filter(x => (new Date(u.fecha) - new Date(x.fecha)) / 864e5 < 7), a7 = L.filter(x => { const d = (new Date(u.fecha) - new Date(x.fecha)) / 864e5; return d >= 7 && d < 14; });
    const m = a => a.length ? a.reduce((n, x) => n + Number(x.kg), 0) / a.length : null, m7 = m(s7), p7 = m(a7);
    h += `<div class="card"><div class="macros"><span>Último <b>${r1(u.kg)}</b> kg</span><span>Desde el inicio <b>${dif > 0 ? '+' : ''}${dif}</b> kg</span>${m7 != null && p7 != null ? `<span>Semana vs anterior <b>${r1(m7 - p7) > 0 ? '+' : ''}${r1(m7 - p7)}</b> kg</span>` : ''}</div><div style="margin-top:8px">${graficaPeso(L)}</div>${p7 == null ? '<div class="nota">El cambio semanal aparece cuando hay registros de dos semanas.</div>' : ''}</div><h3>Registros</h3><div class="card">`;
    h += L.slice().reverse().slice(0, 30).map(x => `<div class="it"><div class="sp"><b>${r1(x.kg)} kg</b><div class="nota">${esc(fCorta(x.fecha))}</div></div><button class="sm ghost bad" data-a="pesodel" data-id="${esc(x.id)}">Quitar</button></div>`).join('') + '</div>';
    return h;
  }
  HG.acc.pesoadd = () => {
    const kg = Number($('#pk').value); if (!(kg >= 20 && kg <= 300)) { toast('Escribe un peso entre 20 y 300 kg'); return; }
    const f = hoyK(); HDB.set('comida/peso/' + f, { id: f, fecha: f, kg: r1(kg), ts: Date.now() });
    if (document.activeElement) document.activeElement.blur(); toast('Guardado: ' + r1(kg) + ' kg'); HG.render();
  };
  // ---------- agua ----------
  const aguaDoc = f => HDB.get('comida/agua/' + (f || hoyK())) || { id: f || hoyK(), fecha: f || hoyK(), ml: 0, log: [] };
  const kgActual = () => { const L = pesos(); return L.length ? Number(L[L.length - 1].kg) : Number(perfil().peso) || 0; };
  const aguaMeta = gym => { const kg = kgActual(); return Math.round(((kg ? kg * 35 : 2500) + (gym ? 500 : 0)) / 50) * 50; };
  const litros = ml => (ml / 1000).toFixed(2).replace(/\.?0+$/, '');
  const aguaRitmo = () => { const d = new Date(), m = d.getHours() * 60 + d.getMinutes(); return Math.round(aguaMeta(dia().gym) * Math.max(0, Math.min(1, (m - 480) / 780)) / 50) * 50; };
  function aguaCard(compacto) {
    const meta = aguaMeta(dia().gym), ml = Number(aguaDoc().ml) || 0, pct = Math.min(100, ml / meta * 100), rit = aguaRitmo(), falta = rit - ml;
    if (compacto) return `<div class="card agua c"><div class="row"><span class="sp"><b>💧 ${litros(ml)}</b> <span class="mut">de ${litros(meta)} L</span></span><button class="sm" data-a="agua" data-ml="250">+250</button><button class="sm" data-a="agua" data-ml="500">+500</button></div><div class="bar agua" style="margin-top:6px"><i style="width:${pct}%"></i></div></div>`;
    return `<div class="card agua"><div class="row"><b class="sp">💧 Agua de hoy</b><span class="mut">meta ${litros(meta)} L</span></div><div class="agbig"><b>${litros(ml)}</b> <span class="mut">de ${litros(meta)} L</span></div><div class="bar agua"><i style="width:${pct}%"></i></div><div class="${falta > 250 ? '' : 'mut'}" style="margin:8px 0">${ml >= meta ? '🎉 Meta cumplida' : falta > 250 ? '⏰ A esta hora deberías ir en <b>' + litros(rit) + ' L</b>: toma ≈' + (Math.ceil(falta / 50) * 50) + ' ml ahora' : 'Vas al ritmo. A esta hora toca ir en ' + litros(rit) + ' L'}</div><div class="row" style="gap:6px"><button class="pri sm" data-a="agua" data-ml="250">+ Vaso 250</button><button class="sm" data-a="agua" data-ml="500">+ Botella 500</button><button class="sm" data-a="agua" data-ml="750">+ 750</button><span class="sp"></span><button class="sm ghost" data-a="aguaundo">Deshacer</button></div><div class="nota" style="margin-top:8px">Meta: 35 ml por kg de peso${kgActual() ? ' (${r0(kgActual())} kg)' : ''}, +500 ml si entrenas. Te aviso aunque la app esté cerrada si vas atrasado.</div></div>`;
  }
  HG.acc.agua = b => { const ml = Number(b.dataset.ml) || 250, d = JSON.parse(JSON.stringify(aguaDoc())); d.log = (d.log || []).concat([{ ts: Date.now(), ml }]); d.ml = (Number(d.ml) || 0) + ml; HDB.set('comida/agua/' + d.id, d); toast('💧 +' + ml + ' ml'); HG.render(); };
  HG.acc.aguaundo = () => { const d = JSON.parse(JSON.stringify(aguaDoc())), u = (d.log || []).pop(); if (!u) return; d.ml = Math.max(0, (Number(d.ml) || 0) - u.ml); HDB.set('comida/agua/' + d.id, d); HG.render(); };
  function aguaSemana() {
    const meta = aguaMeta(false); let n = 0, tot = 0;
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const a = HDB.get('comida/agua/' + fechaK(d)); if (a && a.ml) { tot += a.ml; if (a.ml >= meta * 0.9) n++; } }
    return `<div class="card"><div class="macros"><span>💧 Días con la meta <b>${n}</b> de 7</span><span>Promedio <b>${litros(tot / 7)}</b> L/día</span></div></div>`;
  }
  HG.vistas.progreso = function () {
    const modo = HG.sub.pmodo || 'resumen';
    let h = `<div class="row"><h1 class="sp">Progreso</h1>${pill()}</div><div class="seg"><button data-a="pmodo" data-v="resumen" class="${modo === 'resumen' ? 'on' : ''}">Resumen</button><button data-a="pmodo" data-v="peso" class="${modo === 'peso' ? 'on' : ''}">⚖️ Peso</button></div>`;
    if (modo === 'peso') return h + vistaPeso();
    return h + aguaCard(false) + '<h3>Esta semana</h3>' + aguaSemana() + resumenSemana();
  };
  HG.acc.pmodo = b => { HG.sub.pmodo = b.dataset.v; HG.render(); };
  HG.acc.pesodel = b => { HDB.del('comida/peso/' + b.dataset.id); HG.render(); };
  HG.acc.rdel = b => { HDB.del('comida/registro/' + b.dataset.id); HG.render(); };
  function resumenSemana() {
    const dias = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); dias.push(fechaK(d)); }
    const meta = metaKcal() || 1, R = registro(), filas = dias.map(f => { const l = R.filter(r => r.fecha === f), s = suma(l); return { f, s, n: l.length }; });
    const con = filas.filter(x => x.n > 0), prom = con.length ? con.reduce((n, x) => n + x.s.k, 0) / con.length : 0, promP = con.length ? con.reduce((n, x) => n + x.s.pr, 0) / con.length : 0;
    const cumple = filas.filter(x => x.n > 0 && Math.abs(x.s.k - meta) <= meta * 0.15).length;
    const omit = R.filter(r => r.omitida && dias.includes(r.fecha)).length;
    let h = `<div class="card"><div class="macros"><span>Promedio <b>${r0(prom)}</b> kcal</span><span>Proteína <b>${r0(promP)}</b> g</span><span>Comidas que no se cumplieron <b>${omit}</b></span></div><div style="margin-top:6px"><b>${cumple}</b> de ${con.length || 0} días registrados dentro de ±15% de tu meta (${r0(meta)} kcal)</div></div>`;
    filas.forEach(x => { const p = Math.min(130, x.s.k / meta * 100), dd = new Date(x.f + 'T12:00:00'); h += `<div class="it"><div style="width:42px" class="mut">${dd.toLocaleDateString('es-MX', { weekday: 'short' })}</div><div class="sp"><div class="bar ${x.s.k > meta * 1.15 ? 'over' : ''}"><i style="width:${Math.min(100, p)}%"></i></div></div><div style="width:92px;text-align:right">${x.n ? r0(x.s.k) + ' kcal' : '<span class="mut">sin registro</span>'}</div></div>`; });
    return h + `<div class="nota" style="margin-top:8px">Los días con comidas marcadas «aprox.» son estimaciones; mientras más foto o alimento exacto, más confiable el resumen.</div>`;
  }
  HG.acc.sicomi = () => abrir(`<h2>Sí comí (aproximado)</h2><div class="nota">Cuando no hay foto ni tiempo: lo anoto como estimación.</div><label>¿Cuál comida?</label><select id="sc-m">${momentosOpts((proxima() || {}).id)}</select><label>¿Qué tan completa fue?</label><select id="sc-t"><option value="1">Como mi plan</option><option value="0.5">La mitad</option><option value="1.3">Me pasé un poco</option><option value="0.25">Casi nada</option></select><div class="row" style="margin-top:12px"><button class="pri sp" data-a="scok">Anotar</button><button data-a="cerrar">Cancelar</button></div>`);
  HG.acc.scok = () => {
    const id = $('#sc-m').value, f = Number($('#sc-t').value), p = plan().find(x => x.id === id), k = p ? Number(p.kcal) || 0 : 300, pr = p ? Number(p.proteina_g) || 0 : 10;
    guardarRegistro({ momento: id, nombre: p ? p.comida : 'Comida', kcal: r0(k * f), prot: r0(pr * f), aprox: true, origen: 'sicomi', items: [] }); cerrar(); toast('Anotado'); HG.render();
  };
  // buscar alimento y registrar
  let otroM = '';
  HG.acc.otro = b => {
    otroM = b.dataset.m || ''; abrir(`<h2>Registrar un alimento</h2><input id="bq" placeholder="Busca (ej. huevo, arroz…)" data-i="bq2"><div id="bres" style="margin-top:8px"></div><div class="row" style="margin-top:10px"><button data-a="manual">Escribir calorías a mano</button><button data-a="cerrar">Cancelar</button></div>`, () => listaOtro(''));
  };
  function listaOtro(q) { q = q.toLowerCase(); const l = A.filter(a => !q || a.n.toLowerCase().includes(q)).sort((a, b) => a.g.localeCompare(b.g) || a.n.localeCompare(b.n)).slice(0, 70); $('#bres').innerHTML = l.map(a => `<div class="it" data-a="otroelige" data-id="${a.id}"><div class="em">${a.e}</div><div class="sp"><b>${esc(a.n)}</b><div class="nota">${a.k} kcal · ${a.pr} g prot por 100 g</div></div></div>`).join('') || '<div class="mut">Sin resultados</div>'; }
  HG.listaOtro = listaOtro;
  HG.acc.otroelige = b => {
    const a = AM[b.dataset.id];
    abrir(`<h2>${a.e} ${esc(a.n)}</h2><label>Cuánto comiste (gramos)</label><input id="og" type="number" inputmode="decimal" value="${a.por}" data-i="og"><div class="nota">Porción típica: ${esc(a.pl)}</div><div class="macros" id="om" style="margin:10px 0"></div><label>¿Cuál comida?</label><select id="om-m">${momentosOpts(otroM || 'extra')}</select><div class="row" style="margin-top:12px"><button class="pri sp" data-a="ogok" data-id="${a.id}">Registrar</button><button data-a="cerrar">Cancelar</button></div>`, () => HG.macrosOtro(a.id));
  };
  HG.macrosOtro = id => { const g = Number($('#og').value) || 0, n = nut(id, g); $('#om').innerHTML = `<span><b>${r0(n.k)}</b> kcal</span><span>P <b>${r1(n.pr)}</b></span><span>C <b>${r1(n.c)}</b></span><span>G <b>${r1(n.gr)}</b></span>`; };
  HG.acc.ogok = b => { const a = AM[b.dataset.id], g = Number($('#og').value) || 0, n = nut(a.id, g); guardarRegistro({ momento: $('#om-m').value, nombre: a.n.replace(/ \(.*\)/, '') + ' ' + g + ' g', kcal: r0(n.k), prot: r0(n.pr), carb: r0(n.c), grasa: r0(n.gr), items: [{ nombre: a.n, gramos: g }] }); cerrar(); toast('Registrado'); HG.render(); };
  HG.acc.manual = () => abrir(`<h2>Calorías a mano</h2><label>¿Qué comiste?</label><input id="mn-n"><div class="row"><div class="sp"><label>Calorías</label><input id="mn-k" type="number" inputmode="decimal"></div><div class="sp"><label>Proteína (g)</label><input id="mn-p" type="number" inputmode="decimal"></div></div><label>¿Cuál comida?</label><select id="mn-m">${momentosOpts(otroM || 'extra')}</select><div class="row" style="margin-top:12px"><button class="pri sp" data-a="mnok">Registrar</button><button data-a="cerrar">Cancelar</button></div>`);
  HG.acc.mnok = () => { const k = Number($('#mn-k').value); if (!k) { toast('Pon las calorías'); return; } guardarRegistro({ momento: $('#mn-m').value, nombre: ($('#mn-n').value || 'Comida').trim(), kcal: r0(k), prot: r0($('#mn-p').value), aprox: true, origen: 'manual', items: [] }); cerrar(); toast('Registrado'); HG.render(); };

  // ---------- Foto: se guarda en el teléfono, se analiza con Claude cuando hay internet y TÚ confirmas ----------
  const IDB = (() => {
    let db; const abrirDb = () => db ? Promise.resolve(db) : new Promise((ok, no) => { const r = indexedDB.open('hungry', 1); r.onupgradeneeded = () => r.result.createObjectStore('fotos', { keyPath: 'id' }); r.onsuccess = () => { db = r.result; ok(db); }; r.onerror = () => no(r.error); });
    const tx = (m, f) => abrirDb().then(d => new Promise((ok, no) => { const t = d.transaction('fotos', m), s = t.objectStore('fotos'), q = f(s); t.oncomplete = () => ok(q && q.result); t.onerror = () => no(t.error); }));
    return { put: o => tx('readwrite', s => s.put(o)), all: () => tx('readonly', s => s.getAll()), del: id => tx('readwrite', s => s.delete(id)) };
  })();
  async function cargarFotos() { try { HG.fotosPend = (await IDB.all() || []).sort((a, b) => a.ts - b.ts); } catch (e) { HG.fotosPend = []; } }
  function reducir(file) {
    return new Promise((ok, no) => { const img = new Image(), u = URL.createObjectURL(file); img.onload = () => { const mk = m => { const k = Math.min(1, m / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.72); }; const g = mk(1024), mi = mk(96); URL.revokeObjectURL(u); ok({ g, mi }); }; img.onerror = () => no(new Error('No pude leer la foto')); img.src = u; });
  }
  let fotoM = '';
  HG.acc.foto = b => { fotoM = b.dataset.m || ''; let i = $('#fin'); if (!i) { i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.capture = 'environment'; i.id = 'fin'; i.className = 'hide'; document.body.appendChild(i); i.addEventListener('change', async () => { const f = i.files[0]; i.value = ''; if (!f) return; try { const { g, mi } = await reducir(f); const rec = { id: 'f' + Date.now(), ts: Date.now(), momento: fotoM, b64: g.split(',')[1], mini: mi }; await IDB.put(rec); await cargarFotos(); HG.tab = 'registro'; HG.sub.rmodo = 'hoy'; HG.render(); toast(navigator.onLine ? 'Analizando tu foto…' : 'Foto guardada. Se analiza al volver el internet'); analizar(rec.id); } catch (e) { toast(e.message); } }); } i.click(); };
  async function analizar(id) {
    const f = (HG.fotosPend || []).find(x => x.id === id); if (!f || f.res || !navigator.onLine || !HDB.sesion()) return;
    try { const r = await HDB.llamar('analizar-foto', { imagen: f.b64, tipo: 'image/jpeg' }); f.res = r; f.err = ''; await IDB.put(f); toast('Tu foto está lista para revisar'); }
    catch (e) { f.err = e.code === 'falta_llave' ? 'Falta activar el análisis de fotos (la llave de Claude en Supabase). La foto queda guardada.' : 'No se pudo analizar ahora: ' + e.message; await IDB.put(f); }
    HG.render();
  }
  HG.acc.fanal = b => { toast('Analizando…'); analizar(b.dataset.id); };
  HG.acc.fdesc = async b => { await IDB.del(b.dataset.id); await cargarFotos(); HG.render(); };
  HG.acc.fconf = b => {
    const f = HG.fotosPend.find(x => x.id === b.dataset.id), it = (f.res.items || []);
    abrir(`<h2>Revisa lo que vio</h2><img src="${f.mini}" width="64" style="border-radius:10px"><div class="nota">${esc(f.res.nota || '')} Corrige lo que no cuadre: es una estimación.</div><div id="fi">${it.map((x, i) => `<div class="card" data-fi="${i}"><label>Alimento</label><input data-f="nombre" value="${esc(x.nombre)}"><div class="row"><div class="sp"><label>Gramos</label><input data-f="gramos" type="number" value="${esc(x.gramos)}"></div><div class="sp"><label>kcal</label><input data-f="kcal" type="number" value="${esc(x.kcal)}"></div></div><div class="row"><div class="sp"><label>Prot</label><input data-f="prot" type="number" value="${esc(x.prot)}"></div><div class="sp"><label>Carb</label><input data-f="carb" type="number" value="${esc(x.carb)}"></div><div class="sp"><label>Grasa</label><input data-f="grasa" type="number" value="${esc(x.grasa)}"></div></div><button class="sm bad" data-a="fquitar">Quitar</button> <span class="chip ${x.confianza === 'alta' ? '' : 'w'}">confianza ${esc(x.confianza || 'media')}</span></div>`).join('')}</div><label>¿Cuál comida?</label><select id="fc-m">${momentosOpts(f.momento || (proxima() || {}).id)}</select><div class="row" style="margin-top:12px"><button class="pri sp" data-a="fguard" data-id="${f.id}">Guardar en mi registro</button><button data-a="cerrar">Cancelar</button></div>`);
  };
  HG.acc.fquitar = b => b.closest('.card').remove();
  HG.acc.fguard = async b => {
    const items = [...document.querySelectorAll('#fi .card')].map(c => { const g = n => c.querySelector(`[data-f=${n}]`).value; return { nombre: g('nombre'), gramos: Number(g('gramos')) || 0, kcal: Number(g('kcal')) || 0, prot: Number(g('prot')) || 0, carb: Number(g('carb')) || 0, grasa: Number(g('grasa')) || 0 }; });
    if (!items.length) { cerrar(); return; }
    const s = items.reduce((n, x) => ({ k: n.k + x.kcal, p: n.p + x.prot, c: n.c + x.carb, g: n.g + x.grasa }), { k: 0, p: 0, c: 0, g: 0 });
    guardarRegistro({ momento: $('#fc-m').value, nombre: items.map(x => x.nombre).join(', ').slice(0, 70), kcal: r0(s.k), prot: r0(s.p), carb: r0(s.c), grasa: r0(s.g), aprox: true, origen: 'foto', items });
    await IDB.del(b.dataset.id); await cargarFotos(); cerrar(); toast('Guardado desde tu foto'); HG.render();
  };

  // ---------- avisos con la app cerrada (Web Push) ----------
  const VAPID = 'BD3m2xc05qd_0aJiRj6gyJgCY7wAjVrcsOCPcTOMnPBq3vd7J0VW2umVwrP6ocynGuePnzF7qSvQ443HNP3bXfg';
  const b64 = s => { const p = '='.repeat((4 - s.length % 4) % 4), r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); };
  HG.acc.push = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) { toast('Este navegador no soporta avisos. En iPhone: Compartir → Agregar a inicio y abre Hungry desde ahí'); return; }
      if (await Notification.requestPermission() !== 'granted') { toast('No diste permiso para avisos'); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID) });
      await HDB.rest('push_subs?on_conflict=user_id,endpoint', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: HDB.uid(), endpoint: sub.endpoint, sub: sub.toJSON() }) });
      HG.sub.push = true; try { localStorage.setItem('hungry.push', '1'); } catch (e) { }
      toast('Listo: te aviso aunque la app esté cerrada'); HG.render();
    } catch (e) { toast('No se pudo activar: ' + e.message); }
  };

  // ---------- shell ----------
  const TABS = [['hoy', '🍽️', 'Hoy'], ['alacena', '🥫', 'Alacena'], ['compras', '🛒', 'Compras'], ['registro', '📓', 'Registro'], ['progreso', '📈', 'Progreso'], ['dieta', '🥗', 'Dieta']];
  function login() {
    return `<div class="row" style="margin:8px 0"><img src="icon.svg" alt="" width="44" height="44" style="border-radius:11px"><h1 style="margin:0">Hungry</h1></div><div class="card"><b>Entra a tu cuenta</b><div class="nota" style="margin:4px 0 8px">El mismo correo y contraseña de Temple y Mi día.</div><input id="l-e" type="email" autocomplete="username" placeholder="Correo"><div style="height:8px"></div><input id="l-p" type="password" autocomplete="current-password" placeholder="Contraseña"><div id="l-m" class="nota" style="min-height:20px;color:var(--warn)"></div><button class="pri" data-a="login" style="width:100%">Entrar</button></div>`;
  }
  HG.acc.login = async () => { const e = $('#l-e').value.trim(), p = $('#l-p').value; if (!e || !p) { $('#l-m').textContent = 'Escribe correo y contraseña'; return; } $('#l-m').textContent = 'Un momento…'; try { await HDB.login(e, p); await HDB.cargar(); afterLoad(); HG.render(); } catch (x) { $('#l-m').textContent = /Invalid login/i.test(x.message) ? 'Correo o contraseña incorrectos' : 'No se pudo conectar: ' + x.message; } };
  function afterLoad() { aplicarComprados(); sincronizarFaltantes(); cargarFotos().then(() => { (HG.fotosPend || []).forEach(f => analizar(f.id)); }); }
  HG.render = function () {
    const app = $('#app');
    if (!HDB.sesion()) { app.innerHTML = login(); $('#tabs').innerHTML = ''; return; }
    const ae = document.activeElement; if (ae && app.contains(ae) && /INPUT|SELECT|TEXTAREA/.test(ae.tagName) && ae.type !== 'checkbox') return;
    $('#tabs').innerHTML = TABS.map(([k, e, t]) => `<button data-a="tab" data-t="${k}" class="${HG.tab === k ? 'on' : ''}"><b>${e}</b>${t}</button>`).join('');
    const sy = window.scrollY; app.innerHTML = (HG.vistas[HG.tab] || HG.vistas.hoy)(); window.scrollTo(0, sy);
  };
  document.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b || (b.tagName === 'INPUT' && b.type === 'checkbox' && e.type !== 'click')) return; const f = HG.acc[b.dataset.a]; if (f) f(b, e); });
  document.addEventListener('input', e => {
    const i = e.target.dataset && e.target.dataset.i; if (!i) return;
    if (i === 'bq') listaAlta(e.target.value); else if (i === 'bq2') listaOtro(e.target.value); else if (i === 'og') HG.macrosOtro($('#modal [data-a=ogok]').dataset.id);
    else if (i === 'alq') { HG.sub.alq = e.target.value; const pos = e.target.selectionStart; const ae = e.target; $('#app').innerHTML = HG.vistas.alacena(); const n = $('[data-i=alq]'); n.focus(); n.setSelectionRange(pos, pos); }
  });
  document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.i === 'hr') { (HG.sub.hr = HG.sub.hr || {})[e.target.dataset.m] = e.target.value; return; } if (e.target.dataset && e.target.dataset.i === 'gym') { HDB.set('comida/estado/dia', { id: 'dia', fecha: hoyK(), gym: e.target.checked }); HG.render(); } });
  window.addEventListener('hdb', () => HG.render());
  HG.iniciar = async function () {
    HG.render();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
    await cargarFotos();
    const sync = async () => { if (document.hidden) return; const ok = await HDB.cargar(); if (ok) afterLoad(); HG.render(); };
    sync();
    setInterval(sync, 30000);   // cambios entre Hungry y Mi día: máximo 1 minuto
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('online', () => { sync(); (HG.fotosPend || []).forEach(f => analizar(f.id)); });
  };
})();
