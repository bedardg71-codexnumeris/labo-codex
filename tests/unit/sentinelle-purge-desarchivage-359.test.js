import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #359 — desarchiverTrimestre doit PURGER les copies de modèles namespacées posées à
// l'archivage (creerSnapshotRessources : <id>_grillesTemplates / _echellesTemplates /
// _pratiquesConfigurables / _cartouches_<grilleId>). Une fois le flag `archive` retiré,
// cle() ne lit plus ces copies (il retombe sur les clés globales) → ORPHELINS MORTS :
// place perdue (cf. #353 quota saturé) et cartouche périmée au ré-archivage (la copie de
// cartouche n'est réécrite que si length>0). Décision D-D5 : purger au désarchivage
// (≠ modifier cle()), car désarchiver = redevenir un trimestre éditable normal partageant
// le catalogue global. Le backup `snapshot_<id>_*` (référence historique) est CONSERVÉ.
//
// Break-test : sur le code AVANT fix, desarchiverTrimestre ne retire rien → les assertions
// « copie absente » rougissent. C'est la preuve que la sentinelle mord
// (SKILL_verification_adverse, P2 — un test qui ne peut pas échouer ne prouve rien).

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; },
        removeSync: (c) => { delete store[c]; }
    };
}

function chargerTrimestres(store) {
    return chargerScript('js/trimestres.js', { db: dbDepuisStore(store) });
}

const CLE_SNAPSHOT = 'snapshot_a2025_2025-12-20T00-00-00-000Z';

// Store d'un trimestre A25 ARCHIVÉ, avec les copies de modèles qu'un archivage a posées.
function storeArchive() {
    return {
        trimestres: [{
            id: 'a2025', actif: false, archive: true, dateFin: '2025-12-20',
            statistiquesFinales: { nbEtudiants: 20, nbCours: 1 },
            snapshotRessources: CLE_SNAPSHOT
        }],
        // Productions du trimestre → re-dérivent les grilleIds des cartouches au désarchivage.
        a2025_productions: [{ id: 'P1', grilleId: 'G1', echelleId: 'E1', pratiqueId: 'PR1' }],
        grillesTemplates: [{ id: 'G1', echelleId: 'E1' }],
        // Copies figées par creerSnapshotRessources :
        a2025_grillesTemplates: [{ id: 'G1' }],
        a2025_echellesTemplates: [{ id: 'E1' }],
        a2025_pratiquesConfigurables: [{ id: 'PR1' }],
        a2025_cartouches_G1: [{ id: 'CART1' }],
        // Backup historique — NE DOIT PAS être purgé :
        [CLE_SNAPSHOT]: { grilles: [{ id: 'G1' }], _meta: { isolationArchive: true } }
    };
}

describe('#359 · désarchiver purge les copies de modèles namespacées', () => {
    it('retire les 3 copies de templates + la copie de cartouche', () => {
        const store = storeArchive();
        const win = chargerTrimestres(store);
        const r = win.desarchiverTrimestre('a2025');
        expect(r.success).toBe(true);
        expect('a2025_grillesTemplates' in store).toBe(false);
        expect('a2025_echellesTemplates' in store).toBe(false);
        expect('a2025_pratiquesConfigurables' in store).toBe(false);
        expect('a2025_cartouches_G1' in store).toBe(false);
    });

    it('CONSERVE le snapshot de sauvegarde historique (pas un orphelin)', () => {
        const store = storeArchive();
        const win = chargerTrimestres(store);
        win.desarchiverTrimestre('a2025');
        expect(CLE_SNAPSHOT in store).toBe(true);
    });

    it('flippe le flag archive, retire dateFin, conserve statistiquesFinales', () => {
        const store = storeArchive();
        const win = chargerTrimestres(store);
        win.desarchiverTrimestre('a2025');
        const t = store.trimestres.find(x => x.id === 'a2025');
        expect(t.archive).toBe(false);
        expect('dateFin' in t).toBe(false);
        expect(t.statistiquesFinales).toEqual({ nbEtudiants: 20, nbCours: 1 });
    });

    it('rapporte les clés effectivement purgées (copiesPurgees)', () => {
        const store = storeArchive();
        const win = chargerTrimestres(store);
        const r = win.desarchiverTrimestre('a2025');
        expect(r.copiesPurgees).toEqual(expect.arrayContaining([
            'a2025_grillesTemplates', 'a2025_echellesTemplates',
            'a2025_pratiquesConfigurables', 'a2025_cartouches_G1'
        ]));
    });

    it('GARDE — appel sur un trimestre non archivé : refusé, copies intactes', () => {
        const store = storeArchive();
        store.trimestres[0].archive = false; // déjà désarchivé
        const win = chargerTrimestres(store);
        const r = win.desarchiverTrimestre('a2025');
        expect(r.success).toBe(false);
        expect(r.error).toBe('Trimestre non archivé');
        expect('a2025_grillesTemplates' in store).toBe(true); // un refus ne purge rien
    });

    it('idempotent — un 2e désarchivage est refusé proprement', () => {
        const store = storeArchive();
        const win = chargerTrimestres(store);
        win.desarchiverTrimestre('a2025');
        const r2 = win.desarchiverTrimestre('a2025');
        expect(r2.success).toBe(false);
        expect(r2.error).toBe('Trimestre non archivé');
    });
});
