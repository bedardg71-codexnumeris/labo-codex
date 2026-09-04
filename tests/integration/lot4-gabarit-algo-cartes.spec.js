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
            { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, sousCriteres: [
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
        commentaire: l.innerHTML.includes('Modèle de commentaire') && !l.innerHTML.includes('Modèle de rétroaction'),
        euf: [...l.querySelectorAll('option')].some(o => o.textContent === "Projection à l'EUF"),
        motsReference: (l.querySelector('input[data-param-cle="motsReference"]') || {}).value,
        cartesAvecId: [...l.querySelectorAll('.gabarit-algo-carte[id]')].length
    };
}`;

const carte = (page, section) => page.locator(`#listeCriteres .gabarit-algo-carte[data-pli="CR:${section}"]`);
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
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    await page.evaluate(eval(SEMER));

    // 1 — l'ordre et l'état à l'ouverture.
    let etat = await page.evaluate(eval(LIRE));
    console.log('OUVERTURE →', JSON.stringify(etat));
    expect(etat.ordre).toEqual(['sous-criteres', 'CR:formule', 'CR:commentaire', 'CR:projection', 'CR:codes']);
    expect(etat.rangeeAvantSousCriteres, 'les sous-critères viennent tout de suite sous la rangée du critère').toBe(true);
    expect(etat.plis).toEqual({ 'CR:formule': 'ouvert', 'CR:commentaire': 'replie', 'CR:projection': 'replie', 'CR:codes': 'replie' });
    expect(etat.commentaire, '« Modèle de commentaire », plus « Modèle de rétroaction »').toBe(true);
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
    await cliquerBande(page, 'formule');
    await expect(carte(page, 'formule')).toHaveClass(/ferme/);
    await frapper(page, '#listeCriteres .gabarit-algo-carte[data-pli="CR:formule"] input[data-param-cle]', '7');
    await page.waitForTimeout(400);
    etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS FRAPPE (formule repliée) →', JSON.stringify(etat.plis));
    expect(etat.plis['CR:formule']).toBe('replie');
    expect(etat.plis['CR:projection']).toBe('ouvert');

    // 4 — changer de grille et revenir : les plis sont ceux qu'il a laissés.
    await page.evaluate(async () => { await window.chargerGrillePourModif('G2'); await window.chargerGrillePourModif('G1'); });
    await page.waitForTimeout(300);
    etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS RETOUR →', JSON.stringify(etat.plis));
    expect(etat.plis).toEqual({ 'CR:formule': 'replie', 'CR:commentaire': 'replie', 'CR:projection': 'ouvert', 'CR:codes': 'replie' });

    // 5 — rien de tout cela n'est dans la grille : les plis meurent avec la page.
    const grille = await page.evaluate(async () => ((await db.get(cle('grillesTemplates'))) || []).find(g => g.id === 'G1'));
    const texte = JSON.stringify(grille);
    expect(texte).not.toMatch(/"pli|plis|ferme|ouvert/);
    expect(grille.criteres[0].paramsProjection.motsReference, 'la frappe, elle, est bien écrite').toBe(1000);
});
