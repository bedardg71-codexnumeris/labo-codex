/**
 * #1171 (entrée 13 de la file, 4 nov. 2026) — Conception › Productions : le menu lit tout le stock du
 * trimestre, l'import seulement les productions du cours actif. Une production rangée sous un autre cours
 * le dit dans le menu : « (rangée sous 203-GM6-DM) ». Sans coursId, ou du cours actif : rien.
 *
 *   cd tests && npx vitest run unit/productions-menu-cours-1171.test.js
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const LIBELLES = { C1: '601-101-MQ', C2: '203-GM6-DM' };

function monter(infoCours, productions) {
    const rendus = [];
    const store = { infoCours, test_productions: productions, test_grillesTemplates: [] };
    const db = { get: async (k) => store[k], getSync: (k, d) => (k in store ? store[k] : d) };
    const emplacement = { id: 'selectionProductions' };
    const document = {
        getElementById: (id) => (id === 'selectionProductions' ? emplacement : null),
        querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {},
        createElement: () => ({ setAttribute() {}, appendChild() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {}, contains: () => false } })
    };
    const w = chargerScript('js/productions-liste.js', {
        db, document, cle: (k) => 'test_' + k, productionEnEdition: null,
        aucuneEcheanceAssignee: (p) => !p.dateEcheance,
        MenuSelection: { rendre: (el, o) => rendus.push(o.elements) },
        BibliothequeUI: { filtrerParModeDemo: (l) => l }
    });
    w.libelleCoursParIdV2 = (id) => LIBELLES[id] || 'Cours ' + id;
    return { w, rendus };
}

describe('#1171 · le menu des productions nomme le cours d\'une production rangée ailleurs', () => {
    it('la règle : autre cours → « (rangée sous …) » ; cours actif ou sans coursId → rien ; avec « (à planifier) »', () => {
        const { w } = monter(null, []);
        const lib = (id) => LIBELLES[id];
        const f = w.suffixeProductionDuMenu;
        expect(f({ coursId: 'C2', dateEcheance: '2026-11-10' }, 'C1', lib)).toBe('(rangée sous 203-GM6-DM)');
        expect(f({ coursId: 'C1', dateEcheance: '2026-11-10' }, 'C1', lib)).toBe('');
        expect(f({ dateEcheance: '2026-11-10' }, 'C1', lib)).toBe('');
        expect(f({ coursId: 'C2' }, 'C1', lib)).toBe('(à planifier) (rangée sous 203-GM6-DM)');
        expect(f({ coursId: 'C2', dateEcheance: '2026-11-10' }, null, lib)).toBe('');
    });

    it('le menu de l\'écran : la production de l\'autre cours le dit, celle du cours actif non', async () => {
        const { w, rendus } = monter({ id: 'C1' }, [
            { id: 'P1', titre: 'Analyse partie A', coursId: 'C2', dateEcheance: '2026-11-10', type: 'sommative' },
            { id: 'P2', titre: 'Dissertation', coursId: 'C1', dateEcheance: '2026-11-17', type: 'sommative' }
        ]);
        await w.afficherListeProductions();
        expect(rendus[0].map((e) => [e.nom, e.suffixe])).toEqual([
            ['Analyse partie A', '(rangée sous 203-GM6-DM)'],
            ['Dissertation', '']
        ]);
    });
});
