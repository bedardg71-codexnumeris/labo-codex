import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ═══════════════════════════════════════════════════════════════════════════
// #1030 — UN ÉCHEC DE SUPPRESSION IDB D'ARRIÈRE-PLAN NE SE TAIT PLUS (7 oct. 2026)
// `removeSync` lance la suppression IDB sans l'attendre. Une transaction avortée n'était
// qu'un `console.warn` : l'usager croyait avoir supprimé, et le démarrage suivant relisait la
// clé d'IndexedDB. Désormais l'échec est dit à l'abonné de `surEchecEcriture` (le témoin :
// « Non enregistré », mêmes mots que l'écriture, #962), et la valeur qu'IndexedDB garde
// revient dans les couches synchrones — sauf si la clé a été réécrite entre-temps.
// (La connexion fermée est l'affaire de #1029 : sentinelle-1029-rouvrir-connexion-perdue.)
//
// #1031 — LES COPIES ROUVRENT AUSSI LA CONNEXION PERDUE (7 oct. 2026)
// Les sept opérations du magasin `fichiers` (info, storeBlob, getBlob, deleteBlob,
// listBlobIds, listBlobsByStudent, clearBlobs) passent par `_avecReprise`. Avant : une copie
// importée comme PREMIÈRE opération après la perte échouait (`InvalidStateError`).
//
// `db.js` RÉEL ; `indexedDB.open` simulé, même forme que le banc de #1029.
// ═══════════════════════════════════════════════════════════════════════════

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tick = () => new Promise((r) => setTimeout(r, 0));
const tours = async (n = 8) => { for (let i = 0; i < n; i++) await tick(); };

function fermee() {
    return {
        nom: 'fermée',
        transaction() { const e = new Error('The database connection is closing.'); e.name = 'InvalidStateError'; throw e; },
        close() {}
    };
}

/**
 * `stock` : le magasin clé-valeur simulé, partagé par toutes les connexions.
 * `avorterSuppressions` : chaque `delete` du magasin clé-valeur avorte sa transaction.
 */
function monter({ connexionInitiale = 'ouverte', avorterSuppressions = false } = {}) {
    const journal = [];
    const stock = new Map();
    const fichiers = new Map();
    let n = 0;
    function requete(tx, calcul) {
        const q = {};
        setTimeout(() => { q.result = calcul(); q.onsuccess && q.onsuccess(); tx.oncomplete && tx.oncomplete(); }, 0);
        return q;
    }
    function connexionNeuve() {
        const nom = 'c' + (++n);
        const cx = {
            nom,
            close() { cx.fermee = true; },
            transaction(magasins) {
                if (cx.fermee) { const e = new Error('closed'); e.name = 'InvalidStateError'; throw e; }
                const tx = {};
                if (magasins[0] === 'fichiers') {
                    tx.objectStore = () => ({
                        put: (rec) => { journal.push([nom, 'fichiers.put', rec.id]); return requete(tx, () => { fichiers.set(rec.id, rec); }); },
                        get: (id) => { journal.push([nom, 'fichiers.get', id]); return requete(tx, () => fichiers.get(id)); },
                        delete: (id) => { journal.push([nom, 'fichiers.delete', id]); return requete(tx, () => { fichiers.delete(id); }); },
                        count: () => { journal.push([nom, 'fichiers.count']); return requete(tx, () => fichiers.size); },
                        getAllKeys: () => { journal.push([nom, 'fichiers.getAllKeys']); return requete(tx, () => [...fichiers.keys()]); },
                        clear: () => { journal.push([nom, 'fichiers.clear']); return requete(tx, () => { fichiers.clear(); }); },
                        index: () => ({
                            getAll: (da) => { journal.push([nom, 'fichiers.index.getAll', da]); return requete(tx, () => [...fichiers.values()].filter((r) => r.etudiantDA === da)); }
                        })
                    });
                } else {
                    tx.objectStore = () => ({
                        put: (rec) => { journal.push([nom, 'put', rec.key]); return requete(tx, () => { stock.set(rec.key, rec.value); }); },
                        get: (k) => { journal.push([nom, 'get', k]); return requete(tx, () => (stock.has(k) ? { key: k, value: stock.get(k) } : undefined)); },
                        delete: (k) => {
                            journal.push([nom, 'delete', k]);
                            if (avorterSuppressions) {
                                const q = {};
                                setTimeout(() => {
                                    tx.error = { name: 'AbortError', message: 'The transaction was aborted.' };
                                    tx.onabort && tx.onabort();
                                }, 0);
                                return q;
                            }
                            return requete(tx, () => { stock.delete(k); });
                        }
                    });
                }
                return tx;
            }
        };
        return cx;
    }
    const fauxIndexedDB = {
        open(nomBase) {
            const req = {};
            if (nomBase !== 'MonitoragePedagogique') return req;
            setTimeout(() => req.onsuccess({ target: { result: connexionNeuve() } }), 0);
            return req;
        }
    };
    const code = readFileSync(path.join(racine, 'js/db.js'), 'utf8');
    const ls = { _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
    const win = { addEventListener() {}, dispatchEvent() {} };
    const silencieux = { log() {}, warn() {}, error() {} };
    new Function('window', 'document', 'console', 'localStorage', 'sessionStorage', 'indexedDB',
        '"use strict";\n' + code)(win, { addEventListener() {} }, silencieux, ls, ls, fauxIndexedDB);
    const db = win.db;
    db.ready = true;
    db.useIndexedDB = true;
    db.db = connexionInitiale === 'fermée' ? fermee() : connexionNeuve();
    const echecs = [];
    const lecturesInvalidees = [];
    db.surEchecEcriture((cle, e) => echecs.push([cle, e && (e.name || e.message)]));
    db.surEcriture((cle) => lecturesInvalidees.push(cle));
    return { db, journal, stock, fichiers, echecs, lecturesInvalidees, ls };
}

/** Une clé écrite par le vrai `setSync`, commit fait. */
async function semer(b, cle, valeur) {
    b.db.setSync(cle, valeur);
    await tours();
    expect(b.stock.get(cle)).toEqual(valeur);
}

describe('#1030 · une suppression d\'arrière-plan qui avorte le dit, et la donnée reste', () => {
    it('transaction avortée : l\'échec est dit à l\'abonné (« Non enregistré »), la petite valeur revient en lecture', async () => {
        const b = monter({ avorterSuppressions: true });
        await semer(b, 'a2026_notesFictives', ['Zéphyrin Tartempion']);
        b.db.removeSync('a2026_notesFictives');
        expect(b.db.getSync('a2026_notesFictives', null), 'retirée tout de suite des couches synchrones').toBe(null);
        await tours();
        expect(b.echecs).toEqual([['a2026_notesFictives', 'AbortError']]);
        expect(b.db.getSync('a2026_notesFictives', null), 'pas tenue pour supprimée').toEqual(['Zéphyrin Tartempion']);
        expect(b.ls.getItem('a2026_notesFictives'), 'petite clé : localStorage, comme setSync').toBe(JSON.stringify(['Zéphyrin Tartempion']));
        expect(b.lecturesInvalidees.at(-1), 'le cache de lecture (#397) ne garde pas l\'absence').toBe('a2026_notesFictives');
    });

    it('grosse valeur (au-delà du seuil) : elle revient en mémoire, pas en localStorage', async () => {
        const b = monter({ avorterSuppressions: true });
        const grosse = ['x'.repeat(30 * 1024)];
        await semer(b, 'a2026_grosseFictive', grosse);
        b.db.removeSync('a2026_grosseFictive');
        await tours();
        expect(b.echecs).toEqual([['a2026_grosseFictive', 'AbortError']]);
        expect(b.db.getSync('a2026_grosseFictive', null)).toEqual(grosse);
        expect(b.db.memoryCache.has('a2026_grosseFictive')).toBe(true);
        expect(b.ls.getItem('a2026_grosseFictive')).toBe(null);
    });

    it('clé réécrite avant l\'échec : rien n\'est remis ni dit, la nouvelle valeur reste', async () => {
        const b = monter({ avorterSuppressions: true });
        await semer(b, 'a2026_notesFictives', ['ancienne']);
        b.db.removeSync('a2026_notesFictives');
        b.db.setSync('a2026_notesFictives', ['neuve']);
        await tours();
        expect(b.echecs).toEqual([]);
        expect(b.db.getSync('a2026_notesFictives', null)).toEqual(['neuve']);
    });

    it('suppression réussie : aucun échec dit, la clé reste absente', async () => {
        const b = monter();
        await semer(b, 'a2026_notesFictives', ['Zéphyrin Tartempion']);
        b.db.removeSync('a2026_notesFictives');
        await tours();
        expect(b.echecs).toEqual([]);
        expect(b.stock.has('a2026_notesFictives')).toBe(false);
        expect(b.db.getSync('a2026_notesFictives', null)).toBe(null);
        expect(b.db._suppressionsEnVol.size).toBe(0);
    });

    it('suppression émise avant la fin de l\'init (#392), rejouée, qui avorte : même aveu', async () => {
        const b = monter({ avorterSuppressions: true });
        await semer(b, 'a2026_notesFictives', ['Zéphyrin Tartempion']);
        b.db.ready = false;
        b.db.removeSync('a2026_notesFictives');
        b.db.ready = true;
        b.db._rejouerOperationsAvantInit();
        await tours();
        expect(b.echecs).toEqual([['a2026_notesFictives', 'AbortError']]);
        expect(b.db.getSync('a2026_notesFictives', null)).toEqual(['Zéphyrin Tartempion']);
    });
});
