import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #529 — Lot 1 : la conversion « code de niveau -> score » ne
// présume plus AUCUN code, et n'invente plus AUCUNE valeur.
//
// CE QUI EXISTAIT AVANT, ET QUE PERSONNE NE TESTAIT.
//
// `obtenirTableConversionIDME` filtrait les niveaux sur `['0','I','D','M','E']`
// — codes en dur — puis, si rien ne sortait, RENDAIT une table fabriquée :
// {0:0, I:0.40, D:0.65, M:0.75, E:1.00}. Deux conséquences, mesurées ici :
//
//   · une échelle A/B/C/D produisait une table VIDE puis les valeurs IDME de
//     quelqu'un d'autre — des scores parfaitement faux, sans un mot ;
//   · impossible de distinguer « l'échelle dit 0.65 » de « on n'a rien trouvé ».
//
// Et il y en avait TROIS, aux valeurs mutuellement incompatibles :
// profil-etudiant-calculs (I:0.40), pratique-pan-standards (I:0.55),
// consolidation (I:0.40). Selon le chemin, un même niveau valait 0.40 ou 0.55.
//
// Règle appliquée (Grégoire, 26 août 2026) : « rien ne doit être codé en dur,
// mais l'échelle IDME peut être seedée ». Un seed est une ÉCHELLE LIVRÉE, que
// l'utilisateur voit et modifie — pas des nombres qu'un calcul invente.
//
// La suite Vitest était à 3420/3420 AVANT ce correctif : ces replis n'étaient
// exercés par aucun test. C'est précisément ce que cette sentinelle répare.

let win;
let echellesEnBase = [];

beforeAll(() => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, defaut) => {
                if (k === 'test_echellesTemplates') return echellesEnBase;
                return defaut !== undefined ? defaut : null;
            },
            set: async () => {},
            setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null,
        obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {},
        afficherSection: () => {},
        afficherSousSection: () => {},
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
        obtenirSeuil: () => 0.65,
        chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false,
        filtrerEtudiantsParMode: (arr) => arr,
        estModeeLectureSeule: () => false,
        genererSeancesCompletes: () => {},
        calculerEtSauvegarderIndicesAssiduite: () => {},
        calculerEtStockerIndicesCP: () => {}
    };
    win = chargerScript('js/profil-etudiant-helpers.js', stubs);
    chargerScript('js/profil-etudiant-calculs.js', stubs, win);
});

describe('#529 Lot 1 · la table de conversion se construit depuis l\'échelle, sans code présumé', () => {

    it('une échelle A/B/C/D est convertie — le cas qui rendait le profil FAUX', () => {
        echellesEnBase = [{
            id: 'ECH_ABCD', nom: 'Lettres',
            niveaux: [
                { code: 'A', nom: 'Excellent', valeurCalcul: 95 },
                { code: 'B', nom: 'Bien', valeurCalcul: 82 },
                { code: 'C', nom: 'Passable', valeurCalcul: 68 },
                { code: 'D', nom: 'Échec', valeurCalcul: 45 }
            ]
        }];
        const table = win.obtenirTableConversionNiveaux('ECH_ABCD');
        expect(table, 'une échelle non-IDME doit produire une table').not.toBeNull();
        expect(Object.keys(table).sort()).toEqual(['A', 'B', 'C', 'D']);
        expect(table.A).toBeCloseTo(0.95, 5);
        expect(table.D).toBeCloseTo(0.45, 5);
        // Et surtout : AUCUN code IDME ne s'est invité dans la table.
        expect(table.I, 'aucun code étranger à l\'échelle ne doit apparaître').toBeUndefined();
        expect(table.M).toBeUndefined();
    });

    it('le niveau 0 vaut ZÉRO, il n\'est pas une absence de score', () => {
        echellesEnBase = [{
            id: 'ECH_0IDME', nom: '0-IDME (5 niv.)',
            niveaux: [
                { code: '0', nom: 'Non remis', valeurCalcul: 0 },
                { code: 'I', nom: 'Insuffisant', valeurCalcul: 40 },
                { code: 'D', nom: 'En développement', valeurCalcul: 65 },
                { code: 'M', nom: 'Maîtrisé', valeurCalcul: 80 },
                { code: 'E', nom: 'Expert', valeurCalcul: 95 }
            ]
        }];
        const table = win.obtenirTableConversionNiveaux('ECH_0IDME');
        expect(table['0'], 'le zéro doit être DANS la table').toBe(0);

        // Le vrai piège était en aval : `tableConversion[niveau] || null`
        // transformait un score de 0 en « pas de score ». Un niveau 0 était donc
        // EXCLU des moyennes au lieu d'y compter pour zéro.
        expect(win.convertirNiveauEnScore('0', table), 'zéro est un score, pas un trou').toBe(0);
        expect(win.convertirNiveauEnScore('M', table)).toBeCloseTo(0.80, 5);
    });

    it('aucune échelle exploitable → null, JAMAIS des valeurs inventées', () => {
        echellesEnBase = [];
        expect(win.obtenirTableConversionNiveaux(), 'sans échelle : null').toBeNull();

        // Le repli retiré aurait rendu {0:0, I:0.40, D:0.65, M:0.75, E:1.00}.
        // Vérifier l'absence de CES valeurs-là, pas seulement « quelque chose ».
        echellesEnBase = [{ id: 'ECH_VIDE', nom: 'Sans niveaux', niveaux: [] }];
        expect(win.obtenirTableConversionNiveaux('ECH_VIDE')).toBeNull();

        // Une échelle dont aucun niveau ne porte de valeur ponctuelle : la
        // structure existe, la donnée non. On ne comble pas.
        echellesEnBase = [{
            id: 'ECH_SANS_VAL', nom: 'Plages seules',
            niveaux: [{ code: 'A', nom: 'A', min: 80, max: 100 }, { code: 'B', nom: 'B', min: 0, max: 79 }]
        }];
        expect(win.obtenirTableConversionNiveaux('ECH_SANS_VAL'),
            'des plages ne sont pas des notes ponctuelles : ne rien inventer').toBeNull();
    });

    it('plusieurs échelles et aucune désignée → null : on ne DEVINE pas laquelle', () => {
        echellesEnBase = [
            { id: 'E1', nom: 'Une', niveaux: [{ code: 'A', valeurCalcul: 90 }] },
            { id: 'E2', nom: 'Deux', niveaux: [{ code: 'A', valeurCalcul: 50 }] }
        ];
        expect(win.obtenirTableConversionNiveaux(),
            'deux échelles, deux vérités : l\'appelant doit dire laquelle').toBeNull();

        // Désignée, elle répond — et c'est la BONNE des deux.
        expect(win.obtenirTableConversionNiveaux('E2').A).toBeCloseTo(0.50, 5);
    });

    it('une table nulle ne casse pas la conversion en aval', () => {
        expect(win.convertirNiveauEnScore('M', null),
            'le contrat null est nouveau : il doit être tenu jusqu\'au bout').toBeNull();
        expect(win.convertirNiveauEnScore(null, { M: 0.8 })).toBeNull();
        expect(win.convertirNiveauEnScore('  m  ', { M: 0.8 }),
            'la casse et les espaces restent tolérés').toBeCloseTo(0.8, 5);
    });
});
