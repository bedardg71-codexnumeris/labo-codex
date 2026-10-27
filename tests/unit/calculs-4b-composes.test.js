/**
 * Étape 4b du critère algorithmique (27 oct. 2026) — « Retoucher ce calcul » et « Composer ton propre calcul », pour la note.
 * Consigne : `plans de travail/CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4b.md`.
 *
 *   A. `assainirCalculs` et `refusCalculs` : jetons, clés, bornes, identifiants.
 *   B. La note : `perso:<id>` se résout dans `critere.calculs` ; introuvable ou illisible, AUCUNE note, jamais le repli.
 *   C. L'ÉQUIVALENCE DE « RETOUCHER » (§ 3.7) : la copie gardée sans changement redonne la note du calcul tout fait, sur la
 *      grille de valeurs du banc de 4a (1e-9, même niveau sur deux échelles IDME).
 *   D. « Quand une donnée vaut 0 » d'un calcul composé : ses départs, ses choix, jamais « calculer » une division.
 *   E. Le compte brut (§ 3.4) : un calcul composé le lit ; les trois tout faits n'en lisent rien ; les appelants le passent.
 *   F. « Garder » (ses messages, rien d'écrit sur un refus, l'identifiant jamais réemployé) et « Retirer » (refusé pour le
 *      calcul de la note).
 *   G. L'aller-retour : export → import, partage → réception.
 *   H. Le composeur (le nombre à la virgule) et l'atelier (le nom du calcul dans la chaîne).
 *
 * BREAK-TESTS (faits le 27 oct. 2026, chacun restauré, `cmp` identique) :
 *   · `_normaliserCompose` rendu au modèle historique pour un calcul introuvable → B.b rougit ;
 *   · `brouillonRetouche` sans le réglage (le nombre posé à 1) → C.a rougit ;
 *   · le nom sans sa borne de 80 caractères → A.b rougit ;
 *   ⚠ `_jetonCompose` qui garderait les réglages (`p`) laisse le banc VERT, mesuré : l'évaluation sur la copie d'essai
 *     (sans réglage, un `p` vaut NaN) refuse déjà ce calcul. La garde du jeton double celle de l'évaluation.
 *   · `retirerCalcul` sans sa garde → F.d rougit ;
 *   · `_prochainNumero` sans `calculsProchain` → F.c rougit ;
 *   · la règle `refusCalculs` débranchée de partage-validation → G.b rougit.
 */
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const F = require(path.join(racine, 'js/evaluation-formules.js'));
const K = require(path.join(racine, 'js/composeur-calcul.js'));
const A = require(path.join(racine, 'js/atelier-algo.js'));

const win = { addEventListener() {}, removeEventListener() {} };
chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau: () => 0 }, win);
const EN_99 = [{ code: 'I', min: 0, max: 64.99 }, { code: 'D', min: 65, max: 74.99 }, { code: 'M', min: 75, max: 84.99 }, { code: 'E', min: 85, max: 100 }];
const ENTIERES = [{ code: 'I', min: 0, max: 59 }, { code: 'D', min: 60, max: 74 }, { code: 'M', min: 75, max: 89 }, { code: 'E', min: 90, max: 100 }];
const niveau = (pct, niveaux) => win.niveauDuPourcentage(pct, niveaux, { sansNiveauZero: true });

const PONDERATIONS = [1, 20, 30, 100];
const COMPTES = [0, 0.5, 1, 2, 2.5, 3, 4, 5, 7, 10, 12, 15, 20, 25, 30, 40, 45, 50, 59, 60];
const ETENDUES = [0, 1, 12, 60, 500, 600, 10000];

const clone = (x) => JSON.parse(JSON.stringify(x));
const d = (k) => ({ t: 'd', k });
const o = (v) => ({ t: 'o', v });
const n = (v) => ({ t: 'n', v });
/** « Pondération du critère − Compte pondéré des X × 3 », le calcul composé de la consigne (§ 7). */
const MOINS_TROIS = [d('ponderation'), o('−'), d('comptePondere'), o('×'), n(3)];
const calcul = (extra) => Object.assign({ id: 'calc1', nom: 'Moins trois', sert: 'note', jetons: clone(MOINS_TROIS), cas: {} }, extra);
const critere = (extra) => Object.assign({ id: 'C1', type: 'algorithmique', ponderation: 20, modeleFormule: 'penalite_par_erreur',
    paramsFormule: { pointsParErreur: 1 }, noms: { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } } }, extra);

describe('4b · A — les calculs composés se lisent : assainir et refuser', () => {
    it('A.a un calcul lisible est gardé tel quel ; un réglage (`p`), une donnée ou une opération inconnues le rendent illisible', () => {
        expect(F.assainirCalculs([calcul()])).toEqual([calcul()]);
        expect(F.assainirCalculs([calcul({ jetons: [d('ponderation'), o('−'), { t: 'p', k: 'pointsParErreur' }] })])).toBeUndefined();
        expect(F.assainirCalculs([calcul({ jetons: [d('ponderation'), o('−'), d('inconnue')] })])).toBeUndefined();
        expect(F.assainirCalculs([calcul({ jetons: [d('ponderation'), o('^'), n(2)] })])).toBeUndefined();
        expect(F.assainirCalculs([calcul({ jetons: [d('ponderation'), o('−'), n(Infinity)] })])).toBeUndefined();
    });

    it('A.b les clés : un identifiant `calcN`, un nom (80 caractères au plus, espaces retirés), `sert: note` ; dix calculs, soixante jetons', () => {
        expect(F.assainirCalculs([calcul({ id: 'calc0' })])).toBeUndefined();
        expect(F.assainirCalculs([calcul({ id: 'x1' })])).toBeUndefined();
        expect(F.assainirCalculs([calcul({ nom: '   ' })])).toBeUndefined();
        // ↻ Étape 4c (27 oct.) : `sert: 'phrases'` se lit désormais (calculs-4c-phrases.test.js) ; un autre `sert`, jamais.
        expect(F.assainirCalculs([calcul({ sert: 'autre' })])).toBeUndefined();
        expect(F.assainirCalculs([calcul({ nom: '  Mon taux  ' })])[0].nom).toBe('Mon taux');
        expect(F.assainirCalculs([calcul({ nom: 'x'.repeat(200) })])[0].nom).toHaveLength(80);
        const long = [d('ponderation')];
        for (let i = 0; i < 30; i++) long.push(o('+'), n(1));
        expect(F.assainirCalculs([calcul({ jetons: long })])).toBeUndefined();   // 61 jetons
        const onze = Array.from({ length: 11 }, (_, i) => calcul({ id: 'calc' + (i + 1) }));
        expect(F.assainirCalculs(onze)).toHaveLength(10);
        expect(F.assainirCalculs([calcul(), calcul({ nom: 'double' })])).toHaveLength(1);
        expect(F.assainirCalculs({})).toBeNull();
        expect(F.assainirCalculs(undefined)).toBeUndefined();
    });

    it('A.c un calcul qui ne s’évalue pas sur la copie d’essai, ou qui divise par le nombre 0, est illisible', () => {
        expect(F.assainirCalculs([calcul({ jetons: [d('ponderation'), o('−')] })])).toBeUndefined();
        expect(F.assainirCalculs([calcul({ jetons: [{ t: '(' }, d('ponderation')] })])).toBeUndefined();
        expect(F.assainirCalculs([calcul({ jetons: [d('ponderation'), o('÷'), n(0)] })])).toBeUndefined();
        // Diviser par une DONNÉE est permis : « vaut 0 » dit alors ce que vaut la note.
        expect(F.assainirCalculs([calcul({ jetons: [d('ponderation'), o('÷'), d('etendue')] })])).toHaveLength(1);
    });

    it('A.d le PARTAGE refuse, avec sa raison, au lieu d’écarter', () => {
        expect(F.refusCalculs(undefined)).toBe('');
        expect(F.refusCalculs([calcul()])).toBe('');
        expect(F.refusCalculs({})).toBe('structure illisible');
        expect(F.refusCalculs([calcul({ jetons: [d('ponderation'), o('÷'), n(0)] })])).toBe('calcul illisible');
        expect(F.refusCalculs([calcul(), calcul()])).toBe('identifiant en double : calc1');
        expect(F.refusCalculs(Array.from({ length: 11 }, (_, i) => calcul({ id: 'calc' + (i + 1) })))).toBe('plus de 10 calculs');
        expect(F.refusCalculs([calcul({ cas: { comptePondere: 'peut-etre' } })])).toBe('choix illisible dans calc1');
        expect(F.refusCalculs([calcul({ cas: [] })])).toBe('choix illisibles dans calc1');
    });
});

describe('4b · B — la note d’un calcul composé, et jamais un calcul deviné', () => {
    it('B.a `perso:<id>` se résout dans `critere.calculs` : la note, la ligne chiffrée, les pastilles', () => {
        const c = critere({ modeleFormule: 'perso:calc1', calculs: [calcul()] });
        const r = F.calculer(c, { ponderation: 20, erreurs: 3, mots: 100 });
        expect(r).toMatchObject({ applicable: true, note: 11, modeleId: 'perso:calc1' });
        expect(F.libelleChiffre(c, { ponderation: 20, erreurs: 3, mots: 100 })).toBe('Note = 20 − 3 × 3 = 11 / 20');
        expect(F.blocs(c).map((b) => b.texte)).toEqual(['Pondération du critère', '−', 'Compte pondéré des unités manquantes', '×', '3']);
        expect(F.normaliser(c).modele.court).toBe('« Moins trois »');
    });

    it('B.b introuvable ou illisible : aucune note (`calcul-introuvable`), aucune ligne, aucune pastille — jamais le modèle historique', () => {
        [critere({ modeleFormule: 'perso:calc9', calculs: [calcul()] }),
            critere({ modeleFormule: 'perso:calc1' }),
            critere({ modeleFormule: 'perso:calc1', calculs: [calcul({ jetons: [d('ponderation'), o('÷'), n(0)] })] })].forEach((c) => {
            const r = F.calculer(c, { ponderation: 20, erreurs: 3, mots: 100 });
            expect(r.applicable).toBe(false);
            expect(r.raison).toBe('calcul-introuvable');
            expect(F.libelleChiffre(c, { ponderation: 20, erreurs: 3, mots: 100 })).toBe('');
            expect(F.ligneResultat(c, { ponderation: 20, erreurs: 3, mots: 100 }, 'conditionnel')).toBe('');
            expect(F.blocs(c)).toEqual([]);
            expect(F.normaliser(c).herite).toBe(false);
        });
    });

    it('B.c la note s’arrête à la pondération par le haut, pas relevée à 0 ; le pourcentage est borné', () => {
        const c = critere({ modeleFormule: 'perso:calc1', calculs: [calcul({ jetons: [d('ponderation'), o('+'), n(5)] })] });
        expect(F.calculer(c, { ponderation: 20, erreurs: 0, mots: 1 })).toMatchObject({ note: 20, brut: 25, pctBorne: 100 });
        const bas = F.calculer(critere({ modeleFormule: 'perso:calc1', calculs: [calcul()] }), { ponderation: 20, erreurs: 10, mots: 1 });
        expect(bas).toMatchObject({ note: -10, pctBorne: 0 });
    });

    it('B.d `paramsFormule` reste intact : revenir au calcul tout fait retrouve son réglage', () => {
        const c = critere({ paramsFormule: { pointsParErreur: 4 } });
        F.garderCalcul(c, { nom: 'Moins trois', jetons: clone(MOINS_TROIS), cas: {} });
        expect(c.paramsFormule).toEqual({ pointsParErreur: 4 });
        F.appliquerAuCritere(c, 'penalite_par_erreur', c.paramsFormule);
        expect(F.normaliser(c).params.pointsParErreur).toBe(4);
    });
});

describe('4b · C — l’équivalence de « Retoucher ce calcul » (§ 3.7)', () => {
    it('C.a gardée sans changement, la copie redonne la note du calcul tout fait : grille de valeurs du banc de 4a, 1e-9, même niveau', () => {
        let cas = 0;
        F.listerModeles().forEach((m) => {
            const p = m.parametres[0];
            const casZero = [undefined].concat(F.casAOffrir({ type: 'algorithmique', modeleFormule: m.id }).rangees
                .flatMap((r) => r.choix.map((x) => ({ [m.id]: { [r.donnee]: x.valeur } }))));
            [p.defaut, p.min, p.max].forEach((v) => casZero.forEach((cz) => {
                const toutFait = { type: 'algorithmique', ponderation: 20, modeleFormule: m.id, paramsFormule: { [p.cle]: v }, casZero: cz };
                const retouche = clone(toutFait);
                const res = F.garderCalcul(retouche, F.brouillonRetouche(toutFait, m.id));
                expect(res.ok, m.id).toBe(true);
                PONDERATIONS.forEach((ponderation) => COMPTES.forEach((erreurs) => ETENDUES.forEach((mots) => {
                    const donnees = { ponderation, erreurs, mots };
                    const a = F.calculer(toutFait, donnees), b = F.calculer(retouche, donnees);
                    const ici = m.id + ' ' + v + ' ' + JSON.stringify(cz) + ' ' + JSON.stringify(donnees);
                    expect(b.applicable, ici).toBe(a.applicable);
                    expect(b.raison, ici).toBe(a.raison);
                    if (a.applicable) {
                        expect(Math.abs(b.note - a.note), ici).toBeLessThan(1e-9);
                        expect(niveau(b.pctBorne, EN_99), ici).toBe(niveau(a.pctBorne, EN_99));
                        expect(niveau(b.pctBorne, ENTIERES), ici).toBe(niveau(a.pctBorne, ENTIERES));
                    }
                    cas++;
                })));
            }));
        });
        expect(cas).toBeGreaterThan(5000);
    });

    it('C.b le brouillon de « Retoucher » : le nom, les blocs (le réglage devenu un nombre), les choix « vaut 0 » ; rien d’écrit', () => {
        const c = critere({ paramsFormule: { pointsParErreur: 2 }, casZero: { penalite_par_erreur: { comptePondere: 'entiere' } } });
        const avant = clone(c);
        expect(F.brouillonRetouche(c, 'penalite_par_erreur')).toEqual({
            id: null, nom: 'Mon calcul, d’après « Pénalité fixe »', sert: 'note',   // ↻ 4c : le brouillon dit ce qu'il sert
            jetons: [d('ponderation'), o('−'), d('comptePondere'), o('×'), n(2)], cas: { comptePondere: 'entiere' }
        });
        expect(c).toEqual(avant);
    });
});

describe('4b · D — « Quand une donnée vaut 0 », pour un calcul composé', () => {
    const RAPPORT = [d('ponderation'), o('×'), { t: '(' }, d('etendue'), o('÷'), d('compte'), { t: ')' }, o('÷'), n(10)];
    it('D.a les départs : « Aucune note » pour une donnée qui divise, « Calculer normalement » sinon ; jamais « calculer » une division', () => {
        const c = critere({ modeleFormule: 'perso:calc1', calculs: [calcul({ jetons: RAPPORT })] });
        const off = F.casAOffrir(c);
        expect(off.rangees.map((r) => [r.donnee, r.actuel])).toEqual([['etendue', 'calcul'], ['compte', 'aucune']]);
        expect(off.rangees[1].choix.map((x) => x.valeur)).toEqual(['aucune', 'entiere', 'zero']);
        expect(F.calculer(c, { ponderation: 20, erreurs: 0, compte: 0, mots: 100 })).toMatchObject({ applicable: false, attend: 'compte' });
    });

    it('D.b les quatre choix, écrits dans le `cas` du calcul (égal au départ, l’entrée part)', () => {
        const c = critere({ modeleFormule: 'perso:calc1', calculs: [calcul({ jetons: RAPPORT })] });
        expect(F.appliquerCasZero(c, 'compte', 'entiere')).toBe(true);
        expect(c.calculs[0].cas).toEqual({ compte: 'entiere' });
        expect(c).not.toHaveProperty('casZero');
        expect(F.calculer(c, { ponderation: 20, erreurs: 0, compte: 0, mots: 100 })).toMatchObject({ note: 20, issue: 'entiere' });
        expect(F.appliquerCasZero(c, 'compte', 'zero')).toBe(true);
        expect(F.calculer(c, { ponderation: 20, erreurs: 0, compte: 0, mots: 100 }).note).toBe(0);
        expect(F.appliquerCasZero(c, 'compte', 'calcul')).toBe(false);
        expect(F.appliquerCasZero(c, 'compte', 'aucune')).toBe(true);
        expect(c.calculs[0].cas).toEqual({});
    });

    it('D.c deux critères algorithmiques : chacun ses calculs', () => {
        const a = critere({ id: 'A', modeleFormule: 'perso:calc1', calculs: [calcul()] });
        const b = critere({ id: 'B', modeleFormule: 'perso:calc1', calculs: [calcul({ jetons: [d('ponderation'), o('−'), d('comptePondere')] })] });
        expect(F.calculer(a, { ponderation: 20, erreurs: 2, mots: 1 }).note).toBe(14);
        expect(F.calculer(b, { ponderation: 20, erreurs: 2, mots: 1 }).note).toBe(18);
    });
});

describe('4b · E — le compte brut', () => {
    it('E.a un calcul composé lit le compte brut à côté du compte pondéré ; les trois tout faits n’en lisent rien', () => {
        const c = critere({ modeleFormule: 'perso:calc1', calculs: [calcul({ jetons: [d('ponderation'), o('−'), d('compte'), o('−'), d('comptePondere')] })] });
        expect(F.calculer(c, { ponderation: 20, erreurs: 3.5, compte: 2, mots: 1 }).note).toBe(14.5);
        F.listerModeles().forEach((m) => expect(m.jetons.some((j) => j.k === 'compte'), m.id).toBe(false));
        // Sans compte passé, le compte brut vaut le compte pondéré (l'appelant d'avant 4b).
        expect(F.calculer(c, { ponderation: 20, erreurs: 3, mots: 1 }).note).toBe(14);
    });

    it('E.b les appelants le passent : évaluation (deux modes), copie fictive, simulation, tables de cas', () => {
        const fs = require('node:fs');
        const lire = (f) => fs.readFileSync(path.join(racine, f), 'utf8');
        const calc = lire('js/evaluation-calcul.js');
        expect(calc).toContain('compte: erreurs,   // étape 4b');
        expect(calc).toContain('compte: codesSousCriteres.length');
        expect(calc).toContain('{ ponderation, erreurs: erreursFormule, compte: erreurs, mots }');
        expect(lire('js/atelier-algo.js').match(/compte: copie\.erreurs/g).length).toBe(3);
        expect(lire('js/miroir-algo.js')).toContain('copie.erreursFormule, copie.mots, copie.erreurs');
        expect(lire('js/tables-cas-algo.js')).toContain('if (compte !== undefined) d.compte = compte');
    });
});

describe('4b · F — « Garder » et « Retirer »', () => {
    it('F.a les messages de « Garder » ; sur un refus, rien n’est écrit', () => {
        const c = critere();
        const avant = clone(c);
        expect(F.garderCalcul(c, { nom: ' ', jetons: clone(MOINS_TROIS) }).message).toBe('Donne un nom à ton calcul.');
        expect(F.garderCalcul(c, { nom: 'x', jetons: [] }).message).toBe('Le calcul est vide.');
        expect(F.garderCalcul(c, { nom: 'x', jetons: [d('ponderation'), o('−')] }).message).toBe('Le calcul n’est pas complet : il manque une donnée ou un nombre.');
        expect(F.garderCalcul(c, { nom: 'x', jetons: [d('ponderation'), d('compte')] }).message).toBe('Deux opérations ou deux données se suivent.');
        expect(F.garderCalcul(c, { nom: 'x', jetons: [{ t: '(' }, d('ponderation')] }).message).toBe('Une parenthèse n’est pas fermée.');
        expect(F.garderCalcul(c, { nom: 'x', jetons: [d('ponderation'), o('÷'), n(0)] }).message).toBe('Le calcul divise par 0.');
        expect(c).toEqual(avant);
    });

    it('F.b « Garder ce calcul » : sa carte, choisie pour la note ; « Garder les changements » : le même identifiant', () => {
        const c = critere();
        const r = F.garderCalcul(c, { nom: '  Moins trois ', jetons: clone(MOINS_TROIS), cas: {} });
        expect(r).toEqual({ ok: true, id: 'calc1', message: 'Calcul « Moins trois » gardé : il donne maintenant la note.' });
        expect(c.modeleFormule).toBe('perso:calc1');
        expect(c.calculs).toEqual([calcul({ cas: {} })]);
        const b = F.brouillonDuCalcul(c, 'calc1');
        b.jetons[4] = n(2);
        expect(F.garderCalcul(c, b).id).toBe('calc1');
        expect(c.calculs).toHaveLength(1);
        expect(F.calculer(c, { ponderation: 20, erreurs: 3, mots: 1 }).note).toBe(14);
    });

    it('F.c un identifiant ne se réemploie pas, même après un retrait', () => {
        const c = critere();
        F.garderCalcul(c, { nom: 'Un', jetons: clone(MOINS_TROIS) });
        F.garderCalcul(c, { nom: 'Deux', jetons: clone(MOINS_TROIS) });
        expect(c.modeleFormule).toBe('perso:calc2');
        F.choisirCalculCompose(c, 'perso:calc1');
        expect(F.retirerCalcul(c, 'calc2').ok).toBe(true);
        expect(F.garderCalcul(c, { nom: 'Trois', jetons: clone(MOINS_TROIS) }).id).toBe('calc3');
    });

    it('F.d « Retirer » : refusé pour le calcul qui donne la note ; un autre se retire', () => {
        const c = critere();
        F.garderCalcul(c, { nom: 'Un', jetons: clone(MOINS_TROIS) });
        expect(F.retirerCalcul(c, 'calc1')).toEqual({ ok: false, message: 'Ce calcul donne la note : choisis d’abord un autre calcul.' });
        expect(c.calculs).toHaveLength(1);
        F.appliquerAuCritere(c, 'penalite_par_erreur', c.paramsFormule);
        expect(F.retirerCalcul(c, 'calc1').ok).toBe(true);
        expect(c).not.toHaveProperty('calculs');
        expect(F.MESSAGES_COMPOSE.confirmerRetrait('Un')).toBe('Retirer le calcul « Un » ? Ses blocs seront perdus.');
    });

    it('F.e dix calculs au plus', () => {
        const c = critere();
        for (let i = 0; i < 10; i++) expect(F.garderCalcul(c, { nom: 'n' + i, jetons: clone(MOINS_TROIS) }).ok).toBe(true);
        expect(F.garderCalcul(c, { nom: 'onze', jetons: clone(MOINS_TROIS) }).message).toBe('Ce critère a déjà 10 calculs : retires-en un d’abord.');
    });

    it('F.f choisir un calcul composé : seulement s’il existe', () => {
        const c = critere({ calculs: [calcul()] });
        expect(F.choisirCalculCompose(c, 'perso:calc9')).toBe(false);
        expect(c.modeleFormule).toBe('penalite_par_erreur');
        expect(F.choisirCalculCompose(c, 'perso:calc1')).toBe(true);
        expect(c.modeleFormule).toBe('perso:calc1');
    });
});

describe('4b · G — les calculs voyagent avec le critère : export → import, partage → réception', () => {
    const grille = () => ({
        id: 'G4B', nom: 'Grille fictive 4b', criteres: [
            { id: 'C1', nom: 'Unités et calculs', type: 'algorithmique', ponderation: 20, modeleFormule: 'perso:calc2', paramsFormule: { pointsParErreur: 2 },
                calculs: [calcul({ cas: { comptePondere: 'zero' } }), calcul({ id: 'calc2', nom: 'Moins deux', jetons: [d('ponderation'), o('−'), d('comptePondere'), o('×'), n(2.5)] })],
                calculsProchain: 4 },
            { id: 'C2', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, modeleFormule: 'penalite_par_erreur', paramsFormule: { pointsParErreur: 1 } }
        ],
        metadata_cc: { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] }
    });

    it('G.a export → import : les calculs intacts ; un calcul illisible écarté ; s’il donnait la note, plus de note', () => {
        const wie = chargerScript('js/evaluation-formules.js');
        chargerScript('js/import-export.js', {}, wie);
        const g = grille();
        const importee = wie.assainirObjet(clone(g), wie.SCHEMAS_IMPORT.grille);
        expect(importee.criteres[0].calculs).toEqual(g.criteres[0].calculs);
        expect(importee.criteres[0].calculsProchain).toBe(4);
        expect(importee.criteres[0].modeleFormule).toBe('perso:calc2');
        expect(F.calculer(importee.criteres[0], { ponderation: 20, erreurs: 2, mots: 1 }).note).toBe(15);
        expect(importee.criteres[1]).not.toHaveProperty('calculs');
        const abime = clone(g);
        abime.criteres[0].calculs[1].jetons.push(o('÷'));
        const r = wie.assainirObjet(abime, wie.SCHEMAS_IMPORT.grille).criteres[0];
        expect(r.calculs.map((c) => c.id)).toEqual(['calc1']);
        expect(F.calculer(r, { ponderation: 20, erreurs: 2, mots: 1 })).toMatchObject({ applicable: false, raison: 'calcul-introuvable' });
        const nomPiege = clone(g);
        nomPiege.criteres[0].calculs[0].nom = '<img src=x onerror=alert(1)>Taux';
        const assaini = wie.assainirObjet(nomPiege, wie.SCHEMAS_IMPORT.grille).criteres[0].calculs[0].nom;
        expect(assaini).not.toContain('<img');
    });

    it('G.b partage → réception : les calculs intacts ; un calcul illisible fait refuser le paquet, avec sa raison', () => {
        const dbP = { getSync: (k, dft) => (dft !== undefined ? dft : null), setSync() {} };
        const wp = chargerScript('js/evaluation-formules.js');
        chargerScript('js/tables-cas-algo.js', {}, wp);
        chargerScript('js/partage-schemas.js', {}, wp);
        chargerScript('js/partage-validation.js', { db: dbP }, wp);
        chargerScript('js/partage-format.js', { db: dbP }, wp);
        chargerScript('js/partage-import.js', { db: dbP }, wp);
        const g = grille();
        const paquet = wp.partageFormat.construirePackage(g, { type: 'grille', identiteAuteur: 'Auteur fictif' });
        const verdict = wp.partageValidation.validerPackage(clone(paquet));
        expect(verdict.erreurs).toEqual([]);
        const recue = wp.partageImport.prefixerEntites(verdict.packageNettoye, 'IMP_banc').parType.grille[0];
        expect(recue.criteres[0].calculs).toEqual(g.criteres[0].calculs);
        expect(recue.criteres[0].modeleFormule).toBe('perso:calc2');
        expect(recue.criteres[0].calculsProchain).toBe(4);
        const abime = clone(paquet);
        abime.entites.grilles[0].criteres[0].calculs[0].jetons = [d('ponderation'), o('÷'), n(0)];
        const refus = wp.partageValidation.validerPackage(abime);
        expect(refus.valide).toBe(false);
        expect(refus.erreurs.map((e) => e.message)).toContain('calculs composés : calcul illisible');
        const inconnu = clone(paquet);
        inconnu.entites.grilles[0].criteres[0].calculs[0].formule = 'eval(1)';
        expect(wp.partageValidation.validerPackage(inconnu).valide).toBe(false);
    });
});

describe('4b · H — le composeur et la chaîne d’étapes', () => {
    it('H.a « Poser ce nombre » accepte la virgule ; un texte qui n’est pas un nombre ne pose rien', () => {
        expect(K.lireNombre('2,5')).toBe(2.5);
        expect(K.lireNombre(' 100 ')).toBe(100);
        expect(K.lireNombre('-3')).toBe(-3);
        ['', 'abc', '2,5,1', '1e3', null].forEach((x) => expect(K.lireNombre(x), String(x)).toBeNull());
    });

    it('H.b le brouillon vit par critère, et disparaît après « Garder » ou « Annuler »', () => {
        const k1 = K.cle('G', { id: 'A' }, 0), k2 = K.cle('G', { id: 'B' }, 1);
        K.brouillonDe(k1).nom = 'Un';
        expect(K.brouillonDe(k2).nom).toBe('');
        expect(K.brouillonDe(k1).nom).toBe('Un');
        K.fermer(k1);
        expect(K.brouillonDe(k1).nom).toBe('');
    });

    it('H.c la chaîne : « « Moins trois », sur 20 » ; introuvable, l’étape est à régler', () => {
        const c = critere({ modeleFormule: 'perso:calc1', calculs: [calcul()] });
        const e = A.etapes(c, [c]).filter((x) => x.id === 'note')[0];
        expect(e.info).toBe('« Moins trois »');
        expect(e.resume).toBe('« Moins trois », sur 20');
        expect(e.reglee).toBe(true);
        const perdu = A.etapes(critere({ modeleFormule: 'perso:calc9' }), []).filter((x) => x.id === 'note')[0];
        expect(perdu.reglee).toBe(false);
        expect(perdu.info).toBe('calcul introuvable');
    });

    it('H.d aucune expression interprétée dans le composeur', () => {
        const src = require('node:fs').readFileSync(path.join(racine, 'js/composeur-calcul.js'), 'utf8');
        expect(src).not.toMatch(/\beval\s*\(|new Function|console\.log|\son[a-z]+=/);
    });
});
