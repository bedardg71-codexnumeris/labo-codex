import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — lot « La reprise ne reçoit plus les niveaux touchés sur son originale » (9 nov. 2026).
//
// AVANT : l'enregistrement automatique cherchait l'évaluation à écrire par élève + production, non remplacée :
// l'évaluation EN VIGUEUR. Une originale remplacée ouverte, un niveau touché : sa reprise le recevait.
// Ce banc tient les deux règles elles-mêmes, prélevées telles quelles dans les modules (aucune copie de logique) :
//   · `indexEvaluationOuverte` — l'évaluation OUVERTE, par son id, jamais une autre du même couple ;
//   · `evaluationEnLectureSeule` — une originale remplacée l'est, verrouillée en base ou non, sauf déverrouillée exprès.
// La spec WebKit `reprise-originale-lecture-seule.spec.js` éprouve les trajets.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, 'js', f), 'utf8');
function prelever(source, depuis, jusqua) {
    const i = source.indexOf(depuis);
    const j = source.indexOf(jusqua, i);
    if (i === -1 || j === -1) throw new Error('bornes introuvables : ' + depuis);
    return source.slice(i, j);
}
const { indexEvaluationOuverte } = new Function(prelever(lire('evaluation-chargement.js'),
    'function indexEvaluationOuverte', 'function _evaluationEnLectureSeule') + '\nreturn { indexEvaluationOuverte };')();
function regles(window) {
    return new Function('window', prelever(lire('evaluation.js'), 'function estOriginaleRemplacee', 'function _oublierDeverrouillageExpres')
        + '\nreturn { evaluationEnLectureSeule, armerDeverrouillageExpres };')(window);
}

const originale = { id: 'EVO', etudiantDA: 'DA1', productionId: 'P1', remplaceeParId: 'EVR', verrouillee: false };
const reprise = { id: 'EVR', etudiantDA: 'DA1', productionId: 'P1', repriseDeId: 'EVO', verrouillee: false };
const autre = { id: 'EVX', etudiantDA: 'DA2', productionId: 'P1', verrouillee: false };
const base = [originale, reprise, autre];
const ec = (idModification, da = 'DA1') => ({ idModification, etudiantDA: da, productionId: 'P1' });

describe('L\'évaluation que le formulaire écrit : celle qui est ouverte', () => {
    it('l\'originale ouverte : c\'est elle, jamais sa reprise', () => {
        expect(indexEvaluationOuverte(base, ec('EVO'))).toBe(0);
    });
    it('la reprise ouverte : c\'est elle', () => {
        expect(indexEvaluationOuverte(base, ec('EVR'))).toBe(1);
    });
    it('sans id (copie ouverte avant que son évaluation soit connue) : l\'évaluation en vigueur du couple', () => {
        expect(indexEvaluationOuverte(base, ec(undefined))).toBe(1);
    });
    it('un id resté d\'une autre copie : l\'évaluation en vigueur du couple affiché', () => {
        expect(indexEvaluationOuverte(base, ec('EVX'))).toBe(1);
    });
    it('l\'id ouvert n\'est plus en base, une autre du couple y est : rien (null), jamais elle', () => {
        expect(indexEvaluationOuverte(base, ec('EVSUPPRIMEE'))).toBeNull();
    });
    it('l\'id ouvert n\'est plus en base, aucune autre du couple : -1 (l\'écrivain en crée une)', () => {
        expect(indexEvaluationOuverte([autre], ec('EVSUPPRIMEE'))).toBe(-1);
    });
});

describe('La lecture seule : verrouillée en base, ou originale remplacée non déverrouillée exprès', () => {
    it('l\'originale remplacée, non verrouillée en base : en lecture seule', () => {
        expect(regles({}).evaluationEnLectureSeule(originale)).toBe(true);
    });
    it('déverrouillée exprès (son instantané) : modifiable ; l\'instantané d\'une AUTRE ne la libère pas', () => {
        const window = {};
        const r = regles(window);
        r.armerDeverrouillageExpres(autre);
        expect(r.evaluationEnLectureSeule(originale)).toBe(true);
        r.armerDeverrouillageExpres(originale);
        expect(r.evaluationEnLectureSeule(originale)).toBe(false);
        expect(window._snapshotAvantModifRemplacee.avant).toBeTruthy();
    });
    it('la reprise et une copie ordinaire : comme avant (le verrou en base seul)', () => {
        const r = regles({});
        expect(r.evaluationEnLectureSeule(reprise)).toBe(false);
        expect(r.evaluationEnLectureSeule(Object.assign({}, reprise, { verrouillee: true }))).toBe(true);
    });
});
