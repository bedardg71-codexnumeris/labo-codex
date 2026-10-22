/**
 * #1075, POINT 2 — UN TRIMESTRE CLOS NE S'ÉCRIT PAS (22 oct. 2026).
 *
 * Constat (audit 5.28) : la lecture seule d'un trimestre archivé n'était qu'une règle CSS, qui visait des
 * boutons `onclick` disparus ; « Enregistrer », le cadenas et l'annotation écrivaient, et
 * `sauvegarderDonneesSelonMode` ne refusait rien.
 *
 * Ce banc charge `modes.js` RÉEL (db et témoin en doublure) et verrouille :
 *   A — trimestre actif archivé : `sauvegarderDonneesSelonMode` et `modifierEtAnnoncer` n'écrivent pas une
 *       clé du trimestre, et le témoin dit pourquoi (sauf écriture discrète) ;
 *   B — « Permission d'écriture » cochée (`body.mode-ecriture-temp`) : ils écrivent ;
 *   C — trimestre ouvert : rien ne change ; une clé globale ou d'un autre trimestre passe toujours ;
 *   D — la règle CSS ne vise plus d'`onclick` (index.html).
 *
 * Break-test (22 oct.) : `_trimestreClosRefuse` rendant toujours `false` rougit A1, A2 et A3.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function monter({ archive = true, temp = false } = {}) {
    const appels = [];
    const ecrit = {};
    const db = {
        getSync: () => null,
        setSync: (k, v) => { ecrit[k] = v; return true; },
        get: async () => null, set: async () => {}, removeSync: () => {},
        enregistrerGardeEcriture: () => {}, surEcriture: () => {},
        _ecritureAutorisee: () => true,
        async modifier(k, mutateur, defaut) {
            const valeur = await mutateur(k in ecrit ? ecrit[k] : defaut);
            if (valeur === undefined) return undefined;
            ecrit[k] = valeur;
            return valeur;
        }
    };
    const GLOBALES = ['enseignants', 'trimestres'];
    const cle = (k) => (GLOBALES.includes(k) ? k : 'h2026_' + k);
    const classes = new Set(temp ? ['mode-ecriture-temp'] : []);
    const document = {
        addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
        getElementById: () => null,
        body: { setAttribute() {}, getAttribute: () => null, addEventListener() {}, appendChild() {},
            classList: { contains: (c) => classes.has(c), add() {}, remove() {}, toggle() {} } }
    };
    const win = {
        addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'h2026', cle,
        estTrimestreArchive: () => archive,
        temoinEnregistrement: {
            enregistre: (k) => appels.push(['enregistre', k]),
            nonEnregistre: (raison, geste, k) => appels.push(['nonEnregistre', raison, geste, k]),
            fermer: () => {}
        }
    };
    const notifications = { succes() {}, erreur() {}, warning() {}, info() {} };
    chargerScript('js/modes.js', { db, cle, document, notifications, obtenirPreference: () => null, definirPreference: () => {} }, win);
    return { win, appels, ecrit };
}

describe('#1075, point 2 — un trimestre clos ne s\'écrit pas', () => {
    it('A1 — sauvegarderDonneesSelonMode refuse une clé du trimestre clos, et le témoin le dit', () => {
        const b = monter();
        const r = b.win.sauvegarderDonneesSelonMode('evaluationsSauvegardees', [{ id: 'E1' }], { geste: 'Enregistrer l\'évaluation' });
        expect(r).toBe(false);
        expect(b.ecrit).toEqual({});
        expect(b.appels).toHaveLength(1);
        expect(b.appels[0][0]).toBe('nonEnregistre');
        expect(b.appels[0][1]).toMatch(/clos, en lecture seule/);
        expect(b.appels[0][3]).toBe('h2026_evaluationsSauvegardees');
    });

    it('A2 — modifierEtAnnoncer refuse aussi, sans appeler le mutateur', async () => {
        const b = monter();
        let appele = false;
        const r = await b.win.modifierEtAnnoncer('h2026_grillesTemplates', (l) => { appele = true; return [...l, 'G']; }, [], { geste: 'Modifier la grille' });
        expect(r).toBeUndefined();
        expect(appele).toBe(false);
        expect(b.ecrit).toEqual({});
        expect(b.appels[0][0]).toBe('nonEnregistre');
    });

    it('A3 — une écriture discrète refusée se tait', () => {
        const b = monter();
        expect(b.win.sauvegarderDonneesSelonMode('indicesAssiduite', {}, { discret: true })).toBe(false);
        expect(b.ecrit).toEqual({});
        expect(b.appels).toEqual([]);
    });

    it('B — « Permission d\'écriture » cochée : l\'écriture passe', async () => {
        const b = monter({ temp: true });
        expect(b.win.sauvegarderDonneesSelonMode('evaluationsSauvegardees', [{ id: 'E1' }])).toBe(true);
        await b.win.modifierEtAnnoncer('h2026_grillesTemplates', () => ['G'], []);
        expect(Object.keys(b.ecrit).sort()).toEqual(['h2026_evaluationsSauvegardees', 'h2026_grillesTemplates']);
    });

    it('C1 — trimestre ouvert : rien ne change', () => {
        const b = monter({ archive: false });
        expect(b.win.sauvegarderDonneesSelonMode('evaluationsSauvegardees', [{ id: 'E1' }])).toBe(true);
        expect(b.ecrit.h2026_evaluationsSauvegardees).toEqual([{ id: 'E1' }]);
    });

    it('C2 — trimestre clos : une clé globale et la clé d\'un autre trimestre passent', async () => {
        const b = monter();
        expect(b.win.sauvegarderDonneesSelonMode('enseignants', [{ id: 'ENS_1' }])).toBe(true);
        await b.win.modifierEtAnnoncer('a2026_grillesTemplates', () => ['G'], []);
        expect(Object.keys(b.ecrit).sort()).toEqual(['a2026_grillesTemplates', 'enseignants']);
    });

    it('D — la règle CSS de lecture seule ne vise plus d\'onclick', () => {
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect(html).not.toMatch(/mode-archive[^{]*button\[onclick/);
    });
});
