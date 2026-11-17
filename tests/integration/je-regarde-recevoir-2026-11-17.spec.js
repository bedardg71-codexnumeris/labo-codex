import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import JSZip from 'jszip';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import {
    ouvrirEspaceVide, ouvrirPanneau, boutonModele, bulle, carte, enDemo, attendreEtape, contourSur,
    releve, ecarts, horsDeLaDemo, DE_LA_DEMO, DE_L_APPAREIL, peuplerUnTrimestreReel, faireLaModelisation, lireBulle, REMPLIR
} from './harness/deux-temps-de-banc.js';
import { flecheVers } from './harness/fleches-de-banc.js';
import { actionDeLaListe, valeursActions } from './harness/parcours-3-de-banc.js';
import { faireLesDeuxModeles, releveDesBlobs, poserUnBlobReel } from './harness/recevoir-modele-de-banc.js';

// =======================================================================
// LOT « JE REGARDE » DE « RECEVOIR LES PRODUCTIONS, RENDRE TES RÉTROACTIONS » (17 NOVEMBRE 2026)
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-17-je-regarde-recevoir.md, et le relais de Cowork du 17 nov. au soir.
// Lancé sous le Chromium du nuage pour ce lot (le verdict WebKit viendra à la fusion, sur le Mac).
//   A · le refus sans le préalable (le modèle d'« Évaluer » pas fait) ; la pulsation sur SA Modélisation.
//   B · le modèle de bout en bout, après les deux modèles précédents, aux deux orientations de l'iPad : la pulsation et
//       une flèche avant chaque geste ; les trois copies dans la zone après « Remplir » ; trois « Importé » et sept
//       évaluées à l'étape 3 ; l'export Léa (huit PDF, mesure 3.6) ; le confinement, clés ET blobs ; la remise à neuf.
//   C · les sept évaluations de l'exemple : présentes, verrouillées, sans fichier, aux niveaux du tableau ; celle de Yack
//       Amical (faite au modèle d'« Évaluer ») n'est pas remplacée ; aucune sur les trois copies ; leur note est celle
//       que le formulaire calcule.
// Les textes des bulles sont PROVISOIRES : le banc les lit dans `ParcoursRecevoirModele.textes`, pas en dur.

const ORIENTATIONS = [[820, 1180], [1180, 820]];
const TOTAL = 9;
const etape = (page, n, titre) => attendreEtape(page, n, TOTAL, titre);
const boutonDeBulle = (page, nom) => bulle(page).getByRole('button', { name: nom, exact: true });
const T = (page) => page.evaluate(() => {
    const t = window.ParcoursRecevoirModele.textes;
    return JSON.parse(JSON.stringify(t, (k, v) => (typeof v === 'function' ? v('«TITRE»') : v)));
});
const COPIES = { '9900002': 'Loutre Enjouée', '9900005': 'Tapir Doux', '9900006': 'Antilope Vaillante' };
const SEPT = {
    9900010: ['E', 'E', 'M', 'M'], 9900004: ['E', 'M', 'M', 'M'], 9900008: ['M', 'M', 'M', 'D'], 9900001: ['M', 'M', 'D', 'D'],
    9900007: ['M', 'D', 'D', 'D'], 9900003: ['D', 'D', 'I', 'D'], 9900009: ['D', 'I', 'D', 'I']
};
const CHAMPS_D_UN_PREMIER_ENREGISTREMENT = ['cartoucheId', 'coursId', 'criteres', 'dateEvaluation', 'donneesAlgorithmiques', 'echelleId',
    'etudiantDA', 'etudiantNom', 'grilleId', 'grilleNom', 'groupe', 'groupeCoursId', 'heureEvaluation', 'id', 'journal', 'niveauFinal',
    'noteFinale', 'notesIntegrite', 'optionsAffichage', 'pointsAnalytiques', 'ponderationCouverte', 'productionId', 'productionNom',
    'retroactionFinale', 'retroactionReecrite', 'statutIntegrite', 'statutRemise', 'verrouillee'];
const sansInsecable = (t) => t.replace(/[  ]/g, ' ');

/** Les évaluations de la production du modèle, lues dans la démo. */
const evaluationsDe = (page, pid) => page.evaluate((p) => (db.getSync(cle('evaluationsSauvegardees'), []) || [])
    .filter((e) => e.productionId === p && !e.remplaceeParId), pid);
const fichiersDe = (page, pid) => page.evaluate((p) => (db.getSync(cle('fichiersTravaux'), []) || []).filter((f) => f.productionId === p), pid);
const menuDeLoutre = '#evaluations-liste select.eval-actions-select:has(option[value^="annoter|"]):has(option[value*="|9900002"])';

test('A · sans le modèle d’« Évaluer », le modèle de « Recevoir » refuse, le nomme, et la pulsation va à sa Modélisation', async ({ page }) => {
    test.setTimeout(180000);
    await ouvrirEspaceVide(page, 820, 1180);
    // Le deuxième groupe existe (la Modélisation de « Mettre ta classe en place » est faite), pas la production du modèle.
    await ouvrirPanneau(page);
    await boutonModele(page, 'classe').click();
    await faireLaModelisation(page);
    await boutonDeBulle(page, 'Terminer').click();
    await ouvrirPanneau(page);
    // Break-test (17 nov. 2026) : `refusModele` rendant null (js/parcours-recevoir.js) → ROUGE (le modèle part : une
    // bulle paraît, le refus manque). Rétabli → vert.
    await boutonModele(page, 'recevoir').click();
    const refus = (await T(page)).refus;
    await expect(carte(page, 'recevoir').locator('.assistance-parcours-refus')).toHaveText(refus);
    expect(refus).toContain('Évaluer une première production');
    await expect(boutonModele(page, 'evaluer')).toHaveClass(/assistance-parcours-bouton--appel/);
    await expect(boutonModele(page, 'classe')).not.toHaveClass(/assistance-parcours-bouton--appel/);
    await expect(bulle(page)).toHaveCount(0);
    // Rien n'a été posé : aucune évaluation hors du pack.
    expect(await page.evaluate(() => (db.getSync('demo_evaluationsSauvegardees', []) || []).filter((e) => /^99000/.test(String(e.etudiantDA))).length)).toBe(0);
});

for (const [L, H] of ORIENTATIONS) {
    test(`B · ${L} × ${H} : le modèle de « Recevoir », de bout en bout ; l’export ; le confinement des clés et des blobs ; la remise à neuf`, async ({ page }) => {
        test.setTimeout(360000);
        page.setDefaultTimeout(20000);
        await ouvrirEspaceVide(page, L, H);
        await peuplerUnTrimestreReel(page);
        await poserUnBlobReel(page);
        // Les raccourcis d'annotation d'une personne qui a déjà annoté, dont une touche à elle. (Sans eux, la première
        // annotation, dans la démo ou non, pose les défauts : c'est l'application, au premier usage de ses outils.)
        await page.evaluate(() => {
            const r = Object.assign({}, travauxOutils.obtenirRaccourcisAnnotation(), { texte: 'x' });
            db.setSync('raccourcisAnnotation', r);
        });
        const avant = await releve(page);
        const blobsAvant = await releveDesBlobs(page);
        expect(blobsAvant).toHaveProperty('TEMOIN_COPIE_REELLE');
        const duPack = Object.fromEntries(Object.entries(avant).filter(([k]) => DE_LA_DEMO.test(k)));

        // Les deux modèles qui le précèdent ; la fin d'« Évaluer » offre maintenant « Voir le parcours suivant ».
        const { pid, evaluationId: idDeYack } = await faireLesDeuxModeles(page);
        await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Le refaire avec ma classe', 'Voir le parcours suivant', 'Terminer']);
        await boutonDeBulle(page, 'Voir le parcours suivant').click();
        const t = await T(page);
        const titre = await page.evaluate((p) => db.getSync(cle('productions'), []).find((x) => x.id === p).titre, pid);

        // 1. Leurs productions : « Remplir » dépose les trois copies.
        await etape(page, 1, 'Leurs productions');
        expect(await enDemo(page)).toBe(true);
        await expect(bulle(page)).toContainText('À la fin de ce parcours, tu seras en mesure');
        expect((await lireBulle(page)).consignes).toEqual([t.etape1.consigne]);
        expect((await lireBulle(page)).boutons).toEqual([REMPLIR]);
        // Les sept évaluations sont posées dès le lancement (C les juge en détail).
        expect((await evaluationsDe(page, pid)).length).toBe(7);
        await boutonDeBulle(page, REMPLIR).click();
        await expect.poll(() => page.evaluate(() => travauxImport.obtenirFileDAttente().map((f) => f.nomFichier || (f.fichier && f.fichier.name)).sort()))
            .toEqual([
                'Doux_9900005_Artefact-1_Remis_le_2025-09-09_07h58m03s.pdf',
                'Enjouee_9900002_Artefact-1_Remis_le_2025-09-08_23h41m12s.pdf',
                'Vaillante_9900006_Artefact-1_Remis_le_2025-09-08_19h22m47s.pdf'
            ]);

        // 2. Vérifie avant d'importer : la production du modèle, puis « Importer » et « Oui, importer ».
        await etape(page, 2, "Vérifie avant d'importer");
        await expect(bulle(page).locator('.parcours-bulle-confirme')).toHaveText(t.etape2.confirme);
        expect((await lireBulle(page)).consignes.map(sansInsecable)).toEqual([sansInsecable(t.etape2.choisir.replace('«TITRE»', titre))]);
        await contourSur(page, '.pipeline-production-selecteur');
        await flecheVers(page, '.pipeline-production-selecteur', 'étape 2, la production');
        await page.selectOption('.pipeline-production-selecteur select', pid);
        await expect.poll(async () => (await lireBulle(page)).consignes).toEqual([t.etape2.importer]);
        await contourSur(page, '[data-action="travauxUI.appliquerEtImporter"]');
        await page.click('[data-action="travauxUI.appliquerEtImporter"]');
        await expect(page.locator('.modal-overlay.actif')).toContainText('3 fichier(s) seront importés');
        await page.locator('.modal-overlay.actif button', { hasText: 'Oui, importer' }).click();

        // 3. La liste : trois « Importé », sept évaluées ; « Actions › Annoter » sur la ligne de Loutre Enjouée.
        await etape(page, 3, 'La liste');
        await expect(bulle(page).locator('.parcours-bulle-confirme')).toHaveText(t.etape3.confirme);
        for (const nom of ['Enjouée', 'Doux', 'Vaillante']) await expect(page.locator('#evaluations-liste tr', { hasText: nom })).toContainText('Importé');
        expect((await fichiersDe(page, pid)).map((f) => f.etudiantDA).sort()).toEqual(Object.keys(COPIES));
        expect((await evaluationsDe(page, pid)).map((e) => e.etudiantDA).sort()).toEqual(Object.keys(SEPT).sort());
        // Tapir Doux et Antilope Vaillante viennent AVANT Loutre Enjouée dans la Liste : la pulsation va quand même à elle.
        await contourSur(page, menuDeLoutre);
        await flecheVers(page, menuDeLoutre, 'étape 3, la ligne de Loutre Enjouée');
        const annoter = (await page.locator(menuDeLoutre).evaluate((s) => [...s.options].map((o) => o.value))).find((v) => v.startsWith('annoter|'));
        await page.locator(menuDeLoutre).selectOption(annoter);

        // 4. Les tampons : l'engrenage, puis « Annuler » (le modèle ne fait pas écrire les réglages réels des tampons :
        // « Enregistrer » écrit quatorze clés hors de la démo, mesuré le 17 nov. 2026).
        await etape(page, 4, 'Tes tampons');
        await expect(bulle(page).locator('.parcours-bulle-confirme')).toHaveText(t.etape4.confirme);
        expect(await page.evaluate(() => travauxVisionneuse.getFichierActuel().etudiantDA)).toBe('9900002');
        expect((await lireBulle(page)).consignes).toEqual([t.etape4.ouvrir]);
        await contourSur(page, '#travaux-palette-tampons [title="Personnaliser"]');
        await page.locator('#travaux-palette-tampons [title="Personnaliser"]').click();
        await expect.poll(async () => (await lireBulle(page)).consignes).toEqual([t.etape4.fermer]);
        await contourSur(page, '#modal-retro-observations [data-action="travauxOutils.fermerModalRetroObservations"]');
        await page.click('#modal-retro-observations [data-action="travauxOutils.fermerModalRetroObservations"]');

        // 5. Annoter, puis « Annoter ▾ » › « Évaluer ».
        await etape(page, 5, 'Annoter');
        await contourSur(page, '#travaux-btn-actions');
        await page.click('#travaux-btn-actions');
        await expect.poll(async () => (await lireBulle(page)).consignes).toEqual([t.etape5.evaluer]);
        await contourSur(page, '#travaux-btn-evaluer');
        await page.locator('[data-action="travauxUI.basculerMode"]', { hasText: 'Évaluer' }).first().click();

        // 6. Évaluer : un niveau par critère, au choix (le modèle n'impose rien).
        await etape(page, 6, 'Évaluer');
        await expect(page.locator('#selectGrille1')).not.toHaveValue('');
        const champs = await page.evaluate(() => [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]')].map((x) => x.id));
        expect(champs.length).toBe(4);
        // La pulsation sur un menu de critère visible et encore vide (celui que l'étape désigne, `critereAAttribuer`).
        await expect.poll(() => page.evaluate(() => {
            const c = document.getElementById('parcours-contour');
            if (!c || c.hidden) return 'absent';
            const a = c.getBoundingClientRect();
            return [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]')].some((s) => {
                const b = s.getBoundingClientRect();
                return b.width > 0 && s.value === '' && Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2) < 3 && Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2) < 3;
            }) ? 'posé' : 'ailleurs : ' + (() => { const x = document.elementFromPoint((a.left + a.right) / 2, (a.top + a.bottom) / 2); return x ? x.tagName + '#' + x.id + '.' + x.className + ' [' + Math.round(a.left) + ',' + Math.round(a.top) + ' ' + Math.round(a.width) + 'x' + Math.round(a.height) + ']' : '?'; })();
        }), { message: 'étape 6 : la pulsation sur un critère à attribuer', timeout: 5000 }).toBe('posé');
        for (const [k, id] of champs.entries()) await page.locator('#listeCriteresGrille1 #' + id).selectOption(['M', 'M', 'D', 'E'][k]);

        // 7. La rétroaction, le cadenas.
        await etape(page, 7, 'Ta rétroaction');
        await contourSur(page, '#btnVerrouillerEvaluation');
        await page.click('#btnVerrouillerEvaluation');

        // 8. Rendre : la production, puis « Exporter pour Léa ». Huit PDF (mesure 3.6) : la copie annotée de Loutre
        // Enjouée avec sa synthèse, et sept synthèses seules ; aucun pour Tapir Doux ni Antilope Vaillante.
        await etape(page, 8, 'Rends tes rétroactions');
        await expect(bulle(page).locator('.parcours-bulle-confirme')).toHaveText(t.etape8.confirme);
        await contourSur(page, '#travaux-archivage-lea-production');
        await page.selectOption('#travaux-archivage-lea-production', pid);
        await expect.poll(async () => (await lireBulle(page)).consignes).toEqual([t.etape8.exporter]);
        await contourSur(page, '[data-action="travauxUI.lancerExportLea"]');
        const avantExport = await releve(page);
        const telechargement = page.waitForEvent('download');
        await page.click('[data-action="travauxUI.lancerExportLea"]');
        const zip = await JSZip.loadAsync(fs.readFileSync(await (await telechargement).path()));
        const pdfs = Object.keys(zip.files).filter((n) => n.endsWith('.pdf')).sort();
        test.info().annotations.push({ type: 'export Léa (mesure 3.6)', description: pdfs.join(' · ') });
        expect(pdfs).toHaveLength(8);
        for (const da of Object.keys(SEPT).concat(['9900002'])) expect(pdfs.some((n) => n.includes(da)), da).toBe(true);
        for (const da of ['9900005', '9900006']) expect(pdfs.some((n) => n.includes(da)), da).toBe(false);
        // L'export n'écrit rien en base, ni dans la démo ni ailleurs (mesure 3.6).
        await etape(page, 9, 'Remets-les');
        // (Seul l'état du modèle lui-même change, sur l'appareil : `laboCodex.assistance`, de l'étape 8 à la 9.)
        expect(ecarts(avantExport, await releve(page), (k) => !DE_L_APPAREIL.test(k)), 'l’export n’écrit rien').toEqual([]);

        // 9. La fin : l'objectif atteint, les suites de même poids.
        await expect(bulle(page)).toContainText('Objectif atteint : tu es en mesure');
        await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
        await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Le refaire avec ma classe', 'Terminer']);
        await boutonDeBulle(page, 'Terminer').click();
        await expect(bulle(page)).toHaveCount(0);
        expect(await page.evaluate(() => Assistance.etatModeleDe('recevoir').etat)).toBe('fait');

        // Dans la démo : huit évaluations verrouillées, celle de Yack Amical inchangée, trois copies.
        const huit = await evaluationsDe(page, pid);
        expect(huit.filter((e) => e.verrouillee).map((e) => e.etudiantDA).sort()).toEqual(Object.keys(SEPT).concat(['9900002']).sort());
        expect(huit.find((e) => e.etudiantDA === '9900007').id).toBe(idDeYack);

        // LE CONFINEMENT, clés et blobs. Break-tests (17 nov. 2026) :
        //  a. dans `poserLesEvaluationsDeLExemple`, la clé écrite privée de son préfixe (`evaluationsSauvegardees`, sans
        //     la garde `demo_`) → ROUGE ici, la clé nommée. Rétabli → vert.
        //  b. dans `remettreDemoANeuf` (js/demo-activation.js), le retrait des copies sauté → ROUGE plus bas (« les blobs
        //     du départ »), les trois blobs nommés. Rétabli → vert.
        await page.evaluate(() => desactiverModeDemo());
        await expect.poll(() => enDemo(page)).toBe(false);
        const apres = await releve(page);
        const idsDesCopies = (await page.evaluate(() => (db.getSync('demo_fichiersTravaux', []) || []).map((f) => f.id))).sort();
        expect(idsDesCopies).toHaveLength(3);
        // Les vignettes des copies de la démo vivent sous `thumbnail_<id>`, sans préfixe : elles sont à la démo par
        // conception (T3, js/demo-activation.js, les retire par ces identifiants). Elles comptent avec elle ; la remise à
        // neuf les emporte (plus bas).
        const vignetteDeLaDemo = (k) => idsDesCopies.some((id) => k === 'db:thumbnail_' + id || k === 'ls:thumbnail_' + id);
        expect(Object.keys(apres).filter(vignetteDeLaDemo), 'les vignettes des trois copies').toHaveLength(6);
        expect(ecarts(avant, apres, (k) => horsDeLaDemo(k) && !vignetteDeLaDemo(k)), 'aucune clé hors de la démo ne change').toEqual([]);
        const blobsApres = await releveDesBlobs(page);
        expect(Object.keys(blobsApres).filter((k) => !(k in blobsAvant)).sort(), 'les seuls blobs neufs sont les trois copies de la démo').toEqual(idsDesCopies);
        expect(Object.fromEntries(Object.entries(blobsApres).filter(([k]) => k in blobsAvant)), 'les blobs réels intacts').toEqual(blobsAvant);

        // « Remettre la démo à neuf » : la démo du pack, et les blobs du départ (copies et vignettes parties).
        await ouvrirPanneau(page);
        await page.click('#assistance-demo-neuf');
        await page.getByRole('dialog').filter({ hasText: 'Remettre la démo à neuf' }).last().getByRole('button', { name: 'Remettre à neuf' }).click();
        await expect(page.locator('.notifications-pile')).toContainText('La démo est remise à neuf.', { timeout: 15000 });
        const neuf = await releve(page);
        expect(ecarts(duPack, neuf, (k) => DE_LA_DEMO.test(k)), 'la démo du pack').toEqual([]);
        expect(ecarts(avant, neuf, horsDeLaDemo), 'les autres clés identiques').toEqual([]);
        expect(Object.keys(neuf).filter((k) => /thumbnail_/.test(k) && idsDesCopies.some((id) => k.includes(id))), 'les vignettes parties').toEqual([]);
        expect(await releveDesBlobs(page), 'les blobs du départ').toEqual(blobsAvant);
    });
}

test('C · les sept évaluations de l’exemple : présentes, verrouillées, sans fichier, aux niveaux du tableau ; rien de remplacé ; la note du formulaire', async ({ page }) => {
    test.setTimeout(300000);
    page.setDefaultTimeout(20000);
    await ouvrirEspaceVide(page, 820, 1180);
    const { pid, evaluationId: idDeYack } = await faireLesDeuxModeles(page);
    const deYack = (await evaluationsDe(page, pid)).find((e) => e.id === idDeYack);
    await boutonDeBulle(page, 'Voir le parcours suivant').click();
    await etape(page, 1, 'Leurs productions');

    // Break-test (17 nov. 2026) : le filtre « déjà évalué·e » retiré de `poserLesEvaluationsDeLExemple` → ROUGE ici
    // (huit évaluations, Yack Amical en double). Rétabli → vert.
    const sept = await evaluationsDe(page, pid);
    expect(sept.map((e) => e.etudiantDA).sort()).toEqual(Object.keys(SEPT).sort());
    expect(sept.find((e) => e.etudiantDA === '9900007'), 'celle de Yack Amical, telle que le modèle d’« Évaluer » l’a faite').toEqual(deYack);
    for (const da of Object.keys(COPIES)) expect(sept.some((e) => e.etudiantDA === da), COPIES[da] + ' : aucune évaluation').toBe(false);
    const fichiers = await page.evaluate(() => (db.getSync(cle('fichiersTravaux'), []) || []).length);
    expect(fichiers, 'sans fichier').toBe(0);
    const noms = await page.evaluate((g) => (db.getSync(cle('grillesTemplates'), []) || []).find((x) => x.id === g).criteres.map((c) => c.nom), sept[0].grilleId);
    expect(noms).toEqual(['Structure', 'Rigueur', 'Plausibilité', 'Nuance']);
    for (const e of sept) {
        expect(e.verrouillee, e.etudiantNom).toBe(true);
        expect(e.criteres.map((c) => c.niveauSelectionne), e.etudiantNom).toEqual(SEPT[e.etudiantDA]);
        expect(e.cartoucheId, e.etudiantNom).toBe(deYack.cartoucheId);
        expect(e.echelleId).toBe(deYack.echelleId);
        // Les champs qu'écrit le formulaire à un premier enregistrement (`sauvegarderEvaluation`), relevés le 17 nov. 2026
        // sur l'évaluation de Yack Amical avant qu'elle soit rouverte (rouverte, le chemin de modification en ajoute).
        if (e.id !== idDeYack) expect(Object.keys(e).sort(), e.etudiantNom).toEqual(CHAMPS_D_UN_PREMIER_ENREGISTREMENT);
    }
    // Un deuxième lancement ne pose rien de plus (sans écraser).
    await page.evaluate(() => ParcoursMoteur.fermer());
    await page.evaluate(() => ParcoursRecevoirModele.lancer());
    await etape(page, 1, 'Leurs productions');
    expect((await evaluationsDe(page, pid)).map((e) => e.id).sort()).toEqual(sept.map((e) => e.id).sort());

    // La note et la rétroaction de l'exemple, confrontées au formulaire :
    //  · aux niveaux de Yack Amical, la construction rend ce que le formulaire a écrit pour lui ;
    const reconstruite = await page.evaluate(() => ParcoursRecevoirModele.evaluationDeLExemple('9900007', ['M', 'D', 'D', 'D']));
    for (const k of ['noteFinale', 'niveauFinal', 'ponderationCouverte', 'retroactionFinale']) expect(reconstruite[k], k).toEqual(deYack[k]);
    expect(reconstruite.criteres.map((c) => c.retroaction)).toEqual(deYack.criteres.map((c) => c.retroaction));
    //  · pour Caribou Attentionné (deux I), le formulaire, une fois l'évaluation déverrouillée, recalcule la même note et
    //    la même rétroaction.
    await page.evaluate(() => ParcoursMoteur.fermer());
    const caribou = sept.find((e) => e.etudiantDA === '9900009');
    const consulter = (await valeursActions(page, caribou.id)).find((v) => v.startsWith('consulter|'));
    await page.evaluate(() => naviguerVers('evaluations', 'liste'));
    await actionDeLaListe(page, consulter);
    await page.waitForFunction((id) => {
        const ec = window.evaluationEnCours, b = document.getElementById('btnVerrouillerEvaluation');
        return !!ec && ec.idModification === id && !window._chargementsEvaluationEnCours && !!b && b.title === 'Déverrouiller l’évaluation';
    }, caribou.id, { timeout: 10000 });
    await page.click('#btnVerrouillerEvaluation');
    await expect.poll(() => page.evaluate(() => window.noteCalculeeCourante)).toBe(caribou.noteFinale);
    await expect(page.locator('#niveauProduction1')).toHaveText(caribou.niveauFinal);
    await expect.poll(() => page.inputValue('#retroactionFinale1')).toBe(caribou.retroactionFinale);
});
