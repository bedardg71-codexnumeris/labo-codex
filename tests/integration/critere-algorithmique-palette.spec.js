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
// ↻ LES RETOUCHES DE LA RELECTURE (22 oct., 21 h 51) :
//   · Mac : un bloc inactif se réduit à son nom (ni aide ni précision visibles, une ligne, la mention dans son
//     `title`) ; (↻ #1147 : la liste des grilles, devenue un menu, ne colle plus) ;
//   · iPad, portrait ET paysage (le gabarit y a 649 et 675 px, sous le seuil de 754) : la palette est compacte,
//     en tête du gabarit sans zone visitée, puis JUSTE AU-DESSUS de la zone touchée, qu'elle suit ; elle n'y montre
//     que les blocs offerts ; la zone touchée ne bouge pas à l'écran quand la palette arrive au-dessus d'elle ;
//   · captures `-retouches` (CAPTURES_RETOUCHES=<dossier>).
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
    // ↻ #1150 (24 oct. 2026) : plus de cartes à déplier — les étapes de l'atelier s'ouvrent une à une, celle d'une
    // zone s'ouvre avant qu'on la vise (`etapeDe`, plus bas).
    await expect(page.locator('#listeCriteres .atelier-algo-etape[data-etape="eleve"]')).toHaveAttribute('data-ouverte', '');
    return erreurs;
}

const palette = (page) => page.locator('#listeCriteres .palette-algo');
const bloc = (page, jeton) => palette(page).locator(`.palette-algo-bloc[data-jeton="${jeton}"]`);
const zonePalier = (page, i, champ) => page.locator(`#listeCriteres textarea[data-palier-index="${i}"][data-champ="${champ}"]`);
const zoneEnonce = (page, cle) => page.locator(`#listeCriteres textarea[data-enonce-cle="${cle}"]`);
const vueDe = (zone) => zone.locator('xpath=following-sibling::*[1]');
/** ↻ #1150 : ouvre, par son en-tête (le geste), l'étape de l'atelier qui porte cet élément, si elle est fermée. */
const etapeDe = async (loc) => {
    const ouverte = await loc.evaluate((el) => { const s = el.closest('.atelier-algo-etape'); return !s || s.hasAttribute('data-ouverte'); });
    if (!ouverte) await loc.evaluate((el) => el.closest('.atelier-algo-etape').querySelector('.atelier-algo-etape-tete').click());
};
const caretA = async (vue, position) => { await etapeDe(vue); await vue.evaluate((el, p) => { el.focus(); window.composeurBadges.placerCaret(el, p); }, position); };
/** La zone garde-t-elle le focus, et où est son caret (positions de texte) ? */
const etat = (zone) => zone.evaluate((t) => {
    const vue = window.composeurBadges.vueDe(t);
    const c = vue ? window.composeurBadges.curseur(vue) : null;
    return { valeur: t.value, focalisee: !!vue && document.activeElement === vue, curseur: c ? c.debut : null };
});
/** La boîte d'un élément, et s'il est dans la fenêtre. */
const boite = (loc) => loc.evaluate((el) => { const r = el.getBoundingClientRect(); return { haut: r.top, bas: r.bottom, gauche: r.left, droite: r.right, hauteur: r.height, dansLaFenetre: r.bottom > 0 && r.top < window.innerHeight }; });
/** Ce qu'un bloc montre à l'œil : son aide, sa précision, sa mention (plus d'1 px de côté = visible), et s'il tient sur une ligne. */
const reduitASonNom = (loc) => loc.evaluate((b) => {
    const vu = (sel) => { const s = b.querySelector(sel); if (!s) return false; const r = s.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
    const nom = b.querySelector('.palette-algo-bloc-nom');
    const ligne = parseFloat(getComputedStyle(nom).lineHeight);
    return { aide: vu('.palette-algo-bloc-aide'), precision: vu('.palette-algo-bloc-precision'), mention: vu('.palette-algo-bloc-inactif'),
             uneLigne: nom.getBoundingClientRect().height <= ligne + 1 && b.getBoundingClientRect().height <= 44.5 };
});
/** Les jetons des blocs qu'on VOIT dans la palette. */
const blocsVus = (page) => palette(page).locator('.palette-algo-bloc').evaluateAll((els) => els.filter((b) => b.getClientRects().length).map((b) => b.dataset.jeton));
/** La palette est-elle juste au-dessus de cette zone : de la rangée de ses deux zones (palier), de son champ (énoncé) ? */
const justeAuDessus = (zone) => zone.evaluate((z) => {
    const ancre = z.closest('.table-cas-rangee') || z.closest('.groupe-form');   // ↻ lot 3a : la rangée du palier
    return !!ancre && !!ancre.previousElementSibling && ancre.previousElementSibling.matches('.palette-algo');
});

// ↻ #1147 (24 oct. 2026) : sans la barre latérale, le gabarit prend toute la largeur. ↻ #1150 (24 oct. 2026) :
// « Ce que l'élève lira » prend la colonne de droite (340 px dès 1 180 px) ; le centre de l'atelier (palette et
// étapes) mesure 619 px en iPad paysage, sous le seuil compact (754) : la palette y est compacte, comme en
// portrait (consigne § 3.5, maquette). Sur le côté, au Mac seulement.
for (const [nomEcran, largeurEcran, hauteurEcran] of [['Mac', 1440, 900]]) {
test(`${nomEcran} · la palette, à gauche et collante, pose un bloc dans un palier loin sous elle et dans un énoncé, au curseur, sans perdre le focus`, async ({ page }) => {
    await page.setViewportSize({ width: largeurEcran, height: hauteurEcran });
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
    await etapeDe(v);
    await v.scrollIntoViewIfNeeded();
    const texteDHier = await verdict.inputValue();
    await caretA(v, texteDHier.length);
    await expect(palette(page).locator('.palette-algo-cible')).toHaveText('Zone choisie : Verdict, palier Échec');   // ↻ lot 3a : les mots de l'ébauche, le palier par son nom court
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
    await expect(v.locator('.composeur-chip')).toHaveText(/Compte projeté/);   // ↻ lot 3a : le bloc sans « erreurs »

    // 2 — un énoncé, « Défi prioritaire » (carte « Bilan »), après une frappe : le bloc {critere}.
    const priorite = zoneEnonce(page, 'priorite');
    const vp = vueDe(priorite);
    await etapeDe(vp);
    await vp.scrollIntoViewIfNeeded();
    await caretA(vp, (await priorite.inputValue()).length);
    await page.keyboard.type(' (dès maintenant)');
    await expect(palette(page).locator('.palette-algo-cible')).toHaveText('Zone choisie : Défi prioritaire');
    await expect(bloc(page, '{erreurs}')).toHaveAttribute('aria-disabled', 'true');
    // Retouche 2 : un bloc inactif n'est plus que son nom, sur une ligne ; sa mention est dans son `title`.
    await expect(bloc(page, '{erreurs}')).toHaveAttribute('title', 'Ce texte ne le remplit pas.');
    expect(await reduitASonNom(bloc(page, '{erreurs}')), 'inactif : son nom seul, sur une ligne').toEqual({ aide: false, precision: false, mention: false, uneLigne: true });
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
}

// ↻ #1147 (24 oct. 2026) : « la liste des grilles colle sous la barre de navigation » est RETIRÉ — la liste n'est
// plus une barre latérale collante, c'est un menu au-dessus de la fiche (bibliotheques-menu-1147.spec.js le mesure).

// Le gabarit mesure 649 px en portrait (WebKit, 22 oct.) : sous le seuil. ↻ #1150 : le centre de l'atelier mesure
// 333 px en portrait et 619 px en paysage (l'aperçu prend sa colonne) — sous le seuil aux deux.
for (const [sens, largeur, hauteur] of [['portrait', 820, 1180], ['paysage', 1180, 820]]) {
    test.describe(`iPad ${sens}`, () => {
        test.use({ hasTouch: true, viewport: { width: largeur, height: hauteur } });

        test(`iPad ${sens} · la palette compacte va juste au-dessus de la zone touchée et la suit, n'y montre que ses blocs (44 px), la zone ne saute pas, un bloc s'y pose au curseur`, async ({ page }) => {
            const erreurs = await ouvrir(page, 'GR');
            // Sans zone visitée : en tête du gabarit, avec l'invitation.
            const p0 = await boite(palette(page));
            const corps = await boite(page.locator('#listeCriteres .gabarit-algo-corps'));
            expect(p0.bas, 'en tête du gabarit').toBeLessThanOrEqual(corps.haut);
            await expect(palette(page).locator('.palette-algo-cible')).toHaveText('Aucune zone choisie.');
            const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            expect(debord, 'aucun défilement de côté').toBeLessThanOrEqual(0);

            /**
             * Toucher une zone (au clic : voir la note plus bas) ; rend son déplacement à l'écran.
             * #1143 (23 oct. 2026) — LE CLIC SE DONNE AUX COORDONNÉES MESURÉES, pas par `locator.click`. Mesuré sur
             * vingt passages instrumentés : quand le contrôle de stabilité de Playwright tarde, Playwright fait
             * défiler la zone tout en haut de la fenêtre AVANT le `pointerdown` (+374 px, aucun code de l'application
             * n'est appelé ; le `pointerdown` arrive sur la page déjà défilée) ; la mesure « après » rendait 0, et
             * l'essai rougissait une fois sur deux sur le code de l'étape 2b seul. Le doigt ne fait pas défiler la
             * page avant de toucher : ce geste-ci non plus. Le seuil (2 px) ne bouge pas.
             */
            const toucher = async (zone) => {
                const v = vueDe(zone);
                await etapeDe(v);   // ↻ #1150 : l'étape de la zone, ouverte par son en-tête
                await v.evaluate((el) => el.scrollIntoView({ block: 'center' }));
                const b0 = await boite(v);
                const avant = b0.haut;
                await page.mouse.click(b0.gauche + 8, b0.haut + 8);
                const apres = (await boite(v)).haut;
                console.log(`IPAD ${sens.toUpperCase()} · ZONE TOUCHÉE →`, await zone.getAttribute('data-nom-zone'), 'avant', Math.round(avant), 'après', Math.round(apres));
                return apres - avant;
            };
            const offerts = (quoi) => page.evaluate((q) => (q === 'palier' ? window.projectionAlgo.listerReperes() : window.enoncesAlgo.reperesDeCle(q)).map((r) => r.jeton), quoi);
            const tousCompacts = async () => {
                const hauteurs = await palette(page).locator('.palette-algo-bloc').evaluateAll((els) => els.filter((b) => b.getClientRects().length).map((b) => b.getBoundingClientRect().height));
                expect(Math.min(...hauteurs), 'chaque bloc fait au moins 44 px').toBeGreaterThanOrEqual(44);
                for (const j of await blocsVus(page)) {
                    expect(await reduitASonNom(bloc(page, j)), `${j} : son nom seul`).toEqual({ aide: false, precision: false, mention: false, uneLigne: true });
                }
            };

            // 1 — un énoncé, « Défi prioritaire » (carte « Bilan ») : la palette passe juste au-dessus de son champ.
            const priorite = zoneEnonce(page, 'priorite');
            expect(Math.abs(await toucher(priorite)), 'la zone touchée ne saute pas').toBeLessThanOrEqual(2);
            expect(await justeAuDessus(priorite), 'la palette est juste au-dessus du champ').toBe(true);
            await expect(palette(page).locator('.palette-algo-cible')).toHaveText('Zone choisie : Défi prioritaire');
            expect(await blocsVus(page), 'seulement les blocs que la zone offre').toEqual(await offerts('priorite'));
            await tousCompacts();

            // 2 — le verdict du palier 4, plus bas : la palette le suit, au-dessus de la rangée de ses deux zones.
            const verdict = zonePalier(page, 3, 'texte');
            expect(Math.abs(await toucher(verdict)), 'la zone touchée ne saute pas').toBeLessThanOrEqual(2);
            expect(await justeAuDessus(verdict), 'la palette a suivi : juste au-dessus du palier').toBe(true);
            expect(await justeAuDessus(priorite), 'elle a quitté le champ d\'avant').toBe(false);
            await expect(palette(page)).toHaveCount(1);
            await expect(palette(page).locator('.palette-algo-cible')).toHaveText('Zone choisie : Verdict, palier Bien');
            expect([...await blocsVus(page)].sort()).toEqual([...await offerts('palier')].sort());
            await tousCompacts();

            // 3 — le décompte, PLUS HAUT que le palier : la palette remonte, la zone touchée ne saute pas non plus.
            const decompte = zoneEnonce(page, 'decompte');
            expect(Math.abs(await toucher(decompte)), 'la zone touchée ne saute pas').toBeLessThanOrEqual(2);
            expect(await justeAuDessus(decompte)).toBe(true);

            // 4 — de retour au verdict du palier 4, un bloc posé au curseur, sans perdre le focus.
            await toucher(verdict);
            const v = vueDe(verdict);
            const texteDHier = await verdict.inputValue();
            await caretA(v, texteDHier.length);
            // ⚠ MESURÉ (22 oct.) : sous le WebKit de Playwright, avec `hasTouch`, un `pointerdown` annulé fait
            // tomber le clic qu'un toucher émulé aurait produit (un bouton témoin sans annulation le reçoit). C'est
            // le mécanisme du 3 sept., que la consigne garde, et que Grégoire emploie au doigt sur son iPad depuis.
            // Ce spec éprouve donc la pose par le clic, à la largeur et à la mise en page de l'iPad ; le toucher
            // réel reste le geste à vérifier à l'écran.
            await bloc(page, '{palier}').click();
            const e = await etat(verdict);
            console.log(`IPAD ${sens.toUpperCase()} · APRÈS LE BLOC →`, JSON.stringify(e));
            expect(e.valeur).toBe(texteDHier + ' {palier}');
            expect(e.focalisee, 'le curseur reste dans la zone').toBe(true);
            expect(e.curseur).toBe(e.valeur.length);
            expect(await justeAuDessus(verdict), 'la pose ne déplace pas la palette').toBe(true);

            // 5 — la fenêtre s'élargit au-dessus du seuil : la palette retourne sur le côté (`replacerPalettesAlgo`).
            await page.setViewportSize({ width: 1440, height: 900 });
            await expect.poll(() => palette(page).evaluate((p) => p.parentElement.classList.contains('gabarit-algo-atelier') && !p.previousElementSibling),
                'revenue à sa place, sur le côté').toBe(true);
            expect(erreurs).toEqual([]);
        });
    });
}

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

test('captures `-retouches` · la palette compacte au-dessus d\'un énoncé puis d\'un palier (iPad), les blocs inactifs réduits et la liste des grilles sous la barre (Mac)', async ({ page, browserName }) => {
    test.skip(!process.env.CAPTURES_RETOUCHES, 'captures : CAPTURES_RETOUCHES=<dossier>');
    const dossier = process.env.CAPTURES_RETOUCHES;
    const moteur = process.env.CAPTURES_MOTEUR || browserName;
    const shot = (nom) => page.screenshot({ path: path.join(dossier, `${nom}-${moteur}-retouches.png`) });
    /** Le curseur dans une zone, la zone au milieu de la fenêtre. */
    const viser = async (zone) => {
        const v = vueDe(zone);
        await v.evaluate((el) => el.scrollIntoView({ block: 'center' }));
        await caretA(v, (await zone.inputValue()).length);
        await v.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    };
    for (const [largeur, hauteur] of [[820, 1180], [1180, 820]]) {
        await page.setViewportSize({ width: largeur, height: hauteur });
        await ouvrir(page, 'GR');
        await viser(zoneEnonce(page, 'priorite'));
        await shot(`redaction-${largeur}-1-enonce`);
        await viser(zonePalier(page, 1, 'texte'));
        await shot(`redaction-${largeur}-2-palier`);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await ouvrir(page, 'GR');
    await viser(zonePalier(page, 1, 'texte'));
    await palette(page).evaluate((el) => el.closest('.gabarit-algo').scrollIntoView({ block: 'start' }));
    await shot('redaction-1440-1-palier-inactifs');
    await page.evaluate(() => window.scrollTo(0, 1500));
    await shot('redaction-1440-2-defilee');
});
