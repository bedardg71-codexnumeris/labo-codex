/**
 * #1075, POINT 3 — UNE PRODUCTION EMPLOYÉE NE SE SUPPRIME PAS ET NE S'ÉCRASE PAS (22 oct. 2026).
 *
 * Constat (audit 3.3, 3.48) : les deux suppressions de la Conception (`supprimerProduction`,
 * `supprimerProductionActive`) et « Remplacer l'existante » ne comptaient ni évaluations ni copies ; la
 * grille, elle, refuse (#624, #967). Réglages › Données comptait les évaluations, pas les copies.
 * Intention de Grégoire : « une production qui a des évaluations ou des copies ne peut pas être
 * supprimée ; le refus dit combien, comme pour une grille ».
 *
 * Ce banc charge `productions.js` et `productions-liste.js` RÉELS (db en doublure) et verrouille :
 *   A — `compterEmploisProduction` compte les évaluations et les copies du trimestre, tous groupes ;
 *   B — les deux suppressions refusent une production employée, avant le codex, sans rien écrire, et
 *       le refus dit combien ; une production libre part comme avant ;
 *   C — « Remplacer l'existante » reçoit le compte des homonymes (`porteursHomonymes`, #967) ;
 *   D — Réglages › Données compte aussi les copies (lecture du source).
 *
 * Break-test (22 oct.) : `compterEmploisProduction` rendant toujours zéro rougit A, B1, B2 et C.
 *
 * Données FICTIVES.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const K = (k) => 'a2032_' + k;

function elementInerte() {
    return { innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle: () => false },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, addEventListener() {},
        querySelector: () => null, querySelectorAll: () => [], closest: () => null, focus() {} };
}

function monter({ evaluations = [], fichiers = [], verifierEtGererDoublon } = {}) {
    const store = {
        [K('productions')]: [{ id: 'P1', titre: 'Analyse fictive' }, { id: 'P2', titre: 'Essai fictif' }],
        [K('evaluationsSauvegardees')]: evaluations,
        [K('fichiersTravaux')]: fichiers
    };
    const alertes = [];
    const codex = [];
    const db = {
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; return true; },
        get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
        async modifier(k, mutateur, defaut) {
            const v = await mutateur(k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
            if (v !== undefined) store[k] = v;
            return v;
        }
    };
    const globaux = {
        db, cle: K,
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => p + 'X',
        alert: (m) => alertes.push(m), confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        document: { getElementById: () => elementInerte(), querySelector: () => null, querySelectorAll: () => [], body: elementInerte(), createElement: elementInerte, addEventListener() {} },
        obtenirDonneesSelonMode: () => null,
        Codex: { proposerAvantSuppression: async (g) => { codex.push(g); return true; } },
        afficherListeProductions: async () => {}, annulerFormProduction: () => {}, mettreAJourPonderationTotale: async () => {},
        afficherToutesLesProductionsParType: async () => {},
        productionEnEdition: null,
        ...(verifierEtGererDoublon ? { verifierEtGererDoublon } : {})
    };
    const win = chargerScript('js/productions.js', globaux, { decrirePorteursEchelle: null });
    // La phrase des comptes est celle de l'échelle (echelles.js), partagée par les refus.
    win.decrirePorteursEchelle = (n) => ['evaluations', 'copies'].filter((k) => n[k]).map((k) => n[k] + ' ' + k).join(' et ');
    return { win, store, alertes, codex, globaux };
}

const EVALS = [{ id: 'E1', productionId: 'P1', groupe: '01' }, { id: 'E2', productionId: 'P1', groupe: '02' }];
const COPIES = [{ id: 'F1', productionId: 'P1', groupeCours: 'GC2' }, { id: 'F2', productionId: 'P2' }];

describe('#1075, point 3 — une production employée reste', () => {
    it('A — les évaluations et les copies du trimestre sont comptées, tous groupes', () => {
        const { win } = monter({ evaluations: EVALS, fichiers: COPIES });
        expect(win.compterEmploisProduction('P1')).toEqual({ evaluations: 2, copies: 1, total: 3 });
        expect(win.compterEmploisProduction(['P1', 'P2'])).toEqual({ evaluations: 2, copies: 2, total: 4 });
    });

    it('B1 — supprimerProduction refuse une production employée, avant le codex, sans écrire', async () => {
        const e = monter({ evaluations: EVALS, fichiers: COPIES });
        await e.win.supprimerProduction('P1');
        expect(e.store[K('productions')].map((p) => p.id)).toEqual(['P1', 'P2']);
        expect(e.codex).toEqual([]);
        expect(e.alertes).toHaveLength(1);
        expect(e.alertes[0]).toContain('« Analyse fictive »');
        expect(e.alertes[0]).toContain('2 evaluations et 1 copies');
    });

    it('B2 — supprimerProductionActive refuse aussi', async () => {
        const e = monter({ fichiers: COPIES });
        chargerScript('js/productions-liste.js', { ...e.globaux, productionEnEdition: 'P2', productionSupprimable: e.win.productionSupprimable, getCleProductions: e.win.getCleProductions }, e.win);
        await e.win.supprimerProductionActive();
        expect(e.store[K('productions')].map((p) => p.id)).toEqual(['P1', 'P2']);
        expect(e.codex).toEqual([]);
        expect(e.alertes[0]).toContain('« Essai fictif »');
    });

    it('B3 — une production que rien n\'emploie part comme avant', async () => {
        const e = monter({ evaluations: EVALS });
        await e.win.supprimerProduction('P2');
        expect(e.store[K('productions')].map((p) => p.id)).toEqual(['P1']);
        expect(e.codex).toEqual(['production']);
        expect(e.alertes).toEqual([]);
    });

    it('C — « Remplacer l\'existante » reçoit le compte des homonymes', async () => {
        let recu = null;
        const e = monter({ evaluations: EVALS, verifierEtGererDoublon: async (type, nom, liste, idActuel, options) => {
            recu = await options.porteursHomonymes(liste.filter((x) => x.nom === nom));
            return null;
        } });
        const r = await e.win.gererDoublonProduction('Analyse fictive', e.store[K('productions')], null);
        expect(r.annule).toBe(true);
        expect(recu).toEqual({ evaluations: 2, copies: 0, total: 2 });
    });

    it('D — Réglages › Données compte aussi les copies', () => {
        const src = readFileSync(path.join(racine, 'js/donnees-v2.js'), 'utf8');
        const fn = tranche(src, 'function verifierDependancesProduction(', 'return { dependances, avertissements };');
        expect(fn).toContain('_fichiersTravaux');
        expect(fn).toContain('copie(s) y sont rattachées');
    });
});
