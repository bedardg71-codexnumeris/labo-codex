import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// ═══════════════════════════════════════════════════════════════════════════
// #962 — UN ÉCHEC D'ÉCRITURE INDEXEDDB NE SE TAIT JAMAIS (5 oct. 2026)
// Chantier de l'enregistrement, lot 1. Décision de Cowork (consigne du 5 oct., 12 h 01) :
// quand l'écriture IndexedDB d'une clé échoue après `db.setSync`, le témoin dit « Non
// enregistré », le dit pourquoi, et le garde ; une écriture suivante de la même clé ne
// l'efface pas avant SON commit ; pour une grosse clé (au-delà de SEUIL_IDB_FIRST),
// « Enregistré » ne s'affiche qu'une fois le commit confirmé.
//
// Mesuré avant (sonde WebKit, connexion IndexedDB fermée comme après une mise en
// arrière-plan sur l'iPad) : le témoin disait « Enregistré », l'échec n'était qu'un
// `console.warn`, et la valeur disparaissait au rechargement.
//
// Deux moitiés : `db.js` RÉEL sur une connexion IndexedDB simulée dont le banc décide le
// commit ou l'avortement ; `modes.js` RÉEL avec un `db` doublure et un témoin qui
// enregistre ce qu'on lui fait. Le témoin au navigateur :
// tests/integration/temoin-enregistrement-962-986.spec.js.
// ═══════════════════════════════════════════════════════════════════════════

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tick = () => new Promise((r) => setTimeout(r, 0));

function chargerDbReel() {
    const code = readFileSync(path.join(racine, 'js/db.js'), 'utf8');
    const ls = {
        _d: {},
        getItem(k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
        setItem(k, v) { this._d[k] = String(v); },
        removeItem(k) { delete this._d[k]; },
        clear() { this._d = {}; }
    };
    const win = { addEventListener() {}, dispatchEvent() {} };
    const doc = { addEventListener() {} };
    const silencieux = { log() {}, warn() {}, error() {} };
    new Function('window', 'document', 'console', 'localStorage', 'sessionStorage', 'indexedDB',
        '"use strict";\n' + code)(win, doc, silencieux, ls, ls, undefined);
    const db = win.db;
    // Connexion simulée : chaque transaction attend le verdict du banc.
    const transactions = [];
    db.db = {
        transaction() {
            const tx = { objectStore: () => ({ put: () => ({}) }), error: null };
            transactions.push(tx);
            return tx;
        }
    };
    db.ready = true;
    db.useIndexedDB = true;
    const commit = (i) => transactions[i].oncomplete();
    const avorter = (i, nom) => {
        const e = new Error('panne simulée'); e.name = nom || 'AbortError';
        transactions[i].error = e;
        transactions[i].onabort();
    };
    return { db, transactions, commit, avorter };
}

const GROSSE = 'x'.repeat(30 * 1024);   // au-delà de SEUIL_IDB_FIRST (25 Ki caractères)

describe('#962 · db.js signale l\'échec d\'une écriture IndexedDB d\'arrière-plan', () => {
    it('un setSync dont la transaction avorte appelle l\'abonné avec la clé et l\'erreur', async () => {
        const b = chargerDbReel();
        const recus = [];
        b.db.surEchecEcriture((cle, erreur) => recus.push([cle, erreur && erreur.name]));
        b.db.setSync('a2026_evaluationsSauvegardees', [GROSSE]);
        expect(recus).toEqual([]);
        b.avorter(0, 'QuotaExceededError');
        await tick(); await tick();
        expect(recus).toEqual([['a2026_evaluationsSauvegardees', 'QuotaExceededError']]);
    });

    it('connexion fermée (transaction() lève) : l\'abonné l\'apprend aussi', async () => {
        const b = chargerDbReel();
        const recus = [];
        b.db.surEchecEcriture((cle) => recus.push(cle));
        b.db.db = { transaction() { const e = new Error('The database connection is closing.'); e.name = 'InvalidStateError'; throw e; } };
        b.db.setSync('a2026_presences', [1]);
        await tick(); await tick();
        expect(recus).toContain('a2026_presences');
    });

    it('un commit réussi ne signale rien', async () => {
        const b = chargerDbReel();
        const recus = [];
        b.db.surEchecEcriture((cle) => recus.push(cle));
        b.db.setSync('a2026_presences', [1]);
        b.commit(0);
        await tick(); await tick();
        expect(recus).toEqual([]);
    });

    it('commitEnAttente : présent jusqu\'au commit, « grosse » au-delà du seuil seulement', async () => {
        const b = chargerDbReel();
        b.db.setSync('grosse', [GROSSE]);
        b.db.setSync('petite', [1]);
        expect(b.db.commitEnAttente('grosse').grosse).toBe(true);
        expect(b.db.commitEnAttente('petite').grosse).toBe(false);
        b.commit(0); b.commit(1);
        await tick(); await tick();
        expect(b.db.commitEnAttente('grosse')).toBe(null);
        expect(b.db.commitEnAttente('petite')).toBe(null);
    });

    it('commitEnAttente rend la DERNIÈRE écriture de la clé, et le commit de la précédente ne l\'efface pas', async () => {
        const b = chargerDbReel();
        b.db.setSync('grosse', [GROSSE]);
        b.db.setSync('grosse', [GROSSE, 2]);
        const derniere = b.db.commitEnAttente('grosse');
        b.commit(0);
        await tick(); await tick();
        expect(b.db.commitEnAttente('grosse')).toBe(derniere);
    });
});

// ─── modes.js : le témoin parle au bon moment ───────────────────────────────

function deferred() {
    let resolve, reject;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
    promise.catch(() => {});
    return { promise, resolve, reject };
}

function monter() {
    const appels = [];
    const attentes = new Map();
    let abonneEchec = null;
    let cleEchec = null;
    const db = {
        getSync: () => null,
        setSync: () => true,
        get: async () => null, set: async () => {}, removeSync: () => {},
        enregistrerGardeEcriture: () => {}, surEcriture: () => {},
        surEchecEcriture: (fn) => { abonneEchec = fn; },
        commitEnAttente: (k) => attentes.get(k) || null
    };
    const cle = (k) => 'a2026_' + k;
    const win = {
        addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'a2026', cle,
        signalerEcritureUsager: (k) => appels.push(['signal', k]),
        temoinEnregistrement: {
            enregistre: (k) => { appels.push(['enregistre', k]); if (k === cleEchec) cleEchec = null; },
            nonEnregistre: (raison, geste, k) => { appels.push(['nonEnregistre', raison, geste, k]); cleEchec = k; },
            fermer: () => {},
            echecSur: (k) => cleEchec !== null && k === cleEchec
        }
    };
    const notifications = { succes() {}, erreur() {}, warning() {}, info() {} };
    chargerScript('js/modes.js', { db, cle, notifications, obtenirPreference: () => null, definirPreference: () => {} }, win);
    const attendre = (k, grosse) => { const d = deferred(); attentes.set(k, { commit: d.promise, grosse }); return d; };
    return { win, appels, attendre, attentes, abonneEchec: () => abonneEchec };
}

const quotaErr = () => { const e = new Error('quota'); e.name = 'QuotaExceededError'; return e; };

describe('#962 · modes.js : « Enregistré » après le commit d\'une grosse clé, l\'échec dit et gardé', () => {
    it('grosse clé : rien avant le commit, « Enregistré » après', async () => {
        const b = monter();
        const d = b.attendre('a2026_evaluationsSauvegardees', true);
        expect(b.win.sauvegarderDonneesSelonMode('evaluationsSauvegardees', [1])).toBe(true);
        expect(b.appels.filter((a) => a[0] === 'enregistre')).toEqual([]);
        d.resolve();
        await tick();
        expect(b.appels.filter((a) => a[0] === 'enregistre')).toEqual([['enregistre', 'a2026_evaluationsSauvegardees']]);
    });

    it('grosse clé dont le commit échoue : « Non enregistré » avec la raison et le geste, jamais « Enregistré »', async () => {
        const b = monter();
        const d = b.attendre('a2026_evaluationsSauvegardees', true);
        b.win.sauvegarderDonneesSelonMode('evaluationsSauvegardees', [1], { geste: 'Verrouillage de l\'évaluation' });
        d.reject(quotaErr());
        await tick();
        expect(b.appels.filter((a) => a[0] === 'enregistre')).toEqual([]);
        const echec = b.appels.find((a) => a[0] === 'nonEnregistre');
        expect(echec[1]).toMatch(/mémoire du navigateur est pleine/);
        expect(echec[2]).toBe('Verrouillage de l\'évaluation');
        expect(echec[3]).toBe('a2026_evaluationsSauvegardees');
    });

    it('après un échec, une écriture de la même clé ne dit « Enregistré » (et n\'efface l\'échec) qu\'à SON commit — même petite', async () => {
        const b = monter();
        b.abonneEchec()('a2026_presences', new Error('connexion fermée'));
        expect(b.appels.at(-1)[0]).toBe('nonEnregistre');
        const d = b.attendre('a2026_presences', false);
        b.win.sauvegarderDonneesSelonMode('presences', [2]);
        await tick();
        expect(b.appels.filter((a) => a[0] === 'enregistre')).toEqual([]);
        d.resolve();
        await tick();
        expect(b.appels.at(-1)).toEqual(['enregistre', 'a2026_presences']);
    });

    it('petite clé sans échec affiché : « Enregistré » tout de suite, comme avant', () => {
        const b = monter();
        b.attendre('a2026_presences', false);
        b.win.sauvegarderDonneesSelonMode('presences', [1]);
        expect(b.appels).toEqual([['enregistre', 'a2026_presences']]);
    });

    it('l\'abonné de db.surEchecEcriture fait dire l\'échec au témoin, même pour une écriture directe', () => {
        const b = monter();
        expect(typeof b.abonneEchec()).toBe('function');
        b.abonneEchec()('a2026_fichiersTravaux', quotaErr());
        expect(b.appels).toEqual([['nonEnregistre', expect.stringMatching(/mémoire du navigateur est pleine/), undefined, 'a2026_fichiersTravaux']]);
    });

    it('#1029 · connexion perdue malgré la réouverture : le message tranché par Grégoire (13 h 44), au tutoiement', () => {
        const b = monter();
        const e = new Error('Connexion IndexedDB perdue'); e.name = 'ConnexionPerdue';
        b.abonneEchec()('a2026_presences', e);
        expect(b.appels.at(-1)[1]).toBe('le navigateur a refusé l\'écriture. Note ce que tu viens de saisir, puis recharge la page : ta saisie sera à refaire.');
    });

    it('ecrireEtAnnoncer suit la même règle (grosse clé : après le commit)', async () => {
        const b = monter();
        const d = b.attendre('cours', true);
        await b.win.ecrireEtAnnoncer('cours', async () => ({ id: 1 }));
        expect(b.appels.filter((a) => a[0] === 'enregistre')).toEqual([]);
        d.resolve();
        await tick();
        expect(b.appels.filter((a) => a[0] === 'enregistre')).toEqual([['enregistre', 'cours']]);
    });
});
