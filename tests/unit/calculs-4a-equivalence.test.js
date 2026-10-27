/**
 * Étape 4a du critère algorithmique (27 oct. 2026) — les trois calculs tout faits, écrits en blocs.
 * Consigne : `plans de travail/CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4a.md`.
 *
 *   A. L'évaluateur : priorités, parenthèses, jetons mal formés, division par une donnée nulle,
 *      par un nombre nul. Aucune expression interprétée.
 *   B. LE BANC D'ÉQUIVALENCE (§ 3.3) : l'ancien calcul (les corps d'avant le lot, recopiés ICI comme
 *      référence, et nulle part ailleurs) et le nouveau rendent le même `applicable`, la même
 *      `raison`, une note à 1e-9 près et LE MÊME NIVEAU par `niveauDuPourcentage`.
 *   C. « Quand une donnée vaut 0 » : chaque choix, pour chaque modèle et chaque donnée ; les départs
 *      égaux au comportement d'avant ; un `casZero` illisible écarté.
 *   D. La ligne chiffrée et les pastilles, dans les deux disciplines fictives de l'ébauche.
 */
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const F = require(path.join(racine, 'js/evaluation-formules.js'));

const win = { addEventListener() {}, removeEventListener() {} };
chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau: () => 0 }, win);
// L'IDME d'origine (`niveauxDefaut`, bornes en « ,99 ») et le gabarit d'échelle neuve (bornes entières).
const EN_99 = [{ code: 'I', min: 0, max: 64.99 }, { code: 'D', min: 65, max: 74.99 }, { code: 'M', min: 75, max: 84.99 }, { code: 'E', min: 85, max: 100 }];
const ENTIERES = [{ code: 'I', min: 0, max: 59 }, { code: 'D', min: 60, max: 74 }, { code: 'M', min: 75, max: 89 }, { code: 'E', min: 90, max: 100 }];
const niveau = (pct, niveaux) => win.niveauDuPourcentage(pct, niveaux, { sansNiveauZero: true });

/* ------------------------------------------------------------------
   LA RÉFÉRENCE — les corps d'avant le lot (evaluation-formules.js à 99ac1eaf), mot pour mot.
   ------------------------------------------------------------------ */
const ANCIENS = {
    penalite_normalisee: { utiliseMots: true, calculer: (ctx) => ctx.ponderation - (ctx.erreurs / ctx.mots * ctx.params.facteurNormalisation) },
    ratio_cible: {
        utiliseMots: true,
        calculer: (ctx) => {
            if (ctx.erreurs <= 0) return ctx.ponderation;
            const ratioAtteint = ctx.mots / ctx.erreurs;
            return ctx.ponderation * Math.min(1, ratioAtteint / ctx.params.motsParErreurCible);
        }
    },
    penalite_par_erreur: { utiliseMots: false, calculer: (ctx) => ctx.ponderation - (ctx.erreurs * ctx.params.pointsParErreur) }
};
function ancienCalculer(critere, donnees) {
    const f = F.normaliser(critere);
    const ancien = ANCIENS[f.modeleId];
    const ponderation = Number(donnees && donnees.ponderation);
    const erreurs = Number(donnees && donnees.erreurs) || 0;
    const mots = Number(donnees && donnees.mots) || 0;
    if (!ponderation || isNaN(ponderation) || ponderation <= 0) return { applicable: false, raison: 'ponderation-absente' };
    if (ancien.utiliseMots && mots <= 0) return { applicable: false, raison: 'mots-absents' };
    const note = ancien.calculer({ ponderation, erreurs, mots, params: f.params });
    const pourcentage = (note / ponderation) * 100;
    return { applicable: true, raison: '', note, pourcentage, pctBorne: Math.max(0, Math.min(100, pourcentage)) };
}

const PONDERATIONS = [1, 20, 30, 100];
const COMPTES = [0, 0.5, 1, 2, 2.5, 3, 4, 5, 7, 10, 12, 15, 20, 25, 30, 40, 45, 50, 59, 60];
const ETENDUES = [0, 1, 12, 60, 500, 600, 10000];
function valeursDuParam(p) { return [p.defaut, p.min, p.max]; }

describe('4a · A — l’évaluateur', () => {
    const ctx = { donnees: { ponderation: 20, compte: 3, comptePondere: 3, etendue: 12 }, params: { x: 2 } };
    const d = (k) => ({ t: 'd', k }), n = (v) => ({ t: 'n', v }), o = (v) => ({ t: 'o', v });

    it('priorités usuelles : × et ÷ avant + et −, de gauche à droite', () => {
        expect(F.evaluer([n(2), o('+'), n(3), o('×'), n(4)], ctx)).toEqual({ v: 14 });
        expect(F.evaluer([n(20), o('−'), n(6), o('−'), n(4)], ctx)).toEqual({ v: 10 });
        expect(F.evaluer([n(12), o('÷'), n(3), o('÷'), n(2)], ctx)).toEqual({ v: 2 });
        expect(F.evaluer([n(12), o('÷'), n(3), o('×'), n(2)], ctx)).toEqual({ v: 8 });
    });
    it('les parenthèses passent devant', () => {
        expect(F.evaluer([{ t: '(' }, n(2), o('+'), n(3), { t: ')' }, o('×'), n(4)], ctx)).toEqual({ v: 20 });
        expect(F.evaluer([n(12), o('÷'), { t: '(' }, n(3), o('×'), n(2), { t: ')' }], ctx)).toEqual({ v: 2 });
    });
    it('les données et les réglages se lisent dans le contexte', () => {
        expect(F.evaluer([d('ponderation'), o('−'), d('comptePondere'), o('×'), { t: 'p', k: 'x' }], ctx)).toEqual({ v: 14 });
    });
    it('jetons mal formés : vide, deux opérations, deux données, parenthèse ouverte ou fermée de trop, jeton inconnu', () => {
        expect(F.evaluer([], ctx)).toEqual({ erreur: 'vide' });
        expect(F.evaluer([n(1), o('+'), o('×'), n(2)], ctx)).toEqual({ erreur: 'operation' });
        expect(F.evaluer([n(1), n(2)], ctx)).toEqual({ erreur: 'operation' });
        expect(F.evaluer([n(1), o('+')], ctx)).toEqual({ erreur: 'incomplet' });
        expect(F.evaluer([{ t: '(' }, n(1), o('+'), n(2)], ctx)).toEqual({ erreur: 'parentheses' });
        expect(F.evaluer([n(1), o('+'), n(2), { t: ')' }], ctx)).toEqual({ erreur: 'parentheses' });
        expect(F.evaluer([n(1), o('^'), n(2)], ctx)).toEqual({ erreur: 'jeton' });
        expect(F.evaluer([d('eval'), o('+'), n(2)], ctx)).toEqual({ erreur: 'jeton' });
        expect(F.evaluer([{ t: 'x' }], ctx)).toEqual({ erreur: 'jeton' });
    });
    it('division par une donnée nulle : dit laquelle ; par un nombre nul : « nombre »', () => {
        const zero = { donnees: { ponderation: 20, comptePondere: 0, etendue: 0 }, params: {} };
        expect(F.evaluer([n(1), o('÷'), d('etendue')], zero)).toEqual({ divZero: ['etendue'] });
        expect(F.evaluer([n(1), o('÷'), { t: '(' }, d('etendue'), o('÷'), n(2), { t: ')' }], zero)).toEqual({ divZero: ['etendue'] });
        expect(F.evaluer([n(1), o('÷'), n(0)], zero)).toEqual({ divZero: ['nombre'] });
    });
    it('aucune expression interprétée dans le registre', () => {
        const src = require('node:fs').readFileSync(path.join(racine, 'js/evaluation-formules.js'), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        expect(src).not.toMatch(/\beval\s*\(|new\s+Function|Function\s*\(/);
    });
    it('les diviseurs : direct, ou dans une parenthèse qui suit « ÷ »', () => {
        const m = (id) => F.obtenirModele(id).jetons;
        expect(F.diviseurs(m('penalite_normalisee'))).toEqual({ etendue: true });
        expect(F.diviseurs(m('ratio_cible'))).toEqual({ comptePondere: true });
        expect(F.diviseurs(m('penalite_par_erreur'))).toEqual({});
    });
});

describe('4a · B — le banc d’équivalence : l’ancien et le nouveau calcul', () => {
    it('même applicable, même raison, note à 1e-9 près, même niveau (deux échelles IDME), sur toute la grille de valeurs', () => {
        let cas = 0, ecartMax = 0;
        F.listerModeles().forEach((m) => {
            const p = m.parametres[0];
            valeursDuParam(p).forEach((v) => {
                const critere = { type: 'algorithmique', modeleFormule: m.id, paramsFormule: { [p.cle]: v } };
                PONDERATIONS.forEach((ponderation) => COMPTES.forEach((erreurs) => ETENDUES.forEach((mots) => {
                    const donnees = { ponderation, erreurs, mots };
                    const a = ancienCalculer(critere, donnees);
                    const b = F.calculer(critere, donnees);
                    const ici = m.id + ' ' + p.cle + '=' + v + ' ' + JSON.stringify(donnees);
                    expect(b.applicable, ici).toBe(a.applicable);
                    expect(b.raison, ici).toBe(a.raison);
                    if (a.applicable) {
                        ecartMax = Math.max(ecartMax, Math.abs(b.note - a.note));
                        expect(Math.abs(b.note - a.note), ici).toBeLessThan(1e-9);
                        expect(Math.abs(b.pctBorne - a.pctBorne), ici).toBeLessThan(1e-9);
                        expect(niveau(b.pctBorne, EN_99), ici).toBe(niveau(a.pctBorne, EN_99));
                        expect(niveau(b.pctBorne, ENTIERES), ici).toBe(niveau(a.pctBorne, ENTIERES));
                    }
                    cas++;
                })));
            });
        });
        expect(cas).toBe(3 * 3 * PONDERATIONS.length * COMPTES.length * ETENDUES.length);
        expect(ecartMax).toBeLessThan(1e-9);
    });

    it('un critère d’avant #667 (sans modèle) et un modèle inconnu : la même note qu’avant', () => {
        [{ type: 'algorithmique', facteurNormalisation: 300 }, { type: 'algorithmique' }, { modeleFormule: 'venu_du_futur' }].forEach((c) => {
            const d = { ponderation: 100, erreurs: 59, mots: 460 };
            expect(F.calculer(c, d).note).toBeCloseTo(ancienCalculer(c, d).note, 12);
        });
    });

    it('sans pondération, la raison d’avant', () => {
        const c = { modeleFormule: 'penalite_par_erreur' };
        expect(F.calculer(c, { ponderation: 0, erreurs: 3, mots: 0 })).toMatchObject({ applicable: false, raison: 'ponderation-absente' });
    });

    it('break-test : un corps ancien perturbé fait tomber le banc (le banc sait échouer)', () => {
        const c = { modeleFormule: 'ratio_cible', paramsFormule: { motsParErreurCible: 60 } };
        const d = { ponderation: 20, erreurs: 12, mots: 600 };
        const vrai = ancienCalculer(c, d).note;
        const faux = 20 * Math.min(1, (600 / 12) / 61);   // un réglage décalé d'un mot
        expect(Math.abs(F.calculer(c, d).note - vrai)).toBeLessThan(1e-9);
        expect(Math.abs(F.calculer(c, d).note - faux)).toBeGreaterThan(1e-9);
    });
});

describe('4a · C — « Quand une donnée de la copie vaut 0 »', () => {
    const avec = (id, cas) => Object.assign({ modeleFormule: id }, cas ? { casZero: { [id]: cas } } : {});

    it('les départs sont le comportement d’avant : rien sur le critère, rien de changé', () => {
        expect(F.casDuCritere({ modeleFormule: 'penalite_normalisee' })).toEqual({ etendue: 'aucune', comptePondere: 'calcul' });
        expect(F.casDuCritere({ modeleFormule: 'ratio_cible' })).toEqual({ etendue: 'aucune', comptePondere: 'entiere' });
        expect(F.casDuCritere({ modeleFormule: 'penalite_par_erreur' })).toEqual({ comptePondere: 'calcul' });
        // L'étendue à 0 : aucune note, la raison d'avant ; le compte à 0 au rapport visé : la note entière.
        expect(F.calculer(avec('penalite_normalisee'), { ponderation: 20, erreurs: 3, mots: 0 })).toMatchObject({ applicable: false, raison: 'mots-absents', attend: 'etendue' });
        expect(F.calculer(avec('ratio_cible'), { ponderation: 20, erreurs: 0, mots: 600 })).toMatchObject({ applicable: true, note: 20, cas: 'comptePondere', issue: 'entiere' });
        expect(F.calculer(avec('penalite_par_erreur'), { ponderation: 20, erreurs: 0, mots: 0 })).toMatchObject({ applicable: true, note: 20 });
    });

    const ATTENDU = {
        aucune: (r) => expect(r).toMatchObject({ applicable: false }),
        entiere: (r) => expect(r).toMatchObject({ applicable: true, note: 20, pctBorne: 100 }),
        zero: (r) => expect(r).toMatchObject({ applicable: true, note: 0, pctBorne: 0 })
    };
    const COPIES = { etendue: { ponderation: 20, erreurs: 3, mots: 0 }, comptePondere: { ponderation: 20, erreurs: 0, mots: 600 } };

    F.listerModeles().forEach((m) => {
        F.donneesDuCalcul(m.jetons).forEach((d) => {
            ['aucune', 'entiere', 'zero', 'calcul'].forEach((choix) => {
                it(m.id + ' · si ' + d + ' vaut 0 : « ' + choix + ' »', () => {
                    const r = F.calculer(avec(m.id, { [d]: choix }), COPIES[d]);
                    const divise = !!F.diviseurs(m.jetons)[d];
                    if (choix === 'calcul') {
                        // Jamais « calculer » une division par 0 : écarté, retour au départ.
                        if (divise) expect(r).toEqual(F.calculer(avec(m.id), COPIES[d]));
                        else expect(r).toMatchObject({ applicable: true, note: F.evaluer(m.jetons, { donnees: { ponderation: 20, comptePondere: COPIES[d].erreurs, etendue: COPIES[d].mots }, params: F.normaliser({ modeleFormule: m.id }).params }).v });
                        return;
                    }
                    ATTENDU[choix](r);
                    if (choix === 'aucune') expect(r.raison).toBe(d === 'etendue' ? 'mots-absents' : 'donnee-absente');
                    else expect(r).toMatchObject({ cas: d, issue: choix });
                });
            });
        });
    });

    it('l’étendue s’examine avant le compte pondéré (ordre de `resultatCalcul`)', () => {
        const c = avec('ratio_cible', { etendue: 'zero', comptePondere: 'entiere' });
        expect(F.calculer(c, { ponderation: 20, erreurs: 0, mots: 0 })).toMatchObject({ note: 0, cas: 'etendue' });
    });

    it('un `casZero` illisible est écarté, jamais deviné : modèle, donnée ou choix inconnus, « calcul » sur un diviseur', () => {
        const c = { modeleFormule: 'penalite_normalisee', casZero: {
            penalite_normalisee: { etendue: 'calcul', comptePondere: 'peut-etre', compte: 'zero', inconnue: 'zero' },
            inexistant: { etendue: 'zero' } } };
        expect(F.casDuCritere(c)).toEqual({ etendue: 'aucune', comptePondere: 'calcul' });
        expect(F.assainirCasZero(c.casZero)).toBeUndefined();
        expect(F.assainirCasZero('zero')).toBeNull();
        expect(F.assainirCasZero([])).toBeNull();
        expect(F.assainirCasZero(undefined)).toBeUndefined();
        expect(F.assainirCasZero({ ratio_cible: { comptePondere: 'zero', etendue: 'aucune' }, penalite_par_erreur: { comptePondere: 'aucune' } }))
            .toEqual({ ratio_cible: { comptePondere: 'zero' }, penalite_par_erreur: { comptePondere: 'aucune' } });
    });

    it('écrire un choix : égal au départ, l’entrée part (et `casZero` avec elle) ; illisible, rien n’est écrit', () => {
        const c = { modeleFormule: 'ratio_cible' };
        expect(F.appliquerCasZero(c, 'comptePondere', 'zero')).toBe(true);
        expect(c.casZero).toEqual({ ratio_cible: { comptePondere: 'zero' } });
        expect(F.appliquerCasZero(c, 'comptePondere', 'calcul')).toBe(false);
        expect(F.appliquerCasZero(c, 'compte', 'zero')).toBe(false);
        expect(c.casZero).toEqual({ ratio_cible: { comptePondere: 'zero' } });
        expect(F.appliquerCasZero(c, 'comptePondere', 'entiere')).toBe(true);
        expect('casZero' in c).toBe(false);
    });

    it('deux critères algorithmiques : chacun son calcul et son `casZero`', () => {
        const a = { modeleFormule: 'penalite_par_erreur', casZero: { penalite_par_erreur: { comptePondere: 'zero' } } };
        const b = { modeleFormule: 'penalite_par_erreur' };
        const d = { ponderation: 20, erreurs: 0, mots: 0 };
        expect(F.calculer(a, d).note).toBe(0);
        expect(F.calculer(b, d).note).toBe(20);
    });

    it('changer de calcul garde les choix de l’autre : ils sont rangés par modèle', () => {
        const c = { modeleFormule: 'ratio_cible', casZero: { ratio_cible: { comptePondere: 'zero' } } };
        F.appliquerAuCritere(c, 'penalite_par_erreur', null);
        expect(F.casDuCritere(c)).toEqual({ comptePondere: 'calcul' });
        F.appliquerAuCritere(c, 'ratio_cible', null);
        expect(F.casDuCritere(c).comptePondere).toBe('zero');
    });

    it('le menu n’offre jamais « Calculer normalement » pour une donnée par laquelle on divise', () => {
        F.listerModeles().forEach((m) => {
            const off = F.casAOffrir({ modeleFormule: m.id });
            off.rangees.forEach((r) => {
                const offerts = r.choix.map((x) => x.valeur);
                expect(offerts.includes('calcul'), m.id + ' ' + r.donnee).toBe(!F.diviseurs(m.jetons)[r.donnee]);
                expect(offerts).toContain(r.actuel);
            });
            expect(off.divise).toBe(Object.keys(F.diviseurs(m.jetons)).length > 0);
        });
    });
});

describe('4a · D — la ligne chiffrée et les pastilles, dans les deux disciplines', () => {
    const MOTS = { noms: { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } } };
    const CALCULS = { noms: { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } } };
    const crit = (base, id, p, cas) => Object.assign({ type: 'algorithmique', ponderation: 20, modeleFormule: id, paramsFormule: p }, base, cas ? { casZero: { [id]: cas } } : {});

    it('les exemples validés (TEXTES du 26 oct.) : la note et la ligne chiffrée', () => {
        expect(F.libelleChiffre(crit(MOTS, 'penalite_normalisee', { facteurNormalisation: 500 }), { ponderation: 20, erreurs: 12, mots: 600 })).toBe('Note = 20 − 12 ÷ 600 × 500 = 10 / 20');
        expect(F.libelleChiffre(crit(CALCULS, 'penalite_normalisee', { facteurNormalisation: 12 }), { ponderation: 20, erreurs: 3, mots: 12 })).toBe('Note = 20 − 3 ÷ 12 × 12 = 17 / 20');
        expect(F.libelleChiffre(crit(MOTS, 'ratio_cible', { motsParErreurCible: 60 }), { ponderation: 20, erreurs: 12, mots: 600 })).toBe('Note = 20 × (600 ÷ 12) ÷ 60 = 16,67 / 20');
        expect(F.libelleChiffre(crit(CALCULS, 'ratio_cible', { motsParErreurCible: 6 }), { ponderation: 20, erreurs: 3, mots: 12 })).toBe('Note = 20 × (12 ÷ 3) ÷ 6 = 13,33 / 20');
        expect(F.libelleChiffre(crit(MOTS, 'penalite_par_erreur', { pointsParErreur: 1 }), { ponderation: 20, erreurs: 12, mots: 600 })).toBe('Note = 20 − 12 × 1 = 8 / 20');
        expect(F.libelleChiffre(crit(CALCULS, 'penalite_par_erreur', { pointsParErreur: 2 }), { ponderation: 20, erreurs: 3, mots: 12 })).toBe('Note = 20 − 3 × 2 = 14 / 20');
    });

    it('au-delà des bornes, et une donnée à 0 (au présent)', () => {
        expect(F.libelleChiffre(crit(MOTS, 'ratio_cible', { motsParErreurCible: 60 }), { ponderation: 20, erreurs: 2, mots: 600 }))
            .toBe('Note = 20 × (600 ÷ 2) ÷ 60 = 100 ; la note s’arrête à la pondération : 20 / 20.');
        expect(F.libelleChiffre(crit(CALCULS, 'penalite_par_erreur', { pointsParErreur: 2 }), { ponderation: 20, erreurs: 12, mots: 12 }))
            .toBe('Note = 20 − 12 × 2 = −4 ; la note ne descend pas sous 0 : 0 / 20.');
        expect(F.libelleChiffre(crit(CALCULS, 'ratio_cible', {}), { ponderation: 20, erreurs: 0, mots: 12 }))
            .toBe('Le compte pondéré des unités manquantes vaut 0 : la note est entière, 20 / 20.');
        expect(F.libelleChiffre(crit(CALCULS, 'penalite_normalisee', {}, { etendue: 'zero' }), { ponderation: 20, erreurs: 3, mots: 0 }))
            .toBe('Le compte des calculs vaut 0 : la note est 0 / 20.');
        // Aucune note : la ligne se masque (comme avant).
        expect(F.libelleChiffre(crit(MOTS, 'penalite_normalisee', {}), { ponderation: 20, erreurs: 3, mots: 0 })).toBe('');
    });

    it('la copie fictive, au conditionnel', () => {
        expect(F.ligneResultat(crit(CALCULS, 'penalite_normalisee', {}), { ponderation: 20, erreurs: 3, mots: 0 }, 'conditionnel'))
            .toBe('Aucune note : l’évaluation attendrait le compte des calculs.');
        expect(F.ligneResultat(crit(MOTS, 'ratio_cible', {}), { ponderation: 20, erreurs: 1, mots: 600 }, 'conditionnel'))
            .toBe('Note = 20 × (600 ÷ 1) ÷ 60 = 200 ; la note s’arrêterait à la pondération : 20 / 20.');
        expect(F.ligneResultat(crit(MOTS, 'ratio_cible', {}, { comptePondere: 'zero' }), { ponderation: 20, erreurs: 0, mots: 600 }, 'conditionnel'))
            .toBe('Le compte pondéré des erreurs vaut 0 : la note serait 0 / 20.');
    });

    it('les pastilles portent les noms de l’enseignant·e et le réglage', () => {
        const textes = (c) => F.blocs(c).map((b) => b.texte);
        expect(textes(crit(CALCULS, 'penalite_normalisee', { facteurNormalisation: 12 })))
            .toEqual(['Pondération du critère', '−', 'Compte pondéré des unités manquantes', '÷', 'Compte des calculs', '×', 'Longueur fixée (12)']);
        expect(textes(crit(MOTS, 'ratio_cible', { motsParErreurCible: 60 })))
            .toEqual(['Pondération du critère', '×', '(', 'Compte des mots', '÷', 'Compte pondéré des erreurs', ')', '÷', 'Rapport visé (60)']);
        expect(textes(crit(CALCULS, 'penalite_par_erreur', { pointsParErreur: 2 })))
            .toEqual(['Pondération du critère', '−', 'Compte pondéré des unités manquantes', '×', 'Points par unité manquante (2)']);
        expect(F.blocs(crit(MOTS, 'penalite_par_erreur', {})).map((b) => b.genre)).toEqual(['pose', 'operation', 'donnee', 'operation', 'pose']);
    });

    it('la ligne chiffrée suit les blocs : changer le réglage déplace la ligne ET la note', () => {
        const a = crit(MOTS, 'penalite_par_erreur', { pointsParErreur: 1 }), b = crit(MOTS, 'penalite_par_erreur', { pointsParErreur: 1.5 });
        const d = { ponderation: 20, erreurs: 4, mots: 0 };
        expect(F.libelleChiffre(a, d)).toBe('Note = 20 − 4 × 1 = 16 / 20');
        expect(F.libelleChiffre(b, d)).toBe('Note = 20 − 4 × 1,5 = 14 / 20');
        expect(F.calculer(b, d).note).toBe(14);
    });

    it('les noms des trois calculs et leurs textes : ceux que Grégoire a validés', () => {
        const m = Object.fromEntries(F.listerModeles().map((x) => [x.id, x]));
        expect(F.listerModeles().map((x) => x.nom)).toEqual(['Pénalité proportionnelle à la longueur', 'Rapport visé', 'Pénalité fixe']);
        expect(m.penalite_par_erreur.texte).toBe('Chaque occurrence retire le même nombre de points, quelle que soit la longueur de la copie. La longueur reste comptée pour les phrases de l’étudiant·e, mais n’entre pas dans la note.');
        expect(m.ratio_cible.parametres[0].libelle(CALCULS.noms)).toBe('Rapport qui donne la note entière : 1 unité manquante à chaque … calculs');
        expect(m.penalite_normalisee.parametres[0].libelle(CALCULS.noms)).toBe('Longueur sur laquelle une occurrence coûte un point (calculs)');
    });
});

describe('4a · E — « vaut 0 » voyage avec le calcul : export → import, partage → réception', () => {
    const clone = (x) => JSON.parse(JSON.stringify(x));
    const grille = () => ({
        id: 'G4A', nom: 'Grille fictive 4a', criteres: [
            { id: 'C1', nom: 'Unités et calculs', type: 'algorithmique', ponderation: 20, modeleFormule: 'ratio_cible', paramsFormule: { motsParErreurCible: 6 },
                casZero: { ratio_cible: { comptePondere: 'zero' }, penalite_normalisee: { etendue: 'entiere' } } },
            { id: 'C2', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, modeleFormule: 'penalite_par_erreur', paramsFormule: { pointsParErreur: 1 } }
        ],
        metadata_cc: { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] }
    });

    it('E.a export → import : `casZero` intact ; une entrée illisible écartée ; un critère aux départs, sans le champ', () => {
        const wie = chargerScript('js/evaluation-formules.js');
        chargerScript('js/import-export.js', {}, wie);
        const g = grille();
        const importee = wie.assainirObjet(clone(g), wie.SCHEMAS_IMPORT.grille);
        expect(importee.criteres[0].casZero).toEqual(g.criteres[0].casZero);
        expect(importee.criteres[1]).not.toHaveProperty('casZero');
        const abime = clone(g);
        abime.criteres[0].casZero = { ratio_cible: { comptePondere: 'calcul', etendue: 'zero' }, inconnu: { etendue: 'zero' }, penalite_par_erreur: 'zero' };
        expect(wie.assainirObjet(abime, wie.SCHEMAS_IMPORT.grille).criteres[0].casZero).toEqual({ ratio_cible: { etendue: 'zero' } });
        const toutAbime = clone(g);
        toutAbime.criteres[0].casZero = { ratio_cible: { comptePondere: 'peut-etre' } };
        expect(wie.assainirObjet(toutAbime, wie.SCHEMAS_IMPORT.grille).criteres[0]).not.toHaveProperty('casZero');
        // La note de la grille importée est celle de son auteur·e : le compte pondéré à 0 donne 0, pas la note entière.
        expect(F.calculer(importee.criteres[0], { ponderation: 20, erreurs: 0, mots: 12 }).note).toBe(0);
    });

    it('E.b partage → réception : `casZero` intact ; un choix illisible fait refuser le paquet, avec sa raison', () => {
        const dbP = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
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
        expect(recue.criteres[0].casZero).toEqual(g.criteres[0].casZero);
        expect(recue.criteres[1]).not.toHaveProperty('casZero');
        const abime = clone(paquet);
        abime.entites.grilles[0].criteres[0].casZero.ratio_cible.comptePondere = 'calcul';
        const refus = wp.partageValidation.validerPackage(abime);
        expect(refus.valide).toBe(false);
        expect(refus.erreurs.map((e) => e.message)).toContain('calcul de la note : choix illisible pour comptePondere');
        const inconnu = clone(paquet);
        inconnu.entites.grilles[0].criteres[0].casZero.venu_du_futur = { etendue: 'zero' };
        expect(wp.partageValidation.validerPackage(inconnu).valide).toBe(false);
    });
});
