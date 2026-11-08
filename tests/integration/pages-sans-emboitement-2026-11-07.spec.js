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
        // La pastille pleine est réservée aux étapes à faire : les chiffres de l'explication n'ont pas de disque
        // (leur contraste sur le fond de la page est mesuré juste dessous, avec les autres textes).
        const explication = await page.$$eval('.travaux-zero-state .etape-numero', (els) => els.map((e) => ({
            chiffre: e.textContent.trim(), fond: getComputedStyle(e).backgroundColor, rayon: getComputedStyle(e).borderTopLeftRadius
        })));
        expect(explication.map((e) => e.chiffre), 'le bloc d\'explication est à l\'écran (démo, aide active)').toEqual(['1', '2', '3']);
        for (const e of explication) expect(e.fond, `le chiffre ${e.chiffre} de l'explication n'a pas de disque`).toMatch(/^(transparent|rgba\(0, 0, 0, 0\))$/);
        expect(await textesSousLeSeuil(page, '#evaluations-importer'), 'contrastes ≥ 4,5:1 sur le fond de la page').toEqual([]);
    });
}

// ─── Les pages de l'inventaire (§ 2) : jamais de carte dans une carte ───────────────────────────────
// Même définition du cadre que l'inventaire (bloc d'au moins 160 × 40 px : ombre, bordure sur trois côtés ou plus,
// ou fond distinct de ce qu'il y a derrière). Accordéons ouverts ; en Conception, la première fiche ouverte.
// Cadres à fonction (inventaire ; question 1 : les alertes et le guidage de la démo restent).
const FONCTION = ['input', 'select', 'textarea', 'button', 'table', 'thead', 'tbody', 'tr', 'td', 'th', '.travaux-drop-zone', '.zone-depot', '[class*="drop"]',
  '[class*="alerte"]', '[class*="info-box"]', '[class*="guidage"]', '[class*="demo-"]', '.accordeon-header', '.carte-titre-bleu', '.modal', '[role="dialog"]',
  '.planif-wrapper', '[class*="palette"]', '.btn', '[class*="barre-indice"]', '[class*="calendrier-mois"]', '.badge', '[class*="pastille"]', 'canvas', 'svg', 'img', 'label', 'option', 'nav'];
// Restent, et pourquoi : les mois du calendrier et les niveaux d'une échelle (des graphiques, leur couleur dit
// quelque chose), les bandes de titre (elles font partie de leur carte), les conteneurs de tableau, les champs
// personnalisés, la fenêtre du choix de couleur, la zone de dépôt du partage.
const RESTENT = /^(div\.calendrier-conteneur|h3\.calendrier-titre-mois|div\.outil-carte-header|div\.bilan-bloc-header|div#v2-listeEtudiants|div#tableEtudiantsListe|div\.champ-perso|div\.travaux-retro-couleur-popover|div#partage-zone-depot|div  ⊂  div#apercuEchelleNiveaux)/;
const EMBOITEES = ['evaluations/evaluations-liste', 'evaluations/evaluations-exporter', 'calendrier/calendrier-trimestre', 'calendrier/calendrier-vue',
    'suivi/suivi-liste', 'suivi/suivi-saisie', 'suivi/suivi-profil', 'suivi/suivi-animation', 'labo/labo-accompagnement', 'labo/labo-comparateur',
    'labo/labo-bilan', 'reglages/reglages-preferences', 'reglages/reglages-donnees', 'conception/conception-productions',
    'conception/conception-grille-criteres', 'conception/conception-echelle-performance', 'conception/conception-pratiques-notation',
    'aide/aide-codex-archives', 'accueil/section-accueil'];
for (const clair of [false, true]) {
    test(`les ${EMBOITEES.length} pages de l'inventaire (${clair ? 'clair' : 'sombre'}) : jamais de carte dans une carte`, async ({ page }) => {
        test.setTimeout(300000);
        await ouvrir(page, 1180, 900);
        const echecs = [];
        for (const cible of EMBOITEES) {
            const [s, ss] = cible.split('/');
            await page.evaluate(([s, ss, clair]) => { document.body.classList.toggle('mode-clair', clair); afficherSection(s); if (ss !== 'section-accueil') afficherSousSection(ss); }, [s, ss, clair]);
            await attendreRepos(page);
            await page.evaluate((ss) => {
                const menu = document.querySelector(`#${ss} select.rangee-selection-menu`);
                const opt = menu && [...menu.options].find((o) => o.value && !o.disabled);
                if (opt) { menu.value = opt.value; menu.dispatchEvent(new Event('change', { bubbles: true })); }
            }, ss);
            await attendreRepos(page);
            await page.evaluate((ss) => { document.querySelectorAll(`#${ss} .accordeon.ferme`).forEach((c) => c.classList.remove('ferme')); document.querySelectorAll(`#${ss} details`).forEach((d) => { d.open = true; }); }, ss);
            await attendreRepos(page);
            const r = await page.evaluate(([ss, FONCTION]) => {
      const opaque = (c) => !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(c);
      const fondEffectif = (e) => { for (let p = e; p; p = p.parentElement) { const c = getComputedStyle(p).backgroundColor; if (opaque(c)) return c; } return ''; };
      const estCadre = (e) => {
        const b = e.getBoundingClientRect(); if (b.width < 160 || b.height < 40) return false;
        const cs = getComputedStyle(e);
        if (cs.boxShadow !== 'none') return true;
        const bords = ['Top', 'Right', 'Bottom', 'Left'].filter((c) => parseFloat(cs[`border${c}Width`]) > 0 && cs[`border${c}Style`] !== 'none' && !/, 0\)$/.test(cs[`border${c}Color`])).length;
        if (bords >= 3) return true;
        return opaque(cs.backgroundColor) && cs.backgroundColor !== fondEffectif(e.parentElement);
      };
      const fonction = (e) => FONCTION.some((f) => e.matches(f));
      const nom = (e) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${[...e.classList].length ? '.' + [...e.classList].join('.') : ''}`;
      const out = [];
      for (const e of document.querySelectorAll(`#${ss} *`)) {
        if (!e.getClientRects().length || !estCadre(e) || fonction(e) || e.closest(FONCTION.join(','))?.contains(e) && e.closest(FONCTION.join(',')) !== e && false) continue;
        if (e.closest('[class*="alerte"],[class*="info-box"],[class*="guidage"],table,.modal,[role="dialog"],.planif-wrapper')) continue;
        const chaine = [];
        for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) if (estCadre(p) && !fonction(p)) chaine.push(nom(p));
        if (chaine.length) out.push(`${nom(e)}  ⊂  ${chaine.join(' ⊂ ')}  « ${(e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)} »`);
      }
      return out;
    }, [ss, FONCTION]);
            for (const l of r) if (!RESTENT.test(l)) echecs.push(`${cible} · ${l}`);
        }
        expect(echecs).toEqual([]);
    });
}

// ─── Captures pour Grégoire (CAPTURES_LOT4=<dossier>, PREFIXE_LOT4=avant|apres) ─────────────
const CAPTURES = process.env.CAPTURES_LOT4;
const PREFIXE = process.env.PREFIXE_LOT4 || 'apres';
const PAGES = [
    ['evaluations', 'evaluations-importer', 'evaluation-preparer'],
    ['evaluations', 'evaluations-liste', 'evaluation-liste'],
    ['calendrier', 'calendrier-trimestre', 'cadre-trimestre'],
    ['conception', 'conception-productions', 'conception-productions'],
    ['suivi', 'suivi-saisie', 'suivi-presences'],
    ['suivi', 'suivi-groupe', 'suivi-groupe'],
    ['labo', 'labo-accompagnement', 'labo-observation'],
    ['labo', 'labo-rythme', 'labo-rythme'],
    ['reglages', 'reglages-donnees', 'reglages-donnees'],
    ['aide', 'aide-codex-archives', 'aide-codex-archives'],
    ['accueil', null, 'accueil']
].filter(([, ss]) => !process.env.PAGES_LOT4 || process.env.PAGES_LOT4.split(',').includes(ss || 'accueil'));
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

// ─── Toutes les pages : le panneau commun ne dessine plus rien, le texte sur la page tient 4,5:1 ──────────
const TOUTES = [
    ['accueil', null],
    ...['conception-materiel', 'conception-carte', 'conception-productions', 'conception-grille-criteres', 'conception-echelle-performance',
        'conception-retroactions', 'conception-pratiques-notation'].map((ss) => ['conception', ss]),
    ...['calendrier-trimestre', 'calendrier-vue'].map((ss) => ['calendrier', ss]),
    ...['suivi-groupe', 'suivi-liste', 'suivi-saisie', 'suivi-profil', 'suivi-interventions', 'suivi-rencontres', 'suivi-animation'].map((ss) => ['suivi', ss]),
    ...['evaluations-liste', 'evaluations-importer', 'evaluations-annoter', 'evaluations-exporter'].map((ss) => ['evaluations', ss]),
    ...['labo-accompagnement', 'labo-modelisation', 'labo-comparateur', 'labo-rythme', 'labo-etudes', 'labo-bilan', 'labo-longitudinal'].map((ss) => ['labo', ss]),
    ...['reglages-preferences', 'reglages-donnees', 'reglages-a-propos'].map((ss) => ['reglages', ss]),
    ...['aide-commencer', 'aide-cadre', 'aide-conception', 'aide-evaluation', 'aide-suivi', 'aide-labo', 'aide-codex-archives', 'aide-reference'].map((ss) => ['aide', ss])
];
for (const clair of [false, true]) {
    test(`les ${TOUTES.length} pages (${clair ? 'clair' : 'sombre'}) : aucun panneau autour du contenu, le texte posé sur la page à 4,5:1 au moins`, async ({ page }) => {
        test.setTimeout(240000);
        await ouvrir(page, 1180, 900);
        const echecs = [];
        for (const [s, ss] of TOUTES) {
            await aller(page, s, ss, clair);
            await attendreRepos(page);
            const racine = ss ? `#${ss}` : '#section-accueil';
            const panneau = await page.evaluate((racine) => {
                const el = document.querySelector(racine);
                return ['.conteneur', '.contenu', '.section.active'].map((sel) => document.querySelector(sel)).concat(el)
                    .filter((e) => { if (!e) return false; const cs = getComputedStyle(e); return !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.backgroundColor) || cs.boxShadow !== 'none'; })
                    .map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join('.')}`);
            }, racine);
            if (panneau.length) echecs.push(`${racine} · panneau : ${panneau.join(', ')}`);
            for (const t of await textesSousLeSeuil(page, racine)) echecs.push(`${racine} · ${t}`);
        }
        expect(echecs).toEqual([]);
    });
}
