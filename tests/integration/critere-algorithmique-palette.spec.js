import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LE CRITÈRE ALGORITHMIQUE, ÉTAPE 2b (22 oct. 2026) : LA PALETTE, dans un vrai WebKit, contre le vrai index.html.
//   · à la largeur du Mac : la palette est à gauche du gabarit et COLLANTE — la zone d'un palier, loin sous
//     elle, reçoit le bloc touché à la souris, au curseur, et garde le focus ; même chose pour un énoncé ;
//   · à la largeur d'un iPad en portrait (820 px, pointeur tactile) : la palette est où la règle la met (sur le
//     côté si le gabarit a 754 px, au-dessus sinon), chaque bloc a 44 px ; un bloc cliqué loin de la zone s'y
//     pose, au curseur, et le curseur reste (le toucher émulé : voir la note dans l'essai) ;
//   · captures (CAPTURES_PALETTE=<dossier>) : une rédaction avec projection, une chimie sans projection, aux
//     deux largeurs. Le même spec, lancé dans Chrome, donne les captures de Chrome.
// ⛔ Aucun `waitForTimeout`. Le seul geste de pointeur éprouvé est le bloc (souris, puis doigt) ; le caret se
// pose par le composeur lui-même (`placerCaret`), comme les specs du texte troué.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    db.setSync('backupNePlusRappeler', 'true');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set(cle('grillesTemplates'), [
        { id: 'GR', nom: 'Rédaction fictive', dansBibliotheque: true, criteres: [
            { id: 'CR', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, nomsAttendus: true,
              noms: { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } },
              modeleProjection: 'norme_externe', paramsProjection: { nomServiceAide: 'Centre d’aide', motsReference: 900, erreursTolerees: 30 } } ] },
        { id: 'GC', nom: 'Chimie fictive', dansBibliotheque: true, criteres: [
            { id: 'CC', nom: 'Unités et chiffres significatifs', type: 'algorithmique', ponderation: 20, nomsAttendus: true,
              noms: { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } },
              modeleProjection: 'aucune' } ] }
    ]);
    window.afficherSection('conception');
    window.afficherSousSection('conception-grille-criteres');
}`;

async function ouvrir(page, grilleId) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.paletteAlgo, null, { timeout: 20000 });
    await page.evaluate(eval(SEMER));
    await page.evaluate((id) => window.chargerGrillePourModif(id), grilleId);
    // Les cartes « Bilan » et « Ce que l'élève lit » sont repliées à l'ouverture : on les déplie par le dispatcher.
    for (const section of ['commentaire', 'projection']) {
        await page.evaluate((s) => document.querySelector(`#listeCriteres .gabarit-algo-carte[data-pli$=":${s}"] .accordeon-header`).click(), section);
        await expect(page.locator(`#listeCriteres .gabarit-algo-carte[data-pli$=":${section}"]`)).not.toHaveClass(/ferme/);
    }
    return erreurs;
}

const palette = (page) => page.locator('#listeCriteres .palette-algo');
const bloc = (page, jeton) => palette(page).locator(`.palette-algo-bloc[data-jeton="${jeton}"]`);
const zonePalier = (page, i, champ) => page.locator(`#listeCriteres textarea[data-palier-index="${i}"][data-champ="${champ}"]`);
const zoneEnonce = (page, cle) => page.locator(`#listeCriteres textarea[data-enonce-cle="${cle}"]`);
const vueDe = (zone) => zone.locator('xpath=following-sibling::*[1]');
const caretA = (vue, position) => vue.evaluate((el, p) => { el.focus(); window.composeurBadges.placerCaret(el, p); }, position);
/** La zone garde-t-elle le focus, et où est son caret (positions de texte) ? */
const etat = (zone) => zone.evaluate((t) => {
    const vue = window.composeurBadges.vueDe(t);
    const c = vue ? window.composeurBadges.curseur(vue) : null;
    return { valeur: t.value, focalisee: !!vue && document.activeElement === vue, curseur: c ? c.debut : null };
});
/** La boîte d'un élément, et s'il est dans la fenêtre. */
const boite = (loc) => loc.evaluate((el) => { const r = el.getBoundingClientRect(); return { haut: r.top, bas: r.bottom, gauche: r.left, droite: r.right, hauteur: r.height, dansLaFenetre: r.bottom > 0 && r.top < window.innerHeight }; });

test('Mac · la palette, à gauche et collante, pose un bloc dans un palier loin sous elle et dans un énoncé, au curseur, sans perdre le focus', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const erreurs = await ouvrir(page, 'GR');
    await expect(palette(page)).toHaveCount(1);
    await expect(page.locator('#listeCriteres .reperes-enonce, #listeCriteres .reperes-palier')).toHaveCount(0);
    const p = await boite(palette(page));
    const corps = await boite(page.locator('#listeCriteres .gabarit-algo-corps'));
    console.log('MAC · PALETTE →', JSON.stringify(p), 'CORPS →', JSON.stringify(corps));
    expect(p.droite, 'la palette est sur le côté, à gauche du gabarit').toBeLessThanOrEqual(corps.gauche);

    // 1 — un palier loin sous la palette : le verdict du palier 6, mis en vue.
    const verdict = zonePalier(page, 5, 'texte');
    const v = vueDe(verdict);
    await v.scrollIntoViewIfNeeded();
    const texteDHier = await verdict.inputValue();
    await caretA(v, texteDHier.length);
    await expect(palette(page).locator('.palette-algo-cible')).toHaveText('Dans : « Verdict, palier 6 »');
    const zoneB = await boite(v);
    const paletteB = await boite(palette(page));
    console.log('MAC · ZONE →', JSON.stringify(zoneB), 'PALETTE →', JSON.stringify(paletteB));
    // Loin : sans la colonne collante, la palette serait hors de la fenêtre (le palier est à plus d'un écran du haut du gabarit).
    const ecart = await page.evaluate(() => {
        const g = document.querySelector('#listeCriteres .gabarit-algo').getBoundingClientRect();
        const z = document.querySelector('#listeCriteres textarea[data-palier-index="5"][data-champ="texte"]').nextElementSibling.getBoundingClientRect();
        return z.top - g.top;
    });
    expect(ecart, 'la zone est à plus d\'un écran du haut du gabarit').toBeGreaterThan(900);
    expect(paletteB.dansLaFenetre, 'la palette collante reste dans la fenêtre').toBe(true);
    await bloc(page, '{projection}').click();   // LE geste de souris
    let e = await etat(verdict);
    console.log('MAC · APRÈS LE BLOC →', JSON.stringify(e));
    expect(e.valeur).toBe(texteDHier + ' {projection}');
    expect(e.focalisee, 'la zone garde le focus').toBe(true);
    expect(e.curseur, 'le curseur est après le bloc').toBe(e.valeur.length);
    await expect(v.locator('.composeur-chip')).toHaveText(/Erreurs projetées/);

    // 2 — un énoncé, « Défi prioritaire » (carte « Bilan »), après une frappe : le bloc {critere}.
    const priorite = zoneEnonce(page, 'priorite');
    const vp = vueDe(priorite);
    await vp.scrollIntoViewIfNeeded();
    await caretA(vp, (await priorite.inputValue()).length);
    await page.keyboard.type(' (dès maintenant)');
    await expect(palette(page).locator('.palette-algo-cible')).toHaveText('Dans : « Défi prioritaire »');
    await expect(bloc(page, '{erreurs}')).toHaveAttribute('aria-disabled', 'true');
    await expect(bloc(page, '{erreurs}').locator('.palette-algo-bloc-inactif')).toBeVisible();
    await bloc(page, '{critere}').click();
    e = await etat(priorite);
    expect(e.valeur).toBe('{critere} est à travailler en priorité (dès maintenant) {critere}');
    expect(e.focalisee).toBe(true);
    expect(e.curseur).toBe(e.valeur.length);
    // Écrit dans la grille, sans attendre la sortie de la zone (mode édition).
    await expect.poll(() => page.evaluate(async () => (((await db.get(cle('grillesTemplates'))) || []).find((g) => g.id === 'GR').criteres[0].enonces || {}).priorite))
        .toBe('{critere} est à travailler en priorité (dès maintenant) {critere}');
    expect(erreurs).toEqual([]);
});

test.describe('iPad portrait', () => {
    test.use({ hasTouch: true, viewport: { width: 820, height: 1180 } });

    test('iPad · la palette est où la règle la met, ses blocs ont 44 px, et un bloc loin de la zone s\'y pose au curseur', async ({ page }) => {
        const erreurs = await ouvrir(page, 'GR');
        const largeur = await page.locator('#listeCriteres .gabarit-algo').evaluate((el) => el.getBoundingClientRect().width);
        const p = await boite(palette(page));
        const corps = await boite(page.locator('#listeCriteres .gabarit-algo-corps'));
        console.log('IPAD · GABARIT →', Math.round(largeur), 'PALETTE →', JSON.stringify(p), 'CORPS →', JSON.stringify(corps));
        if (largeur >= 754) expect(p.droite, 'sur le côté').toBeLessThanOrEqual(corps.gauche);
        else expect(p.bas, 'au-dessus du gabarit').toBeLessThanOrEqual(corps.haut);
        const hauteurs = await palette(page).locator('.palette-algo-bloc').evaluateAll((els) => els.map((b) => b.getBoundingClientRect().height));
        expect(Math.min(...hauteurs), 'chaque bloc fait au moins 44 px').toBeGreaterThanOrEqual(44);
        const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(debord, 'aucun défilement de côté').toBeLessThanOrEqual(0);

        // Le verdict du palier 4 au curseur, puis le bloc {palier} TOUCHÉ (au doigt), la palette loin de la zone.
        const verdict = zonePalier(page, 3, 'texte');
        const v = vueDe(verdict);
        await v.scrollIntoViewIfNeeded();
        const texteDHier = await verdict.inputValue();
        await caretA(v, texteDHier.length);
        // ⚠ MESURÉ (22 oct.) : sous le WebKit de Playwright, avec `hasTouch`, un `pointerdown` annulé fait
        // tomber le clic qu'un toucher émulé aurait produit (un bouton témoin sans annulation le reçoit). C'est
        // le mécanisme du 3 sept., que la consigne garde, et que Grégoire emploie au doigt sur son iPad depuis.
        // Ce spec éprouve donc la pose par le clic, à la largeur et à la mise en page de l'iPad ; le toucher
        // réel reste le geste à vérifier à l'écran.
        await bloc(page, '{palier}').click();
        const e = await etat(verdict);
        console.log('IPAD · APRÈS LE BLOC →', JSON.stringify(e));
        expect(e.valeur).toBe(texteDHier + ' {palier}');
        expect(e.focalisee, 'le curseur reste dans la zone').toBe(true);
        expect(e.curseur).toBe(e.valeur.length);
        expect(erreurs).toEqual([]);
    });
});

test('captures · une rédaction avec projection, une chimie sans projection, à la largeur du Mac et de l\'iPad portrait', async ({ page, browserName }) => {
    test.skip(!process.env.CAPTURES_PALETTE, 'captures : CAPTURES_PALETTE=<dossier>');
    const dossier = process.env.CAPTURES_PALETTE;
    const moteur = process.env.CAPTURES_MOTEUR || browserName;
    // Des captures de la FENÊTRE, pas du gabarit entier : une capture d'élément plus haut que l'écran se
    // recoud par tranches et perd la palette collante. Deux par cas : la palette en tête, puis la zone visée.
    const deux = async (nom, zone) => {
        await caretA(vueDe(zone), 0);
        await palette(page).evaluate((el) => el.closest('.gabarit-algo').scrollIntoView({ block: 'start' }));
        await page.screenshot({ path: path.join(dossier, `${nom}-1-palette-${moteur}.png`) });
        await vueDe(zone).evaluate((el) => el.scrollIntoView({ block: 'center' }));
        await page.screenshot({ path: path.join(dossier, `${nom}-2-zone-${moteur}.png`) });
    };
    for (const [largeur, hauteur] of [[1440, 900], [820, 1180]]) {
        await page.setViewportSize({ width: largeur, height: hauteur });
        // La rédaction : le curseur dans le verdict du palier 2 — la palette dit sa cible, les blocs inactifs le disent.
        await ouvrir(page, 'GR');
        await deux(`redaction-projection-${largeur}`, zonePalier(page, 1, 'texte'));
        // La chimie : le curseur dans son décompte.
        await ouvrir(page, 'GC');
        await expect(palette(page)).not.toContainText(/\berreurs?\b|\bmots?\b/i);
        await deux(`chimie-sans-projection-${largeur}`, zoneEnonce(page, 'decompte'));
    }
});
