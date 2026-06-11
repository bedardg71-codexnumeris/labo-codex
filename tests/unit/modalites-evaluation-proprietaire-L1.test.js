import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #328 Lots 1 et 3 — module propriétaire de `modalitesEvaluation`.
// Verrouille le contrat de js/pratiques/modalites-evaluation.js :
//  - lire() : clé NAMESPACÉE uniquement (le fallback clé nue du Lot 1 a été
//    retiré au Lot 3), jamais null ;
//  - modifier() : read-modify-write centralisé, mutations en place
//    (affectations, delete, sections imbriquées), écrit la clé NAMESPACÉE ;
//  - remplacer() : écrasement complet, refuse null/non-objet (ne stocke
//    jamais autre chose qu'un objet à la place de la config) ;
//  - purgerLegacy() (Lot 3) : retire dureePeriodeMinutes des modalités de
//    chaque trimestre, rapatrie la valeur dans `${id}_dureePeriode` sans
//    jamais écraser une valeur existante.
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

    it('ignore la clé nue legacy (fallback retiré au Lot 3)', () => {
        store['modalitesEvaluation'] = { pratique: 'sommative' };
        expect(M.lire()).toEqual({});
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

    it('ne rapatrie plus la clé nue : modifier() part d\'un objet vide (Lot 3)', () => {
        store['modalitesEvaluation'] = { pratique: 'sommative' };
        M.modifier((m) => { m.typePAN = null; });
        // La clé nue est ignorée et jamais touchée — seule la migration
        // namespacing bornée de main.js a encore le droit de la lire.
        expect(store['t1_modalitesEvaluation']).toEqual({ typePAN: null });
        expect(store['modalitesEvaluation']).toEqual({ pratique: 'sommative' });
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

describe('L3 · purgerLegacy()', () => {
    beforeEach(() => {
        // Deux trimestres réels + une entrée invalide (filtrée par le helper
        // réel enumererTrimestres — le stub reproduit son contrat : ids non vides).
        win.enumererTrimestres = () => [{ id: 't1' }, { id: 't2' }];
    });

    it('rapatrie la valeur dans dureePeriode et retire le champ legacy', () => {
        store['t1_modalitesEvaluation'] = { discipline: 'Philosophie', dureePeriodeMinutes: 50 };
        expect(M.purgerLegacy()).toBe(1);
        expect(store['t1_dureePeriode']).toBe(50);
        expect(store['t1_modalitesEvaluation']).toEqual({ discipline: 'Philosophie' });
    });

    it('n\'écrase JAMAIS une clé dureePeriode déjà présente', () => {
        store['t1_modalitesEvaluation'] = { dureePeriodeMinutes: 50 };
        store['t1_dureePeriode'] = 60;
        M.purgerLegacy();
        expect(store['t1_dureePeriode']).toBe(60);
        expect('dureePeriodeMinutes' in store['t1_modalitesEvaluation']).toBe(false);
    });

    it('traite chaque trimestre indépendamment et reste idempotente', () => {
        store['t1_modalitesEvaluation'] = { dureePeriodeMinutes: 50 };
        store['t2_modalitesEvaluation'] = { discipline: 'Littérature' };
        expect(M.purgerLegacy()).toBe(1);   // seul t1 portait un champ legacy
        expect(M.purgerLegacy()).toBe(0);   // 2e passe : plus rien à faire
        expect(store['t2_modalitesEvaluation']).toEqual({ discipline: 'Littérature' });
        expect('t2_dureePeriode' in store).toBe(false);
    });

    it('ignore une valeur legacy invalide sans créer dureePeriode, mais purge le champ', () => {
        store['t1_modalitesEvaluation'] = { dureePeriodeMinutes: 'abc' };
        expect(M.purgerLegacy()).toBe(1);
        expect('t1_dureePeriode' in store).toBe(false);
        expect(store['t1_modalitesEvaluation']).toEqual({});
    });

    it('no-op sans helper enumererTrimestres (boot très précoce)', () => {
        delete win.enumererTrimestres;
        store['t1_modalitesEvaluation'] = { dureePeriodeMinutes: 50 };
        expect(M.purgerLegacy()).toBe(0);
        expect(store['t1_modalitesEvaluation']).toEqual({ dureePeriodeMinutes: 50 });
    });

    it('L2-a/b2 · purge les trois miroirs morts SANS rapatriement (champs propres conservés)', () => {
        store['t1_modalitesEvaluation'] = {
            typePAN: 'maitrise',                   // champ PROPRE : conservé
            pratique: 'standards',                 // L2-b2 : miroir mort, purgé
            pratiqueId: 'p1',
            approcheEvaluation: 'par-artefacts'
        };
        expect(M.purgerLegacy()).toBe(1);
        expect(store['t1_modalitesEvaluation']).toEqual({ typePAN: 'maitrise' });
        // Aucune clé créée : ces champs n'ont pas de destination, leur SSOT existe déjà.
        expect(Object.keys(store)).toEqual(['t1_modalitesEvaluation']);
    });

    it('L2-a/b2 · purge combinée durée + miroirs en une passe', () => {
        store['t1_modalitesEvaluation'] = {
            typePAN: 'maitrise', pratique: 'standards', dureePeriodeMinutes: 50, pratiqueId: 'p1'
        };
        expect(M.purgerLegacy()).toBe(1);
        expect(store['t1_dureePeriode']).toBe(50);
        expect(store['t1_modalitesEvaluation']).toEqual({ typePAN: 'maitrise' });
    });
});
