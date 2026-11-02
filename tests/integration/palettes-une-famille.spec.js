import { test, expect } from '@playwright/test';
import { ouvrirCopie, attendre } from './harness/banc-copie-annotation.js';

// LES PALETTES D'ANNOTER ET D'ÉVALUER, UNE MÊME FAMILLE (consigne du 2 nov. 2026).
// « L'idée, c'est de pouvoir utiliser le plus d'espace pour les palettes sur la hauteur et de laisser de l'espace pour la
// copie à annoter sur la largeur. » Même en-tête, un seul bouton de version, aucun nom coupé, un seul verrou.
// Aux deux formats de la consigne. Noms fictifs (règle 6).

const FORMATS = [{ width: 1180, height: 820 }, { width: 1280, height: 720 }];
const ANNOTER = ['travaux-palette-flottante', 'travaux-palette-erreurs-fr', 'travaux-palette-tampons'];
const EVALUER = ['travaux-palette-eval-gauche', 'travaux-palette-eval-droite', 'travaux-palette-eval-retro'];
const CODES = 'travaux-palette-erreurs-fr';

/** Les trois palettes d'Annoter ouvertes. */
async function ouvrirAnnoter(page, avant) {
    await ouvrirCopie(page);
    if (avant) await page.evaluate(avant);
    await page.evaluate(() => {
        if (!document.getElementById('travaux-palette-tampons')) window.travauxOutils.togglePaletteAutocollants();
        if (!document.getElementById('travaux-palette-erreurs-fr')) window.travauxOutils.togglePaletteErreursFrancais();
    });
    await page.waitForSelector('#travaux-palette-erreurs-fr .travaux-errfr-item');
}

/** Les palettes d'Évaluer, sur la même copie. */
async function ouvrirEvaluer(page) {
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await page.waitForFunction(() => window.travauxUI.getModeCourant() === 'evaluer' && !!document.getElementById('travaux-palette-eval-retro'), null, { timeout: 10000 });
    await attendre(page, 300);
}

/** Les boutons de droite de l'en-tête : ce que dit chacun (texte, sinon son aria-label). */
const entete = (page, id) => page.evaluate((id) => {
    const b = document.querySelector(`#${id} > .palette-flottante-barre .palette-barre-droite`);
    return [...b.querySelectorAll('button')].filter((x) => x.offsetParent).map((x) => x.classList.contains('palette-bouton-version') ? 'version' : (x.textContent.trim() || x.getAttribute('aria-label') || x.title));
}, id);

for (const vp of FORMATS) {
    test.describe(`à ${vp.width} × ${vp.height}`, () => {
        test.use({ viewport: vp });

        test('§ 1 — aucun ↔ ni ↕ ; le bouton de version là où il y a deux versions, et nulle part ailleurs', async ({ page }) => {
            await ouvrirAnnoter(page);
            const fleches = (ids) => page.evaluate((ids) => ids.map((id) => document.getElementById(id).querySelector(':scope > .palette-flottante-barre').textContent).join('').match(/[↔↕]/g), ids);
            expect(await fleches(ANNOTER)).toBeNull();
            expect(await entete(page, CODES)).toEqual(['version', '−']);
            const titre = await page.evaluate((id) => document.querySelector(`#${id} .palette-bouton-version`).title, CODES);
            expect(titre).toBe('Passer à la version compacte');

            await ouvrirEvaluer(page);
            expect(await fleches(EVALUER)).toBeNull();
            expect(await entete(page, 'travaux-palette-eval-droite')).toEqual(['version', '−']);
            expect(await entete(page, 'travaux-palette-eval-retro')).toEqual(['−']);
            expect((await entete(page, 'travaux-palette-eval-gauche')).includes('version')).toBe(false);
            // Même en-tête qu'en Annoter : la poignée et le nom à gauche, les boutons à droite, collés au bord.
            const forme = await page.evaluate((ids) => ids.map((id) => {
                const b = document.querySelector(`#${id} > .palette-flottante-barre`);
                const d = b.querySelector('.palette-barre-droite');
                return !!b.querySelector('.palette-barre-gauche .palette-grip') && !!d && Math.abs(d.getBoundingClientRect().right - b.getBoundingClientRect().right) < 16;
            }), EVALUER);
            expect(forme).toEqual([true, true, true]);
        });

        test('§ 1 — le compte de Codes tient sur une ligne, en étendue comme en compacte, sans toucher l’engrenage', async ({ page }) => {
            await ouvrirAnnoter(page);
            // 23 codes posés sur la copie.
            await page.evaluate(() => {
                const ids = [...document.querySelectorAll('#travaux-palette-erreurs-fr .travaux-errfr-compteur')].map((b) => b.dataset.erreur);
                const a = window.travauxAnnotation.getAnnotationCourante();
                const pg = Object.values(a.pages)[0];
                pg.shapes = pg.shapes || [];
                for (let i = 0; i < 23; i++) pg.shapes.push({ id: 'fam' + i, type: ids[i % 3], x: 10, y: 10 });
                window.travauxOutils.mettreAJourCompteursErreurs();
            });
            const lire = () => page.evaluate((id) => {
                const b = document.querySelector(`#${id} > .palette-flottante-barre`);
                const r = (sel) => b.querySelector(sel).getBoundingClientRect();
                const titre = r('.palette-flottante-titre'), pastille = r('#travaux-errfr-total-pastille'), roue = r('img[src*="icon-gear"]'), version = r('.palette-bouton-version');
                return {
                    uneLigne: titre.height < 22 && Math.abs(pastille.top - titre.top) < 6,
                    pastille: b.querySelector('#travaux-errfr-total-pastille').textContent,
                    mots: b.querySelector('#travaux-errfr-total-pastille').getAttribute('aria-label'),
                    avantRoue: pastille.right + 2 <= roue.left,
                    roueAvantVersion: roue.right + 2 <= version.left,
                    barreUneLigne: b.getBoundingClientRect().height < 40
                };
            }, CODES);
            const attendu = { uneLigne: true, pastille: '23', mots: '23 erreurs', avantRoue: true, roueAvantVersion: true, barreUneLigne: true };
            expect(await lire(), 'étendue').toEqual(attendu);
            await page.evaluate((id) => document.querySelector(`#${id} .palette-bouton-version`).click(), CODES);
            expect(await page.evaluate((id) => document.getElementById(id).classList.contains('codes-compacte'), CODES)).toBe(true);
            expect(await lire(), 'compacte').toEqual(attendu);
        });
    });
}

test.describe('§ 1 — le stock d’avant le lot', () => {
    test.use({ viewport: FORMATS[0] });

    test('une disposition en bandeau enregistrée (« h ») ouvre l’étendue, sans être réécrite', async ({ page }) => {
        await ouvrirAnnoter(page, () => {
            document.getElementById('travaux-palette-erreurs-fr')?.remove();
            window.definirPreference('dispositionPaletteCodes', 'h');
        });
        const m = await page.evaluate((id) => ({
            compacte: document.getElementById(id).classList.contains('codes-compacte'),
            noms: document.querySelector(`#${id} .travaux-errfr-nom`).offsetHeight > 0,
            pref: window.obtenirPreference('dispositionPaletteCodes')
        }), CODES);
        expect(m).toEqual({ compacte: false, noms: true, pref: 'h' });
    });

    test('un choix « compacte » enregistré est gardé', async ({ page }) => {
        await ouvrirAnnoter(page, () => {
            document.getElementById('travaux-palette-erreurs-fr')?.remove();
            window.definirPreference('dispositionPaletteCodes', 'compacte');
        });
        expect(await page.evaluate((id) => document.getElementById(id).classList.contains('codes-compacte'), CODES)).toBe(true);
    });

    test('une géométrie de bandeau enregistrée avant le lot est ignorée, et laissée telle quelle', async ({ page }) => {
        const bandeau = JSON.stringify({ left: '12px', right: 'auto', top: '12px', width: '1156px', height: '120px' });
        await ouvrirAnnoter(page);
        await page.evaluate((b) => {
            document.getElementById('travaux-palette-erreurs-fr')?.remove();
            localStorage.setItem('travaux-palette-erreurs-fr-pos', b);
            window.travauxOutils.togglePaletteErreursFrancais();
        }, bandeau);
        await page.waitForSelector('#travaux-palette-erreurs-fr .travaux-errfr-item');
        const m = await page.evaluate((id) => ({ largeur: Math.round(document.getElementById(id).getBoundingClientRect().width), stock: localStorage.getItem(id + '-pos') }), CODES);
        expect(m).toEqual({ largeur: 200, stock: bandeau });
    });
});
