import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #326 R2 — générateur de profils-types (PUR, déterministe), dérivé de l'échelle.
// RELAIS §4.8 : N niveaux → N profils ancrés (non plats) + 1 irrégulier ; reprises
// sur exercices seulement ; v1 fixes (déterministes).

const win = chargerScript('js/pratiques/profils-types-generateur.js');
const { genererCorpus } = win.ProfilsTypesGenerateur;

const echelle4 = {
    niveaux: [
        { code: 'I', label: 'Incomplet', valeur_pourcentage: 50, ordre: 1 },
        { code: 'D', label: 'en Développement', valeur_pourcentage: 65, ordre: 2 },
        { code: 'M', label: 'Maîtrisé', valeur_pourcentage: 80, ordre: 3 },
        { code: 'E', label: 'Étendu', valeur_pourcentage: 95, ordre: 4 }
    ]
};
const echelle3 = {
    niveaux: [
        { code: 'NA', label: 'Non atteint', valeur_pourcentage: 55, ordre: 1 },
        { code: 'A', label: 'Atteint', valeur_pourcentage: 75, ordre: 2 },
        { code: 'D', label: 'Dépassé', valeur_pourcentage: 90, ordre: 3 }
    ]
};

describe('#326 R2 · nombre de profils = nombre de niveaux + 1 irrégulier', () => {
    it('échelle 4 niveaux → 5 profils (4 ancrés + irrégulier)', () => {
        const c = genererCorpus(echelle4);
        expect(c.profils).toHaveLength(5);
        expect(c.profils[4].da).toBe('SIM0099');
        expect(c.profils.slice(0, 4).map(p => p.niveauAncrage)).toEqual(['I', 'D', 'M', 'E']);
    });
    it('échelle 3 niveaux → 4 profils (parle l’échelle de l’utilisateur)', () => {
        const c = genererCorpus(echelle3);
        expect(c.profils).toHaveLength(4);
        expect(c.profils.slice(0, 3).map(p => p.niveauAncrage)).toEqual(['NA', 'A', 'D']);
    });
    it('échelle invalide → corpus vide (repli neutre, jamais d’exception)', () => {
        expect(genererCorpus(null)).toEqual({ profils: [], productions: [], evaluations: [] });
        expect(genererCorpus({ niveaux: [{ code: 'X' }] })).toEqual({ profils: [], productions: [], evaluations: [] });
    });
    it('TOUS les DA font 7 caractères (le moteur garde da.length !== 7 → sinon note 0)', () => {
        // Bug terrain 17 juin : 'SIMP_0'/'SIMP_IRR' (6/8 car.) → toutes les notes à 0.
        const c = genererCorpus(echelle4);
        expect(c.profils.every(p => p.da.length === 7)).toBe(true);
        expect(c.evaluations.every(e => e.etudiantDA.length === 7)).toBe(true);
    });
});

describe('#326 R2 · productions : corpus partagé avec 1 terminale', () => {
    it('≥ 8 productions, la dernière est la terminale, les autres des artefacts', () => {
        const c = genererCorpus(echelle4);
        expect(c.productions.length).toBeGreaterThanOrEqual(8);
        const last = c.productions[c.productions.length - 1];
        expect(last.type).toBe('terminale');
        expect(c.productions.slice(0, -1).every(p => p.type === 'artefact-portfolio')).toBe(true);
    });
});

describe('#326 R2 · trajectoires ancrées NON plates', () => {
    it('chaque profil ancré a de la variance (pas une note constante)', () => {
        const c = genererCorpus(echelle4);
        // pour le profil ancré index 1 (D) : les niveauFinal ne sont pas tous identiques
        const niveauxProfil = c.evaluations.filter(e => e.etudiantDA === 'SIM0001' && !e.remplaceeParId).map(e => e.niveauFinal);
        const uniques = new Set(niveauxProfil);
        expect(uniques.size).toBeGreaterThan(1);
    });
    it('profil irrégulier : commence bas, finit haut (maîtrise tardive)', () => {
        const c = genererCorpus(echelle4);
        const evs = c.evaluations
            .filter(e => e.etudiantDA === 'SIM0099' && !e.estReprise)
            .sort((a, b) => new Date(a.dateEvaluation) - new Date(b.dateEvaluation));
        const ordreNiveau = { I: 0, D: 1, M: 2, E: 3 };
        expect(ordreNiveau[evs[0].niveauFinal]).toBeLessThanOrEqual(1);
        expect(ordreNiveau[evs[evs.length - 1].niveauFinal]).toBe(3);
    });
});

describe('#326 R2 · scénarios de reprise (exercices seulement, pas la terminale)', () => {
    it('au moins une reprise existe et porte sur un exercice', () => {
        const c = genererCorpus(echelle4);
        const reprises = c.evaluations.filter(e => e.estReprise === true);
        expect(reprises.length).toBeGreaterThan(0);
        const idsTerminale = new Set(c.productions.filter(p => p.type === 'terminale').map(p => p.id));
        // aucune reprise sur une production terminale
        expect(reprises.every(r => !idsTerminale.has(r.productionId))).toBe(true);
        // l'original remplacé existe et est exclu (remplaceeParId pointant la reprise)
        const remplacees = c.evaluations.filter(e => e.remplaceeParId);
        expect(remplacees.length).toBeGreaterThan(0);
    });
});

describe('#326 R2 · notes cohérentes avec l’échelle + déterminisme', () => {
    it('noteFinale = valeur_pourcentage du niveau', () => {
        const c = genererCorpus(echelle4);
        const e = c.evaluations.find(x => x.niveauFinal === 'M');
        expect(e.noteFinale).toBe(80);
    });
    it('déterministe : deux générations identiques (profils fixes v1)', () => {
        expect(JSON.stringify(genererCorpus(echelle4))).toBe(JSON.stringify(genererCorpus(echelle4)));
    });
    it('echelleId stampé sur les évaluations (résolution du niveau côté comparateur)', () => {
        const ech = { id: 'ECH_X', niveaux: echelle4.niveaux };
        const c = genererCorpus(ech);
        expect(c.evaluations.length).toBeGreaterThan(0);
        expect(c.evaluations.every(e => e.echelleId === 'ECH_X')).toBe(true);
    });
});

describe('#326 R2 · noteFinale dérivée — ROBUSTE aux champs de pourcentage (fix bug notes=0)', () => {
    // Le pourcentage d'un niveau a 3 noms selon l'origine de l'échelle :
    // valeurCalcul (echellesTemplates), valeur (echelles.js), valeur_pourcentage
    // (pratiques embarquées). Sans robustesse → noteFinale null → toutes les notes à 0.
    const niveauxValeur = [
        { code: 'I', nom: 'Incomplet', min: 0, max: 59, valeur: 45 },
        { code: 'D', nom: 'Développement', min: 60, max: 74, valeur: 67 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeur: 82 },
        { code: 'E', nom: 'Étendu', min: 90, max: 100, valeur: 95 }
    ];
    const niveauxValeurCalcul = [
        { code: '0', nom: 'Aucun', min: 0, max: 0, valeurCalcul: 0 },
        { code: 'I', nom: 'Incomplet', min: 0, max: 64, valeurCalcul: 50 },
        { code: 'M', nom: 'Maîtrisé', min: 65, max: 84, valeurCalcul: 78 },
        { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 92 }
    ];
    it('champ `valeur` (echelles.js) → noteFinale dérivée (pas null)', () => {
        const c = genererCorpus({ id: 'E1', niveaux: niveauxValeur });
        const e = c.evaluations.find(x => x.niveauFinal === 'M');
        expect(e.noteFinale).toBe(82);
        expect(c.evaluations.every(x => x.noteFinale !== null)).toBe(true);
    });
    it('champ `valeurCalcul` (echellesTemplates) → noteFinale dérivée (pas null)', () => {
        const c = genererCorpus({ id: 'E2', niveaux: niveauxValeurCalcul });
        const e = c.evaluations.find(x => x.niveauFinal === 'M');
        expect(e.noteFinale).toBe(78);
        // au moins une note > 0 (le « 0/Aucun » peut légitimement valoir 0)
        expect(Math.max.apply(null, c.evaluations.map(x => x.noteFinale))).toBeGreaterThan(0);
    });
    it('repli milieu [min,max] si aucun champ de valeur', () => {
        const c = genererCorpus({ id: 'E3', niveaux: [
            { code: 'A', min: 0, max: 50 }, { code: 'B', min: 51, max: 100 }
        ] });
        expect(c.evaluations.every(x => typeof x.noteFinale === 'number')).toBe(true);
    });
});
