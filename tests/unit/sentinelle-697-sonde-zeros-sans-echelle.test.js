/**
 * #697 · LA SONDE DU STOCK DIT-ELLE VRAI, ET N'ÉCRIT-ELLE RIEN ?
 * `scripts/diagnostic-697-zeros-sans-echelle.js` mesure les « 0 » écrits sans échelle par le
 * chemin corrigé en #697 (fossile : noteFinale 0 · portée absente · niveau « -- ») et les
 * évaluations dont l'échelle ne se résout plus dans leur trimestre. Un compteur peut rendre zéro
 * parce qu'il n'y a rien ou parce qu'il ne lit rien (#578) : ce banc tient les deux bords, et
 * vérifie qu'aucune écriture ne part (patron de la sentinelle #578).
 */
import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

function monter(store) {
    const ecritures = [];
    const localStorage = { get length() { return Object.keys(store).length; }, key: (i) => Object.keys(store)[i], getItem: () => null, setItem: (k) => ecritures.push(k), removeItem: (k) => ecritures.push(k), clear: () => ecritures.push('clear') };
    const globaux = {
        localStorage,
        db: {
            keys: async () => Object.keys(store),
            get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
            getSync: () => null, set: async (k) => ecritures.push(k), setSync: (k) => ecritures.push(k), modifier: async (k) => ecritures.push(k), removeSync: (k) => ecritures.push(k)
        }
    };
    const journal = [];
    const espion = vi.spyOn(console, 'log').mockImplementation((m) => journal.push(String(m)));
    const win = chargerScript('scripts/diagnostic-697-zeros-sans-echelle.js', globaux);
    return { win, ecritures, journal, espion };
}
const FOSSILE = { id: 'F1', etudiantDA: '1111111', productionId: 'P1', echelleId: 'E_DISPARUE', noteFinale: 0, ponderationCouverte: null, niveauFinal: '--', verrouillee: true };
const VRAI_ZERO = { id: 'Z1', etudiantDA: '2222222', productionId: 'P1', echelleId: 'E1', noteFinale: 0, ponderationCouverte: 0, niveauFinal: '--', verrouillee: true };
const SAINE = { id: 'S1', etudiantDA: '3333333', productionId: 'P1', echelleId: 'E1', noteFinale: 84, ponderationCouverte: 100, niveauFinal: 'M', verrouillee: true };
const PRATIQUE_OK = { id: 'Q1', etudiantDA: '4444444', productionId: 'P1', echelleId: 'pratique-SPE', noteFinale: 80, ponderationCouverte: 100, niveauFinal: 'M' };
const REMPLACEE = { id: 'R1', etudiantDA: '5555555', productionId: 'P1', echelleId: 'E_DISPARUE', noteFinale: 0, ponderationCouverte: null, niveauFinal: '--', remplaceeParId: 'X' };

describe('#697 · la sonde du stock', () => {
    it('A · deux trimestres : elle classe chaque évaluation dans SON espace de noms, sans confondre le vrai zéro et le fossile', async () => {
        const { win, ecritures, espion } = monter({
            a2026_evaluationsSauvegardees: [FOSSILE, VRAI_ZERO, SAINE, PRATIQUE_OK, REMPLACEE],
            a2026_echellesTemplates: [{ id: 'E1', niveaux: [] }],
            a2026_pratiquesConfigurables: [{ id: 'SPE', config: { echelle: { niveaux: [] } } }],
            h2026_evaluationsSauvegardees: [Object.assign({}, SAINE, { id: 'S2' })],
            h2026_echellesTemplates: []   // h2026 n'a pas E1 : S2 est « introuvable » LÀ, pas en a2026
        });
        const r = await win.diag697();
        espion.mockRestore();
        expect(r.statut).toBe('ok');
        expect(r.examinees).toBe(6);
        expect(r.fossiles).toBe(2);              // F1 et R1 (remplacée, comptée à part)
        expect(r.echellesIntrouvables).toBe(3);  // F1, R1 (E_DISPARUE) et S2 (E1 absent d'h2026)
        expect(r.lesDeux).toBe(2);
        expect(r.remplacees).toBe(1);
        expect(r.parCle.a2026_evaluationsSauvegardees.fossiles.join(' ')).toContain('F1');
        expect(r.parCle.a2026_evaluationsSauvegardees.fossiles.join(' ')).not.toContain('Z1');
        expect(r.parCle.h2026_evaluationsSauvegardees.echellesIntrouvables.join(' ')).toContain('S2');
        expect(ecritures).toEqual([]);
    });
    it('B · aucune clé d\'évaluations : elle le DIT (« rien regardé »), sans rendre un zéro rassurant', async () => {
        const { win, journal, espion } = monter({ trimestres: [] });
        const r = await win.diag697();
        espion.mockRestore();
        expect(r.statut).toBe('aucune-cle');
        expect(journal.join('\n')).toContain('rien regardé');
    });
    it('C · le classement, seul : fossile / introuvable / remplacée', () => {
        const { win, espion } = monter({});
        espion.mockRestore();
        const echelles = [{ id: 'E1' }];
        const pratiques = [{ id: 'SPE', config: { echelle: {} } }];
        expect(win.diag697Classer(FOSSILE, echelles, pratiques)).toEqual({ fossile: true, echelleIntrouvable: true, remplacee: false });
        expect(win.diag697Classer(VRAI_ZERO, echelles, pratiques)).toEqual({ fossile: false, echelleIntrouvable: false, remplacee: false });
        expect(win.diag697Classer(PRATIQUE_OK, echelles, pratiques)).toEqual({ fossile: false, echelleIntrouvable: false, remplacee: false });
        expect(win.diag697Classer(Object.assign({}, PRATIQUE_OK, { echelleId: 'pratique-ABSENTE' }), echelles, pratiques).echelleIntrouvable).toBe(true);
        expect(win.diag697Classer(REMPLACEE, echelles, pratiques).remplacee).toBe(true);
    });
});
