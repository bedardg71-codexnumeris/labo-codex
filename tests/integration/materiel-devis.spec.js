import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racine, 'index.html');
const devis = (code) => readFileSync(path.join(racine, 'tests', 'fixtures', 'devis', code + '.txt'), 'utf8');

// LE DEVIS MINISTÉRIEL DANS « APPORTER MON MATÉRIEL » (lot du 28 nov. 2026, demande de Grégoire), au navigateur.
//
// Correctif de 8 h 08 (ses mots : « numériser ne touche aucun cours et c'est la création du cours qui vient puiser dans
// le devis numérisé ») : l'enseignant·e colle, voit la lecture, corrige, accepte ; le devis se range dans la réserve de
// devis (`devisMinisteriels`, clé globale). Ce que Vitest ne prouve pas :
//   · RIEN NE S'ENREGISTRE D'OFFICE : la réserve est lue en base après chaque geste d'avant l'accord ;
//   · AUCUNE FICHE DE COURS N'EST TOUCHÉE : la collection `cours` est comparée octet pour octet, avant et après ;
//   · un devis du même code n'est remplacé qu'après le second accord, l'ancien et le nouveau côte à côte ;
//   · les devis rangés se montrent sur l'accueil et se rouvrent ; un collage piégé n'entre pas dans la page ;
//   · 000Z se remet en ordre en deux gestes de menu.
// Cours fictif ; les devis sont des documents publics du ministère.

const COURS = { codeCours: '601-101-MQ', nomCours: 'Écriture fictive', discipline: '601 Français', numeroCompetence: '4EF0', competence: 'Énoncé de la fiche', elementsCompetence: '• Élément de la fiche' };

async function ouvrir(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(async (c) => { await window.CoursEntite.creer(c); window.afficherSection('conception'); }, COURS);
    await expect(page.locator('#materiel-accueil')).toBeVisible();
}
const reserve = (page) => page.evaluate(async () => (await db.get('devisMinisteriels')) || null);
const lesCours = (page) => page.evaluate(async () => JSON.stringify(await db.get('cours')));
async function numeriser(page, code) {
    await page.locator('[data-action="materielDevis.ouvrir"]').click();
    await page.locator('#devis-zone-collage').fill(devis(code));
    await page.locator('[data-action="materielDevis.lire"]').click();
    await expect(page.locator('#devis-numero')).toHaveValue(code);
}

test('devis · coller, lire, corriger, ranger 4EF0 : rien n’est écrit avant « Ranger », aucun cours n’est touché ; le devis rangé se montre et se rouvre', async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await ouvrir(page);
    const coursAvant = await lesCours(page);

    // L'accueil offre deux entrées : la grille, inchangée, et le devis. Aucun devis rangé : pas de liste.
    await expect(page.locator('#materiel-zone-collage')).toBeVisible();
    await expect(page.locator('#materiel-devis-ranges')).toBeHidden();
    await page.locator('[data-action="materielDevis.ouvrir"]').click();
    await expect(page.locator('#materiel-devis')).toBeVisible();
    await expect(page.locator('#materiel-accueil')).toBeHidden();
    await expect(page.locator('#devis-titre')).toBeFocused();   // règle SPA
    await expect(page.locator('#materiel-devis select')).toHaveCount(0);   // aucun cours à choisir

    // Zone vide : un message, pas de lecture. Puis le collage.
    await page.locator('[data-action="materielDevis.lire"]').click();
    await expect(page.locator('#devis-erreur')).toBeVisible();
    await page.locator('#devis-zone-collage').fill(devis('4EF0'));
    await page.locator('[data-action="materielDevis.lire"]').click();

    // La lecture, rangée comme le tableau : le numéro et l'énoncé en tête, les éléments, leurs critères dessous, les activités.
    await expect(page.locator('#devis-numero')).toHaveValue('4EF0');
    await expect(page.locator('#devis-enonce')).toHaveValue('Analyser des textes littéraires.');
    await expect(page.locator('.devis-element')).toHaveCount(6);
    await expect(page.locator('.devis-element .devis-ligne')).toHaveCount(17);
    await expect(page.locator('#devis-activite-ponderation')).toHaveValue('2-2-3 ou 1-3-3');
    await expect(page.locator('#devis-activite-discipline')).toHaveValue('Français, langue d’enseignement et littérature');

    // Corriger sur place : retoucher, ajouter, retirer (mettre de côté), annuler.
    await page.locator('#devis-element-0 .devis-champ-element').fill('Reconnaître le propos du texte, retouché');
    await page.locator('[data-action="materielDevis.ajouterCritere"][data-param="0"]').click();
    await page.locator('#devis-element-0 .devis-ligne').nth(1).locator('textarea').fill('Critère ajouté à la main.');
    await page.locator('#devis-activite-heures').fill('60');
    await page.locator('#devis-element-5 .devis-menu[data-i="1"]').selectOption('0|ecartees');
    await expect(page.locator('#devis-element-5 .devis-ligne')).toHaveCount(1);
    await expect(page.locator('.devis-cote .devis-ligne textarea').last()).toHaveValue('Correction appropriée du texte.');
    await page.locator('[data-action="materielDevis.annuler"]').click();
    await expect(page.locator('#devis-element-5 .devis-ligne')).toHaveCount(2);

    // ⛔ Jusqu'ici, RIEN n'est écrit.
    expect(await reserve(page)).toBeNull();

    // Sans numéro, rien ne se range.
    await page.locator('#devis-numero').fill('');
    await page.locator('[data-action="materielDevis.accepter"]').click();
    await expect(page.locator('#devis-erreur')).toContainText('numéro de la compétence');
    expect(await reserve(page)).toBeNull();
    await page.locator('#devis-numero').fill('4ef0');

    // Accepter : le devis entre dans la réserve ; la collection des cours n'a pas changé d'un octet.
    await page.locator('[data-action="materielDevis.accepter"]').click();
    await expect(page.locator('#materiel-devis .materiel-confirmation')).toBeVisible();
    const r = await reserve(page);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ code: '4EF0', enonce: 'Analyser des textes littéraires.' });
    expect(r[0].id).toMatch(/^DEVIS_/);
    expect(r[0].elements[0]).toEqual({ texte: 'Reconnaître le propos du texte, retouché', criteres: ['Formulation juste des éléments importants du propos du texte.', 'Critère ajouté à la main.'] });
    expect(r[0].elements.reduce((n, e) => n + e.criteres.length, 0)).toBe(18);
    expect(r[0].activites).toMatchObject({ ponderation: '2-2-3 ou 1-3-3', unites: '2⅓', heures: '60' });
    expect(await lesCours(page)).toBe(coursAvant);

    // Retour à l'accueil : le devis rangé s'y montre, et se rouvre tel qu'il a été rangé.
    await page.locator('#materiel-devis [data-action="materielDevis.fermer"]').click();
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('.devis-ranges li')).toHaveCount(1);
    await expect(page.locator('.devis-ranges li')).toContainText('4EF0');
    await page.locator('[data-action="materielDevis.rouvrir"]').click();
    await expect(page.locator('#devis-element-0 .devis-champ-element')).toHaveValue('Reconnaître le propos du texte, retouché');
    await expect(page.locator('#devis-activite-heures')).toHaveValue('60');
    await expect(page.locator('.devis-cote')).toHaveCount(0);   // les lignes mises de côté ne sont pas gardées
    expect(await lesCours(page)).toBe(coursAvant);
});

test('devis · plusieurs devis ; recoller un code déjà rangé montre l’ancien et le nouveau, rien n’est remplacé avant l’accord', async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await ouvrir(page);
    const coursAvant = await lesCours(page);
    await numeriser(page, '01FB');
    await page.locator('[data-action="materielDevis.accepter"]').click();
    await expect(page.locator('#materiel-devis .materiel-confirmation')).toBeVisible();
    await page.locator('#materiel-devis [data-action="materielDevis.ouvrir"]').click();   // « Numériser un autre devis »
    await page.locator('#devis-zone-collage').fill(devis('01FL'));
    await page.locator('[data-action="materielDevis.lire"]').click();
    await page.locator('[data-action="materielDevis.accepter"]').click();
    await expect(page.locator('#materiel-devis .materiel-confirmation')).toBeVisible();
    expect((await reserve(page)).map((d) => d.code)).toEqual(['01FB', '01FL']);
    const avant = JSON.stringify(await reserve(page));

    // Recoller 01FB, retouché : la comparaison d'abord.
    await page.locator('#materiel-devis [data-action="materielDevis.fermer"]').click();
    await expect(page.locator('.devis-ranges li')).toHaveCount(2);
    await numeriser(page, '01FB');
    await page.locator('#devis-enonce').fill('Énoncé recollé.');
    await page.locator('[data-action="materielDevis.accepter"]').click();
    await expect(page.locator('.devis-comparaison')).toBeVisible();
    await expect(page.locator('.devis-colonne').first()).toContainText('Traduire un matériau musical.');
    await expect(page.locator('.devis-colonne-neuve')).toContainText('Énoncé recollé.');
    expect(JSON.stringify(await reserve(page))).toBe(avant);

    // « Revenir à ma lecture » : la correction reprend où elle était, toujours rien d'écrit.
    await page.locator('[data-action="materielDevis.revenirLecture"]').click();
    await expect(page.locator('#devis-enonce')).toHaveValue('Énoncé recollé.');
    expect(JSON.stringify(await reserve(page))).toBe(avant);

    await page.locator('[data-action="materielDevis.accepter"]').click();
    await page.locator('[data-action="materielDevis.remplacer"]').click();
    await expect(page.locator('#materiel-devis .materiel-confirmation')).toBeVisible();
    const r = await reserve(page);
    expect(r.map((d) => [d.code, d.enonce])).toEqual([['01FB', 'Énoncé recollé.'], ['01FL', 'Gérer sa carrière.']]);
    expect(r[0].id).toBe(JSON.parse(avant)[0].id);          // remplacé à sa place, sous le même id
    expect(r[1]).toEqual(JSON.parse(avant)[1]);             // l'autre devis n'a pas bougé
    expect(await lesCours(page)).toBe(coursAvant);

    // Un devis rouvert dont on change le numéro pour celui d'un AUTRE devis : refusé, rien ne bouge.
    await page.locator('#materiel-devis [data-action="materielDevis.fermer"]').click();
    await page.locator('[data-action="materielDevis.rouvrir"]').first().click();
    await page.locator('#devis-numero').fill('01FL');
    await page.locator('[data-action="materielDevis.accepter"]').click();
    await expect(page.locator('#devis-erreur')).toContainText('porte déjà ce numéro');
    expect((await reserve(page)).map((d) => d.code)).toEqual(['01FB', '01FL']);
});

test('devis · 000Z, sort mélangé : deux gestes de menu le remettent en ordre ; iPad debout sans débord', async ({ page }) => {
    await ouvrir(page);
    await page.setViewportSize({ width: 820, height: 1180 });
    await numeriser(page, '000Z');

    // La lecture honnête : rien sous l'élément 1, quatorze lignes sous le 3, aucun contexte.
    await expect(page.locator('#devis-element-0 .devis-ligne')).toHaveCount(0);
    await expect(page.locator('#devis-element-2 .devis-ligne')).toHaveCount(14);
    await expect(page.locator('#devis-activite-heures')).toHaveValue('45');
    const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(debord, 'la page ne défile pas horizontalement').toBeLessThanOrEqual(0);

    await page.locator('#devis-element-2 .devis-menu[data-i="7"]').selectOption('1|contexte');
    await page.locator('.devis-menu[data-zone="contexte"][data-i="4"]').selectOption('1|element:0');

    await expect(page.locator('.devis-menu[data-zone="contexte"]')).toHaveCount(4);
    await expect(page.locator('#devis-element-0 .devis-ligne')).toHaveCount(3);
    await expect(page.locator('#devis-element-2 .devis-ligne')).toHaveCount(7);
    await expect(page.locator('#devis-element-0 .devis-ligne textarea').first()).toHaveValue('Identification juste des mots et des expressions idiomatiques.');
});

// Break-test (28 nov.) : `e` remplacé par l'identité dans materiel-devis.js → l'image piégée entre dans la page, rouge.
test('devis · un collage piégé n’entre pas dans la page, ni dans la liste de l’accueil ; rien de reconnaissable, un message', async ({ page }) => {
    const requetes = [];
    page.on('request', (r) => { if (r.url().includes('piege-devis')) requetes.push(r.url()); });
    await ouvrir(page);
    await page.locator('[data-action="materielDevis.ouvrir"]').click();

    await page.locator('#devis-zone-collage').fill('Une liste d’épicerie, sans rien d’un devis.');
    await page.locator('[data-action="materielDevis.lire"]').click();
    await expect(page.locator('#devis-erreur')).toContainText('rien reconnu');
    await expect(page.locator('.devis-feuille')).toHaveCount(0);

    const piege = '<img src="http://127.0.0.1:9/piege-devis.png" onerror="window.__piegeDevis=1">';
    await page.locator('#devis-zone-collage').fill('Code : 4EF0\nÉnoncé de la compétence\nAnalyser ' + piege + '\nContexte de réalisation\n• Seul ' + piege +
        '\nÉléments de la compétence\n1. Lire ' + piege + '\n• Critère ' + piege + '\n\nPied ' + piege + '\nActivités d’apprentissage\nDiscipline : ' + piege);
    await page.locator('[data-action="materielDevis.lire"]').click();
    await expect(page.locator('.devis-element')).toHaveCount(1);
    await page.locator('#devis-element-0 .devis-menu[data-i="0"]').selectOption('0|contexte');   // le menu rend le texte de l'élément
    await page.locator('[data-action="materielDevis.accepter"]').click();
    await expect(page.locator('#materiel-devis .materiel-confirmation')).toBeVisible();
    await page.locator('#materiel-devis [data-action="materielDevis.fermer"]').click();
    await expect(page.locator('.devis-ranges li')).toHaveCount(1);
    expect(await page.locator('#conception-materiel img[src*="piege"]').count()).toBe(0);
    expect(await page.evaluate(() => window.__piegeDevis)).toBeUndefined();
    expect(requetes).toEqual([]);
    expect((await reserve(page))[0].enonce).toContain('<img');   // gardé comme du texte, tel que collé
});

// ---------------------------------------------------------------------------------------------------------------------
// SECOND AMENDEMENT (28 nov. 2026, 10 h 03, réponses de Grégoire)
// ---------------------------------------------------------------------------------------------------------------------

const reserveDemo = (page) => page.evaluate(async () => (await db.get('demo_devisMinisteriels')) || null);

test('amendement 2 · la démonstration : un devis rangé dans la démo n’entre pas dans la réserve réelle, et n’y paraît pas après la sortie', async ({ page }) => {
    test.setTimeout(120000);
    page.on('dialog', (d) => d.accept());
    await ouvrir(page);
    // Avant la visite : un devis réel, rangé hors de la démo.
    await numeriser(page, '01FB');
    await page.locator('[data-action="materielDevis.accepter"]').click();
    await expect(page.locator('#materiel-devis .materiel-confirmation')).toBeVisible();
    const reelleAvant = JSON.stringify(await reserve(page));
    expect(JSON.parse(reelleAvant).map((d) => d.code)).toEqual(['01FB']);

    // La visite : dans la démo, la liste ne montre pas le devis réel ; on y range 4EF0.
    await page.evaluate(() => activerModeDemo());
    await expect.poll(() => page.evaluate(() => estEnModeDemo())).toBe(true);
    await page.evaluate(() => window.afficherSection('conception'));
    await page.evaluate(() => window.materielDevis.fermer());
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('.devis-ranges li')).toHaveCount(0);
    await numeriser(page, '4EF0');
    await page.locator('[data-action="materielDevis.accepter"]').click();
    await expect(page.locator('#materiel-devis .materiel-confirmation')).toBeVisible();
    expect((await reserveDemo(page)).map((d) => d.code)).toEqual(['4EF0']);
    expect(JSON.stringify(await reserve(page)), 'la réserve réelle pendant la démo').toBe(reelleAvant);
    await page.locator('#materiel-devis [data-action="materielDevis.fermer"]').click();
    await expect(page.locator('.devis-ranges li')).toHaveCount(1);
    await expect(page.locator('.devis-ranges li')).toContainText('4EF0');

    // La sortie : la réserve réelle est identique à ce qu'elle était avant la visite ; l'accueil ne montre que le devis réel.
    await page.evaluate(() => desactiverModeDemo());
    await expect.poll(() => page.evaluate(() => estEnModeDemo())).toBe(false);
    expect(JSON.stringify(await reserve(page)), 'la réserve réelle après la démo').toBe(reelleAvant);
    await page.evaluate(() => window.afficherSection('conception'));
    await page.evaluate(() => window.materielDevis.fermer());
    await expect(page.locator('.devis-ranges li')).toHaveCount(1);
    await expect(page.locator('.devis-ranges li')).toContainText('01FB');
});

test('amendement 2 · depuis un étiquetage en brouillon : le bouton mène aux devis, le brouillon reste intact et se retrouve au retour', async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await ouvrir(page);
    await numeriser(page, '4EF0');
    await page.locator('[data-action="materielDevis.accepter"]').click();
    await page.locator('#materiel-devis [data-action="materielDevis.fermer"]').click();

    // Une grille collée : l'étiquetage s'ouvre, son brouillon s'écrit, l'accueil est caché.
    await page.evaluate(() => window.materielDissection.ouvrir(window.materielDissectionLecture.exempleDoc()));
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await expect(page.locator('#materiel-accueil')).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.materielDissection.aUnBrouillon())).toBe(true);
    const brouillon = () => page.evaluate(() => JSON.stringify(db.getSync(cle('brouillonDissection'), null)));
    const avant = await brouillon();
    expect(avant).not.toBe('null');

    // Le bouton de l'en-tête : l'écran des devis, avec les devis rangés (l'accueil reste caché).
    await page.locator('#materiel-dissection [data-action="materielDevis.ouvrirDepuisEtiquetage"]').click();
    await expect(page.locator('#materiel-devis')).toBeVisible();
    await expect(page.locator('#materiel-dissection')).toBeHidden();
    await expect(page.locator('#materiel-devis .devis-ranges li')).toHaveCount(1);
    await expect(page.locator('#materiel-devis .devis-tete [data-action="materielDevis.fermer"]')).toHaveText('Revenir à mon étiquetage');
    expect(await brouillon()).toBe(avant);

    // Rouvrir un devis depuis là, puis revenir : l'étiquetage se retrouve tel quel.
    await page.locator('#materiel-devis [data-action="materielDevis.rouvrir"]').click();
    await expect(page.locator('#devis-numero')).toHaveValue('4EF0');
    await page.locator('#materiel-devis .devis-tete [data-action="materielDevis.fermer"]').click();
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await expect(page.locator('#materiel-devis')).toBeHidden();
    await expect(page.locator('#dissection-contenu .dissection-feuille tr')).toHaveCount(8);
    expect(await brouillon()).toBe(avant);
});

test('amendement 2 · l’import par cases : un devis neuf entre ; un code déjà rangé au contenu différent ne remplace rien sans sa case, l’ancien et le nouveau montrés', async ({ page }) => {
    const dialogues = [];
    page.on('dialog', async (d) => { dialogues.push(d.message()); if (d.type() === 'confirm') await d.dismiss(); else await d.accept(); });   // « Recharger la page ? » : non
    await ouvrir(page);
    const coursAvant = await lesCours(page);
    for (const code of ['4EF0', '000Z']) {
        await numeriser(page, code);
        await page.locator('[data-action="materielDevis.accepter"]').click();
        await expect(page.locator('#materiel-devis .materiel-confirmation')).toBeVisible();
        await page.locator('#materiel-devis [data-action="materielDevis.fermer"]').click();
    }
    const mienne = await reserve(page);

    // Le fichier du collègue : 4EF0 identique, 000Z au contenu différent, 01FB neuf. Il ne porte que des devis.
    const fichier = await page.evaluate((r) => {
        const L = window.devisLecture;
        const neuf = L.pourReserve(L.lire(r.texte01FB));
        const autre = Object.assign({}, r.mienne[1], { id: 'DEVIS_DU_COLLEGUE', enonce: 'Énoncé du collègue.' });
        return JSON.stringify({ devisMinisteriels: [Object.assign({}, r.mienne[0], { id: 'AUTRE' }), autre, Object.assign(neuf, { id: 'DEVIS_NEUF_DU_COLLEGUE' })] });
    }, { mienne, texte01FB: devis('01FB') });
    // Le vrai chemin : Réglages › « Importer », puis le fichier choisi dans la fenêtre.
    const ouvrirLeFichier = async () => {
        await page.evaluate(() => ouvrirModalImport());
        await page.locator('#fichierImport').setInputFiles({ name: 'devis-du-collegue.json', mimeType: 'application/json', buffer: Buffer.from(fichier, 'utf8') });
    };

    await ouvrirLeFichier();
    await expect(page.locator('.devis-import-ligne')).toHaveCount(3);
    await expect(page.locator('.devis-import-ligne').nth(0)).toContainText('identique');
    await expect(page.locator('.devis-import-ligne').nth(0).locator('input')).toHaveCount(0);
    // Le code déjà rangé, différent : case NON cochée, et les deux devis côte à côte.
    const different = page.locator('.devis-import-ligne').nth(1);
    await expect(different.locator('.import-item-devis')).not.toBeChecked();
    await different.locator('summary').click();
    await expect(different.locator('.devis-colonne').first()).toContainText('Communiquer dans une langue moderne de façon restreinte.');
    await expect(different.locator('.devis-colonne-neuve')).toContainText('Énoncé du collègue.');
    await expect(page.locator('.devis-import-ligne').nth(2).locator('.import-item-devis')).toBeChecked();
    expect(JSON.stringify(await reserve(page)), 'ouvrir la fenêtre n’écrit rien').toBe(JSON.stringify(mienne));

    // Importer tel que proposé : seul le devis neuf entre ; 000Z garde son contenu d'ici.
    await page.locator('[data-action="executerImportSelectif"]').click();
    await expect.poll(async () => (await reserve(page)).map((d) => d.code)).toEqual(['4EF0', '000Z', '01FB']);
    let r = await reserve(page);
    expect(r[1]).toEqual(mienne[1]);
    expect(r[0]).toEqual(mienne[0]);
    expect(dialogues.join(' ')).toContain('1 devis ministériel(s)');

    // Rouvrir le fichier et cocher la case de 000Z : c'est l'accord ; il est remplacé à sa place, sous l'id d'ici.
    await ouvrirLeFichier();
    await expect(page.locator('.devis-import-ligne').nth(2)).toContainText('identique');
    await page.locator('.devis-import-ligne').nth(1).locator('.import-item-devis').check();
    await page.locator('[data-action="executerImportSelectif"]').click();
    await expect.poll(async () => (await reserve(page))[1].enonce).toBe('Énoncé du collègue.');
    r = await reserve(page);
    expect(r.map((d) => [d.id, d.code])).toEqual([[mienne[0].id, '4EF0'], [mienne[1].id, '000Z'], [r[2].id, '01FB']]);
    expect(await lesCours(page)).toBe(coursAvant);
});
