import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { f1Html, f6Html } from '../unit/_helpers/grilles-fictives-5b.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
// ⏸ 18 oct. 2026 (la dissection, lot 1) : l'assistant en sept étapes est DÉBRANCHÉ de l'onglet, plus aucun
// collage ni bouton ne l'ouvre. Ces essais le parcouraient : suspendus, pas supprimés, comme son code. Son
// retrait est inscrit pour après lundi (PLAN-2026-10-18-la-dissection-pour-lundi.md, « Après lundi »).
test.skip(() => true, 'Assistant en sept étapes débranché le 18 oct. 2026 (dissection, lot 1) ; retrait après lundi.');

// « APPORTER MON MATÉRIEL », ÉTAPE 5b DU PLAN « PRÊT POUR LUNDI » (consigne du 17 oct. 2026), dans un vrai WebKit.
//
//   · F1 (bande à réglette) collée → rôles proposés sans geste → À classer (calcul, total) écartés →
//     Vérification : points 10, 20, 15, 25, 30, les quatre niveaux par leur nom → « Créer ma grille » →
//     une grille analytique, sans échelle, descripteurs sous le nom du niveau ;
//   · F6 (liste à cocher) collée → Vérification : « / 0 » compris, constats en description, sur 100 →
//     « Créer ma grille ».
// ⛔ Textes inventés (tests/unit/_helpers/grilles-fictives-5b.js) : aucun mot d'une grille réelle.

async function ouvrirConception(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    // Un témoin, pas un délai : le dernier drapeau des migrations de démarrage (main.js, auDbReady)
    // et la zone de collage qui écoute « coller » (materiel.js, au DOMContentLoaded).
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

/** Un VRAI événement « coller » sur la zone, avec le HTML au presse-papiers (comme Word ou Pages). */
async function coller(page, html) {
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        const donnees = { 'text/html': h, 'text/plain': '' };
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (t) => donnees[t] || '' } });
        zone.dispatchEvent(ev);
    }, html);
}

async function ecarterTout(page) {
    await expect(page.locator('#materiel-titre-etape')).toHaveText('Que faire de ces passages ?');
    while (await page.locator('[data-action="materiel.ecarter"]').count()) await page.locator('[data-action="materiel.ecarter"]').first().click();
}

test('étape 5b · F1 collée : réglettes lues, Vérification juste, la grille en points créée avec ses niveaux', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    await coller(page, f1Html());

    await expect(page.locator('.materiel-etapes-nav button')).toHaveText(['1. Sens du tableau', '2. Ce que contient ton tableau', '3. À classer', '4. Vérification']);
    await page.locator('[data-action="materiel.suivant"]').click();
    await expect(page.locator('#materiel-role-r-1')).toHaveValue('nomCritere');
    await expect(page.locator('#materiel-role-r-2')).toHaveValue('suite');
    await expect(page.locator('.materiel-suite-nom [aria-pressed="true"]')).toHaveText(/selon les puces/);
    await page.locator('[data-action="materiel.suivant"]').click();
    await ecarterTout(page);
    await page.locator('[data-action="materiel.suivant"]').click();

    await expect(page.locator('.materiel-verif thead th label')).toHaveText(['Niveau', 'Niveau', 'Niveau', 'Niveau']);
    await expect(page.locator('#materiel-v-titre-0')).toHaveValue('Débutant');
    for (const [i, v] of ['10', '20', '15', '25', '30'].entries()) await expect(page.locator('#materiel-v-pond-' + i)).toHaveValue(v);
    await expect(page.locator('#materiel-v-nom-4')).toHaveValue('LANGUE');
    await expect(page.locator('.materiel-total')).toHaveText('Total : sur 100');
    await expect(page.locator('#materiel-cree li')).toHaveText('Une grille en points « Lecture fictive : grille à réglette » (5 critères), sur 100, avec ce qui est attendu à chaque niveau.');

    await page.locator('[data-action="materiel.creer"]').click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Lecture fictive : grille à réglette » est créée');
    await expect(page.locator('.materiel-plus-loin p')).toHaveCount(1);   // elle décrit déjà ses niveaux
    const ecrit = await page.evaluate(() => {
        const g = db.getSync(cle('grillesTemplates'), []).slice(-1)[0];
        return { enPoints: window.grilleEntierementEnPoints(g), echelles: db.getSync(cle('echellesTemplates'), []).length,
            ponds: g.criteres.map(c => c.ponderation), sous: g.criteres[0].sousCriteres.map(s => s.nom), descr: g.criteres[0].descripteurs };
    });
    expect(ecrit.enPoints).toBe(true);
    expect(ecrit.ponds).toEqual([10, 20, 15, 25, 30]);
    expect(ecrit.sous).toEqual(['Énoncé A1.', 'Énoncé B1.', 'Énoncé C1.']);
    expect(Object.keys(ecrit.descr.parNiveau)).toEqual(['Débutant', 'En progrès', 'Acquis', 'Maîtrisé']);
    expect(ecrit.descr).not.toHaveProperty('echelleId');

    // Grilles de critères la montre avec le nom de ses niveaux.
    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();
    await expect(page.locator('#listeCriteres .grille-attendu-niveau strong').first()).toHaveText('Débutant');
    expect(erreurs).toEqual([]);
});

test('étape 5b · F6 collée : liste à cocher lue sans geste, Vérification « sur 100 », « / 0 » compris, créée', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    await coller(page, f6Html());

    await page.locator('[data-action="materiel.suivant"]').click();
    await expect(page.locator('#materiel-role-c-2')).toHaveValue('ignorer');
    await expect(page.locator('#materiel-role-c-4')).toHaveValue('description');
    await expect(page.locator('#materiel-role-r-1')).toHaveValue('partie');
    await page.locator('[data-action="materiel.suivant"]').click();
    await ecarterTout(page);
    await page.locator('[data-action="materiel.suivant"]').click();

    await expect(page.locator('.materiel-verif thead th')).toHaveText(['Critère', 'Description', 'Points']);
    await expect(page.locator('#materiel-v-nom-0')).toHaveValue('Introduction – Sujet amené');
    await expect(page.locator('#materiel-v-pond-3')).toHaveValue('0');
    await expect(page.locator('[data-param="critere.0.description"]')).toHaveValue('Le sujet est amené de loin.\nIl mène au sujet posé.');
    await expect(page.locator('.materiel-total')).toHaveText('Total : sur 100');

    await page.locator('[data-action="materiel.creer"]').click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Commentaire fictif : liste de vérification » est créée');
    const g = await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).slice(-1)[0]);
    expect(g.criteres.map(c => c.ponderation)).toEqual([10, 20, 30, 0, 0, 40]);
    expect(g.criteres.every(c => c.type === 'analytique')).toBe(true);
    expect(erreurs).toEqual([]);
});
