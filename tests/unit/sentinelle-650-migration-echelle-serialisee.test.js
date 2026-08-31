import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #650 (31 août 2026) — LA MIGRATION DES ÉVALUATIONS N'ÉCRASE PLUS CE QUI
// S'ENREGISTRE PENDANT QUE L'ENSEIGNANT RÉFLÉCHIT.
//
// `migrerEvaluationsVersNouvelleEchelle` faisait `db.get` … `db.set`. Entre les
// deux, son unique appelant (`supprimerEchelleDepuisSidebar`) pose DEUX
// dialogues bloquants : le `confirm` « veux-tu migrer ? », puis le `prompt` de
// choix de l'échelle de remplacement. La collection réécrite était donc celle
// lue AVANT la réflexion — tout ce qui s'y enregistrait entre-temps disparaissait.
//
//   migration : get ─────[confirm]────[prompt]───── set(instantané périmé)
//   autre     :        get ── set(+ E9)                  ⇒ E9 perdue, en silence
//
// ⚠⚠ LE BANC DOIT REPRODUIRE LE CHEMIN INDEXEDDB, SINON IL NE PROUVE RIEN.
// Node n'a pas d'IndexedDB : `db.js` s'y rabat sur le mode localStorage-seul,
// où `set` écrit SYNCHRONEMENT. La fenêtre de course n'existe alors pas et ces
// cas passeraient au VERT sur le code NON corrigé. Le harnais ci-dessous est
// celui de la sentinelle #522 lot 4, pour la même raison — clone structuré à
// la lecture ET à l'écriture, commit différé d'un tour de boucle.

/* ------------------------------------------------------------------ harnais */

function fauxLocalStorage() {
    const ls = {};
    return {
        get length() { return Object.keys(ls).length; },
        key: (i) => Object.keys(ls)[i] ?? null,
        getItem: (k) => (k in ls ? JSON.stringify(ls[k]) : null),
        setItem: (k, v) => { ls[k] = JSON.parse(v); },
        removeItem: (k) => { delete ls[k]; }
    };
}

/** Le commit IDB différé + le clone structuré : c'est ce qui rend la course perdante. */
function fausseConnexionIDB() {
    const disque = new Map();
    const cloner = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    return {
        transaction() {
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
                        setTimeout(() => {
                            disque.set(record.key, fige);
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
                delete(key) {
                    const req = {};
                    Promise.resolve().then(() => {
                        disque.delete(key);
                        if (req.onsuccess) req.onsuccess();
                        setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 0);
                    });
                    return req;
                }
            };
            const tx = { objectStore: () => store };
            return tx;
        }
    };
}

/** La vraie db.js, bootée, PUIS basculée sur le chemin IndexedDB de production. */
async function monterDb() {
    const fenetre = { addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true };
    chargerScript('js/db.js', { localStorage: fauxLocalStorage() }, fenetre);
    await new Promise((res) => setTimeout(res, 25));
    // Garde de validité du banc : sans base prête, tout ce qui suit ne prouve rien.
    if (!fenetre.db || fenetre.db.ready !== true) throw new Error('db non prête');
    const db = fenetre.db;
    db.db = fausseConnexionIDB();
    db.useIndexedDB = true;
    db.memoryCache.clear();
    return db;
}

const CLE = 'a2026_evaluationsSauvegardees';

/** Le VRAI js/echelles.js (ou sa copie patchée), dans un sandbox avec la VRAIE db. */
async function monter() {
    const db = await monterDb();
    const win = chargerScript('js/echelles.js', {
        db,
        cle: (nom) => `a2026_${nom}`,
        notifications: { succes: () => {}, info: () => {}, avertissement: () => {}, erreur: () => {} },
        echelleTemplateActuelle: null,
        BibliothequeUI: new Proxy({}, { get: () => (() => '') }),
        travauxOutils: { renderPickerCouleur: () => '' },
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8),
        ordonnerNiveauxParPlage: (n) => n
    });
    // Garde de validité : sans la fonction, tout passerait au vert sans rien exercer.
    if (typeof win.migrerEvaluationsVersNouvelleEchelle !== 'function') {
        throw new Error('migrerEvaluationsVersNouvelleEchelle absente du sandbox');
    }
    return { db, migrer: win.migrerEvaluationsVersNouvelleEchelle };
}

const SEMENCE = () => ([
    { id: 'E1', nom: 'Dissertation', echelleId: 'ECH_A' },
    { id: 'E2', nom: 'Exposé', echelleId: 'ECH_A' }
]);

/* ------------------------------------------------------------------- les cas */

describe('#650 · la migration des évaluations est sérialisée', () => {

    it('A.a LE CAS QUI PORTE LE SENS : une écriture concurrente survit à la migration', async () => {
        const { db, migrer } = await monter();
        await db.set(CLE, SEMENCE());

        // Les deux gestes partent sans s'attendre. C'est le geste réel : la
        // migration est suspendue à deux dialogues, l'enregistrement d'à côté
        // ne l'attend pas.
        const [nbMigrees] = await Promise.all([
            migrer('ECH_A', 'ECH_B'),
            db.modifier(CLE, (l) => { (l || []).push({ id: 'E9', nom: 'Saisie pendant la réflexion', echelleId: 'ECH_C' }); return l; }, [])
        ]);

        const apres = await db.get(CLE);
        expect(apres.find(e => e.id === 'E9'), 'l\'évaluation enregistrée pendant la migration ne doit pas être écrasée').toBeTruthy();
        expect(apres.find(e => e.id === 'E1').echelleId, 'la migration doit avoir eu lieu').toBe('ECH_B');
        expect(nbMigrees, 'le compte rendu à l\'appelant doit rester un NOMBRE').toBe(2);
    });

    it('A.b L\'ORDRE INVERSE de la paire : l\'écriture concurrente part la première', async () => {
        // Un cas de course est une PAIRE d'effets indépendants, et l'ordre
        // décide. Le témoin doit tuer les deux cas, pas celui qui arrange.
        const { db, migrer } = await monter();
        await db.set(CLE, SEMENCE());

        const concurrente = db.modifier(CLE, (l) => { (l || []).push({ id: 'E9', nom: 'Saisie', echelleId: 'ECH_C' }); return l; }, []);
        const migration = migrer('ECH_A', 'ECH_B');
        await Promise.all([concurrente, migration]);

        const apres = await db.get(CLE);
        expect(apres.find(e => e.id === 'E9'), 'E9 ne doit pas être écrasée').toBeTruthy();
        expect(apres.find(e => e.id === 'E1').echelleId).toBe('ECH_B');
    });

    it('C.a LA CONSÉQUENCE TERRAIN : le compte annoncé ne doit pas mentir sur ce qui est en base', async () => {
        // C'est le cas qui dit pourquoi #650 est une PRÉCONDITION et pas un
        // nettoyage. `nbMigrees` est calculé EN MÉMOIRE, avant l'écriture. Si
        // l'écriture est écrasée, l'appelant annonce quand même « 2 évaluation(s)
        // migrée(s) » — PUIS supprime l'échelle. L'enseignant lit une réussite,
        // et repart avec exactement les orphelines que cette porte de sortie
        // existait pour empêcher.
        const { db, migrer } = await monter();
        await db.set(CLE, SEMENCE());

        const [annonce] = await Promise.all([
            migrer('ECH_A', 'ECH_B'),
            db.modifier(CLE, (l) => { (l || []).push({ id: 'E9', nom: 'Saisie', echelleId: 'ECH_C' }); return l; }, [])
        ]);

        const reel = (await db.get(CLE)).filter(e => e.echelleId === 'ECH_B').length;
        expect(reel, `annonce ${annonce} migrée(s), ${reel} réellement en base`).toBe(annonce);
    });

    it('B.a le contrat de retour : un NOMBRE, pas la liste écrite', async () => {
        // `db.modifier` rend CE QUE LE MUTATEUR REND. Compter dans le `return`
        // du mutateur rendrait un tableau — et la notification annoncerait
        // « [object Array] évaluation(s) migrée(s) » à l'enseignant.
        const { db, migrer } = await monter();
        await db.set(CLE, SEMENCE());

        const n = await migrer('ECH_A', 'ECH_B');
        expect(typeof n).toBe('number');
        expect(n).toBe(2);
    });

    it('B.b aucune évaluation concernée : rend 0, et n\'écrase rien', async () => {
        const { db, migrer } = await monter();
        await db.set(CLE, SEMENCE());

        const n = await migrer('ECH_INCONNUE', 'ECH_B');
        expect(n).toBe(0);
        const apres = await db.get(CLE);
        expect(apres.map(e => e.echelleId)).toEqual(['ECH_A', 'ECH_A']);
    });
});
