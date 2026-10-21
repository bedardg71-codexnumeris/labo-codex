import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// #1120 — UNE GRILLE NEUVE SE CONSTRUIT ENTIÈRE (consigne du 21 oct. 2026), dans un vrai WebKit, Mac (1 440 px)
// et iPad en long (1 024 px, au doigt), séparément :
//   · « + Nouvelle grille », un nom, un critère analytique : la phrase « Donne d'abord ses points… » sous
//     « Barème » à 0, partie à 10 sans recharger ; deux sous-critères et trois tranches ajoutés avant
//     « Créer la grille » → RIEN en base ; le barème est sous les sous-critères ; « Créer la grille » → la grille
//     enregistrée les porte, dans l'ordre ; la page rechargée les garde, et la modification les montre dans le
//     même ordre ; la pondération remise à 0 y ramène la phrase, à 5 elle repart ;
//   · « Fermer » sans créer, une tranche saisie : la question d'aujourd'hui, et rien en base.
// Grilles et textes FICTIFS. Captures (Mac) : CAPTURES_1120=<dossier> pour les écrire.

async function attendreApp(page) {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false), null, { timeout: 20000 });
}

async function ouvrirGrillesDeCriteres(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await attendreApp(page);
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await expect(page.locator('[data-action="creerNouvelleGrille"]')).toBeVisible();
}

const NOM = 'Grille neuve fictive';
const PHRASE = 'Donne d’abord ses points à ce critère : ceux de ses tranches iront de 0 à ce nombre.';
const SOUS = ['Annoncer le plan fictif', 'Conclure le texte fictif'];
const TRANCHES = [['Insuffisant', '0 à 3', 'Peu d’idées fictives.'], ['Suffisant', '4 à 7', 'Des idées fictives claires.'], ['Excellent', '8 à 10', 'Des idées fictives fines.']];

const lesGrilles = (page) => page.evaluate(() => db.getSync(cle('grillesTemplates'), []));
const carte = (page) => page.locator('#listeCriteres .item-liste').first();
const phrase = (page) => carte(page).locator('[data-points-d-abord]');

/** Le barème sous les sous-critères : le haut du premier bloc au-dessus du haut du second. */
async function baremeSousLesSousCriteres(page) {
    const sous = await carte(page).locator('.grille-sous-criteres').boundingBox();
    const bareme = await carte(page).locator('.grille-bareme').boundingBox();
    return sous.y + sous.height <= bareme.y;
}

async function nouvelleGrilleAnalytique(page) {
    await page.locator('[data-action="creerNouvelleGrille"]').click();
    await page.locator('#nomGrilleTemplate').fill(NOM);
    await carte(page).locator('select[data-on-change="modifierTypeCritereTempHandler"]').selectOption('analytique');
    const nomCritere = carte(page).locator('input[data-on-change="modifierCritereTempHandler"][data-champ="nom"]');
    await nomCritere.fill('Idées fictives');
    await nomCritere.press('Tab');
}

async function scenarioCreation(page, testInfo, captures) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirGrillesDeCriteres(page);
    const avant = await lesGrilles(page);
    await nouvelleGrilleAnalytique(page);

    // À 0 point, la phrase sous « Barème » ; elle part à 10, sans recharger.
    await expect(phrase(page)).toBeVisible();
    await expect(phrase(page)).toHaveText(PHRASE);
    if (captures) await carte(page).screenshot({ path: path.join(captures, 'phrase-a-0-mac.png') });
    const ponderation = carte(page).locator('input[data-on-change="modifierPonderationCritereTempHandler"]');
    await ponderation.fill('10');
    await ponderation.press('Tab');
    await expect(phrase(page)).toBeHidden();

    // Deux sous-critères : le focus va au nom du neuf.
    for (const nom of SOUS) {
        await carte(page).locator('[data-action="ajouterSousCritere"]').click();
        const champ = carte(page).locator('.grille-sous-critere input').last();
        await expect(champ).toBeFocused();
        await champ.fill(nom);
        await champ.press('Tab');
    }
    // Trois tranches, leurs noms, points et textes.
    for (let j = 0; j < TRANCHES.length; j++) {
        await carte(page).locator('[data-action="ajouterTrancheBareme"]').click();
        const t = carte(page).locator('.grille-bareme-tranche').nth(j);
        const [nom, points, texte] = TRANCHES[j];
        await expect(t.locator('[data-champ="nom"]')).toBeFocused();
        for (const [champ, valeur] of [['nom', nom], ['points', points], ['texte', texte]]) {
            await t.locator(`[data-champ="${champ}"]`).fill(valeur);
            await t.locator(`[data-champ="${champ}"]`).press('Tab');
        }
    }
    await expect(carte(page).locator('.grille-bareme-tranche .grille-bareme-marque')).toHaveCount(0);   // des points partout
    expect(await baremeSousLesSousCriteres(page), 'en création').toBe(true);
    // RIEN en base avant « Créer la grille ».
    await page.evaluate(() => db.flush());
    expect(await lesGrilles(page)).toEqual(avant);
    if (captures) await carte(page).screenshot({ path: path.join(captures, 'creation-mac.png') });

    await page.locator('#btnCreerGrille').click();
    await expect.poll(async () => (await lesGrilles(page)).filter((g) => g.nom === NOM).length).toBe(1);
    const lire = async () => (await lesGrilles(page)).find((g) => g.nom === NOM);
    const verifier = (g) => {
        const c = g.criteres[0];
        expect(c).toMatchObject({ nom: 'Idées fictives', type: 'analytique', ponderation: 10 });
        expect(c.sousCriteres.map((s) => s.nom)).toEqual(SOUS);
        expect(c.bareme.map((t) => [t.nom, t.pointsMin, t.pointsMax, t.texte])).toEqual([
            ['Insuffisant', 0, 3, TRANCHES[0][2]], ['Suffisant', 4, 7, TRANCHES[1][2]], ['Excellent', 8, 10, TRANCHES[2][2]]]);
    };
    const g = await lire();
    verifier(g);

    // Rechargée : la grille les garde ; la modification les montre, le barème sous les sous-critères.
    await page.evaluate(() => db.flush());
    await page.reload();
    await attendreApp(page);
    verifier(await lire());
    await page.evaluate(async (id) => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif(id); }, g.id);
    await expect(carte(page).locator('.grille-sous-critere input')).toHaveCount(2);
    await expect(carte(page).locator('.grille-bareme-tranche')).toHaveCount(3);
    await expect(carte(page).locator('.grille-attendu-titre')).toHaveText(['Sous-critères', 'Barème']);
    expect(await baremeSousLesSousCriteres(page), 'en modification').toBe(true);
    await expect(phrase(page)).toBeHidden();
    if (captures) await carte(page).screenshot({ path: path.join(captures, 'modification-mac.png') });

    // En modification : la pondération à 0 ramène la phrase, à 5 elle repart, sans recharger.
    const pond = carte(page).locator('input[data-on-change="modifierCritereGrilleHandler"][data-champ="ponderation"]');
    await pond.fill('0');
    await pond.press('Tab');
    await expect(phrase(page)).toBeVisible();
    await pond.fill('5');
    await pond.press('Tab');
    await expect(phrase(page)).toBeHidden();
    await expect.poll(async () => (await lire()).criteres[0].ponderation).toBe(5);

    // Aucun débord horizontal du bloc.
    const debord = await carte(page).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(debord).toBeLessThanOrEqual(1);
    expect(erreurs).toEqual([]);
}

async function scenarioFermer(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirGrillesDeCriteres(page);
    const avant = await lesGrilles(page);
    await page.locator('[data-action="creerNouvelleGrille"]').click();
    await carte(page).locator('select[data-on-change="modifierTypeCritereTempHandler"]').selectOption('analytique');
    await carte(page).locator('[data-action="ajouterTrancheBareme"]').click();
    await expect(carte(page).locator('.grille-bareme-tranche')).toHaveCount(1);
    // Sans nom de grille ni de critère : la tranche suffit pour que la question soit posée.
    await page.locator('[data-action="fermerFicheGrille"]').click();
    await expect(page.getByText('Cette grille n\'est pas encore créée.')).toBeVisible();
    await page.getByRole('button', { name: 'Quitter sans créer' }).click();
    await expect(page.locator('#conteneurEditionGrille')).toBeHidden();
    await page.evaluate(() => db.flush());
    expect(await lesGrilles(page)).toEqual(avant);
    expect(erreurs).toEqual([]);
}

test.describe('Mac', () => {
    test.use({ viewport: { width: 1440, height: 900 } });
    test('#1120 · grille neuve : sous-critères et barème avant « Créer la grille », rien en base avant, gardés après', async ({ page }, testInfo) => {
        await scenarioCreation(page, testInfo, process.env.CAPTURES_1120 || null);
    });
    test('#1120 · « Fermer » sans créer, une tranche saisie : la question, et rien en base', async ({ page }) => {
        await scenarioFermer(page);
    });
});

test.describe('iPad', () => {
    test.use({ hasTouch: true, viewport: { width: 1024, height: 1366 } });
    test('#1120 · grille neuve : sous-critères et barème avant « Créer la grille », rien en base avant, gardés après', async ({ page }, testInfo) => {
        await scenarioCreation(page, testInfo, null);
    });
    test('#1120 · « Fermer » sans créer, une tranche saisie : la question, et rien en base', async ({ page }) => {
        await scenarioFermer(page);
    });
});
