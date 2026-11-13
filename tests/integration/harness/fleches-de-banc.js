// =======================================================================
// LES FLÈCHES DES PARCOURS — aides de banc (lot du 10 nov. 2026)
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-09-parcours-fleches.md. Ce que les bancs des parcours lisent depuis que le
// voile est retiré : la couche des flèches, la pulsation, la section actuelle, la poignée.
// Règle de ces aides (leçon du groupe 3, WebKit) : aucune mesure prise pendant un défilement ou une transition.
// Chaque lecture est un `expect.poll` : elle attend que la sonde du moteur (120 ms) ait posé l'état attendu.
import { expect } from '@playwright/test';

/** L'union des rectangles des éléments visibles désignés par les sélecteurs (dans la page). */
const UNION = `(sels) => {
    const rs = sels.flatMap((s) => [...document.querySelectorAll(s)]).map((e) => e.getBoundingClientRect()).filter((r) => r.width || r.height);
    if (!rs.length) return null;
    return { left: Math.min(...rs.map((r) => r.left)), top: Math.min(...rs.map((r) => r.top)),
             right: Math.max(...rs.map((r) => r.right)), bottom: Math.max(...rs.map((r) => r.bottom)) };
}`;

/** Ce que la couche des flèches porte : sa place, sa taille, et pour chaque flèche son départ et sa pointe (en px). */
export function etatFleches(page) {
    return page.evaluate(() => {
        const svg = document.getElementById('parcours-fleches');
        if (!svg) return null;
        const r = svg.getBoundingClientRect();
        const b = document.getElementById('parcours-bulle').getBoundingClientRect();
        return {
            couche: { left: r.left, top: r.top, width: r.width, height: r.height },
            fenetre: { width: window.innerWidth, height: window.innerHeight },
            viewBox: svg.getAttribute('viewBox'),
            ariaHidden: svg.getAttribute('aria-hidden'),
            bulle: { left: b.left, top: b.top, right: b.right, bottom: b.bottom },
            fleches: [...svg.querySelectorAll('g.parcours-fleche')].map((g) => {
                const n = g.getAttribute('data-trace').match(/-?\d+(\.\d+)?/g).map(Number);
                return { depart: { x: n[0], y: n[1] }, pointe: { x: n[4], y: n[5] }, trace: g.getAttribute('data-trace') };
            })
        };
    });
}

const distance = (p, r) => Math.hypot(Math.max(r.left - p.x, 0, p.x - r.right), Math.max(r.top - p.y, 0, p.y - r.bottom));

/**
 * Une flèche part du bord de la bulle et sa pointe s'arrête à quelques px du bord de la cible (l'union des éléments
 * désignés), sans la couvrir. Rend la flèche trouvée.
 */
export async function flecheVers(page, selecteurs, contexte = '') {
    const sels = [].concat(selecteurs);
    let trouvee = null;
    await expect.poll(async () => {
        const cible = await page.evaluate(`(${UNION})(${JSON.stringify(sels)})`);
        const e = await etatFleches(page);
        if (!cible) return 'cible absente';
        if (!e || !e.fleches.length) return 'aucune flèche';
        trouvee = e.fleches.find((f) => {
            const d = distance(f.pointe, cible);
            return d >= 3 && d <= 9 && distance(f.depart, e.bulle) <= 1.5;
        }) || null;
        return trouvee ? 'posée' : 'pointes à ' + e.fleches.map((f) => Math.round(distance(f.pointe, cible))).join(', ') + ' px de la cible';
    }, { message: (contexte ? contexte + ' : ' : '') + 'une flèche va de la bulle à ' + sels.join(' + '), timeout: 5000 }).toBe('posée');
    return trouvee;
}

/** Le nombre de flèches tracées (attendu, la sonde passée). */
export async function nombreDeFleches(page, n, contexte = '') {
    await expect.poll(async () => ((await etatFleches(page)) || { fleches: [] }).fleches.length,
        { message: (contexte ? contexte + ' : ' : '') + 'nombre de flèches', timeout: 5000 }).toBe(n);
}

/** La couche des flèches est dans le repère du contour : en (0, 0), innerWidth × innerHeight en px, sans viewBox. */
export async function coucheDansLeRepereDeLaFenetre(page, contexte = '') {
    await expect.poll(async () => {
        const e = await etatFleches(page);
        if (!e) return 'absente';
        const c = e.couche, f = e.fenetre;
        return [c.left, c.top, c.width, c.height].join(',') === [0, 0, f.width, f.height].join(',') ? 'juste'
            : `couche ${c.left},${c.top} ${c.width}×${c.height} pour une fenêtre ${f.width}×${f.height}`;
    }, { message: (contexte ? contexte + ' : ' : '') + 'la couche des flèches couvre la fenêtre, en px', timeout: 5000 }).toBe('juste');
    const e = await etatFleches(page);
    expect(e.viewBox, 'aucun viewBox ne met la couche à l’échelle').toBeNull();
    expect(e.ariaHidden).toBe('true');
}

/** La pulsation du contour : animée, ou un pointillé fixe sous prefers-reduced-motion. */
export function styleDuContour(page, id = 'parcours-contour') {
    return page.evaluate((i) => {
        const c = document.getElementById(i);
        if (!c || c.hidden) return null;
        const s = getComputedStyle(c);
        return { animation: s.animationName, bordure: s.borderTopStyle, largeurBordure: s.borderTopWidth, touche: s.pointerEvents };
    }, id);
}

/** L'élément porte la mise en évidence de la section actuelle, et lui seul. */
export async function sectionActuelleSur(page, selecteur, contexte = '') {
    await expect.poll(() => page.evaluate((sel) => {
        const marques = [...document.querySelectorAll('.parcours-section-actuelle')];
        const el = document.querySelector(sel);
        if (!el) return 'élément absent';
        if (marques.length !== 1) return marques.length + ' élément(s) marqué(s)';
        return marques[0] === el ? 'posée' : 'posée ailleurs : ' + (marques[0].textContent || '').trim().slice(0, 30);
    }, selecteur), { message: (contexte ? contexte + ' : ' : '') + 'section actuelle sur ' + selecteur, timeout: 5000 }).toBe('posée');
}

/** Rien du moteur ne retient le toucher : aux points donnés, ce qui le reçoit est la page (ou la bulle), jamais une couche. */
export async function rienNeRetientLeToucher(page, points, contexte = '') {
    const pris = await page.evaluate((pts) => pts.map(([x, y]) => {
        const el = document.elementFromPoint(x, y);
        return el && el.closest('#parcours-fleches, #parcours-contour, #parcours-voile') ? `${x},${y} : ${el.id || el.tagName}` : null;
    }).filter(Boolean), points);
    expect(pris, (contexte ? contexte + ' : ' : '') + 'aucune couche du moteur ne capte le toucher').toEqual([]);
    await expect(page.locator('#parcours-voile'), 'le voile n’existe plus').toHaveCount(0);
}

/**
 * Une flèche VISE l'élément (sa cible, `data-cible`, est la boîte de l'élément) et sa pointe s'arrête à 9 px au plus de
 * lui, ou dans la partie que la bulle laisse voir quand la bulle le chevauche (11 nov. 2026, captures 28 et 29 : faute
 * de place libre, la flèche entre dans ce qui reste visible). Rend la flèche trouvée.
 */
export async function flecheVisant(page, selecteur, contexte = '') {
    let trouvee = null;
    await expect.poll(async () => {
        const cible = await page.evaluate(`(${UNION})(${JSON.stringify([selecteur])})`);
        const marques = await page.evaluate(() => [...document.querySelectorAll('#parcours-fleches g.parcours-fleche')]
            .map((g) => ({ cible: (g.getAttribute('data-cible') || '').split(',').map(Number), trace: g.getAttribute('data-trace') })));
        const e = await etatFleches(page);
        if (!cible) return 'cible absente';
        if (!e || !e.fleches.length) return 'aucune flèche';
        // Sa cible est l'élément, ou contient l'élément (des cibles qui se touchent sont fondues en une).
        const k = marques.findIndex((m) => m.cible[0] <= cible.left + 2 && m.cible[1] <= cible.top + 2
            && m.cible[2] >= cible.right - 2 && m.cible[3] >= cible.bottom - 2);
        if (k === -1) return 'aucune flèche ne vise ' + selecteur;
        trouvee = e.fleches.find((f) => f.trace === marques[k].trace) || null;
        if (!trouvee) return 'flèche introuvable';
        const [l, t, r, bas] = marques[k].cible;
        const d = distance(trouvee.pointe, { left: l, top: t, right: r, bottom: bas }), b = e.bulle;
        const dansLaBulle = trouvee.pointe.x > b.left && trouvee.pointe.x < b.right && trouvee.pointe.y > b.top && trouvee.pointe.y < b.bottom;
        return d <= 9 && !dansLaBulle && distance(trouvee.depart, b) <= 1.5 ? 'posée' : `pointe à ${Math.round(d)} px`;
    }, { message: (contexte ? contexte + ' : ' : '') + 'une flèche vise ' + selecteur, timeout: 5000 }).toBe('posée');
    return trouvee;
}

/**
 * La flèche vers un morceau du canevas de la dissection (13 nov. 2026, « la grille ne remonte plus »). Un geste
 * d'étiquetage ne ramène plus le morceau désigné : défilé hors du canevas, RIEN ne le vise (aucune pointe à moins de
 * 12 px) et le canevas ne bouge pas ; la personne y revient (ce banc fait défiler le canevas, comme elle), et la flèche
 * s'y pose. Vu d'emblée, la flèche s'y pose tout de suite. Rend 'vu' ou 'caché' (ce qu'il était à l'arrivée).
 */
export async function flecheVersMorceau(page, selecteur, contexte = '') {
    const lire = () => page.evaluate((s) => {
        const b = document.querySelector(s), cv = document.getElementById('dissection-canevas');
        const r = b.getBoundingClientRect(), c = cv.getBoundingClientRect();
        const x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2;
        const pointes = [...document.querySelectorAll('#parcours-fleches g.parcours-fleche')].map((g) => {
            const n = g.getAttribute('data-trace').match(/-?\d+(\.\d+)?/g).map(Number);
            return Math.hypot(Math.max(r.left - n[4], 0, n[4] - r.right), Math.max(r.top - n[5], 0, n[5] - r.bottom));
        });
        return { vu: x >= c.left && x <= c.right && y >= c.top && y <= c.bottom, pointes, haut: cv.scrollTop, gauche: cv.scrollLeft };
    }, selecteur);
    const a = await lire();
    if (a.vu) { await flecheVers(page, selecteur, contexte); return 'vu'; }
    await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(ok, 250)))));
    const b = await lire();
    expect(b.pointes.every((d) => d > 12), contexte + ' : caché, rien ne le vise (pointes à ' + b.pointes.map(Math.round).join(', ') + ' px)').toBe(true);
    expect([b.haut, b.gauche], contexte + ' : le canevas n’a pas bougé').toEqual([a.haut, a.gauche]);
    await page.evaluate((s) => {
        const m = document.querySelector(s), cv = document.getElementById('dissection-canevas');
        const r = m.getBoundingClientRect(), c = cv.getBoundingClientRect();
        cv.scrollLeft += (r.left + r.width / 2) - (c.left + c.width / 2);
        cv.scrollTop += (r.top + r.height / 2) - (c.top + c.height / 2);
    }, selecteur);
    await flecheVers(page, selecteur, contexte + ' (la personne y est revenue)');
    return 'caché';
}
