import { test, expect } from '@playwright/test';
import { ouvrirPanneau, attendreEtape, contourSur, bulleNeCouvrePas, capture, bulle, ouvrirEspaceVide, mettreLaClasseEnPlace } from './harness/classe-de-banc.js';
import { leParcoursEntier, dossierDesCaptures } from './harness/parcours-3-de-banc.js';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// LE QUATRIÈME PARCOURS, « RECEVOIR LES PRODUCTIONS, RENDRE TES RÉTROACTIONS » (9 NOVEMBRE 2026)
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-4-recevoir-et-rendre.md. Ce banc juge, en faisant les gestes,
// depuis un espace où le troisième parcours est fait (harness/parcours-3-de-banc.js) :
//   · le panneau : sans production prête (grille, échelle et cartouche, question 7), le bouton ne lance rien et la
//     phrase validée le dit — MESURÉ : à la sortie du troisième parcours, la production nomme sa grille et son échelle
//     (décision du 9 nov., 13 h 37), pas sa cartouche ; le banc lui donne sa cartouche dans sa fiche (rapport, question
//     1) ; puis à faire, en cours,
//     fait ; le compte du menu passe à quatre ;
//   · la voie des fichiers : deux remises — une au format de Léa (le DA dans le nom), une de deux photos SANS DA à
//     réunir en une copie (question 9) —, la vérification, l'import, la Liste, les tampons, l'annotation, le mode
//     Évaluer, le verrou, « Plus tard » puis « Reprendre » à l'étape 8, l'export Léa (un ZIP téléchargé), la fin ;
//   · la voie sans fichier : « Rien à importer », « n sur 4 », retenue pour « Reprendre ».
// Les captures pour Grégoire : CAPTURES_PARCOURS=<dossier>.
// ⚠ Cloud du 9 nov. : Chromium seulement (playwright.chromium.config.js) ; le verdict WebKit se prend sur le Mac.

const DOSSIER = process.env.CAPTURES_PARCOURS || '';
const etat = (page) => page.evaluate(() => ({ ctx: ParcoursRecevoir.contexte(), i: ParcoursMoteur.etapeCourante() }));
const item = (page) => page.locator('#panneau-assistance [data-parcours="recevoir"]');
const REFUS = 'Commence par « Évaluer une première production » : il te faut décrire ta production, avec sa grille, pour recevoir celles de tes étudiant·es.';

function png() {
    return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
}

/** Le rappel « Mets ton codex à jour », s'il s'ouvre entre deux parcours (pas pendant) : « Plus tard ». */
async function fermerLeRappel(page) {
    await page.evaluate(() => {
        // Reporté comme après une mise à jour du codex : il ne s'ouvre plus entre deux gestes du banc.
        if (window.backupReminder) window.backupReminder.reporterApresMiseAJourDuCodex();
        const o = document.querySelector('#overlay-backup-reminder.actif');
        const b = o && [...o.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Plus tard');
        if (b) b.click();
    });
}

/** Dépose des fichiers sur la zone, comme un glisser-déposer. */
async function deposer(page, noms) {
    const dt = await page.evaluateHandle(([b64, liste]) => {
        const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const d = new DataTransfer();
        const t = Date.UTC(2026, 10, 3, 15, 0, 0);
        liste.forEach((n, i) => d.items.add(new File([octets], n, { type: 'image/png', lastModified: t + i })));
        return d;
    }, [png().toString('base64'), noms]);
    await page.dispatchEvent('#travaux-drop-zone', 'drop', { dataTransfer: dt });
}

 /**
 * Étape 2 (Grégoire, 9 nov., 15 h 55) : la bulle ne couvre ni les Originaux, ni l'Inspecteur, ni l'Aperçu, ni « Importer » ;
 * elle se pose sous eux. Côte à côte (1180 px), elle a la largeur des colonnes ; empilées (820 px), sous « Importer ».
 */
async function bulleSousLesColonnes(page, contexte) {
    for (const s of ['.pipeline-col-originaux', '.pipeline-col-centre', '.pipeline-col-confirmes', '[data-action="travauxUI.appliquerEtImporter"]']) {
        await bulleNeCouvrePas(page, s, contexte);
    }
    const [haut, basColonnes] = await page.evaluate(() => [document.getElementById('parcours-bulle').getBoundingClientRect().top,
        Math.max(document.querySelector('.pipeline-3col-grid').getBoundingClientRect().bottom,
            document.querySelector('[data-action="travauxUI.appliquerEtImporter"]').getBoundingClientRect().bottom)]);
    expect(haut, contexte + ' : la bulle sous les colonnes et « Importer »').toBeGreaterThanOrEqual(basColonnes);
}

const PDF_LEA = 'Baobab_Basile_2390002_Journal de lecture 1__Remis_le_2026-11-03_10h00m00s.png';
const n = (page, k, total, titre, opts) => attendreEtape(page, k, total, titre, opts);
const ligneDe = (page, valeur) => page.locator('#evaluations-liste select.eval-actions-select', { has: page.locator(`option[value="${valeur}"]`) });
async function valeurAction(page, debut) {
    return page.evaluate((d) => [...document.querySelectorAll('#evaluations-liste select.eval-actions-select option')].map((o) => o.value).find((v) => v.startsWith(d)), debut);
}

/** Un espace où le troisième parcours est fait, et rien d'autre : le quatrième démarre de là (question 1, 9 nov., 15 h 55). */
async function espaceDuTroisiemeParcours(page, cap) {
    dossierDesCaptures('');
    await leParcoursEntier(page, { niveaux: true, cap: 'p3' });
    await page.keyboard.press('Escape');
    dossierDesCaptures(DOSSIER);
    // De bout en bout (décision du 9 nov., 15 h 55) : à la sortie du troisième parcours, la production nomme sa grille, son
    // échelle et sa cartouche ; le quatrième démarre sans rien préparer à la main.
    await fermerLeRappel(page);
    await ouvrirPanneau(page);
    await expect(page.locator('#panneau-assistance .assistance-parcours-item')).toHaveCount(await page.evaluate(() => Assistance.parcours().length));
    // Quatrième entrée, juste après « Évaluer une première production » (la consigne) : lu dans le panneau rendu.
    const ordre = await page.locator('#panneau-assistance .assistance-parcours-item').evaluateAll((els) => els.map((e) => e.dataset.parcours));
    expect(ordre.slice(0, 4)).toEqual(['decouvrir', 'classe', 'evaluer', 'recevoir']);
    await expect(item(page).locator('.assistance-parcours-titre')).toHaveText('Recevoir les productions, rendre tes rétroactions');
    await expect(item(page).locator('.assistance-parcours-ligne')).toHaveText('De la remise de tes étudiant·es à leur rétroaction en PDF, avec ou sans fichier à importer.');
    const p3 = await page.evaluate(() => ParcoursEvaluer.contexte());
    expect(await page.evaluate((id) => { const p = (db.getSync(cle('productions'), []) || []).find((x) => x.id === id); return [!!p.grilleId, !!p.echelleId, p.cartoucheId]; }, p3.productionId)).toEqual([true, true, p3.cartoucheId]);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('À faire');
    await expect(item(page).locator('.assistance-parcours-bouton')).toHaveText('Commencer');
    await capture(page, DOSSIER, `panneau-${cap}-a-faire`);
    await item(page).locator('.assistance-parcours-bouton').click();
    return p3.productionId;
}

test('« Recevoir les productions, rendre tes rétroactions », la voie des fichiers : deux remises (une à réunir), les tampons, le verrou, « Plus tard » et « Reprendre » à l’étape 8, l’export Léa (1180 px)', async ({ page }) => {
    test.setTimeout(300000);
    const cap = '1180-sombre';
    const pid = await espaceDuTroisiemeParcours(page, cap);

    // 1. La zone de dépôt.
    await n(page, 1, 9, 'Leurs productions');
    await contourSur(page, '#travaux-drop-zone');
    await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Rien à importer']);
    await capture(page, DOSSIER, `p4-1-${cap}`);
    await deposer(page, [PDF_LEA, 'IMG_0001.png', 'IMG_0002.png']);

    // 2. Vérifier avant d'importer : trois contours (la production, la colonne de droite, « Originaux »).
    await n(page, 2, 9, "Vérifie avant d'importer", { focus: false });
    await contourSur(page, '.pipeline-production-selecteur');
    await contourSur(page, '.pipeline-col-confirmes', 'parcours-contour-extra-0');
    await contourSur(page, '.pipeline-col-originaux', 'parcours-contour-extra-1');
    await bulleSousLesColonnes(page, 'étape 2, 1180 px');
    await capture(page, DOSSIER, `p4-2-${cap}`);
    await page.selectOption('.pipeline-production-selecteur select', pid);
    // Deux photos SANS DA dans leur nom (question 9) : cochées, « Réunir en une copie », puis l'étudiante choisie.
    for (const i of [1, 2]) await page.locator('.pipeline-case-reunir').nth(i).click();
    await page.locator('.pipeline-btn-reunir').click();
    await expect(page.locator('.pipeline-groupe-encadre .pipeline-fichier-ligne')).toHaveCount(2);
    await page.locator('.pipeline-groupe-encadre .pipeline-fichier-ligne').first().click();
    const champ = page.locator('.pipeline-input-etudiant');
    await champ.click();
    await champ.fill('2390003');
    await page.locator('.pipeline-autocomplete-item[data-param2="2390003"]').dispatchEvent('mousedown');
    await capture(page, DOSSIER, `p4-2-reunies-${cap}`);
    expect(await page.evaluate(() => ParcoursMoteur.etapeCourante())).toBe(1);   // rien d'importé encore
    await page.click('[data-action="travauxUI.appliquerEtImporter"]');
    await expect(page.locator('.modal-overlay.actif')).toContainText('2 copie(s) seront créées');
    await expect(page.locator('.modal-overlay.actif')).toContainText('Cléo Cormoran – Journal de lecture 1 – 2 pages');
    await capture(page, DOSSIER, `p4-2-confirmation-${cap}`);
    await page.locator('.modal-overlay.actif button', { hasText: 'Oui, importer' }).click();

    // 3. La Liste : « Importé » ; « Actions › Annoter ».
    await n(page, 3, 9, 'La liste', { focus: false });
    await expect(page.locator('#evaluations-liste tr', { hasText: 'Baobab' })).toContainText('Importé');   // affiché en capitales par la CSS
    await expect(page.locator('#evaluations-liste tr', { hasText: 'Cormoran' })).toContainText('Importé');   // affiché en capitales par la CSS
    const annoter = await valeurAction(page, 'annoter|');
    await contourSur(page, `#evaluations-liste select.eval-actions-select:has(option[value^="annoter|"])`);
    await expect(page.locator('#evaluations-liste select.eval-actions-select:has(option[value^="annoter|"])').first()).toBeInViewport();
    await capture(page, DOSSIER, `p4-3-${cap}`);
    await ligneDe(page, annoter).selectOption(annoter);

    // 4. Les tampons : la palette affichée, l'engrenage, « Enregistrer ».
    await n(page, 4, 9, 'Tes tampons', { focus: false });
    await expect(page.locator('#travaux-palette-tampons')).toBeVisible();
    await contourSur(page, '#travaux-palette-tampons [title="Personnaliser"]');
    await capture(page, DOSSIER, `p4-4-${cap}`);
    // « Plus tard » à l'étape 4, la palette masquée par son bouton, un rechargement, « Reprendre » (relecture neuve du
    // 9 nov. : l'Accueil sous un voile plein) : la production se rouvre et la palette revient (« affiche-la si elle est
    // masquée »), contour sur l'engrenage.
    await bulle(page).getByRole('button', { name: 'Plus tard' }).click();
    await page.click('#btn-toggle-tampons');
    await expect(page.locator('#travaux-palette-tampons')).toHaveCount(0);
    await page.reload();
    await attendreApplication(page);
    await fermerLeRappel(page);
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('Étape 4 sur 9');
    await item(page).locator('.assistance-parcours-bouton').click();
    await n(page, 4, 9, 'Tes tampons');
    await expect(page.locator('#evaluations-annoter')).toBeVisible();
    await expect(page.locator('#travaux-palette-tampons')).toBeVisible();
    await contourSur(page, '#travaux-palette-tampons [title="Personnaliser"]');
    expect(await page.evaluate(() => document.getElementById('parcours-voile').getAttribute('class'))).toContain('parcours-voile--normal');
    await capture(page, DOSSIER, `p4-4-reprise-${cap}`);
    await page.locator('#travaux-palette-tampons [title="Personnaliser"]').click();
    await expect(page.locator('#modal-retro-observations')).toBeVisible();
    await contourSur(page, '#modal-retro-observations [data-action="travauxOutils.enregistrerRetroObservations"]');
    await capture(page, DOSSIER, `p4-4-fenetre-${cap}`);
    await page.click('#modal-retro-observations [data-action="travauxOutils.enregistrerRetroObservations"]');

    // 5. Annoter, puis « Annoter ▾ » › « Évaluer ».
    await n(page, 5, 9, 'Annoter', { focus: false });
    await contourSur(page, '#travaux-btn-actions');
    await capture(page, DOSSIER, `p4-5-${cap}`);
    await page.click('#travaux-btn-actions');
    await page.locator('[data-action="travauxUI.basculerMode"]', { hasText: 'Évaluer' }).first().click();

    // 6. Évaluer : la grille, l'échelle et la cartouche déjà choisies ; un niveau par critère.
    await n(page, 6, 9, 'Évaluer', { focus: false });
    const c = await page.evaluate(() => ParcoursEvaluer.contexte());
    await expect(page.locator('#selectGrille1')).toHaveValue(c.grilleId);
    await expect(page.locator('#selectCartoucheEval')).toHaveValue(c.cartoucheId);
    await expect(page.locator('#selectEchelle1')).not.toHaveValue('');
    const champs = await page.evaluate(() => [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]')].map((x) => x.id));
    expect(champs.length).toBe(4);
    await contourSur(page, '#' + champs[0]);
    await capture(page, DOSSIER, `p4-6-${cap}`);
    for (const id of champs.slice(0, 3)) await page.selectOption('#' + id, 'S');
    expect(await page.evaluate(() => ParcoursMoteur.etapeCourante())).toBe(5);   // un critère reste
    await page.selectOption('#' + champs[3], 'S');

    // 7. La rétroaction, le cadenas.
    await n(page, 7, 9, 'Ta rétroaction', { focus: false });
    await contourSur(page, '#btnVerrouillerEvaluation');
    await expect(page.locator('#retroactionFinale1')).toHaveValue(/MOT-DE-CARTOUCHE/);
    await capture(page, DOSSIER, `p4-7-${cap}`);
    await page.click('#btnVerrouillerEvaluation');

    // 8. Rendre : « Plus tard », un rechargement, « Reprendre » ; puis « Exporter pour Léa ».
    await n(page, 8, 9, 'Rends tes rétroactions', { focus: false });
    await contourSur(page, '[data-action="travauxUI.lancerExportLea"]');
    await capture(page, DOSSIER, `p4-8-${cap}`);
    await bulle(page).getByRole('button', { name: 'Plus tard' }).click();
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('recevoir'))).toEqual({ etat: 'en-cours', etape: 7 });
    await page.reload();
    await attendreApplication(page);
    await expect(bulle(page)).toHaveCount(0);
    await fermerLeRappel(page);
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('Étape 8 sur 9');
    await expect(item(page).locator('.assistance-parcours-bouton')).toHaveText('Reprendre');
    await capture(page, DOSSIER, `panneau-${cap}-en-cours`);
    await item(page).locator('.assistance-parcours-bouton').click();
    await n(page, 8, 9, 'Rends tes rétroactions');
    await page.selectOption('#travaux-archivage-lea-production', pid);
    const telechargement = page.waitForEvent('download');
    await page.click('[data-action="travauxUI.lancerExportLea"]');
    expect((await telechargement).suggestedFilename()).toBe('Lea_Journal-de-lecture-1_2026-11-10.zip');

    // 9. Remets-les : la bulle au centre, « Terminer ».
    await n(page, 9, 9, 'Remets-les', { focus: false });
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
    await capture(page, DOSSIER, `p4-9-${cap}`);
    await bulle(page).getByRole('button', { name: 'Terminer' }).click();
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('recevoir').etat)).toBe('fait');
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('Fait');
    await expect(item(page).locator('.assistance-parcours-bouton')).toHaveText('Refaire');
    await capture(page, DOSSIER, `panneau-${cap}-fait`);
});

test('« Recevoir les productions, rendre tes rétroactions », la voie sans fichier : « Rien à importer », « n sur 4 », retenue pour « Reprendre » et « Refaire » (1180 px)', async ({ page }) => {
    test.setTimeout(300000);
    const cap = '1180-sombre-sans-fichier';
    const pid = await espaceDuTroisiemeParcours(page, cap);
    await n(page, 1, 9, 'Leurs productions');
    await bulle(page).getByRole('button', { name: 'Rien à importer' }).click();

    // 1 sur 4 : la Liste, « Actions › Évaluer » sur la ligne de l'étudiant·e.
    await n(page, 1, 4, 'Évaluer', { focus: false });
    expect(await page.evaluate(() => ParcoursRecevoir.contexte().voie)).toBe('sans-fichier');
    const evaluer = await valeurAction(page, 'evaluer|2390002|');
    await contourSur(page, `#evaluations-liste select.eval-actions-select:has(option[value^="evaluer|"])`);
    await expect(page.locator('#evaluations-liste select.eval-actions-select:has(option[value^="evaluer|"])').first()).toBeInViewport();
    await capture(page, DOSSIER, `p4-6-${cap}`);
    await ligneDe(page, evaluer).selectOption(evaluer);
    await expect(page.locator('#evaluations-contenu-evaluation')).toBeVisible();
    const c = await page.evaluate(() => ParcoursEvaluer.contexte());
    await expect(page.locator('#selectCartoucheEval')).toHaveValue(c.cartoucheId);
    await expect.poll(() => page.locator('#listeCriteresGrille1 select[id^="eval_"]').count()).toBe(4);
    for (const id of await page.evaluate(() => [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]')].map((x) => x.id))) {
        await page.selectOption('#' + id, 'P');
    }

    // 2 sur 4 : la rétroaction (la deuxième phrase sans « Spécifique »), le cadenas.
    await n(page, 2, 4, 'Ta rétroaction', { focus: false });
    await expect(bulle(page).locator('.parcours-bulle-texte')).toContainText("« Générale » reprend les phrases de ta cartouche, critère par critère. Relis-les");
    await expect(bulle(page).locator('.parcours-bulle-texte')).not.toContainText('Spécifique');
    await capture(page, DOSSIER, `p4-7-${cap}`);
    await page.click('#btnVerrouillerEvaluation');

    // 3 sur 4 : « Plus tard », le panneau dit « Étape 3 sur 4 », « Reprendre » garde la voie.
    await n(page, 3, 4, 'Rends tes rétroactions', { focus: false });
    await bulle(page).getByRole('button', { name: 'Plus tard' }).click();
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('Étape 3 sur 4');
    await capture(page, DOSSIER, `panneau-${cap}-en-cours`);
    await item(page).locator('.assistance-parcours-bouton').click();
    await n(page, 3, 4, 'Rends tes rétroactions');
    await page.selectOption('#travaux-archivage-lea-production', pid);
    const telechargement = page.waitForEvent('download');
    await page.click('[data-action="travauxUI.lancerExportLea"]');
    expect((await telechargement).suggestedFilename()).toMatch(/^Lea_Journal-de-lecture-1_2026-11-10\.zip$/);

    // 4 sur 4, « Terminer » ; « Refaire » repart de la voie retenue.
    await n(page, 4, 4, 'Remets-les', { focus: false });
    await bulle(page).getByRole('button', { name: 'Terminer' }).click();
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('Fait');
    await item(page).locator('.assistance-parcours-bouton').click();
    await n(page, 1, 4, 'Évaluer', { focus: false });
    await page.keyboard.press('Escape');
});

test('« Recevoir les productions, rendre tes rétroactions », étape 2 à 820 px (l’iPad en portrait) : la bulle sous les trois colonnes empilées et « Importer »', async ({ page }) => {
    test.setTimeout(300000);
    await espaceDuTroisiemeParcours(page, '820-sombre');
    await page.setViewportSize({ width: 820, height: 1180 });
    // Le parcours est commencé à 1180 px : l'étape 1 se rejoue à 820, comme au retour d'un « Plus tard ».
    await page.evaluate(() => ParcoursMoteur.allerA(0));
    await n(page, 1, 9, 'Leurs productions', { focus: false });
    await deposer(page, [PDF_LEA, 'IMG_0001.png', 'IMG_0002.png']);
    await n(page, 2, 9, "Vérifie avant d'importer", { focus: false });
    await contourSur(page, '.pipeline-production-selecteur');
    await bulleSousLesColonnes(page, 'étape 2, 820 px');
    await capture(page, DOSSIER, 'p4-2-820-sombre');
});

test('« Recevoir les productions, rendre tes rétroactions » : sans production prête (la grille seule), le refus', async ({ page }) => {
    test.setTimeout(180000);
    await ouvrirEspaceVide(page, 1180);
    await mettreLaClasseEnPlace(page);
    // Le seul cas que le bout en bout ne montre plus (le troisième parcours fait nommer échelle et cartouche) : une
    // production qui ne nomme que sa grille, posée pour l'essai. Le refus, champ par champ, est tenu par la sentinelle.
    await page.evaluate(() => {
        const gc = db.getSync('groupeCoursActif', null);
        db.setSync(cle('productions'), [{ id: 'PROD_fictive', titre: 'Journal fictif', grilleId: 'GRILLE_fictive', coursId: gc && gc.coursId, dansBibliotheque: true }]);
    });
    await fermerLeRappel(page);
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await expect(item(page).locator('.assistance-parcours-condition')).toHaveText(REFUS);
    await expect(bulle(page)).toHaveCount(0);
    await capture(page, DOSSIER, 'panneau-1180-sombre-sans-production-prete');
});

