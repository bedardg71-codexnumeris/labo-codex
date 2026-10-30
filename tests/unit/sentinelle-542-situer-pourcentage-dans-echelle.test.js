import { readFileSync } from 'node:fs';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #542 lot 3, pas 1 — SITUER une moyenne dans l'échelle DE
// L'UTILISATEUR, jamais dans celle qui est écrite dans le code.
//
// CE QUE CETTE FONCTION REMPLACE, ET POURQUOI ELLE EXISTE.
//
// Le dépistage situait une moyenne en la comparant à `idme.insuffisant` /
// `idme.developpement` / `idme.maitrise` — 0,64 / 0,75 / 0,85. Mesuré le
// 26 août 2026 sur les données réelles de Grégoire :
//
//     son échelle :  D 65-74   M 75-84   E 85-100
//     idme.*      :  0,64      0,75      0,85
//
// Ce sont ses bornes, au chiffre près, recopiées dans le code il y a des mois.
// Sa crainte, mot pour mot, est celle qui fonde le chantier : « la crainte que
// j'ai, c'est que nous codions en dur ce qui est dans ma tête, alors qu'il faut
// rendre l'application flexible. L'utilisateur est capable de faire du dépistage
// même s'il n'a pas exactement la même échelle que moi. »
//
// ⮕ D'où la forme de cette sentinelle : elle n'emploie NULLE PART l'échelle de
// Grégoire. Elle fabrique une échelle A/B/C/D dont aucun code ni aucune borne ne
// coïncide avec IDME. Une fonction qui retomberait sur les seuils configurés ne
// pourrait pas rendre « C » — le code n'existe pas dans IDME. C'est ce qui rend
// ces assertions DISCRIMINANTES, et non décoratives : le §7 de la consigne
// rappelle que trois break-tests sont restés verts en août parce qu'ils
// testaient une valeur que les deux comportements rendaient pareil.
//
// LE CAS QU'IL NE FAUT SURTOUT PAS « CORRIGER » : dans l'échelle réelle de
// Grégoire, « 0 » couvre 0-0 et « I » couvre 0-64. Les deux contiennent zéro.
// `calculerNote` prend la PREMIÈRE plage qui contient la valeur, donc une note
// nulle rend « 0 », pas « I ». Ce comportement est reproduit ici à dessein :
// deux écrans qui situent la même note doivent rendre le même niveau.

let win;
let seuilsConsultes;

beforeAll(() => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, defaut) => (defaut !== undefined ? defaut : null),
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
        // Le mouchard du dernier test : tout seuil consulté est enregistré.
        obtenirSeuil: (chemin) => { seuilsConsultes.push(chemin); return 0.64; },
        chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false,
        filtrerEtudiantsParMode: (arr) => arr,
        estModeeLectureSeule: () => false,
        genererSeancesCompletes: () => {},
        calculerEtSauvegarderIndicesAssiduite: () => {},
        calculerEtStockerIndicesCP: () => {}
    };
    win = chargerScript('js/profil-etudiant-helpers.js', stubs);
});

beforeEach(() => { seuilsConsultes = []; });

// Une échelle qui n'est celle de PERSONNE dans ce dépôt : ni IDME, ni les
// bornes de Grégoire. C'est le point.
const ECHELLE_ABCD = {
    id: 'ECH_TEST_ABCD',
    nom: 'Échelle A/B/C/D (fabriquée pour ce test)',
    niveaux: [
        { code: 'D', nom: 'Débutant',    min: 0,  max: 49,  valeurCalcul: 25, niveauSOLO: 'unistructurel' },
        { code: 'C', nom: 'Compétent',   min: 50, max: 69,  valeurCalcul: 60, niveauSOLO: 'multistructurel' },
        { code: 'B', nom: 'Avancé',      min: 70, max: 84,  valeurCalcul: 78, niveauSOLO: 'relationnel' },
        { code: 'A', nom: 'Exemplaire',  min: 85, max: 100, valeurCalcul: 92, niveauSOLO: 'abstrait_etendu' }
    ]
};

describe('#542 lot 3 pas 1 · situerPourcentageDansEchelle', () => {

    it('1. la fonction est exportée sur window', () => {
        expect(typeof win.situerPourcentageDansEchelle).toBe('function');
    });

    it('2. chaque plage de l\'échelle fournie rend SON niveau, et les codes sont étrangers à IDME', () => {
        const situer = win.situerPourcentageDansEchelle;
        expect(situer(0, ECHELLE_ABCD).code).toBe('D');
        expect(situer(49, ECHELLE_ABCD).code).toBe('D');
        expect(situer(50, ECHELLE_ABCD).code).toBe('C');
        expect(situer(69, ECHELLE_ABCD).code).toBe('C');
        expect(situer(70, ECHELLE_ABCD).code).toBe('B');
        expect(situer(84, ECHELLE_ABCD).code).toBe('B');
        expect(situer(85, ECHELLE_ABCD).code).toBe('A');
        expect(situer(100, ECHELLE_ABCD).code).toBe('A');
    });

    it('3. le NIVEAU COMPLET est rendu — c\'est lui qui portera l\'étiquette SOLO au pas 2', () => {
        const niveau = win.situerPourcentageDansEchelle(72, ECHELLE_ABCD);
        expect(niveau.code).toBe('B');
        expect(niveau.nom).toBe('Avancé');
        expect(niveau.niveauSOLO).toBe('relationnel');
    });

    it('4. les bornes de l\'échelle de Grégoire ne sont PAS celles du code : 60 % vaut « C », jamais « I »', () => {
        // 60 % est en dessous de 0,64 : les seuils `idme.*` rendraient « I ».
        // L'échelle fournie, elle, dit « C ». Si un jour un repli sur les seuils
        // réapparaît, cette ligne rougit.
        expect(win.situerPourcentageDansEchelle(60, ECHELLE_ABCD).code).toBe('C');
        expect(win.situerPourcentageDansEchelle(80, ECHELLE_ABCD).code).toBe('B');
    });

    it('5. plages qui se chevauchent : la PREMIÈRE gagne — une note nulle rend « 0 », pas « I »', () => {
        // La forme réelle de l'échelle de Grégoire, reproduite ici : « 0 » et
        // « I » contiennent tous deux zéro.
        const echelleAvecZero = {
            niveaux: [
                { code: '0', nom: 'Jugement suspendu', min: 0,  max: 0 },
                { code: 'I', nom: 'Incomplet',         min: 0,  max: 64 },
                { code: 'D', nom: 'En développement',  min: 65, max: 74 }
            ]
        };
        expect(win.situerPourcentageDansEchelle(0, echelleAvecZero).code).toBe('0');
        expect(win.situerPourcentageDansEchelle(1, echelleAvecZero).code).toBe('I');
        expect(win.situerPourcentageDansEchelle(70, echelleAvecZero).code).toBe('D');
    });

    it('6. aucune plage ne contient la valeur : `null`, et AUCUN repli « plus proche »', () => {
        // Échelle trouée entre 50 et 59. `calculerNote` rendrait ici le niveau
        // dont le milieu est le plus proche ; cette fonction refuse de le faire —
        // un repli par distance fabrique une réponse que l'échelle ne donne pas.
        const echelleTrouee = {
            niveaux: [
                { code: 'X', nom: 'Bas',  min: 0,  max: 49 },
                { code: 'Y', nom: 'Haut', min: 60, max: 100 }
            ]
        };
        expect(win.situerPourcentageDansEchelle(55, echelleTrouee)).toBeNull();
        // Et les deux plages qui existent répondent toujours : l'absence de repli
        // n'a pas cassé le cas normal.
        expect(win.situerPourcentageDansEchelle(49, echelleTrouee).code).toBe('X');
        expect(win.situerPourcentageDansEchelle(60, echelleTrouee).code).toBe('Y');
    });

    it('7. échelle absente, vide ou malformée : `null`, jamais une exception', () => {
        const situer = win.situerPourcentageDansEchelle;
        expect(situer(70, null)).toBeNull();
        expect(situer(70, undefined)).toBeNull();
        expect(situer(70, {})).toBeNull();
        expect(situer(70, { niveaux: [] })).toBeNull();
        expect(situer(70, { niveaux: 'pas un tableau' })).toBeNull();
    });

    it('8. valeur d\'entrée non finie : `null` — la fonction ne devine pas', () => {
        const situer = win.situerPourcentageDansEchelle;
        expect(situer(NaN, ECHELLE_ABCD)).toBeNull();
        expect(situer(undefined, ECHELLE_ABCD)).toBeNull();
        expect(situer(null, ECHELLE_ABCD)).toBeNull();
        expect(situer('70', ECHELLE_ABCD)).toBeNull();
        expect(situer(Infinity, ECHELLE_ABCD)).toBeNull();
    });

    it('9. une borne VIDE ne devient pas la borne zéro : `Number(\'\')` vaut 0', () => {
        // Piège réel : un niveau saisi avant #526 peut porter `min: ''`. Lu
        // naïvement, il capturerait toute moyenne nulle et volerait le niveau
        // légitime. Il doit être ignoré, pas interprété.
        const echelleBorneVide = {
            niveaux: [
                { code: 'VIDE', nom: 'Mal saisi', min: '', max: '' },
                { code: 'BAS',  nom: 'Bas',       min: 0,  max: 49 }
            ]
        };
        expect(win.situerPourcentageDansEchelle(0, echelleBorneVide).code).toBe('BAS');
    });

    it('10. des bornes en CHAÎNE restent lisibles — les données anciennes en portent', () => {
        const echelleChaines = {
            niveaux: [
                { code: 'P', nom: 'Partiel', min: '0',  max: '59' },
                { code: 'R', nom: 'Réussi',  min: '60', max: '100' }
            ]
        };
        expect(win.situerPourcentageDansEchelle(75, echelleChaines).code).toBe('R');
        expect(win.situerPourcentageDansEchelle(59, echelleChaines).code).toBe('P');
    });

    it('11. AUCUN seuil configuré n\'est consulté — c\'est la délivrance du lot 3', () => {
        // Le mouchard `obtenirSeuil` du harnais enregistre tout accès. Situer une
        // moyenne ne doit rien demander à `interpretation-config.js` : les bornes
        // viennent de l'échelle passée en argument, et d'elle seule.
        win.situerPourcentageDansEchelle(72, ECHELLE_ABCD);
        win.situerPourcentageDansEchelle(0, ECHELLE_ABCD);
        expect(seuilsConsultes).toEqual([]);

        // 30 oct. 2026 : le contrôle du mouchard passait par `obtenirNiveauIDMEDepuisPourcentage`, retirée. Plus aucun
        // lecteur de seuil dans ce module : c'est le source qui le prouve.
        const src = readFileSync(new URL('../../js/profil-etudiant-helpers.js', import.meta.url), 'utf-8')
            .replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
        expect(src).not.toMatch(/\bobtenirSeuil\(/);
    });
});
