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
//   · F1 (verdict du 20 oct.) : le tableau en mode sombre, à 1440 px puis à 820 px — captures, et le contraste
//     WCAG de chaque intitulé et de chaque case sur le fond de sa rangée, 4,5 au moins. Break-test (fait le
//     20 oct.) : l'intitulé de rangée peint #1a2c34 → contraste 1,11, rouge ; restauré.
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

/** Le contraste WCAG de chaque intitulé de rangée et de chaque case du tableau, sur le fond (opaque) de sa rangée. */
async function contrastesTableau(page) {
    return page.evaluate(() => {
        const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
        const fondOpaque = (el) => {
            for (let x = el; x; x = x.parentElement) {
                const c = rgb(getComputedStyle(x).backgroundColor);
                if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c;
            }
            return [255, 255, 255];
        };
        const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
            .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
        const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
        return [...document.querySelectorAll('#aide-bareme-tableau th, #aide-bareme-tableau td')].filter((c) => c.textContent.trim())
            .map((c) => ({ texte: c.textContent.trim(), ratio: Math.round(ratio(rgb(getComputedStyle(c).color), fondOpaque(c)) * 100) / 100 }));
    });
}

test('barème 2 · F1 : le tableau de l’onglet Aide en mode sombre, au Mac puis à l’iPad debout, lisible partout', async ({ page }) => {
    await ouvrirApp(page);
    await page.evaluate(() => { document.body.classList.remove('mode-clair'); window.afficherSection('aide'); });
    const carte = page.locator('#accordeon-aide-bareme');
    await page.locator('#aide-recherche-input').fill('barème');
    await page.locator('#aide-recherche-input').press('End');
    await carte.locator('.accordeon-header').click();
    await expect(carte.locator('#aide-bareme-tableau')).toBeVisible();
    for (const [nom, largeur, hauteur] of [['1440', 1440, 900], ['820', 820, 1180]]) {
        await page.setViewportSize({ width: largeur, height: hauteur });
        await carte.locator('#aide-bareme-tableau').scrollIntoViewIfNeeded();
        await page.screenshot({ path: test.info().outputPath('bareme-aide-sombre-' + nom + '.png') });
        const c = await contrastesTableau(page);
        expect(c).toHaveLength(14);   // deux en-têtes, quatre intitulés, huit cases
        expect(c.filter((x) => x.ratio < 4.5), nom + ' px').toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    }
    await expect(page.locator('body')).not.toHaveClass(/mode-clair/);
});
