import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// #1007, second lot (3 oct. 2026) : ce banc ne juge pas le codex proposé avant une suppression
// (jugé par 1007-propose-codex-avant-suppression.spec.js). Doublure « codex à jour » : la fenêtre
// qui propose ne paraît pas, et la suppression de la collection se déroule comme avant le lot.
test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.Codex) window.Codex.proposerAvantSuppression = async () => true;
        });
    });
});

// LOT B (5 septembre 2026) — LES COLLECTIONS DE PARAMÈTRES DE PROJECTION, dans un vrai WebKit.
//
// Le « Fini quand » du cadrage : Grégoire règle les paliers d'un critère pour l'EUF, enregistre le
// jeu sous le nom « EUF », ouvre une autre grille, retrouve « EUF » dans le menu de projection, le
// choisit : les paliers et le nom du service arrivent réglés. Il supprime ensuite la collection :
// ce que la grille porte (et ce qu'un élève lira) ne bouge pas. Décision de Grégoire : LA COPIE.
//
// ⛔ Aucun `page.click` à l'aveugle, aucun `waitForTimeout` : les gestes passent par l'événement DOM
// (le dispatcher de main.js), la frappe par `fill`, l'attente par ce que l'écran montre.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    const paliers = window.projectionAlgo.paliersMigration().map((p) => (p.cle === 'risque' ? { ...p, texte: 'Bilan : {projection} erreurs sur {mots} mots.' } : p));
    await db.set(cle('grillesTemplates'), [
        { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [
            { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe',
              paramsProjection: { nomServiceAide: 'Passerelle +', motsReference: 900, erreursTolerees: 30 }, paliersProjection: paliers } ] },
        { id: 'G2', nom: 'Neuve', dansBibliotheque: true, criteres: [
            { id: 'CR2', nom: 'Langue', type: 'algorithmique', ponderation: 30, modeleProjection: 'aucune', paramsProjection: {} } ] }
    ]);
    window.afficherSection('conception');
    window.afficherSousSection('conception-grille-criteres');
    await window.chargerGrillePourModif('G1');
}`;

// ↻ #1150 (24 oct. 2026) : la carte de projection est devenue l'étape « Paliers » de l'atelier (fermée au départ).
const carte = (page, id) => page.locator(`#listeCriteres .gabarit-algo[data-critere-id="${id}"] .atelier-algo-etape[data-etape="paliers"]`);
const cliquerDom = (locator) => locator.evaluate((el) => el.click());
const deplier = async (page, id) => {
    if (await carte(page, id).getAttribute('data-ouverte') === null) await cliquerDom(carte(page, id).locator('.atelier-algo-etape-tete'));
    await expect(carte(page, id)).toHaveAttribute('data-ouverte', '');
};
// ↻ Lot 3a de la table de cas (26 oct. 2026) : le menu du modèle est parti ; les collections se reprennent par
// « Reprendre une de tes collections… », dans l'en-tête de la table des paliers (là aussi sans limite) ; la corbeille
// devient « Supprimer la collection » ; un critère sans limite la fixe par « Fixer une limite ».
const menu = (page) => page.locator('#listeCriteres select[data-on-change="reprendreCollectionProjectionHandler"]');
const rangees = (page) => page.locator('#listeCriteres .table-cas-rangee');
const choisir = (page, valeur) => menu(page).evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); }, valeur);
const grilleEnBase = (page, id) => page.evaluate(async (g) => ((await db.get(cle('grillesTemplates'))) || []).find((x) => x.id === g), id);

test('collections · enregistrer « EUF » sur une grille, la retrouver et la copier dans une autre, la supprimer sans rien changer', async ({ page }) => {
    page.on('dialog', (d) => d.accept().catch(() => {}));   // « Supprimer la collection « EUF » ? » : oui
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(eval(SEMER));

    // 1 — G1 : aucune collection, le bouton sous les paliers.
    await deplier(page, 'CR');
    await expect(menu(page)).toHaveCount(0);
    const bouton = page.locator('#listeCriteres [data-action="ouvrirSaisieCollectionProjection"]');
    await expect(bouton).toHaveCount(1);
    await expect(bouton).toHaveText('Enregistrer ces paliers sous un nom…');

    // 2 — ouvrir, nommer, enregistrer : la collection est en base, le menu et la liste la portent.
    await cliquerDom(bouton);
    const champ = page.locator('#listeCriteres input[data-collection-nom="CR"]');
    await expect(champ).toHaveCount(1);
    await champ.fill('EUF');
    await cliquerDom(page.locator('#listeCriteres [data-action="enregistrerCollectionProjection"]'));
    await expect(page.locator('#listeCriteres .collection-saisie')).toHaveCount(0);
    await expect(menu(page).locator('option').first()).toHaveText('Reprendre une de tes collections…');
    const option = menu(page).locator('option:not([value=""])');
    await expect(option).toHaveCount(1);
    await expect(option).toHaveText('EUF');
    await expect(page.locator('#listeCriteres .collections-liste .collection-nom')).toHaveText('EUF');
    await expect(page.locator('#listeCriteres .collections-aide')).toContainText('copie ses paliers et sa limite');
    const enBase = await page.evaluate(() => db.getSync(cle('collectionsProjection'), []));
    console.log('COLLECTION EN BASE →', JSON.stringify(enBase.map((c) => [c.nom, c.modeleId, c.params.nomServiceAide, c.paliers.length])));
    expect(enBase.length).toBe(1);
    expect(enBase[0].nom).toBe('EUF');
    expect(enBase[0].params.nomServiceAide).toBe('Passerelle +');
    expect(enBase[0].paliers.find((p) => p.cle === 'risque').texte).toBe('Bilan : {projection} erreurs sur {mots} mots.');
    const idEuf = enBase[0].id;
    // Le menu revient à son invitation, et G1 n'a pas bougé.
    await expect(menu(page)).toHaveValue('');
    expect((await grilleEnBase(page, 'G1')).criteres[0].paramsProjection.nomServiceAide).toBe('Passerelle +');

    // 3 — un nom pris (« euf ») sur G2 : le message, rien d'écrit ; annuler.
    await page.evaluate(async () => { await window.chargerGrillePourModif('G2'); });
    await deplier(page, 'CR2');
    await expect(page.locator('#listeCriteres [data-action="fixerLimiteAlgo"]')).toHaveCount(1);
    await expect(rangees(page)).toHaveCount(0);
    await expect(page.locator('#listeCriteres [data-action="ouvrirSaisieCollectionProjection"]'), 'sans limite, rien à nommer').toHaveCount(0);
    await expect(option).toHaveText('EUF');

    // 4 — reprendre « EUF » (sans limite, le menu est là) : la limite, les paliers et le service arrivent, COPIÉS.
    await choisir(page, idEuf);
    await expect(rangees(page)).toHaveCount(6);
    await expect(page.locator('#listeCriteres [data-action="retirerLimiteAlgo"]')).toHaveCount(1);
    await expect(menu(page)).toHaveValue('');
    await expect(page.locator('#listeCriteres input[data-param-cle="nomServiceAide"]')).toHaveValue('Passerelle +');
    await expect(page.locator('#listeCriteres textarea[data-palier-index="4"][data-champ="texte"]')).toHaveValue('Bilan : {projection} erreurs sur {mots} mots.');
    let g2 = await grilleEnBase(page, 'G2');
    expect(g2.criteres[0].modeleProjection).toBe('norme_externe');
    expect(g2.criteres[0].paramsProjection.nomServiceAide).toBe('Passerelle +');
    expect(g2.criteres[0].paliersProjection.length).toBe(6);
    // Maintenant que G2 projette, le bouton est là — et « euf » est un nom pris.
    await cliquerDom(page.locator('#listeCriteres [data-action="ouvrirSaisieCollectionProjection"]'));
    await page.locator('#listeCriteres input[data-collection-nom="CR2"]').fill(' euf ');
    await cliquerDom(page.locator('#listeCriteres [data-action="enregistrerCollectionProjection"]'));
    await expect(page.locator('#listeCriteres .collection-saisie-message')).toHaveText('Une collection porte déjà ce nom.');
    await expect(page.locator('#listeCriteres input[data-collection-nom="CR2"]')).toHaveValue(' euf ');
    expect((await page.evaluate(() => db.getSync(cle('collectionsProjection'), []))).length).toBe(1);
    await cliquerDom(page.locator('#listeCriteres [data-action="annulerSaisieCollectionProjection"]'));
    await expect(page.locator('#listeCriteres .collection-saisie')).toHaveCount(0);

    // 5 — supprimer « EUF » (« Supprimer la collection », confirmation acceptée) : la collection part ; G2 ne bouge pas.
    const avant = JSON.stringify(g2.criteres[0]);
    await cliquerDom(page.locator('#listeCriteres .collection-ligne [data-action="supprimerCollectionProjection"]'));
    await expect(menu(page)).toHaveCount(0);
    await expect(page.locator('#listeCriteres .collections-liste')).toHaveCount(0);
    expect(await page.evaluate(() => db.getSync(cle('collectionsProjection'), []))).toEqual([]);
    g2 = await grilleEnBase(page, 'G2');
    expect(JSON.stringify(g2.criteres[0])).toBe(avant);
    await expect(rangees(page)).toHaveCount(6);
    await expect(page.locator('#listeCriteres textarea[data-palier-index="4"][data-champ="texte"]')).toHaveValue('Bilan : {projection} erreurs sur {mots} mots.');
    // Et ce que l'élève lira, calculé par la grille elle-même, est ce que la collection disait.
    const lu = await page.evaluate(async () => {
        const g = ((await db.get(cle('grillesTemplates'))) || []).find((x) => x.id === 'G2');
        return window.projectionAlgo.calculer(g.criteres[0], { erreurs: 23, mots: 900 }).texte;
    });
    console.log('L\'ÉLÈVE LIRA →', lu);
    expect(lu).toBe('Bilan : 23 erreurs sur 900 mots. Il est recommandé de t\'inscrire au Passerelle +.');
});
