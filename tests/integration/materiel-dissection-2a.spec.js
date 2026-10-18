import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRILLE_B, enHtml } from '../unit/_helpers/grilles-fictives-dissection.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 2a (consigne du 18 oct. 2026), dans un vrai WebKit.
//
//   · l'exemple fictif, étiqueté par des événements de POINTEUR ; tant qu'il manque le Titre, « Créer ma
//     grille » est refusé, sa raison écrite à côté ;
//   · à 820 px, le bouton fait au moins 44 px et la page ne défile pas de côté ;
//   · un échec de l'écriture affiche son message, et la dissection reste intacte pour réessayer ;
//   · créée : la confirmation (« sur 30 », « Aller plus loin avec ta grille », « Coller une autre grille ») ;
//     la grille est rangée, puis retrouvée dans Grilles de critères avec ses critères et ses points.
//
// Corrections du verdict du 18 oct. :
//   · C1 — les réponses de (b) gardent leur ordre jusque dans Grilles de critères (« 1 point », « 0,5 point », « 0 point ») ;
//   · C2 — une grille en points dit « 30 points » et « Points », jamais « % » ; une grille en % garde ses « % » ;
//   · C3 — le champ « Nom de ta grille » : prérempli, 44 px et 16 px ; l'exemple recréé est refusé, renommé, créé.

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
    // Un témoin, pas un délai (même que la spec du lot 1).
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

/**
 * Une étiquette en main, puis un geste de pointeur sur TOUS les morceaux dont le texte est dans la
 * liste (dans l'ordre de la feuille) : appuyer sur le premier, passer sur les suivants, relâcher.
 */
async function etiqueter(page, type, textes) {
    await page.locator('#dissection-palette [data-param="' + type + '"]').click();
    await page.evaluate((ts) => {
        const blocs = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].filter((b) => ts.includes(b.textContent));
        const centre = (b) => { b.scrollIntoView({ block: 'center', inline: 'center' }); const r = b.getBoundingClientRect(); return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }; };
        const ev = (t, b) => new PointerEvent(t, Object.assign({ bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true }, centre(b)));
        blocs[0].dispatchEvent(ev('pointerdown', blocs[0]));
        blocs.slice(1).forEach((b) => b.dispatchEvent(ev('pointermove', b)));
        const der = blocs[blocs.length - 1];
        der.dispatchEvent(ev('pointerup', der));
    }, textes);
    await page.keyboard.press('Escape');
}

/** Un VRAI événement « coller » sur la zone, avec le HTML au presse-papiers (comme Word ou Pages). */
async function coller(page, html) {
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (k) => (k === 'text/html' ? h : '') } });
        zone.dispatchEvent(ev);
    }, html);
}

const CRITERES = ['L’élève résume l’œuvre avec justesse', 'L’élève relève des procédés d’écriture',
    'L’élève relie l’œuvre aux notions du cours', 'L’élève exprime une appréciation argumentée'];
const DESCRIPTEURS = ['Résumé absent ou erroné', 'Résume quelques événements', 'Résume l’essentiel', 'Résume avec précision et concision',
    'Aucun procédé relevé', 'Relève un procédé', 'Relève quelques procédés', 'Relève et illustre plusieurs procédés',
    'Liens absents', 'Établit un lien', 'Établit quelques liens', 'Établit des liens nombreux et pertinents',
    'Appréciation absente', 'Donne une opinion', 'Justifie son opinion', 'Argumente avec nuance'];

/** L'exemple fictif, étiqueté en points (sans son Titre). */
async function etiqueterExemple(page) {
    await etiqueter(page, 'section', ['PARTIE A : COMPRÉHENSION', 'PARTIE B : RÉFLEXION']);
    await etiqueter(page, 'niveau', ['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable']);
    await etiqueter(page, 'critere', CRITERES);
    await etiqueter(page, 'souscritere', ['· Repérage des événements principaux', '· Exactitude des faits rapportés']);
    await etiqueter(page, 'descripteur', DESCRIPTEURS);
    await etiqueter(page, 'points', ['2', '3-4', '5', '3', '4', '4-5', '6-7', '8-10', '6-8', '9-10']);
    await etiqueter(page, 'description', ['Rendre compte d’une lecture personnelle et la relier aux notions vues en classe.']);
    await etiqueter(page, 'total', ['TOTAL : / 30']);
}

test('dissection 2a · l’exemple étiqueté, refusé sans nom, un échec réessayé, créé, retrouvé dans Grilles de critères', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirConception(page);
    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await expect(page.locator('#dissection-creer')).toBeHidden();   // rien d'étiqueté, rien à créer
    await etiqueterExemple(page);

    // Sans Titre ni nom tapé : le bouton est refusé, sa raison écrite à côté ; le champ est vide.
    const bouton = page.locator('#dissection-creer [data-action="materielDissection.creer"]');
    const champ = page.locator('#dissection-nom-grille');
    await expect(bouton).toBeDisabled();
    await expect(champ).toHaveValue('');
    await expect(page.locator('#dissection-creer-raisons')).toContainText('un nom pour ta grille');
    await expect(page.locator('#dissection-sans-place')).toBeEmpty();

    // C3 : le Titre étiqueté préremplit le champ.
    await etiqueter(page, 'titre', ['Journal de lecture']);
    await expect(champ).toHaveValue('Journal de lecture');
    await expect(bouton).toBeEnabled();
    await expect(page.locator('#dissection-creer-raisons')).toHaveCount(0);
    await expect(page.locator('#dissection-constats')).toContainText('Somme des pondérations : 30 · ton total : 30 ✓');

    // À 820 px : le bouton et le champ font au moins 44 px, le champ écrit à 16 px au moins, la page ne défile pas de côté.
    const mesure = await page.evaluate(() => {
        const b = document.querySelector('[data-action="materielDissection.creer"]'), c = document.getElementById('dissection-nom-grille');
        b.scrollIntoView({ block: 'center' });
        return { hauteur: b.getBoundingClientRect().height, champ: c.getBoundingClientRect().height, police: parseFloat(getComputedStyle(c).fontSize),
            debord: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    expect(mesure.hauteur).toBeGreaterThanOrEqual(44);
    expect(mesure.champ).toBeGreaterThanOrEqual(44);
    expect(mesure.police).toBeGreaterThanOrEqual(16);
    expect(mesure.debord).toBeLessThanOrEqual(0);
    await page.screenshot({ path: test.info().outputPath('dissection-2a-820.png') });

    // Un échec de l'écriture : son message, et la dissection intacte.
    const avant = await page.evaluate(() => Object.keys(window.materielDissection.etatCourant().liens).length);
    const grillesAvant = await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).length);
    await page.evaluate(() => {
        window.__creerVrai = window.materielCreation.creer;
        window.materielCreation.creer = async () => ({ erreur: window.materielCreation.MESSAGES.echec });
    });
    await bouton.click();
    await expect(page.locator('#dissection-creer [role="alert"]')).toHaveText('La création n’a pas abouti, et rien n’a été créé. Tu pourrais réessayer.');
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await expect(bouton).toBeFocused();
    expect(await page.evaluate(() => Object.keys(window.materielDissection.etatCourant().liens).length)).toBe(avant);
    expect(await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).length)).toBe(grillesAvant);

    // Réessayer : créée.
    await page.evaluate(() => { window.materielCreation.creer = window.__creerVrai; });
    await bouton.click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Journal de lecture » est créée');
    await expect(page.locator('#materiel-titre-cree')).toBeFocused();
    await expect(page.locator('#materiel-dissection')).toBeHidden();
    await expect(page.locator('.materiel-carte-cree')).toContainText('4 critères, sur 30.');
    await expect(page.locator('.materiel-plus-loin h3')).toHaveText('Aller plus loin avec ta grille');
    await expect(page.locator('.materiel-confirmation [data-action="materiel.recommencer"]')).toHaveText('Coller une autre grille');

    expect(await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).length)).toBe(grillesAvant + 1);
    const g = await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).slice(-1)[0]);
    expect(g.nom).toBe('Journal de lecture');
    expect(g.description).toBe('Rendre compte d’une lecture personnelle et la relier aux notions vues en classe.');
    expect(g.criteres.map((c) => [c.nom, c.ponderation])).toEqual([
        ['Partie A : compréhension – L’élève résume l’œuvre avec justesse', 5],
        ['Partie A : compréhension – L’élève relève des procédés d’écriture', 5],
        ['Partie B : réflexion – L’élève relie l’œuvre aux notions du cours', 10],
        ['Partie B : réflexion – L’élève exprime une appréciation argumentée', 10]
    ]);
    expect(g.criteres[0].descripteurs.parNiveau['Satisfaisant']).toBe('Résume l’essentiel\n3-4');
    expect(g.criteres.every((c) => !('echelleId' in (c.descripteurs || {})))).toBe(true);

    // Retrouvée dans Grilles de critères : ses critères, ses niveaux et leurs points, ses pondérations.
    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();
    const liste = page.locator('#listeCriteres');
    await expect(liste.locator('.critere-rangee input[data-champ="nom"]')).toHaveCount(4);
    const vus = await liste.locator('.critere-rangee').evaluateAll((rs) => rs.map((r) => [
        r.querySelector('input[data-champ="nom"]').value, r.querySelector('input[data-champ="ponderation"]')?.value]));
    expect(vus).toEqual(g.criteres.map((c) => [c.nom, String(c.ponderation)]));
    await expect(liste.locator('.grille-attendu-niveau strong').first()).toHaveText('Insuffisant');
    // Les points sur une ligne à part (`white-space: pre-line`) : innerText garde le saut de ligne.
    expect(await liste.locator('.grille-attendu-niveau p').nth(2).evaluate((p) => p.innerText)).toBe('Résume l’essentiel\n3-4');
    // C2 : des points, jamais « % » — le total et la colonne.
    // Break-test (fait le 18 oct.) : `ponderationEnPoints` rendant toujours false → rouge ici.
    await expect(page.locator('#totalPonderationAffichage')).toHaveText('30 points');
    await expect(liste.locator('.critere-rangee label', { hasText: /^Points$/ })).toHaveCount(4);
    await expect(liste).not.toContainText('Pond. (%)');

    // Une grille de l'éditeur en pourcentages garde ses « % ».
    await page.evaluate(async () => {
        const g = { id: 'GRILLE_POURCENT_2A', nom: 'Grille fictive en pourcentages', type: 'holistique', criteres: [
            { id: 'CR_P1', nom: 'Critère fictif un', ponderation: 40, type: 'holistique', description: '' },
            { id: 'CR_P2', nom: 'Critère fictif deux', ponderation: 60, type: 'holistique', description: '' }] };
        db.setSync(cle('grillesTemplates'), db.getSync(cle('grillesTemplates'), []).concat([g]));
        await window.ouvrirGrilleDepuisListe('GRILLE_POURCENT_2A');
    });
    await expect(page.locator('#totalPonderationAffichage')).toHaveText('100%');
    await expect(liste.locator('.critere-rangee label', { hasText: 'Pond. (%)' })).toHaveCount(2);
    expect(erreurs).toEqual([]);
});

test('dissection 2a · C3 : l’exemple recréé est refusé (nom pris), renommé dans le champ, créé ; les deux grilles rangées', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    const bouton = page.locator('#dissection-creer [data-action="materielDissection.creer"]');
    const champ = page.locator('#dissection-nom-grille');

    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await etiqueterExemple(page);
    await etiqueter(page, 'titre', ['Journal de lecture']);
    await bouton.click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Journal de lecture » est créée');

    // « Coller une autre grille », puis le même exemple : refusé, la raison à côté du champ.
    await page.locator('.materiel-confirmation [data-action="materiel.recommencer"]').click();
    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await etiqueterExemple(page);
    await etiqueter(page, 'titre', ['Journal de lecture']);
    await expect(champ).toHaveValue('Journal de lecture');
    await expect(bouton).toBeDisabled();
    await expect(page.locator('#dissection-creer-raisons')).toContainText('un autre nom de grille : « Journal de lecture » existe déjà dans ce trimestre');
    await expect(champ).toHaveAttribute('aria-describedby', 'dissection-creer-raisons');

    // Le nom changé sur place : le champ garde le focus, et l'emporte sur le Titre étiqueté.
    await champ.fill('Journal de lecture, groupe 2');
    await expect(champ).toBeFocused();
    await expect(bouton).toBeEnabled();
    await etiqueter(page, 'total', ['TOTAL : / 30']);   // un geste de plus : le champ ne revient pas au Titre
    await expect(champ).toHaveValue('Journal de lecture, groupe 2');
    await bouton.click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Journal de lecture, groupe 2 » est créée');

    const noms = await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).map((g) => g.nom));
    expect(noms.filter((n) => n.startsWith('Journal de lecture'))).toEqual(['Journal de lecture', 'Journal de lecture, groupe 2']);
    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();
    await expect(page.locator('#nomGrilleTemplate')).toHaveValue('Journal de lecture, groupe 2');
    expect(erreurs).toEqual([]);
});

test('dissection 2a · C1 : les réponses de (b) gardent leur ordre jusque dans Grilles de critères', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    await coller(page, enHtml(GRILLE_B));
    await etiqueter(page, 'critere', ['Question 1 : le sens du passage fictif']);
    await etiqueter(page, 'section', ['Partie B : le vocabulaire fictif']);
    await etiqueter(page, 'descripteur', ['Réponse juste et complète', 'Réponse juste, mais incomplète', 'Réponse absente ou fausse',
        'Définit les trois termes', 'Définit deux termes', 'Définit un seul terme, ou en donne', 'Aucun terme défini',
        'Donne un exemple juste', 'Donne un exemple approximatif', 'Ne donne aucun exemple']);
    await etiqueter(page, 'suite', ['un exemple sans le définir']);
    await etiqueter(page, 'points', ['4 points', '2 points', '0 point', '3', '2', '1', '0', '0,5']);
    await etiqueter(page, 'ponderation', ['/2']);
    await page.locator('#dissection-nom-grille').fill('Questionnaire fictif');
    await page.locator('#dissection-creer [data-action="materielDissection.creer"]').click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Questionnaire fictif » est créée');

    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();
    await expect(page.locator('#listeCriteres .grille-attendu')).toHaveCount(3);
    const titres = await page.locator('#listeCriteres .grille-attendu').evaluateAll((rs) =>
        rs.map((r) => [...r.querySelectorAll('.grille-attendu-niveau strong')].map((x) => x.textContent)));
    expect(titres).toEqual([['4 points', '2 points', '0 point'], ['3 points', '2 points', '1 point', '0 point'], ['1 point', '0,5 point', '0 point']]);
    expect(erreurs).toEqual([]);
});

test('dissection 2a · une grille seulement en niveaux : pas de bouton, la ligne « bientôt »', async ({ page }) => {
    await ouvrirConception(page);
    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await etiqueter(page, 'titre', ['Journal de lecture']);
    await etiqueter(page, 'niveau', ['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable']);
    await etiqueter(page, 'critere', CRITERES);
    await etiqueter(page, 'descripteur', DESCRIPTEURS);
    await expect(page.locator('#dissection-creer [data-action="materielDissection.creer"]')).toHaveCount(0);
    await expect(page.locator('#dissection-creer .dissection-creer-bientot')).toHaveText('La création des grilles en niveaux arrive bientôt. Pour l’instant, l’application crée les grilles qui ont des points.');
});
