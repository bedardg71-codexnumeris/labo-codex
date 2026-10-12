import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// =======================================================================
// #1007, LOT 2b (3 oct. 2026) — LE CODEX PROPOSÉ AVANT DE RETIRER UNE LIGNE QUI PORTE DES NOTES
// =======================================================================
//
// Décision de Grégoire (2 oct., § 3) : rien avant de retirer une ligne d'éditeur, SAUF si
// elle porte des notes d'élèves (un critère, un sous-critère, un niveau d'échelle ou une
// cible de dénotation déjà employés dans au moins une évaluation). La structure des portes
// (l'appel juste avant la question, le registre, le compte) est jugée par
// sentinelle-1007-propose-codex.test.js ; ici, le COMPORTEMENT, sur les vrais écrivains :
//  A. la lecture « déjà employé » (`ligneEmployeeParUneEvaluation`, evaluation-sauvegarde.js),
//     famille par famille, oui et non ;
//  B. pour chaque famille, une ligne qu'aucune évaluation n'emploie se retire SANS fenêtre ;
//  C. une ligne employée : la fenêtre, avant la question ; « Annuler » n'écrit rien et ne
//     pose pas la question.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => fs.readFileSync(path.join(racine, f), 'utf8');

const T = 'a2026_';
const cle = (k) => T + k;

/** Un magasin en mémoire : `getSync` et la file `modifier` (copie à la lecture, comme la base). */
function fauxDb(initial) {
    const magasin = new Map(Object.entries(initial || {}));
    const copie = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    let ecritures = 0;
    return {
        getSync: (k, d) => (magasin.has(k) ? copie(magasin.get(k)) : d),
        get: async (k) => (magasin.has(k) ? copie(magasin.get(k)) : null),   // le réaffichage des listes
        async modifier(k, mutateur, d) {
            const v = mutateur(magasin.has(k) ? copie(magasin.get(k)) : copie(d));
            if (v === undefined) return undefined;
            magasin.set(k, copie(v));
            ecritures++;
            return v;
        },
        get ecritures() { return ecritures; }
    };
}

/** La vraie fonction de lecture, tirée de son fichier, sur le magasin du banc. */
function lectureSur(db, fenetre = {}) {
    const src = tranche(lire('js/evaluation-sauvegarde.js'), 'function ligneEmployeeParUneEvaluation(', '\n}\n', { longueurMin: 300 });
    // eslint-disable-next-line no-new-func
    return new Function('db', 'cle', 'window', src + '\n}\nreturn ligneEmployeeParUneEvaluation;')(db, cle, fenetre);
}

/** Codex : compte les fenêtres et rend la réponse posée. */
function fauxCodex(reponse) {
    const fenetres = [];
    return { fenetres, proposerAvantSuppression: async (geste) => { fenetres.push(geste); return reponse; } };
}

const fauxDocument = () => ({
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    body: { insertAdjacentHTML() {} },
    createElement: () => ({ setAttribute() {}, appendChild() {}, style: {}, classList: { add() {}, remove() {} } }),
    addEventListener() {}, removeEventListener() {}
});

const notifications = { succes() {}, erreur() {}, info() {}, avertissement() {} };

const GRILLE = {
    id: 'GR_BANC', nom: 'Grille du banc',
    criteres: [
        { id: 'CR_EMPLOYE', nom: 'Structure', ponderation: 50,
          sousCriteres: [{ code: 'ORT', nom: 'Orthographe' }, { code: 'SYN', nom: 'Syntaxe' }] },
        { id: 'CR_LIBRE', nom: 'Style', ponderation: 50 }
    ]
};
const ECHELLE = { id: 'ECH_BANC', nom: 'Échelle du banc',
    niveaux: [{ code: 'I', nom: 'Incomplet' }, { code: 'D', nom: 'Développement' }, { code: 'M', nom: 'Maîtrisé' }] };
// Une évaluation de cette grille et de cette échelle : critère CR_EMPLOYE au niveau « D »,
// catégorie « ORT » saisie. CR_LIBRE, « SYN », « I » et « M » ne sont employés par personne.
const EVALUATIONS = [
    { id: 'EV1', grilleId: 'GR_BANC', echelleId: 'ECH_BANC', niveauFinal: 'D',
      criteres: [{ critereId: 'CR_EMPLOYE', critereNom: 'Structure', niveauSelectionne: 'D' }],
      donneesAlgorithmiques: { CR_EMPLOYE: { codes: ['ORT', 'ORT'], mots: 300 } } },
    // une autre grille et une autre échelle emploient les mêmes codes : sans effet ici
    { id: 'EV2', grilleId: 'GR_AUTRE', echelleId: 'ECH_AUTRE', niveauFinal: 'M',
      criteres: [{ critereId: 'CR_LIBRE', niveauSelectionne: 'M' }],
      donneesAlgorithmiques: { CR_EMPLOYE: { codes: ['SYN'] } } }
];

function magasinDuBanc() {
    return fauxDb({
        [cle('grillesTemplates')]: [GRILLE],
        [cle('echellesTemplates')]: [ECHELLE],
        [cle('evaluationsSauvegardees')]: EVALUATIONS
    });
}

function monter(fichier, db, codex, questions) {
    const win = chargerScript(fichier, {
        db, cle, Codex: codex, notifications, document: fauxDocument(),
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8),
        alert: () => {}, prompt: () => null,
        confirm: (m) => { questions.push(m); return true; },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', obtenirIdentiteUtilisateur: () => 'banc',
        grilleTemplateActuelle: null
    });
    win.ligneEmployeeParUneEvaluation = lectureSur(db);
    win.estRessourceSupprimee = () => false;
    win.marquerRessourceSupprimee = () => {};
    win.IDS_GABARITS_HARDCODES = [];
    return win;
}

describe('#1007, lot 2b — A. la lecture « déjà employé »', () => {
    const employe = lectureSur(magasinDuBanc());

    it('critère : oui s\'il a une entrée dans une évaluation de SA grille, non sinon', () => {
        expect(employe({ grilleId: 'GR_BANC', critere: GRILLE.criteres[0] })).toBe(true);
        expect(employe({ grilleId: 'GR_BANC', critere: GRILLE.criteres[1] })).toBe(false);   // employé ailleurs seulement
    });

    it('critère sans identifiant (#674) : par son nom, parmi les entrées sans identifiant', () => {
        const db = fauxDb({ [cle('evaluationsSauvegardees')]: [
            { grilleId: 'GR_BANC', criteres: [{ critereNom: 'Ancien', niveauSelectionne: 'D' }] }] });
        expect(lectureSur(db)({ grilleId: 'GR_BANC', critere: { nom: 'Ancien' } })).toBe(true);
        expect(lectureSur(db)({ grilleId: 'GR_BANC', critere: { nom: 'Autre' } })).toBe(false);
    });

    it('sous-critère : oui si son code est saisi pour ce critère de cette grille, non sinon', () => {
        expect(employe({ grilleId: 'GR_BANC', critere: GRILLE.criteres[0], sousCritereCode: 'ORT' })).toBe(true);
        expect(employe({ grilleId: 'GR_BANC', critere: GRILLE.criteres[0], sousCritereCode: 'SYN' })).toBe(false);
        expect(employe({ grilleId: 'GR_BANC', critere: GRILLE.criteres[0], sousCritereCode: '' })).toBe(false);
    });

    it('niveau : oui si une évaluation de SON échelle porte ce code, non sinon (et jamais un code vide)', () => {
        expect(employe({ echelleId: 'ECH_BANC', niveauCode: 'D' })).toBe(true);
        expect(employe({ echelleId: 'ECH_BANC', niveauCode: 'M' })).toBe(false);   // employé sur une autre échelle
        expect(employe({ echelleId: 'ECH_BANC', niveauCode: 'I' })).toBe(false);
        expect(employe({ echelleId: 'ECH_BANC', niveauCode: '' })).toBe(false);
    });

    it('niveau : `niveauFinal` compte aussi', () => {
        const db = fauxDb({ [cle('evaluationsSauvegardees')]: [{ echelleId: 'ECH_BANC', niveauFinal: 'I', criteres: [] }] });
        expect(lectureSur(db)({ echelleId: 'ECH_BANC', niveauCode: 'I' })).toBe(true);
    });

    it('aucune évaluation : jamais', () => {
        const vide = lectureSur(fauxDb({}));
        expect(vide({ grilleId: 'GR_BANC', critere: GRILLE.criteres[0] })).toBe(false);
        expect(vide({ echelleId: 'ECH_BANC', niveauCode: 'D' })).toBe(false);
    });
});

describe('#1007, lot 2b — B et C. critère (zone d\'édition)', () => {
    it('non employé : aucune fenêtre, la question habituelle, le critère retiré', async () => {
        const db = magasinDuBanc(); const codex = fauxCodex(false); const questions = [];
        const win = monter('js/grilles.js', db, codex, questions);
        await win.supprimerCritereGrille('GR_BANC', 1);
        expect(codex.fenetres).toEqual([]);
        expect(questions).toHaveLength(1);
        expect(db.getSync(cle('grillesTemplates'))[0].criteres.map((c) => c.id)).toEqual(['CR_EMPLOYE']);
    });

    it('employé : la fenêtre AVANT la question ; « Annuler » n\'écrit rien et ne pose pas la question', async () => {
        const db = magasinDuBanc(); const codex = fauxCodex(false); const questions = [];
        const win = monter('js/grilles.js', db, codex, questions);
        await win.supprimerCritereGrille('GR_BANC', 0);
        expect(codex.fenetres).toEqual(['critere']);
        expect(questions).toEqual([]);
        expect(db.ecritures).toBe(0);
    });

    it('employé, « Supprimer sans… » : la question, puis le retrait', async () => {
        const db = magasinDuBanc(); const codex = fauxCodex(true); const questions = [];
        const win = monter('js/grilles.js', db, codex, questions);
        await win.supprimerCritereGrille('GR_BANC', 0);
        expect(codex.fenetres).toEqual(['critere']);
        expect(questions).toHaveLength(1);
        expect(db.getSync(cle('grillesTemplates'))[0].criteres.map((c) => c.id)).toEqual(['CR_LIBRE']);
    });

    it('relu après l\'attente : si la ligne a changé de place pendant la fenêtre, rien n\'est retiré', async () => {
        const db = magasinDuBanc(); const questions = [];
        const codex = { fenetres: [], async proposerAvantSuppression(g) {
            this.fenetres.push(g);
            // pendant l'attente, un critère s'insère en tête
            await db.modifier(cle('grillesTemplates'), (gs) => { gs[0].criteres.unshift({ id: 'CR_NEUF', nom: 'Neuf' }); return gs; });
            return true;
        } };
        const win = monter('js/grilles.js', db, codex, questions);
        await win.supprimerCritereGrille('GR_BANC', 0);
        expect(db.getSync(cle('grillesTemplates'))[0].criteres.map((c) => c.id)).toEqual(['CR_NEUF', 'CR_EMPLOYE', 'CR_LIBRE']);
    });
});

describe('#1007, lot 2b — B et C. sous-critère', () => {
    it('non employé : aucune fenêtre, retiré', async () => {
        const db = magasinDuBanc(); const codex = fauxCodex(false); const questions = [];
        const win = monter('js/grilles.js', db, codex, questions);
        await win.supprimerSousCritere('GR_BANC', 0, 1);
        expect(codex.fenetres).toEqual([]);
        expect(questions).toHaveLength(1);
        expect(db.getSync(cle('grillesTemplates'))[0].criteres[0].sousCriteres.map((s) => s.code)).toEqual(['ORT']);
    });

    it('employé : la fenêtre ; « Annuler » n\'écrit rien et ne pose pas la question', async () => {
        const db = magasinDuBanc(); const codex = fauxCodex(false); const questions = [];
        const win = monter('js/grilles.js', db, codex, questions);
        await win.supprimerSousCritere('GR_BANC', 0, 0);
        expect(codex.fenetres).toEqual(['sousCritere']);
        expect(questions).toEqual([]);
        expect(db.ecritures).toBe(0);
    });
});

describe('#1007, lot 2b — B et C. niveau d\'échelle', () => {
    it('non employé : aucune fenêtre, retiré', async () => {
        const db = magasinDuBanc(); const codex = fauxCodex(false); const questions = [];
        const win = monter('js/echelles.js', db, codex, questions);
        await win.supprimerNiveauEchelle('ECH_BANC', 2);
        expect(codex.fenetres).toEqual([]);
        expect(questions).toHaveLength(1);
        expect(db.getSync(cle('echellesTemplates'))[0].niveaux.map((n) => n.code)).toEqual(['I', 'D']);
    });

    it('employé : la fenêtre ; « Annuler » n\'écrit rien et ne pose pas la question', async () => {
        const db = magasinDuBanc(); const codex = fauxCodex(false); const questions = [];
        const win = monter('js/echelles.js', db, codex, questions);
        await win.supprimerNiveauEchelle('ECH_BANC', 1);
        expect(codex.fenetres).toEqual(['niveau']);
        expect(questions).toEqual([]);
        expect(db.ecritures).toBe(0);
    });

    it('relu après l\'attente : si le niveau a changé de place pendant la fenêtre, rien n\'est retiré', async () => {
        const db = magasinDuBanc(); const questions = [];
        const codex = { fenetres: [], async proposerAvantSuppression(g) {
            this.fenetres.push(g);
            await db.modifier(cle('echellesTemplates'), (es) => { es[0].niveaux.unshift({ code: 'N', nom: 'Neuf' }); return es; });
            return true;
        } };
        const win = monter('js/echelles.js', db, codex, questions);
        await win.supprimerNiveauEchelle('ECH_BANC', 1);
        expect(codex.fenetres).toEqual(['niveau']);
        expect(db.getSync(cle('echellesTemplates'))[0].niveaux.map((n) => n.code)).toEqual(['N', 'I', 'D', 'M']);
    });
});

describe('#1007, lot 2b — B et C. cible de dénotation', () => {
    function monterCibles(codex, questions) {
        const win = chargerScript('js/pratiques/editeur-cibles.js', {
            Codex: codex, confirm: (m) => { questions.push(m); return true; }, document: fauxDocument()
        });
        win.denotationJugements = { lireTousLesJugements: () => ({
            PRAT_DEN: { 9000101: { ciblesAtteintes: { CIB_COCHEE: true, CIB_COCHEE_2: true } } } }) };
        return win;
    }
    const anciennes = [{ id: 'CIB_COCHEE', nom: 'Thèse' }, { id: 'CIB_LIBRE', nom: 'Plan' }];

    it('deux cibles cochées retirées d\'un coup (l\'assistant) : la fenêtre au pluriel', async () => {
        const codex = fauxCodex(false); const questions = [];
        const win = monterCibles(codex, questions);
        const trois = anciennes.concat([{ id: 'CIB_COCHEE_2', nom: 'Exemples' }]);
        expect(await win.EditeurCibles.confirmerRetraits('PRAT_DEN', trois, [trois[1]])).toBe(false);
        expect(codex.fenetres).toEqual(['cibles']);
        // une seule des deux : le singulier
        const codex1 = fauxCodex(false);
        await monterCibles(codex1, []).EditeurCibles.confirmerRetraits('PRAT_DEN', trois, [trois[0], trois[1]]);
        expect(codex1.fenetres).toEqual(['cible']);
    });

    it('non cochée : aucune fenêtre, aucune question', async () => {
        const codex = fauxCodex(false); const questions = [];
        const win = monterCibles(codex, questions);
        expect(await win.EditeurCibles.confirmerRetraits('PRAT_DEN', anciennes, [anciennes[0]])).toBe(true);
        expect(codex.fenetres).toEqual([]);
        expect(questions).toEqual([]);
    });

    it('jamais enregistrée (absente des anciennes) : aucune fenêtre', async () => {
        const codex = fauxCodex(false); const questions = [];
        const win = monterCibles(codex, questions);
        expect(await win.EditeurCibles.confirmerRetraits('PRAT_DEN', anciennes, anciennes)).toBe(true);
        expect(codex.fenetres).toEqual([]);
    });

    it('cochée : la fenêtre AVANT la question existante ; « Annuler » → faux, sans question', async () => {
        const codex = fauxCodex(false); const questions = [];
        const win = monterCibles(codex, questions);
        expect(await win.EditeurCibles.confirmerRetraits('PRAT_DEN', anciennes, [anciennes[1]])).toBe(false);
        expect(codex.fenetres).toEqual(['cible']);
        expect(questions).toEqual([]);
    });

    it('cochée, « Supprimer sans… » : puis la question existante, mots inchangés', async () => {
        const codex = fauxCodex(true); const questions = [];
        const win = monterCibles(codex, questions);
        expect(await win.EditeurCibles.confirmerRetraits('PRAT_DEN', anciennes, [anciennes[1]])).toBe(true);
        expect(codex.fenetres).toEqual(['cible']);
        expect(questions).toHaveLength(1);
        expect(questions[0]).toMatch(/^Tu retires une cible déjà cochée\.\n\n« Thèse » : cochée pour 1 étudiant·e/);
    });
});

describe('#1007, lot 2b — les deux écrans de la cible attendent la réponse', () => {
    it('la gestion des pratiques et l\'assistant attendent la promesse (un objet Promise passerait pour un oui)', () => {
        for (const f of ['js/pratiques-gestion.js', 'js/wizard-pratique-v2.js']) {
            const appels = lire(f).split('\n').filter((l) => l.includes('EditeurCibles.confirmerRetraits('));
            expect(appels.length, f).toBe(1);
            expect(appels[0], f).toContain('await window.EditeurCibles.confirmerRetraits(');
        }
    });
});

// =====================================================================
// #1015 (11 oct. 2026) — un type de production ou un forfait des spécifications
// =====================================================================
// Une évaluation ne cite ni type ni forfait : elle les emploie par sa production (l'appariement
// du moteur, `productionEstDuType`, par id ou par nom). Le codex n'est proposé que si une
// évaluation porte sur une production d'un type de la pratique.
describe('#1015 — type de production et forfait des spécifications', () => {
    const PRATIQUE = { id: 'PR_SPE', nom: 'Spécifications du banc', configuration: {
        typesTravaux: [{ id: 'projet', nom: 'Projet' }, { id: 'quiz', nom: 'Quiz' }],
        forfaits: [{ lettre: 'A', note: 90, travaux: { projet: 2 } }, { lettre: 'B', note: 80, travaux: { projet: 1 } }] } };
    const fenetreSpe = () => {
        const w = {};
        chargerScript('js/pratiques/pratique-pan-specifications.js', {}, w);
        return w;
    };
    function magasinSpe(evaluations) {
        return fauxDb({
            [cle('pratiquesConfigurables')]: [PRATIQUE],
            [cle('productions')]: [{ id: 'P_PROJET', titre: 'Projet fictif', type: 'projet' }, { id: 'P_QUIZ', titre: 'Quiz fictif', type: 'quiz' }],
            [cle('evaluationsSauvegardees')]: evaluations
        });
    }
    function monterSpe(db, codex, questions) {
        const win = monter('js/pratiques-gestion.js', db, codex, questions);
        win.ligneEmployeeParUneEvaluation = lectureSur(db, fenetreSpe());
        win.EditeurCibles = { poser() {}, lire: () => [] };   // l'éditeur des cibles (dénotation), sans objet ici
        return win;
    }

    it('A. la lecture : un type est employé si une évaluation porte sur une production de ce type', () => {
        const employe = lectureSur(magasinSpe([{ id: 'E1', productionId: 'P_PROJET' }]), fenetreSpe());
        expect(employe({ typeTravail: PRATIQUE.configuration.typesTravaux[0] })).toBe(true);
        expect(employe({ typeTravail: PRATIQUE.configuration.typesTravaux[1] })).toBe(false);
        expect(employe({ typeTravail: { nom: 'Projet' } })).toBe(true);   // par le nom aussi
    });

    it('type non employé : aucune fenêtre, retiré', async () => {
        const db = magasinSpe([{ id: 'E1', productionId: 'P_PROJET' }]); const codex = fauxCodex(false);
        const win = monterSpe(db, codex, []);
        await win.chargerPratiquePourModif('PR_SPE');
        await win.supprimerTypeTravailMat(1);
        expect(codex.fenetres).toEqual([]);
        expect(db.getSync(cle('pratiquesConfigurables'))[0].configuration.typesTravaux.map((t) => t.id)).toEqual(['projet']);
    });

    it('type employé : la fenêtre ; « Annuler » n\'écrit rien', async () => {
        const db = magasinSpe([{ id: 'E1', productionId: 'P_PROJET' }]); const codex = fauxCodex(false);
        const win = monterSpe(db, codex, []);
        await win.chargerPratiquePourModif('PR_SPE');
        await win.supprimerTypeTravailMat(0);
        expect(codex.fenetres).toEqual(['typeTravail']);
        expect(db.ecritures).toBe(0);
    });

    it('forfait, une évaluation sur un type de la pratique : la fenêtre ; sans évaluation : aucune', async () => {
        const avec = magasinSpe([{ id: 'E1', productionId: 'P_QUIZ' }]); const c1 = fauxCodex(false);
        const w1 = monterSpe(avec, c1, []); await w1.chargerPratiquePourModif('PR_SPE');
        await w1.supprimerForfaitMat(1);
        expect(c1.fenetres).toEqual(['forfait']);
        expect(avec.ecritures).toBe(0);
        const sans = magasinSpe([]); const c2 = fauxCodex(false);
        const w2 = monterSpe(sans, c2, []); await w2.chargerPratiquePourModif('PR_SPE');
        await w2.supprimerForfaitMat(1);
        expect(c2.fenetres).toEqual([]);
        expect(sans.getSync(cle('pratiquesConfigurables'))[0].configuration.forfaits.map((f) => f.lettre)).toEqual(['A']);
    });

    it('relu après l\'attente : si le type a changé de place pendant la fenêtre, rien n\'est retiré', async () => {
        const db = magasinSpe([{ id: 'E1', productionId: 'P_PROJET' }]);
        const codex = { fenetres: [], async proposerAvantSuppression(g) {
            this.fenetres.push(g);
            await db.modifier(cle('pratiquesConfigurables'), (ps) => { ps[0].configuration.typesTravaux.unshift({ id: 'neuf', nom: 'Neuf' }); return ps; });
            return true;
        } };
        const win = monterSpe(db, codex, []);
        await win.chargerPratiquePourModif('PR_SPE');
        await win.supprimerTypeTravailMat(0);
        expect(codex.fenetres).toEqual(['typeTravail']);
        expect(db.getSync(cle('pratiquesConfigurables'))[0].configuration.typesTravaux.map((t) => t.id)).toEqual(['neuf', 'projet', 'quiz']);
    });
});
