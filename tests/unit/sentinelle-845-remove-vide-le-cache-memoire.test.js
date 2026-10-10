import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #845 (10 oct. 2026) — UNE CLÉ SUPPRIMÉE CONTINUE D'ÊTRE LUE.
//
// `db.remove()` vidait IndexedDB et localStorage, pas `memoryCache` ; `removeSync`
// fait les trois. Or `get()` et `getSync()` lisent le cache mémoire EN PREMIER, et
// une grosse clé (au-delà de 200 Ko) n'y vit que là. La clé supprimée restait donc
// lue jusqu'au rechargement : fusion de codex qui « supprime » une clé, trimestre
// supprimé, purge d'espace, snapshot de référence d'un codex fermé.
//
// ⚠ Le banc reproduit le chemin IndexedDB (faux-vert de #522 : en mode localStorage
// seul, la grosse clé n'entre jamais en mémoire), et la fausse connexion CLONE à
// l'écriture et à la lecture (patron sentinelle-522-lot4-bibliotheques-serialisees).

function fauxLocalStorage() {
    const ls = {};
    return {
        get length() { return Object.keys(ls).length; },
        key: (i) => Object.keys(ls)[i] ?? null,
        getItem: (k) => (k in ls ? ls[k] : null),
        setItem: (k, v) => { ls[k] = String(v); },
        removeItem: (k) => { delete ls[k]; }
    };
}

/** Commit différé d'un tour de boucle, clone structuré ; `avorterSuppressions` simule un échec. */
function fausseConnexionIDB() {
    const disque = new Map();
    const cloner = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    const connexion = {
        disque,
        avorterSuppressions: false,
        transaction() {
            const tx = {};
            const store = {
                get(key) {
                    const req = {};
                    Promise.resolve().then(() => {
                        req.result = disque.has(key) ? { key, value: cloner(disque.get(key)) } : undefined;
                        if (req.onsuccess) req.onsuccess();
                    });
                    return req;
                },
                put(record) {
                    const req = {};
                    const fige = cloner(record.value);
                    Promise.resolve().then(() => {
                        if (req.onsuccess) req.onsuccess();
                        setTimeout(() => { disque.set(record.key, fige); if (tx.oncomplete) tx.oncomplete(); }, 0);
                    });
                    return req;
                },
                delete(key) {
                    const req = {};
                    Promise.resolve().then(() => {
                        if (req.onsuccess) req.onsuccess();
                        setTimeout(() => {
                            if (connexion.avorterSuppressions) {
                                tx.error = { name: 'AbortError', message: 'banc' };
                                if (tx.onabort) tx.onabort();
                                return;
                            }
                            disque.delete(key);
                            if (tx.oncomplete) tx.oncomplete();
                        }, 0);
                    });
                    return req;
                },
                getAll() {
                    const req = {};
                    Promise.resolve().then(() => {
                        req.result = [...disque].map(([key, value]) => ({ key, value: cloner(value) }));
                        if (req.onsuccess) req.onsuccess();
                    });
                    return req;
                },
                getAllKeys() {
                    const req = {};
                    Promise.resolve().then(() => { req.result = [...disque.keys()]; if (req.onsuccess) req.onsuccess(); });
                    return req;
                }
            };
            tx.objectStore = () => store;
            return tx;
        }
    };
    return connexion;
}

async function monterDb() {
    const fenetre = { addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true };
    chargerScript('js/db.js', { localStorage: fauxLocalStorage() }, fenetre);
    await new Promise((res) => setTimeout(res, 25));
    if (!fenetre.db || fenetre.db.ready !== true) throw new Error('db non prête');
    const db = fenetre.db;
    db.db = fausseConnexionIDB();
    db.useIndexedDB = true;
    db.memoryCache.clear();
    return db;
}

// Au-delà du seuil IDB-first (200 Ko) : la valeur vit en IndexedDB + memoryCache.
const grosseValeur = () => ({ eleve: 'Zéphyrine Fictive', notes: 'x'.repeat(260 * 1024) });

describe('#845 · db.remove() vide aussi le cache mémoire', () => {
    it('une grosse clé supprimée par remove() n\'est plus lue (get, getSync, keysSync)', async () => {
        const db = await monterDb();
        await db.set('a2026_cleVolumineuse', grosseValeur());
        // Garde de validité : la clé doit vivre en mémoire, sinon le banc ne prouve rien.
        expect(db.memoryCache.has('a2026_cleVolumineuse')).toBe(true);
        expect(db.db.disque.has('a2026_cleVolumineuse')).toBe(true);

        await db.remove('a2026_cleVolumineuse');

        expect(db.db.disque.has('a2026_cleVolumineuse')).toBe(false);
        // AVANT #845 : les trois rendaient encore la valeur supprimée → ROUGE.
        expect(await db.get('a2026_cleVolumineuse', null)).toBe(null);
        expect(db.getSync('a2026_cleVolumineuse', null)).toBe(null);
        expect(db.keysSync()).not.toContain('a2026_cleVolumineuse');
    });

    it('si la suppression IndexedDB échoue, la clé reste lue : mémoire et disque d\'accord', async () => {
        const db = await monterDb();
        await db.set('a2026_cleVolumineuse', grosseValeur());
        db.db.avorterSuppressions = true;

        await expect(db.remove('a2026_cleVolumineuse')).rejects.toBeTruthy();

        expect(db.db.disque.has('a2026_cleVolumineuse')).toBe(true);
        // Le cache est vidé APRÈS le commit : un échec ne fait pas disparaître
        // jusqu'au rechargement une clé que le disque garde.
        expect(db.getSync('a2026_cleVolumineuse', null)).not.toBe(null);
    });
});
