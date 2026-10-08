import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LE PLANIFICATEUR VERTICAL ET SES DATES — lot 2 du chantier de la carte,
// 8 oct. 2026 (décisions de Grégoire : `PLAN-2026-10-08-chantier-carte-
// alignement.md`, fin du fichier).
//
//   1. la présentation « réserve à gauche » est retirée, bouton compris ; un
//      usager qui l'avait choisie retombe sur la verticale, et sa préférence
//      reste dans le stockage (rien n'est effacé) ;
//   2. « PLANIFICATEUR · du 25 août au 19 décembre 2026 » : dates « Début du
//      trimestre » et « Fin du trimestre » du Cadre ;
//   3. sans elles : « Les dates du trimestre ne sont pas entrées. Ajoute-les
//      dans Cadre › Trimestre. », le lien ouvrant cette section.

const INVITATION = 'Les dates du trimestre ne sont pas entrées. Ajoute-les dans Cadre › Trimestre.';
const ZONE = '#planif-sommaire [data-grille-semaine=""]';

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

async function ouvrirCarteDemo(page) {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    page.setDefaultTimeout(15000);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.naviguerVers('conception', 'carte'));
    await expect(page.locator('#planif-sommaire .planif-grille-rangee').first()).toBeVisible();
    await page.evaluate(() => { document.getElementById('transition-bandeau')?.remove(); });
    return erreurs;
}

/** Remplace le cadre du trimestre actif le temps d'une fonction, puis le rend tel quel. */
async function avecCadre(page, champs, fn) {
    const original = await page.evaluate((c) => {
        const cle = window.cle('cadreCalendrier');
        const avant = window.db.getSync(cle, null);
        const nouveau = Object.assign({}, avant || {}, c);
        Object.keys(c).forEach((k) => { if (c[k] === null) delete nouveau[k]; });
        window.db.setSync(cle, nouveau);
        window.planificationCarte.mettreAJourPlanificateur();
        return avant;
    }, champs);
    try {
        await fn();
    } finally {
        await page.evaluate((avant) => window.db.setSync(window.cle('cadreCalendrier'), avant), original);
    }
}

test('plus de présentation horizontale : ni bouton, ni colonne, même avec la préférence « gauche » enregistrée', async ({ page }) => {
    const erreurs = await ouvrirCarteDemo(page);
    await expect(page.locator('#planif-btn-disposition-reserve')).toHaveCount(0);

    // Un usager qui avait choisi la réserve à gauche avant le lot 2.
    await page.evaluate(() => {
        const p = window.db.getSync('preferencesUtilisateur', {}) || {};
        p.planifReserveDisposition = 'gauche';
        window.db.setSync('preferencesUtilisateur', p);
        window.planificationCarte.mettreAJourPlanificateur();
    });
    try {
        await expect(page.locator('#planif-sommaire .planif-cotecote')).toHaveCount(0);
        await expect(page.locator('#planif-sommaire .planif-reserve-colonne')).toHaveCount(0);
        const geo = await page.evaluate((sel) => {
            const z = document.querySelector(sel).getBoundingClientRect();
            const g = document.querySelector('#planif-sommaire .planif-grille').getBoundingClientRect();
            return { zy: z.y, gbas: g.bottom };
        }, ZONE);
        expect(geo.zy).toBeGreaterThanOrEqual(Math.floor(geo.gbas)); // SOUS la grille

        // Rien n'est effacé : la valeur reste, elle n'est simplement plus lue.
        expect(await page.evaluate(() => window.db.getSync('preferencesUtilisateur', {}).planifReserveDisposition)).toBe('gauche');
        // …même après une écriture d'une AUTRE préférence (definirPreference réécrit tout le stockage).
        await page.click('#planif-btn-palette-noeuds');
        await page.click('#planif-btn-palette-noeuds');
        expect(await page.evaluate(() => window.db.getSync('preferencesUtilisateur', {}).planifReserveDisposition)).toBe('gauche');
    } finally {
        await page.evaluate(() => {
            const p = window.db.getSync('preferencesUtilisateur', {}) || {};
            delete p.planifReserveDisposition;
            window.db.setSync('preferencesUtilisateur', p);
        });
    }
    expect(erreurs).toEqual([]);
});

test('les dates du Cadre s’affichent à côté du titre, sans capitales', async ({ page }) => {
    const erreurs = await ouvrirCarteDemo(page);
    await avecCadre(page, { dateDebut: '2026-08-25', finTrimestre: '2026-12-19', finCours: '2026-12-08' }, async () => {
        await expect(page.locator('#planif-dates-trimestre')).toHaveText(' · du 25 août au 19 décembre 2026');
        await expect(page.locator('#planif-invitation-dates')).toBeHidden();
        // Le titre reste en capitales, les dates non (« AOÛT » se lirait mal).
        const transforme = await page.evaluate(() => ({
            titre: getComputedStyle(document.querySelector('#planif-palette-nav .planif-palette-titre')).textTransform,
            dates: getComputedStyle(document.getElementById('planif-dates-trimestre')).textTransform
        }));
        expect(transforme).toEqual({ titre: 'uppercase', dates: 'none' });
        await expect(page.locator('#planif-dates-trimestre')).toBeVisible();
    });
    expect(erreurs).toEqual([]);
});

test('la forme des dates : l’année une fois ou deux, « 1er », et rien quand une date est mal formée', async ({ page }) => {
    const erreurs = await ouvrirCarteDemo(page);
    const f = (a, b) => page.evaluate(([x, y]) => window.planificationCarte.formaterDatesTrimestre(x, y), [a, b]);
    expect(await f('2026-08-25', '2026-12-19')).toBe('du 25 août au 19 décembre 2026');
    expect(await f('2026-12-01', '2027-01-08')).toBe('du 1er décembre 2026 au 8 janvier 2027');
    expect(await f('2027-01-15', '2027-05-01')).toBe('du 15 janvier au 1er mai 2027');
    expect(await f('2026-08-25', '')).toBeNull();
    expect(await f('', '2026-12-19')).toBeNull();
    expect(await f('25/08/2026', '2026-12-19')).toBeNull();
    expect(await f('2026-13-01', '2026-12-19')).toBeNull();
    expect(erreurs).toEqual([]);
});

test('« Fin du trimestre » fait foi, pas « Fin des cours réguliers »', async ({ page }) => {
    const erreurs = await ouvrirCarteDemo(page);
    await avecCadre(page, { dateDebut: '2026-08-25', finCours: '2026-12-08', finTrimestre: null }, async () => {
        // finCours seul ne suffit pas : c'est l'invitation qui paraît.
        await expect(page.locator('#planif-dates-trimestre')).toHaveText('');
        await expect(page.locator('#planif-invitation-dates')).toBeVisible();
    });
    expect(erreurs).toEqual([]);
});

test('sans dates : l’invitation, mot pour mot, et son lien ouvre Cadre › Trimestre ; l’ancien avis « Réglages » a disparu', async ({ page }) => {
    const erreurs = await ouvrirCarteDemo(page);
    await avecCadre(page, { dateDebut: null, finTrimestre: null }, async () => {
        await expect(page.locator('#planif-dates-trimestre')).toHaveText('');
        const invitation = page.locator('#planif-invitation-dates');
        await expect(invitation).toBeVisible();
        expect((await invitation.textContent()).replace(/\s+/g, ' ').trim()).toBe(INVITATION);
        await expect(page.locator('#planif-palette-nav')).not.toContainText('Réglages');
        await expect(page.locator('#planif-palette-nav')).not.toContainText('Semaines dérivées des leçons');

        await invitation.locator('a', { hasText: 'Cadre › Trimestre' }).click();
        await expect(page.locator('#section-calendrier')).toHaveClass(/\bactive\b/);
        await expect(page.locator('#calendrier-trimestre')).toBeVisible();
        await expect(page.locator('#v2-debutTrimestre')).toBeFocused();
    });
    expect(erreurs).toEqual([]);
});
