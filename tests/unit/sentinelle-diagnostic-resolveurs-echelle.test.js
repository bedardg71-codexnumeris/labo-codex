import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — LE DIAGNOSTIC DES DEUX RÉSOLVEURS D'ÉCHELLE DIT-IL VRAI ?
// (#590, 11 oct. 2026 : `idOriginal` n'est plus une cause ; restent la pratique et le pool.)
//
// `_diagnostiquerResolutionEchelles` existe pour trancher une question qu'aucune
// lecture de code ne peut trancher : la divergence entre `obtenirEchelleResolue`
// et `resoudreModeleParId` touche-t-elle des données RÉELLES, ou reste-t-elle
// théorique ? Un chantier de réconciliation sera ouvert — ou non — sur son
// chiffre.
//
// ⚠ D'OÙ CE BANC. Un diagnostic qui compte peut rendre « 0 divergent » pour deux
// raisons opposées : parce qu'il n'y a rien à trouver, ou parce qu'il ne lit
// rien. Les deux se ressemblent à l'écran, et la seconde est un mensonge
// tranquille — c'est le défaut « un montage incomplet mesure des zéros » que ce
// dépôt a déjà payé (#506, #511, et le break-test du 28 août).
//
// Ce banc tient donc les DEUX bords :
//   A — sur des données saines, il VOIT les identifiants et n'invente aucune
//       divergence (le zéro est un vrai zéro) ;
//   B — sur chacune des trois causes réelles, il la détecte ET la nomme ;
//   C — il ne touche à rien : aucune écriture, jamais.

let win;
let echellesEnBase = [];
let pratiquesEnBase = [];
let productionsEnBase = [];
let evaluationsEnBase = [];
let ecrituresInterdites = [];

// Le résolveur de l'AUTRE famille, injecté, à sa règle depuis #590 (11 oct.) :
// l'id exact puis `idOriginal`, sur le trimestre actif puis le pool. Sa cécité à
// `pratique-*` et son repli au pool sont ce que le diagnostic rend visible ; le
// vrai résolveur est tenu par `sentinelle-590-un-identifiant-une-echelle`.
let poolInterTrimestre = [];
function resoudreModeleParIdStub(type, id) {
    if (type !== 'echelle' || !id) return null;
    const chercher = (l) => l.find(e => e && e.id === id) || l.find(e => e && e.idOriginal === id) || null;
    return chercher(echellesEnBase) || chercher(poolInterTrimestre);
}

beforeAll(() => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, defaut) => {
                if (k === 'test_echellesTemplates') return echellesEnBase;
                if (k === 'test_pratiquesConfigurables') return pratiquesEnBase;
                if (k === 'test_productions') return productionsEnBase;
                if (k === 'test_evaluationsSauvegardees') return evaluationsEnBase;
                return defaut !== undefined ? defaut : null;
            },
            set: async (k) => { ecrituresInterdites.push(k); },
            setSync: (k) => { ecrituresInterdites.push(k); }
        },
        cle: (k) => 'test_' + k,
        resoudreModeleParId: resoudreModeleParIdStub,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null,
        obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {},
        afficherSection: () => {},
        afficherSousSection: () => {},
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
        obtenirSeuil: () => 0.70,
        chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false,
        filtrerEtudiantsParMode: (arr) => arr,
        estModeeLectureSeule: () => false,
        genererSeancesCompletes: () => {},
        calculerEtSauvegarderIndicesAssiduite: () => {},
        calculerEtStockerIndicesCP: () => {}
    };
    win = chargerScript('js/profil-etudiant-calculs.js', stubs);
});

beforeEach(() => {
    echellesEnBase = [];
    pratiquesEnBase = [];
    productionsEnBase = [];
    evaluationsEnBase = [];
    poolInterTrimestre = [];
    ecrituresInterdites = [];
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'table').mockImplementation(() => {});
});

const ECHELLE = {
    id: 'ECH_LOCALE',
    nom: 'IDME du cours',
    niveaux: [
        { code: 'I', nom: 'Incomplet', min: 0, max: 64, valeurCalcul: 32 },
        { code: 'D', nom: 'en Développement', min: 65, max: 74, valeurCalcul: 69 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 79 },
        { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 92 }
    ]
};

/* ------------------------------------------------- A — le zéro est un vrai zéro */

describe('diagnostic résolveurs · A — il lit vraiment, et n\'invente rien', () => {
    it('A.a la fonction est exportée sur window', () => {
        expect(typeof win._diagnostiquerResolutionEchelles).toBe('function');
    });

    it('A.b GARDE DE VALIDITÉ : sur des données saines il VOIT les identifiants', () => {
        echellesEnBase = [ECHELLE];
        productionsEnBase = [{ id: 'P1', echelleId: 'ECH_LOCALE' }, { id: 'P2', echelleId: 'ECH_LOCALE' }];
        evaluationsEnBase = [{ id: 'EV1', echelleId: 'ECH_LOCALE' }];

        const r = win._diagnostiquerResolutionEchelles();
        // Sans cette assertion, le « 0 divergent » ci-dessous passerait aussi
        // sur un diagnostic qui ne lit AUCUNE collection.
        expect(r.total).toBe(1);
        expect(r.lignes[0].productions).toBe(2);
        expect(r.lignes[0].evaluations).toBe(1);
        expect(r.divergents).toHaveLength(0);
        expect(r.lignes[0].cause).toBeNull();
    });

    it('A.c aucune donnée : il rend zéro sans se plaindre, et ne prétend rien', () => {
        const r = win._diagnostiquerResolutionEchelles();
        expect(r.total).toBe(0);
        expect(r.divergents).toHaveLength(0);
    });
});

/* --------------------------------------- B — les trois causes réelles, nommées */

describe('diagnostic résolveurs · B — il détecte ET nomme la cause', () => {
    it('B.a `idOriginal` : depuis #590, les deux résolvent — ce n\'est plus une divergence', () => {
        // Le scénario réel : `ajouterEchelleIndividuelle` pose `idOriginal` sur
        // l'échelle ajoutée depuis la bibliothèque, et des productions plus
        // anciennes désignent encore l'identifiant d'origine.
        echellesEnBase = [{ ...ECHELLE, id: 'ECH_NEUF', idOriginal: 'ECH_ANCIEN' }];
        productionsEnBase = [{ id: 'P1', echelleId: 'ECH_ANCIEN' }];

        const r = win._diagnostiquerResolutionEchelles();
        expect(r.total).toBe(1);
        expect(r.lignes[0].resolueParRetroaction).toBe(true);
        expect(r.lignes[0].resolueParRegistre).toBe(true);
        expect(r.divergents).toHaveLength(0);
    });

    it('B.b `pratique-*` : né sur une ÉVALUATION, pas sur une production', () => {
        pratiquesEnBase = [{ id: 'PRAT_1', config: { echelle: { niveaux: ECHELLE.niveaux } } }];
        evaluationsEnBase = [{ id: 'EV1', echelleId: 'pratique-PRAT_1' }];

        const r = win._diagnostiquerResolutionEchelles();
        expect(r.divergents).toHaveLength(1);
        expect(r.divergents[0].cause).toBe('echelle-de-pratique');
        // Le gisement compte : c'est pour ça que le diagnostic lit les DEUX.
        expect(r.divergents[0].evaluations).toBe(1);
        expect(r.divergents[0].productions).toBe(0);
    });

    it('B.c `pool-inter-trimestre` : la divergence joue DANS L\'AUTRE SENS', () => {
        // L'échelle vit dans un autre trimestre : le registre la trouve par son
        // pool, `obtenirEchelleResolue` ne lit que le trimestre actif.
        poolInterTrimestre = [{ ...ECHELLE, id: 'ECH_AUTRE_TRIMESTRE' }];
        productionsEnBase = [{ id: 'P1', echelleId: 'ECH_AUTRE_TRIMESTRE' }];
        echellesEnBase = [ECHELLE];

        const r = win._diagnostiquerResolutionEchelles();
        expect(r.divergents).toHaveLength(1);
        expect(r.divergents[0].resolueParRetroaction).toBe(false);
        expect(r.divergents[0].resolueParRegistre).toBe(true);
        expect(r.divergents[0].cause).toBe('pool-inter-trimestre');
    });

    it('B.d plusieurs causes coexistent sans se confondre', () => {
        echellesEnBase = [ECHELLE, { ...ECHELLE, id: 'ECH_NEUF', idOriginal: 'ECH_ANCIEN' }];
        poolInterTrimestre = [{ ...ECHELLE, id: 'ECH_AILLEURS' }];
        pratiquesEnBase = [{ id: 'PRAT_1', config: { echelle: { niveaux: ECHELLE.niveaux } } }];
        productionsEnBase = [
            { id: 'P1', echelleId: 'ECH_LOCALE' },      // sain
            { id: 'P2', echelleId: 'ECH_ANCIEN' },      // idOriginal : accord depuis #590
            { id: 'P3', echelleId: 'ECH_AILLEURS' }     // pool
        ];
        evaluationsEnBase = [{ id: 'EV1', echelleId: 'pratique-PRAT_1' }];

        const r = win._diagnostiquerResolutionEchelles();
        expect(r.total).toBe(4);
        expect(r.divergents).toHaveLength(2);
        expect(r.parCause).toEqual({
            'pool-inter-trimestre': 1,
            'echelle-de-pratique': 1
        });
    });

    it('B.e une cause qu\'il ne sait pas nommer se dit « indeterminee », pas au hasard', () => {
        // Identifiant que PERSONNE ne résout : ce n'est pas une divergence.
        productionsEnBase = [{ id: 'P1', echelleId: 'ECH_FANTOME' }];
        echellesEnBase = [ECHELLE];

        const r = win._diagnostiquerResolutionEchelles();
        expect(r.divergents).toHaveLength(0);
        expect(r.lignes[0].resolueParRetroaction).toBe(false);
        expect(r.lignes[0].resolueParRegistre).toBe(false);
    });
});

/* ------------------------------------------------------- C — lecture seule */

describe('diagnostic résolveurs · C — il ne touche à rien', () => {
    it('C.a aucune écriture, sur le cas le plus chargé', () => {
        echellesEnBase = [ECHELLE, { ...ECHELLE, id: 'ECH_NEUF', idOriginal: 'ECH_ANCIEN' }];
        pratiquesEnBase = [{ id: 'PRAT_1', config: { echelle: { niveaux: ECHELLE.niveaux } } }];
        productionsEnBase = [{ id: 'P1', echelleId: 'ECH_ANCIEN' }];
        evaluationsEnBase = [{ id: 'EV1', echelleId: 'pratique-PRAT_1' }];

        win._diagnostiquerResolutionEchelles();
        expect(ecrituresInterdites).toEqual([]);
    });

    it('C.b il survit à un dépôt où `resoudreModeleParId` n\'existe pas', () => {
        // Modules chargés isolément (tests, page partielle) : le diagnostic doit
        // le DIRE (null), pas planter ni inventer un verdict.
        const sansRegistre = chargerScript('js/profil-etudiant-calculs.js', {
            db: { get: async () => null, getSync: (k, d) => (k === 'test_productions' ? [{ id: 'P1', echelleId: 'X' }] : (d !== undefined ? d : null)), set: async () => {}, setSync: () => {} },
            cle: (k) => 'test_' + k,
            echapperHtml: (s) => String(s == null ? '' : s),
            obtenirDonneesSelonMode: () => [],
            obtenirPreference: () => null,
            obtenirEtudiantsCoursActif: () => [],
            afficherNotificationCopiee: () => {},
            afficherSection: () => {},
            afficherSousSection: () => {},
            calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
            obtenirSeuil: () => 0.70,
            chargerSeuilsInterpretation: () => ({}),
            estEtudiantExclu: () => false,
            filtrerEtudiantsParMode: (arr) => arr,
            estModeeLectureSeule: () => false,
            genererSeancesCompletes: () => {},
            calculerEtSauvegarderIndicesAssiduite: () => {},
            calculerEtStockerIndicesCP: () => {}
        });
        const r = sansRegistre._diagnostiquerResolutionEchelles();
        expect(r.lignes[0].resolueParRegistre).toBeNull();
    });
});
