import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LE BARÈME, LOT 2 — SES PIÈCES D'AIDE (#1120 ; consigne du 20 oct. 2026), dans un vrai WebKit.
//
//   · sous un critère analytique de Grilles de critères, l'icône « i » à côté du titre « Barème » ouvre l'aide
//     « Le barème d'un critère » : ses deux textes, son exemple, son conseil, ses trois « Voir aussi » ;
//   · la bulle d'un champ de tranche s'affiche au survol, avec son texte ;
//   · la section « Le barème d'un critère analytique » de l'onglet Aide est trouvée par « barème » et « tranche ».
// Les textes eux-mêmes, mot pour mot : tests/unit/bareme-2-pieces-d-aide.test.js.

async function ouvrirApp(page) {
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
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
}

/** Une grille fictive à un critère analytique, posée au banc, ouverte dans Grilles de critères. */
async function ouvrirGrilleAnalytique(page) {
    await page.evaluate(async () => {
        const g = { id: 'GRILLE_BANC_1120', nom: 'Grille fictive du barème', type: 'analytique', criteres: [
            { id: 'CR_BANC_1120', nom: 'Critère fictif', type: 'analytique', ponderation: 5, description: '', formule: '', niveauSOLO: 'aucun', verrouille: false,
                bareme: [{ id: 'TR_banc', nom: 'Partiel', pointsMin: 2, pointsMax: 2, texte: 'Un texte fictif.' }] }] };
        db.setSync(cle('grillesTemplates'), db.getSync(cle('grillesTemplates'), []).concat([g]));   // security-ok: banc, une grille fictive dans un contexte neuf
        await db.flush();
        naviguerVers('conception', 'grille-criteres');
        await chargerGrillePourModif('GRILLE_BANC_1120');
    });
    await expect(page.locator('#listeCriteres .grille-bareme-tranche')).toHaveCount(1);
}

const bulle = (page) => page.locator('#tooltip-bulle.tooltip-visible .tooltip-contenu');

test('barème 2 · l’aide « i » du barème s’ouvre depuis un critère analytique ; une bulle de tranche au survol', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirApp(page);
    await ouvrirGrilleAnalytique(page);

    // L'icône est celle du patron des autres « i » de l'éditeur (visible en mode aide) : le clic passe par la
    // délégation de accompagnement.js, comme un toucher.
    const i = page.locator('#listeCriteres .grille-attendu-titre .primo-aide[data-target="grille-bareme"]');
    await expect(i).toHaveCount(1);
    await i.dispatchEvent('click');
    const modale = page.locator('.aide-contextuelle-modal.active');
    await expect(modale.locator('#aide-ctx-titre')).toHaveText('Le barème d’un critère');
    await expect(modale).toContainText('Deux tranches ne se chevauchent pas : des points donnés tombent dans une seule.');
    await expect(modale).toContainText('Satisfaisant, 3 à 4 points : Résume l’essentiel.');
    await expect(modale).toContainText('Le barème ne change aucune note');
    await expect(modale.locator('.aide-lien-voir-aussi')).toHaveText(['Configurer les échelles de performance', 'Plage de notes (niveau)', 'Type de critère d’évaluation']);
    await page.evaluate(() => window.fermerAideContextuelle());
    await expect(modale).toHaveCount(0);

    // Une bulle au survol du champ « Points » d'une tranche.
    await page.mouse.move(0, 0);
    await page.locator('#listeCriteres .grille-bareme-tranche [data-champ="points"]').hover();
    await expect(bulle(page)).toHaveText('Un nombre (3 ou 2,5) ou deux bornes (3 à 4), de 0 à la pondération du critère. Deux tranches ne se chevauchent pas.');
    expect(erreurs).toEqual([]);
});

test('barème 2 · la section de l’onglet Aide, trouvée par « barème » et par « tranche »', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirApp(page);
    await page.evaluate(() => window.afficherSection('aide'));
    const carte = page.locator('#accordeon-aide-bareme');
    for (const recherche of ['barème', 'tranche']) {
        // Le champ cherche au `keyup` (data-on-keyup) : une vraie touche après le texte.
        await page.locator('#aide-recherche-input').fill(recherche);
        await page.locator('#aide-recherche-input').press('End');
        await expect(carte).toBeVisible();
        await expect(page.locator('#accordeon-aide-creer-echelles')).toBeHidden();
    }
    // À la largeur de l'iPad debout : le tableau tient, ou défile dans son conteneur ; la page ne défile pas de côté.
    await carte.locator('.accordeon-header').click();
    await expect(carte.locator('#aide-bareme-tableau')).toBeVisible();
    const m = await page.evaluate(() => {
        const t = document.getElementById('aide-bareme-tableau'), c = t.parentElement;
        const th = t.querySelector('tbody th');
        return { debord: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            contenu: t.getBoundingClientRect().width <= c.getBoundingClientRect().width + 1 || getComputedStyle(c).overflowX === 'auto',
            couleur: getComputedStyle(th).color, caseCouleur: getComputedStyle(th.nextElementSibling).color,
            fond: getComputedStyle(th).backgroundColor };
    });
    expect(m.debord).toBeLessThanOrEqual(0);
    expect(m.contenu).toBe(true);
    // L'intitulé de rangée ne prend ni le fond bleu ni le blanc des en-têtes : le fond de sa rangée, la couleur des cases.
    // Break-test (fait le 20 oct.) : la règle `#aide-bareme-tableau tbody th` retirée de styles.css → rouge ici.
    expect(m.fond).toBe('rgba(0, 0, 0, 0)');
    expect(m.couleur).toBe(m.caseCouleur);
    await page.screenshot({ path: test.info().outputPath('bareme-aide-820.png') });
});
