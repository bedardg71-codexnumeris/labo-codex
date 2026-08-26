import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #541 — un pourcentage et un seuil ne se comparent pas sans
// conversion.
//
// CE QUI EXISTAIT AVANT, ET QUE PERSONNE NE TESTAIT.
//
// `obtenirNiveauIDMEDepuisPourcentage` reçoit un POURCENTAGE (0-100) : son
// nom le dit, son JSDoc le dit, et ses deux appelants le respectent —
// `critere.score * 100` dans `profil-etudiant-diagnostics:151`, et `P` dans
// `sections-affichage:3039` (comparé deux lignes plus bas à `seuil * 100`).
//
// Les seuils, eux, sortent d'`obtenirSeuil('idme.*')` et valent 0-1 :
// 0.64 / 0.75 / 0.85. Les deux étaient comparés TELS QUELS :
//
//     if (pourcentage < seuilInsuffisant) return 'I';   // 12 < 0.64 ? non
//     if (pourcentage < seuilDeveloppement) return 'D'; // 12 < 0.75 ? non
//     if (pourcentage < seuilMaitrise) return 'M';      // 12 < 0.85 ? non
//     return 'E';                                       // ⮕ « Étendu »
//
// Tout score au-dessus de 1 % tombait donc dans le dernier `return`. Le bloc
// « Forces et défis » du diagnostic ne pouvait afficher QUE des forces
// exceptionnelles — pour tout le monde, y compris un élève en difficulté sur
// tous ses critères. Aucun message, aucune erreur : le dépistage répondait, et
// il répondait « tout va bien ».
//
// Antérieur à #529 : le défaut existe au moins depuis l'extraction du
// 17 mai 2026 (d9c67936). La suite Vitest était verte avec, parce qu'aucun
// test n'appelait cette fonction — seul son NOM était vérifié, dans la liste
// d'exports de `refactor-profil-etudiant.test.js:149`. Un test d'existence
// n'est pas un test de comportement ; c'est ce que cette sentinelle répare.

let win;

// Les seuils tels que les rend VRAIMENT `interpretation-config.js` : sur 0-1,
// jamais sur 0-100 (cf. `SEUILS_PAR_DEFAUT.idme`). C'est tout le sujet.
const SEUILS_PAR_DEFAUT = {
    'idme.insuffisant': 0.64,
    'idme.developpement': 0.75,
    'idme.maitrise': 0.85
};
let seuils = { ...SEUILS_PAR_DEFAUT };

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
        obtenirSeuil: (chemin) => seuils[chemin],
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

describe('#541 · le niveau se déduit d\'un pourcentage ramené sur l\'échelle des seuils', () => {

    it('un critère à 12 % n\'est PAS une force exceptionnelle — le cas qui rendait le dépistage muet', () => {
        expect(win.obtenirNiveauIDMEDepuisPourcentage(12)).toBe('I');
    });

    it('les quatre niveaux sont atteignables, chacun dans sa plage', () => {
        // Sous 64 % → I ; 64 à 74,99 → D ; 75 à 84,99 → M ; 85 et plus → E.
        expect(win.obtenirNiveauIDMEDepuisPourcentage(0)).toBe('I');
        expect(win.obtenirNiveauIDMEDepuisPourcentage(55)).toBe('I');
        expect(win.obtenirNiveauIDMEDepuisPourcentage(70)).toBe('D');
        expect(win.obtenirNiveauIDMEDepuisPourcentage(80)).toBe('M');
        expect(win.obtenirNiveauIDMEDepuisPourcentage(95)).toBe('E');
    });

    it('AVANT le correctif, ces trois-là rendaient tous « E » — la preuve du défaut', () => {
        // Ce test échouerait mot pour mot sur le code d'avant le 26 août 2026.
        const rendus = [12, 55, 64].map(p => win.obtenirNiveauIDMEDepuisPourcentage(p));
        expect(rendus).not.toEqual(['E', 'E', 'E']);
        expect(rendus).toEqual(['I', 'I', 'D']);
    });

    it('les bornes tombent du bon côté : le seuil appartient au niveau du dessus', () => {
        // Le seuil est une borne INFÉRIEURE inclusive : à 64 % pile, on n'est
        // plus « Incomplet ». Verrouillé pour que le sens de la comparaison
        // (`<` et non `<=`) ne s'inverse pas par inadvertance.
        expect(win.obtenirNiveauIDMEDepuisPourcentage(63.99)).toBe('I');
        expect(win.obtenirNiveauIDMEDepuisPourcentage(64)).toBe('D');
        expect(win.obtenirNiveauIDMEDepuisPourcentage(74.99)).toBe('D');
        expect(win.obtenirNiveauIDMEDepuisPourcentage(75)).toBe('M');
        expect(win.obtenirNiveauIDMEDepuisPourcentage(84.99)).toBe('M');
        expect(win.obtenirNiveauIDMEDepuisPourcentage(85)).toBe('E');
    });

    it('les seuils sont bien CONFIGURABLES : les déplacer déplace les verdicts', () => {
        // La règle d'or du projet : aucune valeur métier en dur. Si un jour
        // les 0.64/0.75/0.85 revenaient dans le corps de la fonction, ce test
        // le dirait — un seuil de maîtrise à 90 % doit refuser « E » à 88 %.
        seuils = {
            'idme.insuffisant': 0.50,
            'idme.developpement': 0.70,
            'idme.maitrise': 0.90
        };
        expect(win.obtenirNiveauIDMEDepuisPourcentage(45)).toBe('I');
        expect(win.obtenirNiveauIDMEDepuisPourcentage(60)).toBe('D');
        expect(win.obtenirNiveauIDMEDepuisPourcentage(88)).toBe('M');
        expect(win.obtenirNiveauIDMEDepuisPourcentage(92)).toBe('E');

        seuils = { ...SEUILS_PAR_DEFAUT };
    });

    it('le contrat d\'ENTRÉE reste 0-100 : un score 0-1 n\'est pas deviné', () => {
        // Volontaire, et documenté dans la fonction : 0.8 est LU comme 0,8 %,
        // donc « I ». Une heuristique « si c'est petit c'est déjà 0-1 » rendrait
        // 0.8 indistinguable de 80 % et ferait de la fonction un devineur.
        // Si un appelant passe un jour du 0-1, c'est l'appelant qu'on corrige.
        expect(win.obtenirNiveauIDMEDepuisPourcentage(0.8)).toBe('I');
    });

    it('l\'ancre sur le source : la conversion est là, et elle n\'est pas commentée', () => {
        // Sentinelle de non-régression par relecture : le correctif tient en
        // une division. Un « nettoyage » qui la retirerait remettrait tout le
        // monde à « E » sans qu'aucune assertion de valeur ne bouge, si un
        // futur refactor stubbait les seuils sur 0-100.
        const source = win.obtenirNiveauIDMEDepuisPourcentage.toString();
        expect(source).toMatch(/pourcentage\s*\/\s*100/);
    });
});
