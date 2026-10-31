import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ouvrirCopie, attendre } from './harness/banc-copie-annotation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const captures = path.resolve(__dirname, '..', '..', 'plans de travail', 'captures');

// CONSIGNE DU 31 OCT. 2026, PARTIE G — LA BARRE D'OUTILS. Ébauche : plans de travail/EBAUCHE-2026-10-31-barre-outils.dc.html.

const etiquette = '.annot-toolbar .annot-badge[data-fichier-id="FT651"]';

test.describe('La barre d’outils', () => {
    test('l’étiquette : plus d’aperçu de rétroaction, un bouton de profil, et le module n’a plus la fenêtre', async ({ page }) => {
        const suivi = await ouvrirCopie(page);
        const m = await page.evaluate((sel) => {
            const e = document.querySelector(sel);
            const ui = window.travauxUI;
            return {
                retro: e.querySelectorAll('.travaux-badge-retro').length,
                profil: e.querySelectorAll('.travaux-badge-profil[data-action="ouvrirProfilDepuisAnnotation"][data-param][data-stop]').length,
                icone: !!e.querySelector('.travaux-badge-profil img[src*="icon-profile"]'),
                fenetre: [typeof ui.afficherRetroaction, typeof ui.sauvegarderRetroactionDepuisModal, typeof ui.fermerModalRetroaction],
                module: typeof ui.ouvrirProfilDepuisAnnotation
            };
        }, etiquette);
        expect(m).toEqual({ retro: 0, profil: 1, icone: true, fenetre: ['undefined', 'undefined', 'undefined'], module: 'function' });
        expect(suivi.erreurs).toEqual([]);
    });

    test('le bouton de profil ouvre le profil de CET élève, sans ouvrir ni changer la copie', async ({ page }) => {
        await ouvrirCopie(page);
        const r = await page.evaluate(async (sel) => {
            const appels = [], ouvertures = [];
            window.afficherProfilComplet = (da) => appels.push(da);
            const naviguer = window.naviguerVers;
            window.naviguerVers = (a, b) => appels.push(a + '/' + b);
            const ouvrir = window.travauxUI.ouvrirFichier;
            window.travauxUI.ouvrirFichier = (id) => { ouvertures.push(id); };
            const avant = window.travauxVisionneuse.getFichierActuel().id;
            document.querySelector(sel + ' .travaux-badge-profil').click();
            await new Promise((f) => setTimeout(f, 300));
            window.naviguerVers = naviguer; window.travauxUI.ouvrirFichier = ouvrir;
            return { appels, ouvertures, memeCopie: window.travauxVisionneuse.getFichierActuel().id === avant };
        }, etiquette);
        expect(r.appels).toEqual(['suivi/profil', 'TEST1209']);
        expect(r.ouvertures).toEqual([]);
        expect(r.memeCopie).toBe(true);
    });

    test('la vue Archivage n’a pas le bouton de profil', async ({ page }) => {
        await ouvrirCopie(page);
        const n = await page.evaluate(() => {
            const c = document.getElementById('evaluations-contenu-archivage');
            window.travauxUI.afficherArchivage();
            return { badges: c.querySelectorAll('.annot-badge').length, profils: c.querySelectorAll('.travaux-badge-profil').length };
        });
        expect(n.badges).toBeGreaterThan(0); // témoin : l'étiquette y est bien
        expect(n.profils).toBe(0);
    });

    test('la bande des palettes suit le carrousel, ouvre et ferme, et montre ce qui est ouvert', async ({ page }) => {
        await ouvrirCopie(page);
        const ordre = await page.evaluate(() => {
            const t = document.querySelector('.annot-toolbar');
            const i = (s) => [...t.children].indexOf(t.querySelector(':scope > ' + s));
            const b = [...document.querySelectorAll('#annot-bande-palettes button')];
            return {
                carrousel: i('.annot-toolbar-fichiers'), bande: i('#annot-bande-palettes'), separateur: i('.annot-toolbar-separateur'),
                actions: b.map((x) => x.dataset.action),
                ids: b.map((x) => x.id),
                paletteBas: document.querySelectorAll('.palette-flottante-bas-btns').length,
                doublon: document.querySelectorAll('[id="btn-toggle-tampons"]').length
            };
        });
        expect(ordre.bande).toBe(ordre.carrousel + 1);
        expect(ordre.separateur).toBe(ordre.bande + 1);
        expect(ordre.actions).toEqual(['tamponsBibliotheque.afficherBibliothequeTampons', 'travauxOutils.togglePaletteErreursFrancais', 'travauxOutils.togglePaletteAutocollants']);
        expect(ordre.ids).toEqual(['', 'btn-toggle-codes', 'btn-toggle-tampons']);
        expect(ordre.paletteBas).toBe(0);
        expect(ordre.doublon).toBe(1);

        const etat = () => page.evaluate(() => ({
            codes: [!!document.getElementById('travaux-palette-erreurs-fr'), document.getElementById('btn-toggle-codes').getAttribute('aria-pressed'), document.getElementById('btn-toggle-codes').classList.contains('actif')],
            tampons: [!!document.getElementById('travaux-palette-tampons'), document.getElementById('btn-toggle-tampons').getAttribute('aria-pressed'), document.getElementById('btn-toggle-tampons').classList.contains('actif')]
        }));
        // Les deux palettes s'ouvrent à l'ouverture de la copie : la bande le dit dès le départ.
        expect(await etat()).toEqual({ codes: [true, 'true', true], tampons: [true, 'true', true] });
        await page.locator('#btn-toggle-tampons').click();
        expect((await etat()).tampons).toEqual([false, 'false', false]);
        await page.locator('#btn-toggle-codes').click();
        expect((await etat()).codes).toEqual([false, 'false', false]);
        await page.locator('#btn-toggle-tampons').click();
        expect((await etat()).tampons).toEqual([true, 'true', true]);
    });

    test('hors d’Annoter, la bande se retire, et elle revient', async ({ page }) => {
        await ouvrirCopie(page);
        const visible = () => page.evaluate(() => {
            const b = document.getElementById('annot-bande-palettes');
            return !!b.offsetParent;
        });
        expect(await visible()).toBe(true);
        await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
        await attendre(page, 500);
        expect(await visible()).toBe(false);
        await page.evaluate(() => window.travauxUI.basculerMode('annoter'));
        await attendre(page, 500);
        // La classe, pas la visibilité : sur ce banc sans grille, le retour d'Évaluer referme la barre entière.
        expect(await page.evaluate(() => document.getElementById('annot-bande-palettes').classList.contains('u-hide'))).toBe(false);
    });

    for (const largeur of [820, 1180]) {
        test(`à ${largeur} px : la bande est entière, et le carrousel garde sa place`, async ({ page }) => {
            await page.setViewportSize({ width: largeur, height: 900 });
            await ouvrirCopie(page);
            await attendre(page, 300);
            const m = await page.evaluate(() => {
                const t = document.querySelector('.annot-toolbar').getBoundingClientRect();
                const b = document.getElementById('annot-bande-palettes').getBoundingClientRect();
                const c = document.querySelector('.annot-toolbar-fichiers').getBoundingClientRect();
                return { dedans: b.right <= t.right && b.left >= t.left, bande: b.width, carrousel: c.width, barre: t.width };
            });
            console.log('Barre à', largeur, 'px →', JSON.stringify(m));
            expect(m.dedans).toBe(true);
            expect(m.bande).toBeLessThan(105);
            expect(m.carrousel).toBeGreaterThan(150);
        });
    }

    test('captures sur demande (CAPTURES=1)', async ({ page }) => {
        test.skip(!process.env.CAPTURES, 'Captures sur demande.');
        await page.setViewportSize({ width: 1180, height: 820 });
        await ouvrirCopie(page);
        for (const [nom, clair] of [['clair', true], ['sombre', false]]) {
            await page.evaluate((clair) => document.body.classList.toggle('mode-clair', clair), clair);
            await page.locator('.annot-toolbar').screenshot({ path: path.join(captures, `barre-outils-${nom}.png`) });
        }
    });
});
