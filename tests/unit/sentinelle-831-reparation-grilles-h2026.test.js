import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE #831 — L'OUTIL DE RÉPARATION DES GRILLES H2026 (instance en ligne)
// N'ÉCRIT QUE CE QU'IL PROUVE, ET RIEN D'AUTRE.
//
// Le cas réel (sonde #831, 11 sept. 2026) : 408 évaluations citent trois grilles
// absentes ; trois jumelles renumérotées en juin portent exactement leurs
// critères. L'outil (scripts/reparation-831-grilles-h2026-en-ligne.js) recrée
// chaque grille sous l'identifiant attendu depuis sa jumelle, prouvée par
// l'ensemble exact des critereId des évals — jamais par un nom, jamais par une
// correspondance tapée.
//
// VERROUILLÉ ICI :
//   1. dry-run : aucune écriture ;
//   2. exécution : la grille recréée porte l'id attendu et les critères de la
//      jumelle ; la jumelle reste ; les évaluations ne sont pas touchées ;
//   3. preuve : une jumelle dont un critère diffère est REFUSÉE (aucune
//      écriture) ; deux jumelles possibles = ambigu = refus ;
//   4. cartouches : copiées dans le tiroir attendu avec grilleId mis à jour ;
//      un tiroir déjà rempli n'est pas écrasé ;
//   5. hors H2026 actif : refus.
//
// BREAK-TEST VÉRIFIÉ le 11 septembre 2026 — journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..', '..');
const clone = (x) => JSON.parse(JSON.stringify(x));

function monter(store, trimestre = 'h2026') {
    const journal = [];
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); journal.push(k); },
        removeSync: (k) => { delete store[k]; journal.push('-' + k); },
        flush: async () => { journal.push('flush'); },
    };
    const win = {};
    const src = readFileSync(path.join(RACINE, 'scripts/reparation-831-grilles-h2026-en-ligne.js'), 'utf8');
    // eslint-disable-next-line no-new-func
    new Function('window', 'db', 'obtenirTrimestreId', 'console', src)(win, db, () => trimestre, { log() {} });
    return { win, store, journal };
}

const CRIT = (ids) => ids.map((id) => ({ id, nom: 'c' + id }));
const EVAL = (grilleId, ids) => ({ id: 'e' + Math.random(), grilleId, criteres: ids.map((critereId) => ({ critereId, niveau: 'D' })) });

function storeBase() {
    return {
        h2026_grillesTemplates: [
            { id: 'GRILLE_GENERIQUE', nom: 'Grille de départ', criteres: CRIT(['g1', 'g2', 'g3', 'g4']) },
            { id: 'GRILLE_NEUF_A', nom: 'Grille-4 H26', criteres: CRIT(['a1', 'a2', 'a3', 'a4']), dansBibliotheque: true },
            { id: 'GRILLE_NEUF_B', nom: 'Grille-5 FR-HOLIS H26', criteres: CRIT(['b1', 'b2', 'b3', 'b4', 'b5']) },
        ],
        h2026_evaluationsSauvegardees: [
            EVAL('grille_ANCIEN_A', ['a1', 'a2', 'a3', 'a4']), EVAL('grille_ANCIEN_A', ['a1', 'a2', 'a3', 'a4']),
            EVAL('grille_ANCIEN_B', ['b1', 'b2', 'b3', 'b4', 'b5']),
        ],
        h2026_cartouches_GRILLE_NEUF_A: [{ id: 'cart1', grilleId: 'GRILLE_NEUF_A', nom: 'Cartouche A' }],
    };
}

describe('#831 · dry-run et exécution', () => {
    it('dry-run : le plan est établi par preuve, rien n\'est écrit', async () => {
        const b = monter(storeBase());
        const rapport = await b.win.reparer831();
        expect(rapport).toMatch(/grille_ANCIEN_A \(2 évals, 4 critères\) ← jumelle GRILLE_NEUF_A/);
        expect(rapport).toMatch(/grille_ANCIEN_B \(1 évals, 5 critères\) ← jumelle GRILLE_NEUF_B/);
        expect(b.journal).toEqual([]);
    });

    it('exécution : grilles recréées sous les ids attendus, jumelles et évaluations intactes, cartouches copiées', async () => {
        const store = storeBase();
        const evalsAvant = clone(store.h2026_evaluationsSauvegardees);
        const b = monter(store);
        const rapport = await b.win.reparer831({ executer: true });
        const ids = store.h2026_grillesTemplates.map((g) => g.id);
        expect(ids).toEqual(['GRILLE_GENERIQUE', 'GRILLE_NEUF_A', 'GRILLE_NEUF_B', 'grille_ANCIEN_A', 'grille_ANCIEN_B']);
        const recreeeA = store.h2026_grillesTemplates.find((g) => g.id === 'grille_ANCIEN_A');
        expect(recreeeA.criteres.map((c) => c.id)).toEqual(['a1', 'a2', 'a3', 'a4']);
        expect(recreeeA.nom).toBe('Grille-4 H26');
        expect(recreeeA.dansBibliotheque).toBe(true);
        expect(store.h2026_evaluationsSauvegardees).toEqual(evalsAvant);
        expect(store.h2026_cartouches_grille_ANCIEN_A).toEqual([{ id: 'cart1', grilleId: 'grille_ANCIEN_A', nom: 'Cartouche A' }]);
        expect(store.h2026_cartouches_GRILLE_NEUF_A[0].grilleId).toBe('GRILLE_NEUF_A');   // témoin intact
        expect(b.journal.filter((k) => k === 'flush').length).toBeGreaterThanOrEqual(2);
        expect(rapport).toMatch(/✓ Les 2 grilles attendues sont présentes/);
        // annuler831 : retour à l'état d'avant
        await b.win.annuler831();
        expect(store.h2026_grillesTemplates.map((g) => g.id)).toEqual(['GRILLE_GENERIQUE', 'GRILLE_NEUF_A', 'GRILLE_NEUF_B']);
        expect('h2026_cartouches_grille_ANCIEN_A' in store).toBe(false);
    });

    it('preuve : une jumelle dont un critère diffère est refusée, sans écriture ; deux candidates = refus', async () => {
        const store = storeBase();
        store.h2026_grillesTemplates[1].criteres = CRIT(['a1', 'a2', 'a3', 'a9']);   // un critère renommé
        const b = monter(store);
        const rapport = await b.win.reparer831({ executer: true });
        expect(rapport).toMatch(/✗ grille_ANCIEN_A .*REFUS : aucune grille du trimestre ne porte exactement ces 4 critères/);
        expect(store.h2026_grillesTemplates.some((g) => g.id === 'grille_ANCIEN_A')).toBe(false);
        const store2 = storeBase();
        store2.h2026_grillesTemplates.push({ id: 'GRILLE_DOUBLON', nom: 'copie', criteres: CRIT(['a1', 'a2', 'a3', 'a4']) });
        const b2 = monter(store2);
        const rapport2 = await b2.win.reparer831({ executer: true });
        expect(rapport2).toMatch(/✗ grille_ANCIEN_A .*2 grilles portent ces critères \(ambigu\)/);
        expect(store2.h2026_grillesTemplates.some((g) => g.id === 'grille_ANCIEN_A')).toBe(false);
    });

    it('un tiroir de cartouches déjà rempli n\'est pas écrasé : même id + contenu différent = refusé', async () => {
        const store = storeBase();
        store.h2026_cartouches_grille_ANCIEN_A = [{ id: 'cart1', grilleId: 'grille_ANCIEN_A', nom: 'Version vivante' }];
        const b = monter(store);
        const rapport = await b.win.reparer831({ executer: true });
        expect(store.h2026_cartouches_grille_ANCIEN_A).toEqual([{ id: 'cart1', grilleId: 'grille_ANCIEN_A', nom: 'Version vivante' }]);
        expect(rapport).toMatch(/1 REFUSÉE/);
    });

    it('hors H2026 actif : refus, rien n\'est écrit', async () => {
        const b = monter(storeBase(), 'a2026');
        const rapport = await b.win.reparer831({ executer: true });
        expect(rapport).toMatch(/⛔ Le trimestre actif est « a2026 »/);
        expect(b.journal).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// JOURNAL DU BREAK-TEST (11 septembre 2026)
//   `memesEnsembles` remise à `a.size === b.size` (comparaison par la taille
//   seule) : l'essai « preuve » ROUGE (la grille au critère renommé est acceptée
//   et recréée). Remis.
// ---------------------------------------------------------------------------
