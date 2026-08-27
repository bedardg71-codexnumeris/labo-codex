import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #542 lot 3, pas 3a — UNE SEULE RÉSOLUTION D'ÉCHELLE, LUE PAR DEUX
// CONSOMMATEURS.
//
// CE QUE CE PAS A SÉPARÉ, ET POURQUOI.
//
// `obtenirTableConversionNiveaux` faisait deux choses : RÉSOUDRE une échelle
// (deux gisements, reconnaissance par `idOriginal`, refus de deviner quand
// plusieurs existent), puis la RÉDUIRE à une table `{ code: score }`. Le
// dépistage a maintenant besoin des deux moitiés séparément — la table pour
// convertir un niveau en note, les PLAGES pour situer une moyenne, l'étiquette
// SOLO pour l'interpréter.
//
// ⮕ LA TENTATION QUE CETTE SENTINELLE INTERDIT : écrire une seconde résolution
// à côté, pour obtenir les plages. C'est mot pour mot le patron que #529 a passé
// une session à défaire — deux chemins parallèles, un même identifiant qui
// résout différemment selon l'appelant, et des blocs qui se vident en silence.
//
// D'où la forme des tests : ils n'affirment pas seulement que chaque fonction
// marche, ils affirment que les deux SONT D'ACCORD sur les cas où une
// résolution naïve diverge — `idOriginal`, ambiguïté, échelle de pratique.

let win;
let echellesEnBase = [];
let pratiquesEnBase = [];

beforeAll(() => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, defaut) => {
                if (k === 'test_echellesTemplates') return echellesEnBase;
                if (k === 'test_pratiquesConfigurables') return pratiquesEnBase;
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

beforeEach(() => { echellesEnBase = []; pratiquesEnBase = []; });

// Une échelle qui porte TOUT ce dont les deux consommateurs ont besoin :
// `valeurCalcul` pour la table, `min`/`max` pour les plages, `niveauSOLO` pour
// l'interprétation.
const ECHELLE_COMPLETE = {
    id: 'ECH_ABCD',
    nom: 'Échelle A/B/C/D',
    niveaux: [
        { code: 'D', nom: 'Débutant',   min: 0,  max: 49,  valeurCalcul: 25, niveauSOLO: 'unistructurel' },
        { code: 'C', nom: 'Compétent',  min: 50, max: 69,  valeurCalcul: 60, niveauSOLO: 'multistructurel' },
        { code: 'B', nom: 'Avancé',     min: 70, max: 84,  valeurCalcul: 78, niveauSOLO: 'relationnel' },
        { code: 'A', nom: 'Exemplaire', min: 85, max: 100, valeurCalcul: 92, niveauSOLO: 'abstrait_etendu' }
    ]
};

describe('#542 lot 3 pas 3a · obtenirEchelleResolue', () => {

    it('1. la fonction est exportée sur window', () => {
        expect(typeof win.obtenirEchelleResolue).toBe('function');
    });

    it('2. elle rend l\'échelle ENTIÈRE — plages et étiquettes comprises, pas une table', () => {
        echellesEnBase = [ECHELLE_COMPLETE];
        const e = win.obtenirEchelleResolue('ECH_ABCD');
        expect(e).not.toBeNull();
        expect(e.niveaux).toHaveLength(4);
        // Ce que la table de conversion PERD, et qui est tout l'objet du pas 3 :
        expect(e.niveaux[2].min).toBe(70);
        expect(e.niveaux[2].max).toBe(84);
        expect(e.niveaux[2].niveauSOLO).toBe('relationnel');
        expect(e.niveaux[2].nom).toBe('Avancé');
    });

    it('3. le résultat se branche sur les deux fonctions du lot 3 sans adaptateur', () => {
        // La preuve que la séparation sert à quelque chose : l'objet rendu ici
        // est exactement ce que `situerPourcentageDansEchelle` attend.
        echellesEnBase = [ECHELLE_COMPLETE];
        const e = win.obtenirEchelleResolue('ECH_ABCD');
        const niveau = e.niveaux.find(n => 72 >= n.min && 72 <= n.max);
        expect(niveau.code).toBe('B');
        expect(niveau.niveauSOLO).toBe('relationnel');
    });

    // ─── LES CAS OÙ UNE SECONDE RÉSOLUTION, ÉCRITE NAÏVEMENT, DIVERGERAIT ───

    it('4. ACCORD sur `idOriginal` — une échelle se reconnaît aussi par son id d\'origine', () => {
        echellesEnBase = [{ ...ECHELLE_COMPLETE, id: 'ECH_NOUVEAU', idOriginal: 'ECH_ANCIEN' }];
        const e = win.obtenirEchelleResolue('ECH_ANCIEN');
        const t = win.obtenirTableConversionNiveaux('ECH_ANCIEN');
        expect(e, 'résolue par idOriginal').not.toBeNull();
        expect(t, 'la table doit résoudre le MÊME id').not.toBeNull();
        expect(e.id).toBe('ECH_NOUVEAU');
    });

    it('5. ACCORD sur le refus de deviner — plusieurs échelles, aucune désignée', () => {
        echellesEnBase = [ECHELLE_COMPLETE, { ...ECHELLE_COMPLETE, id: 'ECH_AUTRE' }];
        expect(win.obtenirEchelleResolue(null), 'ne devine pas').toBeNull();
        expect(win.obtenirTableConversionNiveaux(null), 'ne devine pas non plus').toBeNull();
    });

    it('6. ACCORD sur l\'absence d\'ambiguïté — une seule échelle, aucune désignée', () => {
        echellesEnBase = [ECHELLE_COMPLETE];
        expect(win.obtenirEchelleResolue(null)).not.toBeNull();
        expect(win.obtenirTableConversionNiveaux(null)).not.toBeNull();
    });

    it('7. ACCORD sur l\'échelle EMBARQUÉE d\'une pratique configurable (#542 A2)', () => {
        // Le gisement que le dépistage ne lisait pas, et dont l'oubli rendait
        // « Stable » pour un élève en difficulté sur tous ses critères.
        pratiquesEnBase = [{ id: 'prat1', config: { echelle: ECHELLE_COMPLETE } }];
        const e = win.obtenirEchelleResolue('pratique-prat1');
        const t = win.obtenirTableConversionNiveaux('pratique-prat1');
        expect(e, 'l\'échelle embarquée doit être résolue').not.toBeNull();
        expect(e.niveaux[0].min).toBe(0);
        expect(t, 'la table doit résoudre le MÊME gisement').not.toBeNull();
    });

    it('8. ACCORD sur les échecs — id inconnu, pratique disparue, base vide', () => {
        echellesEnBase = [ECHELLE_COMPLETE];
        for (const id of ['ECH_INCONNU', 'pratique-nexistepas']) {
            expect(win.obtenirEchelleResolue(id), `échelle pour ${id}`).toBeNull();
            expect(win.obtenirTableConversionNiveaux(id), `table pour ${id}`).toBeNull();
        }
        echellesEnBase = [];
        expect(win.obtenirEchelleResolue('ECH_ABCD')).toBeNull();
        expect(win.obtenirTableConversionNiveaux('ECH_ABCD')).toBeNull();
    });

    it('9. ACCORD sur une échelle SANS niveaux exploitables', () => {
        echellesEnBase = [{ id: 'ECH_VIDE', nom: 'Vide', niveaux: [] }];
        expect(win.obtenirEchelleResolue('ECH_VIDE')).toBeNull();
        expect(win.obtenirTableConversionNiveaux('ECH_VIDE')).toBeNull();
    });

    it('10. LA SENTINELLE DE FOND — la table se DÉRIVE de l\'échelle résolue, elle ne la re-résout pas', () => {
        // Balayage des cas ci-dessus en une assertion : pour chaque entrée, les
        // deux fonctions doivent être d'accord sur « y a-t-il une échelle ? ».
        // Une seconde résolution écrite à côté finirait par répondre non sur un
        // de ces cas — c'est précisément ce qu'on veut voir rougir.
        echellesEnBase = [
            { ...ECHELLE_COMPLETE, id: 'ECH_UN', idOriginal: 'ECH_VIEUX' },
            { ...ECHELLE_COMPLETE, id: 'ECH_DEUX' }
        ];
        pratiquesEnBase = [{ id: 'prat1', config: { echelle: ECHELLE_COMPLETE } }];

        const cas = ['ECH_UN', 'ECH_VIEUX', 'ECH_DEUX', 'pratique-prat1',
                     'ECH_INCONNU', 'pratique-absente', null];
        const desaccords = cas.filter((id) => {
            const aEchelle = win.obtenirEchelleResolue(id) !== null;
            const aTable = win.obtenirTableConversionNiveaux(id) !== null;
            return aEchelle !== aTable;
        });
        expect(desaccords, `résolutions divergentes pour : ${desaccords.join(', ')}`).toEqual([]);

        // Garde anti-silence : le balayage doit avoir exercé les DEUX réponses,
        // sinon il ne prouve rien. (4 ids résolvent, 3 non.)
        const resolus = cas.filter((id) => win.obtenirEchelleResolue(id) !== null);
        expect(resolus.length, 'des cas doivent résoudre').toBe(4);
        expect(cas.length - resolus.length, 'et d\'autres doivent échouer').toBe(3);
    });

    it('11. LE DÉSACCORD LÉGITIME — des plages sans `valeurCalcul` situent, mais ne convertissent pas', () => {
        // ⚠ Ce cas est la FRONTIÈRE entre les deux consommateurs, et il ne doit
        // PAS être aligné de force. Une échelle dont tous les niveaux sont en
        // « jugement suspendu » (aucune `valeurCalcul`) porte quand même des
        // plages : elle permet de SITUER une moyenne, mais rien à convertir en
        // note. `_tableDepuisNiveaux` rend donc `null` là où l'échelle, elle,
        // existe bel et bien.
        //
        // ⮕ C'est pourquoi la sentinelle 10 porte sur la résolution de
        // l'IDENTIFIANT — « cet id désigne-t-il une échelle ? » — et non sur
        // l'exploitabilité, qui dépend de ce qu'on veut en faire.
        echellesEnBase = [{
            id: 'ECH_PLAGES_SEULES',
            nom: 'Plages sans note ponctuelle',
            niveaux: [
                { code: 'P', nom: 'Partiel', min: 0,  max: 59, niveauSOLO: 'unistructurel' },
                { code: 'R', nom: 'Réussi',  min: 60, max: 100, niveauSOLO: 'relationnel' }
            ]
        }];
        const e = win.obtenirEchelleResolue('ECH_PLAGES_SEULES');
        expect(e, 'l\'échelle existe et porte ses plages').not.toBeNull();
        expect(e.niveaux[1].min).toBe(60);
        expect(e.niveaux[1].niveauSOLO).toBe('relationnel');
        expect(
            win.obtenirTableConversionNiveaux('ECH_PLAGES_SEULES'),
            'aucune `valeurCalcul` : il n\'y a rien à convertir'
        ).toBeNull();
    });
});
