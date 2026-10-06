import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerCodex } from './_helpers/charger-codex.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// #336 Lot D — purge de l'espace précédent à l'ouverture d'un codex (11 juin 2026).
//
// Constat iPad du 11 juin : après import d'un codex ~1 Go, « Documents et
// données » Safari montait à 2,5 Go — l'espace précédent (clés namespacées
// d'anciens trimestres + blobs non référencés) n'était jamais purgé.
// Sémantique actée (ECOSYSTEME-DONNEES.md) : ouvrir un codex = REMPLACEMENT.
//
// Phase livrée ici = PREVIEW : chargerCodex PLANIFIE et AFFICHE en console,
// rien n'est supprimé automatiquement. Codex.purgerEspacePrecedent() exécute
// le plan sur décision humaine. L'activation automatique attend la validation
// terrain de la preview (critère de fin du plan #335/#336).

let removeAppels;
let deleteBlobAppels;
let storeSync;
const dbStub = {
    ready: true,
    init: async () => {},
    get: async (k, def = null) => def,
    set: async () => {},
    remove: async (k) => { removeAppels.push(k); delete storeSync[k]; },
    deleteBlob: async (id) => { deleteBlobAppels.push(id); },
    flush: async () => {},
    keys: async () => [],
    listBlobIds: async () => [],
    getSync: (k, def = null) => (k in storeSync ? storeSync[k] : def),
    setSync: (k, v) => { storeSync[k] = v; }
};

let Codex;
beforeAll(() => {
    const win = chargerCodex(dbStub);
    Codex = win.Codex;
});

function resetStub() {
    removeAppels = [];
    deleteBlobAppels = [];
    storeSync = {};
}

// Codex importé : 1 trimestre h2026 avec fichiersTravaux référençant F1/F2.
const DONNEES = {
    trimestres: [{ id: 'h2026', actif: true }],
    h2026_productions: [{ id: 'P1' }],
    h2026_fichiersTravaux: [{ id: 'F1' }, { id: 'F2' }],
    _meta: { exportePar: 'test' }   // entrée `_…` : jamais écrite, jamais comptée
};

describe('#336 D · _planifierPurgeEspace (fonction pure)', () => {

    it('stockage aligné sur le codex → aucun orphelin', () => {
        const plan = Codex._planifierPurgeEspace(
            DONNEES,
            ['trimestres', 'h2026_productions', 'h2026_fichiersTravaux'],
            ['F1', 'F2']
        );
        expect(plan.clesOrphelines).toEqual([]);
        expect(plan.blobsOrphelins).toEqual([]);
    });

    it('clés d\'un ANCIEN trimestre absent du codex → orphelines (le cas du doublement iPad)', () => {
        const plan = Codex._planifierPurgeEspace(
            DONNEES,
            ['trimestres', 'h2026_productions', 'h2026_fichiersTravaux',
             'a2024_productions', 'a2024_evaluationsSauvegardees'],
            []
        );
        expect(plan.clesOrphelines).toEqual(['a2024_productions', 'a2024_evaluationsSauvegardees']);
    });

    it('clé du MÊME trimestre absente du codex → orpheline (remplacement, pas fusion)', () => {
        const plan = Codex._planifierPurgeEspace(
            DONNEES,
            ['h2026_productions', 'h2026_fichiersTravaux', 'h2026_vieilleCleResiduelle'],
            []
        );
        expect(plan.clesOrphelines).toEqual(['h2026_vieilleCleResiduelle']);
    });

    it('clés globales, démo et techniques → JAMAIS candidates (filtre par identité)', () => {
        const plan = Codex._planifierPurgeEspace(
            DONNEES,
            ['grillesTemplates', 'infoCours', 'demo_productions', '_codex_etat',
             'cartouches_G1', 'preferences'],
            []
        );
        expect(plan.clesOrphelines).toEqual([]);
    });

    it('les entrées `_…` du dataset ne légitiment PAS une clé de stockage', () => {
        // `_meta` est dans le dataset mais n'est jamais écrite : une clé de
        // stockage `h2026__meta`-like absente du codex reste orpheline.
        const plan = Codex._planifierPurgeEspace(
            DONNEES,
            ['h2026_productions', 'h2026_fichiersTravaux', 'h2026_meta'],
            []
        );
        expect(plan.clesOrphelines).toEqual(['h2026_meta']);
    });

    it('blobs non référencés par les fichiersTravaux importés → orphelins', () => {
        const plan = Codex._planifierPurgeEspace(
            DONNEES,
            [],
            ['F1', 'F2', 'VIEUX_BLOB_1', 'VIEUX_BLOB_2']
        );
        expect(plan.blobsOrphelins).toEqual(['VIEUX_BLOB_1', 'VIEUX_BLOB_2']);
    });

    it('références blobs collectées sur TOUTES les clés fichiersTravaux (codex multi-trimestre)', () => {
        const multi = {
            ...DONNEES,
            a2025_fichiersTravaux: [{ id: 'F_A2025' }]
        };
        const plan = Codex._planifierPurgeEspace(multi, [], ['F1', 'F2', 'F_A2025', 'ORPHELIN']);
        expect(plan.blobsOrphelins).toEqual(['ORPHELIN']);
    });

    it('fichiersTravaux non-tableau ou entrées sans id → tolérés sans crash', () => {
        const corrompu = {
            h2026_fichiersTravaux: 'pas-un-tableau',
            a2025_fichiersTravaux: [null, {}, { id: 'F_OK' }]
        };
        const plan = Codex._planifierPurgeEspace(corrompu, [], ['F_OK', 'AUTRE']);
        expect(plan.blobsOrphelins).toEqual(['AUTRE']);
    });

});

describe('#336 D · _executerPurgeEspace + purgerEspacePrecedent', () => {

    it('exécute le plan : db.remove par clé, db.deleteBlob par blob, bilan exact', async () => {
        resetStub();
        const bilan = await Codex._executerPurgeEspace({
            clesOrphelines: ['a2024_productions', 'a2024_presences'],
            blobsOrphelins: ['B1', 'B2', 'B3']
        });
        expect(removeAppels).toEqual(['a2024_productions', 'a2024_presences']);
        expect(deleteBlobAppels).toEqual(['B1', 'B2', 'B3']);
        expect(bilan).toEqual({ clesSupprimees: 2, blobsSupprimes: 3, echecs: [] });
    });

    it('purgerEspacePrecedent sans plan en attente → null, aucune suppression', async () => {
        resetStub();
        const res = await Codex.purgerEspacePrecedent();
        expect(res).toBeNull();
        expect(removeAppels).toEqual([]);
        expect(deleteBlobAppels).toEqual([]);
    });

    it('le plan PERSISTÉ survit au rechargement : restauration → purge → clé consommée', async () => {
        // Constat terrain 11 juin 15h27 : le reload post-import efface la
        // console ET la mémoire du module — le plan doit être rechargeable.
        resetStub();
        storeSync['_codex_planPurge336'] = {
            plan: { clesOrphelines: ['a2024_productions'], blobsOrphelins: ['B1'] },
            date: '2026-06-11T15:27:00', fichier: 'codex-test.zip'
        };
        Codex._restaurerPlanPurge();
        const bilan = await Codex.purgerEspacePrecedent();
        expect(bilan).toEqual({ clesSupprimees: 1, blobsSupprimes: 1, echecs: [] });
        expect(removeAppels).toContain('a2024_productions');
        expect(removeAppels).toContain('_codex_planPurge336');   // consommée
        expect(deleteBlobAppels).toEqual(['B1']);
    });

    it('plan persisté vide ou malformé → restauration silencieuse, rien à purger', async () => {
        resetStub();
        storeSync['_codex_planPurge336'] = { plan: { clesOrphelines: [], blobsOrphelins: [] } };
        Codex._restaurerPlanPurge();
        expect(await Codex.purgerEspacePrecedent()).toBeNull();

        resetStub();
        storeSync['_codex_planPurge336'] = { plan: 'corrompu' };
        Codex._restaurerPlanPurge();
        expect(await Codex.purgerEspacePrecedent()).toBeNull();
        expect(removeAppels).toEqual([]);
        expect(deleteBlobAppels).toEqual([]);
    });

});

describe('#336 D · câblage dans chargerCodex (sentinelle statique)', () => {

    const src = readFileSync(path.join(racine, 'js/codex.js'), 'utf8');

    it('la preview est calculée dans chargerCodex, APRÈS la vérification de persistance', () => {
        const idxPersistance = src.indexOf('var ecartsPersistance = await _verifierEcritureTemoins(donnees)');
        const idxPurge = src.indexOf('_planifierPurgeEspace(donnees, clesStockage, blobIdsStockage, ');   // T2 : + les fichiers du démo installé
        expect(idxPersistance).toBeGreaterThan(-1);
        expect(idxPurge).toBeGreaterThan(idxPersistance);
    });

    it('AUCUNE exécution automatique : chargerCodex n\'appelle jamais _executerPurgeEspace', () => {
        // L'exécution ne passe que par purgerEspacePrecedent() (décision humaine).
        const appels = src.match(/_executerPurgeEspace\(/g) || [];
        // 1 définition exclue par le \( … : on compte les appels hors définition.
        const appelsHorsDef = src.match(/return _executerPurgeEspace\(|await _executerPurgeEspace\(/g) || [];
        expect(appelsHorsDef.length).toBe(1);   // uniquement dans purgerEspacePrecedent
        expect(src).toMatch(/purge \(PREVIEW — rien n/);
    });

    it('la fusion ne purge JAMAIS (périmètre strictement chargerCodex)', () => {
        const idxFusion = src.indexOf('async function actionFusionner');
        expect(idxFusion).toBeGreaterThan(-1);
        // Aucune référence à la purge dans tout le code à partir de actionFusionner
        // jusqu'à la fin de la fonction suivante (fenêtre large par prudence).
        const zoneFusion = src.slice(idxFusion, idxFusion + 20000);
        expect(zoneFusion).not.toMatch(/_planifierPurgeEspace|_executerPurgeEspace|purgerEspacePrecedent/);
    });

    it('un plan vide est annulé (pas de purge en attente sur espace propre)', () => {
        expect(src).toMatch(/aucun orphelin — espace déjà propre/);
    });

    it('le plan est PERSISTÉ avant le reload et restauré au boot (constat 11 juin 15h27)', () => {
        // Persistance dans chargerCodex…
        expect(src).toMatch(/db\.setSync\(CLE_PLAN_PURGE,/);
        // …restauration câblée dans initialiserCodex (après db-ready)…
        const idxInit = src.indexOf('function initialiserCodex');
        const zoneInit = src.slice(idxInit, idxInit + 3000);
        expect(zoneInit).toMatch(/_restaurerPlanPurge/);
        // …et consommation de la clé à l'exécution.
        const idxPurger = src.indexOf('async function purgerEspacePrecedent');
        const zonePurger = src.slice(idxPurger, idxPurger + 800);
        expect(zonePurger).toMatch(/db\.remove\(CLE_PLAN_PURGE\)/);
    });

});
