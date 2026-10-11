/**
 * #1049 (11 oct. 2026, fiche urgente de Cowork) — « RECALCULER LES CAPTURES » GARDE LES CAPTURES
 * D'INTERVENTION.
 *
 * `reconstruireSnapshotsHistoriques` (snapshots.js) remettait `interventions: []` avant de refaire les
 * seules captures hebdomadaires. Les captures avant/après d'une intervention RàI sont prises au moment
 * de l'intervention et rien ne les reconstruit : un clic les effaçait pour de bon. Désormais seules les
 * hebdomadaires sont vidées puis refaites ; les interventions et `dernierSnapshotIntervention` restent.
 * Ce qui a déjà été effacé chez les utilisateurs ne se récupère pas.
 * Même montage que `sentinelle-726-c-global-snapshot-borne`. Noms fictifs.
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

const ELEVES = [{ da: '2000001', nom: 'Fictif', prenom: 'Ana', groupe: '01' }, { da: '2000002', nom: 'Fictif', prenom: 'Bea', groupe: '01' }];
const PRODUCTIONS = [{ id: 'P1', titre: 'Analyse 1', type: 'travail', dateEcheance: '2026-02-01' }];
const INTERVENTIONS = [
    { id: 'INT-1', interventionId: 'I1', type: 'debut', titre: 'Intervention fictive', date: '2026-02-10', etudiants: [{ da: '2000001', A: 80, C: 50, P: 60 }] },
    { id: 'INT-2', interventionId: 'I1', type: 'fin', titre: 'Intervention fictive', date: '2026-03-10', etudiants: [{ da: '2000001', A: 90, C: 100, P: 70 }] }
];

function vraiEstEtudiantExclu() {
    const w = {};
    new Function('window', tranche(source('js/main.js'), 'window.estEtudiantExclu = function', 'window.estRessourceSupprimee', { longueurMin: 400 }))(w);
    return w.estEtudiantExclu;
}

function monter(snapshotsInitiaux) {
    const store = {
        test_evaluationsSauvegardees: [], test_productions: PRODUCTIONS, infoCours: { id: 'GC1', _groupeCoursId: 'GC1' }
    };
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
        obtenirCalendrierComplet: () => ({}),
        genererSeancesCompletes: () => ({ '2026-02-02': [{ periodes: 2, numeroSemaine: 4 }], '2026-03-02': [{ periodes: 2, numeroSemaine: 8 }] }),
        obtenirSeancesCompletes: () => ({}),
        obtenirEtudiantsCoursActif: () => clone(ELEVES), estEtudiantExclu: vraiEstEtudiantExclu(),
        notifications: { succes() {}, erreur() {}, info() {} } }, win);
    const cleSnap = win.cleSnapshots();
    if (snapshotsInitiaux) store[cleSnap] = clone(snapshotsInitiaux);
    return { win, store, cleSnap };
}

describe('#1049 — « Recalculer les captures » garde les captures d\'intervention', () => {
    it('1. les captures d\'intervention et leur date sont identiques après la reconstruction ; les hebdomadaires sont refaites', async () => {
        const avant = {
            hebdomadaires: [{ id: 'SEANCE-ANCIENNE', dateSeance: '2026-01-05', etudiants: [], groupe: {} }],
            interventions: INTERVENTIONS,
            metadata: { version: '1.0.0', dateCreation: '2026-01-01T00:00:00.000Z', dernierSnapshotHebdo: '2026-01-05T00:00:00.000Z', dernierSnapshotIntervention: '2026-03-10T12:00:00.000Z' }
        };
        const { win, store, cleSnap } = monter(avant);
        const r = await win.reconstruireSnapshotsHistoriques();
        expect(r.succes, JSON.stringify(r)).toBe(true);
        const apres = store[cleSnap];
        expect(apres.interventions, 'les captures d\'intervention restent, identiques').toEqual(INTERVENTIONS);
        expect(apres.metadata.dernierSnapshotIntervention).toBe('2026-03-10T12:00:00.000Z');
        expect(apres.hebdomadaires.map((s) => s.dateSeance), 'les hebdomadaires sont refaites, l\'ancienne partie').toEqual(['2026-02-02', '2026-03-02']);
    });
    it('2. sans capture préalable, la reconstruction part d\'une structure vide comme avant', async () => {
        const { win, store, cleSnap } = monter(null);
        await win.reconstruireSnapshotsHistoriques();
        expect(store[cleSnap].interventions).toEqual([]);
        expect(store[cleSnap].hebdomadaires.length).toBe(2);
    });
});
