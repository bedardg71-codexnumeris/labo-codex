/**
 * Étape 4c du critère algorithmique (27 oct. 2026) — un calcul pour tes phrases et tes tables ; en tête, les
 * retouches du verdict de 4b. Consigne : `plans de travail/CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4c.md`.
 *
 *   R. Retouche 2 du verdict de 4b : les copies de référence d'un calcul dont la note ne baisse pas quand le compte
 *      monte se choisissent par le compte ; les trois tout faits gardent leurs copies d'hier (la règle d'hier,
 *      recopiée ici comme témoin, sur une grille de réglages). La retouche 1 (le compte brut de la réparation
 *      #1142) est éprouvée par `comptes-erreurs-stock-1142.spec.js`.
 *
 * BREAK-TESTS (faits le 27 oct. 2026, chacun restauré, `cmp` identique) :
 *   · `_baisseAvecLeCompte` qui rend toujours vrai → R.b et R.c rougissent ;
 *   · `_estCompose` qui rend toujours vrai → R.a rougit (0 point par erreur : la note ne baisse pas).
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

function registres() {
    const win = {};
    ['js/note-pourcentage.js', 'js/evaluation-enonces.js', 'js/evaluation-formules.js', 'js/evaluation-projection.js',
        'js/codes-annotation.js', 'js/tables-cas-algo.js', 'js/miroir-algo.js'].forEach((f) => chargerScript(f, {}, win));
    return win;
}
const W = registres();
const F = W.formulesAlgo;
const M = W.miroirAlgo;

const clone = (x) => JSON.parse(JSON.stringify(x));
const d = (k) => ({ t: 'd', k });
const o = (v) => ({ t: 'o', v });
const n = (v) => ({ t: 'n', v });

/** LA RÈGLE D'HIER (miroir-algo.js avant le 27 oct.), recopiée comme témoin : le plancher, sinon la moitié ; le quart. */
function comptesDHier(critere) {
    const p = Number(critere.ponderation);
    const mots = M.etendue(critere);
    const calc = (e) => F.calculer(critere, { ponderation: p, erreurs: e, mots: mots || 0 });
    const premier = (accepte) => {
        const ok = (e) => { const r = calc(e); return r.applicable && accepte(r); };
        let haut = 1;
        while (haut < 100000 && !ok(haut)) haut *= 2;
        if (haut >= 100000) { if (!ok(100000)) return null; haut = 100000; }
        let bas = Math.floor(haut / 2);
        while (haut - bas > 1) { const m = Math.floor((haut + bas) / 2); if (ok(m)) haut = m; else bas = m; }
        return haut;
    };
    const plancher = premier((r) => r.pctBorne <= 0);
    const beaucoup = plancher !== null ? plancher : premier((r) => r.pctBorne <= 50);
    const liste = [0];
    if (beaucoup !== null) {
        const quelques = Math.max(1, Math.round(beaucoup / 4));
        if (quelques < beaucoup) liste.push(quelques);
        liste.push(beaucoup);
    }
    return liste;
}
const comptes = (critere) => M.copies(critere).filter((c) => ['aucune', 'quelques', 'beaucoup'].includes(c.cle)).map((c) => c.erreurs);

const algo = (extra) => Object.assign({ id: 'C1', type: 'algorithmique', ponderation: 20, modeleProjection: 'aucune' }, extra);
const LIMITE = (tolerance) => ({ modeleProjection: 'norme_externe', paramsProjection: { motsReference: 12, erreursTolerees: tolerance } });
const compose = (jetons, extra) => algo(Object.assign({ modeleFormule: 'perso:calc1',
    calculs: [{ id: 'calc1', nom: 'Réussites', sert: 'note', jetons, cas: {} }] }, extra));

describe('4c · R — retouche 2 du verdict de 4b : les copies de référence d\'un calcul qui ne baisse pas', () => {
    it('R.a les trois calculs tout faits gardent les copies d\'hier, sur une grille de réglages et de projections', () => {
        let vus = 0;
        const projections = [undefined, LIMITE(4)];
        [1, 20, 30, 100].forEach((ponderation) => {
            [['penalite_normalisee', 'facteurNormalisation', [1, 60, 500, 10000]],
                ['ratio_cible', 'motsParErreurCible', [1, 12, 60, 10000]],
                ['penalite_par_erreur', 'pointsParErreur', [0, 0.5, 1, 2.5, 100]]].forEach(([modele, cle, valeurs]) => {
                valeurs.forEach((v) => projections.forEach((projection) => {
                    const c = algo({ ponderation, modeleFormule: modele, paramsFormule: { [cle]: v } });
                    if (projection) Object.assign(c, clone(projection));
                    expect(comptes(c), `${modele} ${cle}=${v} p=${ponderation}`).toEqual(comptesDHier(c));
                    vus++;
                }));
            });
        });
        expect(vus).toBeGreaterThan(100);
    });

    it('R.b un calcul qui monte avec le compte : « Aucune » < « Quelques » < « Beaucoup », 2 et 8 sans limite', () => {
        const c = compose([d('compte'), o('×'), n(5)]);
        expect(comptesDHier(c)).toEqual([0, 1]);   // le symptôme d'hier : « Quelques » disparaissait, « Beaucoup » valait 1
        expect(comptes(c)).toEqual([0, 2, 8]);
        // Une note constante ne baisse pas non plus : par le compte.
        expect(comptes(compose([d('ponderation')]))).toEqual([0, 2, 8]);
    });

    it('R.c avec une limite fixée : la tolérance, puis quatre fois la tolérance ; une tolérance de 0 lue à 1', () => {
        const avecLimite = (tolerance) => Object.assign(compose([d('comptePondere'), o('×'), n(2)]), LIMITE(tolerance));
        expect(comptes(avecLimite(3))).toEqual([0, 3, 12]);
        expect(comptes(avecLimite(0))).toEqual([0, 1, 4]);   // la projection lit une tolérance de 0 à son minimum, 1
        // Un calcul composé qui baisse garde la règle d'hier.
        const baisse = compose([d('ponderation'), o('−'), d('comptePondere'), o('×'), n(3)]);
        expect(comptes(baisse)).toEqual(comptesDHier(baisse));
        expect(comptes(baisse)).toEqual([0, 2, 7]);
    });
});
