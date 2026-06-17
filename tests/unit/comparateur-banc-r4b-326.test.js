import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
    it('les lignes de construction viennent de ConstructionAttributs (R3), alignées par axe', () => {
        expect(src).toMatch(/function _extraitsColonnes\(/);
        expect(src).toMatch(/function _axesConstruction\(/);
        expect(src).toMatch(/ConstructionAttributs\.extraire\(_configPourExtraction/);
        expect(src).toMatch(/ConstructionAttributs\.AXES_ANCRES/);
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
