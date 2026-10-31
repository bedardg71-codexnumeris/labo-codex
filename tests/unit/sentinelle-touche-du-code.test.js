import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Consigne du 31 oct. 2026, partie E : la touche d'un code est son numéro, 0 pour le 10, rien au-delà.
const { codesAnnotation } = chargerScript('js/codes-annotation.js', { db: { getSync: (_, d) => d } });

describe('toucheDuCode', () => {
    it.each([['1', '1'], ['4', '4'], ['9', '9'], ['10', '0'], [7, '7']])('le code %s : la touche %s', (numero, touche) => {
        expect(codesAnnotation.toucheDuCode({ numero })).toBe(touche);
    });
    it.each([['11'], ['0'], ['A1'], [''], ['03']])('le code « %s » n’a pas de touche', (numero) => {
        expect(codesAnnotation.toucheDuCode({ numero })).toBeNull();
    });
    it('sans code : pas de touche', () => {
        expect(codesAnnotation.toucheDuCode(null)).toBeNull();
    });
});
