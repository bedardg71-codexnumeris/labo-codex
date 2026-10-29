import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #522 lot 20 (12 oct. 2026) — LES DIX DERNIERS SITES.
//
// Remesuré par `scripts/mesurer-522.py ""` avant le lot : 10 sites en course. Un seul est
// atteint par un geste de l'usager : `migrerCartouchesVersBibliotheque` (cartouches.js), que
// `initialiserModuleCartouches` lance à CHAQUE entrée dans la section (navigation.js), à côté
// des gestes qui écrivent les cartouches — tous déjà dans la file de la clé. Il y entre aussi.
// Après : 9 sites, chacun NOMMÉ au cliquet C avec la raison qui le rend sûr.
//
// ⚠ Banc : chemin IndexedDB rétabli ET clone structuré (faux-vert de #522, lots 1 et 4).
// La migration est privée à l'IIFE de cartouches.js : le banc l'exécute depuis la SOURCE
// (la vraie fonction, découpée par son corps), avec le vrai `db`. Noms fictifs.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

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
function fausseConnexionIDB() {
    const disque = new Map();
    const cloner = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    const requete = (faire) => {
        const req = {};
        Promise.resolve().then(() => { req.result = faire(); if (req.onsuccess) req.onsuccess(); });
        return req;
    };
    return {
        transaction() {
            const tx = {};
            const store = {
                get: (key) => requete(() => (disque.has(key) ? { key, value: cloner(disque.get(key)) } : undefined)),
                put(record) {
                    const req = {};
                    const fige = cloner(record.value);
                    Promise.resolve().then(() => {
                        if (req.onsuccess) req.onsuccess();
                        setTimeout(() => { disque.set(record.key, fige); if (tx.oncomplete) tx.oncomplete(); }, 0);
                    });
                    return req;
                },
                getAll: () => requete(() => [...disque].map(([key, value]) => ({ key, value: cloner(value) })))
            };
            tx.objectStore = () => store;
            return tx;
        }
    };
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

function corps(fichier, nom) {
    const src = lire(fichier);
    const m = new RegExp('(?:async\\s+)?function\\s+' + nom + '\\s*\\(').exec(src);
    if (!m) throw new Error(nom + ' introuvable dans ' + fichier);
    const ouvrante = /\)\s*\{/.exec(src.slice(m.index));
    let i = m.index + ouvrante.index + ouvrante[0].length - 1, prof = 0;
    for (let j = i; j < src.length; j++) {
        if (src[j] === '{') prof++;
        else if (src[j] === '}' && --prof === 0) return { source: src.slice(m.index, j + 1), interieur: src.slice(i, j + 1) };
    }
    throw new Error('corps non borné : ' + nom);
}

const PREFIXE = 'a2026_';
const CLE = PREFIXE + 'cartouches_G1';

function migrationReelle(db) {
    const { source } = corps('js/cartouches.js', 'migrerCartouchesVersBibliotheque');
    // eslint-disable-next-line no-new-func
    return new Function('db', 'cle', source + '\nreturn migrerCartouchesVersBibliotheque;')(db, (k) => PREFIXE + k);
}

/* --------------------------------------------- A — la course, sur le chemin réel */

describe('#522 lot 20 · A — la migration des cartouches et un geste rapprochés gardent LEURS DEUX effets', () => {
    it('A.a une cartouche ajoutée pendant la migration tient, et la migration a marqué l\'ancienne', async () => {
        const db = await monterDb();
        const migrer = migrationReelle(db);
        await db.set(PREFIXE + 'grillesTemplates', [{ id: 'G1', nom: 'Grille fictive' }]);
        await db.set(CLE, [{ id: 'C1', nom: 'Structure' }]);

        // La migration part la première (l'entrée dans la section) ; le geste suit.
        const migration = migrer();
        await new Promise((res) => setTimeout(res, 0));
        await Promise.all([
            migration,
            db.modifier(CLE, (l) => (l || []).concat([{ id: 'C2', nom: 'Analyse', dansBibliotheque: false }]), [])
        ]);

        const liste = await db.get(CLE);
        const c1 = liste.find((c) => c.id === 'C1');
        const c2 = liste.find((c) => c.id === 'C2');
        expect(c2, 'la cartouche ajoutée pendant la migration tient').toBeTruthy();
        expect(c1 && c1.dansBibliotheque, 'la migration a marqué l\'ancienne').toBe(true);
    });

    it('A.b rien à migrer : aucune écriture (#1040 tient dans la file)', async () => {
        const db = await monterDb();
        const migrer = migrationReelle(db);
        await db.set(PREFIXE + 'grillesTemplates', [{ id: 'G1', nom: 'Grille fictive' }]);
        await db.set(CLE, [{ id: 'C1', nom: 'Structure', dansBibliotheque: true }]);
        const ecritures = [];
        const setOrigine = db.set.bind(db);
        db.set = (k, v) => { ecritures.push(k); return setOrigine(k, v); };

        await migrer();

        expect(ecritures, 'aucune réécriture à l\'identique').toEqual([]);
    });
});

/* ------------------------------------------- C — le cliquet : les huit sites restants (neuf avant #1182) */

describe('#522 lot 20 · C — le geste entre dans la file ; les huit restes sont NOMMÉS', () => {
    it('C.a la migration des cartouches lit et écrit par db.modifier, sans db.get ni db.set sur la clé', () => {
        const { interieur } = corps('js/cartouches.js', 'migrerCartouchesVersBibliotheque');
        expect((interieur.match(/db\.modifier\(cleCartouches,/g) || []).length).toBe(1);
        expect(interieur).not.toMatch(/db\.(?:get|set)\(cleCartouches\b/);
    });

    // Chaque reste, avec la raison qui le rend sûr. Un nom qui disparaît d'ici sans que son
    // site parte doit être relu, pas effacé.
    //   [fichier, fonction, clé écrite, raison]
    const RESTES = [
        ['js/codex.js', '_migrerClesClasseurVersCodex', 'CLE_MIGRATION_FAITE',
            'démarrage seulement (initialiserCodex) ; écrit une constante'],
        ['js/codex.js', '_purgerCodexHistLegacy', 'CLE_PURGE_TIMEMACHINE_FAITE',
            'démarrage seulement ; écrit une constante'],
        // #1182 (29 oct. 2026) : `_migrerSnapshotVersIndexHash` est parti avec l'ancêtre de la fusion.
        ['js/snapshots.js', 'initialiserModuleSnapshots', 'cleSnap',
            'démarrage seulement ; n\'écrit que si la clé est vide en IndexedDB'],
        ['js/main.js', 'auDbReady', "'migration_modeles_namespacees_done'",
            'démarrage seulement ; écrit une constante après un flush'],
        ['js/main.js', 'auDbReady', "'migration_cartouches_namespacees_done'",
            'démarrage seulement ; écrit une constante après un flush'],
        ['js/migrations.js', 'executerMigrationsBeta96', "'migrationBeta96Effectuee'",
            'aucun appelant (mesuré le 12 oct.) ; écrit une constante'],
        ['js/travaux-stockage.js', '_migrerThumbnailsVersIDB', "'_migration_thumbnails_done'",
            'démarrage seulement (initialiserStockageTravaux) ; écrit une constante'],
        ['js/demo-activation.js', 'activerModeDemo', "'demo-actif'",
            'le retour arrière du catch écrit null : la valeur ne dérive pas de la lecture']
    ];
    for (const [fichier, nom, cleExpr, raison] of RESTES) {
        it(`${fichier} · ${nom} · ${cleExpr} — ${raison}`, () => {
            const { interieur } = corps(fichier, nom);
            const echappee = cleExpr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            expect(interieur, 'le site nommé existe toujours').toMatch(new RegExp('db\\.set(?:Sync)?\\(' + echappee + ','));
        });
    }

});
