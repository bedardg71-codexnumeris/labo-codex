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
    const blocs = [...l.querySelectorAll('.sous-criteres-conteneur--en-tete, .gabarit-algo-carte')];
    return {
        ordre: blocs.map(e => e.dataset.pli || 'sous-criteres'),
        plis: Object.fromEntries([...l.querySelectorAll('.gabarit-algo-carte')].map(e => [e.dataset.pli, e.classList.contains('ferme') ? 'replie' : 'ouvert'])),
        rangeeAvantSousCriteres: l.innerHTML.indexOf('data-champ="nom"') < l.innerHTML.indexOf('sous-criteres-conteneur--en-tete'),
        commentaire: l.innerHTML.includes("Modèle des phrases (bilan et décompte)") && !l.innerHTML.includes("Modèle d'observation") && !l.innerHTML.includes('Modèle de rétroaction') && !l.innerHTML.includes('Modèle de commentaire'),
        euf: [...l.querySelectorAll('option')].some(o => o.textContent === "Projection à l'EUF"),
        motsReference: (l.querySelector('input[data-param-cle="motsReference"]') || {}).value,
        cartesAvecId: [...l.querySelectorAll('.gabarit-algo-carte[id]')].length
    };
}`;

const carte = (page, section) => page.locator(`#listeCriteres .gabarit-algo-carte[data-pli="CR:${section}"]`);
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
    const bande = carte(page, section).locator('.accordeon-header');
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

    // 1 — l'ordre et l'état à l'ouverture.
    let etat = await page.evaluate(eval(LIRE));
    console.log('OUVERTURE →', JSON.stringify(etat));
    // ↻ Lot A (5 sept. 2026) : plus de carte « Codes d'annotation » — la liste des sous-critères porte tout.
    expect(etat.ordre).toEqual(['sous-criteres', 'CR:formule', 'CR:commentaire', 'CR:projection']);
    expect(etat.rangeeAvantSousCriteres, 'les sous-critères viennent tout de suite sous la rangée du critère').toBe(true);
    expect(etat.plis).toEqual({ 'CR:formule': 'ouvert', 'CR:commentaire': 'replie', 'CR:projection': 'replie' });
    expect(etat.commentaire, '« Modèle des phrases (bilan et décompte) » (carte « Bilan », 1.120), ni « observation », ni « rétroaction » ni « commentaire »').toBe(true);
    expect(etat.euf, '« Projection à l\'EUF » au menu de projection').toBe(true);
    expect(etat.cartesAvecId, 'aucune carte ne porte d\'id : le composant ne persiste rien').toBe(0);

    // 2 — déplier la projection À LA SOURIS, puis TAPER dans un de ses champs : elle reste dépliée.
    await cliquerBande(page, 'projection');
    await expect(carte(page, 'projection')).not.toHaveClass(/ferme/);
    await frapper(page, '#listeCriteres .gabarit-algo-carte[data-pli="CR:projection"] input[data-param-cle="motsReference"]', '1000');
    await expect(page.locator('#listeCriteres input[data-param-cle="motsReference"]'), 'le gabarit s\'est redessiné avec la valeur').toHaveValue('1000');
    etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS FRAPPE (projection dépliée) →', JSON.stringify(etat.plis));
    expect(etat.plis['CR:projection'], 'la bande reste dépliée sous les doigts').toBe('ouvert');
    expect(etat.plis['CR:formule']).toBe('ouvert');
    expect(etat.plis['CR:commentaire']).toBe('replie');

    // 3 — replier la formule, taper dans un de ses champs : elle reste repliée.
    await cliquerDom(carte(page, 'formule').locator('.accordeon-header'));
    await expect(carte(page, 'formule')).toHaveClass(/ferme/);
    await frapper(page, '#listeCriteres .gabarit-algo-carte[data-pli="CR:formule"] input[data-param-cle]', '7');
    await expect(page.locator('#listeCriteres .gabarit-algo-carte[data-pli="CR:formule"] input[data-param-cle]').first(), 'le gabarit s\'est redessiné avec la valeur').toHaveValue('7');
    etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS FRAPPE (formule repliée) →', JSON.stringify(etat.plis));
    expect(etat.plis['CR:formule']).toBe('replie');
    expect(etat.plis['CR:projection']).toBe('ouvert');

    // 4 — changer de grille et revenir : les plis sont ceux qu'il a laissés.
    await page.evaluate(async () => { await window.chargerGrillePourModif('G2'); await window.chargerGrillePourModif('G1'); });
    await expect(page.locator('#listeCriteres input[data-param-cle="motsReference"]'), 'G1 est de retour, avec la valeur écrite à l\'étape 2').toHaveValue('1000');
    etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS RETOUR →', JSON.stringify(etat.plis));
    expect(etat.plis).toEqual({ 'CR:formule': 'replie', 'CR:commentaire': 'replie', 'CR:projection': 'ouvert' });

    // 5 — rien de tout cela n'est dans la grille : les plis meurent avec la page.
    const grille = await page.evaluate(async () => ((await db.get(cle('grillesTemplates'))) || []).find(g => g.id === 'G1'));
    const texte = JSON.stringify(grille);
    expect(texte).not.toMatch(/"pli|plis|ferme|ouvert/);
    expect(grille.criteres[0].paramsProjection.motsReference, 'la frappe, elle, est bien écrite').toBe(1000);

    // 6 — coup d'œil de Grégoire (4 sept., §7 b) : le nom d'un palier se lit EN ENTIER — « Sans erreur »,
    //     pas « Sans erre » — dans la carte « Projection » dépliée.
    const nomPalier = page.locator('#listeCriteres .gabarit-algo-carte[data-pli="CR:projection"] input.palier-nom').first();
    await expect(nomPalier).toHaveValue('Sans erreur');
    const mesure = await nomPalier.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth, largeur: el.getBoundingClientRect().width }));
    console.log('PALIER « Sans erreur » →', JSON.stringify(mesure));
    expect(mesure.scroll, 'le texte tient dans le champ').toBeLessThanOrEqual(mesure.client);
    expect(mesure.largeur).toBeGreaterThan(120);
    // La note du composeur (texte troué, étape 2 — elle remplace « Écris {service}… ») : une seule, sous les paliers.
    await expect(page.locator('#listeCriteres .gabarit-algo-carte[data-pli="CR:projection"] .palier-note-composer')).toHaveCount(1);
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
    await expect(page.locator('#listeCriteres .gabarit-algo-carte[data-pli="CR:codes"]')).toHaveCount(0);
    const caseCodes = page.locator('#listeCriteres .sous-criteres-conteneur--en-tete .sous-criteres-codes input[type="checkbox"]');
    await expect(caseCodes).toHaveCount(1);
    await expect(caseCodes).not.toBeChecked();
    // ↻ La carte « Bilan » (5 sept. 2026, 1.120) : sous la case, cochée ou non, le pli « Quand la copie ne porte
    //     aucun code » (fermé, le même composant) porte « Aucune annotation », partie de la carte « Bilan » ;
    //     ce qui n'existe pas décoché, c'est le pli DE RANGÉE. On le déplie par l'événement DOM ; le redessin
    //     qui suit la case cochée le garde déplié (les plis vivent en mémoire).
    const pliAucune = () => page.locator('#listeCriteres .sous-critere-pli--aucune[data-pli="CR:aucune"]');
    await expect(pliAucune()).toHaveCount(1);
    await expect(pliAucune()).toHaveClass(/ferme/);
    await expect(pliAucune().locator('.accordeon-header h3')).toHaveText(/Quand la copie ne porte aucun code/);
    await expect(page.locator('#listeCriteres textarea[data-enonce-cle="aucune"]')).toHaveCount(1);
    await expect(page.locator('#listeCriteres .gabarit-algo-carte[data-pli="CR:commentaire"] textarea[data-enonce-cle="aucune"]')).toHaveCount(0);
    await expect(page.locator('#listeCriteres .sous-critere-pli[data-pli*=":sc:"]')).toHaveCount(0);
    await expect(page.locator('#listeCriteres textarea[data-champ="retroaction"]')).toHaveCount(0);
    await cliquerDom(pliAucune().locator('.accordeon-header'));
    await expect(pliAucune()).not.toHaveClass(/ferme/);
    await caseCodes.evaluate((el) => el.click());
    await expect(page.locator('#listeCriteres .sous-criteres-codes--actif')).toHaveCount(1);
    await expect(pliAucune(), 'le redessin de la case cochée garde le pli déplié').not.toHaveClass(/ferme/);
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
    await expect(pliAucune(), 'décochée, la phrase « Aucune annotation » reste sous la case').toHaveCount(1);
    await expect(page.locator('#listeCriteres .sous-critere-couleur-groupe')).toHaveCount(0);
    gA = await page.evaluate(async () => ((await db.get(cle('grillesTemplates'))) || []).find(x => x.id === 'G1'));
    expect(gA.criteres[0].sousCriteres[0].retroaction).toBe(observation);

    // 7 — §7 c) : la corbeille supprime un palier et un sous-critère (à la souris, dans une carte dépliée
    //     ou à plat) ; aucun « ✕ » ne reste dans l'éditeur.
    await expect(page.locator('#listeCriteres .btn-supprimer')).toHaveCount(0);
    const nbPaliersAvant = await page.locator('#listeCriteres .palier-projection').count();
    await cliquerDom(page.locator('#listeCriteres .palier-projection').last().locator('.bloc-retirer-coin'));
    await expect(page.locator('#listeCriteres .palier-projection')).toHaveCount(nbPaliersAvant - 1);
    await expect(page.locator('#listeCriteres .sous-critere-input-code')).toHaveCount(1);
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
