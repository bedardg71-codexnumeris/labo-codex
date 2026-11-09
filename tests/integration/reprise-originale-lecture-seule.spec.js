import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT « LA REPRISE NE REÇOIT PLUS LES NIVEAUX TOUCHÉS SUR SON ORIGINALE » (consigne du 9 nov. 2026, décidée avec Grégoire).
//
// AVANT : l'enregistrement automatique (`_autoSauvegarderCriteres`) cherchait l'évaluation à écrire par élève +
// production, non remplacée — l'évaluation EN VIGUEUR, pas celle qui est OUVERTE. Une originale remplacée, non
// verrouillée en base, ouverte (« Consulter » dans la Liste) : un niveau touché s'écrivait sur sa reprise.
// MAINTENANT :
//   · toute écriture du formulaire va à l'évaluation ouverte, par son id ;
//   · une originale remplacée s'ouvre en lecture seule, comme une copie verrouillée, même non verrouillée en base
//     (décision de Grégoire) ; rien n'est écrit dans ses données pour ça ;
//   · « Déverrouiller » la rend modifiable exprès : ce qu'on y change s'écrit sur ELLE.
// Noms fictifs.

const T = 'trol';

async function monter(page, { originaleVerrouillee = false } = {}) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage
        && typeof window.modifierEvaluation === 'function' && typeof window.basculerVerrouillageEvaluationCourante === 'function');
    await page.evaluate(({ T, originaleVerrouillee }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-rol';
        const crit = [{ id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' }, { id: 'c2', nom: 'Structure', ponderation: 40, type: 'holistique' }];
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        const commentaires = {};
        ['I', 'D', 'M', 'E'].forEach((n) => { commentaires['c1_' + n] = 'CARTOUCHE c1_' + n; commentaires['c2_' + n] = 'CARTOUCHE c2_' + n; });
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GCROL', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: 'TESTROL', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GCROL' }]);
        window.db.setSync(T + '_productions', [
            { id: 'prol', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'GROL', echelleId: 'EROL', cartoucheId: 'CTROL', groupeCoursId: 'GCROL' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'GROL', nom: 'Grille témoin', type: 'holistique', criteres: crit }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'EROL', nom: 'IDME', niveaux }]);
        window.db.setSync(T + '_cartouches_GROL', [
            { id: 'CTROL', nom: 'Cartouche témoin', grilleId: 'GROL', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }], commentaires }
        ]);
        const evaluation = (id, c1, c2, note, niveau) => ({
            id, etudiantDA: 'TESTROL', etudiantNom: 'Élève Fictif', productionId: 'prol', productionNom: 'Analyse', groupeCoursId: 'GCROL', coursId,
            grilleId: 'GROL', echelleId: 'EROL', cartoucheId: 'CTROL', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-11-05T08:00:00.000Z', noteFinale: note, niveauFinal: niveau,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: c1, ponderation: 60, retroaction: 'CARTOUCHE c1_' + c1 },
                { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: c2, ponderation: 40, retroaction: 'CARTOUCHE c2_' + c2 }
            ],
            retroactionFinale: 'Rétroaction générée témoin.', retroactionReecrite: false
        });
        // L'originale (I, D) remplacée par sa reprise (M, M), NON verrouillée : la fenêtre où la reprise attend
        // d'être réévaluée. L'originale, verrouillée ou non selon le cas.
        window.db.setSync(T + '_evaluationsSauvegardees', [
            Object.assign(evaluation('EVO', 'I', 'D', 50, 'I'), { remplaceeParId: 'EVR', verrouillee: originaleVerrouillee }),
            Object.assign(evaluation('EVR', 'M', 'M', 80, 'M'), { repriseDeId: 'EVO', jetonRepriseApplique: true, verrouillee: false })
        ]);
        window.db.setSync(T + '_fichiersTravaux', []);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GCROL' });
        window.db.setSync('groupeCoursActif', { id: 'GCROL', trimestreId: T });
    }, { T, originaleVerrouillee });
    return erreurs;
}

const enBase = (page, id) => page.evaluate(({ T, id }) => {
    const e = window.db.getSync(T + '_evaluationsSauvegardees', []).find((x) => x.id === id);
    return e && { niveaux: e.criteres.map((c) => c.niveauSelectionne).join(','), verrouillee: e.verrouillee, note: e.noteFinale, journal: (e.journal || []).length };
}, { T, id });

/** « Consulter » dans la Liste : `modifierEvaluation` sur l'id de la ligne (sans copie, le formulaire seul). */
async function ouvrir(page, id) {
    await page.evaluate((id) => window.modifierEvaluation(id), id);
    await page.waitForFunction((id) => window.evaluationEnCours && window.evaluationEnCours.idModification === id, id, { timeout: 15000 });
    await attendreRepos(page, { horizon: 3000 });
    await page.waitForFunction(() => !window._timerAutoSave && !window._modifierEvaluationEnCours, null, { timeout: 10000 });
}

/** Un niveau touché : l'événement que reçoit le menu du critère, qu'il soit actif ou non (on éprouve aussi l'écrivain). */
async function toucherNiveau(page, critere, niveau) {
    await page.evaluate(({ critere, niveau }) => {
        const s = document.getElementById('eval_' + critere);
        s.value = niveau;
        s.dispatchEvent(new Event('change', { bubbles: true }));
    }, { critere, niveau });
    await page.waitForFunction(() => !!window._pendingAutoSaveSnapshot || !!window._timerAutoSave, null, { timeout: 5000 }).catch(() => {});
    await page.waitForFunction(() => !window._timerAutoSave && !window._pendingAutoSaveSnapshot, null, { timeout: 10000 });
    await attendreRepos(page, { horizon: 2000 });
}

const etatFormulaire = (page) => page.evaluate(() => ({
    critereDesactive: document.getElementById('eval_c2').disabled,
    motDesactive: document.getElementById('motPourEtudiant1').disabled,
    bouton: (document.getElementById('btnVerrouillerEvaluation') || {}).textContent
}));
const sansBruit = (erreurs) => erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m));

test('Reprise · l\'originale remplacée (non verrouillée) ouverte, un niveau touché : la reprise est intacte, rien n\'est écrit', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await monter(page);
    await ouvrir(page, 'EVO');
    await toucherNiveau(page, 'c2', 'E');
    expect(await enBase(page, 'EVR'), 'la reprise n\'a pas reçu le niveau de l\'originale').toEqual({ niveaux: 'M,M', verrouillee: false, note: 80, journal: 0 });
    expect(await enBase(page, 'EVO'), 'l\'originale, en lecture seule, n\'est pas écrite non plus').toEqual({ niveaux: 'I,D', verrouillee: false, note: 50, journal: 0 });
    expect(sansBruit(erreurs)).toEqual([]);
});

test('Reprise · l\'originale remplacée s\'ouvre en lecture seule, comme une copie verrouillée ; rien n\'est écrit à l\'ouverture', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page);
    await ouvrir(page, 'EVO');
    expect(await etatFormulaire(page)).toEqual({ critereDesactive: true, motDesactive: true, bouton: 'Déverrouiller' });
    expect((await enBase(page, 'EVO')).verrouillee, 'la lecture seule se décide à l\'ouverture : rien d\'écrit').toBe(false);

    // La reprise, elle, s'ouvre comme avant : modifiable.
    await ouvrir(page, 'EVR');
    expect(await etatFormulaire(page)).toEqual({ critereDesactive: false, motDesactive: false, bouton: 'Verrouiller' });
});

for (const originaleVerrouillee of [false, true]) {
    test(`Reprise · « Déverrouiller » l'originale (${originaleVerrouillee ? 'verrouillée' : 'non verrouillée'} en base) : le niveau touché s'écrit sur ELLE, la reprise est intacte`, async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await monter(page, { originaleVerrouillee });
        await ouvrir(page, 'EVO');
        await page.evaluate(() => window.basculerVerrouillageEvaluationCourante());
        await page.waitForFunction(() => !document.getElementById('eval_c2').disabled, null, { timeout: 5000 });
        expect(await etatFormulaire(page)).toEqual({ critereDesactive: false, motDesactive: false, bouton: 'Verrouiller' });
        expect((await enBase(page, 'EVO')).verrouillee, 'déverrouillée exprès : c\'est écrit sur elle').toBe(false);

        await toucherNiveau(page, 'c2', 'E');
        expect((await enBase(page, 'EVO')).niveaux, 'le niveau va sur l\'originale').toBe('I,E');
        expect(await enBase(page, 'EVR'), 'la reprise n\'a rien reçu').toEqual({ niveaux: 'M,M', verrouillee: false, note: 80, journal: 0 });

        // « Verrouiller » : l'enregistrement explicite, sur elle aussi, avec la trace de la modification après reprise.
        await page.evaluate(() => window.basculerVerrouillageEvaluationCourante());
        await expect.poll(async () => (await enBase(page, 'EVO')).verrouillee, { timeout: 10000 }).toBe(true);
        const apres = await enBase(page, 'EVO');
        expect(apres.niveaux).toBe('I,E');
        expect(apres.journal, 'la modification après reprise est journalisée').toBeGreaterThan(0);
        expect(await enBase(page, 'EVR'), 'la reprise n\'a toujours rien reçu').toEqual({ niveaux: 'M,M', verrouillee: false, note: 80, journal: 0 });
        expect(sansBruit(erreurs)).toEqual([]);
    });
}
