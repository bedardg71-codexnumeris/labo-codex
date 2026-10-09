import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #695 — LA DATE RÉELLE DANS L'INSPECTEUR (22 sept. 2026).
//
// Le geste que Grégoire vérifiera : double-clic sur une leçon posée en
// semaine/séance, la date de son groupe sous « Semaine » ; double-clic sur
// l'évaluation qu'elle contient, la même date sous « Dans la leçon » ; changer
// la séance dans l'en-tête du bloc, et la ligne change SANS rouvrir.
//
// L'oracle ne passe pas par le code testé : il lit les séances du groupe démo
// et formate la date avec `Intl`, indépendamment de `lignesDateDeLecon`.

const LECON = 'planif-noeud_9';
const EVAL = 'planif-noeud_24';   // enfant de LECON dans la carte démo
const LIGNE = '#planif-panneau-date';

async function ouvrirCarteRattachee(page) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('section-conception')?.classList.add('active');
        document.getElementById('conception-carte')?.classList.add('active');
    });
    await page.evaluate(() => window.planificationCarte.initialiser());
    await expect(page.locator('#' + LECON)).toBeVisible();
    await page.evaluate(() => { document.getElementById('transition-bandeau')?.remove(); });
}

/** « mercredi 3 septembre » de la n-ième rencontre de la semaine, par Intl. */
const oracle = (page, semaine, rang) => page.evaluate(([s, r]) => {
    const parDate = window.obtenirSeancesCompletesDuGroupe('GC_DEMO');
    const dates = Object.keys(parDate)
        .filter(d => parDate[d].length && Number(parDate[d][0].numeroSemaine) === s).sort();
    if (!dates[r - 1]) return null;
    return new Date(dates[r - 1] + 'T12:00:00Z').toLocaleDateString('fr-CA',
        { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
}, [semaine, rang]);

const lignes = (page) => page.locator(`${LIGNE} > div`).allTextContents();

async function choisirSeanceEnTete(page, rang) {
    const sel = page.locator(`#${LECON} .planif-noeud-seance`).first();
    await sel.focus();   // peuple la liste paresseuse, comme le premier contact
    await sel.selectOption(String(rang));
}

test.describe('#695 · la date réelle dans l’Inspecteur', () => {
    test('sans cours rattaché, la ligne le dit', async ({ page }) => {
        await ouvrirCarteRattachee(page);
        // Lot 4 (9 oct.) — la leçon porte des objectifs (#970) : c'est le cas où
        // la légende des pastilles détruisait l'écouteur du champ Semaine.
        expect(await page.evaluate((id) => window.planificationCarte.objectifsDeLecon(
            window.planificationCarte.etat.noeuds.get(id)).length, LECON)).toBeGreaterThan(0);
        await page.locator('#' + LECON).dispatchEvent('dblclick');
        await page.locator('#planif-panneau-semaine').fill('3');
        await choisirSeanceEnTete(page, 1);
        await expect.poll(() => lignes(page)).toEqual(['Carte rattachée à aucun cours : pas de date']);
    });

    test('leçon puis évaluation : la date du groupe, et elle suit les gestes', async ({ page }) => {
        await ouvrirCarteRattachee(page);
        await page.evaluate(() => {
            const pd = window.planificationDonnees;
            pd.definirCoursDeCarte(pd.getIndex().active, 'demo-cours');
        });

        const a3 = await oracle(page, 3, 1);
        const b3 = await oracle(page, 3, 2);
        const b4 = await oracle(page, 4, 2);
        expect(a3).toBeTruthy();
        expect(b3).toBeTruthy();
        expect(new Set([a3, b3, b4]).size).toBe(3);   // garde : trois dates distinctes à départager
        const maj = (t) => t.charAt(0).toUpperCase() + t.slice(1);

        // 1. La leçon, jamais planifiée dans la démo.
        await page.locator('#' + LECON).dispatchEvent('dblclick');
        await expect(page.locator(LIGNE)).toBeVisible();
        await expect.poll(() => lignes(page)).toEqual(['Leçon non planifiée']);

        // 2. La semaine, par l'Inspecteur : séance pas encore fixée.
        await page.locator('#planif-panneau-semaine').fill('3');
        await expect.poll(() => lignes(page)).toEqual(['Semaine 3, séance non fixée']);

        // 3. La séance, par l'en-tête du bloc — sans rouvrir l'Inspecteur.
        await choisirSeanceEnTete(page, 2);
        await expect.poll(() => lignes(page)).toEqual([maj(b3) + ' · séance B']);
        await choisirSeanceEnTete(page, 1);
        await expect.poll(() => lignes(page)).toEqual([maj(a3) + ' · séance A']);

        // 4. L'évaluation : la date de sa leçon parente, sous « Dans la leçon ».
        await page.locator('#' + EVAL).dispatchEvent('dblclick');
        await expect(page.locator('#planif-panneau-deplacer')).toBeVisible();
        await expect.poll(() => lignes(page)).toEqual([maj(a3) + ' · séance A']);

        // 5. B dans l'en-tête de la leçon : la ligne de l'ÉVALUATION suit.
        await choisirSeanceEnTete(page, 2);
        await expect.poll(() => lignes(page)).toEqual([maj(b3) + ' · séance B']);

        // 5 bis. La semaine, par le sélecteur de l'en-tête de la leçon.
        const selSem = page.locator(`#${LECON} .planif-noeud-semaine`).first();
        await selSem.focus();
        await selSem.selectOption('4');
        await expect.poll(() => lignes(page)).toEqual([maj(b4) + ' · séance B']);

        // 6. Sortie de la leçon, puis retour.
        await page.locator('#planif-panneau-deplacer').selectOption('');
        await expect.poll(() => lignes(page)).toEqual(['Hors leçon : pas de date']);
        await page.locator('#planif-panneau-deplacer').selectOption(LECON);
        await expect.poll(() => lignes(page)).toEqual([maj(b4) + ' · séance B']);
    });
});
