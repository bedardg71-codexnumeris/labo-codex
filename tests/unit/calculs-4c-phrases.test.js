/**
 * Étape 4c du critère algorithmique (27 oct. 2026) — un calcul pour tes phrases et tes tables ; en tête, les
 * retouches du verdict de 4b. Consigne : `plans de travail/CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4c.md`.
 *
 *   R. Retouche 2 du verdict de 4b : les copies de référence d'un calcul dont la note ne baisse pas quand le compte
 *      monte se choisissent par le compte ; les trois tout faits gardent leurs copies d'hier (la règle d'hier,
 *      recopiée ici comme témoin, sur une grille de réglages). La retouche 1 (le compte brut de la réparation
 *      #1142) est éprouvée par `comptes-erreurs-stock-1142.spec.js`.
 *   A. La valeur d'un calcul pour les phrases : l'évaluateur de 4a, sans borne ; ses choix « vaut 0 » (jamais « La note
 *      entière ») ; il ne donne jamais la note, et la note ne bouge pas.
 *   B. Le jeton `{calcN}` : rempli, vide, orphelin — dans le décompte, les paliers et les tables ; aucun littéral.
 *   C. Une table « Selon » un calcul : ses cas de départ, son libellé, le cas choisi, son texte.
 *   D. `calculLu` et les refus : retirer, passer à la note, passer aux phrases.
 *   E. La palette : le bloc d'un calcul, dans les zones qui l'offrent, pas dans le bilan, pas sans son critère.
 *   F. L'évaluation : la phrase enregistrée porte la valeur (les deux modes) ; un critère sans calcul pour les phrases
 *      écrit la phrase d'hier, à l'octet.
 *   G. Le transport : export → import (l'ordre : les calculs avant les tables), partage → réception.
 *
 * BREAK-TESTS (faits le 27 oct. 2026, chacun restauré, `cmp` identique) :
 *   · `_baisseAvecLeCompte` qui rend toujours vrai → R.b et R.c rougissent ;
 *   (la suite des break-tests du lot est consignée au pied de ce fichier.)
 *   · `_estCompose` qui rend toujours vrai → R.a rougit (0 point par erreur : la note ne baisse pas).
 */
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

function registres() {
    const win = {};
    ['js/note-pourcentage.js', 'js/evaluation-enonces.js', 'js/evaluation-formules.js', 'js/evaluation-projection.js',
        'js/codes-annotation.js', 'js/tables-cas-algo.js', 'js/miroir-algo.js', 'js/palette-algo.js'].forEach((f) => chargerScript(f, {}, win));
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

/* ------------------------------------------------------------------ le lot 4c */

const N2 = { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } };
/** « Compte pondéré des X ÷ Compte des Y × 100 » : le calcul de la consigne (§ 7). */
const TAUX = [d('comptePondere'), o('÷'), d('etendue'), o('×'), n(100)];
const phrases = (extra) => Object.assign({ id: 'calc1', nom: 'Taux pour 100', sert: 'phrases', jetons: clone(TAUX), cas: {} }, extra);
const critere4c = (extra) => Object.assign({ id: 'C1', nom: 'Unités et calculs', type: 'algorithmique', ponderation: 20,
    modeleFormule: 'penalite_par_erreur', paramsFormule: { pointsParErreur: 2 }, modeleProjection: 'aucune', noms: clone(N2),
    calculs: [phrases()], calculsProchain: 2 }, extra);
const copie = (cp, compte, mots) => ({ ponderation: 20, erreurs: cp, compte: compte, mots: mots });

describe('4c · A — la valeur d\'un calcul pour les phrases', () => {
    it('A.a l\'évaluateur de 4a, sans borne : au-dessus de la pondération, sous 0, à deux décimales dites', () => {
        const c = critere4c();
        expect(F.valeurCalcul(c, 'calc1', copie(3, 3, 600))).toBe(0.5);
        expect(F.valeurCalcul(c, 'calc1', copie(300, 300, 60))).toBe(500);   // aucune borne : 500, pas 20
        const negatif = critere4c({ calculs: [phrases({ jetons: [d('ponderation'), o('−'), d('compte'), o('×'), n(3)] })] });
        expect(F.valeurCalcul(negatif, 'calc1', copie(10, 10, 600))).toBe(-10);
        expect(F.jetonsDesCalculs(negatif, copie(10, 10, 600))).toEqual({ calc1: '−10' });
        expect(F.jetonsDesCalculs(c, copie(2, 2, 3))).toEqual({ calc1: '66,67' });
    });

    it('A.b « vaut 0 » : « Sans valeur » au départ pour une donnée qui divise, « Calculer normalement » sinon ; « La valeur 0 » ; jamais « La note entière »', () => {
        const c = critere4c();
        expect(F.valeurCalcul(c, 'calc1', copie(3, 3, 0))).toBeNull();   // départ : sans valeur
        expect(F.valeurCalcul(c, 'calc1', copie(0, 0, 600))).toBe(0);    // le compte pondéré à 0 : calculer normalement
        const zero = critere4c({ calculs: [phrases({ cas: { etendue: 'zero' } })] });
        expect(F.valeurCalcul(zero, 'calc1', copie(3, 3, 0))).toBe(0);
        // « La note entière » et « calculer » une division : illisibles, écartés (le départ revient).
        const entiere = critere4c({ calculs: [phrases({ cas: { etendue: 'entiere', comptePondere: 'aucune' } })] });
        expect(F.calculsDuCritere(entiere)[0].cas).toEqual({ comptePondere: 'aucune' });
        expect(F.valeurCalcul(entiere, 'calc1', copie(0, 0, 600))).toBeNull();
        const calculer = critere4c({ calculs: [phrases({ cas: { etendue: 'calcul' } })] });
        expect(F.calculsDuCritere(calculer)[0].cas).toEqual({});
        // Les choix offerts : les mots de l'ébauche.
        const off = F.casDuBrouillon(c, { sert: 'phrases', jetons: TAUX, cas: {} });
        expect(off.rangees.map((r) => [r.donnee, r.actuel, r.choix.map((x) => x.libelle)])).toEqual([
            ['etendue', 'aucune', ['Sans valeur', 'La valeur 0']],
            ['comptePondere', 'calcul', ['Calculer normalement', 'Sans valeur', 'La valeur 0']]
        ]);
        expect(off.phrases).toBe(true);
    });

    it('A.c il ne donne jamais la note : la note du critère est celle d\'hier ; `perso:` vers lui, introuvable ; le choisir, refusé', () => {
        const sans = critere4c({ calculs: undefined, calculsProchain: undefined });
        const avec = critere4c();
        [0, 1, 3, 10].forEach((e) => {
            expect(F.calculer(avec, copie(e, e, 600))).toEqual(F.calculer(sans, copie(e, e, 600)));
        });
        expect(F.calculer(critere4c({ modeleFormule: 'perso:calc1' }), copie(1, 1, 600))).toMatchObject({ applicable: false, raison: 'calcul-introuvable' });
        const k = critere4c();
        expect(F.choisirCalculCompose(k, 'perso:calc1')).toBe(false);
        expect(k.modeleFormule).toBe('penalite_par_erreur');
        expect(F.calculsPourLaNote(avec)).toEqual([]);
        expect(F.calculsPourLesPhrases(avec).map((c) => c.id)).toEqual(['calc1']);
    });

    it('A.d « Garder » : le message de l\'ébauche, la note intacte ; la ligne de la copie fictive dit la valeur, sans borne', () => {
        const c = critere4c({ calculs: undefined, calculsProchain: undefined });
        const r = F.garderCalcul(c, { nom: '  Taux pour 100 ', sert: 'phrases', jetons: TAUX, cas: {} });
        expect(r).toEqual({ ok: true, id: 'calc1', message: 'Calcul « Taux pour 100 » gardé : il est dans la palette et dans le menu « Selon ».' });
        expect(c.modeleFormule).toBe('penalite_par_erreur');
        expect(c.calculs).toEqual([phrases()]);
        const b = (nom, jetons, cas) => ({ nom, sert: 'phrases', jetons, cas: cas || {} });
        expect(F.ligneDuBrouillon(c, b('Taux', TAUX), copie(3, 3, 600))).toBe('Taux = 3 ÷ 600 × 100 = 0,5');
        expect(F.ligneDuBrouillon(c, b('', TAUX), copie(30, 30, 6))).toBe('Ton calcul = 30 ÷ 6 × 100 = 500');
        expect(F.ligneDuBrouillon(c, b('Taux', TAUX), copie(3, 3, 0))).toBe('Taux serait sans valeur.');
        expect(F.ligneDuBrouillon(c, b('Taux', TAUX, { etendue: 'zero' }), copie(3, 3, 0))).toBe('Le compte des calculs vaut 0 : Taux vaudrait 0.');
    });
});

describe('4c · B — le jeton `{calcN}` : rempli, vide, orphelin', () => {
    it('B.a le registre des énoncés : rempli ; vide ou orphelin, retiré avec l\'espace qui le précède ; un texte sans lui, à l\'octet', () => {
        expect(W.enoncesAlgo.rendre('Ton taux : {calc1} pour 100.', { calc1: '0,5' })).toBe('Ton taux : 0,5 pour 100.');
        expect(W.enoncesAlgo.rendre('Ton taux : {calc1} pour 100.', { calc1: '' })).toBe('Ton taux : pour 100.');
        expect(W.enoncesAlgo.rendre('Ton taux {calc7}.', {})).toBe('Ton taux.');
        expect(W.enoncesAlgo.rendre('{calc1} au début.', {})).toBe('au début.');
        const hier = 'Attention : 3 erreurs ; revois {mots} !';
        expect(W.enoncesAlgo.rendre(hier, { mots: '600' })).toBe('Attention : 3 erreurs ; revois 600 !');
        expect(W.enoncesAlgo.remplirCalculs('sans jeton  ', {})).toBe('sans jeton  ');
    });

    it('B.b le décompte d\'un critère : `enonce` reçoit les jetons des calculs, et rien de littéral ne reste', () => {
        const c = critere4c({ enonces: { decompte: '{erreurs} {nomErreurs} sur {mots} {nomMots} ; ton taux : {calc1} pour 100.' } });
        const v = (cp, m) => Object.assign({ erreurs: cp, mots: m, points: '' }, F.jetonsDesCalculs(c, copie(cp, cp, m)));
        expect(W.enoncesAlgo.enonce(c, 'decompte', v(3, 600))).toBe('3 unités manquantes sur 600 calculs ; ton taux : 0,5 pour 100.');
        expect(W.enoncesAlgo.enonce(c, 'decompte', v(3, 0))).toBe('3 unités manquantes sur 0 calcul ; ton taux : pour 100.');
        // Le calcul retiré à la main de la donnée (un import d'une version qui l'a perdu) : le jeton part.
        const orphelin = Object.assign(clone(c), { calculs: undefined });
        expect(W.enoncesAlgo.enonce(orphelin, 'decompte', Object.assign({ erreurs: 3, mots: 600, points: '' }, F.jetonsDesCalculs(orphelin, copie(3, 3, 600)))))
            .not.toMatch(/\{|calc1/);
    });

    it('B.c les paliers : `calculer` reçoit les jetons ; un orphelin part ; il n\'est pas « inconnu » ; il ne fait pas tomber le préfixe', () => {
        const c = critere4c({ modeleProjection: 'norme_externe', paramsProjection: { motsReference: 900, erreursTolerees: 30 },
            paliersProjection: [{ cle: 'a', libelle: 'A', ratioMax: null, texte: 'Taux : {calc1} pour 100.', texteAide: '' },
                { cle: 'z', libelle: 'Z', sansErreur: true, texte: 'Aucune.' }] });
        const P = W.projectionAlgo;
        const r = P.calculer(c, { erreurs: 3, mots: 600, calculs: F.jetonsDesCalculs(c, copie(3, 3, 600)) });
        expect(r.texte).toBe('Tu fais en moyenne 1 unité manquante à chaque 200 calculs. Taux : 0,5 pour 100.');
        expect(P.calculer(c, { erreurs: 3, mots: 600 }).texte).toBe('Tu fais en moyenne 1 unité manquante à chaque 200 calculs. Taux : pour 100.');
        expect(P.jetonsInconnus('Taux : {calc1} {truc}.')).toEqual(['{truc}']);
        expect(P.remplir('Sans jeton, gardé tel quel  ', {})).toBe('Sans jeton, gardé tel quel  ');
    });

    it('B.d les tables : le texte d\'un cas porte la valeur ; sans valeur, le jeton part', () => {
        const T = W.tablesCasAlgo;
        const c = critere4c();
        const id = T.ajouterTable(c);
        T.ecrireTexte(c, id, '0', 'Aucune ({calc1}).');
        T.ecrireTexte(c, id, '1', 'Ton taux : {calc1} pour 100.');
        expect(T.texteDesTables(c, { erreurs: 2, erreursFormule: 2, mots: 400 })).toBe('Ton taux : 0,5 pour 100.');
        expect(T.texteDesTables(c, { erreurs: 0, erreursFormule: 0, mots: 400 })).toBe('Aucune (0).');
        expect(T.texteDesTables(c, { erreurs: 2, erreursFormule: 2, mots: 0 })).toBe('Ton taux : pour 100.');
    });
});

describe('4c · C — une table « Selon » un calcul pour les phrases', () => {
    it('C.a le menu l\'offre après les six ; ses cas de départ : « Sans valeur », une borne à 1, « Au-delà » ; son libellé', () => {
        const T = W.tablesCasAlgo;
        const c = critere4c();
        expect(T.selonsDuCritere(c)).toEqual(['erreurs', 'mots', 'note', 'part', 'moyenne', 'code', 'calc1']);
        expect(T.selonsDuCritere(critere4c({ calculs: [phrases({ sert: 'note' })] }))).not.toContain('calc1');
        expect(T.casParDefaut('calc1', c)).toEqual([{ genre: 'vide', texte: '' }, { genre: 'max', borne: 1, texte: '' }, { genre: 'audela', texte: '' }]);
        expect(T.libelleSelon('calc1', c)).toBe('Ton calcul « Taux pour 100 »');
        const id = T.ajouterTable(c);
        expect(T.changerSelon(c, id, 'calc1')).toBe(true);
        expect(T.nomDeZone(c, id, '1')).toBe('Table selon ton calcul « taux pour 100 », cas jusqu’à 1');
        expect(T.changerSelon(critere4c(), id, 'calc9')).toBe(false);
    });

    it('C.b le cas choisi suit la valeur du calcul (le compte pondéré, l\'étendue), comme une valeur chiffrée', () => {
        const T = W.tablesCasAlgo;
        const c = critere4c();
        const id = T.ajouterTable(c);
        T.changerSelon(c, id, 'calc1');
        const t = T.lire(c)[0];
        const cas = (cp, brut, m) => T.casChoisi(t, T.valeurs(c, { erreurs: brut, erreursFormule: cp, mots: m }));
        expect(cas(3, 3, 600)).toBe('1');      // 0,5 ≤ 1
        expect(cas(12, 12, 600)).toBe('2');    // 2 : au-delà
        expect(cas(3, 3, 0)).toBe('0');        // sans valeur
        expect(cas(9, 3, 600)).toBe('2');      // le compte pondéré (9 ÷ 600 × 100 = 1,5), pas le brut
    });
});

describe('4c · D — `calculLu` et les refus', () => {
    const lu = () => {
        const c = critere4c({ calculs: [phrases(), phrases({ id: 'calc2', nom: 'Autre' })], calculsProchain: 3 });
        return c;
    };
    it('D.a lu par un énoncé, un palier (ses deux zones), le texte d\'un cas, ou le `selon` d\'une table', () => {
        const T = W.tablesCasAlgo;
        expect(F.calculLu(lu(), 'calc1')).toBe(false);
        expect(F.calculLu(Object.assign(lu(), { enonces: { priorite: 'x {calc1}' } }), 'calc1')).toBe(true);
        expect(F.calculLu(Object.assign(lu(), { paliersProjection: [{ cle: 'a', texte: '', texteAide: 'Voir {calc1}.' }] }), 'calc1')).toBe(true);
        const c = lu();
        const id = T.ajouterTable(c);
        T.ecrireTexte(c, id, '1', '{calc2}');
        expect(F.calculLu(c, 'calc2')).toBe(true);
        expect(F.calculLu(c, 'calc1')).toBe(false);
        T.changerSelon(lu(), id, 'calc1');
        const s = lu();
        T.ajouterTable(s);
        T.changerSelon(s, 't1', 'calc1');
        expect(F.calculLu(s, 'calc1')).toBe(true);
        expect(F.calculLu(s, 'calc10')).toBe(false);   // `{calc1}` n'est pas lu comme `{calc10}`
    });

    it('D.b « Retirer » : refusé tant qu\'un texte ou une table le lit (le message de l\'ébauche), rien d\'écrit ; puis accepté', () => {
        const c = Object.assign(lu(), { enonces: { decompte: 'Taux : {calc1}.' } });
        const avant = clone(c);
        expect(F.retirerCalcul(c, 'calc1')).toEqual({ ok: false, message: 'Une table ou un texte lit ce calcul : retire-l’en d’abord.' });
        expect(c).toEqual(avant);
        delete c.enonces;
        expect(F.retirerCalcul(c, 'calc1').ok).toBe(true);
        expect(c.calculs.map((x) => x.id)).toEqual(['calc2']);
    });

    it('D.c changer « Ce calcul sert » : lu, il ne passe pas à la note ; le calcul de la note ne passe pas aux phrases', () => {
        const c = Object.assign(lu(), { enonces: { decompte: 'Taux : {calc1}.' } });
        const b = Object.assign(F.brouillonDuCalcul(c, 'calc1'), { sert: 'note' });
        expect(F.refusDuBrouillon(c, b)).toBe('Une table ou un texte lit ce calcul : retire-l’en d’abord.');
        const avant = clone(c);
        expect(F.garderCalcul(c, b).ok).toBe(false);
        expect(c).toEqual(avant);
        // Non lu : il passe à la note, et la donne.
        expect(F.garderCalcul(c, Object.assign(F.brouillonDuCalcul(c, 'calc2'), { sert: 'note' })).ok).toBe(true);
        expect(c.modeleFormule).toBe('perso:calc2');
        // Le calcul de la note ne passe pas aux phrases.
        expect(F.refusDuBrouillon(c, Object.assign(F.brouillonDuCalcul(c, 'calc2'), { sert: 'phrases' }))).toBe('Ce calcul donne la note : choisis d’abord un autre calcul.');
        // Dix calculs EN TOUT par critère, pour la note comme pour les phrases.
        const dix = critere4c({ calculs: Array.from({ length: 10 }, (_, i) => phrases({ id: 'calc' + (i + 1), sert: i % 2 ? 'note' : 'phrases' })), calculsProchain: 11 });
        expect(F.refusDuBrouillon(dix, { nom: 'Onze', sert: 'phrases', jetons: TAUX, cas: {} })).toBe('Ce critère a déjà 10 calculs : retires-en un d’abord.');
    });
});

describe('4c · E — la palette : le bloc d\'un calcul', () => {
    it('E.a un bloc par calcul pour les phrases, à la fin de « Ce qui se remplit… », sous son nom, avec l\'aide de l\'ébauche', () => {
        const Pal = W.paletteAlgo;
        const c = critere4c({ calculs: [phrases(), phrases({ id: 'calc2', nom: 'pour la note', sert: 'note' })] });
        const b = Pal.blocs(c);
        const dernier = b[b.length - 1];
        expect(dernier).toMatchObject({ jeton: '{calc1}', famille: 'remplie', nom: 'Taux pour 100', aide: 'Ton calcul : sa valeur sur la copie évaluée.' });
        expect(b.filter((x) => /calc/.test(x.jeton)).map((x) => x.jeton)).toEqual(['{calc1}']);
        expect(Pal.blocs(critere4c({ calculs: undefined })).some((x) => /calc/.test(x.jeton))).toBe(false);
    });

    it('E.b il s\'offre dans le décompte, les deux zones d\'un palier, le cas d\'une table ; pas dans le bilan ; pas sans son critère', () => {
        const Pal = W.paletteAlgo;
        const c = critere4c();
        const offre = (zone, k) => Pal.reperesDeZone(k === undefined ? c : k, zone).some((r) => r.jeton === '{calc1}');
        expect(offre({ enonceCle: 'decompte' })).toBe(true);
        expect(offre({ palierIndex: '0', champ: 'texte' })).toBe(true);
        expect(offre({ palierIndex: '0', champ: 'texteAide' })).toBe(true);
        expect(offre({ tableCas: 't1', cas: '0' })).toBe(true);
        ['priorite', 'concentre', 'aucune'].forEach((cle) => expect(offre({ enonceCle: cle })).toBe(false));
        expect(offre({ enonceCle: 'decompte' }, null)).toBe(false);
        // Posé au curseur, il est du texte ordinaire.
        const r = W.enoncesAlgo.insererRepere('Ton taux', 8, 8, '{calc1}', Pal.reperesDeZone(c, { enonceCle: 'decompte' }));
        expect(r.texte).toBe('Ton taux {calc1}');
    });
});

/* ------------------------------------------------------------ F. l'évaluation, avec un faux écran (le patron du banc #701) */

function classList() {
    const s = new Set();
    return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); },
        toggle(c, f) { if (f === undefined) f = !s.has(c); if (f) s.add(c); else s.delete(c); return f; } };
}
function elementDom(init) {
    return Object.assign({ value: '', textContent: '', innerHTML: '', checked: false, style: {}, classList: classList(),
        closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
        appendChild() {}, replaceChildren() {}, remove() {}, setAttribute() {}, addEventListener() {}, dispatchEvent() { return true; } }, init || {});
}
const NIVEAUX = [{ code: 'I', min: 0, max: 59, valeurCalcul: 30 }, { code: 'D', min: 60, max: 74, valeurCalcul: 67 },
    { code: 'M', min: 75, max: 89, valeurCalcul: 82 }, { code: 'E', min: 90, max: 100, valeurCalcul: 95 }];

/** Le moteur d'évaluation sur une grille fictive : le critère `a1` (algorithmique), un faux écran, une fausse base. */
function evaluer(a1) {
    const grille = { id: 'G4C', nom: 'Grille fictive 4c', criteres: [{ id: 'c1', nom: 'Contenu', ponderation: 80 }, Object.assign({ id: 'a1' }, a1)] };
    const ecran = { noteProduction1: elementDom(), niveauProduction1: elementDom(), criteresCopier: elementDom(), porteeNote1: elementDom({ classList: classList() }),
        selectEchelle1: elementDom({ value: 'E1' }), eval_c1: elementDom(), comm_c1: elementDom() };
    ['eval_erreurs_', 'eval_mots_', 'eval_categories_', 'total_erreurs_', 'mots_formule_', 'total_erreurs_simple_', 'mots_simple_', 'note_algo_', 'pct_algo_',
        'niveau_algo_', 'cat_dominante_', 'formule_algo_', 'resultat_algo_', 'retroaction_cat_', 'comm_', 'eval_'].forEach((p) => { ecran[p + 'a1'] = elementDom(); });
    const document = { getElementById: (id) => ecran[id] || null, querySelector: () => null, querySelectorAll: () => [], createElement: () => elementDom(),
        addEventListener() {}, removeEventListener() {}, body: elementDom(), documentElement: elementDom() };
    const ec = { etudiantDA: '1234567', productionId: 'P1', grilleId: grille.id, echelleId: 'E1', criteres: { c1: 'M' }, donneesAlgorithmiques: {}, pointsAnalytiques: {} };
    const base = { t_grillesTemplates: [grille], t_echellesTemplates: [{ id: 'E1', nom: 'Échelle', niveaux: NIVEAUX }], t_pratiquesConfigurables: [], t_evaluationsSauvegardees: [] };
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: ec, majBadgesApresEvaluation() {}, genererRetroaction() {} };
    const globaux = { document, evaluationEnCours: ec, cle: (k) => 't_' + k, echapperHtml: (s) => String(s == null ? '' : s),
        valeurNumeriqueDuNiveau: (n) => (n && n.valeurCalcul != null ? Number(n.valeurCalcul) : null),
        db: { getSync: (k, dft) => (k in base ? clone(base[k]) : dft), setSync() {}, get: async () => null, set: async () => {} },
        obtenirDonneesSelonMode: () => [], sauvegarderDonneesSelonMode: () => true, obtenirPreference: () => null, setTimeout: () => 0, clearTimeout() {},
        genererRetroaction() {}, calculerNote: () => win.calculerNote(), mettreAJourCompteurMots() {} };
    ['js/note-pourcentage.js', 'js/evaluation-formules.js', 'js/evaluation-enonces.js', 'js/evaluation-projection.js', 'js/codes-annotation.js',
        'js/tables-cas-algo.js', 'js/evaluation-calcul.js'].forEach((f) => chargerScript(f, globaux, win));
    return { win, ecran, ec, grille };
}
const simple = (h, erreurs, mots) => { h.ecran.eval_erreurs_a1.value = String(erreurs); h.ecran.eval_mots_a1.value = String(mots); h.win.calculerNoteAlgorithmiqueSimple('a1', 20, 500); };
const categories = (h, codes, mots) => { h.ecran.eval_categories_a1.value = codes; h.ecran.eval_mots_a1.value = String(mots); h.win.calculerNoteAlgorithmiqueAvecCategories('a1', 20, 500, 'a1'); };

/** Un critère algorithmique fictif : un décompte, un palier et une table qui lisent `{calc1}`. */
const A1 = (extra) => Object.assign({ nom: 'Unités et calculs', type: 'algorithmique', ponderation: 20, modeleFormule: 'penalite_par_erreur',
    paramsFormule: { pointsParErreur: 2 }, noms: clone(N2), modeleProjection: 'norme_externe', paramsProjection: { motsReference: 900, erreursTolerees: 30 },
    paliersProjection: [{ cle: 'a', libelle: 'A', ratioMax: null, texte: 'Palier : {calc1}.', texteAide: '' }, { cle: 'z', libelle: 'Z', sansErreur: true, texte: 'Aucune.' }],
    enonces: { decompte: '{erreurs} {nomErreurs} ; taux {calc1} pour 100.' }, calculs: [phrases()], calculsProchain: 2,
    tablesCas: [{ id: 't1', selon: 'calc1', cas: [{ genre: 'vide', texte: 'Sans taux.' }, { genre: 'max', borne: 1, texte: 'Taux bas ({calc1}).' }, { genre: 'audela', texte: 'Taux haut ({calc1}).' }] }] }, extra);

describe('4c · F — l\'évaluation : la phrase enregistrée porte la valeur', () => {
    it('F.a mode simple : le décompte, le palier et la table portent la valeur ; la note est celle du calcul de la note', () => {
        const h = evaluer(A1());
        simple(h, 3, 600);
        const da = h.ec.donneesAlgorithmiques.a1;
        expect(da.retroaction).toBe('3 unités manquantes ; taux 0,5 pour 100. Tu fais en moyenne 1 unité manquante à chaque 200 calculs. Palier : 0,5. Taux bas (0,5).');
        expect(h.ecran.comm_a1.textContent).toBe(da.retroaction);
        expect(da.noteCalculee).toBe(14);   // 20 − 3 × 2 : le calcul pour les phrases n'y entre pas
        simple(h, 30, 600);
        expect(h.ec.donneesAlgorithmiques.a1.retroaction).toMatch(/taux 5 pour 100\..*Taux haut \(5\)\.$/);
    });

    it('F.b mode catégories : la valeur suit le compte pondéré des codes (comme la note), le compte brut à côté', () => {
        const a1 = A1({ sousCriteres: [{ id: 'SC1', code: '1', nom: 'Unité', ponderation: 1, retroaction: '' }, { id: 'SC4', code: '4', nom: 'Chiffre', ponderation: 3, retroaction: '' }] });
        const h = evaluer(a1);
        categories(h, '1;4;4', 700);   // compte brut 3, compte pondéré 7 : 7 ÷ 700 × 100 = 1
        const da = h.ec.donneesAlgorithmiques.a1;
        expect(da.retroaction).toMatch(/^3 unités manquantes ; taux 1 pour 100\./);
        expect(da.retroaction).toMatch(/Palier : 1\. Taux bas \(1\)\./);
        expect(da.noteCalculee).toBe(6);   // 20 − 7 × 2
    });

    it('F.c un critère SANS calcul pour les phrases écrit la phrase d\'hier, à l\'octet ; un calcul que rien ne lit n\'y change rien', () => {
        const hier = A1({ calculs: undefined, calculsProchain: undefined, tablesCas: undefined,
            enonces: { decompte: '{erreurs} {nomErreurs} sur {mots} {nomMots}{points}.' },
            paliersProjection: [{ cle: 'a', libelle: 'A', ratioMax: null, texte: 'Palier atteint : {palier}.', texteAide: '' }, { cle: 'z', libelle: 'Z', sansErreur: true, texte: 'Aucune.' }] });
        const attendu = (e, m) => {
            const E = W.enoncesAlgo, P = W.projectionAlgo;
            const proj = P.calculer(hier, { erreurs: e, mots: m });
            return E.enonce(hier, 'decompte', { erreurs: e, mots: m, points: E.mentionPonderee(e, e) }) + (proj.applicable ? ' ' + proj.texte : '');
        };
        [[0, 600], [1, 600], [3, 600], [40, 600], [3, 0]].forEach(([e, m]) => {
            const h = evaluer(hier);
            simple(h, e, m);
            expect(h.ecran.comm_a1.textContent, `${e} / ${m}`).toBe(attendu(e, m));
            const avecUnCalcul = evaluer(Object.assign(clone(hier), { calculs: [phrases()], calculsProchain: 2 }));
            simple(avecUnCalcul, e, m);
            expect(avecUnCalcul.ecran.comm_a1.textContent).toBe(h.ecran.comm_a1.textContent);
            expect(avecUnCalcul.ec.donneesAlgorithmiques.a1).toEqual(h.ec.donneesAlgorithmiques.a1);
        });
    });

    it('F.d un texte qui lit un calcul absent (import d\'une version qui l\'a perdu) : aucun « {calc1} » sur la phrase', () => {
        const h = evaluer(A1({ calculs: undefined, tablesCas: undefined }));
        simple(h, 3, 600);
        expect(h.ec.donneesAlgorithmiques.a1.retroaction).toBe('3 unités manquantes ; taux pour 100. Tu fais en moyenne 1 unité manquante à chaque 200 calculs. Palier :.');
        expect(h.ec.donneesAlgorithmiques.a1.retroaction).not.toMatch(/[{}]/);
    });
});

/* ------------------------------------------------------------ G. le transport */

describe('4c · G — un texte et une table qui lisent un calcul voyagent avec lui', () => {
    const grille = () => ({ id: 'G4C', nom: 'Grille fictive 4c', criteres: [Object.assign({ id: 'a1' }, A1())],
        metadata_cc: { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] } });

    it('G.a export → import : intacts ; une table qui lit un calcul introuvable est écartée avec lui, jamais devinée ; l\'ordre du schéma', () => {
        const wie = chargerScript('js/note-pourcentage.js');
        ['js/evaluation-formules.js', 'js/evaluation-enonces.js', 'js/evaluation-projection.js', 'js/codes-annotation.js', 'js/tables-cas-algo.js', 'js/import-export.js']
            .forEach((f) => chargerScript(f, {}, wie));
        const g = grille();
        const importee = wie.assainirObjet(clone(g), wie.SCHEMAS_IMPORT.grille).criteres[0];
        expect(importee.calculs).toEqual(g.criteres[0].calculs);
        expect(importee.tablesCas).toEqual(g.criteres[0].tablesCas);
        expect(importee.enonces).toEqual(g.criteres[0].enonces);
        // Le calcul illisible (une donnée inconnue) : écarté, et la table qui le lit avec lui ; le texte garde son jeton, qui partira au rendu.
        const abime = clone(g);
        abime.criteres[0].calculs[0].jetons[0] = d('inconnue');
        const r = wie.assainirObjet(abime, wie.SCHEMAS_IMPORT.grille).criteres[0];
        expect(r).not.toHaveProperty('calculs');
        expect(r).not.toHaveProperty('tablesCas');
        expect(W.enoncesAlgo.enonce(r, 'decompte', { erreurs: 3, mots: 600 })).toBe('3 unités manquantes ; taux pour 100.');
        // L'ordre : `calculs` est relu AVANT `tablesCas` (sans quoi aucune table « Selon » un calcul n'entrerait jamais).
        const cles = Object.keys(wie.SCHEMAS_IMPORT.grille.criteres.schema);
        expect(cles.indexOf('calculs')).toBeLessThan(cles.indexOf('tablesCas'));
        // Le nom d'un calcul est un texte de l'enseignant·e : assaini.
        const piege = clone(g);
        piege.criteres[0].calculs[0].nom = '<img src=x onerror=alert(1)>Taux';
        expect(wie.assainirObjet(piege, wie.SCHEMAS_IMPORT.grille).criteres[0].calculs[0].nom).not.toContain('<img');
    });

    it('G.b partage → réception : intacts ; une table qui lit un calcul introuvable fait refuser le paquet', () => {
        const dbP = { getSync: (k, dft) => (dft !== undefined ? dft : null), setSync() {} };
        const wp = chargerScript('js/note-pourcentage.js');
        ['js/evaluation-formules.js', 'js/evaluation-enonces.js', 'js/evaluation-projection.js', 'js/codes-annotation.js', 'js/tables-cas-algo.js', 'js/partage-schemas.js']
            .forEach((f) => chargerScript(f, {}, wp));
        ['js/partage-validation.js', 'js/partage-format.js', 'js/partage-import.js'].forEach((f) => chargerScript(f, { db: dbP }, wp));
        const g = grille();
        const paquet = wp.partageFormat.construirePackage(g, { type: 'grille', identiteAuteur: 'Auteur fictif' });
        const verdict = wp.partageValidation.validerPackage(clone(paquet));
        expect(verdict.erreurs).toEqual([]);
        const recue = wp.partageImport.prefixerEntites(verdict.packageNettoye, 'IMP_banc').parType.grille[0].criteres[0];
        expect(recue.calculs).toEqual(g.criteres[0].calculs);
        expect(recue.tablesCas).toEqual(g.criteres[0].tablesCas);
        const sansCalcul = clone(paquet);
        delete sansCalcul.entites.grilles[0].criteres[0].calculs;
        const refus = wp.partageValidation.validerPackage(sansCalcul);
        expect(refus.valide).toBe(false);
        expect(refus.erreurs.map((e) => e.message)).toContain('tables de cas : table 1 illisible');
        const entiere = clone(paquet);
        entiere.entites.grilles[0].criteres[0].calculs[0].cas = { etendue: 'entiere' };
        expect(wp.partageValidation.validerPackage(entiere).valide).toBe(false);
    });
});

/*
 * BREAK-TESTS DU LOT (27 oct. 2026 ; chacun restauré, `cmp` identique) — la mutation, puis ce qui rougit :
 *   · la valeur bornée à la pondération (`_valeurAvec`)                         → A.a, A.d
 *   · « La note entière » admise pour un calcul des phrases (`_choixLisible`)    → A.b, G.b
 *   · un calcul des phrases accepté pour la note (`_normaliserCompose`)          → A.c
 *   · « Garder » pour les phrases qui choisit aussi la note (`garderCalcul`)      → A.d
 *   · le jeton orphelin laissé en place (`remplirCalculs`)                       → B.a, B.b, B.c, B.d, F.d, G.a
 *   · un texte sans jeton retouché (`remplirCalculs` qui trime)                  → B.a
 *   · les tables sans les jetons des calculs (`_jetons`)                         → B.d, F.a, F.b
 *   · une table « Selon » un calcul jugée illisible (`_estCalcul`)               → C.a, C.b, D.a, F.a, F.b, G.a, G.b
 *   · `calculLu` toujours faux                                                  → D.a, D.b, D.c
 *   · la palette qui offre le bloc dans le bilan (`reperesDeZone`)               → E.b
 *   · le mode catégories qui passe le compte brut pour le pondéré                → F.b
 *   · l'import qui relit les tables sans le critère (`_assainirTablesCas`)       → G.a
 *   · le partage qui relit les tables sans le critère (`refusStructure`)         → G.b
 */
