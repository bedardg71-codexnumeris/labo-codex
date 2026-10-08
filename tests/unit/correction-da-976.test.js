import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// #976 (lot 7 du chantier de l'enregistrement, 8 oct. 2026) — « CORRIGER LE DA… »
// =======================================================================
//
// Le module `js/correction-da.js`, sur un magasin en mémoire qui sérialise comme le vrai
// (une valeur lue est une copie) :
//  1. un DA corrigé garde évaluations, présences, indices et copies : même nombre avant et
//     après, zéro sous l'ancien DA, rien d'autre ne bouge (autre élève, autre trimestre) ;
//  2. les refus (forme du DA, DA d'une autre fiche, données déjà sous le nouveau DA, dans le
//     trimestre ou dans une des trois globales) n'écrivent rien ;
//  2 bis. les trois globales qui portent des résultats (registre longitudinal, jetons, dénotation)
//     suivent (décision de Grégoire, 8 oct., 14 h 50) ;
//  3. un échec au milieu ne laisse ni doublon ni perte, et refaire le geste finit la correction.
// Noms et DA fictifs.

const T = 'a2026';
const ANCIEN = '1111111';
const NOUVEAU = '7654321';
const AUTRE = '2222222';

function semis() {
    return {
        [`${T}_groupeEtudiants`]: [
            { da: ANCIEN, nom: 'Coquille', prenom: 'Alix', groupe: '00001', statut: 'actif' },
            { da: AUTRE, nom: 'Témoin', prenom: 'Bao', groupe: '00001' }
        ],
        [`${T}_evaluationsSauvegardees`]: [
            { id: 'EVAL_1', etudiantDA: ANCIEN, productionId: 'P1', etudiantNom: 'Alix Coquille' },
            { id: 'EVAL_2', etudiantDA: ANCIEN, productionId: 'P2', remplaceeParId: 'EVAL_3' },
            { id: 'EVAL_3', etudiantDA: ANCIEN, productionId: 'P2', repriseDeId: 'EVAL_2' },
            { id: 'EVAL_4', etudiantDA: AUTRE, productionId: 'P1' }
        ],
        [`${T}_presences`]: [
            { date: '2026-09-01', da: ANCIEN, periodesPresentes: 2 },
            { date: '2026-09-02', da: ANCIEN, periodesPresentes: 2 },
            { date: '2026-09-03', da: ANCIEN, periodesPresentes: 0 },
            { date: '2026-09-01', da: AUTRE, periodesPresentes: 2 }
        ],
        [`${T}_indicesAssiduite`]: { sommatif: { [ANCIEN]: { indice: 0.66 }, [AUTRE]: { indice: 1 } }, dateCalcul: 'x' },
        [`${T}_indicesCP`]: { [ANCIEN]: { actuel: { C: 80, P: 70 } }, [AUTRE]: { actuel: { C: 90 } }, dateCalcul: 'x' },
        [`${T}_portfoliosEleves`]: { [ANCIEN]: { PF1: { artefactsRetenus: ['P1'] } } },
        [`${T}_fichiersTravaux`]: [
            { id: 'FT_1', etudiantDA: ANCIEN, productionId: 'P1', groupeDocumentId: `${ANCIEN}_auto`, leaParsed: { da: ANCIEN, raw: `${ANCIEN}_copie.pdf` }, nomFichier: `${ANCIEN}_copie.pdf` },
            { id: 'FT_2', etudiantDA: ANCIEN, productionId: 'P2' },
            { id: 'FT_3', etudiantDA: AUTRE, productionId: 'P1', groupeDocumentId: `${AUTRE}_auto` }
        ],
        [`${T}_annotationsTravaux`]: [{ id: 'AN_1', fichierId: 'FT_1', etudiantDA: ANCIEN }],
        [`${T}_interventions`]: [
            { id: 'INT_1', etudiants: [ANCIEN, AUTRE], notesIndividuelles: { [ANCIEN]: 'note' }, snapshotAvant: { [ANCIEN]: { P: 60 } } }
        ],
        [`${T}_snapshots_GC1`]: {
            hebdomadaires: [{ semaine: 1, etudiants: [{ da: ANCIEN, A: 1 }, { da: AUTRE, A: 1 }] }],
            interventions: [{ id: 'INT_1', etudiantsDA: [ANCIEN], avant: { [ANCIEN]: { A: 1 } }, apres: { [ANCIEN]: { A: 1 } } }]
        },
        [`${T}_etudiantsSuivis_gc_GC1`]: [{ da: ANCIEN, couleurIndex: 0 }],
        [`${T}_notesRapport`]: { [ANCIEN]: 'à revoir' },
        [`${T}_confidentielEtudiants`]: { [ANCIEN]: { categorie: 'x' } },
        [`${T}_mapping_anonymisation`]: { [ANCIEN]: { numero: 1 }, [AUTRE]: { numero: 2 } },
        // Les trois globales (sans préfixe). La copie datée du dossier garde le DA de sa capture.
        registreLongitudinal: { format: 'registre-longitudinal', version: 1, eleves: {
            [ANCIEN]: { da: ANCIEN, nom: 'Coquille', dossiers: [{ trimestre: 'h2026', evaluations: [{ etudiantDA: ANCIEN }] }] },
            [AUTRE]: { da: AUTRE, nom: 'Témoin', dossiers: [] }
        } },
        jetonsEtudiants: { [ANCIEN]: { J1: 1, _historique: [{ jetonId: 'J1', action: 'attribue' }] }, [AUTRE]: {} },
        jugementsDenotation: { PR1: { [ANCIEN]: { noteFinale: 80 }, [AUTRE]: { noteFinale: 70 } }, PR2: { [AUTRE]: { noteFinale: 60 } } },
        // Un autre trimestre : le même élève, la même coquille — pas touché.
        'h2026_groupeEtudiants': [{ da: ANCIEN, nom: 'Coquille', prenom: 'Alix' }],
        'h2026_presences': [{ date: '2026-02-01', da: ANCIEN }],
        'h2026_evaluationsSauvegardees': [{ id: 'EVAL_H', etudiantDA: ANCIEN }],
        'h2026_snapshots_GC1': { hebdomadaires: [{ semaine: 1, etudiants: [{ da: ANCIEN, A: 1 }] }] },
        'h2026_etudiantsSuivis_gc_GC1': [{ da: ANCIEN, couleurIndex: 0 }]
    };
}

const NOMS = ['evaluationsSauvegardees', 'presences', 'indicesAssiduite', 'indicesCP', 'indicesPatternsRaI', 'indicesEvaluation',
    'portfoliosEleves', 'resultatsUlterieurs', 'interventions', 'notesRapport', 'confidentielEtudiants', 'chronoEvaluations',
    'elevesDesinscrits', 'fichiersTravaux', 'corbeilleFichiers', 'annotationsTravaux', 'groupeEtudiants'];

function monter(options = {}) {
    const magasin = new Map();
    const tout = Object.assign(semis(), options.ajouts || {});
    Object.entries(tout).forEach(([k, v]) => magasin.set(k, JSON.stringify(v)));
    let ecritures = 0;
    const db = {
        getSync: (k, d = null) => (magasin.has(k) ? JSON.parse(magasin.get(k)) : d),
        keysSync: () => [...magasin.keys()],
        async modifier(k, mutateur, d = null) {
            const lus = magasin.has(k) ? JSON.parse(magasin.get(k)) : d;
            const v = await mutateur(lus);
            if (v === undefined) return undefined;
            ecritures++;
            if (options.echouerA && ecritures === options.echouerA) throw new Error('écriture refusée (banc)');
            magasin.set(k, JSON.stringify(v));
            if (options.apresEcriture) options.apresEcriture(k, magasin);
            return v;
        }
    };
    const cle = (nom) => (NOMS.includes(nom) ? `${T}_${nom}` : nom);
    const modifierEtAnnoncer = (k, mutateur, d) => db.modifier(k, mutateur, d);
    const w = chargerScript('js/correction-da.js', { db, cle, modifierEtAnnoncer });
    w.obtenirTrimestreId = () => T;
    const temoin = { dits: [] };
    w.temoinEnregistrement = { enregistre: (c) => temoin.dits.push(['enregistre', c]) };
    return { w, magasin, temoin, lire: (k) => (magasin.has(k) ? JSON.parse(magasin.get(k)) : null) };
}

// Toutes les occurrences d'un DA dans les clés d'un trimestre et dans les trois globales (texte
// sérialisé : clés d'objet, champs, éléments de tableau, préfixes d'id — tout).
const GLOBALES = ['registreLongitudinal', 'jetonsEtudiants', 'jugementsDenotation'];
function occurrences(magasin, prefixe, da) {
    let n = 0;
    for (const [k, v] of magasin) if (k.startsWith(prefixe) || GLOBALES.includes(k)) n += v.split(da).length - 1;
    return n;
}
// Les occurrences de l'ancien DA qui restent exprès : les noms du fichier déposé (2), la copie
// datée du dossier longitudinal (1).
const RESTENT = 3;

describe('#976 — un DA corrigé garde tout, dans le trimestre actif seulement', () => {
    let m;
    beforeEach(() => { m = monter(); });

    it('la passe à blanc compte ce qui sera déplacé, sans rien écrire', () => {
        const avant = JSON.stringify([...m.magasin]);
        const mesure = m.w.CorrectionDA.passeABlanc(ANCIEN, '');
        expect(mesure.comptes.evaluations).toBe(3);
        expect(mesure.comptes.presences).toBe(3);
        expect(mesure.comptes.copies).toBe(2);
        expect(mesure.comptes.resultats).toBeGreaterThanOrEqual(5);   // A, C/P, portfolio, intervention, snapshots
        expect(mesure.comptes.jetons).toBe(1);
        expect(mesure.comptes.denotation).toBe(1);
        expect(mesure.comptes.longitudinal).toBe(1);
        expect(JSON.stringify([...m.magasin])).toBe(avant);
    });

    it('après : mêmes nombres sous le nouveau DA, zéro sous l\'ancien, rien d\'autre ne bouge', async () => {
        const autreTrimestre = JSON.stringify([...m.magasin].filter(([k]) => k.startsWith('h2026_')));
        const occAncien = occurrences(m.magasin, T + '_', ANCIEN);
        const occAutre = occurrences(m.magasin, T + '_', AUTRE);
        const avant = m.w.CorrectionDA.passeABlanc(ANCIEN, '').comptes;

        const res = await m.w.CorrectionDA.corriger(ANCIEN, NOUVEAU);
        expect(res.ok).toBe(true);
        expect(m.w.CorrectionDA.passeABlanc(NOUVEAU, '').comptes).toEqual(avant);
        // Zéro sous l'ancien, hors des noms de fichiers déposés (gardés tels quels, exprès).
        expect(occurrences(m.magasin, T + '_', ANCIEN)).toBe(RESTENT);
        expect(occurrences(m.magasin, T + '_', NOUVEAU)).toBe(occAncien - RESTENT);
        expect(occurrences(m.magasin, T + '_', AUTRE)).toBe(occAutre);
        expect(JSON.stringify([...m.magasin].filter(([k]) => k.startsWith('h2026_')))).toBe(autreTrimestre);

        const fiches = m.lire(`${T}_groupeEtudiants`);
        expect(fiches.map((f) => f.da)).toEqual([NOUVEAU, AUTRE]);
        expect(fiches[0]).toEqual({ da: NOUVEAU, nom: 'Coquille', prenom: 'Alix', groupe: '00001', statut: 'actif' });
        const copie = m.lire(`${T}_fichiersTravaux`)[0];
        expect(copie.etudiantDA).toBe(NOUVEAU);
        expect(copie.leaParsed.da).toBe(NOUVEAU);
        expect(copie.groupeDocumentId).toBe(`${NOUVEAU}_auto`);
        expect(m.lire(`${T}_evaluationsSauvegardees`).map((e) => [e.id, e.etudiantDA, e.remplaceeParId || null]))
            .toEqual([['EVAL_1', NOUVEAU, null], ['EVAL_2', NOUVEAU, 'EVAL_3'], ['EVAL_3', NOUVEAU, null], ['EVAL_4', AUTRE, null]]);
        expect(m.lire(`${T}_indicesAssiduite`).sommatif[NOUVEAU]).toEqual({ indice: 0.66 });
        expect(m.lire(`${T}_mapping_anonymisation`)[NOUVEAU]).toEqual({ numero: 1 });
        // Les globales ont suivi, l'autre élève non.
        const reg = m.lire('registreLongitudinal').eleves;
        expect(Object.keys(reg).sort()).toEqual([AUTRE, NOUVEAU]);
        expect(reg[NOUVEAU].da).toBe(NOUVEAU);
        expect(reg[NOUVEAU].dossiers[0].evaluations[0].etudiantDA).toBe(ANCIEN);   // la capture datée
        expect(m.lire('jetonsEtudiants')).toEqual({ [NOUVEAU]: { J1: 1, _historique: [{ jetonId: 'J1', action: 'attribue' }] }, [AUTRE]: {} });
        expect(m.lire('jugementsDenotation')).toEqual({ PR1: { [NOUVEAU]: { noteFinale: 80 }, [AUTRE]: { noteFinale: 70 } }, PR2: { [AUTRE]: { noteFinale: 60 } } });
        expect(m.temoin.dits).toEqual([['enregistre', `${T}_groupeEtudiants`]]);
    });
});

describe('#976 — les refus n\'écrivent rien', () => {
    const casDeRefus = [
        ['un DA de six chiffres', '123456', {}, /sept chiffres/],
        ['un DA avec des lettres', '12345AB', {}, /sept chiffres/],
        ['le DA d\'une autre fiche du trimestre', AUTRE, {}, /autre étudiant·e de ce trimestre/],
        ['des données déjà sous le nouveau DA', NOUVEAU, { ajouts: { [`${T}_notesRapport`]: { [ANCIEN]: 'a', [NOUVEAU]: 'b' } } }, /portent déjà ce DA/],
        ['une présence orpheline sous le nouveau DA', NOUVEAU, { ajouts: { [`${T}_presences`]: [{ date: '2026-09-01', da: ANCIEN }, { date: '2026-09-09', da: NOUVEAU }] } }, /portent déjà ce DA/],
        ['des jetons déjà sous le nouveau DA', NOUVEAU, { ajouts: { jetonsEtudiants: { [ANCIEN]: { J1: 1 }, [NOUVEAU]: { J2: 1 } } } }, /^Ce DA porte déjà des jetons :/],
        ['une entrée longitudinale déjà sous le nouveau DA', NOUVEAU, { ajouts: { registreLongitudinal: { eleves: { [ANCIEN]: { da: ANCIEN }, [NOUVEAU]: { da: NOUVEAU } } } } }, /^Ce DA porte déjà une entrée au suivi longitudinal :/],
        ['un jugement de dénotation déjà sous le nouveau DA', NOUVEAU, { ajouts: { jugementsDenotation: { PR1: { [ANCIEN]: { noteFinale: 80 } }, PR2: { [NOUVEAU]: { noteFinale: 75 } } } } }, /^Ce DA porte déjà un jugement de dénotation :/]
    ];
    for (const [nom, nouveau, options, motif] of casDeRefus) {
        it(nom, async () => {
            const m = monter(options);
            const avant = JSON.stringify([...m.magasin]);
            const res = await m.w.CorrectionDA.corriger(ANCIEN, nouveau);
            expect(res.ok).toBe(false);
            expect(res.refus).toMatch(motif);
            expect(JSON.stringify([...m.magasin])).toBe(avant);
            expect(m.temoin.dits).toEqual([]);
        });
    }
});

describe('#976 — un échec au milieu : ni doublon ni perte, et la reprise finit', () => {
    // 1re écriture = la marque ; 2e, 3e, … = les clés ; la dernière = la fiche.
    // 15 = le registre longitudinal, 17 = la dénotation : un échec sur une globale se reprend aussi.
    for (const echouerA of [2, 4, 7, 15, 17]) {
        it(`échec à l'écriture n° ${echouerA}`, async () => {
            const m = monter({ echouerA });
            const total = occurrences(m.magasin, T + '_', ANCIEN);
            const avant = m.w.CorrectionDA.passeABlanc(ANCIEN, '').comptes;
            const res = await m.w.CorrectionDA.corriger(ANCIEN, NOUVEAU);
            expect(res.ok).toBe(false);
            expect(res.raison).toMatch(/Rien n'est perdu/);

            // Ni doublon ni perte : chaque occurrence est sous l'un OU l'autre DA, jamais les deux.
            expect(occurrences(m.magasin, T + '_', ANCIEN) + occurrences(m.magasin, T + '_', NOUVEAU)).toBe(total + 1);   // + la marque
            const sousAncien = m.w.CorrectionDA.passeABlanc(ANCIEN, '').comptes;
            const sousNouveau = m.w.CorrectionDA.passeABlanc(NOUVEAU, '').comptes;
            for (const k of Object.keys(avant)) expect(sousAncien[k] + sousNouveau[k], k).toBe(avant[k]);
            // La fiche est restée sous l'ancien DA, marquée vers le nouveau.
            const fiche = m.lire(`${T}_groupeEtudiants`)[0];
            expect(fiche.da).toBe(ANCIEN);
            expect(fiche.correctionDA.vers).toBe(NOUVEAU);
            // Où l'échec est tombé : sur le registre (15), sur la dénotation après les jetons (17).
            if (echouerA === 15) {
                expect(m.lire(`${T}_mapping_anonymisation`)).toHaveProperty(NOUVEAU);
                expect(m.lire('registreLongitudinal').eleves).toHaveProperty(ANCIEN);
            }
            if (echouerA === 17) {
                expect(m.lire('jetonsEtudiants')).toHaveProperty(NOUVEAU);
                expect(m.lire('jugementsDenotation').PR1).toHaveProperty(ANCIEN);
            }

            // Une reprise vers un AUTRE DA est refusée ; vers le même, elle finit.
            const refus = await m.w.CorrectionDA.corriger(ANCIEN, '5555555');
            expect(refus.refus).toMatch(/s'est arrêtée en chemin/);
            const fin = await m.w.CorrectionDA.corriger(ANCIEN, NOUVEAU);
            expect(fin.ok).toBe(true);
            expect(m.w.CorrectionDA.passeABlanc(NOUVEAU, '').comptes).toEqual(avant);
            expect(occurrences(m.magasin, T + '_', ANCIEN)).toBe(RESTENT);
            expect(m.lire(`${T}_groupeEtudiants`)[0]).not.toHaveProperty('correctionDA');
        });
    }
});

describe('#976 — la vérification recompte pour de vrai', () => {
    it('une présence saisie sous l\'ancien DA pendant le déplacement : « Non enregistré », rien n\'est perdu', async () => {
        let injectee = false;
        const m = monter({
            apresEcriture: (k, magasin) => {
                if (k !== `${T}_presences` || injectee) return;
                injectee = true;
                const p = JSON.parse(magasin.get(k));
                p.push({ date: '2026-09-04', da: ANCIEN, periodesPresentes: 2 });
                magasin.set(k, JSON.stringify(p));
            }
        });
        const res = await m.w.CorrectionDA.corriger(ANCIEN, NOUVEAU);
        expect(res.ok).toBe(false);
        expect(res.raison).toMatch(/recompte/);
        expect(m.temoin.dits).toEqual([]);
        expect(m.lire(`${T}_presences`).filter((p) => p.da === ANCIEN)).toHaveLength(1);
        // La fiche n'a pas bougé : elle reste marquée, et refaire le geste fait passer la saisie tardive.
        expect(m.lire(`${T}_groupeEtudiants`)[0]).toMatchObject({ da: ANCIEN, correctionDA: { vers: NOUVEAU } });
        const fin = await m.w.CorrectionDA.corriger(ANCIEN, NOUVEAU);
        expect(fin.ok).toBe(true);
        expect(m.lire(`${T}_presences`).filter((p) => p.da === NOUVEAU)).toHaveLength(4);
        expect(m.lire(`${T}_presences`).filter((p) => p.da === ANCIEN)).toHaveLength(0);
    });
});

describe('#976 — reprise : une clé d\'objet qui porte les deux DA bloque, sans rien écraser', () => {
    it('un portfolio coché sous l\'ancien DA entre l\'échec et la reprise', async () => {
        // Écritures : 1 la marque, 2 évaluations, 3 présences, 4 copies, 5 annotations, 6 A, 7 C/P,
        // 8 portfolio, 9 interventions — l'échec à la 9e laisse le portfolio déjà passé.
        const m = monter({ echouerA: 9 });
        expect((await m.w.CorrectionDA.corriger(ANCIEN, NOUVEAU)).ok).toBe(false);
        const pf = m.lire(`${T}_portfoliosEleves`);
        expect(pf).toHaveProperty(NOUVEAU);   // déjà passé au premier essai
        pf[ANCIEN] = { PF1: { artefactsRetenus: ['P2'] } };
        m.magasin.set(`${T}_portfoliosEleves`, JSON.stringify(pf));
        const avant = JSON.stringify([...m.magasin]);
        const res = await m.w.CorrectionDA.corriger(ANCIEN, NOUVEAU);
        expect(res.ok).toBe(false);
        expect(res.refus).toMatch(/portent déjà ce DA/);
        expect(JSON.stringify([...m.magasin])).toBe(avant);
    });
});

describe('#976 — jetons : une entrée VIDE sous le nouveau DA n\'est pas un conflit', () => {
    it('`{}` posé par initialiserJetonsEtudiant est remplacé, les jetons de l\'élève passent', async () => {
        const m = monter({ ajouts: { jetonsEtudiants: { [ANCIEN]: { J1: 2, _historique: [{ jetonId: 'J1' }] }, [NOUVEAU]: {}, [AUTRE]: {} } } });
        expect(m.w.CorrectionDA.passeABlanc(ANCIEN, '').comptes.jetons).toBe(2);
        const res = await m.w.CorrectionDA.corriger(ANCIEN, NOUVEAU);
        expect(res.ok).toBe(true);
        expect(m.lire('jetonsEtudiants')).toEqual({ [NOUVEAU]: { J1: 2, _historique: [{ jetonId: 'J1' }] }, [AUTRE]: {} });
    });
    it('une entrée qui porte un historique n\'est pas vide : refus, rien d\'écrit', async () => {
        const m = monter({ ajouts: { jetonsEtudiants: { [ANCIEN]: { J1: 1 }, [NOUVEAU]: { _historique: [{ jetonId: 'J1', action: 'retire' }] } } } });
        const avant = JSON.stringify([...m.magasin]);
        const res = await m.w.CorrectionDA.corriger(ANCIEN, NOUVEAU);
        expect(res.refus).toMatch(/^Ce DA porte déjà des jetons :/);
        expect(JSON.stringify([...m.magasin])).toBe(avant);
    });
});
