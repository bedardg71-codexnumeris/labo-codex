import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #328 Lot 1 — module propriétaire de `modalitesEvaluation`.
// Verrouille le contrat de js/pratiques/modalites-evaluation.js :
//  - lire() : clé namespacée d'abord, fallback clé nue (legacy pré-24 mai,
//    retiré au Lot 3), jamais null ;
//  - modifier() : read-modify-write centralisé, mutations en place
//    (affectations, delete, sections imbriquées), écrit la clé NAMESPACÉE ;
//  - remplacer() : écrasement complet, refuse null/non-objet (ne stocke
//    jamais autre chose qu'un objet à la place de la config).
// La sentinelle sentinelle-ssot-modalites-ecrivains-L0.test.js verrouille en
// parallèle que ce module est le SEUL écrivain de la clé dans js/.

let store;
const db = {
    getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
    setSync: (k, v) => { store[k] = v; }
};
// cle() namespacée comme dans l'app (trimestre fictif t1_).
const cle = (k) => 't1_' + k;

const win = chargerScript('js/pratiques/modalites-evaluation.js', { db, cle });
const M = win.modalitesEvaluation;

beforeEach(() => { store = {}; });

describe('L1 · lire()', () => {
    it('lit la clé namespacée en priorité', () => {
        store['t1_modalitesEvaluation'] = { pratique: 'standards' };
        store['modalitesEvaluation'] = { pratique: 'sommative' };
        expect(M.lire().pratique).toBe('standards');
    });

    it('retombe sur la clé nue legacy si la namespacée est absente', () => {
        store['modalitesEvaluation'] = { pratique: 'sommative' };
        expect(M.lire().pratique).toBe('sommative');
    });

    it('rend un objet vide (jamais null) si rien en stockage', () => {
        expect(M.lire()).toEqual({});
    });
});

describe('L1 · modifier()', () => {
    it('applique la mutation et écrit la clé NAMESPACÉE', () => {
        store['t1_modalitesEvaluation'] = { pratique: 'standards' };
        M.modifier((m) => { m.typePAN = 'maitrise'; });
        expect(store['t1_modalitesEvaluation']).toEqual({ pratique: 'standards', typePAN: 'maitrise' });
    });

    it('supporte delete et les sections imbriquées', () => {
        store['t1_modalitesEvaluation'] = { configPAN: { ensembleObjectifsId: 'e1' }, mort: true };
        M.modifier((m) => {
            delete m.mort;
            delete m.configPAN.ensembleObjectifsId;
            m.configPAN.jetons = { actif: true };
        });
        expect(store['t1_modalitesEvaluation']).toEqual({ configPAN: { jetons: { actif: true } } });
    });

    it('rapatrie une config legacy (clé nue) vers la clé namespacée au passage', () => {
        store['modalitesEvaluation'] = { pratique: 'sommative' };
        M.modifier((m) => { m.typePAN = null; });
        expect(store['t1_modalitesEvaluation']).toEqual({ pratique: 'sommative', typePAN: null });
        // La clé nue n'est jamais supprimée par le module (purge = Lot 3).
        expect('modalitesEvaluation' in store).toBe(true);
    });

    it('rend l\'objet écrit', () => {
        const apres = M.modifier((m) => { m.pratique = 'specifications'; });
        expect(apres.pratique).toBe('specifications');
    });
});

describe('L1 · remplacer()', () => {
    it('écrase l\'objet entier sur la clé namespacée', () => {
        store['t1_modalitesEvaluation'] = { pratique: 'standards', typePAN: 'maitrise' };
        expect(M.remplacer({ pratique: 'sommative' })).toBe(true);
        expect(store['t1_modalitesEvaluation']).toEqual({ pratique: 'sommative' });
    });

    it('refuse null/undefined/non-objet sans écrire', () => {
        store['t1_modalitesEvaluation'] = { pratique: 'standards' };
        expect(M.remplacer(null)).toBe(false);
        expect(M.remplacer(undefined)).toBe(false);
        expect(M.remplacer('oops')).toBe(false);
        expect(store['t1_modalitesEvaluation']).toEqual({ pratique: 'standards' });
    });
});
