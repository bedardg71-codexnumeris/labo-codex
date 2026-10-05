import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ═══════════════════════════════════════════════════════════════════════════
// #1029 — ROUVRIR LA CONNEXION INDEXEDDB PERDUE, UNE FOIS (5 oct. 2026)
// Verdict de Cowork sur le lot 1 de l'enregistrement (12 h 50) : quand une écriture, une
// suppression (ou la lecture qui précède une modification) échoue parce que la connexion est
// fermée, `db.js` la rouvre UNE fois — une seule réouverture concurrente, les opérations en
// vol l'attendent — et refait l'opération, avec la DERNIÈRE valeur de la clé. Seul l'échec de
// la nouvelle tentative remonte (« Non enregistré », #962). `onclose` et `onversionchange`
// font savoir la connexion perdue avant la prochaine écriture.
//
// Mesuré avant (5 oct., sonde WebKit) : `db.js` n'avait ni `onclose` ni réouverture ; après
// `db.db.close()`, chaque `transaction()` levait `InvalidStateError` jusqu'au rechargement.
//
// `db.js` RÉEL ; `indexedDB.open` simulé : chaque ouverture rend une connexion neuve qui
// consigne ses `put`/`delete` et commit au tour suivant. Au navigateur, sur une vraie
// connexion fermée : tests/integration/temoin-enregistrement-962-986.spec.js.
// ═══════════════════════════════════════════════════════════════════════════

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tick = () => new Promise((r) => setTimeout(r, 0));
const tours = async (n = 6) => { for (let i = 0; i < n; i++) await tick(); };

function fermee() {
    return {
        nom: 'fermée',
        transaction() { const e = new Error('The database connection is closing.'); e.name = 'InvalidStateError'; throw e; },
        close() {}
    };
}

function monter({ ouvertureImpossible = false, ouvertureRetenue = false } = {}) {
    const journal = [];   // [connexion, op, clé, valeur]
    const ouvertures = [];
    const enAttente = [];
    const demandes = [];
    let n = 0;
    function connexionNeuve() {
        const nom = 'c' + (++n);
        const cx = {
            nom,
            close() { cx.fermee = true; },
            transaction() {
                if (cx.fermee) { const e = new Error('closed'); e.name = 'InvalidStateError'; throw e; }
                const tx = {
                    objectStore: () => ({
                        put: (rec) => { journal.push([nom, 'put', rec.key, rec.value]); setTimeout(() => tx.oncomplete && tx.oncomplete(), 0); return {}; },
                        delete: (k) => { journal.push([nom, 'delete', k]); setTimeout(() => tx.oncomplete && tx.oncomplete(), 0); return {}; },
                        get: (k) => { const q = {}; journal.push([nom, 'get', k]); setTimeout(() => { q.result = { key: k, value: 'lu' }; q.onsuccess && q.onsuccess(); }, 0); return q; }
                    })
                };
                return tx;
            }
        };
        return cx;
    }
    const fauxIndexedDB = {
        open(nom) {
            const req = {};
            // Seule la base de `db` répond ; l'ancienne `MonitorageFichiers` (migration
            // au chargement) reste sans réponse : hors du sujet de ce banc.
            if (nom !== 'MonitoragePedagogique') return req;
            demandes.push(nom);
            const repondre = () => {
                ouvertures.push(Date.now());
                if (ouvertureImpossible) { req.onerror && req.onerror(); return; }
                req.onsuccess({ target: { result: connexionNeuve() } });
            };
            if (ouvertureRetenue) enAttente.push(repondre); else setTimeout(repondre, 0);
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
    db.db = fermee();
    const echecs = [];
    db.surEchecEcriture((cle, e) => echecs.push([cle, e && (e.name || e.message)]));
    return { db, journal, ouvertures, demandes, echecs, liberer: () => enAttente.splice(0).forEach((f) => f()), connexionNeuve };
}

describe('#1029 · la connexion fermée se rouvre une fois, et l\'opération aboutit', () => {
    it('setSync sur une connexion fermée : une réouverture, l\'écriture aboutit sur la neuve, aucun échec dit', async () => {
        const b = monter();
        b.db.setSync('a2026_presences', [1]);
        await tours();
        expect(b.ouvertures).toHaveLength(1);
        expect(b.journal).toEqual([['c1', 'put', 'a2026_presences', [1]]]);
        expect(b.echecs).toEqual([]);
        expect(b.db.commitEnAttente('a2026_presences')).toBe(null);
    });

    it('deux écritures concurrentes de la même clé : UNE réouverture, et chaque nouvelle tentative écrit la DERNIÈRE valeur', async () => {
        const b = monter({ ouvertureRetenue: true });
        b.db.setSync('grosse', ['v1']);
        b.db.setSync('grosse', ['v2']);
        await tours(3);
        b.liberer();
        await tours();
        expect(b.demandes, 'une seule réouverture demandée pour deux échecs concurrents').toHaveLength(1);
        expect(b.ouvertures).toHaveLength(1);
        const puts = b.journal.filter((l) => l[1] === 'put');
        expect(puts.length).toBeGreaterThan(0);
        expect(puts.every((l) => l[0] === 'c1' && l[3][0] === 'v2'), JSON.stringify(puts)).toBe(true);
        expect(b.echecs).toEqual([]);
    });

    it('réouverture impossible : l\'échec remonte à l\'abonné (« Non enregistré »)', async () => {
        const b = monter({ ouvertureImpossible: true });
        b.db.setSync('a2026_presences', [1]);
        await tours();
        expect(b.ouvertures).toHaveLength(1);
        expect(b.echecs).toEqual([['a2026_presences', 'ConnexionPerdue']]);
    });

    it('nouvelle tentative refusée parce que la connexion reste fermée : « ConnexionPerdue »', async () => {
        const b = monter();
        const ouvrir = b.db._initIndexedDB.bind(b.db);
        b.db._initIndexedDB = () => ouvrir().then(() => { b.db.db = fermee(); });   // rouverte… et aussitôt perdue
        b.db.setSync('a2026_presences', [1]);
        await tours();
        expect(b.echecs).toEqual([['a2026_presences', 'ConnexionPerdue']]);
    });

    it('nouvelle tentative refusée pour une AUTRE raison (mémoire pleine) : cette raison est gardée', async () => {
        const b = monter();
        const ouvrir = b.db._initIndexedDB.bind(b.db);
        b.db._initIndexedDB = () => ouvrir().then(() => {
            b.db.db = { transaction() { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; }, close() {} };
        });
        b.db.setSync('a2026_presences', [1]);
        await tours();
        expect(b.echecs).toEqual([['a2026_presences', 'QuotaExceededError']]);
    });

    it('`close` reçu : la prochaine écriture rouvre AVANT d\'essayer (rien n\'est tenté sur l\'ancienne)', async () => {
        const b = monter();
        b.db.setSync('k', [0]);         // rouvre : c1, munie de onclose
        await tours();
        const c1 = b.db.db;
        expect(c1.nom).toBe('c1');
        let tentéeSurC1 = false;
        const transaction = c1.transaction;
        c1.transaction = function () { tentéeSurC1 = true; return transaction.apply(this, arguments); };
        c1.onclose();                    // perte anormale (iPad)
        b.db.setSync('k', [1]);
        await tours();
        expect(tentéeSurC1).toBe(false);
        expect(b.db.db.nom).toBe('c2');
        expect(b.journal.at(-1)).toEqual(['c2', 'put', 'k', [1]]);
    });

    it('`versionchange` : la connexion se ferme et la suivante rouvre', async () => {
        const b = monter();
        b.db.setSync('k', [0]);
        await tours();
        const c1 = b.db.db;
        c1.onversionchange();
        expect(c1.fermee).toBe(true);
        b.db.setSync('k', [1]);
        await tours();
        expect(b.db.db.nom).toBe('c2');
        expect(b.echecs).toEqual([]);
    });

    it('removeSync sur une connexion fermée : rouverte, la suppression aboutit', async () => {
        const b = monter();
        b.db.removeSync('a2026_presences');
        await tours();
        expect(b.journal).toEqual([['c1', 'delete', 'a2026_presences']]);
    });

    it('get (la lecture de db.modifier) sur une connexion fermée : rouverte, la lecture aboutit', async () => {
        const b = monter();
        const v = await b.db.get('k', null);
        expect(v).toBe('lu');
        expect(b.ouvertures).toHaveLength(1);
    });

    it('db.set (awaité) sur une connexion fermée : rouverte, résolue, la valeur écrite', async () => {
        const b = monter();
        await b.db.set('k', { a: 1 });
        expect(b.journal).toEqual([['c1', 'put', 'k', { a: 1 }]]);
    });
});
