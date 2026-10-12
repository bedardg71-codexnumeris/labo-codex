import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { suitDansLaFonction } from './_helpers/tranche.js';

// SENTINELLE #560 (3 septembre 2026) — LA PORTÉE D'UNE SUPPRESSION EST CELLE
// QU'ON ANNONCE : supprimer pour de bon la copie d'un élève.
//
// Tranché par Grégoire le 2 septembre 2026 : TOUT ce qui touche le couple
// (élève, production) part avec le fichier — originale, reprises, évaluation
// d'un fichier réimporté. Le code le faisait déjà ; la fenêtre disait « le
// fichier » et taisait les annotations et les évaluations. Ses mots, arrêtés le
// soir même : « Le fichier, ses annotations et toutes les évaluations de cet
// élève pour cette production seront effacés. »
//
// Ce que cette sentinelle verrouille :
//   A — UN SEUL prédicat « du couple », lu par la modale pour annoncer et par les
//       deux filtres (un fichier, la corbeille entière) pour détruire. Deux
//       prédicats auraient pu diverger sans qu'aucun test ne le voie ;
//   B — la phrase arrêtée, telle quelle, ET le témoin négatif : sans évaluation
//       liée, la phrase d'avant, mot pour mot ;
//   C — le message d'après compte ce qui est parti (plus de « et évaluation »
//       affiché quand aucune n'existait, ou quand l'écriture venait d'être refusée).
//
// Les fonctions pures sont extraites du fichier de production : pas de copie.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const nettoyer = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const liste = nettoyer(readFileSync(path.join(racineProjet, 'js', 'liste-evaluations.js'), 'utf8'));

function corps(src, nom) {
    let i = src.indexOf('function ' + nom + '(');
    expect(i, nom + ' doit exister').toBeGreaterThan(-1);
    if (src.slice(Math.max(0, i - 6), i) === 'async ') i -= 6;
    let j = i, prof = 0, vu = false;
    for (; j < src.length; j++) {
        if (src[j] === '{') { prof++; vu = true; }
        else if (src[j] === '}') { prof--; if (vu && prof === 0) break; }
    }
    return src.slice(i, j + 1);
}

function instancier(src, nom, globaux) {
    const noms = Object.keys(globaux);
    const fabrique = new Function(...noms, corps(src, nom) + '\nreturn ' + nom + ';');
    return fabrique(...noms.map(n => globaux[n]));
}

const estDuCoupleDuFichier = instancier(liste, 'estDuCoupleDuFichier', {});
const compterEvaluationsDuCouple = instancier(liste, 'compterEvaluationsDuCouple', { estDuCoupleDuFichier });

const F1 = { id: 'F1', etudiantDA: 'DA1', productionId: 'P1' };
const EVALS = [
    { id: 'E1', etudiantDA: 'DA1', productionId: 'P1' },                       // originale
    { id: 'E2', etudiantDA: 'DA1', productionId: 'P1', repriseDeId: 'E1' },   // reprise
    { id: 'E3', etudiantDA: 'DA2', productionId: 'P1' },                       // autre élève
    { id: 'E4', etudiantDA: 'DA1', productionId: 'P2' },                       // autre production
    { id: 'E5', etudiantDA: 'DA1', productionId: 'P1', remplaceeParId: 'E1', reconcilieParDoublon: true } // doublon réconcilié
];

describe('#560 · A — un seul prédicat « du couple »', () => {
    it('même élève ET même production : vrai ; l\'un des deux diffère : faux', () => {
        expect(estDuCoupleDuFichier(EVALS[0], F1)).toBe(true);
        expect(estDuCoupleDuFichier(EVALS[2], F1)).toBe(false);
        expect(estDuCoupleDuFichier(EVALS[3], F1)).toBe(false);
    });

    it('un fichier sans élève ou sans production ne définit aucun couple : rien ne part (même garde que la destruction)', () => {
        expect(estDuCoupleDuFichier(EVALS[0], { id: 'F9', productionId: 'P1' })).toBe(false);
        expect(estDuCoupleDuFichier(EVALS[0], { id: 'F9', etudiantDA: 'DA1' })).toBe(false);
        expect(estDuCoupleDuFichier(EVALS[0], null)).toBe(false);
        expect(estDuCoupleDuFichier(null, F1)).toBe(false);
    });

    it('le compte annoncé est celui du couple : originale, reprise et doublon réconcilié compris', () => {
        expect(compterEvaluationsDuCouple(F1, EVALS)).toBe(3);
        expect(compterEvaluationsDuCouple(F1, [])).toBe(0);
        expect(compterEvaluationsDuCouple({ id: 'F9' }, EVALS)).toBe(0);
    });

    it('la modale et les deux filtres de destruction lisent CE prédicat — l\'ancien, inscrit en dur, est parti', () => {
        const modale = corps(liste, 'supprimerFichierDefinitivement');
        expect(modale).toContain('compterEvaluationsDuCouple(');
        expect(modale).toContain('!estDuCoupleDuFichier(ev, fichier)');
        const corbeille = corps(liste, 'viderTouteCorbeille');
        expect((corbeille.match(/estDuCoupleDuFichier\(ev, f\)/g) || []).length).toBeGreaterThanOrEqual(2);
        expect(liste).not.toContain('ev.etudiantDA === fichier.etudiantDA && ev.productionId === fichier.productionId');
        expect(liste).not.toContain('ev.etudiantDA === f.etudiantDA && ev.productionId === f.productionId');
    });
});

describe('#560 · B — les mots arrêtés par Grégoire, et le témoin négatif', () => {
    it('la phrase, telle quelle, choisie seulement si une évaluation du couple existe', () => {
        const modale = corps(liste, 'supprimerFichierDefinitivement');
        expect(modale).toContain("nbEvaluations > 0\n        ? 'Le fichier, ses annotations et toutes les évaluations de cet élève pour cette production seront effacés.'");
    });

    it('sans évaluation liée : la phrase d\'avant, mot pour mot', () => {
        const modale = corps(liste, 'supprimerFichierDefinitivement');
        expect(modale).toContain(": 'Le fichier sera supprimé de façon permanente.'");
    });

    it('« Vider la corbeille » dit combien d\'évaluations partent, seulement s\'il y en a', () => {
        const corbeille = corps(liste, 'viderTouteCorbeille');
        expect(corbeille).toContain('nbEvalsLiees > 0 ?');
        expect(corbeille).toContain('partira');
    });
});

describe('#560 · C — le message d\'après dit ce qui est parti', () => {
    it('plus de « Fichier et évaluation supprimés » inconditionnel ; le compte réel, ou le fichier seul', () => {
        const modale = corps(liste, 'supprimerFichierDefinitivement');
        expect(modale).not.toContain("'Fichier et évaluation supprimés définitivement.'");
        expect(modale).toContain("'Fichier supprimé définitivement.'");
        expect(modale).toContain('nbEvalsRetirees > 0');
        // Le compte n'est posé QUE si l'écriture a eu lieu (branche else du garde des modes).
        // Réancré le 26 sept. 2026 (lot A de l'enregistrement) : plus de branche de refus en
        // anonymisation. Puis le 27 sept. (lot B, #618) : le compte n'est posé que sur `=== true`
        // — un refus rendu ne compte plus comme des évaluations supprimées.
        expect(suitDansLaFonction(modale, /if \(sauvegarderDonneesSelonMode\('evaluationsSauvegardees', evaluations,/, /\) === true\) \{\s*nbEvalsRetirees = avant - evaluations\.length;/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });
});
