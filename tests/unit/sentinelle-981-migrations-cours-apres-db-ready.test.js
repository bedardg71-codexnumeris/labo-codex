import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #981 — les migrations de `cours` attendent que les données soient lisibles
// =======================================================================
//
// Mesuré le 7 oct. 2026 (banc WebKit `ouverture-sans-geste-981-983.spec.js`, quatre passes) :
// appelées au chargement par `initialiserModuleCours`, AVANT `db-ready`, les deux migrations de
// `cours.js` écrivaient `cours`, puis la synchronisation du démarrage remettait parfois l'ancienne
// valeur (relue sans `pratiqueId` ni `dansBibliotheque`). La migration se rejouait à l'ouverture
// suivante : `cours` réécrit sans geste. Trois rouges sur huit avant, huit verts après.
//
// Une course ne se tient pas au banc : ce test verrouille l'ORDRE. Tant que `db-ready` n'est pas
// passé, rien n'est écrit ; une fois passé, un cours incomplet est complété en UNE lecture
// fraîche, et un cours complet n'est pas réécrit.

function monter(coursStockes) {
    const store = { cours: JSON.parse(JSON.stringify(coursStockes)) };
    const ecritures = [];
    const enAttente = [];
    const win = chargerScript('js/cours.js', {
        db: {
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; ecritures.push(k); },
            getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d),
            setSync: (k, v) => { store[k] = v; ecritures.push(k); }
        },
        echapperHtml: (s) => String(s)
    }, { auDbPret: (rappel) => { enAttente.push(rappel); } });   // le portillon tenu par le test
    return { win, store, ecritures, dbPret: () => enAttente.splice(0).forEach((r) => r()) };
}

describe('#981 · les migrations de la liste des cours attendent db-ready', () => {

    it('A · avant db-ready, aucune écriture ; après, le cours incomplet est complété', () => {
        const b = monter([{ id: 'C_ANCIEN', codeCours: '601-981-ZZ', nomCours: 'Cours fictif' }]);

        b.win.initialiserModuleCours();
        expect(b.ecritures).toEqual([]);

        b.dbPret();
        expect(b.ecritures.length).toBeGreaterThan(0);
        expect(b.store.cours[0].pratiqueId).toBe('pan-standards');
        expect(b.store.cours[0].dansBibliotheque).toBe(true);
    });

    it('B · un cours déjà complet n’est pas réécrit', () => {
        const b = monter([{ id: 'C_COMPLET', codeCours: '601-981-ZY', pratiqueId: 'pan-standards', dansBibliotheque: true }]);

        b.win.initialiserModuleCours();
        b.dbPret();
        expect(b.ecritures).toEqual([]);
    });
});
