import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LE TEXTE TROUÉ, ÉTAPE 3 (5 septembre 2026) — LE BADGE S'AFFICHE DANS LA PHRASE, dans un vrai WebKit.
//
// Un badge posé au clic dans un palier s'affiche comme une pastille (la chip) dans la vue ; on tape
// autour au clavier, on va à la ligne, on quitte la zone : la grille porte `{projection}` en texte
// brut, avec le saut de ligne ; on recharge : la chip est là, la donnée n'a pas bougé ; on retire le
// badge par sa croix, on quitte : la donnée le perd. Une grille rechargée SANS frappe ne change pas.
//
// ⛔ Aucun `page.click` à l'aveugle, aucun `waitForTimeout` : les gestes passent par l'événement DOM,
// la frappe par le clavier de Playwright (c'est l'objet même de ce spec), l'attente par l'écran.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set(cle('grillesTemplates'), [
        { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [
            { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe',
              paramsProjection: { nomServiceAide: 'Passerelle +', motsReference: 900, erreursTolerees: 30 } } ] },
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
const vue = (page, i, champ) => zone(page, i, champ).locator('xpath=following-sibling::*[1]');
// ↻ Étape 2b (22 oct. 2026) : les blocs se posent depuis LA palette du critère, qui vise la zone où est le curseur.
const bloc = (page, jeton) => page.locator(`#listeCriteres .palette-algo [data-action="insererRepereEnonce"][data-jeton="${jeton}"]`);
const grilleEnBase = (page) => page.evaluate(async () => ((await db.get(cle('grillesTemplates'))) || []).find((x) => x.id === 'G1'));
const recharger = (page) => page.evaluate(async () => { await window.chargerGrillePourModif('G2'); await window.chargerGrillePourModif('G1'); });
/** Focus dans la vue, le caret à une position de TEXTE (le composeur lui-même le pose). */
const caretA = (locator, position) => locator.evaluate((el, p) => { el.focus(); window.composeurBadges.placerCaret(el, p); }, position);

test('texte troué 3 · le badge posé s\'affiche en pastille, on tape autour, on quitte, on recharge : la grille porte le texte brut, l\'écran la chip', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(eval(SEMER));
    const dispo = await page.evaluate(() => window.composeurBadges.disponible());
    console.log('COMPOSEUR DISPONIBLE →', dispo);
    expect(dispo, 'WebKit accepte contenteditable : le composeur est disponible').toBe(true);

    // 1 — la carte dépliée : chaque zone de palier porte sa vue, le textarea est caché et garde sa valeur.
    await expect(carte(page)).not.toHaveAttribute('data-ouverte', '');
    await ouvrirCarte(page);
    await expect(page.locator('#listeCriteres .table-cas-rangee')).toHaveCount(6);   // ↻ lot 3a : la table des paliers
    await expect(page.locator('#listeCriteres .table-cas-rangee .composeur-badges')).toHaveCount(12);
    // ↻ #1150 : « Ce que l'élève lit » porte le décompte et les deux phrases du bilan ; « Aucune annotation » vit avec les codes.
    await expect(carte(page, 'commentaire').locator('.composeur-badges')).toHaveCount(3);
    const verdictDHier = 'En prévision de l\'EUF, ce ratio est risqué parce qu\'il est près du seuil de l\'échec.';
    await expect(zone(page, 4, 'texte')).toBeHidden();
    await expect(zone(page, 4, 'texte')).toHaveValue(verdictDHier);
    await expect(vue(page, 4, 'texte')).toHaveClass(/composeur-badges/);
    await expect(vue(page, 4, 'texte')).toHaveText(verdictDHier);
    await expect(vue(page, 4, 'texte').locator('.composeur-chip')).toHaveCount(0);
    // Le décompte : ses jetons sont déjà des chips. ↻ Étape 2a (22 oct. 2026) : le texte par défaut ne porte
    // plus `{s}` ; les deux noms sont des chips (cinq : nombre et nom de chacun, et la parenthèse).
    const decompte = page.locator('#listeCriteres textarea[data-enonce-cle="decompte"]').locator('xpath=following-sibling::*[1]');
    await expect(decompte.locator('.composeur-chip')).toHaveCount(5);
    await expect(decompte).not.toContainText('{');

    // 2 — le caret à la fin, UN badge cliqué (le dispatcher) : la chip apparaît, le textarea porte `{projection}`, le focus reste.
    await caretA(vue(page, 4, 'texte'), verdictDHier.length);
    await cliquerDom(bloc(page, '{projection}'));
    await expect(vue(page, 4, 'texte').locator('.composeur-chip')).toHaveCount(1);
    await expect(vue(page, 4, 'texte').locator('.composeur-chip')).toHaveAttribute('data-jeton', '{projection}');
    // ↻ 2b : la chip montre le NOM du bloc, plus le nom de code.
    await expect(vue(page, 4, 'texte').locator('.composeur-chip')).toContainText('Compte projeté');   // ↻ lot 3a : le bloc sans « erreurs »
    await expect(zone(page, 4, 'texte')).toHaveValue(verdictDHier + ' {projection}');
    expect(await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('composeur-badges'))).toBe(true);

    // 3 — taper autour, au clavier, puis Entrée, puis une seconde ligne : la valeur suit, le caret survit.
    await page.keyboard.type(' erreurs');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Ligne 2');
    const attendu = verdictDHier + ' {projection} erreurs\nLigne 2';
    await expect(zone(page, 4, 'texte')).toHaveValue(attendu);
    const lu = await vue(page, 4, 'texte').evaluate((el) => window.composeurBadges.lire(el));
    console.log('LU DANS LA VUE →', JSON.stringify(lu));
    expect(lu).toBe(attendu);
    // Le badge cliqué est ÉCRIT (le chemin sans rendu de l'étape 2) ; ce qui est tapé depuis ne l'est pas encore.
    expect((await grilleEnBase(page)).criteres[0].paliersProjection[4].texte).toBe(verdictDHier + ' {projection}');

    // 4 — quitter la zone : `change` part du textarea, la grille porte le texte brut, le gabarit se redessine avec la chip.
    await vue(page, 4, 'texte').evaluate((el) => el.blur());
    await expect(zone(page, 4, 'texte')).toHaveValue(attendu);
    let g = await grilleEnBase(page);
    expect(g.criteres[0].paliersProjection[4].texte).toBe(attendu);
    await expect(vue(page, 4, 'texte').locator('.composeur-chip')).toHaveCount(1);
    await expect(vue(page, 4, 'texte').locator('br')).toHaveCount(1);
    // ↻ Lot 3a : la simulation, réglée sur le palier, lit la phrase remplie, saut de ligne compris.
    const lu4 = await lireAuPalier(page, 4);
    expect(lu4).toMatch(/\d+ erreurs\nLigne 2/);

    // 5 — recharger sans frappe : la chip est là, la donnée n'a pas bougé (au caractère), rien n'est réécrit.
    const avant = JSON.stringify(g);
    await recharger(page);
    await ouvrirCarte(page);
    await expect(vue(page, 4, 'texte').locator('.composeur-chip')).toHaveCount(1);
    await expect(zone(page, 4, 'texte')).toHaveValue(attendu);
    // Entrer dans une zone et en sortir SANS frappe n'écrit rien.
    await caretA(vue(page, 1, 'texte'), 0);
    await vue(page, 1, 'texte').evaluate((el) => el.blur());
    expect(JSON.stringify(await grilleEnBase(page))).toBe(avant);

    // 6 — retirer le badge par sa croix (pointerdown, comme le doigt) : la chip part, la valeur aussi ; quitter écrit.
    await caretA(vue(page, 4, 'texte'), 0);
    await vue(page, 4, 'texte').locator('.composeur-chip-croix').evaluate((el) => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })));
    await expect(vue(page, 4, 'texte').locator('.composeur-chip')).toHaveCount(0);
    await expect(zone(page, 4, 'texte')).toHaveValue(verdictDHier + '  erreurs\nLigne 2');
    await vue(page, 4, 'texte').evaluate((el) => el.blur());
    g = await grilleEnBase(page);
    expect(g.criteres[0].paliersProjection[4].texte).toBe(verdictDHier + '  erreurs\nLigne 2');

    // 7 — l'effacement arrière sur un badge (le comportement natif, à confirmer à la porte iPad) : mesuré, dit.
    await caretA(vue(page, 4, 'texte'), verdictDHier.length);
    await cliquerDom(bloc(page, '{palier}'));
    await expect(vue(page, 4, 'texte').locator('.composeur-chip')).toHaveCount(1);
    await page.keyboard.press('Backspace');
    const apresBackspace = await vue(page, 4, 'texte').evaluate((el) => ({ chips: el.querySelectorAll('.composeur-chip').length, texte: window.composeurBadges.lire(el) }));
    console.log('APRÈS EFFACEMENT ARRIÈRE →', JSON.stringify(apresBackspace));
    expect([0, 1]).toContain(apresBackspace.chips);
    if (apresBackspace.chips === 0) expect(apresBackspace.texte).not.toContain('{palier}');
    // Quitter cette zone d'abord : son `change` redessine le gabarit entier (comme avant ce lot), et un
    // focus pris AVANT le redessin serait perdu avec l'élément remplacé.
    await vue(page, 4, 'texte').evaluate((el) => el.blur());
    await expect(vue(page, 4, 'texte').locator('.composeur-chip')).toHaveCount(apresBackspace.chips);

    // 8 — un jeton INCONNU tapé à la main reste du texte, et la ligne orange le dit.
    await caretA(vue(page, 0, 'texte'), 0);
    await page.keyboard.type('Bravo {truc}. ');
    await vue(page, 0, 'texte').evaluate((el) => el.blur());
    await expect(page.locator('#listeCriteres .palier-jetons-inconnus')).toHaveCount(1);
    await expect(vue(page, 0, 'texte')).toContainText('Bravo {truc}.');
    await expect(vue(page, 0, 'texte').locator('.composeur-chip')).toHaveCount(0);
});
