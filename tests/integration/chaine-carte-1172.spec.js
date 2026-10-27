import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1172 (26 oct. 2026) — LA CHAÎNE D'ÉTAPES DE LA CARTE D'ALIGNEMENT.
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-26-chaine-carte-alignement.md.
//
// Dans le vrai index.html, Conception › Carte d'alignement :
//   · la chaîne paraît entre la barre d'outils et le canevas, sur une carte vide (le premier contact) et sur
//     une carte garnie ;
//   · elle suit l'ajout d'un bloc par la palette, puis Annuler et Rétablir ;
//   · chacun de ses sept clics ouvre le guide à la page de l'étape (ou l'y mène, s'il est ouvert), et le
//     stockage est le même avant et après ; le guide ne couvre pas la chaîne ;
//   · la case « Afficher les chaînes d'étapes » décochée la masque ;
//   · à 820 px, elle tient sans faire déborder la page, et ce qu'elle prend au canevas est mesuré.
// Noms fictifs. Contexte Playwright neuf à chaque essai.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirCarte(page, largeur = 1440, hauteur = 900) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('dialog', async (d) => { await d.accept(); });
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await pause(page, 800);
    await page.evaluate(() => naviguerVers('conception', 'carte'));
    await page.waitForFunction(() => window.planificationCarte && window.planificationCarte.etat.initialise === true, null, { timeout: 10000 });
    await page.evaluate(() => { document.getElementById('transition-bandeau')?.remove(); });
    await pause(page, 500);
    return erreurs;
}

/** Une carte garnie, noms fictifs : une compétence, deux idées maîtresses, deux leçons (dont un clone), trois objectifs… */
async function semerCarte(page) {
    await page.evaluate(() => {
        const n = (id, type, titre, x, y, extra = {}) => ({ id, type, titre, description: '', x, y, parent: null,
            enfants: [], metadata: {}, cloneSourceId: null, ...extra });
        const noeuds = [
            n('planif-1', 'competence', 'Analyser des textes littéraires', 0, 0),
            n('planif-2', 'idee-maitresse', 'Le texte construit un sens', 0, 120),
            n('planif-3', 'idee-maitresse', 'La forme porte le propos', 260, 120),
            n('planif-4', 'lecon', 'La figure de style', 0, 260, { enfants: ['planif-6', 'planif-7', 'planif-8'],
                metadata: { semaine: 2, objectifs: [{ id: 'obj-a', texte: 'Repérer une figure' }, { id: 'obj-b', texte: 'Nommer son effet' }] } }),
            n('planif-5', 'lecon', 'Le point de vue', 400, 260, { metadata: { semaine: 3, objectifs: [{ id: 'obj-c', texte: 'Comparer deux narrateurs' }, { id: 'obj-d', texte: '  ' }] } }),
            n('planif-6', 'conceptuelle', 'La métaphore', 0, 320, { parent: 'planif-4' }),
            n('planif-7', 'modelisation', 'Lecture commentée', 0, 380, { parent: 'planif-4' }),
            n('planif-8', 'evaluation', 'Repérage formatif', 0, 440, { parent: 'planif-4' }),
            n('planif-9', 'modelisation', 'Lecture commentée', 400, 380, { cloneSourceId: 'planif-7' })
        ];
        const pd = window.planificationDonnees;
        const index = pd.getIndex();
        pd.sauvegarderCarte(index.active, { compteur: 20, compteurLiens: 0, noeuds, liens: [] });
        window.planificationCarte.chargerCarte(index.active);
    });
    await pause(page, 400);
}

/** La chaîne lue dans la page : visible, libellé, et par étape réglée, ton, info. */
const lireChaine = (page) => page.evaluate(() => {
    const nav = document.getElementById('planif-chaine');
    const etapes = {};
    nav.querySelectorAll('.bc-etape').forEach((b) => {
        etapes[b.dataset.etape] = {
            reglee: b.classList.contains('bc-complet'),
            ton: b.classList.contains('bc-attention') || b.classList.contains('bc-critique'),
            info: b.querySelector('.bc-info').textContent
        };
    });
    return { visible: nav.getClientRects().length > 0, ids: Object.keys(etapes), etapes, aria: nav.getAttribute('aria-label') };
});

const infos = (chaine) => Object.fromEntries(Object.entries(chaine.etapes).map(([k, v]) => [k, v.info]));

/** Tout le stockage lisible de façon synchrone, clé par clé (les données des modules). */
const instantane = (page) => page.evaluate(() =>
    JSON.stringify(db.keysSync().sort().map((k) => [k, db.getSync(k, null)])));

const PAGES = {
    competence: 'Commence par le pourquoi', 'idees-maitresses': 'Ce que l’étudiant doit retenir',
    lecons: 'Organise dans le temps', objectifs: 'Ce que la leçon vise', connaissances: 'Ce que tu enseignes concrètement',
    activites: 'Comment l’étudiant va apprendre', evaluations: 'Vérifie que c’est acquis'
};

test.describe('#1172 · la chaîne d\'étapes de la carte', () => {
    test('carte vide : sept étapes « à poser », entre la barre et le canevas ; chaque clic ouvre la page du guide sans rien écrire', async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await ouvrirCarte(page);
        const c = await lireChaine(page);
        expect(c.visible).toBe(true);
        expect(c.aria).toBe('Étapes de la carte');
        expect(c.ids).toEqual(['competence', 'idees-maitresses', 'lecons', 'objectifs', 'connaissances', 'activites', 'evaluations']);
        expect(Object.values(c.etapes).every(e => !e.reglee && !e.ton)).toBe(true);
        expect(infos(c)).toEqual({ competence: 'à poser', 'idees-maitresses': 'à poser', lecons: 'à poser', objectifs: 'à écrire',
            connaissances: 'à poser', activites: 'à poser', evaluations: 'à poser' });

        // Sa place : sous la barre d'outils, au-dessus de la zone du canevas, sans les chevaucher.
        const place = await page.evaluate(() => {
            const r = (s) => document.querySelector(s).getBoundingClientRect();
            return { barre: r('#section-conception .planif-header').bottom, haut: r('#planif-chaine').top,
                bas: r('#planif-chaine').bottom, zone: r('#planif-zone-wrapper').top };
        });
        expect(Math.round(place.haut)).toBeGreaterThanOrEqual(Math.round(place.barre));
        expect(Math.round(place.zone)).toBeGreaterThanOrEqual(Math.round(place.bas));

        // Les sept clics : le guide fermé s'ouvre à la page ; ouvert, il y est mené. Rien n'est écrit.
        const avant = await instantane(page);
        for (const [id, titre] of Object.entries(PAGES)) {
            await page.locator(`#planif-chaine .bc-etape[data-etape="${id}"]`).click();
            await pause(page, 150);
            await expect(page.locator('#planif-guide-panel')).toBeVisible();
            await expect(page.locator('#planif-guide-panel .planif-guide-titre'), id).toHaveText(titre);
            await expect(page.locator('#planif-guide-panel .planif-guide')).toHaveCount(1);
        }
        // Fermé puis rouvert par la chaîne : à la page, et le bouton « Guide » de la barre rouvre la page 1.
        await page.locator('#planif-guide-panel .planif-guide-panel-fermer').click();
        await page.locator('#planif-chaine .bc-etape[data-etape="objectifs"]').click();
        await expect(page.locator('#planif-guide-panel .planif-guide-page-num')).toHaveText('Page 5 / 9');
        await page.locator('#planif-guide-panel .planif-guide-panel-fermer').click();
        await page.locator('#planif-palette-aide-btn').click();
        await expect(page.locator('#planif-guide-panel .planif-guide-page-num')).toHaveText('Page 1 / 9');
        expect(await instantane(page), 'les clics de la chaîne n\'écrivent rien').toBe(avant);
        expect(erreurs, erreurs.join(' | ')).toEqual([]);
    });

    test('carte garnie : les comptes, clones et objectifs vides exclus ; le guide ne couvre pas la chaîne', async ({ page }) => {
        test.setTimeout(60000);
        const erreurs = await ouvrirCarte(page);
        await semerCarte(page);
        const c = await lireChaine(page);
        expect(Object.values(c.etapes).every(e => e.reglee && !e.ton)).toBe(true);
        expect(infos(c)).toEqual({ competence: '1 compétence', 'idees-maitresses': '2 idées maîtresses', lecons: '2 leçons',
            objectifs: '3 objectifs', connaissances: '1 connaissance', activites: '1 activité', evaluations: '1 évaluation' });

        await page.locator('#planif-chaine .bc-etape[data-etape="evaluations"]').click();
        await expect(page.locator('#planif-guide-panel .planif-guide-titre')).toHaveText(PAGES.evaluations);
        const recouvrement = await page.evaluate(() => {
            const g = document.getElementById('planif-guide-panel').getBoundingClientRect();
            const ch = document.getElementById('planif-chaine').getBoundingClientRect();
            return Math.max(0, Math.min(g.bottom, ch.bottom) - Math.max(g.top, ch.top)) * Math.max(0, Math.min(g.right, ch.right) - Math.max(g.left, ch.left));
        });
        expect(recouvrement, 'le panneau du guide laisse la chaîne à découvert').toBe(0);
        expect(erreurs, erreurs.join(' | ')).toEqual([]);
    });

    test('elle suit l\'ajout d\'un bloc par la palette, puis Annuler et Rétablir', async ({ page }) => {
        test.setTimeout(60000);
        const erreurs = await ouvrirCarte(page);
        // Ce que la carte porte vraiment (l'état du module), à comparer à ce que dit la chaîne.
        const etat = () => page.evaluate(() => {
            const n = [...window.planificationCarte.etat.noeuds.values()].filter(x => x.type === 'competence').length;
            const info = document.querySelector('#planif-chaine .bc-etape[data-etape="competence"] .bc-info').textContent;
            return { n, info };
        });
        const attendu = (n) => (n === 0 ? 'à poser' : n + ' compétence' + (n > 1 ? 's' : ''));
        expect(await etat()).toEqual({ n: 0, info: 'à poser' });

        await page.locator('#planif-palette .planif-palette-btn[data-type="competence"]').click();
        await pause(page, 300);
        expect(await etat()).toEqual({ n: 1, info: '1 compétence' });

        // ⚠ Le bloc neuf ouvre son titre en édition, et ce focus empile un instantané d'annulation : le
        // premier Annuler rend l'état de ce focus (la compétence y est), le second la retire. Granularité
        // de l'annulation d'avant ce lot (mesurée le 26 oct.), hors lot. La chaîne suit chaque pas.
        let pas = 0;
        do {
            await page.locator('#planif-btn-annuler').click();
            await pause(page, 300);
            const e = await etat();
            expect(e.info, 'Annuler, pas ' + (pas + 1)).toBe(attendu(e.n));
            pas++;
            if (e.n === 0) break;
        } while (pas < 3);
        expect((await etat()).n, 'Annuler a retiré la compétence').toBe(0);

        await page.locator('#planif-btn-retablir').click();
        await pause(page, 300);
        const r = await etat();
        expect(r.info, 'Rétablir').toBe(attendu(r.n));
        expect(r).toEqual({ n: 1, info: '1 compétence' });
        expect(erreurs, erreurs.join(' | ')).toEqual([]);
    });

    test('Préférences : la case décochée masque la chaîne de la carte', async ({ page }) => {
        test.setTimeout(60000);
        const erreurs = await ouvrirCarte(page);
        expect((await lireChaine(page)).visible).toBe(true);
        await page.evaluate(() => naviguerVers('reglages', 'preferences'));
        await pause(page, 500);
        await page.locator('#v2-pref-chaines-etapes').uncheck();
        await page.evaluate(() => naviguerVers('conception', 'carte'));
        await pause(page, 500);
        const c = await lireChaine(page);
        expect(c.ids.length).toBe(7);
        expect(c.visible, 'décochée, la chaîne ne paraît pas').toBe(false);
        expect(erreurs, erreurs.join(' | ')).toEqual([]);
    });

    test('820 px (iPad) : les sept étapes tiennent, la page ne déborde pas, 44 px au doigt ; la hauteur prise au canevas', async ({ page }) => {
        test.setTimeout(60000);
        const mesures = {};
        for (const [largeur, hauteur] of [[1440, 900], [820, 1180], [1180, 820]]) {
            await ouvrirCarte(page, largeur, hauteur);
            await semerCarte(page);
            const m = await page.evaluate(() => {
                const nav = document.getElementById('planif-chaine');
                const boutons = [...nav.querySelectorAll('.bc-etape')].map(b => b.getBoundingClientRect());
                return {
                    hauteurChaine: Math.round(nav.getBoundingClientRect().height),
                    zone: Math.round(document.getElementById('planif-zone-wrapper').getBoundingClientRect().height),
                    debordePage: document.documentElement.scrollWidth > innerWidth,
                    defileChaine: nav.scrollWidth > nav.clientWidth,
                    hauteurMin: Math.min(...boutons.map(b => Math.round(b.height))),
                    largeurMin: Math.min(...boutons.map(b => Math.round(b.width)))
                };
            });
            mesures[largeur + 'x' + hauteur] = m;
            expect(m.debordePage, largeur + ' : la page ne défile pas à l\'horizontale').toBe(false);
            expect(m.hauteurMin).toBeGreaterThanOrEqual(44);
            expect(m.largeurMin).toBeGreaterThanOrEqual(44);
        }
        expect(mesures['820x1180'].defileChaine, '820 px : les sept étapes tiennent sans défiler').toBe(false);
        console.warn('[#1172] mesures : ' + JSON.stringify(mesures));
    });

    test('plein écran : la chaîne reste sous la barre, et le guide qu\'elle ouvre paraît au premier plan', async ({ page }) => {
        test.setTimeout(60000);
        const erreurs = await ouvrirCarte(page);
        await page.evaluate(() => window.planificationCarte.togglePleinEcran());
        await pause(page, 300);
        expect((await lireChaine(page)).visible).toBe(true);
        await page.locator('#planif-chaine .bc-etape[data-etape="lecons"]').click();
        await expect(page.locator('#planif-guide-panel .planif-guide-titre')).toHaveText(PAGES.lecons);
        // L'élément au centre du guide est le guide lui-même : rien ne le recouvre.
        const auPremierPlan = await page.evaluate(() => {
            const g = document.getElementById('planif-guide-panel');
            const r = g.getBoundingClientRect();
            const el = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(40, r.height / 2));
            return !!el && g.contains(el);
        });
        expect(auPremierPlan, 'en plein écran, le guide ouvert par la chaîne est visible').toBe(true);
        expect(erreurs, erreurs.join(' | ')).toEqual([]);
    });

    // Les captures de la demande de relecture : seulement quand CAPTURES_CHAINE_CARTE nomme leur dossier.
    test('captures (CAPTURES_CHAINE_CARTE)', async ({ page }) => {
        test.skip(!process.env.CAPTURES_CHAINE_CARTE, 'captures seulement sur demande');
        test.setTimeout(180000);
        const dossier = process.env.CAPTURES_CHAINE_CARTE;
        for (const sombre of [false, true]) {
            for (const largeur of [1440, 820]) {
                for (const garnie of [false, true]) {
                    await ouvrirCarte(page, largeur, largeur === 820 ? 1180 : 900);
                    // Le stockage survit au rechargement dans un même contexte : la carte vide est vidée.
                    if (garnie) await semerCarte(page);
                    else await page.evaluate(() => {
                        const pd = window.planificationDonnees;
                        pd.sauvegarderCarte(pd.getIndex().active, { compteur: 0, compteurLiens: 0, noeuds: [], liens: [] });
                        window.planificationCarte.chargerCarte(pd.getIndex().active);
                    });
                    await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
                    await pause(page, 500);
                    const b = await page.locator('#planif-chaine').boundingBox();
                    await page.screenshot({ path: path.join(dossier, `carte-${garnie ? 'garnie' : 'vide'}-${largeur}-${sombre ? 'sombre' : 'clair'}.png`),
                        clip: { x: 0, y: Math.max(0, b.y - 120), width: largeur, height: 420 } });
                }
            }
        }
    });
});
