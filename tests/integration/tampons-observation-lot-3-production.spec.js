import { test, expect } from '@playwright/test';
import { monter, ouvrirProfilCibles, ouvrirParProduction, ouvrirEnAnnoter, poserVraiment, inscriptions, annotationsRangees, dateLisible, attendre,
    annotation, pose, copie, tamponId, criteres, TAMPON_AUTRE, CAT, CIBLE_A, CIBLE_B, ENSEMBLE, P_UNE, P_DEUX, P_SANS, ZOE, YAN, LOU, JOUR_1, JOUR_2, T } from './harness/banc-tampons-production.js';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// TAMPONS D'OBSERVATION, LOT 3 : SUR UNE PRODUCTION (25 nov. 2026)
// Consigne de lot (Cowork, 25 nov., 5 h 50) ; décisions de Grégoire du 25 nov. (5 h 39, 5 h 40, 8 h 22) ; rapport :
// plans de travail/RAPPORT-2026-11-25-tampons-observation-lot-3.md.
//
// Le vrai index.html, le vrai écran Annoter, le vrai profil, le vrai tableau des cibles. Cible WebKit ; se relance sous
// Chromium par une config jetable (voir le rapport). Contexte neuf à chaque essai.
//
// RIEN EN DUR : le groupe, les cibles, les productions, les catégories et leurs tampons sont créés par le harnais,
// fictifs. BREAK-TESTS : journal au rapport.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const CRITERES = criteres();
const carteProductions = (page) => page.locator('.pc-productions');
const rangProduction = (page, p) => page.locator(`.pc-production[data-production="${p.id}"]`);
const cible = (page, n) => page.locator('.pc-cible').nth(n);   // 0 : la cible A (trois critères) ; 1 : la cible B
const bloc = (page, cibleId) => page.locator(`.tc-fenetre .tc-bloc-cible[data-cible="${cibleId}"]`);
const tamponDuBloc = (page, cibleId, n) => bloc(page, cibleId).locator(`.oc-tampon[data-tampon="${tamponId(n)}"]`);
const choisirNiveau = (page, cibleId, code) => bloc(page, cibleId).locator(`.tc-niveau input[value="${code}"]`).check({ force: true });
const inscrire = async (page) => { await page.locator('.tc-fenetre [data-tc="inscrire-production"]').click(); await attendre(page, 300); };
const DEUX_POSES_UNE = () => [annotation(ZOE, P_UNE, { 0: [pose(tamponId(1), JOUR_1), pose(tamponId(2), JOUR_1 + 4000)] })];

test.describe('Tampons d’observation, lot 3 — poser sur une production : la trace existe, sans second geste', () => {
    test('un tampon posé pour de vrai paraît au profil sous sa production, à sa date, sans autre geste ; poser n’écrit aucune inscription ; retiré de la production, il disparaît du profil', async ({ page }) => {
        test.setTimeout(90000);
        const suivi = await monter(page);
        await ouvrirEnAnnoter(page, ZOE, P_DEUX);
        const avant = Date.now();
        await poserVraiment(page, tamponId(2));
        await expect.poll(async () => (await annotationsRangees(page)).flatMap((a) => Object.values(a.pages || {})).flatMap((p) => p.stickers || []).map((s) => s.autocollantId),
            { message: 'la pose s’enregistre d’elle-même', timeout: 8000 }).toEqual([tamponId(2)]);
        expect(await inscriptions(page), 'poser un tampon n’écrit aucune inscription').toEqual([]);

        await ouvrirProfilCibles(page, ZOE);
        const rang = rangProduction(page, P_DEUX);
        await expect(rang.locator('.pc-cible-titre')).toHaveText('Production : ' + P_DEUX.titre);
        await expect(rang.locator('.tc-entree')).toHaveCount(1);
        await expect(rang.locator('.tc-entree-date')).toHaveText(await dateLisible(page, avant));
        await expect(rang.locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 2']);
        await expect(rang.locator('.tc-tampon img')).toHaveCount(1);
        await expect(carteProductions(page).locator('.pc-production'), 'une seule production porte une trace').toHaveCount(1);
        expect(await inscriptions(page), 'lire le profil n’écrit aucune inscription').toEqual([]);

        // Retirer le tampon de la production (« Effacer la page », le vrai geste, et sa confirmation) : il disparaît
        // du profil, sans trace fantôme.
        await ouvrirEnAnnoter(page, ZOE, P_DEUX);
        await page.evaluate(() => { window.travauxAnnotation.effacerPage(); });
        await page.locator('#overlay-ui-dialogue button', { hasText: 'Effacer' }).click();
        await expect.poll(async () => (await annotationsRangees(page)).flatMap((a) => Object.values(a.pages || {})).flatMap((p) => p.stickers || []).length,
            { message: 'le retrait s’enregistre de lui-même', timeout: 8000 }).toBe(0);
        await ouvrirProfilCibles(page, ZOE);
        await expect(carteProductions(page)).toHaveCount(0);
        await expect(page.locator('.pc-panneau .tc-tampon')).toHaveCount(0);
        expect(await inscriptions(page)).toEqual([]);
        expect(suivi.erreurs).toEqual([]);
    });

    test('une production à une seule cible : la trace paraît aussi sous cette cible, d’elle-même, à côté du critère que le tampon déclare, sans niveau ni coche', async ({ page }) => {
        await monter(page, { annotations: DEUX_POSES_UNE() });
        await ouvrirProfilCibles(page, ZOE);
        await expect(rangProduction(page, P_UNE).locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 1', 'Tampon fictif 2']);
        const entree = cible(page, 0).locator('.tc-entree');
        await expect(entree).toHaveCount(1);
        await expect(entree).toHaveClass(/tc-entree--directe/);
        await expect(entree.locator('.tc-entree-date')).toHaveText(await dateLisible(page, JOUR_1));
        await expect(entree.locator('.tc-entree-origine')).toHaveText('Production : ' + P_UNE.titre);
        await expect(entree.locator('.tc-entree-directe')).toHaveText('pas encore inscrite');
        await expect(entree.locator('.tc-entree-niveau'), 'un tampon ne pose pas de niveau').toHaveCount(0);
        expect(await entree.innerText()).not.toMatch(/remarque|sans niveau/i);
        // Le tampon 1 déclare le premier critère de la cible : à côté de lui, qui reste non renseigné ; le 2, sous la cible.
        const lignes = entree.locator('.tc-entree-critere');
        await expect(lignes).toHaveCount(1);
        await expect(lignes.first()).toHaveClass(/tc-entree-critere--vide/);
        await expect(lignes.first().locator('.tc-tampon-nom')).toHaveText('Tampon fictif 1');
        await expect(entree.locator('.tc-tampons--cible .tc-tampon-nom')).toHaveText('Tampon fictif 2');
        await expect(page.locator('.pc-panneau [data-tc="annuler"]'), 'lecture seule').toHaveCount(0);
        await expect(cible(page, 1).locator('.tc-entree'), 'la cible B n’est visée par aucune production à cible unique').toHaveCount(0);
        // Le niveau retenu et la note ne lisent pas la trace.
        await expect(cible(page, 0).locator('.tc-retenu')).toHaveClass(/tc-retenu--sans-donnee/);
        expect(await inscriptions(page)).toEqual([]);
    });

    test('une production à deux cibles, ou sans cible : la trace reste sous la production, sous aucune cible', async ({ page }) => {
        await monter(page, { annotations: [annotation(ZOE, P_DEUX, { 0: [pose(tamponId(1), JOUR_1)] }), annotation(ZOE, P_SANS, { 0: [pose(tamponId(3), JOUR_2)] })] });
        await ouvrirProfilCibles(page, ZOE);
        await expect(carteProductions(page).locator('.pc-production .pc-cible-titre'), 'la plus récente d’abord').toHaveText(['Production : ' + P_SANS.titre, 'Production : ' + P_DEUX.titre]);
        await expect(rangProduction(page, P_DEUX).locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 1']);
        await expect(rangProduction(page, P_SANS).locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 3']);
        await expect(page.locator('.pc-cible .tc-entree')).toHaveCount(0);
        await expect(page.locator('.pc-cible .tc-tampon')).toHaveCount(0);
    });

    test('un tampon d’une catégorie non cochée ne paraît nulle part au profil ; décocher la catégorie retire les traces lues, recocher les ramène', async ({ page }) => {
        await monter(page, { annotations: [annotation(ZOE, P_UNE, { 0: [pose(TAMPON_AUTRE, JOUR_1), pose(tamponId(2), JOUR_1 + 1000)] })] });
        await ouvrirProfilCibles(page, ZOE);
        await expect(page.locator('.pc-panneau .tc-tampon-nom')).toHaveText(['Tampon fictif 2', 'Tampon fictif 2']);   // sous la cible, puis sous la production
        expect(await page.locator('.pc-panneau').innerText()).not.toMatch(/hors observation/);
        await page.evaluate(() => window.db.setSync('categoriesObservation', null));
        await ouvrirProfilCibles(page, YAN); await ouvrirProfilCibles(page, ZOE);
        await expect(page.locator('.pc-panneau .tc-tampon')).toHaveCount(0);
        await expect(carteProductions(page)).toHaveCount(0);
        await page.evaluate((c) => window.db.setSync('categoriesObservation', [c]), CAT);
        await ouvrirProfilCibles(page, YAN); await ouvrirProfilCibles(page, ZOE);
        await expect(carteProductions(page).locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 2']);
    });

    test('le nom est lu au présent : un tampon renommé change sur la trace lue ; supprimé, il n’y est plus', async ({ page }) => {
        await monter(page, { annotations: DEUX_POSES_UNE() });
        await page.evaluate((id) => {
            const pers = window.db.getSync('personnalisationObservations', {}); pers[id].nom = 'Tampon rebaptisé';
            window.db.setSync('personnalisationObservations', pers);
            window.db.setSync('tamponsPersonnalises', window.db.getSync('tamponsPersonnalises', []).map((t) => (t.id === id ? Object.assign({}, t, { nom: 'Tampon rebaptisé' }) : t)));
            window.travauxOutils.rechargerTamponsPersonnalises();
        }, tamponId(2));
        await ouvrirProfilCibles(page, ZOE);
        await expect(rangProduction(page, P_UNE).locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 1', 'Tampon rebaptisé']);
        await page.evaluate((id) => {
            window.db.setSync('tamponsPersonnalises', window.db.getSync('tamponsPersonnalises', []).filter((t) => t.id !== id));
            window.travauxOutils.rechargerTamponsPersonnalises();
        }, tamponId(2));
        await ouvrirProfilCibles(page, YAN); await ouvrirProfilCibles(page, ZOE);
        await expect(rangProduction(page, P_UNE).locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 1']);
    });

    test('plusieurs pages, une production sans page annotée, une ligne de tableau sans fichier', async ({ page }) => {
        const suivi = await monter(page, { annotations: [
            annotation(ZOE, P_UNE, { 0: [], 2: [pose(tamponId(3), JOUR_2)] }),   // le tampon est à la troisième page
            annotation(ZOE, P_DEUX, {}),                                           // ouverte, jamais annotée
            annotation(YAN, P_UNE, { 0: [pose(tamponId(1), JOUR_1)] })] });
        await ouvrirProfilCibles(page, ZOE);
        await expect(carteProductions(page).locator('.pc-production')).toHaveCount(1);
        await expect(rangProduction(page, P_UNE).locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 3']);
        await expect(rangProduction(page, P_UNE).locator('.tc-entree-date')).toHaveText(await dateLisible(page, JOUR_2));
        // Lou n'a aucun fichier : aucune carte, aucune erreur ; Yan ne voit que le sien.
        await ouvrirProfilCibles(page, LOU);
        await expect(carteProductions(page)).toHaveCount(0);
        await expect(page.locator('.pc-cibles')).toHaveCount(1);
        await ouvrirProfilCibles(page, YAN);
        await expect(page.locator('.pc-panneau .tc-tampon-nom')).toHaveText(['Tampon fictif 1', 'Tampon fictif 1']);
        expect(suivi.erreurs).toEqual([]);
    });

    test('le nom d’un tampon et le titre d’une production sont du texte, au profil et dans « Inscrire pour une production »', async ({ page }) => {
        const mechant = '<img src=x onerror="window.__pr3=1"><b>gras</b>';
        const suivi = await monter(page, { annotations: DEUX_POSES_UNE(), nomTampon1: mechant });
        await ouvrirProfilCibles(page, ZOE);
        await expect(rangProduction(page, P_UNE).locator('.tc-tampon-nom').first()).toHaveText(mechant);
        await expect(page.locator('.pc-panneau b')).toHaveCount(0);
        await ouvrirParProduction(page, ZOE, P_UNE);
        await expect(bloc(page, CIBLE_A).locator('.tc-pr-retenus')).toContainText(mechant);
        await expect(page.locator('.tc-fenetre b')).toHaveCount(0);
        expect(await page.evaluate(() => window.__pr3)).toBeUndefined();
        expect(await page.locator('.pc-panneau, .tc-fenetre').evaluateAll((els) => els.some((e) => e.querySelector('[onclick],[onerror],[onchange]')))).toBe(false);
        expect(suivi.erreurs).toEqual([]);
    });
});

test.describe('Tampons d’observation, lot 3 — « Inscrire pour une production »', () => {
    test('les tampons de la production se voient avant d’attribuer le niveau ; un tampon retiré n’entre pas dans l’inscription ; après, il paraît une seule fois sous la cible, par l’inscription', async ({ page }) => {
        const suivi = await monter(page, { annotations: DEUX_POSES_UNE() });
        await ouvrirParProduction(page, ZOE, P_UNE);
        const b = bloc(page, CIBLE_A);
        // Avant tout niveau (« Rien ce jour-là » est coché) : les deux tampons, pressés, leurs noms en clair.
        await expect(b.locator('.tc-niveau input[data-rien]')).toBeChecked();
        await expect(b.locator('.tc-pr-tampons .oc-tampon')).toHaveCount(2);
        await expect(b.locator('.tc-pr-tampons .oc-tampon[aria-pressed="true"]')).toHaveCount(2);
        await expect(b.locator('.tc-pr-tampons .tc-champ-nom')).toHaveText('Tampons d’observation posés sur cette production');
        // 25 nov., midi : l'étiquette reste SEULE sur sa ligne (ni deux-points ni noms) ; les noms retenus ont la leur,
        // entre les tampons et la phrase d'aide. La seconde phrase ne paraît jamais dans une fenêtre à un seul bloc.
        await expect(b.locator('.tc-pr-tampons .oc-tampons-tete')).toHaveText('Tampons d’observation posés sur cette production');
        expect(await ordreDuBloc(page, CIBLE_A)).toEqual(['oc-tampons-tete', 'oc-tampons', 'tc-pr-retenus', 'tc-aide']);
        await expect(b.locator('[data-tc-aide-critere]')).toHaveCount(0);
        await expect(b.locator('.tc-pr-retenus')).toHaveText('Retenus pour cette cible : Tampon fictif 1, Tampon fictif 2');
        const taille = await tamponDuBloc(page, CIBLE_A, 2).boundingBox();
        expect(Math.min(taille.width, taille.height), 'une cible de 44 px au moins').toBeGreaterThanOrEqual(44);
        // Retirer le second : relâché, annoncé, et rien n'est écrit sur la production.
        await tamponDuBloc(page, CIBLE_A, 2).click();
        await expect(tamponDuBloc(page, CIBLE_A, 2)).toHaveAttribute('aria-pressed', 'false');
        await expect(b.locator('.tc-pr-retenus')).toHaveText('Retenus pour cette cible : Tampon fictif 1');
        await expect(page.locator('.tc-fenetre .tc-pr-annonce')).toHaveText('« Tampon fictif 2 » retiré de l’inscription de « Cible fictive A ». Il reste sur la production.');
        await choisirNiveau(page, CIBLE_A, '2');
        await inscrire(page);
        const liste = await inscriptions(page);
        expect(liste).toHaveLength(1);
        expect(liste[0]).toMatchObject({ da: ZOE.da, ensembleId: ENSEMBLE, cibleId: CIBLE_A, niveau: '2', productionId: P_UNE.id, origine: 'production' });
        expect(liste[0].tampons, 'la copie, forme du lot 2 ; le tampon retiré n’y est pas').toEqual([copie(1, CRITERES[0].texte)]);
        expect(liste[0].criteres.map((k) => k.respecte), 'aucun critère n’est coché du fait d’un tampon').toEqual([null, null, null]);
        expect(JSON.stringify(liste[0])).not.toMatch(/data:image|imageBase64/);
        expect((await annotationsRangees(page))[0].pages[0].stickers.map((s) => s.autocollantId), 'la production garde ses deux tampons').toEqual([tamponId(1), tamponId(2)]);

        await ouvrirProfilCibles(page, ZOE);
        const entrees = cible(page, 0).locator('.tc-entree');
        await expect(entrees, 'une seule fois sous la cible : par l’inscription').toHaveCount(1);
        await expect(entrees).not.toHaveClass(/tc-entree--directe/);
        await expect(entrees.locator('.tc-entree-directe')).toHaveCount(0);
        await expect(entrees.locator('.tc-entree-niveau')).toContainText('Acquis');
        await expect(entrees.locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 1']);
        // Sous la production, la lecture en direct reste : les deux tampons.
        await expect(rangProduction(page, P_UNE).locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 1', 'Tampon fictif 2']);
        expect(suivi.erreurs).toEqual([]);
    });

    test('une inscription annulée rend la lecture en direct sous la cible', async ({ page }) => {
        await monter(page, { annotations: DEUX_POSES_UNE() });
        await ouvrirParProduction(page, ZOE, P_UNE);
        await choisirNiveau(page, CIBLE_A, '1');
        await inscrire(page);
        const id = (await inscriptions(page))[0].id;
        await page.evaluate((i) => window.InscriptionsCibles.annuler(i, 'essai', { geste: 'banc' }), id);
        await ouvrirProfilCibles(page, ZOE);
        const entrees = cible(page, 0).locator('.tc-entree');
        await expect(entrees).toHaveCount(2);
        await expect(cible(page, 0).locator('.tc-entree--annulee')).toHaveCount(1);
        await expect(cible(page, 0).locator('.tc-entree--directe')).toHaveCount(1);
    });

    // ── Plusieurs cibles (décision de Grégoire, 25 nov. 2026, 8 h 22) : rien n'est retenu d'office, sauf par un critère ──
    const ordreDuBloc = (page, cibleId) => bloc(page, cibleId).locator('.tc-pr-tampons > *').evaluateAll((els) => els.map((e) => e.classList[0]));
    const presses = (page, cibleId) => bloc(page, cibleId).locator('.tc-pr-tampons .oc-tampon[aria-pressed="true"]');
    const AIDE_CRITERE = 'Un tampon qui porte un critère de cette cible est déjà retenu.';
    const AIDE_UNE = 'Ils entrent dans l’inscription de cette cible. Touche un tampon pour le retirer de l’inscription : il reste sur la production.';
    const AIDE_PLUSIEURS = 'Touche les tampons qui concernent cette cible : ils entrent dans son inscription et restent sur la production.';

    test('une seule cible : un seul bloc, tous les tampons retenus d’office, et la phrase du retrait', async ({ page }) => {
        await monter(page, { annotations: [annotation(ZOE, P_UNE, { 0: [pose(tamponId(2), JOUR_1), pose(tamponId(3), JOUR_2)] })] });
        await ouvrirParProduction(page, ZOE, P_UNE);
        await expect(page.locator('.tc-fenetre .tc-bloc-cible')).toHaveCount(1);
        await expect(presses(page, CIBLE_A)).toHaveCount(2);
        await expect(bloc(page, CIBLE_A).locator('.tc-pr-tampons .tc-aide')).toHaveText(AIDE_UNE);
        await expect(bloc(page, CIBLE_A).locator('[data-tc-aide-critere]'), 'jamais dans une fenêtre à un seul bloc').toHaveCount(0);
        await expect(bloc(page, CIBLE_A).locator('.tc-pr-retenus'), 'la ligne des noms vaut pour un bloc').toHaveText('Retenus pour cette cible : Tampon fictif 2, Tampon fictif 3');
        await choisirNiveau(page, CIBLE_A, '1');
        await inscrire(page);
        expect((await inscriptions(page)).map((i) => i.tampons.map((t) => t.id))).toEqual([[tamponId(2), tamponId(3)]]);
    });

    test('deux cibles, aucun tampon à critère : chaque bloc montre tous les tampons, aucun n’est retenu ; inscrire sans rien toucher ne copie aucun tampon sous aucune cible', async ({ page }) => {
        const suivi = await monter(page, { annotations: [annotation(ZOE, P_DEUX, { 0: [pose(tamponId(2), JOUR_1), pose(tamponId(3), JOUR_2)] })] });
        await ouvrirParProduction(page, ZOE, P_DEUX);
        await expect(page.locator('.tc-fenetre .tc-bloc-cible')).toHaveCount(2);
        for (const c of [CIBLE_A, CIBLE_B]) {
            await expect(bloc(page, c).locator('.tc-pr-tampons .oc-tampon'), 'tous visibles').toHaveCount(2);
            await expect(presses(page, c), 'aucun retenu d’office').toHaveCount(0);
            await expect(bloc(page, c).locator('.tc-pr-retenus')).toHaveText('Retenus pour cette cible : aucun');
            await expect(bloc(page, c).locator('.tc-pr-tampons .tc-aide')).toHaveText(AIDE_PLUSIEURS);
        }
        await choisirNiveau(page, CIBLE_A, '1');
        await choisirNiveau(page, CIBLE_B, '2');
        await inscrire(page);
        const liste = await inscriptions(page);
        expect(liste.map((i) => [i.cibleId, i.niveau, i.tampons])).toEqual([[CIBLE_A, '1', []], [CIBLE_B, '2', []]]);
        expect((await annotationsRangees(page))[0].pages[0].stickers.map((s) => s.autocollantId), 'la production garde ses tampons').toEqual([tamponId(2), tamponId(3)]);
        expect(suivi.erreurs).toEqual([]);
    });

    test('deux cibles, un tampon qui déclare un critère de l’une : retenu d’office sous celle-là seulement ; toucher sous une cible ne copie que sous celle-là ; un second toucher relâche', async ({ page }) => {
        await monter(page, { annotations: [annotation(ZOE, P_DEUX, { 0: [pose(tamponId(1), JOUR_1), pose(tamponId(3), JOUR_2)] })] });
        await ouvrirParProduction(page, ZOE, P_DEUX);
        // Le tampon 1 déclare le premier critère de la cible A ; la cible B n'a aucun critère.
        await expect(tamponDuBloc(page, CIBLE_A, 1)).toHaveAttribute('aria-pressed', 'true');
        await expect(tamponDuBloc(page, CIBLE_A, 3)).toHaveAttribute('aria-pressed', 'false');
        await expect(bloc(page, CIBLE_A).locator('.tc-pr-retenus')).toHaveText('Retenus pour cette cible : Tampon fictif 1');
        await expect(presses(page, CIBLE_B)).toHaveCount(0);
        await expect(bloc(page, CIBLE_B).locator('.tc-pr-retenus')).toHaveText('Retenus pour cette cible : aucun');
        // La seconde phrase : dans le bloc au tampon à critère, pas dans l'autre ; les noms entre les tampons et l'aide.
        await expect(bloc(page, CIBLE_A).locator('.tc-pr-tampons .tc-aide')).toHaveText(AIDE_PLUSIEURS + ' ' + AIDE_CRITERE);
        await expect(bloc(page, CIBLE_B).locator('.tc-pr-tampons .tc-aide')).toHaveText(AIDE_PLUSIEURS);
        for (const c of [CIBLE_A, CIBLE_B]) {
            await expect(bloc(page, c).locator('.tc-pr-tampons .oc-tampons-tete')).toHaveText('Tampons d’observation posés sur cette production');
            expect(await ordreDuBloc(page, c)).toEqual(['oc-tampons-tete', 'oc-tampons', 'tc-pr-retenus', 'tc-aide']);
        }
        if (process.env.LOT3_CAPTURES) {
            const taille = page.viewportSize();
            for (const [l, h] of [[1180, 820], [820, 1180]]) {
                await page.setViewportSize({ width: l, height: h });
                await bloc(page, CIBLE_A).locator('.tc-pr-tampons').scrollIntoViewIfNeeded();
                await page.screenshot({ path: `${process.env.LOT3_CAPTURES}/inscrire-deux-cibles-retenus-sous-les-tampons-${l}x${h}-clair.png` });
            }
            await page.setViewportSize(taille);
        }
        // Relâché ensuite, le tampon à critère n'emporte pas la phrase : elle dit l'état de départ. Puis il est retenu de nouveau.
        await tamponDuBloc(page, CIBLE_A, 1).click();
        await expect(bloc(page, CIBLE_A).locator('.tc-pr-retenus')).toHaveText('Retenus pour cette cible : aucun');
        await expect(bloc(page, CIBLE_A).locator('[data-tc-aide-critere]')).toHaveText(AIDE_CRITERE);
        await tamponDuBloc(page, CIBLE_A, 1).click();
        // Toucher le 3 sous B : retenu sous B, annoncé ; rien ne bouge sous A.
        await tamponDuBloc(page, CIBLE_B, 3).click();
        await expect(tamponDuBloc(page, CIBLE_B, 3)).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('.tc-fenetre .tc-pr-annonce')).toHaveText('« Tampon fictif 3 » retenu pour l’inscription de « Cible fictive B ».');
        await expect(bloc(page, CIBLE_B).locator('.tc-pr-retenus')).toHaveText('Retenus pour cette cible : Tampon fictif 3');
        await expect(tamponDuBloc(page, CIBLE_A, 3), 'retenir sous B ne change rien sous A').toHaveAttribute('aria-pressed', 'false');
        // Un second toucher relâche ; un troisième retient de nouveau.
        await tamponDuBloc(page, CIBLE_B, 3).click();
        await expect(tamponDuBloc(page, CIBLE_B, 3)).toHaveAttribute('aria-pressed', 'false');
        await expect(bloc(page, CIBLE_B).locator('.tc-pr-retenus')).toHaveText('Retenus pour cette cible : aucun');
        await tamponDuBloc(page, CIBLE_B, 3).click();
        await choisirNiveau(page, CIBLE_A, '1');
        await bloc(page, CIBLE_B).locator('.tc-niveau input[data-sans-niveau]').check({ force: true });
        await inscrire(page);
        const liste = await inscriptions(page);
        expect(liste.map((i) => [i.cibleId, i.niveau, i.tampons.map((t) => t.id)])).toEqual([[CIBLE_A, '1', [tamponId(1)]], [CIBLE_B, null, [tamponId(3)]]]);
        expect(liste.every((i) => i.origine === 'production' && i.productionId === P_DEUX.id)).toBe(true);
        // Le profil ne change pas : deux cibles, aucune lecture en direct sous une cible ; chaque cible lit son inscription.
        await ouvrirProfilCibles(page, ZOE);
        await expect(page.locator('.pc-cible .tc-entree--directe')).toHaveCount(0);
        await expect(cible(page, 0).locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 1']);
        await expect(cible(page, 1).locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 3']);
    });

    test('deux cibles : « Rien ce jour-là » partout n’inscrit rien ; « Aucun niveau » sans tampon retenu ni texte est refusé, sans trace vide ; un tampon touché suffit', async ({ page }) => {
        await monter(page, { annotations: [annotation(ZOE, P_DEUX, { 0: [pose(tamponId(2), JOUR_1), pose(tamponId(3), JOUR_2)] })] });
        await ouvrirParProduction(page, ZOE, P_DEUX);
        await inscrire(page);
        expect(await inscriptions(page)).toEqual([]);
        await expect(page.locator('.tc-fenetre .tc-alerte')).toBeVisible();
        await bloc(page, CIBLE_B).locator('.tc-niveau input[data-sans-niveau]').check({ force: true });
        await inscrire(page);
        expect(await inscriptions(page), 'aucune trace vide').toEqual([]);
        await expect(page.locator('.tc-fenetre .tc-alerte')).toBeVisible();
        await expect(page.locator('.tc-fenetre .tc-alerte')).toContainText('Cible fictive B');
        await expect(page.locator('.tc-fenetre'), 'la fenêtre reste ouverte').toBeVisible();
        await tamponDuBloc(page, CIBLE_B, 2).click();
        await inscrire(page);
        expect((await inscriptions(page)).map((i) => [i.cibleId, i.niveau, i.tampons.map((t) => t.id)])).toEqual([[CIBLE_B, null, [tamponId(2)]]]);
    });

    test('une production sans cible déclarée : la fenêtre offre toutes les cibles de l’ensemble, donc la règle des blocs multiples', async ({ page }) => {
        await monter(page, { annotations: [annotation(ZOE, P_SANS, { 0: [pose(tamponId(1), JOUR_1), pose(tamponId(2), JOUR_2)] })] });
        await ouvrirParProduction(page, ZOE, P_SANS);
        await expect(page.locator('.tc-fenetre .tc-bloc-cible')).toHaveCount(2);
        await expect(presses(page, CIBLE_A).evaluateAll((els) => els.map((e) => e.dataset.tampon)), 'seul le tampon à critère').resolves.toEqual([tamponId(1)]);
        await expect(presses(page, CIBLE_B)).toHaveCount(0);
        await expect(bloc(page, CIBLE_B).locator('.tc-pr-tampons .tc-aide')).toHaveText(AIDE_PLUSIEURS);
        // Changer d'étudiant·e puis revenir : la même règle est rejouée.
        await page.locator('.tc-pr-eleve').selectOption(YAN.da);
        await page.locator('.tc-pr-eleve').selectOption(ZOE.da);
        await expect(presses(page, CIBLE_A)).toHaveCount(1);
        await expect(presses(page, CIBLE_B)).toHaveCount(0);
    });

    test('changer d’étudiant·e remplace les tampons et garde ce qui est saisi ; sans tampon sur la production, le bloc est celui d’avant', async ({ page }) => {
        await monter(page, { annotations: DEUX_POSES_UNE() });
        await ouvrirParProduction(page, null, P_UNE);
        await expect(bloc(page, CIBLE_A).locator('.tc-pr-tampons'), 'sans étudiant·e : aucun tampon').toHaveCount(0);
        await choisirNiveau(page, CIBLE_A, '2');
        await bloc(page, CIBLE_A).locator('.tc-retroaction').fill('Un texte fictif');
        await page.locator('.tc-pr-eleve').selectOption(ZOE.da);
        await expect(bloc(page, CIBLE_A).locator('.tc-pr-tampons .oc-tampon')).toHaveCount(2);
        await expect(bloc(page, CIBLE_A).locator('.tc-niveau input[value="2"]')).toBeChecked();
        await expect(bloc(page, CIBLE_A).locator('.tc-retroaction')).toHaveValue('Un texte fictif');
        await page.locator('.tc-pr-eleve').selectOption(YAN.da);
        await expect(bloc(page, CIBLE_A).locator('.tc-pr-tampons')).toHaveCount(0);
        await expect(bloc(page, CIBLE_A).locator('.tc-pr-tampons-hote')).toBeHidden();
        await inscrire(page);
        const liste = await inscriptions(page);
        expect(liste.map((i) => [i.da, i.niveau, i.noteBreve, i.tampons])).toEqual([[YAN.da, '2', 'Un texte fictif', []]]);
    });
});

test.describe('Tampons d’observation, lot 3 — ce qui ne change pas', () => {
    // L'infobulle du bouton survolé pose une classe selon la place de la souris : elle ne dit rien du profil.
    const sansTrimestre = (html) => html.replace(/ tooltip-cible-active/g, '').replace(/\s+/g, ' ');

    test('hors pratique par cibles : aucune section « Cibles », et le profil est le même avec ou sans tampon d’observation posé', async ({ page }) => {
        test.setTimeout(120000);
        const profil = async (o) => {
            await monter(page, Object.assign({ pratique: 'sommative' }, o));
            await page.evaluate((da) => { window.afficherSection('suivi'); window.afficherProfilComplet(da); }, ZOE.da);
            await attendre(page, 400);
            await expect(page.locator('[data-action="changerSectionProfil"][data-param="cibles"]')).toHaveCount(0);
            const sections = await page.locator('[data-action="changerSectionProfil"]').evaluateAll((els) => els.map((e) => e.dataset.param));
            const rendus = {};
            expect(sections).toEqual(expect.arrayContaining(['productions', 'travaux']));
            for (const s of ['productions', 'travaux']) {   // les deux sections qui lisent les productions importées
                await page.locator(`[data-action="changerSectionProfil"][data-param="${s}"]`).click();
                await attendre(page, 300);
                rendus[s] = sansTrimestre(await page.locator('#contenuProfilEtudiant').innerHTML());
            }
            return rendus;
        };
        const avec = await profil({ annotations: DEUX_POSES_UNE() });
        expect(JSON.stringify(avec)).not.toMatch(/pc-productions|pc-production|tc-tampon/);
        const sans = await profil({ annotations: DEUX_POSES_UNE(), observation: false });
        for (const s of Object.keys(avec)) {
            let i = 0; while (i < avec[s].length && avec[s][i] === sans[s][i]) i++;
            expect(avec[s].slice(Math.max(0, i - 150), i + 150), `section « ${s} », autour du premier écart`).toBe(sans[s].slice(Math.max(0, i - 150), i + 150));
        }
        expect(avec).toEqual(sans);
        expect(await inscriptions(page)).toEqual([]);
    });

    test('pratique par cibles, sans catégorie d’observation : le profil et « Inscrire pour une production » n’ont rien de neuf', async ({ page }) => {
        await monter(page, { annotations: DEUX_POSES_UNE(), observation: false });
        await ouvrirProfilCibles(page, ZOE);
        await expect(page.locator('.pc-productions, .pc-production, .tc-entree--directe, .pc-panneau .tc-tampon')).toHaveCount(0);
        await expect(page.locator('.pc-panneau > .profil-carte')).toHaveCount(2);
        await ouvrirParProduction(page, ZOE, P_UNE);
        await expect(page.locator('.tc-fenetre .tc-pr-tampons, .tc-fenetre .oc-tampon')).toHaveCount(0);
        await expect(bloc(page, CIBLE_A).locator('.tc-pr-tampons-hote')).toBeHidden();
    });

    test('la rétroaction de l’étudiant·e : la même, que la catégorie soit cochée « D’observation » ou non, avant et après une inscription', async ({ page }) => {
        const lue = () => page.evaluate(([a, b]) => JSON.stringify(window.travauxOutils.observationsDesTampons({ [a]: 1, [b]: 1 })), [tamponId(1), tamponId(2)]);
        await monter(page, { annotations: DEUX_POSES_UNE(), observation: false });
        const temoin = await lue();
        expect(temoin).toMatch(/Tampon fictif 1/);
        await monter(page, { annotations: DEUX_POSES_UNE() });
        expect(await lue()).toBe(temoin);
        await ouvrirParProduction(page, ZOE, P_UNE);
        await choisirNiveau(page, CIBLE_A, '2');
        await inscrire(page);
        expect(await inscriptions(page)).toHaveLength(1);
        expect(await lue()).toBe(temoin);
        expect(await page.evaluate((T) => JSON.stringify(window.db.getSync(T + '_annotationsTravaux', [])), T), 'l’annotation n’est pas réécrite').toBe(JSON.stringify(DEUX_POSES_UNE()));
    });
});
