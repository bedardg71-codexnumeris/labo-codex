/**
 * L'ORDRE DE LA BANDE « PROGRESSION · TRIMESTRE » (Grégoire, 11 nov. 2026, 9 h 07) : les cases suivent l'ordre des
 * échéances (la date imprimée sous chacune, `due`) ; une production sans échéance va au bout, dans son ordre d'avant ;
 * à échéance égale, l'ordre d'avant. Chaque case garde son numéro (`n`) : seul l'ordre de la bande change.
 * La bande vivante (WebKit) : tests/integration/tableau-de-notation-1.spec.js, « spécifications ».
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const win = {};
chargerScript('js/synthese-retroaction-data.js', {}, win);
const { ordonnerLaBandeParEcheance } = win.syntheseRetroactionData;
const c = (n, due) => ({ n, label: 'Production ' + n, due });

describe('l’ordre de la bande suit les échéances', () => {
    it('par date ; chaque case garde son numéro', () => {
        const r = ordonnerLaBandeParEcheance([c(1, '2026-09-11'), c(2, '2026-10-23'), c(3, '2026-10-09'), c(4, '2026-11-06'), c(5, '2026-10-23T23:59')]);
        expect(r.map((x) => x.n)).toEqual([1, 3, 2, 5, 4]);
        expect(r.find((x) => x.label === 'Production 4').n).toBe(4);
    });

    it('sans échéance : au bout, dans l’ordre d’avant ; à échéance égale, l’ordre d’avant', () => {
        const r = ordonnerLaBandeParEcheance([c(1, null), c(2, '2026-10-01'), c(3, ''), c(4, '2026-09-01'), c(5, '2026-10-01'), c(6, 'pas une date')]);
        expect(r.map((x) => x.n)).toEqual([4, 2, 5, 1, 3, 6]);
    });

    it('une liste vide reste vide ; la liste d’entrée n’est pas touchée', () => {
        expect(ordonnerLaBandeParEcheance([])).toEqual([]);
        const entree = [c(1, '2026-12-01'), c(2, '2026-09-01')];
        ordonnerLaBandeParEcheance(entree);
        expect(entree.map((x) => x.n)).toEqual([1, 2]);
    });
});
