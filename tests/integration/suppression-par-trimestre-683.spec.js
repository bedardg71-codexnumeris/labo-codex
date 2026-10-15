import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #683 (15 oct. 2026, décision de Grégoire à 11 h 04) — une suppression du matériel de départ
// ne vaut que pour son trimestre, et la bascule sème comme le chargement, SANS rechargement.
//   1. supprimée dans a2026, la grille de départ arrive dans h2027 (vierge) à la bascule ;
//      revenu dans a2026, elle y reste absente ;
//   2. une ancienne marque GLOBALE la garde absente des deux.
// La suppression est rejouée par ses deux écritures (celles de `_retirerGrilleDeLaListe`,
// grilles.js) : la marque, puis le retrait de la collection du trimestre.
// Jumelle Vitest : sentinelle-683-suppression-par-trimestre. Aucun nom d'élève.

function brancherEcouteurs(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        const m = msg.text();
        if (/version\.json.*access control|Cross origin requests are only supported|Not allowed to load local resource/i.test(m)) return;
        erreurs.push(`console.error: ${m}`);
    });
    page.on('dialog', (d) => d.dismiss());
    return erreurs;
}

async function ouvrir(page, marqueGlobale) {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);
    await page.evaluate(async (globale) => {
        const db = window.db;
        db.setSync('trimestres', [
            { id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true },
            { id: 'h2027', nom: 'Hiver 2027', annee: 2027, session: 'H', actif: false }
        ]);
        db.setSync('trimestreActif', 'a2026');
        db.setSync('h2027_grillesTemplates', []);
        db.setSync('h2027_echellesTemplates', []);
        if (globale) db.setSync('ressourcesSupprimees', ['GRILLE_GENERIQUE']);
        await window.assurerGrilleDeDepart();
    }, !!marqueGlobale);
    return erreurs;
}

const aLaGrille = (page, trim) => page.evaluate((t) =>
    (window.db.getSync(t + '_grillesTemplates', []) || []).some((g) => g && g.id === 'GRILLE_GENERIQUE'), trim);

async function basculer(page, trim) {
    await page.evaluate((t) => window.changerTrimestreActifV2(t), trim);
    await page.waitForTimeout(800);
}

test('#683 · supprimée dans un trimestre, la grille de départ arrive dans le trimestre vierge, sans rechargement', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = await ouvrir(page, false);
    expect(await aLaGrille(page, 'a2026'), 'témoin : semée dans a2026 avant la suppression').toBe(true);

    await page.evaluate(async () => {
        window.marquerRessourceSupprimee('GRILLE_GENERIQUE');
        await window.db.modifier(window.cle('grillesTemplates'),
            (lues) => (lues || []).filter((g) => g.id !== 'GRILLE_GENERIQUE'), []);
    });
    expect(await page.evaluate(() => window.db.getSync('a2026_ressourcesSupprimeesTrimestre', []))).toEqual(['GRILLE_GENERIQUE']);
    expect(await page.evaluate(() => window.db.getSync('ressourcesSupprimees', []))).toEqual([]);

    await basculer(page, 'h2027');
    await expect.poll(() => aLaGrille(page, 'h2027'), { timeout: 10000 }).toBe(true);
    expect(await page.evaluate(() => window.db.getSync('h2027_echellesTemplates', []).some((e) => e.id === 'ECHELLE_IDME_DEPART'))).toBe(true);

    await basculer(page, 'a2026');
    await page.waitForTimeout(800);
    expect(await aLaGrille(page, 'a2026'), 'la suppression tient dans son trimestre').toBe(false);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#683 · une ancienne marque globale garde la grille de départ absente des deux trimestres', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = await ouvrir(page, true);
    expect(await aLaGrille(page, 'a2026')).toBe(false);

    await basculer(page, 'h2027');
    await expect.poll(() => page.evaluate(() =>
        window.db.getSync('h2027_echellesTemplates', []).some((e) => e.id === 'ECHELLE_IDME_DEPART')), { timeout: 10000 })
        .toBe(true);   // témoin : la bascule a semé
    expect(await aLaGrille(page, 'h2027')).toBe(false);

    await basculer(page, 'a2026');
    await page.waitForTimeout(800);
    expect(await aLaGrille(page, 'a2026')).toBe(false);
    expect(await page.evaluate(() => window.db.getSync('ressourcesSupprimees', []))).toEqual(['GRILLE_GENERIQUE']);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
