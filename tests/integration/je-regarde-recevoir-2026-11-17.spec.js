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
// REMIS À DIX ÉTAPES le 17 nov. 2026, au soir (CONSIGNE-LOT-2026-11-17-recevoir-dix-bulles.md) : les copies refaites
// (deux photos, un PDF), le redressement de la photo de Tapir Doux, l'import séparé, l'export et la fin réunis. Les
// textes sont ceux de Grégoire ; le banc les lit dans `ParcoursRecevoirModele.textes`, pas en dur.

const ORIENTATIONS = [[820, 1180], [1180, 820]];
const TOTAL = 10;
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
/** La phrase du lieu telle que le moteur l'écrit (les insécables de `typographier`). */
const lieuDit = (onglet, suite) => ('Tu es dans « Évaluation », à l\'onglet « ' + onglet + ' » ' + suite)
    .replace(/« /g, '«\u00a0').replace(/ »/g, '\u00a0»').replace(/ ([;:?!])/g, '\u00a0$1');
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
        // Les deux modèles préalables se jouent en portrait : sous Chromium, en paysage, la Modélisation de « Mettre ta
        // classe en place » rougit sur `main` (sa flèche de l'étape 1 ; inscrit au backlog le 17 nov. 2026, hors de ce
        // lot). L'orientation de l'essai est posée avant d'entrer dans le modèle de « Recevoir ».
        await ouvrirEspaceVide(page, 820, 1180);
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
        await page.setViewportSize({ width: L, height: H });
        await boutonDeBulle(page, 'Voir le parcours suivant').click();
        const t = await T(page);
        const titre = await page.evaluate((p) => db.getSync(cle('productions'), []).find((x) => x.id === p).titre, pid);

        // 1. Leurs productions : « Remplir » dépose les trois copies (deux photos, un PDF).
        await etape(page, 1, 'Leurs productions');
        expect(await enDemo(page)).toBe(true);
        await expect(bulle(page).locator('.parcours-bulle-objectif').first()).toContainText("de décrire le chemin d'une production dans l'application");
        // Le lieu, posé par le moteur (retouche de Cowork, 18 nov. : « à l'onglet ») ; la suite de la phrase, mot pour mot.
        await expect(bulle(page).locator('.parcours-bulle-lieu')).toHaveText(lieuDit('Préparer', t.etape1.lieuSuite));
        expect((await lireBulle(page)).consignes).toEqual([t.etape1.consignes[0]]);
        expect((await lireBulle(page)).boutons).toEqual([REMPLIR]);
        // Les sept évaluations sont posées dès le lancement (C les juge en détail).
        expect((await evaluationsDe(page, pid)).length).toBe(7);
        await boutonDeBulle(page, REMPLIR).click();
        await expect.poll(() => page.evaluate(() => travauxImport.obtenirFileDAttente().map((f) => f.nomFichier || (f.fichier && f.fichier.name)).sort()))
            .toEqual([
                'Doux_9900005_Artefact-1_Remis_le_2025-09-09_07h58m03s.jpg',
                'Enjouee_9900002_Artefact-1_Remis_le_2025-09-08_23h41m12s.jpg',
                'Vaillante_9900006_Artefact-1_Remis_le_2025-09-08_19h22m47s.pdf'
            ]);

        // 2. Vérifie avant d'importer : la copie de Tapir Doux, puis l'engrenage « Réglages spécifiques ».
        // Break-test (17 nov. 2026, soir) : l'étape 2 avançant sur le poste ouvert, sans `posteSurLaPhotoARedresser` →
        // ROUGE ici (le poste ouvert sur la photo de Loutre fait avancer l'étape). Rétabli → vert.
        await etape(page, 2, "Vérifie avant d'importer");
        await expect(bulle(page).locator('.parcours-bulle-confirme')).toHaveText(t.etape2.confirme);
        expect((await lireBulle(page)).consignes).toEqual([t.etape2.consignes[0]]);
        const tapir = await page.evaluate(() => travauxImport.obtenirFileDAttente().findIndex((f) => String(f.etudiantDA) === '9900005'));
        const loutre = await page.evaluate(() => travauxImport.obtenirFileDAttente().findIndex((f) => String(f.etudiantDA) === '9900002'));
        const ligne = (k) => `.pipeline-col-originaux .pipeline-fichier-ligne[data-param="${k}"]`;
        await contourSur(page, ligne(tapir));
        // Une autre photo d'abord : la bulle le dit, et l'étape ne bouge pas, même le poste ouvert.
        await page.click(ligne(loutre));
        await expect(bulle(page)).toContainText(sansInsecable(t.etape2.autreCopie).slice(0, 40));
        await page.click('[data-action="travauxUI.ouvrirPreparationFichier"]');
        await expect(page.locator('#travaux-preparation-modal')).toBeVisible();
        await expect(bulle(page)).toContainText('Retour');
        // Plusieurs passages de la sonde avec le poste ouvert sur la photo de Loutre : l'étape 2 reste.
        await page.waitForFunction(() => { window.__passages = (window.__passages || 0) + 1; return window.__passages > 6; }, null, { polling: 150 });
        expect(await page.evaluate(() => ParcoursMoteur.etapeCourante()), 'le poste sur la photo de Loutre : l’étape 2 reste').toBe(1);
        await page.click('#travaux-preparation-modal [data-action="travauxPreparation.fermer"]');
        await expect(page.locator('#travaux-preparation-modal')).toBeHidden();
        await page.click(ligne(tapir));
        // L'engrenage se redessine avec la copie choisie : attendre qu'il porte celle de Tapir (sinon, touché trop tôt, il
        // ouvre encore la photo de Loutre, et l'étape 2 refuse d'avancer, comme elle le doit).
        await expect(page.locator('[data-action="travauxUI.ouvrirPreparationFichier"]')).toHaveAttribute('data-param', String(tapir));
        await contourSur(page, '[data-action="travauxUI.ouvrirPreparationFichier"]');
        await page.click('[data-action="travauxUI.ouvrirPreparationFichier"]');

        // 3. Redresse une photo : « Perspective » pose les poignées sur les coins de la feuille ; « Confirmer
        // perspective » ; la bulle devient sa seconde forme ; « Confirmer les réglages spécifiques ».
        // Break-test (17 nov. 2026, soir) : la seconde forme sans `perspectiveAppliquee` (toujours la première) → ROUGE
        // ici (la consigne reste « Touche « Perspective »… »). Rétabli → vert.
        await etape(page, 3, 'Redresse une photo');
        await expect(bulle(page).locator('.parcours-bulle-confirme')).toHaveText(t.etape3.confirme);
        expect(await page.evaluate(() => document.body.classList.contains('parcours-sur-modale')), 'la bulle au-dessus du poste').toBe(true);
        expect((await lireBulle(page)).consignes).toEqual(t.etape3.consignes);
        await contourSur(page, '#travaux-preparation-modal [data-action="travauxPreparation.activerPerspective"]');
        await page.click('#travaux-preparation-modal [data-action="travauxPreparation.activerPerspective"]');
        await contourSur(page, '#prep-btn-appliquer-persp');
        // Les poignées sur les coins de la feuille (lot/perspective-coins), et la bulle ne couvre aucune d'elles.
        const poignees = await page.evaluate(() => {
            const c = document.getElementById('prep-canvas-apercu').getBoundingClientRect();
            const b = document.getElementById('parcours-bulle').getBoundingClientRect();
            return travauxPreparation.coinsDePerspective().map((p) => {
                const x = c.left + p.x * c.width, y = c.top + p.y * c.height;
                return { p, couverte: x >= b.left && x <= b.right && y >= b.top && y <= b.bottom };
            });
        });
        test.info().annotations.push({ type: `poignées, ${L} × ${H}`, description: JSON.stringify(poignees.map((q) => [+q.p.x.toFixed(3), +q.p.y.toFixed(3), q.couverte])) });
        expect(poignees.some((q) => q.couverte), 'la bulle ne couvre aucune poignée').toBe(false);
        expect(Math.abs(poignees[0].p.x - 0.05) + Math.abs(poignees[0].p.y - 0.106)).toBeLessThan(0.04);
        await page.click('#prep-btn-appliquer-persp');
        await expect.poll(async () => (await lireBulle(page)).consignes).toEqual(t.etape3.devient.consignes);
        await expect(bulle(page)).toContainText(sansInsecable(t.etape3.devient.lignes[0]).slice(0, 30));
        await contourSur(page, '#prep-btn-confirmer');
        await page.click('#prep-btn-confirmer');

        // 4. Importe-les : la mention de l'Aperçu ; la production ; « Importer », « Oui, importer » ; la fin du traitement.
        await etape(page, 4, 'Importe-les');
        await expect(bulle(page).locator('.parcours-bulle-confirme')).toHaveText(t.etape4.confirme);
        expect(await page.evaluate(() => document.body.classList.contains('parcours-sur-modale'))).toBe(false);
        // Ce que l'Aperçu montre de la copie de Tapir (la bulle dit « Spécifique : Perspective ») : relevé pour le rapport.
        const mention = await page.evaluate((k) => [...document.querySelectorAll('.pipeline-col-confirmes .pipeline-fichier-colonne')][k].querySelector('.pipeline-fichier-meta-col').innerText.replace(/\s+/g, ' ').trim(), tapir);
        test.info().annotations.push({ type: 'mention de l’Aperçu (Tapir)', description: mention });
        expect(mention).toMatch(/^Spécifique Perspective/);
        expect((await lireBulle(page)).consignes.map(sansInsecable)).toEqual([sansInsecable(t.etape4.choisir.replace('«TITRE»', titre)), t.etape4.importer]);
        await contourSur(page, '.pipeline-production-selecteur');
        await flecheVers(page, '.pipeline-production-selecteur', 'étape 4, la production');
        await page.selectOption('.pipeline-production-selecteur select', pid);
        await expect.poll(async () => (await lireBulle(page)).consignes).toEqual([t.etape4.importer]);
        await contourSur(page, '[data-action="travauxUI.appliquerEtImporter"]');
        const debutImport = Date.now();
        await page.click('[data-action="travauxUI.appliquerEtImporter"]');
        await expect(page.locator('.modal-overlay.actif')).toContainText('3 fichier(s) seront importés');
        await page.locator('.modal-overlay.actif button', { hasText: 'Oui, importer' }).click();

        // 5. La liste : trois « Importé », sept évaluées ; « Actions › Annoter » sur la ligne de Loutre Enjouée.
        await etape(page, 5, 'La liste');
        test.info().annotations.push({ type: `import des trois copies, ${L} × ${H}`, description: Math.round((Date.now() - debutImport) / 100) / 10 + ' s (Chromium du nuage)' });
        await expect(bulle(page).locator('.parcours-bulle-confirme')).toHaveText(t.etape5.confirme);
        await expect(bulle(page).locator('.parcours-bulle-lieu')).toHaveText(lieuDit('Liste', t.etape5.lieuSuite));
        for (const nom of ['Enjouée', 'Doux', 'Vaillante']) await expect(page.locator('#evaluations-liste tr', { hasText: nom })).toContainText('Importé');
        expect((await fichiersDe(page, pid)).map((f) => f.etudiantDA).sort()).toEqual(Object.keys(COPIES));
        expect((await evaluationsDe(page, pid)).map((e) => e.etudiantDA).sort()).toEqual(Object.keys(SEPT).sort());
        await contourSur(page, menuDeLoutre);
        await flecheVers(page, menuDeLoutre, 'étape 5, la ligne de Loutre Enjouée');
        const annoter = (await page.locator(menuDeLoutre).evaluate((s) => [...s.options].map((o) => o.value))).find((v) => v.startsWith('annoter|'));
        await page.locator(menuDeLoutre).selectOption(annoter);

        // 6. Les tampons : l'engrenage, la seconde forme, puis « Annuler » (le modèle ne fait pas écrire les réglages réels
        // des tampons : « Enregistrer » écrit quatorze clés hors de la démo, mesuré le 17 nov. 2026).
        await etape(page, 6, 'Tes tampons');
        await expect(bulle(page).locator('.parcours-bulle-confirme')).toHaveText(t.etape6.confirme);
        await expect(bulle(page).locator('.parcours-bulle-lieu')).toHaveText(lieuDit('Annoter', t.etape6.lieuSuite));
        expect(await page.evaluate(() => travauxVisionneuse.getFichierActuel().etudiantDA)).toBe('9900002');
        expect((await lireBulle(page)).consignes).toEqual(t.etape6.consignes);
        await contourSur(page, '#travaux-palette-tampons [title="Personnaliser"]');
        await page.locator('#travaux-palette-tampons [title="Personnaliser"]').click();
        await expect.poll(async () => (await lireBulle(page)).consignes).toEqual(t.etape6.devient.consignes);
        await contourSur(page, '#modal-retro-observations [data-action="travauxOutils.fermerModalRetroObservations"]');
        await page.click('#modal-retro-observations [data-action="travauxOutils.fermerModalRetroObservations"]');

        // 7. Annoter, puis « Annoter ▾ » › « Évaluer ».
        await etape(page, 7, 'Annoter');
        expect((await lireBulle(page)).consignes).toEqual(t.etape7.consignes);
        await contourSur(page, '#travaux-btn-actions');
        await page.click('#travaux-btn-actions');
        await contourSur(page, '#travaux-btn-evaluer');
        await page.locator('[data-action="travauxUI.basculerMode"]', { hasText: 'Évaluer' }).first().click();

        // 8. Évaluer : un niveau par critère, au choix (le modèle n'impose rien).
        await etape(page, 8, 'Évaluer');
        expect((await lireBulle(page)).consignes).toEqual(t.etape8.consignes);
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
            }) ? 'posé' : 'ailleurs';
        }), { message: 'étape 8 : la pulsation sur un critère à attribuer', timeout: 5000 }).toBe('posé');
        for (const [k, id] of champs.entries()) await page.locator('#listeCriteresGrille1 #' + id).selectOption(['M', 'D', 'D', 'D'][k]);

        // 9. La rétroaction, le cadenas.
        await etape(page, 9, 'Ta rétroaction');
        expect((await lireBulle(page)).consignes).toEqual(t.etape9.consignes);
        await contourSur(page, '#btnVerrouillerEvaluation');
        await page.click('#btnVerrouillerEvaluation');

        // 10. Rends tes rétroactions : la production, « Exporter pour Léa » ; huit PDF (mesure 3.6) ; puis la seconde
        // forme, la fin du parcours.
        await etape(page, 10, 'Rends tes rétroactions');
        await expect(bulle(page).locator('.parcours-bulle-confirme')).toHaveText(t.etape10.confirme);
        await expect(bulle(page).locator('.parcours-bulle-lieu')).toHaveText(lieuDit('Exporter', t.etape10.lieuSuite));
        await expect(bulle(page)).not.toContainText('Objectif atteint');
        expect((await lireBulle(page)).consignes.map(sansInsecable)).toEqual([sansInsecable(t.etape10.choisir.replace('«TITRE»', titre)), t.etape10.exporter]);
        await contourSur(page, '#travaux-archivage-lea-production');
        await page.selectOption('#travaux-archivage-lea-production', pid);
        await expect.poll(async () => (await lireBulle(page)).consignes).toEqual([t.etape10.exporter]);
        await contourSur(page, '[data-action="travauxUI.lancerExportLea"]');
        const avantExport = await releve(page);
        // Le nom que l'application donne au ZIP (l'attribut `download` du lien) : la bulle 10 en parle.
        await page.evaluate(() => {
            const cliquer = HTMLAnchorElement.prototype.click;
            HTMLAnchorElement.prototype.click = function () { if (this.download) window.__nomDuZip = this.download; return cliquer.apply(this, arguments); };
        });
        const telechargement = page.waitForEvent('download');
        await page.click('[data-action="travauxUI.lancerExportLea"]');
        const dl = await telechargement;
        const zip = await JSZip.loadAsync(fs.readFileSync(await dl.path()));
        const pdfs = Object.keys(zip.files).filter((n) => n.endsWith('.pdf')).sort();
        const nomDuZip = await page.evaluate(() => window.__nomDuZip || '');
        test.info().annotations.push({ type: 'export Léa (mesure 3.6)', description: nomDuZip + ' (Chromium : ' + dl.suggestedFilename() + ') : ' + pdfs.join(' · ') });
        expect(nomDuZip).toMatch(/^Lea_.+_\d{4}-\d{2}-\d{2}\.zip$/);
        expect(pdfs).toHaveLength(8);
        for (const da of Object.keys(SEPT).concat(['9900002'])) expect(pdfs.some((n) => n.includes(da)), da).toBe(true);
        for (const da of ['9900005', '9900006']) expect(pdfs.some((n) => n.includes(da)), da).toBe(false);
        // La seconde forme : ses deux lignes, « Objectif atteint », la phrase de la suite, les boutons ; sans « Plus tard ».
        await expect(bulle(page)).toContainText('Objectif atteint : tu es en mesure');
        await expect(bulle(page)).toContainText(sansInsecable(t.etape10.devient.lignes[0]).slice(0, 30));
        await expect(bulle(page).locator('.parcours-bulle-confirme')).toHaveCount(0);
        await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
        // « Voir le parcours suivant » n'y est que si le parcours suivant a son modèle : aucun ne l'a (écart nommé au rapport).
        await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Le refaire avec ma classe', 'Terminer']);
        // L'export n'écrit rien en base, ni dans la démo ni ailleurs (mesure 3.6) ; seul l'état du modèle change, sur l'appareil.
        expect(ecarts(avantExport, await releve(page), (k) => !DE_L_APPAREIL.test(k)), 'l’export n’écrit rien').toEqual([]);
        await boutonDeBulle(page, 'Terminer').click();
        await expect(bulle(page)).toHaveCount(0);
        expect(await page.evaluate(() => Assistance.etatModeleDe('recevoir').etat)).toBe('fait');
        // La photo de Tapir importée porte son redressement (la feuille droite) : sa copie en stock n'a plus le bois autour.
        expect((await fichiersDe(page, pid)).find((f) => f.etudiantDA === '9900005')).toBeTruthy();

        // Dans la démo : huit évaluations verrouillées, celle de Yack Amical inchangée, trois copies.
        const huit = await evaluationsDe(page, pid);
        expect(huit.filter((e) => e.verrouillee).map((e) => e.etudiantDA).sort()).toEqual(Object.keys(SEPT).concat(['9900002']).sort());
        expect(huit.find((e) => e.etudiantDA === '9900007').id).toBe(idDeYack);

        // LE CONFINEMENT, clés et blobs. Break-tests (17 nov. 2026) :
        //  a. dans `poserLesEvaluationsDeLExemple`, la clé écrite privée de son préfixe (`evaluationsSauvegardees`, sans
        //     la garde `demo_`) → ROUGE ici, la clé nommée. Rétabli → vert.
        //  b. dans `remettreDemoANeuf` (js/demo-activation.js), le retrait des copies sauté → ROUGE plus bas (« les autres
        //     clés identiques » : les vignettes restent). Rétabli → vert.
        //  c. dans `retirerCopiesDuDemo`, la suppression des blobs seule sautée → ROUGE plus bas (« les blobs du
        //     départ »), les trois blobs nommés, à la taille des trois PDF. Rétabli → vert.
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
