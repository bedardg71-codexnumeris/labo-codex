import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #967 (8 octobre 2026) — « ÉCRASER » UN HOMONYME EMPLOYÉ EST REFUSÉ.
//
// Décision de Grégoire (7 oct. 2026, par Cowork) : un homonyme EMPLOYÉ n'est pas écrasé.
// Refus avec la phrase validée, même forme pour les trois éditeurs, compte réel :
//   « Une échelle porte déjà ce nom, et 12 évaluations et 2 productions l'emploient :
//     l'écraser changerait des notes. Donne un autre nom à la nouvelle. »
// Un homonyme que rien n'emploie s'écrase comme avant. Remplacer un modèle employé reste
// le rôle de « Supprimer » (#648).
//
// Ce que la sentinelle verrouille (magasins forgés en mémoire, noms fictifs) :
//   A — le compte d'une grille et d'une cartouche nomme tout ce qui les nomme ;
//   B — les homonymes sont comptés ENSEMBLE, sur le trimestre actif, et un homonyme que
//       rien n'emploie compte zéro ;
//   C — la phrase, ses trois sujets et son accord ;
//   D — la question commune refuse AVANT de proposer le codex, et les quatre appels des
//       trois éditeurs lui passent leur compteur.
// Le geste lui-même (refus à l'écran, rien d'écrit ; écrasement sans référence orpheline ;
// la cartouche ouverte) : tests/integration/ecraser-homonyme-employe-967.spec.js.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const nettoyer = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const lire = (f) => nettoyer(readFileSync(path.join(racineProjet, f), 'utf8'));

function corps(src, nom) {
    let i = src.indexOf('function ' + nom + '(');
    expect(i, nom + ' doit exister').toBeGreaterThan(-1);
    let j = src.indexOf('{', src.indexOf(')', i)), prof = 0, vu = false;
    for (; j < src.length; j++) {
        if (src[j] === '{') { prof++; vu = true; }
        else if (src[j] === '}') { prof--; if (vu && prof === 0) break; }
    }
    return src.slice(i, j + 1);
}

function magasins() {
    return {
        a2026_evaluationsSauvegardees: [
            { id: 'E1', grilleId: 'G_A', cartoucheId: 'C_A', echelleId: 'ECH_A' },
            { id: 'E2', grilleId: 'G_A', cartoucheId: 'C_A' },
            { id: 'E3', grilleId: 'G_B', cartoucheId: 'C_B' },
            { id: 'E4', grilleId: 'G_A2' }
        ],
        a2026_productions: [{ id: 'P1', grilleId: 'G_A', cartoucheId: 'C_A' }, { id: 'P2', grilleId: 'G_B' }],
        a2026_pratiquesConfigurables: [
            { id: 'PR1', configuration: { grilleId: 'G_A' } },
            { id: 'PR2', configuration: { grilleId: 'G_B' } }
        ],
        a2026_grillesTemplates: [{ id: 'G_A', nom: 'Grille fictive Orme' }, { id: 'G_B', nom: 'Grille fictive Saule' }, { id: 'G_VIDE', nom: 'Grille fictive Tilleul' }],
        a2026_cartouches_G_A: [{ id: 'C_A', nom: 'Cartouche fictive Orme' }, { id: 'C_A_bis', nom: 'Cartouche fictive Orme bis' }],
        a2026_cartouches_G_B: [{ id: 'C_B', nom: 'Cartouche fictive Saule' }],
        a2026_cartouches_G_VIDE: [],
        a2026_echellesTemplates: [{ id: 'ECH_A', nom: 'Échelle fictive Orme', niveaux: [] }]
    };
}

function charger(store) {
    const db = {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; },
        modifier: async (c, m, d = null) => { const r = await m(c in store ? store[c] : d); if (r !== undefined) store[c] = r; return r; }
    };
    const globaux = {
        db, cle: (k) => 'a2026_' + k,
        document: {
            getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {} }),
            addEventListener() {}
        },
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        echapperHtml: (t) => String(t == null ? '' : t)
    };
    const win = chargerScript('js/echelles.js', globaux);
    chargerScript('js/grilles.js', globaux, win);
    chargerScript('js/cartouches.js', globaux, win);
    chargerScript('js/modal-doublon.js', globaux, win);
    return win;
}

/* ------------------------------------------------------------------ A */

describe('#967 · A — le compte nomme tout ce qui nomme une grille, une cartouche', () => {
    const s = magasins();
    const win = charger(s);
    const m = {
        evaluations: s.a2026_evaluationsSauvegardees, productions: s.a2026_productions,
        pratiques: s.a2026_pratiquesConfigurables,
        cartouchesParGrille: { G_A: s.a2026_cartouches_G_A, G_B: s.a2026_cartouches_G_B, G_VIDE: [] }
    };
    it('grille : évaluations, productions, pratiques (configuration.grilleId), cartouches de son ancrage', () => {
        expect(win.compterPorteursGrilleDans('G_A', m)).toEqual({ evaluations: 2, productions: 1, pratiques: 1, cartouches: 2, total: 6 });
        expect(win.compterPorteursGrilleDans('G_VIDE', m).total).toBe(0);
    });
    it('cartouche : évaluations et productions qui la nomment', () => {
        expect(win.compterPorteursCartoucheDans('C_A', m)).toEqual({ evaluations: 2, productions: 1, total: 3 });
        expect(win.compterPorteursCartoucheDans('C_A_bis', m).total).toBe(0);
    });
});

/* ------------------------------------------------------------------ B */

describe('#967 · B — les homonymes comptés ensemble, dans le trimestre actif', () => {
    it('grille : deux homonymes additionnent leurs porteurs ; un homonyme vide compte zéro', async () => {
        const win = charger(magasins());
        const nb = await win.compterPorteursHomonymesGrille([{ id: 'G_A' }, { id: 'G_B' }]);
        expect(nb).toEqual({ evaluations: 3, productions: 2, pratiques: 2, cartouches: 3, total: 10 });
        expect((await win.compterPorteursHomonymesGrille([{ id: 'G_VIDE' }])).total).toBe(0);
    });
    it('cartouche', async () => {
        const win = charger(magasins());
        expect(await win.compterPorteursHomonymesCartouche([{ id: 'C_A' }, { id: 'C_B' }])).toEqual({ evaluations: 3, productions: 1, total: 4 });
        expect((await win.compterPorteursHomonymesCartouche([{ id: 'C_A_bis' }])).total).toBe(0);
    });
    it('échelle : le compte de #648, réuni', async () => {
        const win = charger(magasins());
        const nb = await win.compterPorteursHomonymesEchelle([{ id: 'ECH_A' }]);
        expect(nb.evaluations).toBe(1);
        expect(nb.total).toBe(1);
        expect((await win.compterPorteursHomonymesEchelle([{ id: 'ECH_ABSENTE' }])).total).toBe(0);
    });
    it('un autre trimestre ne compte pas', async () => {
        const s = magasins();
        s.h2026_evaluationsSauvegardees = [{ id: 'X', grilleId: 'G_VIDE', cartoucheId: 'C_A_bis' }];
        const win = charger(s);
        expect((await win.compterPorteursHomonymesGrille([{ id: 'G_VIDE' }])).total).toBe(0);
        expect((await win.compterPorteursHomonymesCartouche([{ id: 'C_A_bis' }])).total).toBe(0);
    });
});

/* ------------------------------------------------------------------ C */

describe('#967 · C — la phrase validée par Grégoire', () => {
    const win = charger(magasins());
    it('l\'exemple de la décision, mot pour mot', () => {
        expect(win.phraseRefusEcrasement('echelle', { evaluations: 12, productions: 2, total: 14 }))
            .toBe('Une échelle porte déjà ce nom, et 12 évaluations et 2 productions l\'emploient : l\'écraser changerait des notes. Donne un autre nom à la nouvelle.');
    });
    it('« des notes » au singulier aussi (décision de Grégoire, 8 oct.)', () => {
        expect(win.phraseRefusEcrasement('echelle', { evaluations: 1, total: 1 }))
            .toBe('Une échelle porte déjà ce nom, et 1 évaluation l\'emploie : l\'écraser changerait des notes. Donne un autre nom à la nouvelle.');
    });
    it('« Une grille », « Une cartouche » ; « l\'emploie » au singulier', () => {
        expect(win.phraseRefusEcrasement('grille', { cartouches: 1, total: 1 }))
            .toBe('Une grille porte déjà ce nom, et 1 cartouche l\'emploie : l\'écraser changerait des notes. Donne un autre nom à la nouvelle.');
        expect(win.phraseRefusEcrasement('cartouche', { evaluations: 1, productions: 1, total: 2 }))
            .toBe('Une cartouche porte déjà ce nom, et 1 évaluation et 1 production l\'emploient : l\'écraser changerait des notes. Donne un autre nom à la nouvelle.');
    });
});

/* ------------------------------------------------------------------ D */

describe('#967 · D — le refus est posé dans la question commune, avant le codex', () => {
    it('verifierEtGererDoublon refuse (null) avant Codex.proposerAvantSuppression', () => {
        const c = corps(lire('js/modal-doublon.js'), 'verifierEtGererDoublon');
        const refus = c.indexOf('alert(phraseRefusEcrasement(typeRessource, nb));');
        expect(refus).toBeGreaterThan(-1);
        expect(c.slice(refus, refus + 120)).toMatch(/^alert\(phraseRefusEcrasement\(typeRessource, nb\)\);\s*return null;/);
        expect(c).toContain('if (nb && nb.total > 0) {');
        expect(refus).toBeLessThan(c.indexOf("Codex.proposerAvantSuppression('remplacement')"));
    });
    it('les homonymes sont ceux que l\'écriture retirera : même nom, autre id', () => {
        const c = corps(lire('js/modal-doublon.js'), 'verifierEtGererDoublon');
        expect(c).toContain('item.nom === nomNouveau && (!idActuel || item.id !== idActuel)');
    });
    it('les quatre appels des trois éditeurs passent leur compteur', () => {
        const appels = [
            ['js/echelles.js', 'sauvegarderEchelleComplete', "verifierEtGererDoublon('echelle'", 'compterPorteursHomonymesEchelle(homonymes)'],
            ['js/grilles.js', 'sauvegarderGrilleTemplate', "verifierEtGererDoublon('grille'", 'compterPorteursHomonymesGrille(homonymes)'],
            ['js/cartouches.js', 'sauvegarderNomCartouche', "verifierEtGererDoublon('cartouche'", 'compterPorteursHomonymesCartouche(homonymes)'],
            ['js/cartouches.js', 'sauvegarderCartouche', "verifierEtGererDoublon('cartouche'", 'compterPorteursHomonymesCartouche(homonymes)']
        ];
        for (const [f, fn, appel, compteur] of appels) {
            const c = corps(lire(f), fn);
            const i = c.indexOf(appel);
            expect(i, `${fn} : l'appel`).toBeGreaterThan(-1);
            const fin = c.indexOf(');', i);
            expect(c.slice(i, fin), `${fn} : porteursHomonymes`).toContain('porteursHomonymes: (homonymes) => ' + compteur);
        }
    });
    it('cartouche ouverte pendant la question : rien n\'est écrit avant modifierEtAnnoncer', () => {
        const c = corps(lire('js/cartouches.js'), 'sauvegarderNomCartouche');
        const garde = c.indexOf("nonEnregistre('tu as ouvert la cartouche qui porte déjà ce nom.'");
        expect(garde).toBeGreaterThan(-1);
        expect(garde).toBeLessThan(c.indexOf('modifierEtAnnoncer('));
    });
});
