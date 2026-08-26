import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #529 — Lot 3 : les blocs du profil se dessinent d'après la GRILLE
// de l'utilisateur, plus d'après une liste écrite dans le code.
//
// CE QUI EXISTAIT : le tableau `['structure','rigueur','plausibilite','nuance',
// 'francais']` en QUATRE exemplaires — deux dans `profil-etudiant-sections-
// affichage.js`, deux dans `profil-etudiant-diagnostics.js`. Il décrivait la
// grille de Grégoire. Pour toute autre grille, les barres cherchaient des clés
// que le calcul n'avait pas produites : blocs vides, sans explication.
//
// Et un défaut latent que la liste littérale masquait : le nom affiché venait
// d'une cascade de ternaires finissant par `: 'Français'` SANS condition. Tout
// critère non reconnu se serait affiché « Français ».

const RACINE = join(process.cwd(), '..');
const lire = (f) => readFileSync(join(RACINE, f), 'utf8');

let win;
let grilleRef = null;

beforeAll(() => {
    const stubs = {
        // La grille passe par la CHAÎNE RÉELLE : `obtenirGrilleReferenceDepistage`
        // est définie dans ce module même, donc un stub du même nom serait
        // masqué. On alimente ce qu'elle lit vraiment.
        db: {
            get: async () => null,
            getSync: (k, d) => {
                if (k === 'test_grillesTemplates') return grilleRef ? [grilleRef] : [];
                return d !== undefined ? d : null;
            },
            set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: (k) => (k === 'grilleReferenceDepistage' && grilleRef) ? grilleRef.id : null,
        obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {},
        afficherSection: () => {},
        afficherSousSection: () => {},
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
        obtenirSeuil: () => 0.7,
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

describe('#529 Lot 3 · les critères affichés viennent de la grille', () => {

    it('une grille de sciences donne SES critères, dans SON ordre', () => {
        grilleRef = { id: 'G_SCI', criteres: [
            { nom: 'Méthode' }, { nom: 'Résultats' }, { nom: 'Discussion' },
            { nom: 'Analyse' }, { nom: 'Sources' }, { nom: 'Structure' },
            { nom: 'Langue' }, { nom: 'Présentation' }
        ] };
        const criteres = win.criteresDeLaGrillePourAffichage();
        expect(criteres.map(c => c.nom)).toEqual([
            'Méthode', 'Résultats', 'Discussion', 'Analyse',
            'Sources', 'Structure', 'Langue', 'Présentation'
        ]);
        // Huit critères, huit barres : la décision de Grégoire du 26 août.
        expect(criteres).toHaveLength(8);
    });

    it('la clé d\'affichage est LA MÊME que celle du calcul', () => {
        // Le calcul (`calculerMoyennesCriteres`) construit ses clés par
        // minuscules + suppression des accents + suppression des espaces.
        // Si l'affichage normalisait autrement, il chercherait des clés
        // inexistantes et n'aurait aucun moyen de le dire.
        expect(win.cleCritere('Français écrit')).toBe('francaisecrit');
        expect(win.cleCritere('Plausibilité')).toBe('plausibilite');
        expect(win.cleCritere('  Méthode   scientifique ')).toBe('methodescientifique');
        expect(win.cleCritere(null)).toBe('');
    });

    it('sans grille de référence : aucun critère, et surtout aucun critère INVENTÉ', () => {
        grilleRef = null;
        expect(win.criteresDeLaGrillePourAffichage()).toEqual([]);
        grilleRef = { id: 'G_VIDE', criteres: [] };
        expect(win.criteresDeLaGrillePourAffichage()).toEqual([]);
    });

    it('un critère sans nom est écarté plutôt que rendu sous une clé vide', () => {
        grilleRef = { id: 'G_TROUS', criteres: [{ nom: 'Méthode' }, { nom: '' }, null, { nom: 'Analyse' }] };
        expect(win.criteresDeLaGrillePourAffichage().map(c => c.nom)).toEqual(['Méthode', 'Analyse']);
    });

    it('ANCRE — la liste SRPNF littérale ne revient dans AUCUN des quatre blocs', () => {
        // Ancre sur le source : c'est la seule façon d'empêcher qu'un futur
        // « correctif rapide » réintroduise le tableau là où il était.
        const fichiers = [
            'js/profil-etudiant-sections-affichage.js',
            'js/profil-etudiant-diagnostics.js',
            'js/profil-etudiant-calculs.js'
        ];
        for (const f of fichiers) {
            const source = lire(f);
            // Hors commentaires : on ne veut pas faire rougir la mémoire écrite
            // dans les blocs `//` qui expliquent précisément ce retrait.
            const codeSeul = source
                .split('\n')
                .filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l))
                .join('\n');
            expect(codeSeul, `${f} réintroduit la liste SRPNF littérale`)
                .not.toMatch(/\[\s*'structure'\s*,\s*'rigueur'/);
            expect(codeSeul, `${f} réintroduit les accumulateurs SRPNF littéraux`)
                .not.toMatch(/plausibilite\s*:\s*\[\s*\]/);
        }
    });
});
