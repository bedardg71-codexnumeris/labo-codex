import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ouvrirEspaceVide, ouvrirPanneau, capture } from './harness/classe-de-banc.js';

// =======================================================================
// LE PIED DE PAGE ET LE PANNEAU « ASSISTANCE » (10 nov. 2026, Grégoire, 20 h, sur captures)
// =======================================================================
//
// a) Pied de page : « Nouveautés » sur la même ligne que la version, à côté d'elle ; dessous, la
//    devise de l'application, dans le style de celle de Codex Numeris (italique, discrète) :
//    « Suivre l'apprentissage, soutenir l'enseignement. » (ses mots, validés).
// b) Panneau « Assistance » : l'interrupteur « Aide dans les pages » et sa ligne montent juste
//    sous la présentation, avant « Tes parcours ». Aucun mot ne change.
//
// Les deux ne paraissent qu'en vue étendue : la vue simple n'a ni ce pied de page ni l'entrée
// « Assistance » (mesuré le 10 nov. sous WebKit, espace vide, 820 px). D'où ce banc, en vue
// étendue, à 820 px (iPad en portrait) et à 390 px (téléphone), en clair et en sombre.
// Captures : CAPTURES_PARCOURS=1 → « plans de travail/captures-2026-11-10-pied-et-assistance/ ».

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOSSIER = process.env.CAPTURES_PARCOURS
    ? path.resolve(__dirname, '..', '..', 'plans de travail', 'captures-2026-11-10-pied-et-assistance')
    : '';
const DEVISE = 'Suivre l’apprentissage, soutenir l’enseignement.';

async function poserLeTheme(page, theme) {
    await page.evaluate((clair) => {
        definirPreference('modeClair', clair);
        document.body.classList.toggle('mode-clair', clair);
    }, theme === 'clair');
}

const boite = (page, sel) => page.locator(sel).first().evaluate((e) => {
    const r = e.getBoundingClientRect();
    return { haut: r.top, bas: r.bottom, gauche: r.left, droite: r.right, milieu: (r.top + r.bottom) / 2 };
});

for (const largeur of [820, 390]) {
    for (const theme of ['sombre', 'clair']) {
        test(`pied de page et « Assistance », vue étendue, ${largeur} px, ${theme}`, async ({ page }) => {
            test.setTimeout(120000);
            const erreurs = [];
            page.on('pageerror', (e) => erreurs.push(e.message));
            await ouvrirEspaceVide(page, largeur, { hauteur: largeur === 390 ? 844 : 1180 });
            await poserLeTheme(page, theme);
            expect(await page.evaluate(() => document.body.classList.contains('vue-simple'))).toBe(false);

            // a) Le pied de page.
            await page.evaluate(() => afficherSection('accueil'));
            const pied = page.locator('.accueil-pied-application');
            await expect(pied).toBeVisible();
            const ligne = pied.locator('.accueil-pied-ligne');
            await expect(ligne.locator('.accueil-pied-version')).toHaveText(/^Bêta publique \d+\.\d+\.\d+$/);
            await expect(ligne.locator('.accueil-pied-lien')).toHaveText('Nouveautés');
            const devise = pied.locator('.accueil-pied-tagline');
            await expect(devise).toHaveText(DEVISE);
            expect(await devise.evaluate((e) => getComputedStyle(e).fontStyle)).toBe('italic');
            // Même style que la devise de Codex Numeris, à droite.
            const styleDe = (sel) => page.locator(sel).evaluate((e) => { const s = getComputedStyle(e); return [s.fontSize, s.fontStyle, s.color].join(' '); });
            expect(await styleDe('.accueil-pied-application .accueil-pied-tagline')).toBe(await styleDe('.accueil-pied-codex-numeris .accueil-pied-tagline'));

            const version = await boite(page, '.accueil-pied-application .accueil-pied-version');
            const lien = await boite(page, '.accueil-pied-application .accueil-pied-lien');
            const sousLaLigne = Math.max(version.bas, lien.bas);
            expect((await boite(page, '.accueil-pied-application .accueil-pied-tagline')).haut, 'la devise sous la version et le lien').toBeGreaterThanOrEqual(sousLaLigne - 1);
            // Côte à côte : même ligne, le lien à droite de la version — aussi sur un téléphone, où les deux
            // moitiés du pied de page s'empilent pour leur laisser la place.
            expect(Math.abs(version.milieu - lien.milieu), 'version et « Nouveautés » sur la même ligne').toBeLessThan(10);
            expect(lien.gauche).toBeGreaterThan(version.droite);
            expect(version.bas - version.haut, 'la version sur une seule ligne').toBeLessThan(30);
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'aucun débordement horizontal').toBe(true);
            await page.locator('.accueil-pied').scrollIntoViewIfNeeded();
            await capture(page, DOSSIER, `pied-${largeur}-${theme}`);

            // b) Le panneau « Assistance » : l'aide juste sous la présentation, avant « Tes parcours ».
            await ouvrirPanneau(page);
            const ordre = await page.evaluate(() => {
                const p = document.getElementById('panneau-assistance');
                const intro = p.querySelector('.assistance-intro');
                const aide = p.querySelector('.assistance-aide');
                const intitule = p.querySelector('.assistance-intitule');
                return {
                    aideSuitIntro: intro.nextElementSibling === aide,
                    aideAvantParcours: !!(aide.compareDocumentPosition(intitule) & Node.DOCUMENT_POSITION_FOLLOWING),
                    hautAide: aide.getBoundingClientRect().top,
                    hautIntitule: intitule.getBoundingClientRect().top
                };
            });
            expect(ordre.aideSuitIntro, 'l\'aide juste sous la présentation').toBe(true);
            expect(ordre.aideAvantParcours, 'avant « Tes parcours »').toBe(true);
            expect(ordre.hautAide).toBeLessThan(ordre.hautIntitule);
            // Aucun mot ne change.
            await expect(page.locator('#assistance-aide-titre')).toHaveText('Aide dans les pages');
            await expect(page.locator('#assistance-aide-ligne')).toHaveText('Infobulles et flèches qui expliquent ce que tu touches.');
            await expect(page.locator('#assistance-intitule')).toHaveText('Tes parcours');
            await expect(page.locator('#assistance-interrupteur')).toBeVisible();
            await capture(page, DOSSIER, `assistance-${largeur}-${theme}`);

            expect(erreurs, erreurs.join(' | ')).toEqual([]);
        });
    }
}
