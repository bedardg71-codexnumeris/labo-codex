// #157 (10 août 2026) — le dépli du badge 🎯 repousse les feuilles sous le titre.
//
// Terrain (Grégoire, Mac) : une leçon aux objectifs LONGS dépliés voyait sa
// première feuille recouvrir le titre. Cause : l'en-tête était mesuré avant
// que la largeur du conteneur soit posée — le repli du texte invalidait la
// mesure. ⚠ Les textes du seed sont volontairement longs : une ligne courte
// ne se replie pas et le bug ne se voit pas (c'est pour ça qu'il a survécu).
//
// Écrite et validée sur le Chromium du conteneur ; le passage WebKit se
// confirme à la CI (même convention que planif-drag-pointer-148.spec.js).
// Compagnon statique : tests/unit/sentinelle-layout-largeur-avant-entete-157.test.js.
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

const CARTE = {
    index: { active: 'carte_157', compteurCartes: 1, cartes: [{ id: 'carte_157', nom: 'Repro 157', coursId: null }] },
    cartes: {
        carte_157: {
            compteur: 10, compteurLiens: 0, liens: [],
            noeuds: [
                {
                    id: 'n_lecon', type: 'lecon', titre: '1A Introduction aux concepts',
                    description: '', x: 300, y: 200, parent: null, enfants: ['n_expose'],
                    metadata: {
                        objectifs: [
                            { id: 'o1', texte: 'Distinguer HOC, mécanisme et procédés dans un texte' },
                            { id: 'o2', texte: 'Situer le cours 601-101 dans la séquence des cours' },
                            { id: 'o3', texte: 'Distinguer différentes postures de lecture actives' }
                        ],
                        objectifDeplie: false
                    },
                    cloneSourceId: null
                },
                {
                    id: 'n_expose', type: 'expose', titre: 'Présentation du cours 601-101',
                    description: '', x: 340, y: 320, parent: 'n_lecon', enfants: [],
                    metadata: { duree: 50 }, cloneSourceId: null
                }
            ]
        }
    }
};

test('#157 · déplier les objectifs repousse la feuille sous le titre (textes longs)', async ({ page }) => {
    await page.addInitScript((payload) => {
        localStorage.setItem('planification_mindmap', payload);
        localStorage.setItem('demo_planification_mindmap', payload);
    }, JSON.stringify(CARTE));

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);

    // Activer la section carte sans dépendre de la nav (patron des specs planif)
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('section-conception')?.classList.add('active');
        document.getElementById('conception-carte')?.classList.add('active');
    });
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.waitForTimeout(600);

    const lecon = page.locator('#planif-n_lecon');
    await expect(lecon).toBeAttached();

    const mesurer = () => page.evaluate(() => {
        const c = document.getElementById('planif-n_lecon');
        const e = document.getElementById('planif-n_expose');
        const titre = c.querySelector('.planif-noeud-titre');
        const rt = titre.getBoundingClientRect();
        const re = e.getBoundingClientRect();
        return { titreBottom: rt.bottom, enfantTop: re.top };
    });

    // État replié : pas de chevauchement (référence)
    const avant = await mesurer();
    expect(avant.enfantTop).toBeGreaterThan(avant.titreBottom);

    // Déplier le badge 🎯 — le geste exact du terrain
    await page.locator('#planif-n_lecon .planif-badge-objectif').click();
    await page.waitForTimeout(800);

    const apres = await mesurer();
    expect(apres.enfantTop, 'la feuille recouvre le titre après dépli des objectifs (#157)')
        .toBeGreaterThan(apres.titreBottom);

    // Replier : l'état de référence revient
    await page.locator('#planif-n_lecon .planif-badge-objectif').click();
    await page.waitForTimeout(800);
    const retour = await mesurer();
    expect(retour.enfantTop).toBeGreaterThan(retour.titreBottom);
});
