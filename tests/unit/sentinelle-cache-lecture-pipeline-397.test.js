import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { pontsResolution } from './_helpers/ponts-resolution.js';   // lot N1a (21 sept. 2026)

// SENTINELLE #397 — perf du geste le plus fréquent (rapport P1+P2).
// Avant : chaque recalcul d'indices relisait les MÊMES clés une fois PAR
// étudiant (getSync → JSON.parse du blob entier : presences ×75,
// groupeEtudiants ×76, évals ×150 — ~460 ms de gel mesurés à 75 étudiants).
// Le fix : (1) cache de lecture de pipeline dans modes.js (mémoïsation du
// résultat d'obtenirDonneesSelonMode pour la durée d'un lot, invalidé à
// l'écriture, réentrant) ; (2) caches additifs de calculerTousLesIndices
// (patron calculerIndicesEtudiant) ; (3) décision D3 : l'historique indicesCP
// (non borné, zéro lecteur) est PURGÉ — plus poussé, entrée réécrite sans lui.

function dbComptable(store) {
    const compte = {};
    return {
        compte,
        db: {
            getSync: (k, d) => {
                compte[k] = (compte[k] || 0) + 1;
                // copie profonde : simule le re-parse (chaque lecture = objet neuf)
                return k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null);
            },
            // #447 : le vrai `db` signale chaque écriture pour que le cache de
            // lecture puisse s'invalider. Le stub doit en faire autant, sinon il
            // atteste d'un contrat que l'application n'a pas.
            _surEcriture: null,
            surEcriture(rappel) { this._surEcriture = typeof rappel === 'function' ? rappel : null; },
            setSync(k, v) {
                if (typeof this._surEcriture === 'function') this._surEcriture(k);
                store[k] = v;
            },
            get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            async set(k, v) {
                if (typeof this._surEcriture === 'function') this._surEcriture(k);
                store[k] = v;
            }
        }
    };
}

function chargerModes(store) {
    const { compte, db } = dbComptable(store);
    const win = chargerScript('js/modes.js', {
        db, cle: (k) => k,
        obtenirContexteCoursActif: () => null,
        obtenirPreference: () => null,
        sauvegarderPreference: () => {}
    });
    win.cle = (k) => k; // sauvegarderDonneesSelonMode passe par window.cle
    return { win, compte, store };
}

describe('#397 · cache de lecture de pipeline (modes.js)', () => {
    it('pendant un pipeline, N lectures de la même clé = 1 seul getSync (avant : N)', () => {
        const { win, compte } = chargerModes({ presences: [{ da: '1', date: '2026-01-01' }] });
        win.demarrerCacheLecture();
        try {
            win.obtenirDonneesSelonMode('presences');
            win.obtenirDonneesSelonMode('presences');
            win.obtenirDonneesSelonMode('presences');
        } finally {
            win.terminerCacheLecture();
        }
        expect(compte.presences).toBe(1);
    });

    it('hors pipeline : chaque lecture repart du stockage (comportement historique intact)', () => {
        const { win, compte } = chargerModes({ presences: [] });
        win.obtenirDonneesSelonMode('presences');
        win.obtenirDonneesSelonMode('presences');
        expect(compte.presences).toBe(2);
    });

    it('une écriture pendant le pipeline INVALIDE le cache (jamais de lecture périmée)', () => {
        const { win, store } = chargerModes({ indicesAssiduite: { sommatif: { a: 1 } } });
        win.demarrerCacheLecture();
        try {
            const avant = win.obtenirDonneesSelonMode('indicesAssiduite');
            expect(avant.sommatif.a).toBe(1);
            win.sauvegarderDonneesSelonMode('indicesAssiduite', { sommatif: { a: 2 } });
            const apres = win.obtenirDonneesSelonMode('indicesAssiduite');
            expect(apres.sommatif.a).toBe(2); // relu du stockage, pas du cache
        } finally {
            win.terminerCacheLecture();
        }
        expect(store.indicesAssiduite.sommatif.a).toBe(2);
    });

    it('réentrant : un pipeline imbriqué (A → C/P) ne coupe pas le cache du parent', () => {
        const { win, compte } = chargerModes({ productions: [] });
        win.demarrerCacheLecture();       // pipeline parent (assiduité)
        win.obtenirDonneesSelonMode('productions');
        win.demarrerCacheLecture();       // pipeline imbriqué (C/P)
        win.obtenirDonneesSelonMode('productions');
        win.terminerCacheLecture();       // fin de l'imbriqué
        win.obtenirDonneesSelonMode('productions'); // le parent est TOUJOURS caché
        win.terminerCacheLecture();
        expect(compte.productions).toBe(1);
    });
});

describe('#397 · pipeline assiduité — lectures hissées (intégration indices.js)', () => {
    function chargerPipeline() {
        const store = {
            groupeEtudiants: [
                { da: '1111111', nom: 'A' },
                { da: '2222222', nom: 'B' },
                { da: '3333333', nom: 'C' }
            ],
            presences: [
                { da: '1111111', date: '2026-02-01', periodesPresentes: 2 },
                { da: '2222222', date: '2026-02-01', periodesPresentes: 1 },
                { da: '3333333', date: '2026-02-01', periodesPresentes: 2 }
            ]
        };
        const { compte, db } = dbComptable(store);
        const win = chargerScript('js/modes.js', {
            db, cle: (k) => k,
            obtenirContexteCoursActif: () => null,
            obtenirPreference: () => null,
            sauvegarderPreference: () => {}
        });
        win.cle = (k) => k; // sauvegarderDonneesSelonMode passe par window.cle
        win.dateLocaleYMD = () => '2026-02-01'; // #398 : SSOT « aujourd'hui » du harnais
        chargerScript('js/indices.js', {
            db, cle: (k) => k,
            obtenirDonneesSelonMode: (...a) => win.obtenirDonneesSelonMode(...a),
            sauvegarderDonneesSelonMode: (...a) => win.sauvegarderDonneesSelonMode(...a),
            demarrerCacheLecture: () => win.demarrerCacheLecture(),
            terminerCacheLecture: () => win.terminerCacheLecture(),
            estEtudiantExclu: () => false,
            obtenirSeancesCompletes: () => ({ '2026-02-01': {} }),
            obtenirNombrePeriodesSeance: () => 2,
            obtenirDureePeriode: () => 55
        }, win);
        return { win, compte, store };
    }

    it('3 étudiants → presences et groupeEtudiants lus UNE fois chacun (avant : 1 par étudiant)', () => {
        const { win, compte, store } = chargerPipeline();
        const indices = win.calculerEtSauvegarderIndicesAssiduite();
        expect(indices.sommatif['1111111'].indice).toBe(1);
        expect(indices.sommatif['2222222'].indice).toBe(0.5);
        expect(store.indicesAssiduite.sommatif['3333333'].indice).toBe(1);
        // LE cœur perf : un seul parse par clé pour tout le lot.
        expect(compte.presences).toBe(1);
        expect(compte.groupeEtudiants).toBe(1);
    });

    it('après le pipeline, le cache est bien terminé (les lectures suivantes repartent du stockage)', () => {
        const { win, compte } = chargerPipeline();
        win.calculerEtSauvegarderIndicesAssiduite();
        const avant = compte.presences;
        win.obtenirDonneesSelonMode('presences');
        expect(compte.presences).toBe(avant + 1);
    });
});

describe('#397 · calculerTousLesIndices — caches additifs (rendu prioritaires, P2)', () => {
    it('caches fournis → AUCUNE lecture de indicesAssiduite/indicesCP (avant : 2 par étudiant)', () => {
        const store = {};
        const { compte, db } = dbComptable(store);
        const win = chargerScript('js/indices.js', {
            db, cle: (k) => k,
            obtenirDonneesSelonMode: () => ({}),
            obtenirTypePratiqueActive: () => 'sommative',
            calculerTauxCompletion: () => null
        });
        const cacheA = { sommatif: { '1234567': { indice: 0.9 } } };
        const cacheCP = { '1234567': { actuel: { C: 70, P: 86, noteConstructible: true } } };
        const r = win.calculerTousLesIndices('1234567', cacheA, cacheCP);
        expect(r.A).toBe(90);
        expect(r.C).toBe(70);
        expect(r.P).toBe(86);
        expect(compte['indicesAssiduite'] || 0).toBe(0);
        expect(compte['indicesCP'] || 0).toBe(0);
    });
});

describe('#397 · décision D3 — l\'historique indicesCP est purgé (zéro lecteur)', () => {
    it('calculerEtStockerIndicesCP réécrit l\'entrée SANS historique et n\'en pousse plus', () => {
        const store = {
            groupeEtudiants: [{ da: '1234567', nom: 'X' }],
            productions: [{ id: 'P1', ponderation: 100 }],
            evaluationsSauvegardees: [
                { etudiantDA: '1234567', productionId: 'P1', noteFinale: 80, remplaceeParId: null }
            ],
            // entrée legacy AVEC historique gonflé : doit disparaître au recalcul
            indicesCP: {
                '1234567': {
                    historique: [{ C: 1, P: 2 }, { C: 3, P: 4 }],
                    actuel: { C: 3, P: 4 }
                }
            }
        };
        const db = {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async () => null, set: async () => {}
        };
        const cle = (k) => k;
        const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle });
        const ponts = {
            db, cle,
            obtenirDonneesSelonMode: (k) => (k in store ? store[k] : null),
            estEtudiantExclu: () => false,
            obtenirPratiqueActiveGroupeCours: () => 'sommative', ...pontsResolution(win, () => 'sommative'),
            obtenirPratiqueParId: (...a) => win.obtenirPratiqueParId(...a)
        };
        chargerScript('js/pratiques/pratique-sommative.js', ponts, win);
        chargerScript('js/portfolio.js', ponts, win);

        win.calculerEtStockerIndicesCP();

        const entree = store.indicesCP['1234567'];
        expect(entree.actuel.P).toBe(80);
        expect(entree.actuel.noteConstructible).toBe(true);
        expect(entree.historique).toBeUndefined(); // purgé, plus jamais poussé
    });
});
