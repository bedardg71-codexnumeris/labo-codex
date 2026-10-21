import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #912 (17 septembre 2026) — SANS COPIE, « DOSSIER PDF » REND LA SYNTHÈSE SEULE.
//
// Suite du bug testeur #911 : tout l'Automne 2025 de Grégoire, 303 évaluations faites avec les grilles, aucune
// copie importée. Décision de Grégoire (17 sept., vers 15 h) : un PDF d'une page, LA MÊME synthèse que celle
// remise avec une copie, sans section d'annotations ; aucun bouton neuf.
//
// AVANT : « Dossier PDF » (Liste des évaluations › « Actions… ») répondait par un `alert` — « Aucun fichier
// trouve pour cet etudiant et cette production. » — et ne produisait rien.
//
// CE QU'ON OBSERVE. Le vrai trajet tourne (menu, `exporterDossierComplet`, `construireFeedback`, rendu,
// html2canvas, jsPDF). Deux enveloppes seulement, posées sur des globaux (pas de `new Function`, CSP) :
//   - `jsPDF.API.save` : on note le nom et le nombre de pages au lieu de déclencher un téléchargement ;
//   - `rendreSyntheseHTML` : on garde le HTML qu'il rend — c'est ce que l'élève lira.
// LA COPIE DE BANC (témoin de parité) : `recupererBlob` enveloppé, PNG d'un pixel, comme aux bancs #868 et #911.

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't912';
const DA = 'TEST912';
const NOTE_PRIVEE = 'NOTE-PRIVEE-912-soupcon-a-verifier';

async function monter(page, { avecCopie = false, archive = false, criteres = 'complets' } = {}) {
    const suivi = { dialogues: [], erreurs: [] };
    page.on('dialog', (d) => { suivi.dialogues.push(d.message()); d.dismiss().catch(() => {}); });
    page.on('pageerror', (e) => suivi.erreurs.push(`pageerror: ${e.message}`));
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxExportPDF && window.travauxStockage
        && window.syntheseRetroactionRendu && window.jspdf && typeof window.html2canvas === 'function'
        && typeof window.afficherSousSection === 'function');
    await page.evaluate(({ png, T, DA, avecCopie, archive, criteres, NOTE_PRIVEE }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-912';
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre sans copie', annee: 2025, session: 'A', actif: true, archive }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_912' });
        window.db.setSync('groupeCoursActif', { id: 'GC_912', trimestreId: T });
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_912', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId, groupeCoursId: 'GC_912' }]);
        window.db.setSync(T + '_productions', [{ id: 'p912', titre: 'Analyse', type: 'travail', ponderation: 100, grilleId: 'G912', echelleId: 'E912', groupeCoursId: 'GC_912' }]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G912', nom: 'Grille témoin', type: 'holistique', criteres: [
            // ↻ #705 (19 sept. 2026) — des identifiants DATÉS (l'ancien format « CR<ms> » d'A2025 : nés le
            // 3 sept. 2025, avant l'évaluation du 20 oct.). Depuis #705, un critère que l'évaluation ne porte
            // pas peut avoir été ajouté APRÈS elle : sans date, il est présumé tel et le PDF conclut. C'est la
            // date de naissance qui fait de « Structure » un critère SAUTÉ — le cas que #674 refuse.
            { id: 'CR1756900000001', nom: 'Contenu', ponderation: 60, type: 'holistique' },
            { id: 'CR1756900000002', nom: 'Structure', ponderation: 40, type: 'holistique' }
        ] }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E912', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] }]);
        const lesCriteres = {
            complets: [{ critereId: 'CR1756900000001', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60 }, { critereId: 'CR1756900000002', critereNom: 'Structure', niveauSelectionne: 'D', ponderation: 40 }],
            incomplets: [{ critereId: 'CR1756900000001', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60 }],   // c2 (40 %) reste à évaluer : #674
            aucun: []                                                                                              // sept cas dans l'Automne 2025 de Grégoire
        }[criteres];
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EVAL912', etudiantDA: DA, productionId: 'p912', grilleId: 'G912', echelleId: 'E912', cartoucheId: '',
            groupeCoursId: 'GC_912', coursId, statutRemise: 'remis', statutIntegrite: 'recevable', notesIntegrite: NOTE_PRIVEE,
            criteres: lesCriteres, noteFinale: 74, niveauFinal: 'D', retroactionFinale: 'Rétroaction témoin pour Léa.',
            dateEvaluation: '2025-10-20T12:00:00.000Z', verrouillee: false
        }]);
        window.db.setSync(T + '_fichiersTravaux', avecCopie ? [{
            id: 'FT912', etudiantDA: DA, productionId: 'p912', coursId, groupeCoursId: 'GC_912',
            nomFichier: 'GAGNON_TEST912_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2025-10-01T12:00:00.000Z', dateModification: '2025-10-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }] : []);
        // Une annotation ORPHELINE (sans `fichierId`) : elle ne doit répondre à aucune recherche « sans copie »,
        // sinon ses erreurs paraîtraient sur la page d'un élève qui n'a rien remis ici.
        window.db.setSync(T + '_annotationsTravaux', [{ fichierId: null, pages: { 0: { stickers: [], shapes: [{ type: 'errfr_1' }, { type: 'errfr_1' }] } } }]);
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT912' ? copie : original.apply(this, arguments); };
        if (typeof window.mettreAJourBandeauArchive === 'function') window.mettreAJourBandeauArchive();

        // Les deux enveloppes d'observation.
        window._pdf912 = [];
        window._html912 = [];
        window.jspdf.jsPDF.API.save = function (nom) { window._pdf912.push({ nom, pages: this.getNumberOfPages() }); return this; };
        const rendu = window.syntheseRetroactionRendu.rendreSyntheseHTML;
        window.syntheseRetroactionRendu.rendreSyntheseHTML = function () { const h = rendu.apply(this, arguments); window._html912.push(h); return h; };
    }, { png: PNG, T, DA, avecCopie, archive, criteres, NOTE_PRIVEE });
    return suivi;
}

/** Le geste : Évaluation › Liste des évaluations › menu « Actions… » › « Dossier PDF ». */
async function dossierPdfDepuisLaListe(page, suivi) {
    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); });
    const selecteur = `.eval-actions-select option[value="dossier|${DA}|p912"]`;
    await page.waitForFunction((s) => !!document.querySelector(s), selecteur, { timeout: 10000 });
    await page.evaluate((s) => {
        const menu = document.querySelector(s).closest('select');
        menu.value = document.querySelector(s).value;
        menu.dispatchEvent(new Event('change', { bubbles: true }));
    }, selecteur);
    // Deux issues : un PDF enregistré, ou un dialogue qui dit pourquoi il n'y en a pas.
    await expect.poll(async () => (await page.evaluate(() => window._pdf912.length)) + suivi.dialogues.length, { timeout: 20000 }).toBeGreaterThan(0);
    return page.evaluate(() => ({ pdf: window._pdf912, html: window._html912 }));
}

// La section des annotations (tampons + erreurs) : ses deux marqueurs dans le gabarit.
const aUneSectionAnnotations = (html) => /grid-template-columns: 1\.55fr 1fr/.test(html) || /Erreurs annotées/.test(html);

test('Porte #912 · sans copie : « Dossier PDF » rend un PDF d\'une page, la synthèse, sans section d\'annotations', async ({ page }) => {
    const suivi = await monter(page);
    const { pdf, html } = await dossierPdfDepuisLaListe(page, suivi);
    // AVANT : dialogues = ['Aucun fichier trouve pour cet etudiant et cette production.'], aucun PDF.
    expect(suivi.dialogues).toEqual([]);
    expect(pdf).toEqual([{ nom: 'synthese_Léa_Gagnon_p912.pdf', pages: 1 }]);
    expect(html.length).toBe(1);
    expect(html[0]).toContain('Contenu');
    expect(html[0]).toContain('Structure');
    expect(html[0]).toContain('Rétroaction par critère');
    expect(html[0]).toContain('Niveau général');
    // MESURÉ le 17 sept. : la synthèse est une page GÉNÉRÉE (critères, niveau général, bilan, jetons). Le texte
    // libre de `retroactionFinale` n'y figure pas — avec ou sans copie (l'essai de parité le tient).
    expect(html[0]).not.toContain('Rétroaction témoin pour Léa.');
    expect(aUneSectionAnnotations(html[0])).toBe(false);
    // Ce qui est réservé à l'enseignant ne part pas vers l'élève.
    expect(html[0]).not.toContain(NOTE_PRIVEE);
    expect(html[0]).not.toContain('Cette copie n’a pas de niveau général');
    expect(suivi.erreurs, suivi.erreurs.join(' | ')).toEqual([]);
});

test('Porte #912 · parité : avec une copie (sans annotation), la synthèse est la même, mot pour mot', async ({ browser }) => {
    const lire = async (avecCopie) => {
        const page = await browser.newPage();
        const suivi = await monter(page, { avecCopie });
        const sortie = await dossierPdfDepuisLaListe(page, suivi);
        await page.close();
        return { ...sortie, dialogues: suivi.dialogues };
    };
    const sans = await lire(false);
    const avec = await lire(true);
    expect(avec.dialogues).toEqual([]);
    // Témoin : avec copie, rien ne change — le nom « dossier_ », la copie puis la synthèse.
    expect(avec.pdf).toEqual([{ nom: 'dossier_Léa_Gagnon_p912.pdf', pages: 2 }]);
    expect(sans.html[0]).toBe(avec.html[0]);
});

test('Porte #912 · #674 : une note qui ne porte pas sur toute la grille refuse de conclure, et l\'enseignant·e l\'apprend', async ({ page }) => {
    const suivi = await monter(page, { criteres: 'incomplets' });
    const { pdf, html } = await dossierPdfDepuisLaListe(page, suivi);
    await expect.poll(() => suivi.dialogues.length, { timeout: 10000 }).toBe(1);
    expect(pdf).toEqual([{ nom: 'synthese_Léa_Gagnon_p912.pdf', pages: 1 }]);
    expect(html[0]).toContain('Cette copie n’a pas de niveau général');
    // 21 oct. 2026 : le PDF porte U+00A0 ; lu par innerHTML, le navigateur le sérialise en « &nbsp; ».
    expect(html[0]).toContain('Structure (40&nbsp;%)');
    expect(suivi.dialogues[0]).toMatch(/^Le PDF a été exporté, mais la note de cette copie ne porte pas sur toute la grille/);
});

test('Porte #912 · trimestre archivé : le PDF se rend, et rien n\'est écrit dans ses évaluations', async ({ page }) => {
    const suivi = await monter(page, { archive: true });
    expect(await page.evaluate(() => document.body.classList.contains('mode-archive'))).toBe(true);
    const lireBase = () => page.evaluate((t) => JSON.stringify([window.db.getSync(t + '_evaluationsSauvegardees', []), window.db.getSync(t + '_fichiersTravaux', [])]), T);
    const avant = await lireBase();
    const { pdf } = await dossierPdfDepuisLaListe(page, suivi);
    expect(pdf).toEqual([{ nom: 'synthese_Léa_Gagnon_p912.pdf', pages: 1 }]);
    await page.evaluate(() => new Promise((r) => setTimeout(r, 2500)));   // le délai de l'auto-save (1,5 s)
    expect(await lireBase()).toBe(avant);
    expect(suivi.dialogues).toEqual([]);
});

test('Porte #912 · une évaluation SANS critère enregistré : ce que la page rend, figé tel quel', async ({ page }) => {
    // Sept évaluations de l'Automne 2025 de Grégoire sont dans ce cas. MESURÉ, non réparé dans ce lot (consigne §3.4) :
    // la page n'a pas de tableau de critères et affiche le niveau général enregistré ; la porte #674 ne joue pas
    // (`portee.commencee` est faux : aucun critère n'a de niveau). Si ce comportement change, cet essai le dira.
    const suivi = await monter(page, { criteres: 'aucun' });
    const { pdf, html } = await dossierPdfDepuisLaListe(page, suivi);
    expect(pdf).toEqual([{ nom: 'synthese_Léa_Gagnon_p912.pdf', pages: 1 }]);
    expect(html[0]).not.toContain('Rétroaction par critère');
    expect(html[0]).toContain('Niveau général');
    expect(html[0]).not.toContain('Cette copie n’a pas de niveau général');
    expect(aUneSectionAnnotations(html[0])).toBe(false);
    expect(suivi.dialogues).toEqual([]);
});

test('Porte #912 · ni copie ni évaluation : un dialogue le dit, aucun PDF', async ({ page }) => {
    // Le menu n'offre « Dossier PDF » que sur une ligne évaluée ; la fonction reste appelable d'ailleurs.
    const suivi = await monter(page);
    await page.evaluate((da) => window.travauxExportPDF.exporterDossierComplet(da, 'p-sans-evaluation'), DA);
    await expect.poll(() => suivi.dialogues.length, { timeout: 10000 }).toBe(1);
    expect(suivi.dialogues).toEqual(['Aucune copie ni évaluation enregistrée pour cet·te étudiant·e et cette production.']);
    expect(await page.evaluate(() => window._pdf912)).toEqual([]);
});

test('Porte #912 · la mise en image échoue : on ne remet pas une feuille blanche, un dialogue dit pourquoi', async ({ page }) => {
    const suivi = await monter(page);
    await page.evaluate(() => { window.html2canvas = () => Promise.reject(new Error('panne de banc')); });
    await dossierPdfDepuisLaListe(page, suivi);
    expect(suivi.dialogues).toEqual(['La rétroaction n\'a pas pu être exportée (échec de la mise en image : panne de banc).']);
    expect(await page.evaluate(() => window._pdf912)).toEqual([]);
});
