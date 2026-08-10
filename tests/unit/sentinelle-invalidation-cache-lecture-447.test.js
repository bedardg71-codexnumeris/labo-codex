import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Charge le VRAI js/db.js dans un bac à sable Node (patron du #353 W1). */
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
    const silencieux = { log() {}, warn() {}, error() {} };
    const fn = new Function(
        'window', 'document', 'console', 'localStorage', 'sessionStorage', 'indexedDB',
        '"use strict";\n' + code
    );
    fn(win, { addEventListener() {} }, silencieux, ls, ls, undefined);
    return win.db;
}

// =======================================================================
// SENTINELLE #447 — le cache de lecture #397 ne sert plus de valeur périmée
// =======================================================================
//
// Le cache de pipeline (#397) promettait dans son propre commentaire
// « jamais de lecture périmée ». Il ne tenait cette promesse que pour les
// écritures passant par `sauvegarderDonneesSelonMode`. Or plusieurs
// propriétaires SSOT écrivent leur clé en `db.setSync` DIRECT — c'est
// légitime — et ces écritures-là ne vidaient rien.
//
// Mesuré au navigateur le 10 août (Chromium, pack démo) : pendant un seul
// `chargerTableauBordApercu()`, `indicesCP` est écrit à une profondeur de
// pipeline de 2. Le pipeline extérieur survit à l'écriture et garde sa
// mémoïsation d'AVANT. Aucune lecture périmée n'était servie ce jour-là —
// mais rien n'empêchait le prochain lecteur ajouté dans cette fenêtre d'en
// recevoir une, en silence. Même famille que le 10 août : une promesse
// écrite en commentaire que le code ne tenait qu'à moitié.
//
// Ce qui est verrouillé ici :
//   A. `modes.js` s'abonne à `db.surEcriture` AU CHARGEMENT (sans quoi tout
//      le reste est décoratif) ;
//   B. une écriture pendant un pipeline ouvert rend la lecture suivante
//      FRAÎCHE — l'invariant lui-même, de bout en bout ;
//   C. l'invalidation est CIBLÉE : les autres clés restent mémoïsées.
//      Ce n'est pas une élégance — vider tout le cache à chaque écriture a
//      été mesuré à **+329 ms** sur un rendu à 75 étudiants, soit l'ordre de
//      grandeur du gain que #397 était venu chercher. Ciblée, la mesure
//      retombe dans le bruit (+22 ms sur 618, plages superposées) ;
//   D. la clé de BASE et la clé namespacée sont toutes deux retirées (les
//      lecteurs mémoïsent « indicesCP », `db` écrit « h2026_indicesCP ») ;
//   E. le chemin surveillé historiquement (`sauvegarderDonneesSelonMode`)
//      invalide toujours.

function chargerModes(store) {
    const lectures = [];
    const db = {
        _surEcriture: null,
        surEcriture(rappel) { this._surEcriture = typeof rappel === 'function' ? rappel : null; },
        getSync(k, d) { lectures.push(k); return (k in store) ? store[k] : d; },
        setSync(k, v) {
            // Ordre reproduit fidèlement : `db` signale, PUIS persiste.
            if (typeof this._surEcriture === 'function') this._surEcriture(k);
            store[k] = v;
        }
    };
    const win = chargerScript('js/modes.js', {
        db,
        cle: (k) => 'h2026_' + k,
        obtenirPreference: () => null,
        sauvegarderPreference: () => {}
    });
    win.cle = (k) => 'h2026_' + k;
    win.db = db;
    return { win, db, lectures, store };
}

describe('#447 · invalidation du cache de lecture de pipeline', () => {

    it('A · modes.js s\'abonne réellement à db.surEcriture au chargement', () => {
        // Leçon du 10 août : vérifier le branchement, pas la présence de
        // l'intention. Un abonnement jamais posé ne proteste pas.
        const { db, win } = chargerModes({});
        expect(typeof db._surEcriture).toBe('function');
        expect(typeof win.invaliderCacheLecture).toBe('function');
        expect(db._surEcriture).toBe(win.invaliderCacheLecture);
    });

    it('B · une écriture directe pendant un pipeline rend la lecture suivante FRAÎCHE', () => {
        const store = { h2026_indicesCP: { DA1: { actuel: { P: 11 } } } };
        const { win, db } = chargerModes(store);

        win.demarrerCacheLecture();
        const avant = win.obtenirDonneesSelonMode('indicesCP');
        expect(avant.DA1.actuel.P).toBe(11);

        // Ce que fait calculerEtStockerIndicesCP : écriture DIRECTE, sans
        // passer par sauvegarderDonneesSelonMode.
        db.setSync('h2026_indicesCP', { DA1: { actuel: { P: 67 } } });

        const apres = win.obtenirDonneesSelonMode('indicesCP');
        win.terminerCacheLecture();

        expect(apres.DA1.actuel.P).toBe(67);
    });

    it('C · l\'invalidation est CIBLÉE : les autres clés restent mémoïsées', () => {
        const store = {
            h2026_indicesCP: { DA1: { actuel: { P: 11 } } },
            h2026_productions: [{ id: 'P1' }]
        };
        const { win, db, lectures } = chargerModes(store);

        win.demarrerCacheLecture();
        win.obtenirDonneesSelonMode('indicesCP');
        win.obtenirDonneesSelonMode('productions');

        const lecturesAvant = lectures.filter(k => k === 'h2026_productions').length;
        db.setSync('h2026_indicesCP', { DA1: { actuel: { P: 67 } } });
        win.obtenirDonneesSelonMode('productions');
        const lecturesApres = lectures.filter(k => k === 'h2026_productions').length;
        win.terminerCacheLecture();

        // `productions` n'a pas été réécrit : il doit encore sortir du cache,
        // donc AUCUNE relecture du stockage. Un rabot ferait +1 ici — et c'est
        // ce rabot qui coûtait 329 ms à 75 étudiants.
        expect(lecturesApres).toBe(lecturesAvant);
    });

    it('D · la clé de base et la clé namespacée sont toutes deux retirées', () => {
        const store = { h2026_indicesCP: { v: 1 } };
        const { win } = chargerModes(store);

        win.demarrerCacheLecture();
        // Les lecteurs mémoïsent sous les deux formes selon les appelants.
        expect(win.obtenirDonneesSelonMode('indicesCP')).toEqual({ v: 1 });

        store.h2026_indicesCP = { v: 2 };
        win.invaliderCacheLecture('h2026_indicesCP');   // clé RÉELLE, comme db la passe

        expect(win.obtenirDonneesSelonMode('indicesCP')).toEqual({ v: 2 });
        win.terminerCacheLecture();
    });

    it('D2 · sans argument, l\'invalidation reste totale (l\'ignorance se paie en prudence)', () => {
        const store = { h2026_indicesCP: { v: 1 }, h2026_productions: [1] };
        const { win, lectures } = chargerModes(store);

        win.demarrerCacheLecture();
        win.obtenirDonneesSelonMode('indicesCP');
        win.obtenirDonneesSelonMode('productions');
        const avant = lectures.filter(k => k === 'h2026_productions').length;

        win.invaliderCacheLecture();   // aucune info sur la clé écrite

        win.obtenirDonneesSelonMode('productions');
        win.terminerCacheLecture();
        expect(lectures.filter(k => k === 'h2026_productions').length).toBe(avant + 1);
    });

    it('E · le chemin surveillé historiquement invalide toujours', () => {
        const store = { h2026_indicesCP: { v: 1 } };
        const { win } = chargerModes(store);

        win.demarrerCacheLecture();
        expect(win.obtenirDonneesSelonMode('indicesCP')).toEqual({ v: 1 });
        win.sauvegarderDonneesSelonMode('indicesCP', { v: 2 });
        expect(win.obtenirDonneesSelonMode('indicesCP')).toEqual({ v: 2 });
        win.terminerCacheLecture();
    });

    it('E2 · le VRAI db.js signale ses écritures (sinon tout le reste est décoratif)', async () => {
        // Les cas A-E tournent sur un `db` de test. Celui-ci va chercher le vrai
        // fichier : sans le crochet dans db.js, l'abonnement de modes.js n'est
        // jamais appelé et l'invariant tombe SANS qu'aucun autre cas ne rougisse.
        const db = chargerDbReel();
        expect(typeof db.surEcriture).toBe('function');

        const vues = [];
        db.surEcriture(k => vues.push(k));

        db.setSync('h2026_indicesCP', { v: 1 });
        expect(vues).toContain('h2026_indicesCP');

        await db.set('h2026_productions', [{ id: 'P1' }]);
        expect(vues).toContain('h2026_productions');

        // Un abonné qui lève ne doit jamais casser une écriture.
        db.surEcriture(() => { throw new Error('abonné fautif'); });
        expect(() => db.setSync('h2026_autre', { v: 2 })).not.toThrow();
        expect(db.getSync('h2026_autre', null)).toEqual({ v: 2 });
    });

    it('F · hors pipeline, l\'invalidation ne casse rien', () => {
        const { win } = chargerModes({ h2026_indicesCP: { v: 1 } });
        expect(() => win.invaliderCacheLecture('h2026_indicesCP')).not.toThrow();
        expect(() => win.invaliderCacheLecture()).not.toThrow();
    });
});
