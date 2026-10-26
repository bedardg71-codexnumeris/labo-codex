import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LOT C (5 septembre 2026) — LES MÊMES GESTES PARTOUT, dans un vrai WebKit : l'éditeur d'échelles.
// Un niveau se déplace par le chevron de sa carte (le modèle des productions) et se supprime par
// la corbeille ; la colonne « Ordre » n'existe plus, aucun bouton plein « Supprimer » ne reste.
// Ce que chaque geste FAIT ne change pas : l'ordre enregistré, la confirmation « Supprimer ce niveau ? ».
//
// ⛔ Aucun `page.click` à l'aveugle, aucun `waitForTimeout` : les gestes passent par l'événement DOM.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set(cle('echellesTemplates'), [{ id: 'ECH_C', nom: 'Échelle C', dansBibliotheque: true, niveaux: [
        { code: 'I', nom: 'Insuffisant', min: 0, max: 59, valeurCalcul: 40, couleur: '#c62828' },
        { code: 'D', nom: 'En développement', min: 60, max: 74, valeurCalcul: 67, couleur: '#e65100' },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 100, valeurCalcul: 88, couleur: '#2e7d32' }
    ] }]);
    window.afficherSection('conception');
    await window.chargerEchellePourModif('ECH_C');
    // Les ancêtres masqués tant que l'écran n'est pas ouvert par la navigation (mesuré par le spec
    // echelle-reperes-maitrise-rendu) : on les montre pour que les gestes portent sur du visible.
    ['conteneurEditionEchelle', 'conception-echelle-performance', 'section-conception'].forEach((id) => {
        const n = document.getElementById(id);
        if (n) { n.classList.remove('u-hide'); n.style.display = 'block'; }
    });
}`;

const cliquerDom = (locator) => locator.evaluate((el) => el.click());
const codesEnBase = (page) => page.evaluate(async () => ((await db.get(cle('echellesTemplates'))) || []).find((e) => e.id === 'ECH_C').niveaux.map((n) => n.code));
const cartes = (page) => page.locator('#tableauNiveauxEchelle .item-liste');

test('lot C · l\'éditeur d\'échelles : plus de colonne « Ordre », un niveau se déplace au chevron et se supprime à la corbeille', async ({ page }) => {
    page.on('dialog', (d) => d.accept().catch(() => {}));   // « Supprimer ce niveau ? » : oui
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(eval(SEMER));

    // 1 — trois cartes, chacune son coin : chevrons puis corbeille ; ni « Ordre », ni bouton plein.
    await expect(cartes(page)).toHaveCount(3);
    await expect(page.locator('#tableauNiveauxEchelle .bloc-coin-outils')).toHaveCount(3);
    await expect(page.locator('#tableauNiveauxEchelle label', { hasText: /^Ordre$/ })).toHaveCount(0);
    await expect(page.locator('#tableauNiveauxEchelle .btn-supprimer')).toHaveCount(0);
    await expect(page.locator('#tableauNiveauxEchelle .bloc-coin-outils .btn-icone-nu img.btn-delete-icon')).toHaveCount(3);
    const boites = await page.locator('#tableauNiveauxEchelle .bloc-coin-outils').first().locator('button').evaluateAll((els) => els.map((b) => { const r = b.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
    console.log('CIBLES DU COIN (l × h) →', JSON.stringify(boites));
    expect(boites.length).toBe(3);
    boites.forEach(([l, h]) => { expect(l).toBeGreaterThanOrEqual(44); expect(h).toBeGreaterThanOrEqual(44); });
    expect(await codesEnBase(page)).toEqual(['I', 'D', 'M']);

    // 2 — descendre le premier par son chevron : l'ordre enregistré suit, la carte aussi.
    await cliquerDom(cartes(page).nth(0).locator('[data-action="deplacerNiveauEchelleBas"]'));
    await expect.poll(() => codesEnBase(page)).toEqual(['D', 'I', 'M']);
    await expect(cartes(page).nth(0).locator('input[data-champ="code"]')).toHaveValue('D');
    await expect(cartes(page).nth(1).locator('input[data-champ="code"]')).toHaveValue('I');
    // Le premier ne monte pas, le dernier ne descend pas.
    await expect(cartes(page).nth(0).locator('[data-action="deplacerNiveauEchelleHaut"]')).toBeDisabled();
    await expect(cartes(page).nth(2).locator('[data-action="deplacerNiveauEchelleBas"]')).toBeDisabled();

    // 3 — supprimer le dernier par sa corbeille (confirmation acceptée) : deux niveaux restent.
    await cliquerDom(cartes(page).nth(2).locator('[data-action="supprimerNiveauEchelle"]'));
    await expect.poll(() => codesEnBase(page)).toEqual(['D', 'I']);
    await expect(cartes(page)).toHaveCount(2);
    await expect(page.locator('#tableauNiveauxEchelle .bloc-coin-outils')).toHaveCount(2);
});

// Règle 3 du lot C — l'empilement sous 768 px se MESURE ici (règle 1 des portes terrain : aucune porte
// quand une machine peut répondre) : à 700 px de large, la grille à deux colonnes du formulaire de
// groupe-cours et la rangée d'un sous-critère n'ont plus qu'une colonne ; à 1200 px, deux et trois.
// ↻ LOT 3a (26 oct. 2026) : la rangée d'un palier est celle de la table des paliers, étape « Cas
// d'interprétation » ouverte (`[data-palier-rangee]`) ; elle se règle sur la largeur de la TABLE
// (`@container table-cas (max-width: 560px)`), plus sur celle de la fenêtre : trois colonnes à 1200 px,
// une à 700 px — les valeurs que mesure `critere-algorithmique-table-de-cas` aux largeurs voisines.
test('lot C · sous 768 px, la grille à deux colonnes du formulaire de groupe-cours et la rangée d\'un sous-critère s\'empilent', async ({ page }) => {
    const colonnes = () => page.evaluate(() => {
        const nb = (el) => (el ? getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length : -1);
        const groupeCours = document.querySelector('#v2-codeCours') && document.querySelector('#v2-codeCours').closest('.grille-form-2col');
        return { groupeCours: nb(groupeCours), palier: nb(document.querySelector('#listeCriteres [data-palier-rangee]')), sousCritere: nb(document.querySelector('#listeCriteres .sous-critere-champs-grid')) };
    });
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(async () => {
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        // security-ok: fixtures littérales écrites par le spec, aucune source externe.
        await db.set(cle('grillesTemplates'), [{ id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [
            { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe', paramsProjection: {},
              sousCriteres: [{ id: 'sc_1', code: '1', nom: 'Thèse', ponderation: 1 }] } ] }]);
        window.afficherSection('conception');
        window.afficherSousSection('conception-grille-criteres');
        await window.chargerGrillePourModif('G1');
    });
    const atelier = page.locator('#listeCriteres .gabarit-algo[data-critere-id="CR"]');
    await atelier.locator('.atelier-algo-chaine .bc-etape[data-etape="paliers"]').evaluate((el) => el.click());
    await expect(atelier.locator('.atelier-algo-etape[data-etape="paliers"]')).toHaveAttribute('data-ouverte', '');
    const large = await colonnes();
    console.log('COLONNES À 1200 px →', JSON.stringify(large));
    expect(large).toEqual({ groupeCours: 2, palier: 3, sousCritere: 3 });
    await page.setViewportSize({ width: 700, height: 1000 });
    const etroit = await colonnes();
    console.log('COLONNES À 700 px →', JSON.stringify(etroit));
    expect(etroit).toEqual({ groupeCours: 1, palier: 1, sousCritere: 1 });
});
