/**
 * Sentinelle — LES CASES « PRATIQUES COMPATIBLES » PARTENT, ET LE BADGE DIT
 * ENFIN QUELQUE CHOSE DE VRAI (consigne du 3 septembre 2026, 16 h, volet C).
 *
 * Décision de Grégoire : « Il serait mieux de les retirer. Tout d'un coup. Les
 * grilles sont indépendantes des pratiques de toute façon. » La SAISIE part des
 * cinq objets ; le CHAMP `pratiquesCompatibles` reste dans les données et
 * voyage toujours ; les grilles reçoivent un badge DÉDUIT des types de leurs
 * critères — « le type quand il est unique, "Mixte" sinon ».
 *
 *   P.a la composition d'une grille, déduite et jamais déclarée ;
 *   P.b le témoin de la consigne : `lirePratiquesSelectionnees` ne rend plus
 *       que sa définition — et le témoin INVERSE : le transport n'a pas bougé ;
 *   P.c plus aucune case, plus aucun ancien badge, sur les cinq objets ;
 *   P.d ce qui existe est conservé : une production modifiée garde sa valeur.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

let G;
beforeAll(() => {
    const store = {};
    G = chargerScript('js/gabarits-utils.js', {
        db: { getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)), setSync: (c, v) => { store[c] = v; },
              get: async (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)), set: async (c, v) => { store[c] = v; } },
        cle: (k) => 'a2026_' + k, echapperHtml: (t) => String(t == null ? '' : t).replace(/"/g, '&quot;'),
        estRessourceSupprimee: () => false, marquerRessourceSupprimee: () => {}
    }).GabaritsUtils;
});

const grille = (...types) => ({ id: 'G', nom: 'G', criteres: types.map((t, i) => ({ id: 'C' + i, nom: 'c' + i, type: t })) });

describe('pratiques compatibles retirées · P.a — la composition est déduite, jamais déclarée', () => {
    it('P.a.1 un seul type : ALGO, HOLIS ou ANALY', () => {
        expect(G.compositionGrille(grille('algorithmique', 'algorithmique'))).toBe('ALGO');
        expect(G.compositionGrille(grille('holistique'))).toBe('HOLIS');
        expect(G.compositionGrille(grille('analytique', 'analytique', 'analytique'))).toBe('ANALY');
    });

    it('P.a.2 plusieurs types : MIXTE — et un type change après coup, le badge suit', () => {
        const g = grille('holistique', 'algorithmique');
        expect(G.compositionGrille(g)).toBe('MIXTE');
        g.criteres[0].type = 'algorithmique';
        expect(G.compositionGrille(g)).toBe('ALGO');
    });

    it('P.a.3 aucun critère, ou un seul type inconnu : rien à dire', () => {
        expect(G.compositionGrille(grille())).toBe('');
        expect(G.compositionGrille({ id: 'G' })).toBe('');
        expect(G.compositionGrille(null)).toBe('');
        expect(G.compositionGrille(grille('standard'))).toBe('');
        // Inconnu + connu : c'est bien plusieurs types.
        expect(G.compositionGrille(grille('standard', 'algorithmique'))).toBe('MIXTE');
        // Les critères sans type ne comptent pas.
        expect(G.compositionGrille({ criteres: [{ id: 'x' }, { id: 'y', type: 'holistique' }] })).toBe('HOLIS');
    });

    it('P.a.4 le badge : le code, une classe par composition, un titre qui le dit ; vide quand il n\'y a rien', () => {
        const html = G.genererBadgeComposition(grille('holistique', 'algorithmique'));
        expect(html).toContain('badge-composition--mixte');
        expect(html).toContain('>MIXTE<');
        expect(html).toContain('plusieurs types de critères');
        expect(G.genererBadgeComposition(grille())).toBe('');
        // Il ne dépend PAS du champ déclaré.
        const g = grille('algorithmique'); g.pratiquesCompatibles = ['SOM', 'STD', 'SPE'];
        expect(G.genererBadgeComposition(g)).toContain('>ALGO<');
        expect(G.genererBadgeComposition(g)).not.toContain('MULTI');
    });
});

describe('pratiques compatibles retirées · P.b — les deux témoins de la consigne', () => {
    const fichiersJs = () => readdirSync(path.join(racine, 'js')).filter(f => f.endsWith('.js'));

    it('P.b.1 `lirePratiquesSelectionnees` ne rend plus que sa définition — zéro appelant', () => {
        const appelants = fichiersJs().filter(f => f !== 'gabarits-utils.js' && source('js/' + f).includes('lirePratiquesSelectionnees'));
        expect(appelants).toEqual([]);
        const g = source('js/gabarits-utils.js');
        expect(g).toMatch(/function lirePratiquesSelectionnees\(/);
        expect((g.match(/lirePratiquesSelectionnees\(/g) || []).length, 'la définition seule, pas d\'appel').toBe(1);
        expect(typeof G.lirePratiquesSelectionnees).toBe('function');
    });

    // Lot 3 de la file (10 oct. 2026) : trois → cinq. Le champ « voyage toujours » (décision
    // ci-dessus) ; la liste blanche le jetait encore sur les grilles et les cartouches.
    it('P.b.2 TÉMOIN INVERSE — le transport n\'a pas reculé : import-export.js compte cinq `pratiquesCompatibles`, et le partage le déclare', () => {
        expect((source('js/import-export.js').match(/pratiquesCompatibles/g) || []).length).toBe(5);
        expect(source('js/partage-schemas.js')).toMatch(/pratiquesCompatibles/);
    });
});

describe('pratiques compatibles retirées · P.c — plus aucune case, plus aucun ancien badge', () => {
    it('P.c.1 les cinq objets ne rendent plus de cases, index.html n\'a plus leurs conteneurs', () => {
        ['js/grilles.js', 'js/echelles.js', 'js/cartouches.js', 'js/objectifs.js', 'js/productions.js', 'js/productions-liste.js', 'index.html']
            .forEach(rel => {
                const s = source(rel);
                expect(s.includes('genererCheckboxesPratiques'), rel).toBe(false);
                expect(s.includes('checkboxesPratiques'), rel).toBe(false);
            });
        const g = source('js/gabarits-utils.js');
        expect(g.includes('genererCheckboxesPratiques')).toBe(false);
        expect(g.includes('PRATIQUES_DISPONIBLES')).toBe(false);
    });

    it('P.c.2 l\'ancien badge de pratique n\'existe plus ; les grilles portent la composition, les quatre autres rien', () => {
        readdirSync(path.join(racine, 'js')).filter(f => f.endsWith('.js')).forEach(f => {
            expect(source('js/' + f).includes('genererBadgesPratiques'), f).toBe(false);
        });
        const grilles = source('js/grilles.js');
        // #1147 (24 oct. 2026) : 3 → 2, la barre latérale est partie (restent la bibliothèque, ses deux sections).
        expect((grilles.match(/genererBadgeComposition\(grille\)/g) || []).length).toBe(2);
        ['js/echelles.js', 'js/cartouches.js', 'js/objectifs.js', 'js/productions-liste.js'].forEach(rel => {
            expect(source(rel).includes('genererBadgeComposition'), rel + ' n\'a pas de critères').toBe(false);
        });
    });

    it('P.c.3 plus aucune écriture du champ par la saisie — et la production modifiée garde la sienne', () => {
        ['js/grilles.js', 'js/echelles.js', 'js/cartouches.js', 'js/objectifs.js'].forEach(rel => {
            expect(source(rel)).not.toMatch(/\.pratiquesCompatibles = |pratiquesCompatibles: pratiquesCompatibles|pratiquesCompatibles: \[\]/);
        });
        const prod = source('js/productions.js');
        expect(prod).toMatch(/existingProd\.pratiquesCompatibles !== undefined/);
        expect(prod).not.toMatch(/lirePratiquesSelectionnees/);
    });
});
