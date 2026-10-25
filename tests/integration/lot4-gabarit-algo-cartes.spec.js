import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LOT 4, VOLET C — LE GABARIT ALGORITHMIQUE SE RANGE, dans un vrai WebKit (4 septembre 2026).
//
// Le « fini quand » du cadrage « accordéons » (3 sept.) : Grégoire ouvre un critère
// algorithmique dans Conception : il voit ses SOUS-CRITÈRES, puis la formule (ouverte), puis
// trois bandes bleues repliées — commentaire, projection, codes. Il en déplie une, TAPE DANS
// UN CHAMP : la bande reste dépliée. Il replie la formule, tape dans un de ses champs : elle
// reste repliée. Il change de grille et revient : les plis sont ceux qu'il a laissés.
//
// ↻ #1150 (24 oct. 2026, maquette validée par Grégoire) : les cartes sont devenues les cinq ÉTAPES de l'atelier
// (Ce que tu comptes · Codes · Note · Paliers · Ce que l'élève lit), UNE seule ouverte — « Ce que l'élève lit »
// au départ. Le « fini quand » devient : il ouvre une étape (à la souris, ou par la chaîne), TAPE DANS UN CHAMP :
// l'étape reste ouverte, seule ; il change de grille et revient : c'est encore elle. Rien n'entre dans la grille.
//
// ⚠ Le test qui compte est celui de la frappe : chaque handler redessine le gabarit entier.
// Le clic sur la bande passe par la souris (Playwright), donc par le dispatcher de main.js et
// `toggleAccordeonV2` ; la frappe est rejouée comme le navigateur la livre (valeur + `change`).

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set(cle('grillesTemplates'), [
        { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [
            { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe', sousCriteres: [
                { id: 'sc_1', code: '1', nom: 'Thèse non dégagée', ponderation: 1, retroaction: 'La thèse doit être explicite.' }
            ] } ] },
        { id: 'G2', nom: 'Autre', dansBibliotheque: true, criteres: [ { id: 'H', nom: 'Contenu', type: 'holistique', ponderation: 100 } ] }
    ]);
    window.afficherSection('conception');
    window.afficherSousSection('conception-grille-criteres');
    await window.chargerGrillePourModif('G1');
}`;

const LIRE = `() => {
    const l = document.getElementById('listeCriteres');
    const etapes = [...l.querySelectorAll('.atelier-algo-etape')];
    return {
        ordre: etapes.map(e => e.dataset.etape),
        plis: Object.fromEntries(etapes.map(e => [e.dataset.etape, e.hasAttribute('data-ouverte') ? 'ouvert' : 'replie'])),
        chaineOuverte: [...l.querySelectorAll('.atelier-algo-chaine .bc-ouvert')].map(b => b.dataset.etape),
        rangeeAvantSousCriteres: l.innerHTML.indexOf('data-champ="nom"') < l.innerHTML.indexOf('sous-criteres-conteneur--en-tete'),
        sousCriteresDansCodes: !!l.querySelector('.atelier-algo-etape[data-etape="codes"] .sous-criteres-conteneur--en-tete'),
        commentaire: l.innerHTML.includes("Modèle des phrases (bilan et décompte)") && !l.innerHTML.includes("Modèle d'observation") && !l.innerHTML.includes('Modèle de rétroaction') && !l.innerHTML.includes('Modèle de commentaire'),
        euf: [...l.querySelectorAll('option')].some(o => o.textContent === "Projection à l'EUF"),
        motsReference: (l.querySelector('input[data-param-cle="motsReference"]') || {}).value,
        cartes: l.querySelectorAll('.gabarit-algo-carte').length
    };
}`;

const ETAPE_DE = { projection: 'paliers', commentaire: 'eleve', formule: 'note' };
const carte = (page, section) => page.locator(`#listeCriteres .gabarit-algo[data-critere-id="CR"] .atelier-algo-etape[data-etape="${ETAPE_DE[section] || section}"]`);
const SEUL = (ouverte) => Object.fromEntries(['compte', 'codes', 'note', 'paliers', 'eleve'].map(e => [e, e === ouverte ? 'ouvert' : 'replie']));
// ↻ 4 sept. 2026, 18 h 30 — RUN GITHUB 33902352824 (1.117.0) ROUGE sur ce spec : sur le runner, chaque
// clic à la souris coûte de 2 à 9 s (« waiting for element to be visible, enabled and stable ») et le
// budget de 30 s s'épuise — la même cause que le matin (run 33869215489), pas une régression du gabarit.
// UN SEUL clic souris reste : la bande de la projection, c'est le pointeur qu'on éprouve ; les autres
// gestes passent par l'événement DOM (`el.click()`), qui traverse le même dispatcher.
const cliquerDom = (locator) => locator.evaluate((el) => el.click());
/**
 * Un clic À LA SOURIS sur la bande d'une carte. ⚠ Juste après un rendu, la liste bouge encore
 * quelques dizaines de millisecondes (mesuré le 4 sept. : « element is not stable », puis un
 * clic parti vers la carte voisine) ; on attend que la bande soit immobile, comme une main le
 * fait, avant de cliquer — un délai fixe ne dirait rien de l'écran.
 */
async function cliquerBande(page, section) {
    const bande = carte(page, section).locator('.atelier-algo-etape-tete');
    await bande.scrollIntoViewIfNeeded();
    let precedent = null;
    for (let i = 0; i < 40; i++) {
        const boite = await bande.boundingBox();
        const cle = boite ? [boite.x, boite.y, boite.width, boite.height].map(Math.round).join(',') : '';
        if (cle && cle === precedent) break;
        precedent = cle;
        await page.waitForTimeout(50);
    }
    await bande.click();
}
const frapper = (page, sel, valeur) => page.evaluate(({ s, v }) => {
    const champ = document.querySelector(s);
    champ.value = v;
    champ.dispatchEvent(new Event('change', { bubbles: true }));
}, { s: sel, v: valeur });

test('lot 4 · C — sous-critères en tête, cartes nommées, et la carte reste où on l\'a laissée quand on tape', async ({ page }) => {
    page.on('dialog', (d) => d.accept().catch(() => {}));   // « Supprimer ce sous-critère ? » : oui (retouche c)
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    // ↻ Lot A (5 sept.) : prêt quand la base l'est (comme les specs du texte troué), plus un délai fixe.
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(eval(SEMER));

    // 1 — l'ordre et l'état à l'ouverture : cinq étapes, « Ce que l'élève lit » seule ouverte (la chaîne la marque).
    let etat = await page.evaluate(eval(LIRE));
    console.log('OUVERTURE →', JSON.stringify(etat));
    expect(etat.ordre).toEqual(['compte', 'codes', 'note', 'paliers', 'eleve']);
    expect(etat.rangeeAvantSousCriteres, 'la rangée du critère, puis l\'atelier').toBe(true);
    expect(etat.sousCriteresDansCodes, 'les sous-critères sont dans l\'étape « Codes »').toBe(true);
    expect(etat.plis).toEqual(SEUL('eleve'));
    expect(etat.chaineOuverte).toEqual(['eleve']);
    expect(etat.commentaire, '« Modèle des phrases (bilan et décompte) » (carte « Bilan », 1.120), ni « observation », ni « rétroaction » ni « commentaire »').toBe(true);
    expect(etat.euf, '« Projection à l\'EUF » au menu de projection').toBe(true);
    expect(etat.cartes, 'plus aucune carte du composant accordéon pour le gabarit').toBe(0);

    // 2 — ouvrir « Paliers » À LA SOURIS, puis TAPER dans un de ses champs : elle reste ouverte, seule.
    await cliquerBande(page, 'projection');
    await expect(carte(page, 'projection')).toHaveAttribute('data-ouverte', '');
    await frapper(page, '#listeCriteres .atelier-algo-etape[data-etape="paliers"] input[data-param-cle="motsReference"]', '1000');
    await expect(page.locator('#listeCriteres input[data-param-cle="motsReference"]'), 'le gabarit s\'est redessiné avec la valeur').toHaveValue('1000');
    etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS FRAPPE (Paliers) →', JSON.stringify(etat.plis));
    expect(etat.plis, 'l\'étape reste ouverte sous les doigts, seule').toEqual(SEUL('paliers'));
    expect(etat.chaineOuverte).toEqual(['paliers']);

    // 3 — toucher « Note » dans la chaîne, taper dans un de ses champs : « Note » reste ouverte, seule.
    await cliquerDom(page.locator('#listeCriteres .atelier-algo-chaine .bc-etape[data-etape="note"]'));
    await expect(carte(page, 'formule')).toHaveAttribute('data-ouverte', '');
    await frapper(page, '#listeCriteres .atelier-algo-etape[data-etape="note"] input[data-param-cle]', '7');
    await expect(page.locator('#listeCriteres .atelier-algo-etape[data-etape="note"] input[data-param-cle]').first(), 'le gabarit s\'est redessiné avec la valeur').toHaveValue('7');
    etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS FRAPPE (Note) →', JSON.stringify(etat.plis));
    expect(etat.plis).toEqual(SEUL('note'));

    // 4 — changer de grille et revenir : l'étape est celle qu'il a laissée.
    await page.evaluate(async () => { await window.chargerGrillePourModif('G2'); await window.chargerGrillePourModif('G1'); });
    await expect(page.locator('#listeCriteres input[data-param-cle="motsReference"]'), 'G1 est de retour, avec la valeur écrite à l\'étape 2').toHaveValue('1000');
    etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS RETOUR →', JSON.stringify(etat.plis));
    expect(etat.plis).toEqual(SEUL('note'));

    // 5 — rien de tout cela n'est dans la grille : les plis meurent avec la page.
    const grille = await page.evaluate(async () => ((await db.get(cle('grillesTemplates'))) || []).find(g => g.id === 'G1'));
    const texte = JSON.stringify(grille);
    expect(texte).not.toMatch(/"pli|plis|ferme|ouvert|atelier|etape/);
    expect(grille.criteres[0].paramsProjection.motsReference, 'la frappe, elle, est bien écrite').toBe(1000);

    // 6 — coup d'œil de Grégoire (4 sept., §7 b) : le nom d'un palier se lit EN ENTIER — « Sans erreur »,
    //     pas « Sans erre » — dans l'étape « Paliers » ouverte.
    await cliquerDom(carte(page, 'projection').locator('.atelier-algo-etape-tete'));
    await expect(carte(page, 'projection')).toHaveAttribute('data-ouverte', '');
    const nomPalier = page.locator('#listeCriteres .atelier-algo-etape[data-etape="paliers"] input.palier-nom').first();
    await expect(nomPalier).toHaveValue('Sans erreur');
    const mesure = await nomPalier.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth, largeur: el.getBoundingClientRect().width }));
    console.log('PALIER « Sans erreur » →', JSON.stringify(mesure));
    expect(mesure.scroll, 'le texte tient dans le champ').toBeLessThanOrEqual(mesure.client);
    expect(mesure.largeur).toBeGreaterThan(120);
    // La note du composeur (texte troué, étape 2 — elle remplace « Écris {service}… ») : une seule, sous les paliers.
    await expect(page.locator('#listeCriteres .atelier-algo-etape[data-etape="paliers"] .palier-note-composer')).toHaveCount(1);
    // §8 e) et g) : les paliers sont numérotés (« Palier 1 »… sans chevrons), la rangée dit « Description » (D1, 17 oct.).
    const etiquettes = await page.locator('#listeCriteres .palier-projection .sous-critere-label-petit').evaluateAll(els => els.map(e => e.textContent.trim()).filter(t => t.startsWith('Palier')));
    expect(etiquettes[0]).toBe('Palier 1');
    expect(etiquettes.length).toBeGreaterThan(1);
    expect(etiquettes).toEqual(etiquettes.map((_, i) => 'Palier ' + (i + 1)));
    await expect(page.locator('#listeCriteres .palier-projection .pipeline-btn-reorder')).toHaveCount(0);
    await expect(page.locator('#listeCriteres label', { hasText: /^Description$/ })).toHaveCount(1);
    await expect(page.locator('#listeCriteres label', { hasText: /^Descripteur$/ })).toHaveCount(0);

    // 6 bis — LOT A (5 sept. 2026) : UNE seule liste. La case en tête des sous-critères, à plat ; cochée, la
    //     rangée gagne sa pastille et son pli « Observation » (fermé par défaut) ; on déplie, on écrit une
    //     observation, la frappe laisse le pli ouvert ; on recharge la grille : la case et l'observation se relisent.
    // ↻ #1150 : la case, la liste et « Aucune annotation » (à plat, sous la liste) sont dans l'étape « Codes » ;
    //     on l'ouvre par son en-tête, et le redessin de la case cochée la garde ouverte.
    await cliquerDom(carte(page, 'codes').locator('.atelier-algo-etape-tete'));
    await expect(carte(page, 'codes')).toHaveAttribute('data-ouverte', '');
    const caseCodes = page.locator('#listeCriteres .sous-criteres-conteneur--en-tete .sous-criteres-codes input[type="checkbox"]');
    await expect(caseCodes).toHaveCount(1);
    await expect(caseCodes).not.toBeChecked();
    const zoneAucune = () => page.locator('#listeCriteres .atelier-algo-etape[data-etape="codes"] .sous-criteres-aucune textarea[data-enonce-cle="aucune"]');
    await expect(zoneAucune()).toHaveCount(1);
    await expect(page.locator('#listeCriteres textarea[data-enonce-cle="aucune"]')).toHaveCount(1);
    await expect(page.locator('#listeCriteres .sous-critere-pli--aucune')).toHaveCount(0);
    await expect(page.locator('#listeCriteres .sous-critere-pli[data-pli*=":sc:"]')).toHaveCount(0);
    await expect(page.locator('#listeCriteres textarea[data-champ="retroaction"]')).toHaveCount(0);
    await caseCodes.evaluate((el) => el.click());
    await expect(page.locator('#listeCriteres .sous-criteres-codes--actif')).toHaveCount(1);
    await expect(carte(page, 'codes'), 'le redessin de la case cochée garde l\'étape ouverte').toHaveAttribute('data-ouverte', '');
    await expect(page.locator('#listeCriteres textarea[data-enonce-cle="aucune"]')).toHaveCount(1);
    await expect(page.locator('#listeCriteres .sous-critere-couleur-groupe .travaux-retro-couleur-picker')).toHaveCount(1);
    const pli = () => page.locator('#listeCriteres .sous-critere-pli[data-pli="CR:sc:sc_1"]');
    await expect(pli()).toHaveClass(/ferme/);
    await expect(pli().locator('.accordeon-header h3')).toHaveText(/Observation/);
    await cliquerDom(pli().locator('.accordeon-header'));
    await expect(pli()).not.toHaveClass(/ferme/);
    const observation = 'La thèse est à dégager dès l\'introduction.';
    await frapper(page, '#listeCriteres textarea[data-sc-index="0"][data-champ="retroaction"]', observation);
    await expect(page.locator('#listeCriteres textarea[data-sc-index="0"][data-champ="retroaction"]')).toHaveValue(observation);
    await expect(pli(), 'la frappe redessine, le pli reste déplié').not.toHaveClass(/ferme/);
    await page.evaluate(async () => { await window.chargerGrillePourModif('G2'); await window.chargerGrillePourModif('G1'); });
    await expect(page.locator('#listeCriteres .sous-criteres-codes input[type="checkbox"]')).toBeChecked();
    await expect(page.locator('#listeCriteres textarea[data-sc-index="0"][data-champ="retroaction"]')).toHaveValue(observation);
    let gA = await page.evaluate(async () => ((await db.get(cle('grillesTemplates'))) || []).find(x => x.id === 'G1'));
    expect(gA.criteres[0].codesDepuisSousCriteres).toBe(true);
    expect(gA.criteres[0].sousCriteres[0].retroaction).toBe(observation);
    // Décocher : couleur et pli disparaissent de l'écran ; l'observation reste en base.
    await page.locator('#listeCriteres .sous-criteres-codes input[type="checkbox"]').evaluate((el) => el.click());
    await expect(page.locator('#listeCriteres .sous-critere-pli[data-pli*=":sc:"]')).toHaveCount(0);
    await expect(zoneAucune(), 'décochée, la phrase « Aucune annotation » reste avec les codes').toHaveCount(1);
    await expect(page.locator('#listeCriteres .sous-critere-couleur-groupe')).toHaveCount(0);
    gA = await page.evaluate(async () => ((await db.get(cle('grillesTemplates'))) || []).find(x => x.id === 'G1'));
    expect(gA.criteres[0].sousCriteres[0].retroaction).toBe(observation);

    // 7 — §7 c) : la corbeille supprime un palier et un sous-critère (à la souris, dans une carte dépliée
    //     ou à plat) ; aucun « ✕ » ne reste dans l'éditeur.
    await expect(page.locator('#listeCriteres .btn-supprimer')).toHaveCount(0);
    const nbPaliersAvant = await page.locator('#listeCriteres .palier-projection').count();
    await cliquerDom(carte(page, 'projection').locator('.atelier-algo-etape-tete'));   // ↻ #1150 : l'étape des paliers
    await cliquerDom(page.locator('#listeCriteres .palier-projection').last().locator('.bloc-retirer-coin'));
    await expect(page.locator('#listeCriteres .palier-projection')).toHaveCount(nbPaliersAvant - 1);
    await expect(page.locator('#listeCriteres .sous-critere-input-code')).toHaveCount(1);
    await cliquerDom(carte(page, 'codes').locator('.atelier-algo-etape-tete'));   // ↻ #1150 : l'étape des sous-critères
    // §8 f : le sous-critère porte chevrons + corbeille en coin — la corbeille est le bouton d'icône du coin.
    await cliquerDom(page.locator('#listeCriteres .sous-criteres-conteneur--en-tete .sous-critere-item .bloc-coin-outils .btn-icone-nu').first());
    await expect(page.locator('#listeCriteres .sous-critere-input-code')).toHaveCount(0);
    let g = await page.evaluate(async () => ((await db.get(cle('grillesTemplates'))) || []).find(x => x.id === 'G1'));
    expect(g.criteres[0].sousCriteres).toEqual([]);
    expect(g.criteres[0].paliersProjection.length).toBe(nbPaliersAvant - 1);

    // 8 — §7 d) : le chevron déplace un critère — le même geste que la liste des productions.
    await page.evaluate(async () => { await window.ajouterCritereGrille('G1'); });
    await expect(page.locator('#listeCriteres .item-liste > .bloc-coin-outils')).toHaveCount(2);
    await expect(page.locator('#listeCriteres .bloc-reordonner')).toHaveCount(0);
    await cliquerDom(page.locator('#listeCriteres .item-liste > .bloc-coin-outils').first().locator('[data-action="deplacerCritereGrilleBas"]'));
    g = await page.evaluate(async () => ((await db.get(cle('grillesTemplates'))) || []).find(x => x.id === 'G1'));
    expect(g.criteres.map(c => c.id)[1]).toBe('CR');
    expect(g.criteres[0].nom).toBe('Nouveau critère');
});
