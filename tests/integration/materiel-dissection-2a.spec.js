import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

const CRITERES = ['L’élève résume l’œuvre avec justesse', 'L’élève relève des procédés d’écriture',
    'L’élève relie l’œuvre aux notions du cours', 'L’élève exprime une appréciation argumentée'];
const DESCRIPTEURS = ['Résumé absent ou erroné', 'Résume quelques événements', 'Résume l’essentiel', 'Résume avec précision et concision',
    'Aucun procédé relevé', 'Relève un procédé', 'Relève quelques procédés', 'Relève et illustre plusieurs procédés',
    'Liens absents', 'Établit un lien', 'Établit quelques liens', 'Établit des liens nombreux et pertinents',
    'Appréciation absente', 'Donne une opinion', 'Justifie son opinion', 'Argumente avec nuance'];

test('dissection 2a · l’exemple étiqueté, refusé sans Titre, un échec réessayé, créé, retrouvé dans Grilles de critères', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirConception(page);
    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await expect(page.locator('#dissection-creer')).toBeHidden();   // rien d'étiqueté, rien à créer

    await etiqueter(page, 'section', ['PARTIE A : COMPRÉHENSION', 'PARTIE B : RÉFLEXION']);
    await etiqueter(page, 'niveau', ['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable']);
    await etiqueter(page, 'critere', CRITERES);
    await etiqueter(page, 'souscritere', ['· Repérage des événements principaux', '· Exactitude des faits rapportés']);
    await etiqueter(page, 'descripteur', DESCRIPTEURS);
    await etiqueter(page, 'points', ['2', '3-4', '5', '3', '4', '4-5', '6-7', '8-10', '6-8', '9-10']);
    await etiqueter(page, 'description', ['Rendre compte d’une lecture personnelle et la relier aux notions vues en classe.']);
    await etiqueter(page, 'total', ['TOTAL : / 30']);

    // Sans Titre : le bouton est refusé, sa raison écrite à côté.
    const bouton = page.locator('#dissection-creer [data-action="materielDissection.creer"]');
    await expect(bouton).toBeDisabled();
    await expect(page.locator('#dissection-creer-raisons')).toContainText('le titre de ta grille : surligne-le avec l’étiquette « Titre »');
    await expect(page.locator('#dissection-sans-place')).toBeEmpty();

    await etiqueter(page, 'titre', ['Journal de lecture']);
    await expect(bouton).toBeEnabled();
    await expect(page.locator('#dissection-creer-raisons')).toHaveCount(0);
    await expect(page.locator('#dissection-constats')).toContainText('Somme des pondérations : 30 · ton total : 30 ✓');

    // À 820 px : le bouton fait au moins 44 px, la page ne défile pas de côté.
    const mesure = await page.evaluate(() => {
        const b = document.querySelector('[data-action="materielDissection.creer"]');
        b.scrollIntoView({ block: 'center' });
        return { hauteur: b.getBoundingClientRect().height, debord: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    expect(mesure.hauteur).toBeGreaterThanOrEqual(44);
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
    // Son total, tel que Grilles de critères l'affiche aujourd'hui, en « % » (trouvaille 2 de la relecture 2a).
    await expect(page.locator('#totalPonderationAffichage')).toHaveText('30%');
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
