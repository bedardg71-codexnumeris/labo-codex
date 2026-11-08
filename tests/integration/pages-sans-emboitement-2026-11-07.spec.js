import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

// =======================================================================
// LOT 4 « LES PAGES SANS EMBOÎTEMENT » — 7 NOVEMBRE 2026 (esquisse 68)
// =======================================================================
// Consigne : plans de travail/CONSIGNE-2026-11-07-chaine-des-quatre-lots.md, § Lot 4.
// Inventaire approuvé : plans de travail/INVENTAIRE-2026-11-07-pages-sans-emboitement.md.
// La géométrie (aucun cadre sans fonction autour du contenu) et le contraste se mesurent ici ;
// l'apparence se juge sur capture (CAPTURES_LOT4=<dossier>).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

async function ouvrir(page, largeur, hauteur) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.setViewportSize({ width: largeur, height: hauteur });
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await attendreApplication(page);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await attendreApplication(page);
    await page.evaluate(() => activerModeDemo());
    await page.waitForFunction(() => window.estEnModeDemo() && window.dbReady === true, null, { timeout: 30000 });
}

const aller = (page, section, sous, clair = false) => page.evaluate(([s, ss, clair]) => {
    document.body.classList.toggle('mode-clair', clair);
    afficherSection(s); if (ss) afficherSousSection(ss); window.scrollTo(0, 0);
}, [section, sous, clair]);

/**
 * Les cadres autour d'un élément, de lui (exclu) jusqu'au <body> (exclu) : tout ancêtre qui a un fond
 * non transparent, une bordure visible ou une ombre. Même définition que l'inventaire (§ « Comment c'est
 * mesuré »), sans le seuil de taille : un ancêtre du contenu est toujours plus grand que lui.
 */
const cadresAutour = (page, sel) => page.evaluate((sel) => {
    const out = [];
    let e = document.querySelector(sel).parentElement;
    while (e && e !== document.body) {
        const cs = getComputedStyle(e);
        const fond = !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.backgroundColor) || cs.backgroundImage !== 'none';
        const bordure = ['Top', 'Right', 'Bottom', 'Left'].filter((c) => parseFloat(cs[`border${c}Width`]) > 0
            && cs[`border${c}Style`] !== 'none' && !/rgba\(.*, 0\)$/.test(cs[`border${c}Color`])).length >= 3;
        const ombre = cs.boxShadow !== 'none';
        if (fond || bordure || ombre) out.push(`${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${[...e.classList].join('.')}`);
        e = e.parentElement;
    }
    return out;
}, sel);

/**
 * Les textes posés sur le fond de la page, sous `racine`, dont le contraste est sous le seuil WCAG AA
 * (4,5:1 ; 3:1 pour le gros texte). « Sur le fond de la page » : le premier ancêtre opaque est le <body>
 * (les fonds translucides entre les deux sont mélangés par-dessus). Un texte sur son propre fond (une
 * pastille, un bouton, une alerte) n'est pas l'objet de la consigne et ne bouge pas avec le panneau.
 */
const textesSousLeSeuil = (page, racine) => page.evaluate((racine) => {
    const rgba = (s) => { const m = s.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2], m.length > 3 ? m[3] : 1]; };
    const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const melange = (haut, bas) => [0, 1, 2].map((i) => haut[i] * haut[3] + bas[i] * (1 - haut[3])).concat(1);
    const fondDe = (el) => {
        const couches = [];
        let opaque = null;
        for (let e = el; e; e = e.parentElement) {
            const c = rgba(getComputedStyle(e).backgroundColor);
            if (c[3] > 0) { couches.push(c); if (c[3] >= 1) { opaque = e; break; } }
        }
        let f = [255, 255, 255, 1];
        for (const c of couches.reverse()) f = melange(c, f);
        return { f, surLaPage: opaque === document.body };
    };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
    const echecs = [];
    for (const el of document.querySelectorAll(`${racine} *`)) {
        if (!el.getClientRects().length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
        const taille = parseFloat(cs.fontSize), gras = parseInt(cs.fontWeight, 10) >= 700;
        const seuil = (taille >= 24 || (gras && taille >= 18.66)) ? 3 : 4.5;
        const fond = fondDe(el);
        if (!fond.surLaPage) continue;
        const r = ratio(melange(rgba(cs.color), fond.f), fond.f);
        if (r < seuil) echecs.push(`${r.toFixed(2)} « ${el.textContent.trim().slice(0, 40)} » (${cs.color})`);
    }
    return echecs;
}, racine);

for (const clair of [false, true]) {
    test(`Préparer (${clair ? 'clair' : 'sombre'}) : la zone de dépôt pose sur le fond de la page, sur toute la largeur du contenu`, async ({ page }) => {
        await ouvrir(page, 1180, 900);
        await aller(page, 'evaluations', 'evaluations-importer', clair);
        await page.waitForSelector('#travaux-drop-zone');
        expect(await cadresAutour(page, '#travaux-drop-zone'), 'aucun cadre entre la zone de dépôt et la page').toEqual([]);
        const g = await page.evaluate(() => {
            const zone = document.getElementById('travaux-drop-zone').getBoundingClientRect();
            const page = document.getElementById('evaluations-importer').getBoundingClientRect();
            const cs = getComputedStyle(document.getElementById('travaux-drop-zone'));
            return { zone: zone.width, page: page.width, pointilles: cs.borderTopStyle };
        });
        expect(Math.abs(g.zone - g.page), 'la zone de dépôt prend toute la largeur du contenu').toBeLessThanOrEqual(1);
        expect(g.pointilles, 'la zone de dépôt garde ses pointillés').toBe('dashed');
        expect(await page.locator('.pipeline-etape-numero').first().textContent()).toBe('1');
        expect(await textesSousLeSeuil(page, '#evaluations-importer'), 'contrastes ≥ 4,5:1 sur le fond de la page').toEqual([]);
    });
}

// ─── Captures pour Grégoire (CAPTURES_LOT4=<dossier>, PREFIXE_LOT4=avant|apres) ─────────────
const CAPTURES = process.env.CAPTURES_LOT4;
const PREFIXE = process.env.PREFIXE_LOT4 || 'apres';
const PAGES = [
    ['evaluations', 'evaluations-importer', 'evaluation-preparer']
];
for (const largeur of [1180, 820]) {
    for (const clair of [false, true]) {
        test(`captures · ${largeur} px, ${clair ? 'clair' : 'sombre'}`, async ({ page }) => {
            test.skip(!CAPTURES, 'CAPTURES_LOT4 non défini');
            test.setTimeout(120000);
            await ouvrir(page, largeur, 900);
            for (const [s, ss, nom] of PAGES) {
                await aller(page, s, ss, clair);
                await attendreRepos(page);
                await page.evaluate(() => window.transitions && window.transitions.fermerBandeau());
                await page.screenshot({ path: path.join(CAPTURES, `${nom}-${largeur}-${clair ? 'clair' : 'sombre'}-${PREFIXE}.png`), clip: { x: 0, y: 0, width: largeur, height: 900 } });
            }
        });
    }
}
