import { test, expect } from '@playwright/test';
import path from 'node:path';
import { readFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(RACINE, 'index.html');

// 21 nov. 2026 — LA PRATIQUE « PAR STANDARDS », LOT 5 : LE RELEVÉ PAR CIBLE QUE L'ÉTUDIANT·E REÇOIT, dans l'application réelle
// (rapport : `plans de travail/RAPPORT-2026-11-21-releve-par-cible.md`). L'unitaire (sentinelle-par-standards-lot-5-releve)
// juge les règles une à une ; ici, le parcours : le profil, section « Cibles », « Relevé de l'étudiant·e » ; l'aperçu ; le
// mot et les remarques ; le PDF ; le tableau des cibles, « Relevés des étudiant·es », le ZIP du groupe. Rien n'est écrit.
// Noms fictifs. Jugé sous Chromium dans le conteneur (playwright.chromium.config.js) ; Safari reste dû au Mac.
// CAPTURES : `RELEVE_CAPTURES=<dossier>` les y dépose (le dossier des captures du rapport).

const T = 'a2026';
const GC = 'GC_REL5';
const ZOE = '2100001';
const YAN = '2100002';
const LEA = '2100003';
const CAPTURES = process.env.RELEVE_CAPTURES || '';
const AVEC_CAPTURES = CAPTURES !== '';

const CINQ = [['0', 'Données insuffisantes', 0, '#767169', ''], ['1', 'En apprentissage', 25, '#b42318', 'Plusieurs critères essentiels ne sont pas encore respectés.'],
    ['2', 'Ça y est presque', 50, '#b54708', 'Un critère essentiel n’est pas encore respecté.'], ['3', 'Acquis', 75, '#1a7f37', 'Tous les critères essentiels sont respectés.'],
    ['4', 'Avancé', 100, '#175cd3', 'Tous les critères sont respectés.']]
    .map(([code, nom, v, couleur, description], i) => ({ code, nom, valeurCalcul: v, min: i * 20, max: i * 20 + 19, couleur, description }));

/** Zoé : les trois cibles démontrées, une remarque, une inscription annulée, des critères cochés ; Yan : un niveau et une remarque ; Léa : rien. */
function inscriptionsDuBanc() {
    const I = (id, da, cibleId, niveau, date, extra) => Object.assign({ id, type: 'inscription', da, ensembleId: 'ENSC_REL5', cibleId, niveau,
        echelleId: niveau === null ? null : 'ECH_REL5', date, horodatage: date + 'T12:00:00.000Z', productionId: null, noteBreve: '', criteres: [] }, extra || {});
    return [
        I('a0', ZOE, 'cible_a', '2', '2026-09-20', { noteBreve: 'Les procédés sont nommés, pas encore expliqués.', productionId: 'P1',
            criteres: [{ id: 'k1', texte: 'Relève trois procédés', essentiel: true, respecte: true }, { id: 'k2', texte: 'Explique l’effet de chaque procédé', essentiel: true, respecte: false }] }),
        I('a1', ZOE, 'cible_a', '4', '2026-10-15', { noteBreve: 'Analyse fine : chaque procédé est relié au sens du passage.', productionId: 'P2',
            criteres: [{ id: 'k1', texte: 'Relève trois procédés', essentiel: true, respecte: true }, { id: 'k2', texte: 'Explique l’effet de chaque procédé', essentiel: true, respecte: true }] }),
        I('a2', ZOE, 'cible_a', '3', '2026-11-10'),
        I('a3', ZOE, 'cible_b', null, '2026-10-03', { noteBreve: 'Plan annoncé à l’oral, clair ; à voir à l’écrit.' }),
        I('a4', ZOE, 'cible_b', '3', '2026-10-22', { noteBreve: 'Les paragraphes s’enchaînent bien.' }),
        I('a5', ZOE, 'cible_c', '1', '2026-10-30', { noteBreve: 'Inscrite par erreur.' }),
        { id: 'x5', type: 'annulation', inscriptionId: 'a5', da: ZOE, ensembleId: 'ENSC_REL5', cibleId: 'cible_c', date: '2026-10-31', horodatage: '2026-10-31T12:00:00.000Z', raison: 'mauvaise étudiante' },
        I('a6', ZOE, 'cible_c', '3', '2026-11-12', { noteBreve: 'Thèse nette, deux arguments solides.', productionId: 'P3' }),
        I('b1', YAN, 'cible_a', '3', '2026-10-15', { productionId: 'P2' }),
        I('b2', YAN, 'cible_b', null, '2026-10-03', { noteBreve: 'À l’oral, ça vient.' })];
}

async function installer(page, { configuration = {} } = {}) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.TableauCibles && window.ProfilCibles && window.ReleveCibles, null, { timeout: 20000 });
    await page.evaluate(({ T, GC, ZOE, YAN, LEA, niveaux, configuration, inscriptions }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-rel5';
        const echelle = { id: 'ECH_REL5', nom: 'Échelle fictive', niveaux };
        const ensemble = { id: 'ENSC_REL5', coursId, cibles: [
            { id: 'cible_a', etiquette: 'Analyser', enonce: 'Analyser un texte littéraire.', poids: 1, terminale: false,
                criteres: [{ id: 'k1', texte: 'Relève trois procédés', essentiel: true }, { id: 'k2', texte: 'Explique l’effet de chaque procédé', essentiel: true }, { id: 'k3', texte: 'Cite le texte avec exactitude', essentiel: false }] },
            { id: 'cible_b', etiquette: 'Structurer', enonce: 'Organiser un propos.', poids: 1, terminale: false, criteres: [{ id: 'k4', texte: 'Annonce un plan et le suit', essentiel: true }] },
            { id: 'cible_c', etiquette: 'Dissertation', enonce: 'Rédiger une dissertation.', poids: 2, terminale: true, criteres: [] }] };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', sigle: 'FRA101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: GC, trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'cib-5', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: ZOE, nom: 'Fictive', prenom: 'Zoé', groupe: '01', coursId, groupeCoursId: GC },
            { da: YAN, nom: 'Inventé', prenom: 'Yan', groupe: '01', coursId, groupeCoursId: GC },
            { da: LEA, nom: 'Imaginaire', prenom: 'Léa', groupe: '01', coursId, groupeCoursId: GC }]);
        window.db.setSync(T + '_echellesTemplates', [echelle]);
        window.db.setSync(T + '_ensemblesCibles', [ensemble]);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'cib-5', nom: 'Par standards fictive', type: 'cibles', calcul_note: { methode: 'niveaux_par_cible' },
            dansBibliotheque: true, configuration: Object.assign({ type: 'cibles', ensembleCiblesId: ensemble.id, echelleId: echelle.id, niveauSansDonnee: '0' }, configuration) }]);
        window.db.setSync(T + '_productions', [
            { id: 'P1', titre: 'Analyse 1', type: 'travail', numero: 1, groupeCoursId: GC, dateEcheance: '2026-09-20' },
            { id: 'P2', titre: 'Analyse 2', type: 'travail', numero: 2, groupeCoursId: GC, dateEcheance: '2026-10-15' },
            { id: 'P3', titre: 'Dissertation en classe', type: 'travail', numero: 3, groupeCoursId: GC, dateEcheance: '2026-11-12' }]);
        window.db.setSync(T + '_inscriptionsCibles', inscriptions);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: GC });
        window.db.setSync('groupeCoursActif', { id: GC, trimestreId: T });
    }, { T, GC, ZOE, YAN, LEA, niveaux: CINQ, configuration, inscriptions: inscriptionsDuBanc() });
}

/** Ce que la pratique garde (inscriptions, cibles, réglages) ; avec `tout`, chaque clé du stockage local aussi. */
const magasin = (page, tout) => page.evaluate((entier) => {
    const cles = {};
    if (entier) for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); cles[k] = localStorage.getItem(k); }
    return JSON.stringify({ inscriptions: window.db.getSync('a2026_inscriptionsCibles', []), ensembles: window.db.getSync('a2026_ensemblesCibles', []),
        pratiques: window.db.getSync('a2026_pratiquesConfigurables', []), echelles: window.db.getSync('a2026_echellesTemplates', []), local: cles });
}, !!tout);
const memeMagasin = (apres, avant) => apres === avant;

async function ouvrirLeProfil(page, da) {
    await page.evaluate((d) => { window.afficherSection('suivi'); window.afficherProfilComplet(d); }, da);
    await page.locator('[data-action="changerSectionProfil"][data-param="cibles"]').click();
    await expect(page.locator('[data-action="ReleveCibles.ouvrir"]')).toBeVisible();
}

async function ouvrirDepuisLeProfil(page, da) {
    await ouvrirLeProfil(page, da);
    await page.locator('[data-action="ReleveCibles.ouvrir"]').click();
    await expect(page.locator('.rc-fenetre')).toBeVisible();
}

test('du profil : l\'aperçu montre le relevé de l\'étudiant·e ; le mot et les remarques se changent ; rien n\'est écrit', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await installer(page);
    await ouvrirLeProfil(page, ZOE);
    const avant = await magasin(page, true);   // après l'ouverture du profil, qui range ses propres préférences d'affichage
    await page.locator('[data-action="ReleveCibles.ouvrir"]').click();
    const feuille = page.locator('.rc-apercu [data-releve-feuille]');
    await expect(feuille).toContainText('Relevé par objectif');
    await expect(feuille).toContainText('Zoé Fictive');
    // (100 + 75 + 2 × 75) ÷ 4 = 81,25, écrit « 81,3 % » : la même note que la carte du profil.
    await expect(feuille.locator('[data-releve-bloc="note"]')).toContainText('Note actuelle : 81,3\u00a0%');
    await expect(page.locator('.pc-note-valeur')).toContainText('81,3');
    await expect(feuille).toContainText('Niveau actuel : 4 · Avancé, depuis le 15 octobre 2026');   // le 3 du 10 nov. ne le fait pas baisser
    await expect(feuille).toContainText('Plan annoncé à l’oral, clair ; à voir à l’écrit.');        // une remarque
    await expect(feuille).not.toContainText('Inscrite par erreur.');                                 // une annulée
    await expect(feuille).not.toContainText('mauvaise étudiante');
    await expect(feuille).toContainText('Production : Analyse 2');
    await expect(feuille).not.toContainText(/cible/i);
    await page.locator('[data-rc="mot"]').selectOption('cible');
    await expect(feuille).toContainText('Relevé par cible');
    await expect(feuille).not.toContainText(/objectif/i);
    await page.locator('[data-rc="remarques"]').uncheck();
    await expect(feuille).not.toContainText('Plan annoncé à l’oral');
    await page.locator('[data-rc="etudiant"]').selectOption(LEA);
    await expect(feuille).toContainText('Léa Imaginaire');
    await expect(feuille.locator('[data-releve-bloc="note"]')).toContainText('Pas encore de note.');
    await expect(feuille.locator('[data-releve-bloc="note"]')).toContainText('Cibles encore sans niveau : Analyser, Structurer, Dissertation.');
    await page.keyboard.press('Escape');
    await expect(page.locator('.rc-fenetre')).toHaveCount(0);
    expect(memeMagasin(await magasin(page, true), avant), 'aucune écriture, dans aucune clé du stockage').toBe(true);
    expect(erreurs).toEqual([]);
});

test('le PDF d\'un·e étudiant·e : un fichier à son nom, des pages Lettre ; le ZIP du groupe, depuis le tableau : un PDF par étudiant·e', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    // Sous file://, Chromium ignore l'attribut `download` d'un lien vers un blob (origine opaque) : le nom demandé se lit sur le lien.
    await page.addInitScript(() => { window.__noms = []; const clic = HTMLAnchorElement.prototype.click;
        HTMLAnchorElement.prototype.click = function () { if (this.download) window.__noms.push(this.download); return clic.call(this); }; });
    await installer(page);
    await ouvrirLeProfil(page, ZOE);
    const avant = await magasin(page);
    await page.locator('[data-action="ReleveCibles.ouvrir"]').click();
    const [pdf] = await Promise.all([page.waitForEvent('download'), page.locator('[data-rc="telecharger"]').click()]);
    expect(await page.evaluate(() => window.__noms)).toEqual(['Releve_Fictive_Zoé_2100001.pdf']);
    const octets = readFileSync(await pdf.path());
    expect(octets.subarray(0, 5).toString()).toBe('%PDF-');
    expect(octets.length).toBeGreaterThan(20000);
    await expect(page.locator('.rc-etat')).toHaveText('Le relevé est téléchargé.');
    if (AVEC_CAPTURES) { mkdirSync(CAPTURES, { recursive: true }); copyFileSync(await pdf.path(), path.join(CAPTURES, 'releve-zoe-fictive.pdf')); }
    await page.keyboard.press('Escape');

    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); window.TableauNotation.afficher(); });
    await page.locator('[data-action="ReleveCibles.ouvrirPourLeGroupe"]').click();
    await expect(page.locator('[data-rc="groupe"]')).toHaveText('Télécharger les 3 relevés du groupe (ZIP)');
    const [zip] = await Promise.all([page.waitForEvent('download'), page.locator('[data-rc="groupe"]').click()]);
    expect((await page.evaluate(() => window.__noms))[1]).toMatch(/^Releves_FRA101.*_\d{4}-\d{2}-\d{2}\.zip$/);
    const archive = await JSZip.loadAsync(readFileSync(await zip.path()));
    expect(Object.keys(archive.files).sort()).toEqual(['Releve_Fictive_Zoé_2100001.pdf', 'Releve_Imaginaire_Léa_2100003.pdf', 'Releve_Inventé_Yan_2100002.pdf']);
    await expect(page.locator('.rc-etat')).toHaveText('3 relevés téléchargés.');
    // Le passage au tableau fait recalculer ses indices à l'application : ici, on juge ce que la pratique garde.
    expect(memeMagasin(await magasin(page), avant), 'inscriptions, cibles, réglages et échelle inchangés').toBe(true);
    expect(erreurs).toEqual([]);
});

test('captures (RELEVE_CAPTURES=<dossier>) : l\'aperçu en 1180 × 820 et 820 × 1180, clair et sombre', async ({ page }) => {
    test.skip(!AVEC_CAPTURES, 'captures sur demande');
    mkdirSync(CAPTURES, { recursive: true });
    await installer(page);
    for (const [l, h] of [[1180, 820], [820, 1180]]) {
        for (const clair of [true, false]) {
            await page.setViewportSize({ width: l, height: h });
            await page.evaluate((c) => window.definirTheme(c), clair);
            await ouvrirDepuisLeProfil(page, ZOE);
            await page.screenshot({ path: path.join(CAPTURES, `1-apercu-${l}x${h}-${clair ? 'clair' : 'sombre'}.png`) });
            await page.keyboard.press('Escape');
            await page.screenshot({ path: path.join(CAPTURES, `2-profil-bouton-${l}x${h}-${clair ? 'clair' : 'sombre'}.png`) });
        }
    }
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.evaluate(() => { window.definirTheme(true); window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); window.TableauNotation.afficher(); });
    await page.screenshot({ path: path.join(CAPTURES, '3-tableau-bouton-1180x820-clair.png') });
});
