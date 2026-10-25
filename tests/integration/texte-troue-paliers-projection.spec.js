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
const palier = (page, i) => page.locator('#listeCriteres .palier-projection').nth(i);
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
    await expect(page.locator('#listeCriteres .palier-projection')).toHaveCount(6);
    await expect(page.locator('#listeCriteres .palier-projection [data-action="insererRepereEnonce"]')).toHaveCount(0);
    await focusEnFin(zone(page, 4, 'texte'));
    const offerts = await page.locator('#listeCriteres .palette-algo .palette-algo-bloc:not([aria-disabled="true"])').evaluateAll((els) => ({
        jetons: els.map((b) => b.dataset.jeton),
        noms: els.map((b) => b.querySelector('.palette-algo-bloc-nom').textContent.trim()),
        familles: els.map((b) => (b.classList.contains('palette-algo-bloc--posee') ? 'posee' : (b.classList.contains('palette-algo-bloc--remplie') ? 'remplie' : '?'))),
        visibles: els.every((b) => b.offsetParent !== null)
    }));
    console.log('PALETTE VISANT LE PALIER 5 →', JSON.stringify(offerts));
    expect(offerts.jetons).toEqual(['{service}', '{seuil}', '{longueur}', '{erreurs}', '{mots}', '{moyenne}', '{projection}', '{palier}']);
    expect(offerts.noms).toEqual(['Nom du service', 'Erreurs tolérées', 'Longueur de référence', 'Compte des erreurs', 'Compte des mots', 'Mots par erreur', 'Erreurs projetées', 'Palier atteint']);
    expect(offerts.familles).toEqual(['posee', 'posee', 'posee', 'remplie', 'remplie', 'remplie', 'remplie', 'remplie']);
    expect(offerts.visibles, 'les blocs sont à l\'écran').toBe(true);
    await expect(page.locator('#listeCriteres .palette-algo .palette-algo-cible')).toHaveText('Tu écris dans : « Verdict, palier 5 »');
    await expect(page.locator('#listeCriteres .palier-note-service')).toHaveCount(0);
    await expect(page.locator('#listeCriteres .palier-note-composer')).toHaveCount(1);

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

    // 7 — L'APERÇU, SOUS CHAQUE PALIER (§5, coup d'œil de Grégoire : on compose dans le palier, on lit
    //     le résultat au même endroit). Plus de carte « Ce que l'élève lira ».
    await expect(carte(page, 'apercu')).toHaveCount(0);
    await expect(page.locator('#listeCriteres .palier-projection .palier-apercu')).toHaveCount(6);
    const lues = await page.locator('#listeCriteres .palier-projection .palier-apercu').evaluateAll((els) => els.map((e) => ({
        mot: e.querySelector('.palier-apercu-mot').textContent.trim(),
        engendre: e.querySelector('.palier-apercu-engendre').textContent.trim(),
        ecrit: e.querySelector('.palier-apercu-ecrit').textContent.trim(),
        copie: e.querySelector('.palier-apercu-copie').textContent.trim()
    })));
    console.log('APERÇU →', JSON.stringify(lues));
    // ↻ §7 : DEUX segments — en gris ce qui est engendré, dans l'encre ce qu'il a écrit. ↻ §8 : le décompte se
    //    compose dans la même carte, juste au-dessus ; l'étiquette redevient « L'élève lira : ».
    expect(lues.every((l) => l.mot === 'L\'élève lira :')).toBe(true);
    // Le palier composé : en gris le décompte seul (la phrase porte un badge : plus de préfixe) ; dans l'encre, la phrase entière, jetons remplis.
    expect(lues[4].copie).toBe('— copie fictive, 23 erreurs pour 900 mots');
    expect(lues[4].engendre).toBe('Ta production contient 23 erreurs pour 900 mots.');
    expect(lues[4].ecrit).toBe(verdictDHier + ' Bilan : 23 900 Il est recommandé de t\'inscrire au Passerelle +. 30');
    expect(lues[4].engendre + ' ' + lues[4].ecrit).not.toContain('Tu fais en moyenne');
    // Un palier d'hier : le préfixe engendré en gris, avec le décompte ; son verdict dans l'encre.
    expect(lues[1].engendre).toBe('Ta production contient 5 erreurs pour 900 mots. Tu fais en moyenne 1 erreur à chaque 180 mots.');
    expect(lues[1].ecrit).toBe('En prévision de l\'EUF, ce ratio est excellent.');
    // Les deux zones s'appellent « Verdict » et « Recommandation (facultative) » ; l'aide sur les badges précède le premier palier.
    // ↻ #790 (8 sept. 2026) — UNE CINQUIÈME ÉTIQUETTE, et l'égalité stricte est GARDÉE exprès :
    // un palier ne doit pas gagner un champ sans que quelqu'un le décide. C'est cette attente qui
    // a signalé l'ajout, et c'est ce qu'on attend d'elle. Les textes sont normalisés (espaces et
    // retours d'indentation écrasés) : sans ça, l'oracle dépendrait de la mise en forme du gabarit.
    const etiquettes = (await palier(page, 4).locator('label').allTextContents())
        .map((t) => t.replace(/\s+/g, ' ').trim());
    expect(etiquettes).toEqual([
        'Palier 5', 'Jusqu\'à', 'Verdict', 'Recommandation (facultative)',
        'Ce palier lève un signalement — pour toi, à côté du palier RàI de l\'élève. Rien n\'est écrit sur sa copie.'
    ]);
    const aideEnTete = await carte(page, 'projection').evaluate((el) => {
        const note = el.querySelector('.palier-note-composer');
        const premier = el.querySelector('.palier-projection');
        return !!(note && premier && (note.compareDocumentPosition(premier) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    expect(aideEnTete, 'l\'aide sur les badges vient avant le premier palier').toBe(true);
    // En bas de la carte « Projection » : la copie non corrigée, une fois, et la note, une fois.
    const nonCorrigee = carte(page, 'projection').locator('.palier-apercu-non-corrigee');
    await expect(nonCorrigee).toHaveCount(1);
    await expect(nonCorrigee).toHaveText('Copie non corrigée : aucune phrase avant la correction.');
    await expect(carte(page, 'projection').locator('.palier-apercu-note')).toHaveCount(1);
    await expect(carte(page, 'projection').locator('.palier-apercu-note')).toContainText('ne montre pas la rétroaction du sous-critère dominant');

    // 8 — un jeton INCONNU tapé à la main (palier 1, « Sans erreur ») : la ligne orange le dit, AU-DESSUS de
    //     la ligne « L'élève lira : », qui le montre tel quel.
    await expect(page.locator('#listeCriteres .palier-jetons-inconnus')).toHaveCount(0);
    await frapper(zone(page, 0, 'texte'), 'Bravo {truc}.');
    await expect(page.locator('#listeCriteres .palier-jetons-inconnus')).toHaveCount(1);
    await expect(page.locator('#listeCriteres .palier-jetons-inconnus')).toContainText('Le badge « {truc} » est inconnu de cette version');
    await expect(palier(page, 0).locator('.palier-apercu-engendre')).toHaveText('Ta production contient 0 erreur pour 900 mots.');
    await expect(palier(page, 0).locator('.palier-apercu-ecrit')).toHaveText('Bravo {truc}.');
    const ordre = await palier(page, 0).evaluate((el) => {
        const orange = el.querySelector('.palier-jetons-inconnus');
        const apercu = el.querySelector('.palier-apercu');
        return !!(orange.compareDocumentPosition(apercu) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(ordre, 'la ligne orange précède la ligne « L\'élève lira : »').toBe(true);
    // Le redessin a gardé la carte dépliée, et n'a rien écrit d'autre.
    await expect(carte(page, 'projection')).toHaveAttribute('data-ouverte', '');
    expect((await paliersEnBase(page))[4].texte).toBe(verdictDHier + ' Bilan : {projection} {longueur}');
});
