import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #326 R4b — banc « colonnes paires » : 2-3 pratiques sans réf privilégiée, lignes
// de CONSTRUCTION (R3) + RÉSULTAT, lien par colonne vers le formulaire #319, source
// fictif/réel. Sentinelle STATIQUE (rendu DOM non exerçable en sandbox → terrain R6).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.resolve(__dirname, '..', '..', 'js', 'comparateur-pratiques.js'), 'utf8');

describe('#326 R4b · colonnes paires (plus de référence privilégiée)', () => {
    it('modèle de colonnes = _colonnesSel (2-3), sans flag ref', () => {
        expect(src).toMatch(/var _colonnesSel/);
        expect(src).toMatch(/function _initColonnes\(\)/);
        // plus aucune privilégiation « Ta pratique » / « simulation » / c.ref
        expect(src).not.toMatch(/c\.ref/);
        expect(src).not.toMatch(/Ta pratique/);
    });
    it('les pratiques comparables incluent les maquettes (pas de filtre estMaquette)', () => {
        expect(src).toMatch(/function _pratiquesComparables\(\)/);
        const i = src.indexOf('function _pratiquesComparables(');
        expect(src.slice(i, i + 600)).not.toMatch(/estMaquette/);
    });
});

describe('#326 R4b · lignes de construction (R3) + résultats', () => {
    it('la matrice a une section « Construction de la note » et une section « Résultat »', () => {
        expect(src).toMatch(/Construction de la note/);
        expect(src).toMatch(/Résultat — profils-types/);
    });
    it('les lignes de construction viennent de ConstructionAttributs (R3), groupées par paramètre', () => {
        expect(src).toMatch(/function _extraitsColonnes\(/);
        expect(src).toMatch(/function _groupesConstruction\(/);
        expect(src).toMatch(/ConstructionAttributs\.extraire\(_configPourExtraction/);
        // 9 sept. 2026 : l'ossature du tableau n'est plus AXES_ANCRES (retiré du
        // module) mais les six paramètres. L'ancien nom ne doit plus être appelé.
        expect(src).toMatch(/ConstructionAttributs\.PARAMETRES/);
        expect(src).not.toMatch(/ConstructionAttributs\.AXES_ANCRES/);
    });
    it('chaque paramètre ouvre son groupe de lignes, à son propre niveau visuel', () => {
        const i = src.indexOf('groupes.forEach(');
        expect(i).toBeGreaterThan(-1);
        const bloc = src.slice(i, i + 800);
        // #808 : TROIS niveaux — section > paramètre > ligne. Le paramètre porte
        // sa propre classe, sinon il se confond avec l'en-tête de section.
        expect(bloc).toMatch(/comparateur-parametre-tete/);
        expect(bloc).not.toMatch(/comparateur-section-tete/);
        expect(bloc).toMatch(/groupe\.libelle/);
        expect(bloc).toMatch(/groupe\.axes\.forEach\(/);
    });
    it('#808 · les trois niveaux du tableau sont DÉCLARÉS, dans les deux modes', () => {
        const css = readFileSync(path.resolve(__dirname, '..', '..', 'styles.css'), 'utf8');
        // Le défaut d'origine : ces classes vivaient dans le HTML sans exister
        // en CSS. Une déclaration, pas une simple mention.
        // ⚠ Ancrés en DÉBUT DE LIGNE : sans le `^`, la surcharge
        // `.mode-clair .comparateur-parametre-tete th` contient la même
        // sous-chaîne et la garde restait verte alors que la règle de base
        // avait disparu (mesuré au break-test).
        expect(css).toMatch(/^\.comparateur-section-tete th\s*\{/m);
        expect(css).toMatch(/^\.comparateur-parametre-tete th\s*\{/m);
        // ⚠ Mesuré au break-test : exiger la RÈGLE ne suffit pas — retirer son
        // `padding-left` laissait l'essai vert alors que le retrait, qui dit
        // l'appartenance de la ligne à son paramètre, avait disparu.
        expect(css).toMatch(/\.comparateur-ligne-constr \.comparateur-col-profil\s*\{[^}]*padding-left:\s*\d+px/);
        expect(css).toMatch(/\.mode-clair \.comparateur-section-tete th\s*\{/);
        // Et aucune couleur en dur : la palette seulement (skill design-interface §2).
        // ⚠ Commentaires retirés d'abord — « #808 » ressemble à un hex court et
        // faisait rougir la garde sur sa propre documentation (mesuré).
        const i0 = css.indexOf('/* #808 (9 sept. 2026)');   // au DÉLIMITEUR, sinon le commentaire n'est pas retirable
        const blocBrut = css.slice(i0, css.indexOf('/* E1 —', i0));
        const decls = blocBrut.replace(/\/\*[\s\S]*?\*\//g, '');
        const horsFallback = decls.split('\n').filter((l) => /#[0-9a-f]{3,6}\b/i.test(l) && !/var\(--/.test(l));
        expect(horsFallback, 'couleur en dur hors fallback : ' + horsFallback.join(' | ')).toEqual([]);
        // témoin : la garde regarde bien des déclarations qui portent des couleurs
        expect(decls).toMatch(/var\(--[a-z-]+, ?#[0-9a-f]{3,6}\)/i);
    });
    it('axe absent d\'une famille → « s.o. » dans la cellule', () => {
        const i = src.indexOf('function _rendreMatrice(');
        const bloc = src.slice(i, i + 2200);
        expect(bloc).toMatch(/'s\.o\.'/);
    });
    it('familles codées (SOM/STD/SPE) extraites via un type synthétique', () => {
        expect(src).toMatch(/_CODE_VERS_TYPE/);
        expect(src).toMatch(/function _configPourExtraction\(/);
    });
});

describe('#326 R4b · lien par colonne vers le formulaire #319', () => {
    it('chaque colonne configurable porte un lien « Éditer » → editerPratique', () => {
        expect(src).toMatch(/function _enteteColonne\(/);
        expect(src).toMatch(/data-editer-id/);
        expect(src).toMatch(/editerPratique\(id\)/);
    });
});

describe('#326 R4b · source fictif / réel', () => {
    it('un sélecteur de source bascule fictif ↔ réel et re-rend la vue', () => {
        expect(src).toMatch(/function _rendreSource\(\)/);
        expect(src).toMatch(/function _attacherSource\(/);
        expect(src).toMatch(/comparateur-source-select/);
        expect(src).toMatch(/function _profilsReels\(\)/);
        // _profilsActifs route vers les profils réels en source 'reel'
        const i = src.indexOf('function _profilsActifs(');
        expect(src.slice(i, i + 300)).toMatch(/_sourceDonnees === 'reel'/);
    });
});

describe('#326 R4b · « Comparer » depuis l\'arbre injecte une colonne (sans mode démo)', () => {
    it('_comparerDepuisArbre ne dépend plus de estEnDemo et écrit dans _colonnesSel', () => {
        const i = src.indexOf('function _comparerDepuisArbre(');
        const bloc = src.slice(i, i + 600);
        expect(bloc).not.toMatch(/estEnDemo/);
        expect(bloc).toMatch(/_colonnesSel/);
    });
});

describe('#326 R5 · nettoyage zéro-dette du code démo/matrice mort', () => {
    it('PROFILS / PHRASES_CONTEXTE / MICROCOPY_E1 (profils DEMO figés) supprimés', () => {
        expect(src).not.toMatch(/var PROFILS =/);
        expect(src).not.toMatch(/var PHRASES_CONTEXTE =/);
        expect(src).not.toMatch(/var MICROCOPY_E1 =/);
        expect(src).not.toMatch(/DEMO010|DEMO011|DEMO013|DEMO004/);
    });
    it('garde « mode démo » supprimée (estEnDemo / construireInvitation / activerDemoEtOuvrir)', () => {
        expect(src).not.toMatch(/function estEnDemo\(/);
        expect(src).not.toMatch(/function construireInvitation\(/);
        expect(src).not.toMatch(/function activerDemoEtOuvrir\(/);
        expect(src).not.toMatch(/comparateur-activer-demo/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9 sept. 2026 — LE GROUPEMENT SOUS LES SIX PARAMÈTRES, MESURÉ POUR DE VRAI.
// Le reste de ce fichier est une sentinelle STATIQUE (rendu DOM non exerçable).
// `_groupesConstruction` est pure — elle ne lit que ce qu'on lui passe — et
// c'est elle qui décide de l'ossature du tableau : elle s'exécute, donc on
// l'exécute plutôt que de la relire.
// ─────────────────────────────────────────────────────────────────────────────
describe('#326 R4b · groupement des lignes sous les six paramètres', () => {
    const attributs = chargerScript('js/pratiques/construction-attributs.js').ConstructionAttributs;
    const win = chargerScript('js/comparateur-pratiques.js', { ConstructionAttributs: attributs });
    const grouper = win._comparateurGroupesConstruction;

    // Deux colonnes, deux familles : ce que le Comparateur reçoit réellement.
    const extraitsDe = (...types) => types.map(type => {
        const parAxe = {};
        attributs.extraire({ type }).attributs.forEach(a => { parAxe[a.axe] = a; });
        return parAxe;
    });

    it('les six paramètres ouvrent six groupes, dans l\'ordre du module', () => {
        const g = grouper(extraitsDe('standards', 'sommative'));
        expect(g.map(x => x.cle)).toEqual(attributs.PARAMETRES.map(p => p.cle));
        // ⚠ Les clés seules ne prouvent rien : si l'ossature venait à disparaître,
        // le repli « Autres » les recréerait dans le même ordre (mesuré au
        // break-test du 9 sept.). Ce sont les LIBELLÉS qui attestent que
        // l'ordre vient bien de ConstructionAttributs.PARAMETRES.
        expect(g.map(x => x.libelle)).toEqual(attributs.PARAMETRES.map(p => p.libelle));
        expect(g.every(x => /—/.test(x.libelle))).toBe(true);
    });

    it('chaque groupe porte au moins une ligne, et chaque ligne son libellé', () => {
        const g = grouper(extraitsDe('standards', 'denotation'));
        g.forEach(groupe => {
            expect(groupe.axes.length).toBeGreaterThan(0);
            groupe.axes.forEach(a => expect(typeof a.libelle).toBe('string'));
        });
    });

    it('un axe présent dans une seule colonne apparaît quand même (l\'autre aura « s.o. »)', () => {
        const g = grouper(extraitsDe('standards', 'sommative'));
        const tousAxes = g.flatMap(x => x.axes.map(a => a.axe));
        expect(tousAxes).toContain('composantes');       // STD seulement
        expect(tousAxes).toContain('reglesSpeciales');   // SOM seulement
    });

    it('aucun axe n\'est perdu ni dupliqué en chemin', () => {
        const extraits = extraitsDe('standards', 'specifications', 'denotation');
        const attendus = new Set(extraits.flatMap(e => Object.keys(e)));
        const rendus = grouper(extraits).flatMap(x => x.axes.map(a => a.axe));
        expect(new Set(rendus)).toEqual(attendus);
        expect(rendus.length).toBe(attendus.size);
    });

    it('un groupe sans aucune ligne est écarté (un en-tête seul ne dit rien)', () => {
        expect(grouper([{}])).toEqual([]);
    });

    it('un axe sans paramètre connu n\'est pas perdu : il tombe dans un groupe « Autres » nommé', () => {
        const g = grouper([{ bidule: { axe: 'bidule', libelle: 'Bidule', valeur: 'x' } }]);
        expect(g.length).toBe(1);
        expect(g[0].axes.map(a => a.axe)).toEqual(['bidule']);
        // La clé du repli est une VRAIE clé — pas `undefined` promu en clé
        // d'objet, qui donnerait un groupe fantôme (mesuré au break-test).
        expect(g[0].cle).toBe('autres');
        expect(g[0].libelle).toBe('Autres');
    });
});
