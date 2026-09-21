import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #328 L2-c — dégonfler le miroir `configPAN.jetons`.
//
// `obtenirConfigJetons()` (chokepoint de lecture : verifierDisponibiliteJeton,
// appliquerJetonDelai/Reprise, obtenirStatutJetonsEtudiant en dépendent) DÉRIVE
// désormais la config des jetons de la PRATIQUE ACTIVE (SSOT vivante), au lieu de
// lire le miroir `modalites.configPAN.jetons`. Décision D3 (plan §4 bis) : pas de
// snapshot, la config suit la pratique vivante.
//
// Les jetons d'une pratique configurable ont vécu sous 3 emplacements/formes :
//   1. `pratique.jetons`            (plate : nombre/delaiDuree/repriseOriginale/cibleeActif/cibleePlafond)
//   2. `pratique.config.jetons`     (imbriquée : delai{}/reprise{}, champ `actif`)
//   3. `pratique.configuration.jetons` (imbriquée wizard : champ `activer`)
// Le helper de normalisation les ramène toutes à la forme canonique imbriquée que
// les consommateurs attendent (`actif`, `delai.nombre`, `reprise.nombre`, …).
// La forme PLATE est convertie à l'identique de l'ancien `_synchroniserJetonsPratique`
// (préservation stricte). Une 4ᵉ forme NON couverte ⇒ null ⇒ repli sur le défaut
// (jamais absorbée en silence — visible en test/terrain).
//
// Break-test : sans dérivation, et le miroir étant absent, `obtenirConfigJetons()`
// retombe sur le DÉFAUT (delai.nombre=2…) → les assertions « valeurs de la pratique »
// rougissent. C'est la preuve que la sentinelle mord (SKILL_verification_adverse, P2).

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; },
        removeSync: (c) => { delete store[c]; }
    };
}

// Charge le module jetons avec une pratique active donnée et un store sans miroir.
function chargerJetons(pratiqueActiveId, pratiques, extra = {}) {
    const store = { pratiquesConfigurables: pratiques, ...extra };
    return chargerScript('js/evaluation-jetons.js', {
        db: dbDepuisStore(store),
        cle: (k) => k,
        obtenirIdPratiqueActive: () => pratiqueActiveId
    });
}

describe('#328 L2-c · obtenirConfigJetons dérive de la pratique active', () => {

    it('forme PLATE (pratique.jetons) → conversion identique à l\'ancien miroir', () => {
        const win = chargerJetons('P', [{
            id: 'P',
            jetons: { nombre: 3, delaiDuree: 5, repriseOriginale: 'archiver', cibleeActif: true, cibleePlafond: 80 }
        }]);
        expect(win.obtenirConfigJetons()).toEqual({
            actif: true,
            delai: { nombre: 3, dureeJours: 5 },
            reprise: { nombre: 3, maxParProduction: 1, archiverOriginale: true },
            repriseCiblee: { actif: true, plafondNote: 80 }
        });
    });

    it('forme IMBRIQUÉE config.jetons (champ `actif`) → canonique, repriseCiblee inactif par défaut', () => {
        const win = chargerJetons('P', [{
            id: 'P',
            config: { jetons: {
                actif: true,
                delai: { nombre: 2, dureeJours: 2 },
                reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true },
                nombreParEleve: 2, typesPersonnalises: []
            } }
        }]);
        expect(win.obtenirConfigJetons()).toEqual({
            actif: true,
            delai: { nombre: 2, dureeJours: 2 },
            reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true },
            repriseCiblee: { actif: true, nombre: 2, plafondNote: null },  // non configuré → défaut app ACTIF (décision 27 juin)
            nombreParEleve: 2  // agrégat porté par la forme imbriquée
        });
    });

    it('forme IMBRIQUÉE configuration.jetons (wizard, champ `activer`) → `activer` mappé sur `actif`', () => {
        const win = chargerJetons('P', [{
            id: 'P',
            configuration: { jetons: { activer: true, delai: { nombre: 4, dureeJours: 3 }, reprise: { nombre: 1 } } }
        }]);
        expect(win.obtenirConfigJetons()).toEqual({
            actif: true,
            delai: { nombre: 4, dureeJours: 3 },
            reprise: { nombre: 1, maxParProduction: 1, archiverOriginale: true },
            repriseCiblee: { actif: true, nombre: 2, plafondNote: null }  // non configuré → défaut app ACTIF
        });
    });

    it('PRIORITÉ configuration.jetons > config.jetons > jetons', () => {
        const win = chargerJetons('P', [{
            id: 'P',
            configuration: { jetons: { activer: true, delai: { nombre: 9, dureeJours: 1 }, reprise: { nombre: 9 } } },
            config: { jetons: { actif: true, delai: { nombre: 1, dureeJours: 1 }, reprise: { nombre: 1 } } },
            jetons: { nombre: 1, delaiDuree: 1 }
        }]);
        expect(win.obtenirConfigJetons().delai.nombre).toBe(9);
    });

    it('DÉCISION 27 juin — forme imbriquée SANS repriseCiblee → reprise ciblée ACTIVE (défaut app)', () => {
        const win = chargerJetons('P', [{
            id: 'P',
            config: { jetons: { actif: true, delai: { nombre: 2, dureeJours: 2 }, reprise: { nombre: 2 } } } // pas de repriseCiblee
        }]);
        expect(win.obtenirConfigJetons().repriseCiblee.actif).toBe(true);
    });

    it('repriseCiblee EXPLICITEMENT désactivée (actif:false) → respectée', () => {
        const win = chargerJetons('P', [{
            id: 'P',
            config: { jetons: { actif: true, delai: { nombre: 2 }, reprise: { nombre: 2 }, repriseCiblee: { actif: false } } }
        }]);
        expect(win.obtenirConfigJetons().repriseCiblee.actif).toBe(false);
    });

    it('`activer: false` → jetons inactifs (actif:false)', () => {
        const win = chargerJetons('P', [{
            id: 'P',
            configuration: { jetons: { activer: false, delai: { nombre: 2, dureeJours: 2 }, reprise: { nombre: 2 } } }
        }]);
        expect(win.obtenirConfigJetons().actif).toBe(false);
    });

    it('REPLI — aucune pratique active : défaut (delai.nombre=2)', () => {
        const win = chargerJetons(null, []);
        expect(win.obtenirConfigJetons()).toEqual({
            actif: true,
            delai: { nombre: 2, dureeJours: 2 },
            reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true },
            repriseCiblee: { actif: true, nombre: 2, plafondNote: null }
        });
    });

    it('REPLI — pratique active sans jetons (forme non reconnue) : défaut, jamais d\'absorption silencieuse', () => {
        const win = chargerJetons('P', [{ id: 'P', configuration: { jetons: { libelle: 'inconnu' } } }]);
        expect(win.obtenirConfigJetons().delai.nombre).toBe(2);
    });

    it('REPLI — configurationJetons (format v2 plat) conservé quand pas de pratique configurable', () => {
        const win = chargerJetons('sommative', [], {
            modalitesEvaluation: { configurationJetons: { jetonsActif: true, nombreParEleve: 5, dureeDelaiJours: 4, gestionOriginale: 'archiver' } }
        });
        expect(win.obtenirConfigJetons()).toEqual({
            actif: true,
            delai: { nombre: 5, dureeJours: 4 },
            reprise: { nombre: 5, maxParProduction: 1, archiverOriginale: true },
            repriseCiblee: { actif: false, plafondNote: null }
        });
    });
});
