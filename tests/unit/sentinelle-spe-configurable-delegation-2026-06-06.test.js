import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Comparateur de pratiques (6 juin 2026) — Lot C0/SPE.
// Une pratique CONFIGURABLE de type 'specifications' doit calculer ses PALIERS
// (bundles, tout-ou-rien), pas retomber sur la valeur PAN stockée dans indicesCP.
// La logique vit dans la classe codée en dur PratiquePanSpecifications ;
// PratiqueConfigurable.calculerPerformance (cas 'specifications') doit y déléguer
// en CONFIGURANT une instance jetable avec SA propre config.
// Régression visée : avant ce branchement, le cas 'specifications' renvoyait
// donneesEtudiant.actuel.PAN.P (faux : ce n'était pas un calcul par spécifications).

const INDICES = { '1234567': { actuel: { PAN: { P: 42 } } } };

function charger() {
    return chargerScript('js/pratiques/pratique-configurable.js', {
        db: {
            getSync: (c, d) => (c === 'indicesCP' ? INDICES : (d !== undefined ? d : null)),
            setSync() {}, get: async () => null, set: async () => {}
        },
        cle: (k) => k
    });
}

const CONFIG_SPE = {
    id: 'demo-spe-litt', nom: 'SPE démo',
    calcul_note: { methode: 'specifications' },
    configuration: {
        type: 'specifications',
        typesTravaux: [{ id: 'artefact-portfolio', nom: 'Artefacts', seuilAcceptable: 70 }],
        tableBundles: [
            { noteFixe: 80, requis: { 'artefact-portfolio': 6 } },
            { noteFixe: 50, requis: null }
        ]
    }
};

describe('SPE configurable · délégation à PratiquePanSpecifications', () => {
    it('configure une PanSpecifications avec SA config et délègue le calcul (≠ fallback PAN)', () => {
        const win = charger();
        let recu = null;
        win.PratiquePanSpecifications = class {
            configurerPratique(c) { recu = c; }
            calculerPerformance() { return 0.80; } // 0-1
        };
        const p = new win.PratiqueConfigurable(CONFIG_SPE);
        const perf = p.calculerPerformance('1234567');

        expect(recu).not.toBeNull();
        expect(recu.typesTravaux).toEqual(CONFIG_SPE.configuration.typesTravaux);
        expect(recu.tableBundles).toEqual(CONFIG_SPE.configuration.tableBundles);
        expect(perf).toBeCloseTo(0.80, 5); // délégué — PAS 0.42 (la valeur PAN stockée)
    });

    it('repli sur la valeur PAN si PratiquePanSpecifications est absente', () => {
        const win = charger();
        win.PratiquePanSpecifications = undefined;
        const p = new win.PratiqueConfigurable(CONFIG_SPE);
        expect(p.calculerPerformance('1234567')).toBeCloseTo(0.42, 5);
    });

    it('repli sur la valeur PAN si la config bundles est incomplète', () => {
        const win = charger();
        win.PratiquePanSpecifications = class {
            configurerPratique() {}
            calculerPerformance() { return 0.99; }
        };
        const p = new win.PratiqueConfigurable({
            id: 'x', nom: 'y', calcul_note: { methode: 'specifications' },
            configuration: { type: 'specifications' } // ni typesTravaux ni tableBundles
        });
        expect(p.calculerPerformance('1234567')).toBeCloseTo(0.42, 5);
    });
});
