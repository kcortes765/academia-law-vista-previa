const parentOrigin=location.origin;
/* Puente de la comparación local. bridge.mjs antepone `parentOrigin` y sirve este archivo
   dentro de las páginas proxificadas. Solo atiende mensajes de la página de comparación. */
(() => {
  const PADRE = parentOrigin;
  const MARGEN_BLOQUE = 32;      // px visibles entre bloques marcados (la página padre reduce el marco)
  const ESPACIO_PRIMERO = 32;    // px visibles sobre el primer bloque, para que quepa su etiqueta
  const ALTURA_POR_DEFECTO = 120;
  let escala = 1;                // escala visible del marco, la fija la página padre (1 = sin reducir)

  const css = () => `:root{--cmp-escala:${escala}}
.cmp-oculto:not(#cmp-n1):not(#cmp-n2){display:none!important}
body>aside.local-status{display:none!important}
.cmp-marcador{box-sizing:border-box;display:flex;align-items:center;justify-content:center;margin:0;padding:12px 20px;border:1px dashed #b9c1c6;border-radius:4px;background:#f6f6f4;color:#6b7680;font:500 15px/1.4 system-ui,sans-serif;text-align:center}`;

  let estado = null;        // { solo, vacio, entradas: [{ id, n, titulo, sel }], foco }
  let alturasOtro = {};     // alturas (px) de los bloques del otro lado, por id
  let alturasEnviadas = '';
  let aplicado = false;
  let silencioHasta = 0;
  let temporizador = 0;
  let enCola = false;
  const rastro = new Map(); // elemento -> cambios hechos, para restaurar la página exacta

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const maxScroll = () => {
    const d = document.scrollingElement || document.documentElement;
    return Math.max(0, d.scrollHeight - innerHeight);
  };
  // Desplazamientos hechos por el puente (sincronía, ir a un cambio, restaurar): se anotan para no
  // reenviarlos al otro marco como si los hubiera hecho la persona.
  let programadoHasta = 0;
  let programadoY = -1;
  const desplazar = (y) => {
    const top = Math.round(clamp(y, 0, maxScroll()));
    programadoY = top;
    programadoHasta = performance.now() + 350;
    scrollTo({ top, behavior: 'instant' });
  };
  const ratio = () => {
    const m = maxScroll();
    return m > 0 ? scrollY / m : 0;
  };

  function actualizarEstilo() {
    let s = document.getElementById('cmp-estilos');
    if (!s) {
      s = document.createElement('style');
      s.id = 'cmp-estilos';
      (document.head || document.documentElement).appendChild(s);
    }
    s.textContent = css();
  }

  // Devuelve true si la escala cambió (hay que volver a marcar).
  function fijarEscala(valor) {
    const n = Number(valor);
    if (!Number.isFinite(n) || n <= 0) return false;
    const nueva = clamp(n, 0.05, 1);
    if (Math.abs(nueva - escala) < 1e-4) return false;
    escala = nueva;
    actualizarEstilo();
    return true;
  }

  function registrar(el) {
    let r = rastro.get(el);
    if (!r) {
      r = { clase: el.hasAttribute('class'), estilo: el.hasAttribute('style'), props: new Map() };
      rastro.set(el, r);
    }
    return r;
  }
  function fijarClase(el, nombre) {
    registrar(el);
    el.classList.add(nombre);
  }
  function fijarAtributo(el, nombre, valor) {
    registrar(el);
    el.setAttribute(nombre, valor);
  }
  function fijarEstilo(el, prop, valor) {
    const r = registrar(el);
    if (!r.props.has(prop)) r.props.set(prop, { v: el.style.getPropertyValue(prop), p: el.style.getPropertyPriority(prop) });
    el.style.setProperty(prop, valor);
  }

  function restaurar() {
    for (const [el, r] of rastro) {
      el.classList.remove('cmp-oculto');
      el.removeAttribute('data-cmp-id');
      el.removeAttribute('data-cmp-label');
      for (const [prop, o] of r.props) {
        if (o.v) el.style.setProperty(prop, o.v, o.p);
        else el.style.removeProperty(prop);
      }
      if (!r.clase && el.getAttribute('class') === '') el.removeAttribute('class');
      if (!r.estilo && el.getAttribute('style') === '') el.removeAttribute('style');
    }
    rastro.clear();
    document.querySelectorAll('[data-cmp-marcador]').forEach((n) => n.remove());
    aplicado = false;
  }

  // Elemento de una entrada: en modo solo son los bloques marcados; en modo normal, el selector de su lado.
  function resolverEntrada(e) {
    if (estado.solo) return document.querySelector(`[data-cmp-id="${CSS.escape(e.id)}"]`);
    if (!e.sel) return null;
    try { return document.querySelector(e.sel); } catch { return null; }
  }
  function elementoDe(id) {
    if (!estado) return null;
    const e = estado.entradas.find((x) => x.id === id);
    return e ? resolverEntrada(e) : null;
  }
  // Bloque anterior o siguiente del manifiesto que sí exista en este lado (modo normal).
  function elementoMasCercano(id) {
    const lista = estado.entradas;
    const idx = lista.findIndex((x) => x.id === id);
    for (let k = 1; idx >= 0 && k < lista.length; k++) {
      for (const j of [idx - k, idx + k]) {
        if (!lista[j]) continue;
        const nodo = resolverEntrada(lista[j]);
        if (nodo) return nodo;
      }
    }
    return null;
  }

  function resaltar(nodo) {
    return; // sin marcas visuales: la página se ve como la verá el cliente
    const w = (3 / escala) + 'px';
    const d = (6 / escala) + 'px';
    nodo.animate(
      [
        { outlineStyle: 'solid', outlineWidth: w, outlineColor: '#9a6b3f', outlineOffset: d },
        { outlineStyle: 'solid', outlineWidth: w, outlineColor: 'rgba(154,107,63,0)', outlineOffset: d }
      ],
      { duration: 1500, easing: 'ease-out' }
    );
  }

  // Si el bloque no existe en este lado (modo normal), usa el más cercano; si no hay ninguno, el porcentaje de respaldo.
  function ir(id, f, margen, ratioRespaldo) {
    let nodo = elementoDe(id);
    const exacto = nodo !== null;
    if (!nodo && estado && !estado.solo) nodo = elementoMasCercano(id);
    if (!nodo && !Number.isFinite(ratioRespaldo)) return false;
    silencioHasta = performance.now() + 400;
    if (!nodo) {
      desplazar(clamp(ratioRespaldo, 0, 1) * maxScroll());
      return true;
    }
    const r = nodo.getBoundingClientRect();
    desplazar(clamp(r.top + scrollY + f * r.height - margen, 0, maxScroll()));
    if (exacto) resaltar(nodo);
    return true;
  }

  function anclaActual() {
    // Las filas se reordenan con CSS: se elige el primer bloque VISUAL (menor top), no el primero del DOM.
    let mejor = null;
    for (const nodo of document.querySelectorAll('[data-cmp-id]')) {
      const r = nodo.getBoundingClientRect();
      if (r.height > 0 && r.bottom > 0 && (!mejor || r.top < mejor.r.top)) mejor = { nodo, r };
    }
    if (!mejor) return null;
    return { id: mejor.nodo.getAttribute('data-cmp-id'), f: clamp(-mejor.r.top / mejor.r.height, -20, 1) };
  }

  let filasNaturales = {}; // id de la fila -> altura natural (sin igualar), para el otro lado

  function reportarAlturas() {
    if (!estado || !estado.solo) return;
    const json = JSON.stringify(filasNaturales);
    if (json !== alturasEnviadas) {
      alturasEnviadas = json;
      parent.postMessage({ type: 'academia-compare-heights', heights: filasNaturales }, PADRE);
    }
  }

  function marcar() {
    const items = estado.entradas.map((e) => {
      let el = null;
      let vacio = null;
      if (e.sel === null) {
        vacio = estado.vacio;
      } else {
        try { el = document.querySelector(e.sel); } catch { el = null; }
        if (!el) vacio = 'No encontrado';
      }
      return { e, el, vacio, nodo: el };
    });

    // Marcadores para lados vacíos, colocados en el orden del manifiesto.
    for (const it of items) {
      if (it.vacio === null) continue;
      const ph = document.createElement('div');
      ph.className = 'cmp-marcador';
      ph.setAttribute('data-cmp-marcador', '');
      ph.setAttribute('role', 'note');
      ph.textContent = it.vacio;
      ph.style.minHeight = ALTURA_POR_DEFECTO + 'px';
      it.nodo = ph;
    }
    const principal = document.querySelector('main') || document.body;
    let ultimo = null;
    items.forEach((it, i) => {
      if (it.vacio === null) { ultimo = it.el; return; }
      let ancla = null;
      for (let j = i + 1; j < items.length; j++) {
        if (items[j].el) { ancla = items[j].el; break; }
      }
      if (ancla) ancla.parentNode.insertBefore(it.nodo, ancla);
      else if (ultimo) ultimo.parentNode.insertBefore(it.nodo, ultimo.nextSibling);
      else principal.appendChild(it.nodo);
      ultimo = it.nodo;
    });

    const marcados = [];
    const vistos = new Set();
    for (const it of items) {
      if (!it.nodo || vistos.has(it.nodo)) continue;
      vistos.add(it.nodo);
      marcados.push({ id: it.e.id, nodo: it.nodo });
    }

    // Ocultar todo hermano que no sea ancestro ni marcado, subiendo hasta body.
    const mantener = new Set(marcados.map((m) => m.nodo));
    const ancestros = new Set([document.body]);
    // Un bloque dentro de otro bloque marcado se muestra completo con su contenedor: no se recorta el exterior.
    const dentroDeMarcado = (nodo) => { for (let p = nodo.parentElement; p; p = p.parentElement) if (mantener.has(p)) return true; return false; };
    for (const nodo of mantener) {
      if (dentroDeMarcado(nodo)) continue;
      for (let p = nodo.parentElement; p && p !== document.body; p = p.parentElement) ancestros.add(p);
    }
    for (const p of ancestros) {
      for (const hijo of Array.from(p.children)) {
        if (mantener.has(hijo) || ancestros.has(hijo)) continue;
        fijarClase(hijo, 'cmp-oculto');
      }
    }

    // Filas alineadas: cada cambio vive en una fila (su bloque hijo de main o de body). Ambos lados
    // muestran las filas en el orden del manifiesto y con la misma altura, una frente a la otra.
    const main = document.querySelector('body > main');
    const filaDe = (nodo) => {
      let t = nodo;
      while (t.parentElement && t.parentElement !== document.body && t.parentElement !== main) t = t.parentElement;
      return t;
    };
    const filas = [];
    const porFila = new Map();
    marcados.forEach((m, i) => {
      fijarAtributo(m.nodo, 'data-cmp-id', m.id);
      const f = filaDe(m.nodo);
      if (!porFila.has(f)) { const x = { id: m.id, orden: i, f }; porFila.set(f, x); filas.push(x); }
    });
    const medir = () => filas.forEach((x) => {
      const r = x.f.getBoundingClientRect();
      x.t = Math.round(r.top + scrollY);
      x.h = Math.round(r.height);
    });
    // Se conserva la maqueta propia de la página (márgenes, anchos, columnas). Solo si sus bloques no
    // siguen el orden del manifiesto se reordenan como columna flexible.
    medir();
    const reordenar = !filas.every((x, i) => i === 0 || x.t >= filas[i - 1].t + filas[i - 1].h - 2);
    if (reordenar) {
      fijarEstilo(document.body, 'display', 'flex');
      fijarEstilo(document.body, 'flex-direction', 'column');
      if (main) fijarEstilo(main, 'display', 'contents');
      filas.forEach((x) => {
        fijarEstilo(x.f, 'order', String(x.orden * 2 + 2));
        fijarEstilo(x.f, 'flex-shrink', '0');
        fijarEstilo(x.f, 'margin-top', (MARGEN_BLOQUE / escala) + 'px');
        fijarEstilo(x.f, 'margin-bottom', '0px');
      });
      medir();
    }
    // Unidad de alineación de cada cambio: su ancestro más alto que no contiene otro cambio, siempre que
    // su contenedor apile en vertical (bloque o columna flexible). Así dos cambios dentro de una misma
    // sección se alinean cada uno por separado sin tocar columnas ni rejillas.
    const nodosMarcados = marcados.map((m) => m.nodo);
    const contieneOtro = (p, propio) => nodosMarcados.some((n) => n !== propio && (n === p || p.contains(n)));
    const apila = (p) => {
      if (p === document.body || p === main) return true;
      const cs = getComputedStyle(p);
      if (cs.display === 'block' || cs.display === 'flow-root' || cs.display === 'list-item') return true;
      if (/flex/.test(cs.display)) return /column/.test(cs.flexDirection);
      return false;
    };
    const unidades = [];
    marcados.forEach((m, i) => {
      if (dentroDeMarcado(m.nodo)) return;
      let u = m.nodo;
      while (u.parentElement && u.parentElement !== document.body && u.parentElement !== main && !contieneOtro(u.parentElement, m.nodo)) u = u.parentElement;
      if (!u.parentElement || !apila(u.parentElement)) return;
      const r = u.getBoundingClientRect();
      unidades.push({ id: m.id, orden: i, u, t: Math.round(r.top + scrollY), h: Math.round(r.height) });
    });
    filasNaturales = {};
    unidades.forEach((x) => { filasNaturales[x.id] = x.h; filasNaturales[x.id + '^t'] = x.t; });

    // Alineación con el otro lado: ambos calculan las mismas posiciones destino a partir de las medidas
    // naturales de los dos (cada bloque empieza donde empieza el más bajo y ocupa lo del más alto), y cada uno
    // rellena con espacios vacíos lo que le falta. Las medidas naturales no dependen de los espacios: sin bucles.
    const espacio = (alto, x, despues) => {
      const s = document.createElement('div');
      s.setAttribute('data-cmp-marcador', '');
      s.setAttribute('aria-hidden', 'true');
      s.style.cssText = `display:block;height:${alto}px;flex-shrink:0;margin:0;padding:0;border:0`;
      const p = x.u.parentElement;
      if (reordenar && (p === document.body || p === main)) s.style.order = String(x.orden * 2 + (despues ? 3 : 1));
      p.insertBefore(s, despues ? x.u.nextSibling : x.u);
    };
    const comunes = unidades.filter((x) => Number.isFinite(alturasOtro[x.id]) && Number.isFinite(alturasOtro[x.id + '^t']));
    let destino = 0;
    let extraPrevio = 0;
    comunes.forEach((x, k) => {
      const o = { t: alturasOtro[x.id + '^t'], h: alturasOtro[x.id] };
      if (k === 0) destino = Math.max(x.t, o.t);
      else {
        const pm = comunes[k - 1];
        const po = { t: alturasOtro[pm.id + '^t'], h: alturasOtro[pm.id] };
        destino += Math.max(pm.h, po.h) + Math.max(x.t - (pm.t + pm.h), o.t - (po.t + po.h));
      }
      const extra = destino - x.t;
      if (extra - extraPrevio > 0) espacio(extra - extraPrevio, x, false);
      extraPrevio = Math.max(extraPrevio, extra);
      if (k === comunes.length - 1 && o.h > x.h) espacio(o.h - x.h, x, true);
    });
    aplicado = true;
  }

  // Firma de lo que importa (bloques resueltos y sus alturas, escala, alturas del otro lado). Si no cambia,
  // no se rehace nada: así un reloj o una animación de la SPA no desarman el modo ni mueven la página.
  const idsNodo = new WeakMap();
  let contadorNodo = 0;
  let firmaAplicada = '';
  const idDe = (n) => { let v = idsNodo.get(n); if (!v) { v = ++contadorNodo; idsNodo.set(n, v); } return v; };
  function firma() {
    const p = [estado.solo ? 1 : 0, escala, JSON.stringify(alturasOtro)];
    if (estado.solo) {
      for (const e of estado.entradas) {
        let n = null;
        if (e.sel) { try { n = document.querySelector(e.sel); } catch { n = null; } }
        p.push(n ? idDe(n) + ':' + Math.round(n.getBoundingClientRect().height) : 0);
      }
    }
    return p.join('|');
  }

  function aplicar(forzar) {
    if (!estado) return;
    observador.disconnect();
    try {
      if (!forzar && aplicado && firma() === firmaAplicada) return;
      const yAntes = aplicado && estado.solo ? scrollY : null; // las filas están alineadas: se conserva el píxel
      if (aplicado) restaurar();
      if (estado.solo && estado.entradas.length) {
        marcar();
        reportarAlturas();
        if (yAntes !== null && !estado.foco) desplazar(clamp(yAntes, 0, maxScroll()));
        firmaAplicada = firma();
      }
      if (estado.foco && ir(estado.foco, 0, 24)) estado.foco = null;
    } finally {
      observar();
      pedirGeo();
    }
  }

  // Geometría de los bloques con cambios (posición en el documento), para el riel de la página padre.
  // Las marcas se dibujan fuera de la página: aquí no se pinta nada.
  let geoEnCola = false;
  let geoEnviada = '';
  function pedirGeo() {
    if (geoEnCola) return;
    geoEnCola = true;
    requestAnimationFrame(() => {
      geoEnCola = false;
      if (!estado) return;
      const b = [];
      for (const e of estado.entradas) {
        const n = resolverEntrada(e);
        if (!n) continue;
        const r = n.getBoundingClientRect();
        if (r.height <= 0 && r.width <= 0) continue;
        b.push({ id: e.id, t: Math.round(r.top + scrollY), h: Math.round(r.height), v: n.hasAttribute('data-cmp-marcador') ? 1 : 0 });
      }
      const msg = { type: 'academia-compare-geo', y: Math.round(scrollY), m: Math.round(maxScroll()), b };
      const json = JSON.stringify(msg);
      if (json === geoEnviada) return;
      geoEnviada = json;
      parent.postMessage(msg, PADRE);
    });
  }
  new ResizeObserver(() => pedirGeo()).observe(document.documentElement);

  function normalizar(d) {
    return {
      solo: d.solo === true,
      vacio: typeof d.vacio === 'string' ? d.vacio : '',
      entradas: (Array.isArray(d.entradas) ? d.entradas : [])
        .filter((e) => e && typeof e.id === 'string')
        .map((e) => ({
          id: e.id,
          n: Number(e.n) || 0,
          titulo: String(e.titulo ?? ''),
          sel: typeof e.sel === 'string' ? e.sel : null
        })),
      foco: typeof d.foco === 'string' ? d.foco : null
    };
  }

  // Mutaciones de la SPA: se re-aplica con debounce y sin observar nuestros propios cambios.
  const observador = new MutationObserver(() => {
    clearTimeout(temporizador);
    temporizador = setTimeout(aplicar, 150);
  });
  function observar() {
    observador.observe(document.body, { childList: true, subtree: true });
  }

  // Marco «líder»: solo informa su scroll el marco con el que la persona interactúa. Los desplazamientos
  // hechos por sincronización no tienen interacción propia, así que no rebotan al otro marco.
  let interaccion = -1e9;
  let presionado = false;
  const marcarInteraccion = () => { interaccion = performance.now(); };
  for (const tipo of ['wheel', 'touchstart', 'touchmove', 'keydown']) addEventListener(tipo, marcarInteraccion, { passive: true, capture: true });
  addEventListener('pointerdown', () => { presionado = true; marcarInteraccion(); }, { passive: true, capture: true });
  addEventListener('pointerup', () => { presionado = false; marcarInteraccion(); }, { passive: true, capture: true });
  const lider = () => presionado || performance.now() - interaccion < 900;

  // Manda el marco que la persona mueve: rueda, teclado o toque recientes, o cualquier desplazamiento que no
  // haya hecho el puente y no venga de un cambio de alto de la página (p. ej. arrastrar la barra de scroll).
  let altoPrevio = 0;
  addEventListener('scroll', () => {
    pedirGeo();
    const alto = document.documentElement.scrollHeight;
    const mismoAlto = alto === altoPrevio;
    altoPrevio = alto;
    if (performance.now() < programadoHasta && Math.abs(scrollY - programadoY) < 3) return;
    if (!lider() && !mismoAlto) return;
    if (enCola) return;
    enCola = true;
    requestAnimationFrame(() => {
      enCola = false;
      parent.postMessage({
        type: 'academia-scroll',
        y: Math.round(scrollY),
        ratio: ratio(),
        ancla: estado && estado.solo ? Object.assign(anclaActual() || { id: '', f: 0 }, { px: scrollY }) : null
      }, PADRE);
    });
  }, { passive: true });

  addEventListener('message', (event) => {
    if (event.source !== parent || event.origin !== PADRE) return;
    const d = event.data;
    if (!d || typeof d !== 'object') return;

    if (d.type === 'academia-scroll-to') {
      const r = Number.isFinite(d.y) ? 0 : Number(d.ratio);
      if (!Number.isFinite(r)) return;
      if (lider()) return; // la persona está moviendo este marco: manda él
      if (Number.isFinite(d.y)) { desplazar(d.y); return; } // posición exacta calculada por la página padre
      const a = d.ancla;
      // Modo Solo cambios: ambos lados tienen las mismas filas a las mismas alturas → mismo píxel.
      if (estado && estado.solo && aplicado && a && Number.isFinite(a.px)) {
        desplazar(clamp(a.px, 0, maxScroll()));
        return;
      }
      if (estado && estado.solo && a && typeof a.id === 'string' && Number.isFinite(a.f)) {
        const nodo = elementoDe(a.id);
        if (nodo) {
          const q = nodo.getBoundingClientRect();
          desplazar(clamp(q.top + scrollY + a.f * q.height, 0, maxScroll()));
          return;
        }
      }
      desplazar(clamp(r, 0, 1) * maxScroll());
      return;
    }

    if (d.type !== 'academia-compare') return;
    if (d.cmd === 'estado') {
      fijarEscala(d.escala);
      estado = normalizar(d);
      aplicar(true);
    } else if (d.cmd === 'escala') {
      if (fijarEscala(d.escala) && estado && estado.solo) aplicar(true);
    } else if (d.cmd === 'alturas') {
      alturasOtro = d.alturas && typeof d.alturas === 'object' ? d.alturas : {};
      aplicar();
    } else if (d.cmd === 'rueda' && Number.isFinite(d.dy)) {
      marcarInteraccion(); // la rueda sobre el riel cuenta como mover este marco
      scrollBy({ top: clamp(d.dy, -2000, 2000), behavior: 'instant' });
    } else if (d.cmd === 'ir' && typeof d.id === 'string') {
      ir(d.id, Number(d.f) || 0, Number(d.margen) || 0, typeof d.ratio === 'number' ? d.ratio : null);
    }
  });

  // Vista «José · Agenda» del comparador: abre la pestaña Agenda una vez cargada la página.
  if (new URLSearchParams(location.search).get('cmp') === 'agenda') {
    let intentos = 0;
    // Reintenta hasta que la agenda esté a la vista: el botón puede existir aún deshabilitado mientras carga Hoy.
    const abrir = () => {
      if (document.querySelector('.agenda-days, [data-ops-agenda][aria-current="page"]')) return;
      const b = document.querySelector('[data-ops-agenda]');
      if (b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' && !b.closest('[aria-busy="true"]')) b.click();
      if (++intentos < 30) setTimeout(abrir, 700);
    };
    abrir();
  }

  actualizarEstilo();
  observar();
  parent.postMessage({ type: 'academia-scroll-ready' }, PADRE);
  parent.postMessage({ type: 'academia-compare-ready' }, PADRE);
})();
