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
// Les six gestes : l'accueil offre l'entrée ; le cours se choisit ; le devis se colle ; la lecture se montre ; elle se
// corrige sur place ; elle s'accepte. Ce que Vitest ne prouve pas :
//   · RIEN NE S'ENREGISTRE D'OFFICE : la fiche du cours est lue en base après chaque geste d'avant l'accord ;
//   · une fiche déjà remplie n'est remplacée qu'après le second accord, l'ancien et le nouveau côte à côte ;
//   · un collage piégé n'entre pas dans la page ;
//   · 000Z se remet en ordre en deux gestes de menu.
// Cours fictifs ; les devis sont des documents publics du ministère.

async function ouvrir(page, cours) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(async (liste) => {
        for (const c of liste) await window.CoursEntite.creer(c);
        window.afficherSection('conception');
    }, cours);
    await expect(page.locator('#materiel-accueil')).toBeVisible();
}
const fiche = (page, code) => page.evaluate(async (c) => (await window.CoursEntite.obtenirTous()).find((x) => x.codeCours === c), code);
const FRANCAIS = { codeCours: '601-101-MQ', nomCours: 'Écriture fictive', discipline: '601 Français' };
const ESPAGNOL = { codeCours: '607-ZZA-03', nomCours: 'Espagnol fictif', discipline: '607 Espagnol' };

test('devis · les six gestes avec 4EF0 : rien n’est écrit avant « Ranger », puis la fiche reçoit le tout', async ({ page }) => {
    await ouvrir(page, [FRANCAIS, ESPAGNOL]);

    // 1. L'accueil offre deux entrées : la grille, inchangée, et le devis.
    await expect(page.locator('#materiel-zone-collage')).toBeVisible();
    await page.locator('[data-action="materielDevis.ouvrir"]').click();
    await expect(page.locator('#materiel-devis')).toBeVisible();
    await expect(page.locator('#materiel-accueil')).toBeHidden();
    await expect(page.locator('#devis-titre')).toBeFocused();   // règle SPA

    // 2 et 3. Sans cours choisi, la lecture ne part pas ; le collage n'est pas perdu au choix du cours.
    await page.locator('#devis-zone-collage').fill(devis('4EF0'));
    await page.locator('[data-action="materielDevis.lire"]').click();
    await expect(page.locator('#devis-erreur')).toBeVisible();
    await expect(page.locator('.devis-feuille')).toHaveCount(0);
    await page.locator('#devis-cours').selectOption({ label: '601-101-MQ - Écriture fictive' });
    await expect(page.locator('#devis-zone-collage')).toHaveValue(/Analyser des textes littéraires/);
    await page.locator('[data-action="materielDevis.lire"]').click();

    // 4. La lecture, rangée comme le tableau : le numéro et l'énoncé en tête, les éléments, leurs critères dessous.
    await expect(page.locator('#devis-numero')).toHaveValue('4EF0');
    await expect(page.locator('#devis-enonce')).toHaveValue('Analyser des textes littéraires.');
    await expect(page.locator('.devis-element')).toHaveCount(6);
    await expect(page.locator('.devis-element .devis-ligne')).toHaveCount(17);
    await expect(page.locator('#devis-element-4 .devis-ligne')).toHaveCount(8);

    // 5. Corriger sur place : retoucher, ajouter, retirer (mettre de côté), annuler.
    await page.locator('#devis-element-0 .devis-champ-element').fill('Reconnaître le propos du texte, retouché');
    await page.locator('[data-action="materielDevis.ajouterCritere"][data-param="0"]').click();
    await page.locator('#devis-element-0 .devis-ligne').nth(1).locator('textarea').fill('Critère ajouté à la main.');
    await page.locator('#devis-element-5 .devis-menu[data-i="1"]').selectOption('0|ecartees');
    await expect(page.locator('#devis-element-5 .devis-ligne')).toHaveCount(1);
    await expect(page.locator('.devis-cote .devis-ligne textarea').last()).toHaveValue('Correction appropriée du texte.');
    await page.locator('[data-action="materielDevis.annuler"]').click();
    await expect(page.locator('#devis-element-5 .devis-ligne')).toHaveCount(2);

    // ⛔ Jusqu'ici, RIEN n'est écrit dans la fiche.
    let f = await fiche(page, '601-101-MQ');
    expect([f.numeroCompetence, f.competence, f.elementsCompetence, f.devisCompetence]).toEqual(['', '', '', undefined]);

    // 6. Accepter : la fiche était vide, elle reçoit le tout ; l'autre cours n'a pas bougé.
    await page.locator('[data-action="materielDevis.accepter"]').click();
    await expect(page.locator('#materiel-devis .materiel-confirmation')).toBeVisible();
    f = await fiche(page, '601-101-MQ');
    expect(f.numeroCompetence).toBe('4EF0');
    expect(f.competence).toBe('Analyser des textes littéraires.');
    expect(f.elementsCompetence.split('\n')).toHaveLength(6);
    expect(f.elementsCompetence.split('\n')[0]).toBe('1. Reconnaître le propos du texte, retouché');
    expect(f.devisCompetence.elements[0].criteres).toEqual(['Formulation juste des éléments importants du propos du texte.', 'Critère ajouté à la main.']);
    expect(f.devisCompetence.elements.reduce((n, e) => n + e.criteres.length, 0)).toBe(18);
    expect(f.nomCours).toBe('Écriture fictive');
    expect((await fiche(page, '607-ZZA-03')).numeroCompetence).toBe('');

    // Retour à l'accueil : les deux entrées sont de nouveau là.
    await page.locator('#materiel-devis [data-action="materielDevis.fermer"]').click();
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('#materiel-devis')).toBeHidden();
});

test('devis · une fiche déjà remplie : l’ancien et le nouveau côte à côte, rien n’est remplacé avant l’accord', async ({ page }) => {
    await ouvrir(page, [Object.assign({ numeroCompetence: '4EF0', competence: 'Ancien énoncé', elementsCompetence: '• Ancien élément un\n• Ancien élément deux' }, FRANCAIS)]);
    await page.locator('[data-action="materielDevis.ouvrir"]').click();
    await page.locator('#devis-cours').selectOption({ label: '601-101-MQ - Écriture fictive' });
    await expect(page.locator('.devis-deja')).toBeVisible();
    await page.locator('#devis-zone-collage').fill(devis('01FB'));
    await page.locator('[data-action="materielDevis.lire"]').click();
    await page.locator('[data-action="materielDevis.accepter"]').click();

    await expect(page.locator('.devis-comparaison')).toBeVisible();
    await expect(page.locator('.devis-colonne').first()).toContainText('Ancien élément deux');
    await expect(page.locator('.devis-colonne-neuve')).toContainText('Traduire un matériau musical.');
    let f = await fiche(page, '601-101-MQ');
    expect([f.numeroCompetence, f.competence, f.devisCompetence]).toEqual(['4EF0', 'Ancien énoncé', undefined]);

    // « Revenir à ma lecture » : la correction reprend où elle était, toujours rien d'écrit.
    await page.locator('[data-action="materielDevis.revenirLecture"]').click();
    await expect(page.locator('#devis-numero')).toHaveValue('01FB');
    expect((await fiche(page, '601-101-MQ')).competence).toBe('Ancien énoncé');

    await page.locator('[data-action="materielDevis.accepter"]').click();
    await page.locator('[data-action="materielDevis.remplacer"]').click();
    await expect(page.locator('#materiel-devis .materiel-confirmation')).toBeVisible();
    f = await fiche(page, '601-101-MQ');
    expect(f.numeroCompetence).toBe('01FB');
    expect(f.elementsCompetence).toBe('1. Solfier à première vue un matériau musical.\n2. Reproduire par écrit un matériau musical entendu.');
    expect(f.devisCompetence.contexte).toHaveLength(2);
});

test('devis · 000Z, sort mélangé : deux gestes de menu le remettent en ordre ; iPad debout sans débord', async ({ page }) => {
    await ouvrir(page, [ESPAGNOL]);
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.locator('[data-action="materielDevis.ouvrir"]').click();
    await page.locator('#devis-cours').selectOption({ label: '607-ZZA-03 - Espagnol fictif' });
    await page.locator('#devis-zone-collage').fill(devis('000Z'));
    await page.locator('[data-action="materielDevis.lire"]').click();

    // La lecture honnête : rien sous l'élément 1, quatorze lignes sous le 3, aucun contexte.
    await expect(page.locator('#devis-element-0 .devis-ligne')).toHaveCount(0);
    await expect(page.locator('#devis-element-2 .devis-ligne')).toHaveCount(14);
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
test('devis · un collage piégé n’entre pas dans la page ; rien de reconnaissable, un message', async ({ page }) => {
    const requetes = [];
    page.on('request', (r) => { if (r.url().includes('piege-devis')) requetes.push(r.url()); });
    await ouvrir(page, [FRANCAIS]);
    await page.locator('[data-action="materielDevis.ouvrir"]').click();
    await page.locator('#devis-cours').selectOption({ label: '601-101-MQ - Écriture fictive' });

    await page.locator('#devis-zone-collage').fill('Une liste d’épicerie, sans rien d’un devis.');
    await page.locator('[data-action="materielDevis.lire"]').click();
    await expect(page.locator('#devis-erreur')).toContainText('rien reconnu');
    await expect(page.locator('.devis-feuille')).toHaveCount(0);

    const piege = '<img src="http://127.0.0.1:9/piege-devis.png" onerror="window.__piegeDevis=1">';
    await page.locator('#devis-zone-collage').fill('Code : 4EF0\nÉnoncé de la compétence\nAnalyser ' + piege + '\nContexte de réalisation\n• Seul ' + piege +
        '\nÉléments de la compétence\n1. Lire ' + piege + '\n• Critère ' + piege + '\n\nPied ' + piege);
    await page.locator('[data-action="materielDevis.lire"]').click();
    await expect(page.locator('.devis-element')).toHaveCount(1);
    await page.locator('#devis-element-0 .devis-menu[data-i="0"]').selectOption('0|contexte');   // le menu rend le texte de l'élément
    await page.locator('[data-action="materielDevis.accepter"]').click();
    await expect(page.locator('#materiel-devis .materiel-confirmation')).toBeVisible();
    expect(await page.locator('#materiel-devis img').count()).toBe(0);
    expect(await page.evaluate(() => window.__piegeDevis)).toBeUndefined();
    expect(requetes).toEqual([]);
    expect((await fiche(page, '601-101-MQ')).competence).toContain('<img');   // gardé comme du texte, tel que collé
});
