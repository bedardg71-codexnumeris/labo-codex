import { expect } from '@playwright/test';

// =======================================================================
// LE RELEVÉ DE LA BULLE — 11 NOVEMBRE 2026 (Grégoire, sur l'iPad : « la bulle ne couvre jamais ses zones »)
// =======================================================================
// Posé dans les bancs des neuf parcours (`releverLaBulle(test)`), il regarde la bulle tout au long de chaque essai, quatre
// fois par seconde, hors téléphone et hors bulle déplacée par la personne : elle ne doit couvrir ses zones et le contour
// QUE si aucune place de l'écran utile ne les laisse libres, et alors pas plus que le moindre recouvrement possible, le
// contour pesé dix mille fois (couvrir ce qu'il faut toucher, seulement faute de mieux).
// L'ORACLE est indépendant du moteur : toutes les places de l'écran utile au pas de 8 px (le moteur, lui, essaie les coins
// de la grille des bords, où le minimum est atteint : il fait au moins aussi bien que l'oracle).
// Un écart ne compte que s'il tient deux relevés de suite sur une page immobile (la sonde du moteur passe toutes les
// 120 ms : un relevé pris entre un défilement et la sonde suivante n'est pas une place choisie).
// Le relevé vit dans sessionStorage : il survit aux rechargements des essais.

const CLE = 'releve-bulle';

function installer() {
    const lire = () => { try { return JSON.parse(sessionStorage.getItem('releve-bulle') || '{"ecarts":[],"vus":[]}'); } catch (e) { return { ecarts: [], vus: [] }; } };
    const ecrire = (r) => { try { sessionStorage.setItem('releve-bulle', JSON.stringify(r)); } catch (e) { /* rien */ } };
    const rectDe = (el) => {
        if (!el || !el.isConnected) return null;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : null;
    };
    const aire = (p, rs) => rs.reduce((t, r) => {
        const l = Math.min(p.right, r.right) - Math.max(p.left, r.left), h = Math.min(p.bottom, r.bottom) - Math.max(p.top, r.top);
        return t + (l > 0 && h > 0 ? l * h * (r.poids || 1) : 0);
    }, 0);
    const moindre = (rs, bw, bh, c) => {
        let min = Infinity;
        for (let x = c.gauche; x <= Math.max(c.gauche, c.droite - bw); x += 8) {
            for (let y = c.haut; y <= Math.max(c.haut, c.bas - bh); y += 8) {
                min = Math.min(min, aire({ left: x, top: y, right: x + bw, bottom: y + bh }, rs));
                if (min === 0) return 0;
            }
        }
        return min;
    };
    let enAttente = null;
    setInterval(() => {
        const m = window.ParcoursMoteur;
        const pl = m && m.actif() && m.placement ? m.placement() : null;
        const b = rectDe(document.getElementById('parcours-bulle'));
        if (!pl || pl.deplacee || pl.telephone || !b) { enAttente = null; return; }
        // Le contour (ce qu'il faut toucher) pèse dix mille fois une zone : il n'est couvert que faute de mieux.
        const prio = pl.prioritaires || [pl.contour];
        const rs = pl.zones.filter((z) => prio.indexOf(z) === -1).map(rectDe).filter(Boolean)
            .concat(prio.map(rectDe).filter(Boolean).map((r) => Object.assign(r, { poids: 10000 })));
        const titre = (document.querySelector('#parcours-bulle .parcours-bulle-titre') || {}).textContent || '';
        const rang = (document.querySelector('#parcours-bulle .parcours-bulle-rang') || {}).textContent || '';
        const r = lire();
        const nom = `${titre} (${rang}, ${innerWidth} × ${innerHeight})`;
        if (r.vus.indexOf(nom) === -1) r.vus.push(nom);
        r.fois = r.fois || {};
        r.fois[nom] = (r.fois[nom] || 0) + 1;
        ecrire(r);
        const couvert = aire(b, rs);
        if (couvert === 0) { enAttente = null; return; }
        const min = moindre(rs, b.right - b.left, b.bottom - b.top, pl.cadre);
        if (couvert <= min + 1) { enAttente = null; return; }
        const signe = JSON.stringify([b, rs].map((x) => JSON.stringify(x)));
        if (enAttente !== signe) { enAttente = signe; return; }
        r.ecarts.push({ etape: nom, couvert: Math.round(couvert), moindre: Math.round(min) });
        ecrire(r);
        enAttente = null;
    }, 250);
}

// =======================================================================
// LE RELEVÉ DES OUVERTURES — 11 NOVEMBRE 2026 (Grégoire, quatrième aperçu : « des flèches arrivent trop tard, ou manquent »)
// =======================================================================
// Posé avec le relevé de la bulle, dans les bancs des neuf parcours. À l'OUVERTURE de chaque étape (son titre et son
// « n sur N » nouveaux, puis la page immobile deux relevés de suite : la sonde du moteur est passée), et de nouveau à
// chaque changement de ce qu'il faut toucher (le geste suivant, « un à un » : complément de 12 h 05), hors téléphone :
//   · la bulle NOMME le geste : sa ligne du geste est là (« nommer, pointer, passer par les étapes une après l'autre ») ;
//   · un bouton de bulle n'est jamais caché ; inactif, la raison est écrite dessous (captures 32 à 34) ;
//   · une étape qui a un contour (ce qu'il faut toucher) le montre, sa pulsation posée, et a au moins une flèche ;
//   · aucune flèche ne va à un élément hors de l'écran, ni à rien de ce que l'étape désigne, ni à ce qui ne se voit
//     pas (couvert par une palette flottante, une fenêtre ou la bulle) ; la pulsation non plus ;
//   · aucun contour posé par un parcours (`parcours-contour-extra-*`) n'est dessiné sur une palette flottante ou la bulle.
// L'ORACLE ne lit du moteur que ce qu'il désigne (`placement()`) et la cible de chaque flèche (`data-cible`) ; ce qui se
// voit, il le juge seul : en cinq points de la partie à l'écran, le toucher trouve l'élément ou l'un de ses descendants.
// Une étape quittée avant que la page soit immobile n'est pas jugée (comptée à part). Un écart n'est compté que s'il
// tient encore une seconde plus tard (une étape qui amène elle-même son menu après une navigation, 300 ms ; l'écran
// qui se replace) ; pendant une progression de l'application (« Export de la synthèse »), rien n'est jugé.

const CLE_OUV = 'releve-ouvertures';

function installerOuvertures() {
    const lire = () => { try { return JSON.parse(sessionStorage.getItem('releve-ouvertures') || '{"jugees":[],"nonJugees":[],"ecarts":[]}'); } catch (e) { return { jugees: [], nonJugees: [], ecarts: [] }; } };
    const ecrire = (r) => { try { sessionStorage.setItem('releve-ouvertures', JSON.stringify(r)); } catch (e) { /* rien */ } };
    const surEcran = (r) => r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight;
    const seVoit = (el) => {
        if (!el || !el.isConnected) return false;
        const r = el.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0) || !surEcran(r)) return false;
        const g = Math.max(0, r.left), h = Math.max(0, r.top), d = Math.min(innerWidth, r.right), b = Math.min(innerHeight, r.bottom);
        return [[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]].some(([fx, fy]) => {
            const t = document.elementFromPoint(g + (d - g) * fx, h + (b - h) * fy);
            return !!t && (t === el || el.contains(t));
        });
    };
    const couvrant = (el) => {
        const r = el.getBoundingClientRect();
        const t = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, (r.left + r.right) / 2)), Math.min(innerHeight - 1, Math.max(0, (r.top + r.bottom) / 2)));
        return t ? ' (dessus : ' + nomDe(t) + ')' : '';
    };
    const nomDe = (el) => el ? (el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '')) + ' « ' + (el.textContent || '').trim().slice(0, 30) + ' »' : '?';
    let courant = null, stable = null, juge = false, reconfirmer = 0;
    setInterval(() => {
        const m = window.ParcoursMoteur;
        const pl = m && m.actif() && m.placement ? m.placement() : null;
        const bulle = document.getElementById('parcours-bulle');
        if (!pl || !bulle || pl.telephone || pl.zoom) { if (courant && !juge) { const r = lire(); r.nonJugees.push(courant); ecrire(r); } courant = null; return; }
        const titre = (bulle.querySelector('.parcours-bulle-titre') || {}).textContent || '';
        const rang = (bulle.querySelector('.parcours-bulle-rang') || {}).textContent || '';
        const c0 = pl.contour;
        const quoi = c0 && c0.isConnected ? [c0.tagName, c0.id, c0.getAttribute('data-action') || '', (c0.textContent || '').trim().slice(0, 30)].join('|') : '';
        const nom = `${titre} (${rang}, ${innerWidth} × ${innerHeight})` + (quoi ? ` — ${nomDe(c0)}` : '');
        if (nom !== courant) {
            if (courant && !juge) { const r = lire(); r.nonJugees.push(courant); ecrire(r); }
            courant = nom; stable = null; juge = false; reconfirmer = 0;
        }
        if (juge) return;
        const contourDiv = document.getElementById('parcours-contour');
        const fleches = [...document.querySelectorAll('#parcours-fleches g.parcours-fleche')];
        // Immobile : la même page deux relevés de suite, ce que l'étape désigne compris, ET une sonde du moteur passée
        // entre les deux (sans elle, un relevé pris juste après un long calcul de la page lirait des flèches périmées).
        const rectDe = (el) => { if (!el || !el.isConnected) return null; const e = el.getBoundingClientRect(); return [e.left, e.top, e.right, e.bottom]; };
        const signe = JSON.stringify([bulle.getBoundingClientRect(), contourDiv && !contourDiv.hidden && contourDiv.getBoundingClientRect(),
            fleches.map((g) => g.getAttribute('data-trace')), scrollX, scrollY, pl.zones.map(rectDe), rectDe(pl.contour),
            // ce qui se voit aussi : une fenêtre qui s'ouvre ou se ferme (un voile qui passe) n'est pas un état choisi
            pl.zones.concat(pl.contour ? [pl.contour] : []).map(seVoit)]);
        const progression = document.getElementById('progression-overlay');
        if (progression && progression.getBoundingClientRect().width > 0 && getComputedStyle(progression).display !== 'none'
            && getComputedStyle(progression).visibility !== 'hidden') { stable = null; return; }
        // Un élément désigné détaché de la page (un rendu l'a remplacé, la sonde suivante prendra le neuf) : pas encore.
        if (pl.zones.concat(pl.contour ? [pl.contour] : []).some((el) => el && !el.isConnected)) { stable = null; return; }
        if (!stable || signe !== stable.signe || pl.passages <= stable.passages) { if (!stable || signe !== stable.signe) stable = { signe, passages: pl.passages }; return; }
        juge = true;
        const ecarts = [];
        const geste = bulle.querySelector('.parcours-bulle-geste');
        if (!geste || !geste.textContent.trim() || !(geste.getBoundingClientRect().height > 0)) ecarts.push('la bulle ne nomme pas le geste (pas de ligne du geste)');
        const boutons = [...bulle.querySelectorAll('.parcours-bulle-boutons button')];
        boutons.forEach((b) => {
            const s = getComputedStyle(b);
            if (b.hidden || s.display === 'none' || s.visibility === 'hidden' || (b.closest('.parcours-bulle-boutons').hidden)) ecarts.push(`le bouton « ${b.textContent.trim()} » est caché`);
        });
        const attente = bulle.querySelector('.parcours-bulle-attente');
        if (boutons.some((b) => b.disabled) && !(attente && !attente.hidden && attente.textContent.trim())) ecarts.push('un bouton inactif sans la raison écrite dessous');
        const c = pl.contour;
        const rc = c && c.isConnected ? c.getBoundingClientRect() : null;
        const aUnContour = !!(rc && rc.width > 0 && rc.height > 0);
        if (aUnContour) {
            if (!surEcran(rc)) ecarts.push('ce qu’il faut toucher est hors de l’écran : ' + nomDe(c));
            else if (!seVoit(c)) ecarts.push('ce qu’il faut toucher ne se voit pas (couvert) : ' + nomDe(c) + couvrant(c));
            if (!contourDiv || contourDiv.hidden) ecarts.push('pas de pulsation sur ce qu’il faut toucher : ' + nomDe(c));
            if (!fleches.length) ecarts.push('aucune flèche, alors que l’étape a un contour : ' + nomDe(c));
        }
        if (contourDiv && !contourDiv.hidden && aUnContour && surEcran(rc) && !seVoit(c)) ecarts.push('une pulsation sur ce qui ne se voit pas : ' + nomDe(c));
        const designes = pl.zones.concat(c ? [c] : []).filter((el) => el && el.isConnected);
        fleches.forEach((g, k) => {
            if (g.hasAttribute('data-hors-ecran')) { ecarts.push(`flèche ${k + 1} vers un élément hors de l’écran`); return; }
            const [l, t, r, b] = (g.getAttribute('data-cible') || '').split(',').map(Number);
            const vises = designes.filter((el) => {
                const e = el.getBoundingClientRect();
                return e.width > 0 && e.height > 0 && e.left >= l - 2 && e.top >= t - 2 && e.right <= r + 2 && e.bottom <= b + 2;
            });
            if (!vises.length) {
                const ds = designes.map((el) => { const e = el.getBoundingClientRect(); return nomDe(el) + ' ' + [e.left, e.top, e.right, e.bottom].map(Math.round).join(','); });
                ecarts.push(`flèche ${k + 1} vers rien de ce que l’étape désigne (${l},${t},${r},${b}) ; désignés : ${ds.join(' ; ')}`);
                return;
            }
            if (!vises.some(seVoit)) ecarts.push(`flèche ${k + 1} vers ce qui ne se voit pas : ` + vises.map((v) => nomDe(v) + couvrant(v)).join(' + '));
        });
        document.querySelectorAll('[id^="parcours-contour-extra-"]').forEach((x) => {
            if (x.hidden) return;
            const r = x.getBoundingClientRect();
            if (!surEcran(r)) return;
            const p = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, (r.left + r.right) / 2)), Math.min(innerHeight - 1, Math.max(0, (r.top + r.bottom) / 2)));
            if (p && p.closest('#parcours-bulle, .planif-palette-flottante')) ecarts.push('un contour posé sur ' + (p.closest('#parcours-bulle') ? 'la bulle' : 'une palette flottante') + ' (' + x.id + ')');
        });
        if (ecarts.length && (!reconfirmer || Date.now() - reconfirmer < 1000)) {
            if (!reconfirmer) reconfirmer = Date.now();
            juge = false; stable = null;   // à revoir dans une seconde, la page immobile de nouveau
            return;
        }
        const r = lire();
        r.jugees.push(nom);
        ecarts.forEach((e) => r.ecarts.push({ etape: nom, ecart: e }));
        ecrire(r);
    }, 150);
}

/** À poser une fois en tête d'un banc de parcours : les deux relevés pour chaque essai, jugés à la fin de l'essai. */
export function releverLaBulle(test) {
    test.beforeEach(async ({ page }) => { await page.addInitScript(installer); await page.addInitScript(installerOuvertures); });
    test.afterEach(async ({ page }, info) => {
        let r = { ecarts: [], vus: [] };
        let o = { jugees: [], nonJugees: [], ecarts: [] };
        try {
            r = await page.evaluate((cle) => JSON.parse(sessionStorage.getItem(cle) || '{"ecarts":[],"vus":[]}'), CLE);
            o = await page.evaluate((cle) => JSON.parse(sessionStorage.getItem(cle) || '{"jugees":[],"nonJugees":[],"ecarts":[]}'), CLE_OUV);
        } catch (e) { return; }
        info.annotations.push({ type: 'relevé de la bulle', description: `${r.vus.length} bulles relevées` });
        info.annotations.push({ type: 'relevé des ouvertures', description: `${o.jugees.length} ouvertures jugées, ${o.nonJugees.length} quittées avant` });
        // Un écart par bulle suffit à le dire.
        const parBulle = [...new Map(r.ecarts.map((e) => [e.etape, e])).values()];
        expect.soft(parBulle, 'la bulle couvre ses zones ou le contour alors qu’une place les laisse libres (ou plus que le moindre recouvrement)').toEqual([]);
        const parOuverture = [...new Map(o.ecarts.map((e) => [e.etape + e.ecart, e])).values()];
        expect(parOuverture, 'à l’ouverture d’une étape : une flèche vers ce qu’il faut toucher, rien vers ce qui ne se voit pas').toEqual([]);
    });
}

/** Les ouvertures d'étape jugées pendant l'essai, et leurs écarts. */
export async function ouverturesJugees(page) {
    return page.evaluate((cle) => JSON.parse(sessionStorage.getItem(cle) || '{"jugees":[],"nonJugees":[],"ecarts":[]}'), CLE_OUV);
}

/** Combien de fois le relevé a regardé les bulles dont le nom contient `fragment`. */
export async function foisRelevee(page, fragment) {
    return page.evaluate(([cle, f]) => {
        const r = JSON.parse(sessionStorage.getItem(cle) || '{}');
        return Object.entries(r.fois || {}).filter(([nom]) => nom.includes(f)).reduce((t, [, n]) => t + n, 0);
    }, [CLE, fragment]);
}

/** Les bulles relevées pendant l'essai (pour qu'un banc prouve qu'il a regardé). */
export async function bullesRelevees(page) {
    return page.evaluate((cle) => JSON.parse(sessionStorage.getItem(cle) || '{"ecarts":[],"vus":[]}').vus, CLE);
}
