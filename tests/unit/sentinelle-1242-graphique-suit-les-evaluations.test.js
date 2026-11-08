/**
 * #1242 (8 nov. 2026, décision de Grégoire : « c'est toujours l'échéance du travail ») — LE GRAPHIQUE
 * SUIT AUSSI LES ÉVALUATIONS.
 *
 * Avant : enregistrer une évaluation changeait C et P sans refaire aucune capture ; le graphique du Suivi
 * du groupe gardait les anciens C et P jusqu'à « Recalculer les captures ».
 * La règle : une écriture des évaluations (par `sauvegarderDonneesSelonMode`, modes.js, le point commun des
 * gestes) refait les captures déjà prises à partir de l'échéance effective la plus ancienne des évaluations
 * changées, ajoutées ou retirées ; celles d'avant ne bougent pas, et une évaluation ne crée pas de capture.
 * Ce qui a changé se lit par l'empreinte de chaque évaluation (prise au démarrage, puis à chaque écriture) :
 * beaucoup de gestes modifient en place le tableau lu avant de l'écrire.
 *
 * Modules RÉELS : `modes.js`, `indices.js`, `saisie-presences.js` (pour prendre les captures par les présences,
 * comme dans l'app), `snapshots.js`. Le banc charge `modes.js` dans un window à part (bac-suivi) : le crochet
 * vers les captures y est relié à la main (`branche`). Noms fictifs.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, elementDom, clone, RACINE } from './_helpers/bac-suivi.js';

const AUJOURDHUI = '2026-09-06';
const DAS = ['2000001', '2000002', '2000003'];
const ALICE = '2000001';
const S0 = '2026-08-20', S1 = '2026-08-25', S2 = '2026-08-27', S3 = '2026-09-01', S4 = '2026-09-03';   // S2 : séance jamais saisie
const SEMAINES = { [S0]: 1, [S1]: 2, [S2]: 2, [S3]: 3, [S4]: 3 };
const JOURS = { [S0]: 'Jeudi', [S1]: 'Mardi', [S2]: 'Jeudi', [S3]: 'Mardi', [S4]: 'Jeudi' };
const PRODUCTIONS = [
    { id: 'P1', titre: 'Analyse fictive', type: 'travail', dateEcheance: S1 },        // due le mardi S1
    { id: 'P2', titre: 'Dissertation fictive', type: 'travail', dateEcheance: '2026-10-01' },   // pas encore due
    { id: 'P3', titre: 'Fiche fictive', type: 'travail', dateEcheance: S2 }   // due un jour de cours jamais saisi
];

function storeTrimestre() {
    const store = storeBase();
    store.test_productions = clone(PRODUCTIONS);
    store.test_calendrierComplet = {};
    store.test_seancesCompletes = {};
    for (const d of Object.keys(SEMAINES)) {
        store.test_calendrierComplet[d] = { statut: 'cours', numeroSemaine: SEMAINES[d], jourSemaine: JOURS[d] };
        store.test_seancesCompletes[d] = [{ id: 'S-' + d, date: d, nombrePeriodes: 2, numeroSemaine: SEMAINES[d], jour: JOURS[d] }];
    }
    store.test_horaire = [{ jour: 'Mardi', nombrePeriodes: 2, heureDebut: '08:00', heureFin: '09:40' }, { jour: 'Jeudi', nombrePeriodes: 2, heureDebut: '08:00', heureFin: '09:40' }];
    return store;
}

function monterBanc() {
    const elements = { 'date-cours': elementDom({ value: S0 }), selectGroupePresences: elementDom({ value: '' }), selectTriPresences: elementDom({ value: 'nom' }) };
    const periodes = [], notes = [];
    for (const da of DAS) {
        elements['periodes_' + da] = elementDom({ id: 'periodes_' + da, value: '2', dataset: { da, dateStr: S0, nbPeriodes: '2' } });
        elements['notes_' + da] = elementDom({ id: 'notes_' + da, value: '', dataset: { da, dateStr: S0 } });
        periodes.push(elements['periodes_' + da]); notes.push(elements['notes_' + da]);
    }
    const store = storeTrimestre();
    const b = monter(store, {
        aujourdhui: AUJOURDHUI,
        modules: ['js/indices.js', 'js/saisie-presences.js', 'js/snapshots.js'],
        elements, selecteurs: { '.input-periodes': periodes, '.input-notes': notes },
        globaux: {
            obtenirInfosJour: (d) => (store.test_calendrierComplet[d] || null), obtenirSeancesJour: (d) => (store.test_seancesCompletes[d] || []),
            obtenirRangSeanceDansSemaine: () => 1, pluriel: (n, s) => s, genererCalendrierComplet() {}, cleSeancesCompletes: () => 'test_seancesCompletes', DUREE_PERIODE_DEFAUT: 50,
            obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
            uiDialogues: { confirmerAction: async () => false }
        }
    });
    b.winModes.signalerEvaluationsEcrites = b.win.signalerEvaluationsEcrites;   // branche : un seul window dans l'app
    return b;
}

/** Laisse finir ce qui suit une écriture : le départ des captures (minuterie virtuelle du banc), puis la chaîne. */
const laisserFinir = async (b) => { if (b) b.avancer(1); for (let i = 0; i < 2; i++) await new Promise((r) => setImmediate(r)); };

async function saisirPresences(b, date) {
    b.elements['date-cours'].value = date;
    for (const da of DAS) { b.elements['periodes_' + da].dataset.dateStr = date; b.elements['periodes_' + da].value = '2'; b.elements['notes_' + da].dataset.dateStr = date; }
    for (const da of DAS) b.win.notePresenceModifiee({ dataset: { da, dateStr: date } });
    b.avancer(2000);
    await laisserFinir(b);
}

const captures = (b) => ((b.store[b.win.cleSnapshots()] || {}).hebdomadaires || []);
const capture = (b, date) => captures(b).find((s) => s.dateSeance === date);
const cDe = (s, da) => s.etudiants.find((e) => e.da === da).C;
function marquerCaptures(b) {
    const k = b.win.cleSnapshots();
    const s = clone(b.store[k]);
    s.hebdomadaires.forEach((c) => { c.timestamp = 'MARQUE-' + c.dateSeance; });
    b.store[k] = s;
}
const refaites = (b) => captures(b).filter((c) => c.timestamp !== 'MARQUE-' + c.dateSeance).map((c) => c.dateSeance);

const copie = (id, da, productionId, extra = {}) => ({ id, etudiantDA: da, productionId, noteFinale: 80, verrouillee: true, statutRemise: 'remis', coursId: 'GC1', groupe: '01', dateEvaluation: '2026-09-04T10:00:00.000Z', retroactionFinale: '', ...extra });
const ecrireEvaluations = (b, evaluations) => b.win.sauvegarderDonneesSelonMode('evaluationsSauvegardees', clone(evaluations), { geste: 'Évaluation (banc)' });

/** Les présences de S0, S1, S3, S4 (captures prises), l'empreinte de départ des évaluations, et les captures marquées. */
async function preparer(evaluationsDeDepart = []) {
    const b = monterBanc();
    b.store.test_evaluationsSauvegardees = clone(evaluationsDeDepart);
    for (const d of [S0, S1, S3, S4]) await saisirPresences(b, d);
    await b.win.initialiserEmpreintesEvaluations();
    marquerCaptures(b);
    return b;
}

describe('#1242 — le graphique suit les évaluations', () => {
    it('0. garde du banc : avant toute évaluation, C de P1 vaut 0 dès son échéance (S1), et n\'existe pas avant', async () => {
        const b = await preparer();
        expect(captures(b).map((c) => c.dateSeance)).toEqual([S0, S1, S3, S4]);
        expect([S0, S1, S3, S4].map((d) => cDe(capture(b, d), ALICE))).toEqual([null, 0, 0, 0]);
    });

    it('1. une évaluation enregistrée refait les captures à partir de l\'échéance de son travail ; celles d\'avant ne bougent pas', async () => {
        const b = await preparer();
        ecrireEvaluations(b, [copie('EV1', ALICE, 'P1')]);
        await laisserFinir(b);
        expect(refaites(b)).toEqual([S1, S3, S4]);
        // P1 seule due en S1 (remise : 100) ; P1 et P3 dues en S3 et S4 (une sur deux : 50).
        expect([S0, S1, S3, S4].map((d) => cDe(capture(b, d), ALICE))).toEqual([null, 100, 50, 50]);
        expect(captures(b).map((c) => c.dateSeance), 'une évaluation ne crée pas de capture').toEqual([S0, S1, S3, S4]);
    });

    it('2. une évaluation modifiée (devenue non remise) refait les mêmes captures', async () => {
        const b = await preparer([copie('EV1', ALICE, 'P1')]);
        ecrireEvaluations(b, [copie('EV1', ALICE, 'P1', { statutRemise: 'non-remis' })]);
        await laisserFinir(b);
        expect(refaites(b)).toEqual([S1, S3, S4]);
    });

    it('3. une évaluation retirée refait les captures à partir de l\'échéance de son travail', async () => {
        const b = await preparer([copie('EV1', ALICE, 'P1'), copie('EV2', '2000002', 'P1')]);
        ecrireEvaluations(b, [copie('EV2', '2000002', 'P1')]);
        await laisserFinir(b);
        expect(refaites(b)).toEqual([S1, S3, S4]);
        expect(cDe(capture(b, S3), ALICE)).toBe(0);
    });

    it('4. un travail dont l\'échéance n\'est pas passée ne refait rien', async () => {
        const b = await preparer();
        ecrireEvaluations(b, [copie('EV3', ALICE, 'P2')]);
        await laisserFinir(b);
        expect(refaites(b)).toEqual([]);
    });

    it('5. l\'évaluation d\'un élève d\'un autre groupe-cours ne refait rien ici', async () => {
        const b = await preparer();
        ecrireEvaluations(b, [copie('EV4', '2000004', 'P1', { coursId: 'GC2', groupe: '02' })]);
        await laisserFinir(b);
        expect(refaites(b)).toEqual([]);
    });

    it('6. une évaluation réécrite sans changement ne refait rien', async () => {
        const b = await preparer([copie('EV1', ALICE, 'P1')]);
        ecrireEvaluations(b, [copie('EV1', ALICE, 'P1')]);
        await laisserFinir(b);
        expect(refaites(b)).toEqual([]);
    });

    it('7. deux écritures rapprochées font une seule chaîne (pas deux fois chaque capture)', async () => {
        const b = await preparer();
        const cle = b.win.cleSnapshots();
        const avant = b.journal.filter((j) => j.k === cle).length;
        ecrireEvaluations(b, [copie('EV1', ALICE, 'P1')]);
        ecrireEvaluations(b, [copie('EV1', ALICE, 'P1'), copie('EV2', '2000002', 'P1')]);
        await laisserFinir(b);
        expect(refaites(b)).toEqual([S1, S3, S4]);
        expect(b.journal.filter((j) => j.k === cle).length - avant, 'trois captures écrites, une fois chacune').toBe(3);
        expect(cDe(capture(b, S1), '2000002'), 'la seconde écriture est comptée').toBe(100);
    });

    it('9. un travail dû un jour de cours jamais saisi : les captures suivantes sont refaites, aucune n\'est créée pour ce jour', async () => {
        const b = await preparer();
        ecrireEvaluations(b, [copie('EV5', ALICE, 'P3')]);
        await laisserFinir(b);
        expect(refaites(b)).toEqual([S3, S4]);
        expect(captures(b).map((c) => c.dateSeance)).toEqual([S0, S1, S3, S4]);
    });

    it('8. sans empreinte de départ, la première écriture devient le point de départ ; la suivante refait', async () => {
        const b = monterBanc();
        for (const d of [S0, S1, S3, S4]) await saisirPresences(b, d);
        marquerCaptures(b);
        ecrireEvaluations(b, [copie('EV1', ALICE, 'P1')]);
        await laisserFinir(b);
        expect(refaites(b)).toEqual([]);
        ecrireEvaluations(b, [copie('EV1', ALICE, 'P1'), copie('EV2', '2000002', 'P1')]);
        await laisserFinir(b);
        expect(refaites(b)).toEqual([S1, S3, S4]);
    });
});

describe('#1242 — l\'empreinte de départ suit le trimestre actif', () => {
    // Le démarrage la prend (`initialiserModuleSnapshots`) ; un trimestre activé en cours de session change la clé
    // des évaluations : sans nouvelle empreinte, la première évaluation écrite ensuite ne referait rien (essai 8).
    it('10. le changement de trimestre et l\'entrée ou la sortie de la démo reprennent l\'empreinte', () => {
        const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
        const appel = /window\.initialiserEmpreintesEvaluations\(\)/g;
        expect((lire('js/trimestres.js').match(appel) || []).length, 'changerTrimestreActif').toBe(1);
        expect((lire('js/demo-activation.js').match(appel) || []).length, 'activerModeDemo et sa sortie').toBe(2);
        expect(lire('js/snapshots.js')).toMatch(/function initialiserModuleSnapshots\(\) \{\s*(\/\/[^\n]*\n\s*)*initialiserEmpreintesEvaluations\(\);/);
    });
});

/*
 * BREAK-TESTS (8 nov. 2026) — avec `modes.js` et `snapshots.js` d'avant #1242 : 10 rouges sur 10 (l'empreinte de
 * départ n'existe pas). Puis chaque altération, retirée ensuite (10 verts) :
 *   G. `modes.js` ne signale plus l'écriture aux captures                         → 1, 2, 3, 7, 8, 9
 *   H. toute évaluation présente compte comme changée (empreintes non comparées)  → 6
 *   I. les évaluations retirées ignorées                                          → 3
 *   J. sans le filtre des élèves du groupe-cours actif                            → 5
 *   K. sans la fusion des demandes en attente                                      → 7
 *   L. une évaluation crée la capture du jour de son échéance                     → 9
 */
