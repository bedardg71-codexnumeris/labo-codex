import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// Le texte troué, ÉTAPE 2 — les paliers de projection se composent avec des badges
// (4 septembre 2026), éprouvé dans un vrai WebKit, contre le vrai index.html.
//
// Ce que les trois sentinelles Vitest ne peuvent pas voir, et que ce spec mesure :
//   · le CLIC : un vrai pointeur sur un badge, et le jeton qui arrive dans la zone du
//     palier où est le curseur — après une FRAPPE, sans que la zone perde le focus ;
//   · ENREGISTRER, ROUVRIR : les deux jetons posés sont écrits dans la grille (mode
//     édition, `db.modifier`), et se relisent après un changement de grille ;
//   · L'APERÇU sous chaque palier (§5) : la phrase du palier composé, remplie, sans le
//     préfixe engendré ; celle d'un palier d'hier, avec ; la copie non corrigée, dite en bas ;
//   · un jeton INCONNU tapé à la main se dit sous son palier, et l'élève le lirait tel quel ;
//   · le témoin négatif : un palier non touché lit et écrit ce qu'il portait.
//
// ⚠ Règle du 4 septembre (docs/securite/TESTS-AUTOMATISES.md §4) : UN seul clic à la
// souris (le badge, c'est le pointeur qu'on éprouve) ; tout autre geste passe par
// l'événement DOM ; on attend le rendu, jamais un délai.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set(cle('grillesTemplates'), [
        { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [
            { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe',
              paramsProjection: { nomServiceAide: 'Passerelle +' } } ] },
        { id: 'G2', nom: 'Autre', dansBibliotheque: true, criteres: [ { id: 'H', nom: 'Contenu', type: 'holistique', ponderation: 100 } ] }
    ]);
    window.afficherSection('conception');
    window.afficherSousSection('conception-grille-criteres');
    await window.chargerGrillePourModif('G1');
}`;

// ↻ #1150 (24 oct. 2026) : les cartes sont devenues les étapes de l'atelier (une seule ouverte, l'état gardé en
// mémoire au redessin) : « projection » → l'étape « Paliers », « commentaire » → « Ce que l'élève lit ».
const ETAPE_DE = { projection: 'paliers', commentaire: 'eleve', formule: 'note' };
const carte = (page, section) => page.locator(`#listeCriteres .gabarit-algo[data-critere-id="CR"] .atelier-algo-etape[data-etape="${ETAPE_DE[section || 'projection'] || section}"]`);
const cliquerDom = (locator) => locator.evaluate((el) => el.click());
/** Ouvre l'étape par son en-tête (le geste), si elle n'est pas déjà ouverte. */
const ouvrirCarte = async (page, section) => {
    const c = carte(page, section);
    if (await c.getAttribute('data-ouverte') === null) await cliquerDom(c.locator('.atelier-algo-etape-tete'));
    await expect(c).toHaveAttribute('data-ouverte', '');
};
// ↻ Lot 3a de la table de cas (26 oct. 2026) : un palier est une rangée de la table des paliers.
const palier = (page, i) => page.locator('#listeCriteres .table-cas-rangee').nth(i);
/** « Voir ce que l'étudiant·e lirait à ce palier » (lot 3a), puis la phrase du PDF dans la simulation, sans étiquettes. */
const lireAuPalier = async (page, i) => {
    await cliquerDom(palier(page, i).locator('[data-apercu-geste="palier"]'));
    return page.locator('#listeCriteres .gabarit-algo[data-critere-id="CR"] .apercu-algo [data-lecture="pdf"]').evaluate((p) =>
        [...p.querySelectorAll('.apercu-algo-segment')].map((s) => s.lastChild.textContent).join(' '));
};
const zone = (page, i, champ) => palier(page, i).locator(`textarea[data-palier-index="${i}"][data-champ="${champ}"]`);
// ↻ Étape 2b (22 oct. 2026) : plus de palette par palier — LA palette du critère vise la zone où est le curseur.
const badge = (page, jeton) => page.locator(`#listeCriteres .palette-algo [data-action="insererRepereEnonce"][data-jeton="${jeton}"]`);
const paliersEnBase = (page) => page.evaluate(async () =>
    ((await db.get(cle('grillesTemplates'))) || []).find((g) => g.id === 'G1').criteres[0].paliersProjection);
/** La frappe telle que le navigateur la livre : la valeur, puis `change`. */
const frapper = (locator, valeur) => locator.evaluate((el, v) => {
    el.value = v;
    el.dispatchEvent(new Event('change', { bubbles: true }));
}, valeur);
/**
 * Le focus dans une zone, le curseur À LA FIN — comme un doigt qui touche après le dernier
 * mot. ⚠ Mesuré dans WebKit : `keyboard.press('End')` après `focus()` laissait le curseur en
 * tête de zone (le texte était inséré à la position 0) ; on pose le curseur explicitement.
 */
const focusEnFin = (locator) => locator.evaluate((el) => {
    // ↻ Étape 3 (5 sept. 2026) : la zone que l'œil voit est la VUE du composeur ; le textarea, caché,
    // reste la valeur. Le focus et le caret se posent dans la vue, en positions de texte.
    const vue = window.composeurBadges && window.composeurBadges.vueDe(el);
    if (vue) { vue.focus(); window.composeurBadges.placerCaret(vue, el.value.length); return; }
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
});
/**
 * LE clic à la souris du spec. Juste après un rendu, la liste bouge encore quelques
 * dizaines de millisecondes (mesuré le 4 sept. sur les bandes d'accordéon) : on attend
 * que la boîte du badge soit immobile d'une image à l'autre, puis on clique.
 */
async function cliquerSouris(locator) {
    await locator.scrollIntoViewIfNeeded();
    let precedent = null;
    for (let i = 0; i < 40; i++) {
        const boite = await locator.boundingBox();
        const cle = boite ? [boite.x, boite.y, boite.width, boite.height].map(Math.round).join(',') : '';
        if (cle && cle === precedent) break;
        precedent = cle;
        await locator.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    }
    await locator.click();
}

test('texte troué 2 · deux badges posés dans un palier au clic, enregistrés, relus après réouverture, et lus dans l\'aperçu', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(eval(SEMER));

    // 1 — la carte « Projection » est repliée ; on la déplie par l'événement DOM.
    await expect(carte(page, 'projection')).not.toHaveAttribute('data-ouverte', '');
    await ouvrirCarte(page, 'projection');

    // 2 — six paliers, aucune palette de palier ; la zone du palier 5 visée, la palette du critère active
    //     ses huit blocs dans l'ordre arrêté, nommés en mots (↻ 2b, 22 oct. 2026).
    await expect(page.locator('#listeCriteres .table-cas-rangee')).toHaveCount(6);   // ↻ lot 3a : la table des paliers
    await expect(page.locator('#listeCriteres .table-cas-rangee [data-action="insererRepereEnonce"]')).toHaveCount(0);
    await focusEnFin(zone(page, 4, 'texte'));
    const offerts = await page.locator('#listeCriteres .palette-algo .palette-algo-bloc:not([aria-disabled="true"])').evaluateAll((els) => ({
        jetons: els.map((b) => b.dataset.jeton),
        noms: els.map((b) => b.querySelector('.palette-algo-bloc-nom').textContent.trim()),
        familles: els.map((b) => (b.classList.contains('palette-algo-bloc--posee') ? 'posee' : (b.classList.contains('palette-algo-bloc--remplie') ? 'remplie' : '?'))),
        visibles: els.every((b) => b.offsetParent !== null)
    }));
    console.log('PALETTE VISANT LE PALIER 5 →', JSON.stringify(offerts));
    // ↻ Lot 3a (26 oct. 2026) : les deux noms aussi (§ 3.8), et les mots de l'ébauche.
    expect(offerts.jetons).toEqual(['{nomErreurs}', '{nomMots}', '{service}', '{seuil}', '{longueur}', '{erreurs}', '{mots}', '{moyenne}', '{projection}', '{palier}']);
    expect(offerts.noms).toEqual(['« erreurs »', '« mots »', 'Nom du service', 'Tolérance', 'Longueur de référence', 'Compte des erreurs', 'Compte des mots', 'Moyenne de mots par erreur', 'Compte projeté', 'Palier atteint']);
    expect(offerts.familles).toEqual(['posee', 'posee', 'posee', 'posee', 'posee', 'remplie', 'remplie', 'remplie', 'remplie', 'remplie']);
    expect(offerts.visibles, 'les blocs sont à l\'écran').toBe(true);
    await expect(page.locator('#listeCriteres .palette-algo .palette-algo-cible')).toHaveText('Zone choisie : Verdict, palier Risqué');   // ↻ lot 3a : le palier par son nom court
    await expect(page.locator('#listeCriteres .palier-note-service')).toHaveCount(0);
    await expect(page.locator('#listeCriteres .table-cas-ou')).toHaveCount(1);   // ↻ lot 3a : l'introduction de la table dit la décision sur le préfixe

    // 3 — palier 5 (« Risqué ») : FRAPPE dans « Ce que l'élève lit », puis LE clic à la souris sur
    //     le badge {projection}. La zone est focalisée ET modifiée : si le bouton prenait le focus,
    //     `change` partirait, le gabarit se redessinerait et le clic tomberait dans le vide.
    const texte = zone(page, 4, 'texte');
    const verdictDHier = 'En prévision de l\'EUF, ce ratio est risqué parce qu\'il est près du seuil de l\'échec.';
    await expect(texte).toHaveValue(verdictDHier);
    await focusEnFin(texte);
    await page.keyboard.type(' Bilan :');
    await cliquerSouris(badge(page, '{projection}'));
    await expect(texte).toHaveValue(verdictDHier + ' Bilan : {projection}');
    const apresClic = await page.evaluate(() => {
        const t = document.querySelector('#listeCriteres textarea[data-palier-index="4"][data-champ="texte"]');
        const vue = window.composeurBadges.vueDe(t);
        const c = vue ? window.composeurBadges.curseur(vue) : null;
        return { focalisee: !!vue && document.activeElement === vue, curseur: c ? c.debut : t.selectionStart, longueur: t.value.length };
    });
    console.log('APRÈS FRAPPE + CLIC →', JSON.stringify(apresClic));
    expect(apresClic.focalisee, 'la zone garde le focus : on continue d\'écrire').toBe(true);
    expect(apresClic.curseur, 'le curseur est après le badge').toBe(apresClic.longueur);
    // Écrit sur la grille sans attendre la sortie de la zone (mode édition : `db.modifier`).
    await expect.poll(async () => (await paliersEnBase(page))[4].texte).toBe(verdictDHier + ' Bilan : {projection}');

    // 4 — second badge, par l'événement DOM : la zone est toujours celle où est le curseur.
    await cliquerDom(badge(page, '{longueur}'));
    await expect(texte).toHaveValue(verdictDHier + ' Bilan : {projection} {longueur}');

    // 5 — la palette sert aussi la recommandation : focus sur l'autre zone du même palier, badge {seuil}.
    const aide = zone(page, 4, 'texteAide');
    await expect(aide).toHaveValue('Il est recommandé de t\'inscrire au {service}.');
    await focusEnFin(aide);
    await cliquerDom(badge(page, '{seuil}'));
    await expect(aide).toHaveValue('Il est recommandé de t\'inscrire au {service}. {seuil}');
    await expect(texte, 'l\'autre zone n\'a pas bougé').toHaveValue(verdictDHier + ' Bilan : {projection} {longueur}');
    await expect.poll(async () => (await paliersEnBase(page))[4].texteAide).toBe('Il est recommandé de t\'inscrire au {service}. {seuil}');

    // 6 — ROUVRIR : changer de grille et revenir. Les jetons se relisent tels quels.
    await page.evaluate(async () => { await window.chargerGrillePourModif('G2'); await window.chargerGrillePourModif('G1'); });
    await expect(zone(page, 4, 'texte')).toHaveValue(verdictDHier + ' Bilan : {projection} {longueur}');
    await expect(zone(page, 4, 'texteAide')).toHaveValue('Il est recommandé de t\'inscrire au {service}. {seuil}');
    const enBase = await paliersEnBase(page);
    console.log('EN BASE →', JSON.stringify(enBase.map((p) => [p.cle, p.texte, p.texteAide])));
    expect(enBase.length).toBe(6);
    expect(enBase[4].texte).toBe(verdictDHier + ' Bilan : {projection} {longueur}');
    expect(enBase[4].texteAide).toBe('Il est recommandé de t\'inscrire au {service}. {seuil}');
    // Témoin négatif : le palier « Excellent » lit et porte ce qu'il portait.
    await expect(zone(page, 1, 'texte')).toHaveValue('En prévision de l\'EUF, ce ratio est excellent.');
    expect(enBase[1].texte).toBe('En prévision de l\'EUF, ce ratio est excellent.');
    expect(enBase[1].texteAide).toBe('');

    // 7 — ↻ LOT 3a (26 oct. 2026) : L'APERÇU SOUS CHAQUE PALIER EST PARTI. « Voir ce que l'étudiant·e lirait à ce
    //     palier » règle la simulation de l'atelier sur une copie qui l'atteint, par le calcul de l'évaluation.
    await expect(carte(page, 'apercu')).toHaveCount(0);
    await expect(page.locator('#listeCriteres .palier-apercu')).toHaveCount(0);
    await expect(page.locator('#listeCriteres [data-apercu-geste="palier"]')).toHaveCount(6);
    // Le palier composé : la phrase porte un badge, plus de préfixe ; les jetons remplis.
    const lu4 = await lireAuPalier(page, 4);
    console.log('PALIER 4 →', JSON.stringify(lu4));
    expect(lu4).toMatch(new RegExp('^Ta production contient (\\d+) erreurs pour 900 mots\\. ' + verdictDHier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' Bilan : \\d+ 900 Il est recommandé de t\'inscrire au Passerelle \\+\\. 30$'));
    expect(lu4).not.toContain('Tu fais en moyenne');
    await expect(palier(page, 4)).toHaveAttribute('data-atteint', '');
    // Un palier d'hier : le préfixe engendré, puis son verdict.
    const lu1 = await lireAuPalier(page, 1);
    console.log('PALIER 1 →', JSON.stringify(lu1));
    expect(lu1).toMatch(/^Ta production contient \d+ erreurs? pour 900 mots\. Tu fais en moyenne 1 erreur à chaque \d+ mots\. En prévision de l'EUF, ce ratio est excellent\.$/);
    await expect(palier(page, 1)).toHaveAttribute('data-atteint', '');
    await expect(palier(page, 4)).not.toHaveAttribute('data-atteint', '');
    // Les zones s'appellent « Verdict » et « Recommandation » ; le signalement a sa case ; l'introduction précède la première rangée.
    const noms = (await palier(page, 4).locator('.table-cas-zone-nom').allTextContents()).map((t) => t.trim());
    expect(noms).toEqual(['Verdict', 'Recommandation']);
    const signal = (await palier(page, 4).locator('label.palier-leve-signalement').textContent()).replace(/\s+/g, ' ').trim();
    expect(signal).toBe('Ce palier lève un signalement (pour toi, à côté du palier RàI de l’étudiant·e ; rien n’est écrit sur sa copie)');
    const introEnTete = await carte(page, 'projection').evaluate((el) => {
        const intro = el.querySelector('.table-cas-ou');
        const premier = el.querySelector('.table-cas-rangee');
        return !!(intro && premier && (intro.compareDocumentPosition(premier) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    expect(introEnTete, 'l\'introduction de la table vient avant le premier palier').toBe(true);

    // 8 — un jeton INCONNU tapé à la main (palier 1, « Sans erreur ») : la ligne orange le dit sous lui ; la simulation
    //     le montre tel quel.
    await expect(page.locator('#listeCriteres .palier-jetons-inconnus')).toHaveCount(0);
    await frapper(zone(page, 0, 'texte'), 'Bravo {truc}.');
    await expect(page.locator('#listeCriteres .palier-jetons-inconnus')).toHaveCount(1);
    await expect(page.locator('#listeCriteres .palier-jetons-inconnus')).toContainText('Le badge « {truc} » est inconnu de cette version');
    await expect(palier(page, 0).locator('.palier-jetons-inconnus')).toHaveCount(1);
    expect(await lireAuPalier(page, 0)).toBe('Ta production contient 0 erreur pour 900 mots. Bravo {truc}.');
    // Le redessin a gardé la carte dépliée, et n'a rien écrit d'autre.
    await expect(carte(page, 'projection')).toHaveAttribute('data-ouverte', '');
    expect((await paliersEnBase(page))[4].texte).toBe(verdictDHier + ' Bilan : {projection} {longueur}');
});
