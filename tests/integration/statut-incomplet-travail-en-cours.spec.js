import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// STATUT « INCOMPLET ; TRAVAIL EN COURS » (consigne de Cowork du 25 oct. 2026, décisions de Grégoire).
//
// Grégoire évalue une copie inachevée : l'élève n'a pas eu le temps de finir, il lui donne un délai sans
// jeton. En mode Évaluer, il coche la case de la palette Paramètres. Ce qui doit tenir, et que ce banc
// mesure avec de vrais clics :
//   · les critères et la note disparaissent du formulaire ; l'évaluation s'enregistre avec le statut, sans note ;
//   · la note de l'élève est celle d'avant la copie ; l'indice C la compte comme remise ;
//   · « Verrouiller l'évaluation » est refusé, et la copie n'entre toujours pas dans la note ;
//   · le remplacement de la copie par un nouveau fichier garde le statut ;
//   · décochée, l'évaluation redevient ordinaire et entre dans la note une fois évaluée et verrouillée.
// Noms fictifs (règle 6).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 'tinc';
const ALPHA = '2009001', BRAVO = '2009002';   // 7 caractères : les moteurs de note écartent tout autre DA

async function monter(page) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.travauxUI && window.travauxStockage
        && typeof window.travauxUI.ouvrirFichier === 'function', null, { timeout: 30000 });
    await page.evaluate(({ png, T, ALPHA, BRAVO }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-inc';
        const crit = [
            { id: 'c1', nom: 'Structure', ponderation: 50, type: 'holistique' },
            { id: 'c2', nom: 'Contenu', ponderation: 50, type: 'holistique' }
        ];
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        const evaluee = (id, da, prod, niveau, note) => ({
            id, etudiantDA: da, productionId: prod, groupeCoursId: 'GCINC', coursId,
            grilleId: 'GINC', echelleId: 'EINC', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-10-15T08:00:00.000Z', noteFinale: note, niveauFinal: niveau, verrouillee: true, ponderationCouverte: 100,
            criteres: crit.map(c => ({ critereId: c.id, critereNom: c.nom, niveauSelectionne: niveau, ponderation: c.ponderation, retroaction: '' })),
            donneesAlgorithmiques: {}, retroactionFinale: '', retroactionReecrite: false, pointsAnalytiques: {}
        });
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GCINC', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'som-inc', actif: true }]);
        window.db.setSync(T + '_pratiquesConfigurables', [{
            id: 'som-inc', nom: 'sommative du banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' },
            configuration: { type: 'sommative', conditions_speciales: [] }
        }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: ALPHA, nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId, groupeCoursId: 'GCINC' },
            { da: BRAVO, nom: 'Fictif', prenom: 'Bravo', groupe: '01', coursId, groupeCoursId: 'GCINC' }
        ]);
        window.db.setSync(T + '_productions', [
            { id: 'p0', titre: 'Plan', type: 'travail', ponderation: 50, grilleId: 'GINC', echelleId: 'EINC', groupeCoursId: 'GCINC', dateEcheance: '2026-10-01' },
            { id: 'p1', titre: 'Analyse', type: 'travail', ponderation: 50, grilleId: 'GINC', echelleId: 'EINC', groupeCoursId: 'GCINC', dateEcheance: '2026-10-10' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'GINC', nom: 'Grille témoin', type: 'holistique', criteres: crit }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'EINC', nom: 'IDME', niveaux }]);
        // Alpha : le Plan évalué (65). Bravo : les deux productions évaluées — l'Analyse entre au dénominateur de C.
        window.db.setSync(T + '_evaluationsSauvegardees', [
            evaluee('EV_A_P0', ALPHA, 'p0', 'D', 65),
            evaluee('EV_B_P0', BRAVO, 'p0', 'M', 80),
            evaluee('EV_B_P1', BRAVO, 'p1', 'M', 80)
        ]);
        // La copie inachevée d'Alpha pour l'Analyse : importée, pas encore évaluée.
        window.db.setSync(T + '_fichiersTravaux', [{
            id: 'FT_A_P1', etudiantDA: ALPHA, productionId: 'p1', coursId, groupeCoursId: 'GCINC',
            nomFichier: 'FICTIF_2009001_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-10T12:00:00.000Z', dateModification: '2026-10-10T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GCINC' });
        window.db.setSync('groupeCoursActif', { id: 'GCINC', trimestreId: T });
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        window.__copiePng = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return /^FT_A_P1/.test(id) || !original ? window.__copiePng : original.apply(this, arguments); };
    }, { png: PNG, T, ALPHA, BRAVO });
    return erreurs;
}

// La copie d'Alpha pour l'Analyse, la note de son cours et sa complétion, lues par les fonctions de l'application.
const etat = (page) => page.evaluate(({ T, ALPHA }) => {
    const e = window.db.getSync(T + '_evaluationsSauvegardees', []).find(x => x.etudiantDA === ALPHA && x.productionId === 'p1' && !x.remplaceeParId) || null;
    // La note du cours, par la porte que lisent l'indice P et l'export (`simulerIndices`, comme le banc #921).
    const s = window.simulerIndices(ALPHA, 'som-inc') || {};
    const c = window.obtenirDetailsCompletion(ALPHA);
    return {
        copie: e ? { travailEnCours: e.travailEnCours === true, noteFinale: e.noteFinale, verrouillee: e.verrouillee } : null,
        note: (s.recit && s.recit.synthese) ? s.recit.synthese.noteFinale : null,
        completion: c ? c.remis + '/' + c.total : null
    };
}, { T, ALPHA });

async function ouvrirEnEvaluer(page, fichierId) {
    await page.evaluate(() => window.naviguerVers('evaluations', 'annoter'));
    await page.waitForFunction((id) => !!document.querySelector(`#evaluations-contenu-fichiers [data-fichier-id="${id}"]`), fichierId, { timeout: 10000 });
    await page.evaluate((id) => window.travauxUI.ouvrirFichier(id), fichierId);
    await page.waitForFunction((id) => (window.travauxVisionneuse.getFichierActuel() || {}).id === id, fichierId, { timeout: 10000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await page.waitForFunction((da) => window.evaluationEnCours && window.evaluationEnCours.etudiantDA === da, ALPHA, { timeout: 15000 });
    await page.waitForTimeout(1500);
    // Le rappel de sauvegarde (hors sujet ici) recouvre l'écran d'un banc neuf.
    await page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
}

// L'enregistrement automatique part 1,5 s après le geste.
const laisserEnregistrer = async (page) => {
    await page.waitForTimeout(2200);
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
};

const pastilleActive = (page) => page.evaluate(() => {
    const p = document.querySelector('.annot-badge.actif .travaux-badge-pill');
    return p ? p.textContent.trim() : null;
});

const sansBruit = (erreurs) => erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m));

test('statut incomplet · cocher : critères et note masqués, enregistrée sans note, hors de la note, remise pour C ; verrouiller refusé', async ({ page }) => {
    const erreurs = await monter(page);
    const avant = await etat(page);
    expect(avant.copie).toBeNull();
    expect(avant.note).toBeCloseTo(65, 1);         // la note d'Alpha : le Plan seul
    expect(avant.completion).toBe('1/2');          // l'Analyse, évaluée pour Bravo, lui manque

    await ouvrirEnEvaluer(page, 'FT_A_P1');
    await expect(page.locator('#listeCriteresGrille1')).toBeVisible();
    await expect(page.locator('#noteFinale1')).toBeVisible();

    // LE GESTE : un vrai clic sur la case.
    await page.locator('#travailEnCours').click();
    await expect(page.locator('#listeCriteresGrille1')).toBeHidden();
    await expect(page.locator('#noteFinale1')).toBeHidden();
    await expect(page.locator('#messageTravailEnCours')).toBeVisible();
    expect(await pastilleActive(page)).toBe('Incomplet');
    await laisserEnregistrer(page);

    const pose = await etat(page);
    expect(pose.copie).toEqual({ travailEnCours: true, noteFinale: null, verrouillee: false });
    expect(pose.note).toBeCloseTo(65, 1);          // la production n'entre pas dans la note
    expect(pose.completion).toBe('2/2');           // l'indice C la compte comme remise

    // « Verrouiller l'évaluation » : un vrai clic, refusé.
    await page.locator('#btnVerrouillerEvaluation').click();
    await page.waitForTimeout(800);
    const apresVerrou = await etat(page);
    expect(apresVerrou.copie).toEqual({ travailEnCours: true, noteFinale: null, verrouillee: false });
    expect(apresVerrou.note).toBeCloseTo(65, 1);

    // La Liste des évaluations : le badge, sur le modèle de « Soupçon à vérifier ».
    await page.evaluate(() => window.naviguerVers('evaluations', 'liste'));
    await page.waitForFunction((da) => !!document.querySelector(`#corps-tableau-evaluations tr[data-da="${da}"][data-production-id="p1"]`), ALPHA, { timeout: 10000 });
    const ligne = await page.evaluate((da) => {
        const tr = document.querySelector(`#corps-tableau-evaluations tr[data-da="${da}"][data-production-id="p1"]`);
        return { badge: (tr.querySelector('.badge-jeton-incomplet') || {}).textContent || null, statut: (tr.querySelector('.travaux-badge-pill') || {}).textContent || null };
    }, ALPHA);
    expect(ligne).toEqual({ badge: 'Incomplet ; travail en cours', statut: 'Incomplet' });

    // Le profil de l'élève : le libellé complet dans la colonne Note.
    const profil = await page.evaluate((da) => {
        window.afficherProfilComplet(da);
        const b = document.querySelector('#contenuProfilEtudiant .badge-jeton-incomplet');
        return b ? b.textContent.trim() : null;
    }, ALPHA);
    expect(profil).toBe('Incomplet ; travail en cours');

    // Le PDF de l'élève : ce que la page de synthèse recevrait pour cette copie (mesuré, pas supposé).
    const pdf = await page.evaluate(({ T, ALPHA }) => {
        const e = window.db.getSync(T + '_evaluationsSauvegardees', []).find(x => x.etudiantDA === ALPHA && x.productionId === 'p1');
        const f = window.db.getSync(T + '_fichiersTravaux', []).find(x => x.id === 'FT_A_P1');
        const fb = window.syntheseRetroactionData.construireFeedback(e, f, null);
        return { overall: fb.overall, codesCriteres: (fb.criteria || []).map(c => c.code || null) };
    }, { T, ALPHA });
    expect(pdf.overall.code).toBe('');
    expect(pdf.overall.note === undefined || pdf.overall.note === null).toBe(true);
    // Mesuré le 25 oct. : posée avant tout niveau, la copie n'a aucun critère en base — la synthèse n'en porte aucun.
    expect(pdf.codesCriteres).toEqual([]);
    expect(sansBruit(erreurs)).toEqual([]);
});

test('statut incomplet · remplacer la copie garde le statut ; décocher la rend ordinaire, et elle entre dans la note une fois évaluée et verrouillée', async ({ page }) => {
    const erreurs = await monter(page);
    await ouvrirEnEvaluer(page, 'FT_A_P1');
    await page.locator('#travailEnCours').click();
    await laisserEnregistrer(page);
    expect((await etat(page)).copie).toEqual({ travailEnCours: true, noteFinale: null, verrouillee: false });

    // LE REMPLACEMENT : ce que « Remplacer l'existant » écrit (travaux-ui.js, `traiterDoublonsImport`) — la
    // nouvelle copie de la même élève pour la même production, puis l'ancienne à la corbeille. ⚠ Le fichier est
    // posé dans la base plutôt qu'importé : `importerFichier` lève une erreur IndexedDB sous WebKit en file://.
    // Aucun des deux gestes ne touche aux évaluations : c'est ce que ce banc mesure.
    const remplacant = await page.evaluate(({ T }) => {
        const fichiers = window.db.getSync(T + '_fichiersTravaux', []);
        const ancien = fichiers.find(f => f.id === 'FT_A_P1');
        fichiers.push(Object.assign({}, ancien, { id: 'FT_A_P1_FINALE', nomFichier: 'FICTIF_2009001_Analyse_finale.png', dateImport: new Date().toISOString() }));
        window.db.setSync(T + '_fichiersTravaux', fichiers);
        window.travauxStockage.deplacerEnCorbeille('FT_A_P1');
        const apres = window.db.getSync(T + '_fichiersTravaux', []);
        return (apres.find(f => f.id === 'FT_A_P1_FINALE') && (apres.find(f => f.id === 'FT_A_P1') || {}).statut !== 'present') ? 'FT_A_P1_FINALE' : null;
    }, { T });
    expect(remplacant).toBeTruthy();
    expect((await etat(page)).copie).toEqual({ travailEnCours: true, noteFinale: null, verrouillee: false });

    // La nouvelle copie s'ouvre « Incomplet » : la case est cochée, les critères masqués.
    await ouvrirEnEvaluer(page, remplacant);
    await expect(page.locator('#travailEnCours')).toBeChecked();
    await expect(page.locator('#listeCriteresGrille1')).toBeHidden();
    expect(await pastilleActive(page)).toBe('Incomplet');

    // DÉCOCHER : un vrai clic. Les critères reviennent ; l'évaluation redevient ordinaire.
    await page.locator('#travailEnCours').click();
    await expect(page.locator('#listeCriteresGrille1')).toBeVisible();
    await expect(page.locator('#noteFinale1')).toBeVisible();
    await laisserEnregistrer(page);
    const decoche = await etat(page);
    expect(decoche.copie.travailEnCours).toBe(false);
    expect(decoche.note).toBeCloseTo(65, 1);       // pas encore évaluée : toujours hors de la note

    // Évaluer la copie terminée (M partout), puis verrouiller : elle entre dans la note.
    for (const id of ['eval_c1', 'eval_c2']) await page.locator('#' + id).selectOption('M');
    await laisserEnregistrer(page);
    await page.locator('#btnVerrouillerEvaluation').click();
    await page.waitForFunction(({ T, ALPHA }) => (window.db.getSync(T + '_evaluationsSauvegardees', [])
        .find(x => x.etudiantDA === ALPHA && x.productionId === 'p1' && !x.remplaceeParId) || {}).verrouillee === true, { T, ALPHA }, { timeout: 10000 });
    const final = await etat(page);
    expect(final.copie).toEqual({ travailEnCours: false, noteFinale: 80, verrouillee: true });
    expect(final.note).toBeCloseTo(72.5, 1);       // (65 + 80) / 2
    expect(sansBruit(erreurs)).toEqual([]);
});

// RETOUCHE (verdict de Cowork, 25 oct. 2026) : cochée APRÈS des niveaux, la case les laisse en base, masqués —
// mais le PDF de l'élève n'en montre aucun, exactement comme une copie cochée avant tout niveau. Et décochée, la
// pastille reprend l'état réel de la copie (« Annoté », « Évalué »), pas « Importé » d'office.
const pastille = (page) => page.evaluate(() => {
    const p = document.querySelector('.annot-badge.actif .travaux-badge-pill');
    return p ? { texte: p.textContent.trim(), origine: p.dataset.origTexte || null } : null;
});

test('statut incomplet · cochée après des niveaux : le PDF n\'en montre aucun ; décochée, la pastille reprend l\'état réel', async ({ page }) => {
    const erreurs = await monter(page);
    // La copie d'Alpha est annotée (un trait) : son état réel, avant toute évaluation, est « Annoté ».
    await page.evaluate(() => {
        window.db.setSync(window.cle('annotationsTravaux'), [{
            id: 'AN_A_P1', fichierId: 'FT_A_P1', pages: { 1: { strokes: [{ points: [{ x: 1, y: 1 }, { x: 2, y: 2 }] }] } }
        }]);
    });
    await ouvrirEnEvaluer(page, 'FT_A_P1');
    expect(await pastille(page)).toEqual({ texte: 'EN COURS', origine: 'Annoté' });

    // Cochée puis décochée avant tout niveau : « Annoté » revient, pas « Importé ».
    await page.locator('#travailEnCours').click();
    expect(await pastille(page)).toEqual({ texte: 'Incomplet', origine: 'Incomplet' });
    await laisserEnregistrer(page);
    await page.locator('#travailEnCours').click();
    expect(await pastille(page)).toEqual({ texte: 'EN COURS', origine: 'Annoté' });
    await laisserEnregistrer(page);

    // Des niveaux saisis (D partout), PUIS la case.
    for (const id of ['eval_c1', 'eval_c2']) await page.locator('#' + id).selectOption('D');
    await laisserEnregistrer(page);
    await page.locator('#travailEnCours').click();
    await laisserEnregistrer(page);

    const lu = await page.evaluate(({ T, ALPHA }) => {
        const evals = window.db.getSync(T + '_evaluationsSauvegardees', []);
        const e = evals.find(x => x.etudiantDA === ALPHA && x.productionId === 'p1');
        const f = window.db.getSync(T + '_fichiersTravaux', []).find(x => x.id === 'FT_A_P1');
        const a = window.travauxStockage.obtenirAnnotationFichier('FT_A_P1');
        const fb = window.syntheseRetroactionData.construireFeedback(e, f, a);
        // La même copie cochée AVANT tout niveau : sans critère en base (mesuré au premier test).
        const avant = window.syntheseRetroactionData.construireFeedback(Object.assign({}, e, { criteres: [] }), f, a);
        // L'historique d'une copie SUIVANTE d'Alpha : le brouillon y passe sans ses niveaux.
        const hist = window.syntheseRetroactionData.historiqueAnterieur(evals, { da: ALPHA, idCopie: 'COPIE_SUIVANTE', date: '2099-01-01' });
        return {
            enBase: { travailEnCours: e.travailEnCours === true, noteFinale: e.noteFinale, niveaux: (e.criteres || []).map(c => c.niveauSelectionne) },
            criteres: fb.criteria.length,
            overall: fb.overall.code,
            identique: JSON.stringify(fb) === JSON.stringify(avant),
            brouillonDansHistorique: (hist.find(x => x.id === e.id) || {}).criteres
        };
    }, { T, ALPHA });
    // Rien n'est vidé en base : les niveaux restent, masqués (réversible).
    expect(lu.enBase).toEqual({ travailEnCours: true, noteFinale: null, niveaux: ['D', 'D'] });
    // Le PDF : ni critère, ni niveau — exactement la copie cochée avant tout niveau.
    expect(lu.criteres).toBe(0);
    expect(lu.overall).toBe('');
    expect(lu.identique).toBe(true);
    expect(lu.brouillonDansHistorique).toEqual([]);

    // Décochée : les niveaux reviennent à l'écran, et la pastille dit l'état réel — « Évalué ».
    await page.locator('#travailEnCours').click();
    await expect(page.locator('#listeCriteresGrille1')).toBeVisible();
    expect(await pastille(page)).toEqual({ texte: 'ÉVALUÉ', origine: 'Évalué' });
    await laisserEnregistrer(page);
    expect(sansBruit(erreurs)).toEqual([]);
});
