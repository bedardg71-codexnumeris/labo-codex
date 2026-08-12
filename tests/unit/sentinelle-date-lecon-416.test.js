import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// LA DATE DÉRIVÉE (#416 lot C) — semaine + rang, confrontés à l'horaire.
//
// Ce que ce lot garde : une leçon ne porte pas de date. La date est ce que
// donnent sa semaine (#410) et son rang (#416 lot A) quand on les confronte à
// l'horaire du groupe. La stocker figerait un calcul — déplacer une leçon, ou
// corriger un congé, la rendrait fausse en silence.
//
// ⚠ CE QUE CETTE SENTINELLE SURVEILLE VRAIMENT, et qui n'est pas la date :
// les séances vivent par GROUPE-COURS, la carte se rattache à un COURS. La
// chaîne d'horaire lisait le groupe ACTIF en ignorant son argument, et sa
// « lecture » ÉCRIT quand le cache manque. Un export qui désigne un groupe
// étranger pouvait donc régénérer les séances de l'un sous la clé de l'autre.
// Les cas « lecture stricte » ci-dessous sont là pour ça.
//
// Sentinelle COMPORTEMENTALE : elle instancie les deux vraies sources et les
// exerce. Aucun cas ne cherche une chaîne dans le fichier.

let store;
let ecritures;

function monterHoraire() {
    const win = chargerScript('js/horaire.js', {
        db: fauxDb(),
        cle: (k) => `a2026_${k}`,
        document: { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} }
    });
    return win;
}

function fauxDb() {
    return {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { ecritures.push(k); store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { ecritures.push(k); store[k] = v; }
    };
}

/** Une séance telle que `genererSeancesCompletes` la produit réellement. */
function seance(date, numeroSemaine, nom = 'A') {
    return {
        id: `SEANCE-${date}-${nom}`,
        nom, date, jour: 'lundi',
        debut: '08:30', fin: '10:20', duree: 110,
        numeroSemaine
    };
}

beforeEach(() => {
    store = {};
    ecritures = [];
});

// ---------------------------------------------------------------------------
// 1. La clé : un groupe explicite commande, l'état global ne s'en mêle pas
// ---------------------------------------------------------------------------

describe('cleSeancesCompletes — le groupe explicite (#416 lot C)', () => {
    it('rend la clé du groupe DEMANDÉ, pas celle du groupe actif', () => {
        store['groupeCoursActif'] = { id: 'GC_ACTIF' };
        const win = monterHoraire();

        expect(win.cleSeancesCompletes(null, 'GC_AUTRE')).toBe('seancesCompletes_gc_GC_AUTRE');
    });

    it('sans groupe explicite, garde EXACTEMENT le comportement historique', () => {
        store['groupeCoursActif'] = { id: 'GC_ACTIF' };
        const win = monterHoraire();

        expect(win.cleSeancesCompletes(null)).toBe('seancesCompletes_gc_GC_ACTIF');
        expect(win.cleSeancesCompletes('COURS_X')).toBe('seancesCompletes_gc_GC_ACTIF');
    });

    it('sans groupe actif ni groupe explicite, retombe sur le cours', () => {
        const win = monterHoraire();
        expect(win.cleSeancesCompletes('COURS_X')).toBe('seancesCompletes_COURS_X');
    });

    it('le groupe explicite n’a pas besoin qu’un groupe soit actif', () => {
        const win = monterHoraire();
        expect(win.cleSeancesCompletes(null, 'GC_SEUL')).toBe('seancesCompletes_gc_GC_SEUL');
    });
});

// ---------------------------------------------------------------------------
// 2. La lecture stricte : on lit, ou on rend vide. Jamais on n'écrit.
// ---------------------------------------------------------------------------

describe('obtenirSeancesCompletesDuGroupe — lecture stricte (#416 lot C)', () => {
    it('rend les séances du groupe demandé', () => {
        store['seancesCompletes_gc_GC_1'] = { '2026-09-08': [seance('2026-09-08', 3)] };
        const win = monterHoraire();

        const lu = win.obtenirSeancesCompletesDuGroupe('GC_1');
        expect(Object.keys(lu)).toEqual(['2026-09-08']);
    });

    it('CACHE ABSENT → rend {} et n’écrit RIEN', () => {
        store['groupeCoursActif'] = { id: 'GC_ACTIF' };
        const win = monterHoraire();

        expect(win.obtenirSeancesCompletesDuGroupe('GC_SANS_CACHE')).toEqual({});
        expect(ecritures).toEqual([]);
    });

    it('ne touche jamais la clé du groupe ACTIF quand on demande un autre groupe', () => {
        store['groupeCoursActif'] = { id: 'GC_ACTIF' };
        store['seancesCompletes_gc_GC_ACTIF'] = { '2026-09-08': [seance('2026-09-08', 3)] };
        const win = monterHoraire();

        win.obtenirSeancesCompletesDuGroupe('GC_AUTRE');

        expect(ecritures).toEqual([]);
        expect(store['seancesCompletes_gc_GC_ACTIF']).toEqual({ '2026-09-08': [seance('2026-09-08', 3)] });
    });

    it('refuse un identifiant vide plutôt que de servir le groupe ACTIF', () => {
        // ⚠ L'observable est ici, et nulle part ailleurs : sans la garde,
        // `cleSeancesCompletes(null, '')` retombe sur le groupe actif et rend
        // SES séances. Un test sans groupe actif au magasin voit {} dans les
        // deux cas et ne prouve rien — c'est la version qui a d'abord résisté
        // au banc de cassure.
        store['groupeCoursActif'] = { id: 'GC_ACTIF' };
        store['seancesCompletes_gc_GC_ACTIF'] = { '2026-09-08': [seance('2026-09-08', 3)] };
        const win = monterHoraire();

        expect(win.obtenirSeancesCompletesDuGroupe('')).toEqual({});
        expect(win.obtenirSeancesCompletesDuGroupe(null)).toEqual({});
        expect(win.obtenirSeancesCompletesDuGroupe(undefined)).toEqual({});
        expect(win.obtenirSeancesCompletesDuGroupe({ id: 'GC_ACTIF' })).toEqual({});
    });

    it('une donnée corrompue (tableau, chaîne) ne se propage pas au générateur', () => {
        store['seancesCompletes_gc_GC_1'] = ['pas', 'un', 'objet'];
        store['seancesCompletes_gc_GC_2'] = 'chaîne';
        const win = monterHoraire();

        expect(win.obtenirSeancesCompletesDuGroupe('GC_1')).toEqual({});
        expect(win.obtenirSeancesCompletesDuGroupe('GC_2')).toEqual({});
    });
});

// ---------------------------------------------------------------------------
// 3. La dérivation elle-même
// ---------------------------------------------------------------------------

function monterExport(seancesParGroupe = {}, groupesCours = [], coursDeCarte = null) {
    Object.keys(seancesParGroupe).forEach((gc) => {
        store[`seancesCompletes_gc_${gc}`] = seancesParGroupe[gc];
    });
    store['a2026_groupesCours'] = groupesCours;

    const win = chargerScript('js/planification-export.js', {
        db: fauxDb(),
        cle: (k) => `a2026_${k}`,
        document: { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} }
    });
    win.db = fauxDb();
    win.cle = (k) => `a2026_${k}`;
    win.obtenirSeancesCompletesDuGroupe = monterHoraire().obtenirSeancesCompletesDuGroupe;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'A26' }] }),
        obtenirCoursDeCarte: () => coursDeCarte
    };
    return win.planificationExport;
}

/** Deux rencontres en semaine 3, une seule en semaine 4. */
const HORAIRE_REEL = {
    '2026-09-08': [seance('2026-09-08', 3, 'A')],
    '2026-09-11': [seance('2026-09-11', 3, 'B')],
    '2026-09-15': [seance('2026-09-15', 4, 'A')]
};

describe('dateDeLecon — semaine + rang → date (#416 lot C)', () => {
    it('rang 1 rend la PREMIÈRE rencontre de la semaine, rang 2 la deuxième', () => {
        const api = monterExport({ GC_1: HORAIRE_REEL });
        const horaire = api.construireHoraireDeLecons('GC_1');

        expect(api.dateDeLecon(horaire, 3, 1)).toBe('2026-09-08');
        expect(api.dateDeLecon(horaire, 3, 2)).toBe('2026-09-11');
    });

    it('l’ordre vient des DATES, pas de l’ordre de lecture du magasin', () => {
        const desordre = {
            '2026-09-11': [seance('2026-09-11', 3, 'B')],
            '2026-09-08': [seance('2026-09-08', 3, 'A')]
        };
        const api = monterExport({ GC_1: desordre });
        const horaire = api.construireHoraireDeLecons('GC_1');

        expect(api.dateDeLecon(horaire, 3, 1)).toBe('2026-09-08');
    });

    it('DEUX PÉRIODES LE MÊME JOUR font UNE rencontre, pas deux', () => {
        // Le rang compte les rencontres — c'est le décompte de
        // obtenirRangSeanceDansSemaine, qui indexe des DATES.
        const deuxPeriodes = {
            '2026-09-08': [seance('2026-09-08', 3, 'A'), seance('2026-09-08', 3, 'A')],
            '2026-09-11': [seance('2026-09-11', 3, 'B')]
        };
        const api = monterExport({ GC_1: deuxPeriodes });
        const horaire = api.construireHoraireDeLecons('GC_1');

        expect(api.dateDeLecon(horaire, 3, 2)).toBe('2026-09-11');
    });

    it('ÉTAT DÉGRADÉ — pas d’horaire résolu : null, pas une exception', () => {
        const api = monterExport({});
        expect(api.dateDeLecon(null, 3, 1)).toBeNull();
    });

    it('ÉTAT DÉGRADÉ — rang non posé : null', () => {
        const api = monterExport({ GC_1: HORAIRE_REEL });
        const horaire = api.construireHoraireDeLecons('GC_1');

        expect(api.dateDeLecon(horaire, 3, null)).toBeNull();
        expect(api.dateDeLecon(horaire, 3, undefined)).toBeNull();
    });

    it('ÉTAT DÉGRADÉ — semaine sans séance à ce rang : null', () => {
        const api = monterExport({ GC_1: HORAIRE_REEL });
        const horaire = api.construireHoraireDeLecons('GC_1');

        expect(api.dateDeLecon(horaire, 4, 2)).toBeNull();   // une seule rencontre
        expect(api.dateDeLecon(horaire, 99, 1)).toBeNull();  // semaine hors trimestre
    });

    it('un rang nul ou négatif ne rend jamais la dernière date par débordement', () => {
        const api = monterExport({ GC_1: HORAIRE_REEL });
        const horaire = api.construireHoraireDeLecons('GC_1');

        expect(api.dateDeLecon(horaire, 3, 0)).toBeNull();
        expect(api.dateDeLecon(horaire, 3, -1)).toBeNull();
    });

    it('un horaire sans aucune séance datable rend null, pas un objet vide trompeur', () => {
        const api = monterExport({ GC_1: { '2026-09-08': [] } });
        expect(api.construireHoraireDeLecons('GC_1')).toBeNull();
    });

    it('une séance sans numéro de semaine est ÉCARTÉE, pas rangée sous une semaine inventée', () => {
        const partiel = {
            '2026-09-08': [{ date: '2026-09-08' }],                  // pas de numeroSemaine
            '2026-09-11': [seance('2026-09-11', 3, 'B')]
        };
        const api = monterExport({ GC_1: partiel });
        const horaire = api.construireHoraireDeLecons('GC_1');

        expect(api.dateDeLecon(horaire, 3, 1)).toBe('2026-09-11');
        // ⚠ L'observable qui compte : la table ne contient QUE des semaines
        // réelles. Ranger la date muette sous une semaine 0 laisserait le
        // premier test vert tout en salissant la table — c'est la version qui
        // a d'abord résisté au banc de cassure.
        expect(Object.keys(horaire.datesParSemaine)).toEqual(['3']);
    });
});

// ---------------------------------------------------------------------------
// 4. Le choix du groupe (D9) — pris d'office s'il est seul, jamais deviné
// ---------------------------------------------------------------------------

describe('le groupe de l’export (D9, #416 lot C)', () => {
    it('ne retient que les groupes du cours de la carte', () => {
        const api = monterExport({}, [
            { id: 'GC_1', nom: 'A26-601-101-01', coursId: 'COURS_A' },
            { id: 'GC_2', nom: 'A26-601-101-02', coursId: 'COURS_A' },
            { id: 'GC_3', nom: 'A26-602-103-01', coursId: 'COURS_B' }
        ], 'COURS_A');

        expect(api.groupesCoursDeLaCarte().map((g) => g.id)).toEqual(['GC_1', 'GC_2']);
    });

    it('carte sans cours rattaché : aucun groupe, PAS MÊME un groupe orphelin', () => {
        // ⚠ Le magasin porte un groupe dont le `coursId` vaut null — la forme
        // qu'un champ vidé prend après un aller-retour JSON. `obtenirCoursDeCarte`
        // rend null lui aussi pour une carte détachée : sans la garde sur le
        // cours, `null === null` ferait remonter ce groupe comme candidat.
        // Un fixture sans ce cas laisse le test vert et ne prouve rien — deux
        // versions ont résisté au banc de cassure avant celle-ci.
        const api = monterExport({}, [
            { id: 'GC_1', coursId: 'COURS_A' },
            { id: 'GC_DETACHE', nom: 'cours vidé', coursId: null },
            { id: 'GC_ORPHELIN', nom: 'saisi à moitié' }
        ], null);

        expect(api.groupesCoursDeLaCarte()).toEqual([]);
    });

    it('un groupe unique est pris SANS rien demander', () => {
        const api = monterExport(
            { GC_1: HORAIRE_REEL },
            [{ id: 'GC_1', nom: 'A26-601-101-01', coursId: 'COURS_A' }],
            'COURS_A'
        );
        const candidats = api.groupesCoursDeLaCarte();
        expect(candidats).toHaveLength(1);

        const horaire = api.construireHoraireDeLecons(candidats[0].id);
        expect(api.dateDeLecon(horaire, 3, 1)).toBe('2026-09-08');
    });

    it('DEUX GROUPES, DEUX HORAIRES — la date suit le groupe demandé', () => {
        // Le cas qui justifie D9 : le même cours, deux groupes, des dates
        // différentes. Prendre « le groupe actif » rendrait une date fausse
        // sans que rien ne le signale.
        const api = monterExport({
            GC_1: HORAIRE_REEL,
            GC_2: {
                '2026-09-09': [seance('2026-09-09', 3, 'A')],
                '2026-09-12': [seance('2026-09-12', 3, 'B')]
            }
        }, [
            { id: 'GC_1', coursId: 'COURS_A' },
            { id: 'GC_2', coursId: 'COURS_A' }
        ], 'COURS_A');

        expect(api.dateDeLecon(api.construireHoraireDeLecons('GC_1'), 3, 1)).toBe('2026-09-08');
        expect(api.dateDeLecon(api.construireHoraireDeLecons('GC_2'), 3, 1)).toBe('2026-09-09');
    });

    it('aucun groupe désigné : pas d’horaire, donc pas de devinette', () => {
        const api = monterExport({ GC_1: HORAIRE_REEL });
        expect(api.construireHoraireDeLecons(null)).toBeNull();
        expect(api.construireHoraireDeLecons('')).toBeNull();
    });
});
