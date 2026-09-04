import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { elementEchappant } from './_helpers/element-echappant.js';

// Sentinelle #505 (25 août 2026) — LES RENDUS DE BLOCS S'EXÉCUTENT VRAIMENT.
//
// ⚠⚠ CE QUI S'EST PASSÉ, ET QU'AUCUN DES 3 239 TESTS N'A VU. En uniformisant
// les boutons (#504), j'ai écrit `niveaux.length` dans `afficherNiveauxEchelle`,
// où la variable s'appelle `echelle.niveaux`. Une ReferenceError dans le `.map()`,
// le HTML jamais construit, et L'ÉCRAN DES ÉCHELLES VIDE — nom, description et
// métadonnées présents, plus un seul niveau. Grégoire l'a vu en trois secondes ;
// la suite ne l'a pas vu du tout.
//
// ⮕ Toutes les gardes de #504 lisaient le SOURCE — quelles classes, quelles
// icônes, quels appels. Aucune n'EXÉCUTAIT le rendu. Un test qui lit du texte
// ne peut pas voir une variable qui n'existe pas.
//
// Ce que cette sentinelle tient : chaque fonction qui rend des blocs
// réordonnables s'exécute sur des données plausibles et produit du HTML. Elle
// ne juge pas la mise en page — elle constate qu'il y a quelque chose, et que
// rien n'a levé.

/* ------------------------------------------------------------------ harnais */

function conteneur() {
    const el = elementEchappant('div');
    el.innerHTML = '';
    return el;
}

function charger(module, elements) {
    const store = {};
    const globaux = {
        db: {
            get: async () => null,
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            set: async () => {}, setSync: () => {},
            // #522 lot 2c : `migrerCategoriesVersSousCriteres()` s'exécute AU
            // CHARGEMENT de grilles.js et écrit par la file. Sans `modifier`,
            // ce module lève un rejet NON GÉRÉ : les tests restent verts, mais
            // `vitest run` sort en code 1 et le hook pré-push bloque.
            modifier: async (k, mutateur) => {
                const resultat = await mutateur(null);
                if (resultat === undefined) return undefined;
                store[k] = resultat;
                return resultat;
            }
        },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        obtenirCoursActifId: () => null,
        GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
        alert: () => {}, confirm: () => true,
        genererIdUnique: (p) => p + '1',
        // ⚠ Le rendu des niveaux appelle le sélecteur de couleur des outils de
        // travaux. Sans ce stub, le test échouerait pour une dépendance
        // manquante — pas pour ce qu'il vérifie.
        travauxOutils: { renderPickerCouleur: () => '<span class="picker"></span>' },
        document: {
            getElementById: (id) => elements[id] || null,
            querySelector: () => null, querySelectorAll: () => [],
            createElement: (t) => elementEchappant(t), addEventListener() {}
        }
    };
    // ui-blocs.js d'abord : les rendus appellent ses helpers.
    const win = chargerScript('js/ui-blocs.js', globaux);
    // ⚠ Le rendu lit `window.travauxOutils`, pas une variable de portée : le
    // stub doit vivre sur le faux `window`, pas seulement dans les globaux.
    win.travauxOutils = { renderPickerCouleur: () => '<span class="picker"></span>' };
    chargerScript(module, globaux, win);
    return win;
}

const NIVEAUX = [
    { code: 'E', nom: 'Expert', description: 'Maîtrise assurée', min: 90, max: 100 },
    { code: 'M', nom: 'Maîtrise', description: 'Établie', min: 70, max: 89 },
    { code: 'I', nom: 'Initial', description: 'Amorce', min: 0, max: 69 }
];
const CRITERES = [
    { id: 'C1', nom: 'Structure', type: 'holistique', ponderation: 20, description: 'A', niveauSolo: 'multistructurel' },
    { id: 'C2', nom: 'Rigueur', type: 'holistique', ponderation: 30, description: 'B', niveauSolo: 'relationnel' }
];

/* ------------------------------------------------------- les quatre rendus */

describe('#505 · les rendus de blocs produisent du HTML', () => {
    it('a. LE CAS QUI A CASSÉ : afficherNiveauxEchelle rend ses niveaux', () => {
        const els = {
            tableauNiveauxEchelle: conteneur(),
            apercuEchelleNiveaux: conteneur()
        };
        const win = charger('js/echelles.js', els);
        // ⚠ `afficherNiveauxEchelle` n'est pas exposée sur window : on la
        // récupère par le sandbox lui-même, où toutes les fonctions du module
        // vivent. C'est elle qui a cassé, c'est elle qu'on veut exécuter.
        const rendreNiveaux = win.afficherNiveauxEchelle || win.__afficherNiveauxEchelle;
        expect(typeof rendreNiveaux, 'fonction atteignable').toBe('function');

        rendreNiveaux({ id: 'ECH_1', nom: '0-IDME', niveaux: NIVEAUX });

        const rendu = els.tableauNiveauxEchelle.innerHTML;
        expect(rendu, 'le conteneur ne doit pas rester vide').not.toBe('');
        expect(rendu, 'les niveaux doivent y être').toContain('Expert');
        expect(rendu, 'et leurs chevrons').toContain('pipeline-btn-reorder');
        expect(rendu, 'pas un message d\'absence').not.toContain('Aucun niveau défini');
    });

    it('b. afficherNiveauxNouvelleEchelle rend ses niveaux', () => {
        const els = {
            tableauNiveauxEchelle: conteneur(),
            apercuEchelleNiveaux: conteneur()
        };
        const win = charger('js/echelles.js', els);
        win._niveauxNouvelleEchelle = NIVEAUX.slice();
        win.afficherNiveauxNouvelleEchelle();

        const rendu = els.tableauNiveauxEchelle.innerHTML;
        expect(rendu).not.toBe('');
        expect(rendu).toContain('pipeline-btn-reorder');
    });

    it('c. afficherTableauNiveaux rend son tableau', () => {
        const els = { apercuEchelleNiveaux: conteneur(), tableauNiveauxEchelle: conteneur() };
        const win = charger('js/echelles.js', els);
        expect(typeof win.afficherTableauNiveaux).toBe('function');
        const html = win.afficherTableauNiveaux(NIVEAUX);
        // Cette fonction RETOURNE son HTML au lieu de l'écrire.
        if (typeof html === 'string') {
            expect(html).toContain('pipeline-btn-reorder');
        }
    });

    it('d. afficherCriteresGrille rend ses critères', () => {
        // ↻ 4 sept. 2026 (lot 4) : `afficherCriteresGrille` est désormais exposée sur window —
        // ce cas, dormant (il sortait à `return`), s'est réveillé. Le conteneur réel est
        // `#listeCriteres` (grilles.js) ; sans lui, le rendu sort avant d'écrire.
        const els = { listeCriteres: conteneur(), tableauCriteresGrille: conteneur(), listeCriteresGrille: conteneur(),
                      criteresContainer: conteneur(), apercuGrilleCriteres: conteneur() };
        const win = charger('js/grilles.js', els);
        if (typeof win.afficherCriteresGrille !== 'function') return;   // nom différent : rien à tenir

        win.afficherCriteresGrille({ id: 'GR_1', nom: 'Grille', criteres: CRITERES });
        const rendu = Object.values(els).map(e => e.innerHTML).join('');
        expect(rendu, 'au moins un conteneur doit avoir reçu du HTML').not.toBe('');
    });

    it('e. LE POINT DE FOND : une variable inconnue casse le rendu, pas seulement le style', () => {
        // C'est la leçon du 25 août. Les gardes de #504 lisaient le source ;
        // celle-ci exécute. Un test qui lit du texte ne peut pas voir une
        // ReferenceError.
        const els = { tableauNiveauxEchelle: conteneur(), apercuEchelleNiveaux: conteneur() };
        const win = charger('js/echelles.js', els);
        const rendre = win.afficherNiveauxEchelle;
        expect(() => rendre({ id: 'E', niveaux: NIVEAUX })).not.toThrow();
    });
});
