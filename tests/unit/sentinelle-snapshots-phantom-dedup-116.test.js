import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #116 — sentinelle captures phantômes inter-groupes + dédoublonnage (2 juillet 2026).
// Bug réel (SUIVI-BUGS #116, 22 mai 2026) : le flux automatique
// verifierEtCapturerSnapshotHebdomadaire passait par le wrapper LEGACY
// capturerSnapshotHebdomadaire qui bouclait sur les jours 'cours' du
// calendrier PARTAGÉ du trimestre (union des jours de TOUS les groupes-cours)
// → 1 capture phantôme par jour où seul un AUTRE groupe a cours. Et
// capturerSnapshotSeance empilait les snapshots sans check d'unicité →
// N appels = N duplicatas pour la même séance.
// NOTE : les facettes « Capturer maintenant » / obtenirNumeroSemaineActuelle
// de la fiche ont été résolues par ablation (#280, 26 mai, commit c1c8abd).
// Contrat verrouillé ici :
//  1. (A) le flux auto ne capture QUE les dates où le groupe-cours ACTIF a
//     une séance (obtenirSeancesCompletes, group-specific), jamais les jours
//     'cours' du calendrier partagé appartenant à un autre groupe ;
//  2. (A) si un snapshot existe déjà pour la semaine courante, aucun ajout ;
//  3. (B) recapturer la même dateSeance REMPLACE le snapshot existant
//     (jamais de duplicata) ; une date différente s'AJOUTE.

function isoDate(decalageJours = 0) {
    const d = new Date();
    d.setDate(d.getDate() + decalageJours);
    return d.toISOString().split('T')[0];
}

const AUJOURDHUI = isoDate(0);
const SEANCE_GROUPE_PASSEE = isoDate(-3);  // séance du groupe ACTIF plus tôt cette semaine
const JOUR_PHANTOM = isoDate(-1);          // jour 'cours' du calendrier partagé — AUTRE groupe
const SEMAINE = 5;

let stores;        // stockage partagé sync/async (db.getSync ET db.get)
let calendrier;    // calendrier PARTAGÉ du trimestre (union des groupes)
let seances;       // séances du groupe ACTIF (group-specific)
let win;

function creerSandbox() {
    stores = new Map();
    // Structure snapshots déjà initialisée (le flux auto exige son existence)
    stores.set('h2026_snapshots_GC-TEST', {
        hebdomadaires: [],
        interventions: [],
        metadata: { version: '1.0.0', dateCreation: '2026-01-01T00:00:00Z', dernierSnapshotHebdo: null, dernierSnapshotIntervention: null }
    });
    stores.set('infoCours', { _groupeCoursId: 'GC-TEST', id: 'COURS-TEST' });

    // Calendrier partagé : la semaine courante contient une séance du groupe
    // actif (il y a 3 jours), un jour phantôme (hier, cours d'un AUTRE groupe)
    // et aujourd'hui (groupe actif).
    calendrier = {
        [SEANCE_GROUPE_PASSEE]: { statut: 'cours', numeroSemaine: SEMAINE },
        [JOUR_PHANTOM]: { statut: 'cours', numeroSemaine: SEMAINE },
        [AUJOURDHUI]: { statut: 'cours', numeroSemaine: SEMAINE }
    };

    // Séances group-specific : le groupe actif n'a PAS cours le jour phantôme
    seances = {
        [SEANCE_GROUPE_PASSEE]: [{ numeroSemaine: SEMAINE }],
        [AUJOURDHUI]: [{ numeroSemaine: SEMAINE }]
    };

    const db = {
        useIndexedDB: false,
        memoryCache: new Map(),
        getSync: (k, d) => (stores.has(k) ? stores.get(k) : (d !== undefined ? d : null)),
        setSync: (k, v) => { stores.set(k, v); },
        get: async (k) => (stores.has(k) ? stores.get(k) : null),
        set: async (k, v) => { stores.set(k, v); },
        // #522 lot 5 : le site écrit par `db.modifier` ; même contrat (un `undefined` n'écrit rien).
        modifier: async (k, mutateur, defaut = null) => {
            const r = await mutateur(stores.has(k) ? stores.get(k) : defaut);
            if (r !== undefined) stores.set(k, r);
            return r;
        }
    };

    const win = chargerScript('js/snapshots.js', {
        db,
        cle: (k) => 'h2026_' + k,
        obtenirCalendrierComplet: () => calendrier,
        obtenirSeancesCompletes: () => seances,
        obtenirEtudiantsCoursActif: () => [],
        estEtudiantExclu: () => false,
        obtenirDonneesSelonMode: () => [],
        obtenirEcheanceEffective: () => ({ date: null, assignee: false })
    });
    // #398 : les sites « aujourd'hui » consultent la SSOT window.dateLocaleYMD
    // (changement de harnais seulement — mêmes dates qu'avant via isoDate).
    win.dateLocaleYMD = () => AUJOURDHUI;
    return win;
}

beforeEach(() => {
    win = creerSandbox();
});

function snapshotsStockes() {
    return stores.get('h2026_snapshots_GC-TEST').hebdomadaires;
}

describe('#116-A · flux auto — captures limitées aux séances du groupe-cours ACTIF', () => {
    it('capture les dates du groupe actif de la semaine courante, JAMAIS le jour phantôme de l\'autre groupe', async () => {
        await win.verifierEtCapturerSnapshotHebdomadaire();

        const dates = snapshotsStockes().map(s => s.dateSeance).sort();
        expect(dates).toEqual([SEANCE_GROUPE_PASSEE, AUJOURDHUI].sort());
        expect(dates).not.toContain(JOUR_PHANTOM);
    });

    it('ne fait rien si un snapshot existe déjà pour la semaine courante', async () => {
        stores.get('h2026_snapshots_GC-TEST').hebdomadaires.push({
            id: 'SEANCE-' + SEANCE_GROUPE_PASSEE, dateSeance: SEANCE_GROUPE_PASSEE, numSemaine: SEMAINE
        });

        await win.verifierEtCapturerSnapshotHebdomadaire();

        expect(snapshotsStockes()).toHaveLength(1);
    });

    it('ne fait rien si le jour courant est hors trimestre (pas de numeroSemaine)', async () => {
        delete calendrier[AUJOURDHUI];

        await win.verifierEtCapturerSnapshotHebdomadaire();

        expect(snapshotsStockes()).toHaveLength(0);
    });
});

describe('#116-B · capturerSnapshotSeance — dédoublonnage par dateSeance', () => {
    it('recapturer la même séance REMPLACE le snapshot (pas de duplicata)', async () => {
        const s1 = await win.capturerSnapshotSeance(AUJOURDHUI, [], { numeroSemaine: SEMAINE });
        expect(s1).not.toBeNull();
        expect(snapshotsStockes()).toHaveLength(1);

        const s2 = await win.capturerSnapshotSeance(AUJOURDHUI, [], { numeroSemaine: SEMAINE });
        expect(s2).not.toBeNull();
        expect(snapshotsStockes()).toHaveLength(1);
        expect(snapshotsStockes()[0].dateSeance).toBe(AUJOURDHUI);
    });

    it('une date différente s\'AJOUTE (le dédoublonnage ne mange pas les autres séances)', async () => {
        await win.capturerSnapshotSeance(SEANCE_GROUPE_PASSEE, [], { numeroSemaine: SEMAINE });
        await win.capturerSnapshotSeance(AUJOURDHUI, [], { numeroSemaine: SEMAINE });

        expect(snapshotsStockes()).toHaveLength(2);
    });

    it('zéro-dette #116 : le wrapper LEGACY capturerSnapshotHebdomadaire est bien retiré', () => {
        expect(win.capturerSnapshotHebdomadaire).toBeUndefined();
        expect(typeof win.capturerSnapshotSeance).toBe('function');
    });
});
