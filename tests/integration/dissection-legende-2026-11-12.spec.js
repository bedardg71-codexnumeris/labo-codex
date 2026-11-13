// =======================================================================
// LA LÉGENDE DE LA DISSECTION (12 nov. 2026) — dans un vrai WebKit, à 1180 × 820 et à 820 × 1180
// =======================================================================
// Relais de la conversation du Projet, 12 nov., 11 h 25 (la porte de l'aperçu passée par Grégoire le matin) :
//   L2 · la légende remplace le surligneur : rien à l'écran de la dissection ne dit « surligneur », « surligne »,
//        « surligné » ni « palette » (texte rendu et attributs lus), avant et après un étiquetage ; la consigne suit
//        l'appareil (souris, puis doigt dès un toucher) ;
//   L5 · les flèches d'étiquetage suivent le défilement de la légende (bornées à son cadre) ;
//   L6 · la flèche de la carte ne vise jamais une étiquette cachée : défilée hors du cadre par la personne, la carte vise
//        la pastille qui y mène ; un geste d'étiquetage ne la ramène pas (13 nov. 2026 : « la grille remonte ») ;
//   L7 · aucune pastille ne couvre un nom d'étiquette, à aucune position de la liste ; l'étiquette que l'aide désigne
//        est amenée entièrement visible, sous la pastille.
// Break-tests : voir le rapport du lot (`plans de travail/RAPPORT-2026-11-12-dissection-ipad.md`, second relais).
// Grilles FICTIVES ; noms d'étudiant·es fictifs (classe-de-banc.js).
import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, mettreLaClasseEnPlace, attendreEtape, contourSur, bulle, bulleNeCouvrePas, capture } from './harness/classe-de-banc.js';
import { flecheVers } from './harness/fleches-de-banc.js';
import { collerLExemple } from './harness/exemple-colle.js';

const DOSSIER = process.env.CAPTURES_PARCOURS || '';
const TAILLES = [[1180, 820], [820, 1180]];
const etape = (page, n, titre, opts) => attendreEtape(page, n, 9, titre, opts);
const norm = (t) => String(t).replace(/[  ]/g, ' ');
const geste = (page) => page.locator('#parcours-bulle .parcours-bulle-geste');
const etiquette = (type) => `#dissection-palette .dissection-etiquette[data-type="${type}"]`;

async function gesteEst(page, texte) {
    await expect.poll(async () => norm(await geste(page).textContent()), { message: 'la ligne du geste', timeout: 5000 }).toBe(texte);
}

/** Le sélecteur du premier morceau qui porte ce texte. */
async function morceau(page, texte) {
    const id = await page.evaluate((t) => {
        const b = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].find((x) => x.textContent === t);
        return b ? b.getAttribute('data-id') : null;
    }, texte);
    expect(id, 'morceau « ' + texte + ' »').toBeTruthy();
    return `#dissection-contenu .dissection-morceau[data-id="${id}"]`;
}

/** Un toucher de souris sur un morceau (appuyer, relâcher), comme un clic. */
async function toucher(page, texte) {
    const sel = await morceau(page, texte);
    await page.evaluate((s) => {
        const b = document.querySelector(s);
        b.scrollIntoView({ block: 'center', inline: 'center' });
        const r = b.getBoundingClientRect();
        const o = { bubbles: true, cancelable: true, pointerId: 3, pointerType: 'mouse', isPrimary: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
        b.dispatchEvent(new PointerEvent('pointerdown', o));
        b.dispatchEvent(new PointerEvent('pointerup', o));
    }, sel);
}

/** Une étiquette en main (si elle ne l'est pas), puis un toucher sur chaque morceau nommé. */
async function poser(page, type, textes) {
    if ((await page.locator(etiquette(type)).getAttribute('aria-pressed')) !== 'true') await page.click(etiquette(type));
    for (const t of textes) await toucher(page, t);
}

async function coller(page, html) {
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (k) => (k === 'text/html' ? h : '') } });
        zone.dispatchEvent(ev);
    }, html);
    await expect(page.locator('#materiel-dissection')).toBeVisible();
}

/** « Coller une autre grille », confirmé s'il le faut : retour à l'accueil. */
async function collerUneAutre(page) {
    const b = page.locator('#materiel-dissection [data-action="materielDissection.collerAutre"]');
    await b.click();
    if (await page.locator('#materiel-dissection').isVisible()) await b.click();
    await expect(page.locator('#materiel-accueil')).toBeVisible();
}

// La grille de la capture du 11 nov., refaite FICTIVE (et le dernier « / 5 » devenu « / 10 », pour qu'il soit unique).
const CAPTURE = '<table><tr><td colspan="3">Grille fictive d’analyse</td></tr>'
    + '<tr><td>Introduction</td><td>Sujet amené, posé, divisé</td><td>/ 5</td></tr>'
    + '<tr><td>Développement</td><td>Arguments et exemples</td><td>/ 30</td></tr>'
    + '<tr><td>Conclusion</td><td>Synthèse et ouverture</td><td>/ 10</td></tr></table>';

/** Le parcours lancé, à l'étape 1 (l'exemple offert). */
async function lancerEvaluer(page) {
    await page.evaluate(() => Assistance.parcours().find((p) => p.id === 'evaluer').lancer(0));
    await etape(page, 1, 'Ta grille', { focus: false });
}


const INTERDITS = /surligne|surligné|palette/i;

/** Ce que l'écran de la dissection donne à lire : son texte rendu, et les attributs lus, hors des identifiants. */
const aLEcran = (page) => page.evaluate(() => {
    const zone = document.getElementById('conception-materiel');
    const attrs = [...zone.querySelectorAll('[aria-label], [title], [placeholder]')].filter((e) => e.offsetParent)
        .flatMap((e) => ['aria-label', 'title', 'placeholder'].map((a) => e.getAttribute(a)).filter(Boolean));
    return [zone.innerText].concat(attrs).join(' | ');
});

/** Où est une étiquette par rapport au cadre de la légende : 'dedans', 'dessus', 'dessous' ou 'à cheval'. */
const placeDans = (page, type) => page.evaluate((t) => {
    const b = document.querySelector(`#dissection-palette .dissection-etiquette[data-type="${t}"]`).getBoundingClientRect();
    const p = document.getElementById('dissection-palette').getBoundingClientRect();
    if (b.top >= p.top - 0.5 && b.bottom <= p.bottom + 0.5) return 'dedans';
    if (b.bottom <= p.top) return 'dessus';
    if (b.top >= p.bottom) return 'dessous';
    return 'à cheval';
}, type);

const defile = (page) => page.evaluate(() => { const p = document.getElementById('dissection-palette'); return p.scrollHeight > p.clientHeight + 1; });

// ---------------------------------------------------------------------------------------------------------------
// L2 — la légende, nulle part le surligneur ; la consigne suit l'appareil
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`L2 · ${L} × ${H} : la légende ; aucun « surligneur » ni « palette » à l’écran ; la consigne suit l’appareil`, async ({ page }) => {
        await ouvrirEspaceVide(page, L, { hauteur: H });
        await page.evaluate(() => naviguerVers('conception', 'materiel'));
        expect(await aLEcran(page), 'l’accueil').not.toMatch(INTERDITS);
        await collerLExemple(page);
        await expect(page.locator('.dissection-legende-titre')).toHaveText('Légende');
        await expect(page.locator('#dissection-palette')).toHaveAttribute('aria-label', 'Légende');
        await expect(page.locator('#dissection-bandeau')).toBeHidden();   // 13 nov. 2026 : la consigne est dans la carte ; rien en main, le bandeau ne s'affiche pas
        expect(await page.evaluate(() => window.materielDissection.consignes().etapes[0])).toBe('Touche une étiquette dans la légende.');
        expect(await page.evaluate(() => window.materielDissection.consignes().etapes[1])).toBe('Touche les morceaux de ta grille qu’elle désigne : ils prennent sa couleur. Pour en étiqueter plusieurs d’un coup, glisse dessus. Touche un morceau déjà étiqueté pour retirer son étiquette.');
        expect(await aLEcran(page), 'la dissection ouverte').not.toMatch(INTERDITS);
        await toucher(page, 'Journal de lecture');   // sans étiquette choisie
        await expect(page.locator('#dissection-statut')).toHaveText('Touche une étiquette dans la légende.');
        await page.click(etiquette('critere'));
        await expect(page.locator('#dissection-statut')).toHaveText('Étiquette « Critère » choisie.');   // 13 nov. 2026 : le fait reste, la consigne est dans la carte
        await toucher(page, 'L’étudiant·e résume l’œuvre avec justesse');
        expect(await aLEcran(page), 'une étiquette choisie et posée').not.toMatch(INTERDITS);
        await capture(page, DOSSIER, `l2-legende-${L}x${H}`);
        // Un doigt posé dans l'application : la phrase du doigt, à la prochaine ouverture (pas sous le doigt : la grille bougerait).
        const consigne = () => page.evaluate(() => window.materielDissection.consignes().etapes[1]);   // 13 nov. 2026 : la consigne se lit dans la carte
        await page.evaluate(() => {
            const b = document.querySelector('#dissection-contenu .dissection-morceau');
            b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 31, pointerType: 'touch', isPrimary: true }));
            b.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, cancelable: true, pointerId: 31, pointerType: 'touch', isPrimary: true }));
        });
        expect(await consigne()).toContain('Pour en étiqueter plusieurs d’un coup, glisse dessus.');
        await collerUneAutre(page);
        await page.evaluate(() => {
            const b = document.querySelector('#materiel-accueil [data-action="materiel.ouvrirExemple"][data-param="exercice"]');
            b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 32, pointerType: 'touch', isPrimary: true }));
            b.click();
        });
        expect(await consigne()).toContain('Pour en étiqueter plusieurs d’un coup, garde le doigt posé un instant, puis glisse.');
    });
}

// ---------------------------------------------------------------------------------------------------------------
// L5 — les flèches d'étiquetage suivent le défilement de la légende
// ---------------------------------------------------------------------------------------------------------------
test('L5 · 1180 × 820 : les flèches d’étiquetage suivent le défilement de la légende, bornées à son cadre', async ({ page }) => {
    await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
    await page.evaluate(() => naviguerVers('conception', 'materiel'));
    await collerLExemple(page);
    expect(await defile(page), 'à 1180 × 820, la légende défile').toBe(true);
    await poser(page, 'points', ['2', '3']);
    // Le départ de la première flèche, et celui qu'elle doit avoir : le bord de l'étiquette en main, borné au cadre.
    const mesure = () => page.evaluate(() => {
        const p = document.querySelector('#dissection-traits path');
        if (!p) return null;
        const n = p.getAttribute('d').match(/-?\d+(\.\d+)?/g).map(Number);
        const a = document.getElementById('dissection-atelier').getBoundingClientRect();
        const it = document.querySelector('#dissection-palette .dissection-etiquette[data-type="points"]').getBoundingClientRect();
        const pr = document.getElementById('dissection-palette').getBoundingClientRect();
        const haut = Math.min(Math.max(it.top, pr.top), pr.bottom) - a.top, bas = Math.max(Math.min(it.bottom, pr.bottom), pr.top) - a.top;
        return { y: n[1], haut, bas };
    });
    const dedans = (m) => m && m.y >= m.haut - 1 && m.y <= m.bas + 1;
    await expect.poll(async () => dedans(await mesure()), { message: 'la flèche part de l’étiquette', timeout: 3000 }).toBe(true);
    const avant = (await mesure()).y;
    for (const [pas, nom] of [[120, 'défilée vers le bas'], [10000, 'défilée tout en bas']]) {
        await page.evaluate((d) => { document.getElementById('dissection-palette').scrollTop += d; }, pas);
        await expect.poll(async () => { const m = await mesure(); return dedans(m) ? 'suit' : JSON.stringify(m); },
            { message: 'légende ' + nom + ' : la flèche part de l’étiquette, bornée au cadre', timeout: 3000 }).toBe('suit');
    }
    expect((await mesure()).y, 'la flèche a bougé avec la légende').not.toBe(avant);
});

// ---------------------------------------------------------------------------------------------------------------
// L6 — la carte ne vise jamais une étiquette cachée
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`L6 · ${L} × ${H} : la flèche de la carte ne vise jamais une étiquette cachée ; un geste d’étiquetage ne la ramène pas`, async ({ page }) => {
        test.setTimeout(180000);
        await ouvrirEspaceVide(page, L, { hauteur: H });
        await mettreLaClasseEnPlace(page);
        await lancerEvaluer(page);
        await bulle(page).getByRole('button', { name: 'Passer à ma grille' }).click();
        await coller(page, CAPTURE);
        await poser(page, 'titre', ['Grille fictive d’analyse']);
        await poser(page, 'critere', ['Introduction', 'Développement', 'Conclusion']);
        await poser(page, 'ponderation', ['/ 5', '/ 30']);
        await poser(page, 'poids', ['/ 10']);
        const phrase = (m) => `« Poids » sert aux listes de codes (ce que pèse un code posé) : pour le poids d’un critère, prends « Pondération », puis touche « ${m} ».`;
        await gesteEst(page, phrase('/ 10'));
        await expect.poll(() => placeDans(page, 'ponderation'), { message: 'désignée, « Pondération » est amenée' }).toBe('dedans');
        await contourSur(page, etiquette('ponderation'));
        await flecheVers(page, etiquette('ponderation'), 'la désignée');
        if (!(await defile(page))) return;   // une légende qui tient entière : rien ne s'y cache

        // La personne fait défiler la légende jusqu'en bas (vers « Poids ») : « Pondération » sort du cadre, par le haut.
        await page.evaluate(() => { const p = document.getElementById('dissection-palette'); p.scrollTop = p.scrollHeight; });
        await expect.poll(() => placeDans(page, 'ponderation')).toBe('dessus');
        // Un défilement seul ne la ramène pas (la personne garde la main), et la carte vise la pastille qui y mène.
        await contourSur(page, '#dissection-palette-haut');
        await flecheVers(page, '#dissection-palette-haut', 'cachée, la pastille');
        const versCachee = await page.evaluate(() => {
            const r = document.querySelector('#dissection-palette .dissection-etiquette[data-type="ponderation"]').getBoundingClientRect();
            return [...document.querySelectorAll('#parcours-fleches g.parcours-fleche')].some((g) => {
                const n = g.getAttribute('data-trace').match(/-?\d+(\.\d+)?/g).map(Number), x = n[4], y = n[5];
                return Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom)) <= 12;
            });
        });
        expect(versCachee, 'aucune flèche ne vise « Pondération » cachée').toBe(false);
        expect(await placeDans(page, 'ponderation'), 'le défilement de la personne tient').toBe('dessus');
        await capture(page, DOSSIER, `l6-cachee-${L}x${H}`);

        // « Poids » repris en bas de la légende, posé sur un autre « / N » : l'étiquette désignée ne change pas
        // (« Pondération »). 13 nov. 2026 (rapport de Grégoire, « la grille remonte ») : un geste d'étiquetage ne ramène plus
        // rien ; la légende reste où la personne l'a laissée, et la carte vise toujours la pastille qui mène à l'étiquette.
        const legendeAvant = await page.evaluate(() => document.getElementById('dissection-palette').scrollTop);
        await poser(page, 'poids', ['/ 5']);
        await gesteEst(page, phrase('/ 5'));
        await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(ok, 250)))));
        expect(await placeDans(page, 'ponderation'), 'après le geste, la légende n’a pas bougé : « Pondération » reste cachée').toBe('dessus');
        expect(Math.abs(await page.evaluate(() => document.getElementById('dissection-palette').scrollTop) - legendeAvant), 'la légende n’a pas défilé').toBeLessThanOrEqual(1);
        await contourSur(page, '#dissection-palette-haut');
        await flecheVers(page, '#dissection-palette-haut', 'après le geste, la pastille');
        await capture(page, DOSSIER, `l6-apres-le-geste-${L}x${H}`);
    });
}

// ---------------------------------------------------------------------------------------------------------------
// L7 — aucune pastille ne couvre un nom d'étiquette
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`L7 · ${L} × ${H} : aucune pastille ne couvre un nom d’étiquette, à aucune position ; la désignée est entière`, async ({ page }) => {
        test.setTimeout(180000);
        await ouvrirEspaceVide(page, L, { hauteur: H });
        await mettreLaClasseEnPlace(page);
        await lancerEvaluer(page);
        await bulle(page).getByRole('button', { name: "Faire l'exercice soi-même" }).click();
        await gesteEst(page, 'Ta grille n’a pas encore de nom : prends « Titre », puis touche son nom dans ta grille.');
        // À chaque position de la liste, la partie visible de chaque nom ne touche aucune pastille visible.
        const couverts = () => page.evaluate(async () => {
            const p = document.getElementById('dissection-palette'), pr = p.getBoundingClientRect();
            const out = [];
            for (let st = 0; st <= p.scrollHeight; st += 16) {
                p.scrollTop = st;
                await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));   // les pastilles à jour
                const ps = ['dissection-palette-haut', 'dissection-palette-bas'].map((id) => document.getElementById(id))
                    .filter((x) => x && getComputedStyle(x).visibility === 'visible').map((x) => x.getBoundingClientRect());
                document.querySelectorAll('#dissection-palette .dissection-etiquette-nom').forEach((n) => {
                    const r = n.getBoundingClientRect();
                    const v = { top: Math.max(r.top, pr.top), bottom: Math.min(r.bottom, pr.bottom), left: r.left, right: r.right };
                    if (v.bottom - v.top < 1) return;
                    if (ps.some((q) => q.left < v.right && q.right > v.left && q.top < v.bottom && q.bottom > v.top)) out.push(st + ' : ' + n.textContent);
                });
                if (st >= p.scrollHeight - p.clientHeight) break;
            }
            p.scrollTop = 0;
            return out;
        });
        expect(await couverts(), 'aucun nom sous une pastille').toEqual([]);
        if (!(await defile(page))) return;
        // « Points » en main, la liste défilée tout en bas, « 2 » touché : l'aide désigne « Critère », en haut ; amenée,
        // elle est entière dans le cadre, donc sous la pastille « ▲ … plus haut », jamais dessous.
        await poser(page, 'titre', ['Journal de lecture']);
        await page.click(etiquette('points'));
        await page.evaluate(() => { const p = document.getElementById('dissection-palette'); p.scrollTop = p.scrollHeight; });
        await toucher(page, '2');
        await gesteEst(page, '« 2 » n’a aucun critère dans sa rangée : prends « Critère », puis touche « L’étudiant·e résume l’œuvre avec… ».');
        await expect.poll(() => placeDans(page, 'critere'), { message: 'la désignée, entière dans le cadre' }).toBe('dedans');
        const sousLaPastille = await page.evaluate(() => {
            const c = document.querySelector('#dissection-palette .dissection-etiquette[data-type="critere"]').getBoundingClientRect();
            const h = document.getElementById('dissection-palette-haut');
            return getComputedStyle(h).visibility !== 'visible' || h.getBoundingClientRect().bottom <= c.top + 0.5;
        });
        expect(sousLaPastille, '« Critère » est sous la pastille, pas dessous').toBe(true);
        await contourSur(page, etiquette('critere'));
        await flecheVers(page, etiquette('critere'), 'la désignée');
        await capture(page, DOSSIER, `l7-critere-${L}x${H}`);
    });
}
