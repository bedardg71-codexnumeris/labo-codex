import { readFileSync } from 'node:fs';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #542 lot 3, pas 2 — INTERPRÉTER par l'étiquette SOLO, et DIRE
// quand elle manque.
//
// LA DÉCISION QUE CETTE SENTINELLE VERROUILLE (Grégoire, 27 août 2026) —
// OPTION B : « l'étiquette SOLO est facultative, et son absence est DITE ».
//
// Deux options ont été écartées ce jour-là, et cette sentinelle attrape leur
// retour :
//   A — exiger l'étiquette d'abord. Le dépistage serait MUET tant qu'elle
//       manque ; le test 3 exige au contraire un texte, le nom du niveau.
//   C — retomber sur les seuils `idme.*`. Le test 8 pose un mouchard sur
//       `obtenirSeuil` : aucun seuil configuré ne doit être consulté. C'est par
//       un repli de ce genre que les bornes de Grégoire étaient entrées dans le
//       code, et c'est par là qu'elles reviendraient.
//
// ⚠ LE CAS COURANT, ET NON LE CAS DE BORD : aucune échelle réelle ne porte
// d'étiquette aujourd'hui — le lot 2 a livré le champ, il naît vide. Le chemin
// « non interprétée » est donc celui que TOUTES les données de Grégoire
// empruntent. Une sentinelle qui ne le couvrirait pas ne couvrirait rien.

let win;
let seuilsConsultes;

// La table telle que `echelles.js` la produit — UN seul producteur (#542 lot 2).
// Reproduite ici comme STUB, pas comme copie de référence : le test 9 vérifie
// que la vraie table du dépôt porte bien les cinq descriptions.
const TABLE_SOLO = [
    { valeur: 'prestructurel', libelle: 'Préstructurel', description: 'Aucun aspect pertinent n\'est traité' },
    { valeur: 'unistructurel', libelle: 'Unistructurel', description: 'Un seul aspect traité, compréhension superficielle' },
    { valeur: 'multistructurel', libelle: 'Multistructurel', description: 'Plusieurs aspects sans vision d\'ensemble' },
    { valeur: 'relationnel', libelle: 'Relationnel', description: 'Vision globale avec liens entre les aspects' },
    { valeur: 'abstrait_etendu', libelle: 'Abstrait étendu', description: 'Transfert à d\'autres contextes' }
];

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
        obtenirSeuil: (chemin) => { seuilsConsultes.push(chemin); return 0.64; },
        chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false,
        filtrerEtudiantsParMode: (arr) => arr,
        estModeeLectureSeule: () => false,
        genererSeancesCompletes: () => {},
        calculerEtSauvegarderIndicesAssiduite: () => {},
        calculerEtStockerIndicesCP: () => {},
        NIVEAUX_SOLO_ECHELLE: TABLE_SOLO
    };
    win = chargerScript('js/profil-etudiant-helpers.js', stubs);
});

beforeEach(() => { seuilsConsultes = []; });

describe('#542 lot 3 pas 2 · interpreterNiveauAtteint', () => {

    it('1. la fonction est exportée sur window', () => {
        expect(typeof win.interpreterNiveauAtteint).toBe('function');
    });

    it('2. étiquette posée : l\'interprétation vient de la TAXONOMIE, pas d\'un seuil', () => {
        const r = win.interpreterNiveauAtteint({
            code: 'B', nom: 'Avancé', min: 70, max: 84, niveauSOLO: 'relationnel'
        });
        expect(r.interpretee).toBe(true);
        expect(r.solo).toBe('relationnel');
        expect(r.libelleSOLO).toBe('Relationnel');
        expect(r.texte).toBe('Vision globale avec liens entre les aspects');
        expect(r.raison).toBeNull();
        expect(r.message).toBeNull();
    });

    it('3. LE CAS COURANT — sans étiquette, le NOM du niveau est rendu, et l\'absence est dite', () => {
        // Option B. Ni muet (option A), ni inventé (option C).
        const r = win.interpreterNiveauAtteint({
            code: 'M', nom: 'Maîtrise', min: 75, max: 84, niveauSOLO: ''
        });
        expect(r.interpretee).toBe(false);
        expect(r.texte).toBe('Maîtrise');           // ⮕ il DIT quelque chose
        expect(r.raison).toBe('sans-etiquette');
        expect(r.message).toContain('SOLO');          // ⮕ et il dit ce qui manque
        expect(r.message).toContain('éditeur d\'échelles');
        expect(r.solo).toBeNull();
    });

    it('4. champ `niveauSOLO` absent ou nul : même comportement que vide', () => {
        const sansChamp = win.interpreterNiveauAtteint({ code: 'I', nom: 'Incomplet' });
        const nul = win.interpreterNiveauAtteint({ code: 'I', nom: 'Incomplet', niveauSOLO: null });
        expect(sansChamp.raison).toBe('sans-etiquette');
        expect(nul.raison).toBe('sans-etiquette');
        expect(sansChamp.texte).toBe('Incomplet');
        expect(nul.texte).toBe('Incomplet');
    });

    it('5. niveau sans nom : le CODE tient lieu de nom, plutôt qu\'un texte vide', () => {
        const r = win.interpreterNiveauAtteint({ code: 'D', min: 65, max: 74 });
        expect(r.texte).toBe('D');
    });

    it('6. aucun niveau (la moyenne ne tombait dans aucune plage) : rien n\'est supposé', () => {
        const r = win.interpreterNiveauAtteint(null);
        expect(r.interpretee).toBe(false);
        expect(r.texte).toBeNull();
        expect(r.raison).toBe('sans-niveau');
        expect(r.message).toContain('plages');
    });

    it('7. étiquette inconnue de la taxonomie : le nom du niveau, et la cause nommée', () => {
        const r = win.interpreterNiveauAtteint({
            code: 'X', nom: 'Palier 3', niveauSOLO: 'quantique'
        });
        expect(r.interpretee).toBe(false);
        expect(r.texte).toBe('Palier 3');
        expect(r.raison).toBe('etiquette-inconnue');
        expect(r.message).toContain('quantique');
    });

    it('8. AUCUN seuil configuré n\'est consulté — l\'option C ne peut pas revenir', () => {
        win.interpreterNiveauAtteint({ code: 'B', nom: 'Avancé', niveauSOLO: 'relationnel' });
        win.interpreterNiveauAtteint({ code: 'M', nom: 'Maîtrise' });
        win.interpreterNiveauAtteint(null);
        expect(seuilsConsultes).toEqual([]);

        // 30 oct. 2026 : le contrôle du mouchard passait par `obtenirNiveauIDMEDepuisPourcentage`, retirée. Plus aucun
        // lecteur de seuil dans ce module : c'est le source qui le prouve.
        const src = readFileSync(new URL('../../js/profil-etudiant-helpers.js', import.meta.url), 'utf-8')
            .replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
        expect(src).not.toMatch(/\bobtenirSeuil\(/);
    });

    it('9. la VRAIE table du dépôt porte une description pour les CINQ niveaux SOLO', async () => {
        // L'ancien code n'en produisait que quatre — `interpreterScoreIDME` ne
        // couvrait pas « préstructurel ». Ce test lit le fichier source plutôt
        // que le stub : sinon il ne prouverait que la cohérence du stub avec
        // lui-même.
        const fs = await import('node:fs');
        const src = fs.readFileSync(
            new URL('../../js/echelles.js', import.meta.url), 'utf-8');
        const bloc = src.slice(src.indexOf('const NIVEAUX_SOLO_ECHELLE = ['));
        const table = bloc.slice(0, bloc.indexOf('];') + 2);
        for (const valeur of ['prestructurel', 'unistructurel', 'multistructurel',
                              'relationnel', 'abstrait_etendu']) {
            expect(table).toContain(valeur);
        }
        // Cinq entrées, cinq descriptions.
        expect((table.match(/description:/g) || []).length).toBe(5);
    });
});
