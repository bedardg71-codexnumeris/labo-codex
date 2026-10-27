import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// #1173 — UNE COPIE VERROUILLÉE AFFICHE LA NOTE REMISE (27 oct. 2026), dans un vrai WebKit, contre le vrai index.html.
// Consigne `plans de travail/CONSIGNE-LOT-2026-10-27-note-remise-copie-verrouillee.md`, § 5 ; décision de Grégoire du
// 27 oct. à 7 h 28. Une grille employée, une copie verrouillée à 70 :
//   · CALCUL : la pénalité fixe (1 point par erreur) remplace la proportionnelle par le geste de l'atelier (70 → 85) ;
//   · PONDÉRATION : deux critères holistiques, 50/50 deviennent 30/70 (70 → 74) — écrite en base, comme l'éditeur ;
//   · RIEN DE CHANGÉ : aucune ligne.
// Ouverte par les deux chemins (« Modifier » de la liste ; l'élève et la production choisis, celui de la copie) : l'écran
// montre 70 et la ligne avec la nouvelle note ; le stockage est identique avant et après ; le PDF de l'élève est construit
// sur la note remise. Déverrouillée : l'écran passe à la nouvelle note, rien ne s'écrit ; au premier geste, elle s'écrit.
// 1 440 et 820 px ; captures sur demande (CAPTURES_NOTE_REMISE=<dossier>), clair et sombre.
//
// BREAK-TEST (fait le 27 oct. 2026, restauré) : `evaluationRemiseAffichee` rendue toujours nulle (le comportement d'avant)
// → les quatre essais à changement rougissent sur « l'écran montre 70 », les deux de largeur sur « la ligne se voit » ;
// les deux « rien de changé » restent verts.
// ⚠ LA FIXTURE : 15 erreurs pour 250 mots. Pour 500 mots, la pénalité proportionnelle donne déjà 85, pas 70 (mesuré par
// « rien de changé », le 27 oct.) : une note enregistrée que le calcul de la grille ne redonne pas.

const T = 't1173';
const NB = ' ';
const PHRASE_ENREGISTREE = 'PHRASE ENREGISTRÉE 1173 : 15 erreurs pour 250 mots.';

const MONTER = `({ T, sorte }) => {
    const coursId = 'cours-1173';
    const niveaux = [{ code: 'I', nom: 'Incomplet', min: 0, max: 59, valeurCalcul: 40 }, { code: 'D', nom: 'en Développement', min: 60, max: 74, valeurCalcul: 60 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }];
    const algo = sorte === 'calcul';
    // security-ok: fixtures littérales du banc, aucune source externe.
    window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
    window.db.setSync('cours', [{ id: coursId, codeCours: 'FIC101', titre: 'Cours fictif' }]);
    window.db.setSync(T + '_groupesCours', [{ id: 'GC1173', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
    window.db.setSync(T + '_groupeEtudiants', [{ da: 'DA1173', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC1173' }]);
    window.db.setSync(T + '_productions', [{ id: 'P1173', titre: 'Rédaction fictive', type: 'travail', ponderation: 60, grilleId: 'G1173', echelleId: 'E1173', cartoucheId: 'CT1173', groupeCoursId: 'GC1173' }]);
    const criteres = algo
        ? [{ id: 'c2', nom: 'Langue écrite', ponderation: 100, type: 'algorithmique', modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 }, facteurNormalisation: 500 }]
        : [{ id: 'c1', nom: 'Analyse', ponderation: 50 }, { id: 'c2', nom: 'Structure', ponderation: 50 }];
    const commentaires = {};
    criteres.forEach((c) => ['I', 'D', 'M', 'E'].forEach((n) => { commentaires[c.id + '_' + n] = 'CARTOUCHE ' + c.id + '_' + n; }));
    window.db.setSync(T + '_cartouches_G1173', [{ id: 'CT1173', nom: 'Cartouche témoin', grilleId: 'G1173', contexte: '', criteres: criteres.map((c) => ({ id: c.id, nom: c.nom })), commentaires }]);
    window.db.setSync(T + '_grillesTemplates', [{ id: 'G1173', nom: 'Grille témoin', criteres }]);
    window.db.setSync(T + '_echellesTemplates', [{ id: 'E1173', nom: 'IDME', niveaux }]);
    window.db.setSync(T + '_evaluationsSauvegardees', [{
        id: 'EV1173', etudiantDA: 'DA1173', productionId: 'P1173', groupeCoursId: 'GC1173', grilleId: 'G1173', echelleId: 'E1173', cartoucheId: 'CT1173',
        statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-10-20T08:00:00.000Z', noteFinale: 70, niveauFinal: 'D', verrouillee: true,
        ponderationCouverte: 100,
        criteres: algo
            ? [{ critereId: 'c2', critereNom: 'Langue écrite', niveauSelectionne: 'D', ponderation: 100, retroaction: '${PHRASE_ENREGISTREE}' }]
            : [{ critereId: 'c1', critereNom: 'Analyse', niveauSelectionne: 'D', ponderation: 50, retroaction: '' },
               { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'M', ponderation: 50, retroaction: '' }],
        donneesAlgorithmiques: algo ? { c2: { erreurs: 15, mots: 250, noteCalculee: 70, pourcentage: 70, niveau: 'D', retroaction: '${PHRASE_ENREGISTREE}' } } : {},
        retroactionFinale: 'Rétroaction remise.', retroactionReecrite: true }]);
    window.trimestreActif = T;
    window.db.setSync('trimestreActif', T);
    window.db.setSync('infoCours', { id: coursId, codeCours: 'FIC101', groupe: '01', _groupeCoursId: 'GC1173' });
    window.db.setSync('groupeCoursActif', { id: 'GC1173', trimestreId: T });
    // Les deux enveloppes d'observation du PDF (patron du banc #912) : rien ne se télécharge, on garde ce que l'élève lirait.
    window._pdf1173 = [];
    window._feedback1173 = [];
    window.jspdf.jsPDF.API.save = function (nom) { window._pdf1173.push(nom); return this; };
    const construire = window.syntheseRetroactionData.construireFeedback;
    window.syntheseRetroactionData.construireFeedback = function (evaluation) {
        const f = construire.apply(this, arguments);
        window._feedback1173.push({ noteFinale: evaluation.noteFinale, niveauFinal: evaluation.niveauFinal, criteres: JSON.stringify(f && f.criteria) });
        return f;
    };
}`;

const enBase = (page, t) => page.evaluate((t) => JSON.stringify(window.db.getSync(t + '_evaluationsSauvegardees', [])), t || T);
const ecran = (page) => page.evaluate(() => {
    const t = (id) => { const el = document.getElementById(id); return el ? el.textContent : null; };
    const ligne = document.getElementById('noteRemise1');
    const formule = document.getElementById('formule_algo_c2');
    return {
        note: t('noteProduction1'), niveau: t('niveauProduction1'),
        ligne: ligne && !ligne.classList.contains('u-hide') ? ligne.textContent : '',
        noteAlgo: t('note_algo_c2'), pctAlgo: t('pct_algo_c2'), niveauAlgo: t('niveau_algo_c2'), phrase: t('comm_c2'),
        formule: formule && !formule.classList.contains('u-hide') ? formule.textContent : '',
        courante: window.noteCalculeeCourante
    };
});

async function monter(page, sorte, largeur, trimestre) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => { erreurs.push('DIALOGUE : ' + d.message()); d.dismiss().catch(() => {}); });
    await page.setViewportSize({ width: largeur || 1440, height: largeur === 820 ? 1180 : 900 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.modifierEvaluation === 'function' && window.formulesAlgo
        && window.syntheseRetroactionData && window.travauxExportPDF && window.jspdf, null, { timeout: 20000 });
    await page.evaluate('(' + MONTER + ')(' + JSON.stringify({ T: trimestre || T, sorte }) + ')');
    return erreurs;
}

/** Le changement qui fait qu'une autre note se calculerait aujourd'hui. */
async function changer(page, sorte) {
    if (sorte === 'calcul') {
        await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-grille-criteres'); });
        await page.evaluate(() => window.chargerGrillePourModif('G1173'));
        await page.locator('#listeCriteres .calc-carte input[value="penalite_par_erreur"]').evaluate((el) => el.click());
        await expect.poll(() => page.evaluate((t) => window.db.getSync(t + '_grillesTemplates', [])[0].criteres[0].modeleFormule, T)).toBe('penalite_par_erreur');
    } else if (sorte === 'ponderation') {
        await page.evaluate((t) => {
            const grilles = window.db.getSync(t + '_grillesTemplates', []);
            grilles[0].criteres[0].ponderation = 30;
            grilles[0].criteres[1].ponderation = 70;
            window.db.setSync(t + '_grillesTemplates', grilles);
        }, T);
    }
}

async function attendreRepos(page) {
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV1173', null, { timeout: 15000 });
    await page.waitForTimeout(3500);   // les recalculs différés des deux chargeurs (100, 200, 350 ms et plus) sont passés
    await page.waitForFunction(() => !window._timerAutoSave && !window._modifierEvaluationEnCours && window._autoSaveSuspendu !== true, null, { timeout: 10000 });
}

async function ouvrir(page, chemin) {
    await page.evaluate(() => { window.afficherSection('evaluations'); });
    if (chemin === 'liste') {
        await page.evaluate(() => window.modifierEvaluation('EV1173'));
    } else {
        // Le chemin de la copie (banc #959) : l'élève, puis la production choisis au formulaire.
        await page.evaluate(() => {
            window.afficherSousSection('evaluations-annoter');
            window.chargerListeEtudiantsEval();
            window.chargerProductionsDansSelect();
            window.chargerGrillesDansSelect();
            window.chargerEchellePerformance();
            window.demarrerEvaluationDepuisFichier({ id: 'F1173', etudiantDA: 'DA1173', productionId: 'P1173', nomFichier: 'copie.pdf' });
            const selE = document.getElementById('selectEtudiantEval');
            selE.value = 'DA1173';
            window.chargerEvaluationsEtudiant();
            const selP = document.getElementById('selectProduction1');
            selP.value = 'P1173';
            selP.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }
    await attendreRepos(page);
}

const LIGNE = (actuelle) => 'Note remise : 70' + NB + '%. Avec le calcul actuel de la grille, elle serait de ' + actuelle
    + NB + '%. Déverrouille l\'évaluation pour l\'appliquer.';

for (const [sorte, actuelle] of [['calcul', '85'], ['ponderation', '74']]) {
    for (const chemin of ['liste', 'copie']) {
        test(`${sorte} changé · ouverte par ${chemin === 'liste' ? '« Modifier »' : 'l’élève et la production'} : 70 et la ligne ; rien ne s’écrit ; le PDF ; déverrouillée, ${actuelle}`, async ({ page }) => {
            test.setTimeout(120000);
            const erreurs = await monter(page, sorte);
            await changer(page, sorte);
            const avant = await enBase(page);

            await ouvrir(page, chemin);
            const vu = await ecran(page);
            // eslint-disable-next-line no-console
            console.log(`1173 · ${sorte} · ${chemin} · verrouillée :`, JSON.stringify(vu));
            expect(vu.note, 'la note remise').toBe('70' + NB + '%');
            expect(vu.niveau).toBe('D');
            expect(vu.ligne).toBe(LIGNE(actuelle));
            expect(vu.courante, 'la note actuelle n’entre pas dans noteCalculeeCourante').toBe(70);
            if (sorte === 'calcul') {
                expect([vu.noteAlgo, vu.pctAlgo, vu.niveauAlgo]).toEqual(['70,00', '70,0', 'D']);
                expect(vu.phrase, 'la phrase enregistrée').toBe(PHRASE_ENREGISTREE);
                expect(vu.formule, 'la ligne chiffrée décrirait un calcul qui n’a pas produit 70').toBe('');
            }
            expect(await enBase(page), 'ouvrir une copie verrouillée n’écrit rien').toBe(avant);

            // Le PDF de l'élève : il lit la base, pas l'écran (mesuré : `trouverEvaluationPourSynthese`).
            await page.evaluate(() => window.travauxExportPDF.exporterDossierComplet('DA1173', 'P1173'));
            await expect.poll(() => page.evaluate(() => window._pdf1173.length)).toBe(1);
            const pdf = await page.evaluate(() => window._feedback1173[window._feedback1173.length - 1]);
            expect([pdf.noteFinale, pdf.niveauFinal]).toEqual([70, 'D']);
            if (sorte === 'calcul') expect(pdf.criteres).toContain(PHRASE_ENREGISTREE);
            expect(await enBase(page), 'le PDF n’écrit rien').toBe(avant);

            // Déverrouiller : l'écran passe au calcul actuel ; rien ne s'écrit avant un geste.
            await page.evaluate(() => window.basculerVerrouillageEvaluationCourante());
            await page.waitForTimeout(2500);
            const ouvert = await ecran(page);
            // eslint-disable-next-line no-console
            console.log(`1173 · ${sorte} · ${chemin} · déverrouillée :`, JSON.stringify(ouvert));
            expect(ouvert.note).toBe(actuelle + NB + '%');
            expect(ouvert.ligne, 'déverrouillée : aucune ligne').toBe('');
            if (sorte === 'calcul') {
                expect(ouvert.noteAlgo).toBe('85,00');
                expect(ouvert.formule).toBe('Note = 100 − 15 × 1 = 85 / 100');
            }
            const deverrouillee = JSON.parse(await enBase(page))[0];
            const attendu = JSON.parse(avant)[0];
            attendu.verrouillee = false;
            expect(deverrouillee, 'seul le verrou a bougé').toEqual(attendu);

            // Au premier geste, elle s'enregistre au calcul actuel.
            await page.evaluate(() => window._debouncerAutoSave());
            await page.waitForTimeout(2500);
            const apresGeste = JSON.parse(await enBase(page))[0];
            expect(apresGeste.noteFinale).toBe(Number(actuelle));
            if (sorte === 'calcul') expect(apresGeste.donneesAlgorithmiques.c2).toMatchObject({ noteCalculee: 85, pourcentage: 85 });
            expect(erreurs).toEqual([]);
        });
    }
}

for (const largeur of [1440, 820]) {
    test(`rien de changé · ${largeur} px : 70, aucune ligne, la ligne chiffrée reste ; aucun défilement de côté`, async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await monter(page, 'calcul', largeur);
        const avant = await enBase(page);
        await ouvrir(page, 'liste');
        const vu = await ecran(page);
        expect(vu.note).toBe('70' + NB + '%');
        expect(vu.ligne).toBe('');
        expect(vu.formule, 'le calcul actuel redonne 70 : sa ligne chiffrée est vraie').not.toBe('');
        expect(await enBase(page)).toBe(avant);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
        expect(erreurs).toEqual([]);
    });

    test(`calcul changé · ${largeur} px : la ligne tient dans l’encadré de la note`, async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await monter(page, 'calcul', largeur);
        await changer(page, 'calcul');
        await ouvrir(page, 'liste');
        const boites = await page.evaluate(() => {
            const b = document.getElementById('noteFinale1').getBoundingClientRect();
            const l = document.getElementById('noteRemise1').getBoundingClientRect();
            return { boite: [b.left, b.right], ligne: [l.left, l.right, l.height] };
        });
        expect(boites.ligne[2], 'la ligne se voit').toBeGreaterThan(0);
        expect(boites.ligne[0]).toBeGreaterThanOrEqual(boites.boite[0]);
        expect(boites.ligne[1]).toBeLessThanOrEqual(boites.boite[1]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
        expect(erreurs).toEqual([]);
    });
}

test('H2026 · calcul changé : la note remise, et aucune ligne — ces notes ne sont pas rouvertes', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await monter(page, 'calcul', 1440, 'h2026');
    await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-grille-criteres'); });
    await page.evaluate(() => window.chargerGrillePourModif('G1173'));
    await page.locator('#listeCriteres .calc-carte input[value="penalite_par_erreur"]').evaluate((el) => el.click());
    await expect.poll(() => page.evaluate(() => window.db.getSync('h2026_grillesTemplates', [])[0].criteres[0].modeleFormule)).toBe('penalite_par_erreur');
    const avant = await enBase(page, 'h2026');
    await ouvrir(page, 'liste');
    const vu = await ecran(page);
    expect(vu.note).toBe('70' + NB + '%');
    expect(vu.ligne).toBe('');
    expect(await enBase(page, 'h2026')).toBe(avant);
    expect(erreurs).toEqual([]);
});

test('captures · la copie verrouillée avec sa ligne, 1 440 et 820 px, clair et sombre', async ({ page }) => {
    test.skip(!process.env.CAPTURES_NOTE_REMISE, 'captures sur demande : CAPTURES_NOTE_REMISE=<dossier>');
    test.setTimeout(300000);
    for (const largeur of [1440, 820]) {
        for (const mode of ['clair', 'sombre']) {
            await monter(page, 'calcul', largeur);
            await changer(page, 'calcul');
            await ouvrir(page, 'liste');
            await page.evaluate((m) => document.body.classList.toggle('mode-clair', m === 'clair'), mode);
            // Ce qui couvrirait l'encadré : le rappel du codex et les notifications (étrangers au lot).
            await page.evaluate(() => document.querySelectorAll('.modal-overlay.actif, [class*="notification"], [class*="toast"]').forEach((el) => el.remove()));
            await page.evaluate(() => { document.getElementById('noteFinale1').scrollIntoView({ block: 'center' }); });
            await page.waitForTimeout(400);
            await page.screenshot({ path: path.join(process.env.CAPTURES_NOTE_REMISE, `note-remise-${largeur}-${mode}.png`) });
        }
    }
});
