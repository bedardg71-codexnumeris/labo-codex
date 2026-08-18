import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #454 — À L'IMPORT, UNE RESSOURCE RENUMÉROTÉE N'EST REPOINTÉE NULLE PART.
//
// Le vecteur, mesuré sur les données réelles de Grégoire (imports du 23 mars
// et du 11 avril 2026) : `verifierUniciteIds` traitait TOUT doublon interne
// d'une collection comme un accident à renommer —
//
//     cartouche_1770743136309_jl11zpy74                       (l'original)
//     cartouche_1770743136309_jl11zpy + 1774267023190_a_…     (le renommé,
//                                  ↑ deux caractères amputés par le replace)
//
// — sans JAMAIS repointer ce qui citait l'ancien id : ni les productions, ni
// les évaluations, ni la clé `cartouches_{grilleId}` qui porte l'id dans son
// NOM. Une cause, trois symptômes : sélecteurs « Aucune » (branche H26 de
// #453), magasins de cartouches orphelins, évaluations aux témoins
// contradictoires.
//
// La correction suit la décision du backlog, cohérente avec #448 (1.75.0) :
// un identifiant identique avec un contenu IDENTIQUE n'est pas une collision,
// c'est la même chose — on ÉCARTE la copie, on ne renomme rien, donc plus
// rien à repointer. Le renommage ne subsiste que pour un VRAI conflit (même
// id, contenu différent), où garder les deux est le seul choix qui ne perd
// rien.
//
// Les deux appelants héritent du correctif : `chargerCodex` (codex.js, filet
// #292 sur toute bibliothèque partagée — le chemin que Grégoire emprunte à
// chaque chargement de codex) et le filet de fin de `fusionnerParIdentite`
// (import-export.js).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceImport = readFileSync(path.join(racineProjet, 'js', 'import-export.js'), 'utf8');
const sourceCodex = readFileSync(path.join(racineProjet, 'js', 'codex.js'), 'utf8');

function monter() {
    // La VRAIE fabrique d'ids du projet (js/main.js:33).
    const genererIdUnique = (function () {
        let compteur = 0;
        return function (prefix) {
            prefix = prefix || '';
            compteur = (compteur + 1) % 0xFFFF;
            const ts = Date.now();
            const rnd = crypto.getRandomValues(new Uint8Array(6));
            const hex = Array.from(rnd, (b) => b.toString(16).padStart(2, '0')).join('');
            return prefix + ts + '_' + compteur.toString(16) + '_' + hex;
        };
    })();
    return chargerScript('js/import-export.js', { genererIdUnique });
}

let win;
beforeEach(() => { win = monter(); });

const grille = (id, nom, extra = {}) => ({ id, nom, criteres: ['SRPNF_1', 'SRPNF_2'], ...extra });

describe('#454 · un doublon interne IDENTIQUE est écarté, jamais renommé', () => {

    it('⚠ LE CAS DE GRÉGOIRE : la copie identique disparaît, l’original garde son id', () => {
        const original = grille('grille_1770742838756_23q82vbsk', 'Grille-4 H26');
        const copie = grille('grille_1770742838756_23q82vbsk', 'Grille-4 H26');

        const resultat = win.verifierUniciteIds([original, copie], 'grilles');

        expect(resultat).toHaveLength(1);                                  // ← 2 avant le correctif
        expect(resultat[0].id).toBe('grille_1770742838756_23q82vbsk');
        // Rien n'a été renommé : la production qui cite cet id le résout
        // toujours — plus de fantôme, plus rien à repointer.
    });

    it('la référence d’une production SURVIT au passage du filet', () => {
        // La forme exacte du dégât #453/H26 : après l'ancien renommage, le
        // `grilleId` de la production ne visait plus rien. Ici on rejoue la
        // chaîne : bibliothèque avec doublon → filet → la cible existe encore.
        const production = { id: 'PROD_1', titre: 'Artefact 4', grilleId: 'grille_A' };
        const bibliotheque = [grille('grille_A', 'Holistique'), grille('grille_A', 'Holistique')];

        const apres = win.verifierUniciteIds(bibliotheque, 'grilles');
        const cible = apres.find((g) => g.id === production.grilleId);

        expect(apres).toHaveLength(1);
        expect(cible).toBeDefined();
        expect(cible.nom).toBe('Holistique');
    });

    it('⚠⚠ un VRAI conflit (même id, contenu différent) garde les deux — rien n’est perdu', () => {
        // La règle de prudence de #448 est asymétrique : écarter à tort est
        // irréversible, garder un doublon se nettoie. Contenu différent ⇒
        // les deux survivent, le second sous un id neuf.
        const r = win.verifierUniciteIds([
            grille('GRILLE_X', 'Version de mars'),
            grille('GRILLE_X', 'RÉÉCRITE en juin')
        ], 'grilles');

        expect(r).toHaveLength(2);
        expect(new Set(r.map((g) => g.id)).size).toBe(2);
        expect(r.map((g) => g.nom).sort()).toEqual(['RÉÉCRITE en juin', 'Version de mars']);
    });

    it('l’ORDRE des clés ne fabrique pas un faux conflit', () => {
        // Sans signature aux clés triées, deux copies écrites dans un ordre
        // différent passeraient pour un conflit — et le renommage fantôme
        // reviendrait par la fenêtre.
        const r = win.verifierUniciteIds([
            { id: 'G1', nom: 'Structure', criteres: ['a', 'b'] },
            { criteres: ['a', 'b'], nom: 'Structure', id: 'G1' }
        ], 'grilles');
        expect(r).toHaveLength(1);
    });

    it('trois copies identiques ⇒ une seule survit', () => {
        const lot = () => grille('G_TRIPLE', 'Plan de rédaction');
        const r = win.verifierUniciteIds([lot(), lot(), lot()], 'cartouches');
        expect(r).toHaveLength(1);
    });

    it('les entrées sans id et les valeurs non-tableau passent intactes', () => {
        const sansId = { nom: 'orpheline' };
        const r = win.verifierUniciteIds([sansId, grille('G1', 'A'), null], 'x');
        expect(r).toHaveLength(3);
        expect(r).toContain(sansId);
        expect(win.verifierUniciteIds('pas-un-tableau', 'x')).toBe('pas-un-tableau');
        expect(win.verifierUniciteIds(undefined, 'x')).toBeUndefined();
    });

    it('⚠ le filet de fusionnerParIdentite hérite du correctif', () => {
        // Le lot ENTRANT porte lui-même sa copie interne identique : après la
        // fusion, elle est écartée — pas renommée en doublon fantôme.
        const r = win.fusionnerParIdentite([], [
            grille('G_A', 'Structure'),
            grille('G_A', 'Structure')
        ], 'grilles');
        expect(r.liste).toHaveLength(1);                                   // ← 2 avant le correctif
        expect(r.liste[0].id).toBe('G_A');
    });
});

describe('#454 · les invariants de source', () => {
    it('verifierUniciteIds compare les CONTENUS avant de renommer', () => {
        const bloc = sourceImport.slice(
            sourceImport.indexOf('function verifierUniciteIds'),
            sourceImport.indexOf('* MODULE: import-export.js')
        );
        expect(bloc).toMatch(/signatureContenu\(premier, \['id'\]\)/);
        // `null` (contenu non sérialisable) ne conclut jamais à l'identité —
        // même garde vitale que dans fusionnerParIdentite (#448).
        expect(bloc).toMatch(/sigPremier !== null && sigPremier === sigItem/);
    });

    it('chargerCodex applique toujours le filet aux bibliothèques partagées (#292)', () => {
        // Le chemin le plus exposé : Grégoire charge des codex régulièrement.
        // Le filet doit rester en place — c'est LUI qui, corrigé, cesse de
        // fabriquer des fantômes à chaque restauration.
        expect(sourceCodex).toMatch(/_estBiblioPartagee\(cleEntree\)/);
        expect(sourceCodex).toMatch(/valeurEntree = window\.verifierUniciteIds\(valeurEntree, cleEntree\)/);
    });
});
