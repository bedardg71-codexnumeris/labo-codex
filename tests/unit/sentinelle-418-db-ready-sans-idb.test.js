import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #418 — `db-ready` DOIT AUSSI PARTIR QUAND INDEXEDDB EST INDISPONIBLE.
//
// Le trou, trouvé à l'audit #414 (8 août 2026) : `window.dbReady = true` et
// l'émission de `db-ready` ne vivaient QUE dans `syncToLocalStorageCache()`,
// que le boot n'appelle que `if (db.useIndexedDB)`. Si `_detectIndexedDB()`
// échoue ou si l'ouverture d'IDB erre (`useIndexedDB = false`), le drapeau
// n'était jamais posé et l'événement jamais émis : AUCUN rappel `auDbPret`
// ne partait — donc aucune migration du boot, aucune initialisation qui en
// dépend. Silencieux, sans limite de durée. Touchés : tout testeur en
// navigation privée Safari, ou dont l'IDB est bloqué. Et le portillon #414
// ayant unifié l'attente, ce trou était devenu UNIFORME.
//
// Le correctif (branche `else` du boot) : en mode localStorage-seul les
// données SONT lisibles dès la fin d'`init()` (localStorage est synchrone),
// donc y poser `window.dbReady` et émettre `db-ready` est sémantiquement
// juste. L'ordre — drapeau PUIS événement — est celui de
// `syncToLocalStorageCache`, et le rattrapage du portillon en dépend.
//
// Ce banc est COMPORTEMENTAL : il exécute le vrai boot de db.js dans un
// sandbox SANS indexedDB (Node n'en a pas) — exactement le mode en défaut.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceDb = readFileSync(path.join(racineProjet, 'js', 'db.js'), 'utf8');

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

// Monte db.js dans une fenêtre qui OBSERVE : chaque dispatchEvent est noté
// avec la valeur de `dbReady` AU MOMENT de l'émission (l'ordre drapeau →
// événement est un invariant #414, pas un détail).
function monterBoot() {
    const evenements = [];
    const ecouteurs = new Map();
    const fenetre = {
        addEventListener(type, fn) {
            if (!ecouteurs.has(type)) ecouteurs.set(type, []);
            ecouteurs.get(type).push(fn);
        },
        removeEventListener(type, fn) {
            const liste = ecouteurs.get(type) || [];
            const i = liste.indexOf(fn);
            if (i > -1) liste.splice(i, 1);
        },
        dispatchEvent(evt) {
            evenements.push({
                type: evt.type,
                detail: evt.detail,
                dbReadyAuMomentDeLEmission: fenetre.dbReady === true
            });
            [...(ecouteurs.get(evt.type) || [])].forEach((fn) => fn(evt));
            return true;
        }
    };
    chargerScript('js/db.js', { localStorage: fauxLocalStorage() }, fenetre);
    return { fenetre, evenements };
}

// Le boot est asynchrone (db.init() auto-lancé au chargement) : on laisse
// la file de micro/macro-tâches se vider avant d'observer.
const attendreBoot = () => new Promise((res) => setTimeout(res, 25));

describe('#418 · sans IndexedDB, le boot émet quand même db-ready', () => {

    it('⚠ LE TROU : dbReady est posé et db-ready émis en mode localStorage-seul', async () => {
        const { fenetre, evenements } = monterBoot();
        await attendreBoot();

        // Garde de validité du banc : on est bien dans le mode en défaut.
        expect(fenetre.db.useIndexedDB).toBe(false);
        expect(fenetre.db.ready).toBe(true);

        // Avant le correctif : dbReady restait undefined, evenements restait [].
        expect(fenetre.dbReady).toBe(true);
        const dbReady = evenements.filter((e) => e.type === 'db-ready');
        expect(dbReady).toHaveLength(1);
        expect(dbReady[0].detail).toEqual({ modeLocalStorageSeul: true });
    });

    it('⚠ l’ORDRE #414 : le drapeau est posé AVANT l’émission', async () => {
        // De son inversion naîtrait une fenêtre où le rattrapage du portillon
        // lirait un drapeau encore faux — la course #413, réinventée.
        const { evenements } = monterBoot();
        await attendreBoot();
        const dbReady = evenements.find((e) => e.type === 'db-ready');
        expect(dbReady).toBeDefined();
        expect(dbReady.dbReadyAuMomentDeLEmission).toBe(true);
    });

    it('le CONTRAT utilisateur : un rappel auDbPret part enfin', async () => {
        // C'est le symptôme réel de #418 : les migrations du boot passent par
        // auDbPret, et aucune ne partait. On vérifie les deux chemins du
        // portillon : l'écouteur posé AVANT l'émission, et le rattrapage posé
        // APRÈS.
        const { fenetre } = monterBoot();

        const appels = [];
        fenetre.auDbPret(() => appels.push('avant-emission'));
        expect(appels, 'parti avant que la DB soit prête').toHaveLength(0);

        await attendreBoot();
        expect(appels).toContain('avant-emission');

        fenetre.auDbPret(() => appels.push('rattrapage'));
        expect(appels).toContain('rattrapage');
    });

    it('le mode IndexedDB n’émet pas en double par cette branche', () => {
        // La branche #418 est un `else` : quand IDB est disponible, l'émission
        // reste celle de syncToLocalStorageCache (#414), seule et unique.
        const debut = sourceDb.indexOf('db.init().then(');
        expect(debut, 'boot db.init().then introuvable').toBeGreaterThan(-1);
        const fin = sourceDb.indexOf('beforeunload', debut);
        expect(fin, 'borne beforeunload introuvable APRÈS le boot').toBeGreaterThan(debut);
        const bloc = sourceDb.slice(debut, fin);
        expect(bloc).toMatch(/if \(db\.useIndexedDB\) \{/);
        expect(bloc).toMatch(/\} else \{/);
        // Et dans la branche else, drapeau puis événement, dans cet ordre.
        const blocElse = bloc.slice(bloc.indexOf('} else {'));
        const iDrapeau = blocElse.indexOf('window.dbReady = true');
        const iEmission = blocElse.indexOf("new CustomEvent('db-ready'");
        expect(iDrapeau).toBeGreaterThan(-1);
        expect(iEmission).toBeGreaterThan(-1);
        expect(iDrapeau).toBeLessThan(iEmission);
    });
});
