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

/** À poser une fois en tête d'un banc de parcours : le relevé pour chaque essai, jugé à la fin de l'essai. */
export function releverLaBulle(test) {
    test.beforeEach(async ({ page }) => { await page.addInitScript(installer); });
    test.afterEach(async ({ page }, info) => {
        let r = { ecarts: [], vus: [] };
        try { r = await page.evaluate((cle) => JSON.parse(sessionStorage.getItem(cle) || '{"ecarts":[],"vus":[]}'), CLE); } catch (e) { return; }
        info.annotations.push({ type: 'relevé de la bulle', description: `${r.vus.length} bulles relevées` });
        // Un écart par bulle suffit à le dire.
        const parBulle = [...new Map(r.ecarts.map((e) => [e.etape, e])).values()];
        expect(parBulle, 'la bulle couvre ses zones ou le contour alors qu’une place les laisse libres (ou plus que le moindre recouvrement)').toEqual([]);
    });
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
