import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerCodex } from './_helpers/charger-codex.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// #335 Lot C — vérification d'écriture post-import (11 juin 2026).
//
// Leçon de l'incident bis du 11 juin : après la restauration du 10 juin,
// une copie PÉRIMÉE de h2026_productions a survécu dans IndexedDB et a
// ressuscité au rechargement suivant (espace sain à 09h10 prouvé par codex,
// corrompu à 09h30 après reload). chargerCodex relit maintenant les clés
// témoins du modèle depuis IDB et compare à ce qui vient d'être écrit —
// retentative ciblée puis alerte explicite, jamais d'échec silencieux.

// db contrôlable : idb simule ce qu'IndexedDB RELIT (indépendant des écritures).
let idb;
let setAppels;
const dbStub = {
    ready: true,
    init: async () => {},
    get: async (k, def = null) => {
        if (idb[k] === '__THROW__') throw new Error('IDB indisponible');
        return (k in idb) ? idb[k] : def;
    },
    set: async (k, v) => { setAppels.push(k); },
    remove: async () => {},
    flush: async () => {},
    keys: async () => [],
    getSync: () => null,
    setSync: () => {}
};

let Codex;
beforeAll(() => {
    const win = chargerCodex(dbStub);
    Codex = win.Codex;
});

function resetStub(contenuIdb) {
    idb = contenuIdb;
    setAppels = [];
}

const DONNEES = {
    trimestres: [{ id: 'h2026', actif: true }],
    h2026_productions: [{ id: 'P1', coursId: 'C_NEUF' }],
    h2026_evaluationsSauvegardees: [{ id: 'E1' }],
    h2026_groupesCours: [{ id: 'GC1' }],
    h2026_groupeEtudiants: [{ da: '1234567' }],
    h2026_horaires: [{ id: 'H1' }],          // pas un témoin
    infoCours: { id: 'C_NEUF' }              // pas un témoin
};

describe('#335 C · _verifierEcritureTemoins (fonctionnel)', () => {

    it('relecture conforme → aucun écart', async () => {
        resetStub({ ...DONNEES });
        expect(await Codex._verifierEcritureTemoins(DONNEES)).toEqual([]);
    });

    it('copie PÉRIMÉE en IDB → la clé est signalée (le cas de l\'incident)', async () => {
        resetStub({
            ...DONNEES,
            h2026_productions: [{ id: 'VIEUX', coursId: 'COURS_ORPHELIN' }]
        });
        expect(await Codex._verifierEcritureTemoins(DONNEES)).toEqual(['h2026_productions']);
    });

    it('clé témoin ABSENTE de la relecture → signalée aussi', async () => {
        const sansGC = { ...DONNEES };
        resetStub(sansGC);
        delete idb.h2026_groupesCours;
        expect(await Codex._verifierEcritureTemoins(DONNEES)).toEqual(['h2026_groupesCours']);
    });

    it('seules les clés témoins sont vérifiées (horaires/infoCours ignorées)', async () => {
        resetStub({
            ...DONNEES,
            h2026_horaires: [{ id: 'AUTRE' }],   // divergent mais PAS témoin
            infoCours: { id: 'AUTRE' }
        });
        expect(await Codex._verifierEcritureTemoins(DONNEES)).toEqual([]);
    });

    it('cibles explicites → vérifie uniquement celles-là', async () => {
        resetStub({
            ...DONNEES,
            h2026_productions: [{ id: 'VIEUX' }],
            h2026_groupeEtudiants: [{ da: 'AUTRE' }]
        });
        expect(await Codex._verifierEcritureTemoins(DONNEES, ['h2026_groupeEtudiants']))
            .toEqual(['h2026_groupeEtudiants']);
    });

    it('relecture qui ÉCHOUE = écart (on ne peut pas confirmer)', async () => {
        resetStub({ ...DONNEES, h2026_productions: '__THROW__' });
        expect(await Codex._verifierEcritureTemoins(DONNEES)).toEqual(['h2026_productions']);
    });

});

describe('#335 C · câblage dans chargerCodex (sentinelle statique)', () => {

    const src = readFileSync(path.join(racine, 'js/codex.js'), 'utf8');

    it('la vérification est appelée après flush dans chargerCodex', () => {
        // Ordre verrouillé : flush PUIS vérification (sinon les écritures
        // pendantes faussent la relecture).
        const idx = src.indexOf('var ecartsPersistance = await _verifierEcritureTemoins(donnees)');
        expect(idx).toBeGreaterThan(-1);
        const avant = src.slice(Math.max(0, idx - 400), idx);
        expect(avant).toMatch(/await db\.flush\(\)/);
    });

    it('retentative ciblée puis re-vérification restreinte aux écarts', () => {
        expect(src).toMatch(/_verifierEcritureTemoins\(donnees, ecartsPersistance\)/);
    });

    it('échec final → alerte explicite (jamais silencieux)', () => {
        expect(src).toMatch(/Vérification de persistance échouée/);
        expect(src).toMatch(/ANCIENNE version/);
    });

});
