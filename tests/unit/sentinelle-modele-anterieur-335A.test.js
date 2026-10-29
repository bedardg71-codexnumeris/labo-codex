import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerCodex } from './_helpers/charger-codex.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// #335 Lot A — garde de modèle antérieur (import ET fusion), 11 juin 2026.
//
// Marqueur acté (D2) : pour chaque trimestre présent des deux côtés avec des
// données, si les coursId référencés par l'externe sont totalement DISJOINTS
// de ceux de l'espace courant, les deux états ne parlent pas du même modèle
// → garde BLOQUANTE avec choix (D3). Cas réels : incidents I1 (import codex
// iPad pré-chantier-D) et I3 (résurrection) — l'externe référençait
// COURS1766455789356 quand l'espace consolidé référençait h2026-….
// Un chevauchement même partiel = même lignée → pas d'alerte (un backup plus
// ancien du MÊME modèle reste importable sans bruit).

let local;
const dbStub = {
    ready: true,
    init: async () => {},
    get: async (k, def = null) => (k in local ? local[k] : def),
    set: async () => {},
    remove: async () => {},
    flush: async () => {},
    keys: async () => Object.keys(local),
    getSync: (k, def = null) => (k in local ? local[k] : def),
    setSync: (k, v) => { local[k] = v; }
};

let Codex;
beforeAll(() => {
    Codex = chargerCodex(dbStub).Codex;
});

beforeEach(() => {
    // Espace local : modèle consolidé (le vrai cas du 11 juin)
    local = {
        h2026_productions: [{ id: 'P1', coursId: 'h2026-601-101-MQ-00001' }],
        h2026_evaluationsSauvegardees: [{ id: 'E1', coursId: 'h2026-601-101-MQ-00001' }],
        h2026_groupesCours: [{ id: 'GC1', coursId: 'h2026-601-101-MQ-00001' }]
    };
});

describe('#335 A · _detecterModeleAnterieur (fonctionnel)', () => {

    it('externe au modèle DISJOINT → suspect (repro incidents I1/I3)', () => {
        const externe = {
            h2026_productions: [{ id: 'VP1', coursId: 'COURS1766455789356' }],
            h2026_evaluationsSauvegardees: [{ id: 'VE1', coursId: 'COURS1766455789356' }],
            h2026_groupesCours: [{ id: 'VGC', coursId: 'COURS1766455789356' }]
        };
        const det = Codex._detecterModeleAnterieur(externe, { dateDerniereModification: '2026-06-10' });
        expect(det).not.toBeNull();
        expect(det.suspects).toHaveLength(1);
        expect(det.suspects[0].trimestre).toBe('h2026');
        expect(det.suspects[0].externes).toContain('COURS1766455789356');
        expect(det.dateExterne).toBe('2026-06-10');
    });

    it('chevauchement même partiel → même lignée, pas d\'alerte', () => {
        const externe = {
            h2026_productions: [
                { id: 'P1', coursId: 'h2026-601-101-MQ-00001' },   // commun
                { id: 'P2', coursId: 'COURS_AUTRE' }
            ],
            h2026_evaluationsSauvegardees: [],
            h2026_groupesCours: []
        };
        expect(Codex._detecterModeleAnterieur(externe, null)).toBeNull();
    });

    it('espace local VIDE pour le trimestre → rien à protéger, pas d\'alerte', () => {
        local = {};   // premier lancement / espace neuf
        const externe = {
            h2026_productions: [{ id: 'P1', coursId: 'COURS_VIEUX' }]
        };
        expect(Codex._detecterModeleAnterieur(externe, null)).toBeNull();
    });

    it('externe sans données pour le trimestre → pas d\'alerte', () => {
        const externe = { h2026_productions: [], h2026_groupesCours: [] };
        expect(Codex._detecterModeleAnterieur(externe, null)).toBeNull();
    });

    it('codex d\'un AUTRE trimestre (archive a2025) → aucun trimestre commun, pas d\'alerte', () => {
        const externe = {
            a2025_productions: [{ id: 'P1', coursId: 'a2025-601-101-MQ-00001' }]
        };
        expect(Codex._detecterModeleAnterieur(externe, null)).toBeNull();
    });

    it('multi-trimestres : seul le trimestre divergent est signalé', () => {
        local.a2025_productions = [{ id: 'AP', coursId: 'a2025-OK' }];
        const externe = {
            a2025_productions: [{ id: 'AP', coursId: 'a2025-OK' }],            // aligné
            h2026_productions: [{ id: 'VP', coursId: 'COURS1766455789356' }]   // divergent
        };
        const det = Codex._detecterModeleAnterieur(externe, null);
        expect(det.suspects.map(s => s.trimestre)).toEqual(['h2026']);
    });

});

describe('#335 A · câblage des gardes (sentinelle statique)', () => {

    const src = readFileSync(path.join(racine, 'js/codex.js'), 'utf8');

    it('chargerCodex : garde AVANT toute écriture de la phase données', () => {
        const idxGarde = src.indexOf("_detecterModeleAnterieur(donnees, manifeste)");
        const idxEcriture = src.indexOf('var entreesData = Object.entries(donnees)');
        expect(idxGarde).toBeGreaterThan(-1);
        expect(idxEcriture).toBeGreaterThan(-1);
        expect(idxGarde).toBeLessThan(idxEcriture);
    });

    it('chargerCodex : Annuler → throw, espace non modifié', () => {
        expect(src).toMatch(/Import annulé : ton espace de travail n\\'a pas été modifié/);
    });

    it('actionFusionner : garde AVANT _analyserFusion', () => {
        const idxGarde = src.indexOf('_detecterModeleAnterieur(externe.donnees');
        const idxAnalyse = src.indexOf('var analyse = _analyserFusion(donneesLocales');
        expect(idxGarde).toBeGreaterThan(-1);
        expect(idxAnalyse).toBeGreaterThan(-1);
        expect(idxGarde).toBeLessThan(idxAnalyse);
    });

    it('le message nomme le scénario et offre le choix', () => {
        expect(src).toMatch(/MODÈLE DE DONNÉES différent/);
        expect(src).toMatch(/Continuer quand même \?/);
    });

    it('les modales nomment le fichier source (demande Grégoire, 11 juin)', () => {
        // Garde import : nom passé depuis fichierZip ; garde fusion : depuis fichier.
        expect(src).toMatch(/_messageModeleAnterieur\(detectionModele, 'remplacer', fichierZip && fichierZip\.name\)/);
        expect(src).toMatch(/_messageModeleAnterieur\(detectionModeleFusion, 'fusionner avec', fichier && fichier\.name\)/);
        // Confirm final d'ouverture : « Codex chargé depuis "…" »
        expect(src).toMatch(/Codex chargé depuis/);
    });

});
