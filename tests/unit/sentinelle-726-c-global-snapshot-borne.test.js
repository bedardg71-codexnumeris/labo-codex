/**
 * #726 (lot 6, consigne de Cowork du 11 oct. 2026) — LE C GLOBAL D'UN SNAPSHOT NE DÉPASSE PLUS 100 %.
 *
 * Le C global d'un relevé (`capturerSnapshotSeance`, snapshots.js) est le taux de remise du dernier
 * travail dû : élèves qui l'ont remis / élèves actifs du groupe. Avant, son numérateur comptait les
 * ÉVALUATIONS de tout le trimestre : un élève de l'autre groupe du même cours, un élève exclu, une
 * seconde évaluation du même élève, chacun s'ajoutait au numérateur seulement.
 *
 * Mesuré sur le pack démo le 11 oct. 2026 : aucun des 30 relevés reconstruits ne change (un seul
 * groupe, aucun exclu, aucune double évaluation du dernier travail). Le défaut ne se voit qu'avec ce
 * banc. Stock : les relevés déjà capturés gardent leur nombre.
 *
 * Même montage que `sentinelle-745-exclu-hors-des-moyennes-comportement` (la vraie règle d'exclusion
 * de main.js, les vrais prédicats de copie). Noms fictifs.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));

const REMET = '2000001', NE_REMET_PAS = '2000002', EXCLU = '2000003', AUTRE_GROUPE = '2000004';
const ELEVES = [
    { da: REMET, nom: 'Fictif', prenom: 'Ana', groupe: '01' },
    { da: NE_REMET_PAS, nom: 'Fictif', prenom: 'Bea', groupe: '01' },
    { da: EXCLU, nom: 'Fictif', prenom: 'Eli', groupe: '01', statut: 'décrochage' }
];
const PRODUCTIONS = [{ id: 'P1', titre: 'Analyse 1', type: 'travail', dateEcheance: '2026-02-01' }, { id: 'P2', titre: 'Analyse 2', type: 'travail', dateEcheance: '2026-03-01' }];
const ev = (id, da, prod) => ({ id, etudiantDA: da, productionId: prod, niveauFinal: 'D', noteFinale: 70, verrouillee: true, ponderationCouverte: 100, dateEvaluation: '2026-03-10' });

function vraiEstEtudiantExclu() {
    const w = {};
    new Function('window', tranche(source('js/main.js'), 'window.estEtudiantExclu = function', 'window.estRessourceSupprimee', { longueurMin: 400 }))(w);
    return w.estEtudiantExclu;
}

async function releve(evaluations) {
    const store = { test_evaluationsSauvegardees: evaluations, test_productions: PRODUCTIONS, infoCours: { id: 'GC1', _groupeCoursId: 'GC1' } };
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync() {}, get: async (k) => (k in store ? clone(store[k]) : null),
        set: async (k, v) => { store[k] = clone(v); }, useIndexedDB: false, memoryCache: new Map(),
        modifier: async (k, mutateur, d = null) => {
            const r = await mutateur(k in store ? clone(store[k]) : d);
            if (r !== undefined) store[k] = clone(r);
            return r;
        } };
    const win = { addEventListener() {}, removeEventListener() {}, dateLocaleYMD: () => '2026-05-15' };
    chargerPredicatsCopie(win);
    chargerScript('js/snapshots.js', { db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s),
        obtenirDonneesSelonMode: (k) => clone(store['test_' + String(k).replace(/^test_/, '')] || []),
        calculerAssiduite: () => ({ indice: 1, periodesPresentes: 20, periodesOffertes: 20, nombreSeances: 10 }),
        obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
        obtenirCalendrierComplet: () => ({}), obtenirSeancesCompletes: () => ({}),
        obtenirEtudiantsCoursActif: () => clone(ELEVES), estEtudiantExclu: vraiEstEtudiantExclu(),
        notifications: { succes() {}, erreur() {}, info() {} } }, win);
    return win.capturerSnapshotSeance('2026-03-16', null, { numeroSemaine: 10 });
}

describe('#726 — le C global d\'un relevé compte les seuls élèves de son dénominateur', () => {
    it('0. garde du banc : deux actifs, l\'un remet le dernier travail → 50 %', async () => {
        const s = await releve([ev('E1', REMET, 'P2')]);
        expect(s.groupe.nbEtudiants).toBe(2);
        expect(s.groupe.moyenneC).toBe(50);
    });
    it('1. un élève de l\'autre groupe qui a remis ne compte pas (avant : 100 %)', async () => {
        expect((await releve([ev('E1', REMET, 'P2'), ev('E2', AUTRE_GROUPE, 'P2')])).groupe.moyenneC).toBe(50);
    });
    it('2. un élève exclu qui a remis ne compte pas (avant : 100 %)', async () => {
        expect((await releve([ev('E1', REMET, 'P2'), ev('E3', EXCLU, 'P2')])).groupe.moyenneC).toBe(50);
    });
    it('3. un élève évalué deux fois sur le même travail compte une fois (avant : 100 %)', async () => {
        expect((await releve([ev('E1', REMET, 'P2'), ev('E1b', REMET, 'P2')])).groupe.moyenneC).toBe(50);
    });
    it('4. les trois ensemble ne dépassent jamais 100 % (avant : 200 %)', async () => {
        const s = await releve([ev('E1', REMET, 'P2'), ev('E1b', REMET, 'P2'), ev('E2', AUTRE_GROUPE, 'P2'), ev('E3', EXCLU, 'P2')]);
        expect(s.groupe.moyenneC).toBe(50);
    });
});
