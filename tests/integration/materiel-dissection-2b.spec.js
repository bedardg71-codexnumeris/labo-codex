import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRILLE_N, enHtml } from '../unit/_helpers/grilles-fictives-dissection.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 2b (consigne du 18 oct. 2026), dans un vrai WebKit.
//
//   · l'exemple fictif, étiqueté par des événements de POINTEUR : il a des niveaux ET des points, alors le
//     choix paraît, « des points » coché, sans tableau ; « des niveaux » choisi, le tableau paraît, ses
//     champs VIDES (break-test : un champ prérempli) ; tant qu'il manque une plage, le refus est écrit ;
//   · le tableau rempli par de vrais événements de saisie (virgule comprise) ; à 820 px, des cibles de
//     44 px, un texte de 16 px, et la page ne défile pas de côté ;
//   · créée : la confirmation d'une grille en niveaux (ses niveaux et leurs plages) ; l'échelle retrouvée
//     dans Échelles de performance, la grille dans Grilles de critères ;
//   · une grille SEULEMENT en niveaux (forme neuve, sans points) : le tableau d'emblée, aucun choix ;
//     « Retirer les étiquettes » emporte ce qui était saisi.

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
    // Un témoin, pas un délai (même que les specs des lots 1 et 2a).
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

/** Une étiquette en main, puis un geste de pointeur sur tous les morceaux dont le texte est dans la liste. */
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

const NIVEAUX = ['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable'];
const CRITERES = ['L’élève résume l’œuvre avec justesse', 'L’élève relève des procédés d’écriture',
    'L’élève relie l’œuvre aux notions du cours', 'L’élève exprime une appréciation argumentée'];
const DESCRIPTEURS = ['Résumé absent ou erroné', 'Résume quelques événements', 'Résume l’essentiel', 'Résume avec précision et concision',
    'Aucun procédé relevé', 'Relève un procédé', 'Relève quelques procédés', 'Relève et illustre plusieurs procédés',
    'Liens absents', 'Établit un lien', 'Établit quelques liens', 'Établit des liens nombreux et pertinents',
    'Appréciation absente', 'Donne une opinion', 'Justifie son opinion', 'Argumente avec nuance'];

/** Les trois champs de chaque niveau, dans l'ordre : [[de, à, note retenue], …]. */
async function valeursDuTableau(page) {
    return page.locator('#dissection-creer-niveaux .dissection-niveau').evaluateAll((rs) =>
        rs.map((r) => [...r.querySelectorAll('input')].map((c) => c.value)));
}

test('dissection 2b · l’exemple, « des niveaux » choisi, le tableau rempli, créé ; l’échelle et la grille retrouvées', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirConception(page);
    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await etiqueter(page, 'titre', ['Journal de lecture']);
    await etiqueter(page, 'section', ['PARTIE A : COMPRÉHENSION', 'PARTIE B : RÉFLEXION']);
    await etiqueter(page, 'niveau', NIVEAUX);
    await etiqueter(page, 'critere', CRITERES);
    await etiqueter(page, 'descripteur', DESCRIPTEURS);
    await etiqueter(page, 'points', ['2', '3-4', '5', '3', '4', '4-5', '6-7', '8-10', '6-8', '9-10']);

    // Les deux logiques : le choix, « des points » coché, aucun tableau ; le bouton crée en points.
    const parPoints = page.locator('#dissection-compte-points'), parNiveaux = page.locator('#dissection-compte-niveaux');
    const bouton = page.locator('#dissection-creer [data-action="materielDissection.creer"]');
    await expect(page.locator('#dissection-creer-choix legend')).toHaveText('Le résultat d’une copie viendrait :');
    await expect(parPoints).toBeChecked();
    await expect(parNiveaux).not.toBeChecked();
    await expect(page.locator('#dissection-creer-niveaux')).toHaveCount(0);
    await expect(bouton).toBeEnabled();

    // « des niveaux » : le tableau, une rangée par niveau dans l'ordre lu, ses champs VIDES.
    // Break-test (fait le 18 oct.) : une valeur proposée dans `champNiveau` → rouge (ici et dans le second essai).
    await page.evaluate(() => { document.getElementById('dissection-compte-niveaux').__temoin = 1; });
    await page.locator('label:has(#dissection-compte-niveaux)').click();
    await expect(parNiveaux).toBeChecked();
    // Le choix n'est pas redessiné sous le doigt : c'est le même nœud (Safari ne donne pas le focus à un bouton radio touché).
    expect(await page.evaluate(() => document.getElementById('dissection-compte-niveaux').__temoin)).toBe(1);
    await expect(page.locator('#dissection-creer-niveaux .dissection-niveau-nom')).toHaveText(NIVEAUX);
    expect(await valeursDuTableau(page)).toEqual(Array(4).fill(['', '', '']));
    await expect(page.locator('#dissection-niv-0-min')).toHaveAttribute('inputmode', 'decimal');
    await expect(bouton).toBeDisabled();
    await expect(page.locator('#dissection-creer-raisons')).toContainText('la plage de notes de 4 niveaux');
    await expect(page.locator('#dissection-creer-raisons')).toContainText('la note retenue de 4 niveaux');

    // Le tableau rempli par de vrais événements de saisie ; la virgule acceptée.
    const saisies = [['0', '59', '40'], ['60', '69', '65'], ['70', '84', '77,5'], ['85', '100', '92']];
    for (let i = 0; i < saisies.length; i++) {
        for (const [k, quoi] of ['min', 'max', 'note'].entries()) {
            await page.locator('#dissection-niv-' + i + '-' + quoi).pressSequentially(saisies[i][k]);
        }
    }
    await expect(page.locator('#dissection-niv-3-note')).toBeFocused();   // la frappe ne redessine pas le tableau
    await expect(bouton).toBeEnabled();
    await expect(page.locator('#dissection-creer-raisons')).toHaveCount(0);
    await expect(page.locator('#dissection-creer .dissection-creer-avert')).toHaveCount(0);

    // Un geste d'étiquetage de plus : le tableau se refait, ce qui était saisi reste.
    await etiqueter(page, 'total', ['TOTAL : / 30']);
    expect(await valeursDuTableau(page)).toEqual(saisies);

    // À 820 px : 44 px et 16 px pour les champs et le choix ; pas de défilement de côté.
    const mesure = await page.evaluate(() => {
        const champs = [...document.querySelectorAll('#dissection-creer-niveaux input')];
        const options = [...document.querySelectorAll('.dissection-creer-option')];
        champs[0].scrollIntoView({ block: 'center' });
        return {
            hauteurs: champs.concat(options).map((c) => c.getBoundingClientRect().height),
            polices: champs.map((c) => parseFloat(getComputedStyle(c).fontSize)),
            debord: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
    });
    expect(Math.min(...mesure.hauteurs)).toBeGreaterThanOrEqual(44);
    expect(Math.min(...mesure.polices)).toBeGreaterThanOrEqual(16);
    expect(mesure.debord).toBeLessThanOrEqual(0);
    await page.screenshot({ path: test.info().outputPath('dissection-2b-820.png') });

    // Créée : la confirmation d'une grille en niveaux.
    const echellesAvant = await page.evaluate(() => db.getSync(cle('echellesTemplates'), []).length);
    await bouton.click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Journal de lecture » est créée');
    await expect(page.locator('.materiel-cartes-cree')).toContainText('Insuffisant (0 à 59 %) · Partiel (60 à 69 %) · Satisfaisant (70 à 84 %) · Remarquable (85 à 100 %)');
    await expect(page.locator('.materiel-confirmation [data-action="materiel.recommencer"]')).toHaveText('Coller une autre grille');

    const { e, g } = await page.evaluate(() => ({
        e: db.getSync(cle('echellesTemplates'), []).slice(-1)[0], g: db.getSync(cle('grillesTemplates'), []).slice(-1)[0]
    }));
    expect(await page.evaluate(() => db.getSync(cle('echellesTemplates'), []).length)).toBe(echellesAvant + 1);
    expect(e.niveaux.map((n) => [n.code, n.nom, n.min, n.max, n.valeurCalcul])).toEqual([
        ['I', 'Insuffisant', 0, 59.99, 40], ['P', 'Partiel', 60, 69.99, 65], ['S', 'Satisfaisant', 70, 84.99, 77.5], ['R', 'Remarquable', 85, 100, 92]
    ]);
    expect(g.criteres.map((c) => [c.ponderation, c.type, c.descripteurs.echelleId])).toEqual(Array(4).fill(null).map((x, i) => [[5, 5, 10, 10][i], 'holistique', e.id]));
    expect(g.criteres[0].descripteurs.parNiveau.S).toBe('Résume l’essentiel\n3-4');

    // L'échelle dans Échelles de performance : son nom, ses niveaux et leurs notes retenues.
    await page.locator('[data-action="materiel.voir"][data-param="echelle-performance"]').click();
    await expect(page.locator('#nomEchelleTemplate')).toHaveValue(e.nom);
    await expect(page.locator(`#conception-echelle-performance .sidebar-item[data-id="${e.id}"]`)).toHaveClass(/\bactive\b/);
    const vus = await page.locator('#conception-echelle-performance input[data-champ="nom"]:visible').evaluateAll((cs) => cs.map((c) => c.value));
    expect(vus).toEqual(NIVEAUX);

    // La grille dans Grilles de critères : ses critères, ses pondérations, ce qui est attendu à chaque niveau.
    await page.evaluate(() => window.materiel.voir('grille-criteres'));
    await expect(page.locator('#nomGrilleTemplate')).toHaveValue('Journal de lecture');
    const liste = page.locator('#listeCriteres');
    const rangees = await liste.locator('.critere-rangee').evaluateAll((rs) => rs.map((r) => [
        r.querySelector('input[data-champ="nom"]').value, r.querySelector('input[data-champ="ponderation"]')?.value]));
    expect(rangees).toEqual(g.criteres.map((c) => [c.nom, String(c.ponderation)]));
    await expect(liste.locator('.grille-attendu').first().locator('.grille-attendu-niveau strong')).toHaveText(NIVEAUX);
    expect(erreurs).toEqual([]);
});

test('dissection 2b · une grille seulement en niveaux : le tableau d’emblée, aucun choix ; « Retirer les étiquettes » emporte la saisie', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    await coller(page, enHtml(GRILLE_N));
    await etiqueter(page, 'titre', ['Fiche d’appréciation fictive']);
    await etiqueter(page, 'niveau', ['À reprendre', 'En voie', 'Atteint']);
    await etiqueter(page, 'critere', [1, 2, 3].map((n) => 'Le travail fictif répond à l’attente ' + n));
    await etiqueter(page, 'ponderation', ['(40 %)', '(35 %)', '(25 %)']);

    await expect(page.locator('#dissection-creer-choix')).toHaveCount(0);
    await expect(page.locator('#dissection-creer-niveaux legend')).toHaveText('Ce que vaut chaque niveau');
    await expect(page.locator('#dissection-creer-niveaux .dissection-niveau-nom')).toHaveText(['À reprendre', 'En voie', 'Atteint']);
    expect(await valeursDuTableau(page)).toEqual(Array(3).fill(['', '', '']));

    // Des plages qui se chevauchent : l'avertissement, tel quel, à côté du bouton ; il n'empêche rien.
    const saisies = [['0', '60', '50'], ['60', '79', '70'], ['80', '100', '90']];
    for (let i = 0; i < 3; i++) for (const [k, quoi] of ['min', 'max', 'note'].entries()) await page.locator('#dissection-niv-' + i + '-' + quoi).fill(saisies[i][k]);
    const bouton = page.locator('#dissection-creer [data-action="materielDissection.creer"]');
    await expect(bouton).toBeEnabled();
    await expect(page.locator('#dissection-creer .dissection-creer-avert')).toHaveText('Les plages « À reprendre » et « En voie » se chevauchent (60 et 60 %) : une même note tomberait dans deux niveaux. Il pourrait être utile de les ajuster.');

    // « Retirer les étiquettes », confirmé : les niveaux partent, et ce qui était saisi pour eux aussi.
    const retirer = page.locator('[data-action="materielDissection.toutRetirer"]');
    await retirer.click();
    await retirer.click();
    await expect(page.locator('#dissection-creer-niveaux')).toHaveCount(0);
    await etiqueter(page, 'titre', ['Fiche d’appréciation fictive']);
    await etiqueter(page, 'niveau', ['À reprendre', 'En voie', 'Atteint']);
    await etiqueter(page, 'critere', [1, 2, 3].map((n) => 'Le travail fictif répond à l’attente ' + n));
    expect(await valeursDuTableau(page)).toEqual(Array(3).fill(['', '', '']));
    expect(erreurs).toEqual([]);
});
