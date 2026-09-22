import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (rel) => readFileSync(path.join(racine, rel), 'utf8');

// #360 — Prévention des doublons d'évaluations NOTE-ÉGALE.
//
// CONSTAT : pour un couple (etudiantDA, productionId), plusieurs évals ACTIVES
// (sans `remplaceeParId`) peuvent coexister. Une REPRISE est signée (4 marques) ;
// un DOUBLON ORPHELIN ne l'est pas et, quand il est note-égale à une autre active,
// double-compte la production. La réconciliation marque les surnuméraires
// note-égale avec `remplaceeParId` (exclusion moteur INCHANGÉE) + un drapeau
// discriminant `reconcilieParDoublon` (Option A) que les writers de reprise
// IGNORENT — sinon le marqueur serait pris pour une « originale archivée par une
// reprise » et rouvrirait le bug (suppression du survivant → résurrection du
// doublon ; ré-ouverture du doublon → perte de la vraie note).
//
// LIMITE ASSUMÉE : un orphelin re-noté DIVERGENT (≈ Fictivam, validé Omnivox) reste
// intact — décision actée : ne jamais trancher un divergent automatiquement.
//
// Break-tests (cf. SKILL_verification_adverse) : réintroduire un bug fait ROUGIR.

let R;

beforeAll(() => {
    const win = chargerScript('js/entites/reconciliation-evaluations.js');
    R = win.ReconciliationEvaluations;
});

// Fabrique d'éval minimale (note-égale par défaut).
const ev = (id, props = {}) => ({
    id,
    etudiantDA: 'DA1',
    productionId: 'P1',
    noteFinale: 77.3,
    ...props
});

describe('#360 · reconcilierActivesNoteEgale · cœur (helper pur)', () => {

    it('2 actives note-égale SANS marque → 1 survivant + 1 surnuméraire marqué (break-test)', () => {
        const evals = [ev('E1'), ev('E2')];
        const r = R.reconcilierActivesNoteEgale(evals, 'DA1', 'P1');

        expect(r.modifie).toBe(true);
        expect(r.marquees).toEqual(['E2']);              // E1 survivant (1er en ordre), E2 marqué
        const actives = evals.filter(e => !e.remplaceeParId);
        expect(actives).toHaveLength(1);
        expect(actives[0].id).toBe('E1');
        const marquee = evals.find(e => e.id === 'E2');
        expect(marquee.remplaceeParId).toBe('E1');        // pointe le survivant (id non vide)
        expect(marquee.reconcilieParDoublon).toBe(true);  // Option A : drapeau discriminant
    });

    it('2 actives DIVERGENTES (Fictivam 77,3 / 79) → AUCUN marquage (contre-cas)', () => {
        const evals = [ev('E1', { noteFinale: 77.3 }), ev('E2', { noteFinale: 79 })];
        const r = R.reconcilierActivesNoteEgale(evals, 'DA1', 'P1');

        expect(r.modifie).toBe(false);
        expect(evals.filter(e => !e.remplaceeParId)).toHaveLength(2);
    });

    it('note normalisée à 1 décimale : 77.30 vs 77.3000001 → réconciliés (break-test)', () => {
        const evals = [ev('E1', { noteFinale: 77.30 }), ev('E2', { noteFinale: 77.3000001 })];
        const r = R.reconcilierActivesNoteEgale(evals, 'DA1', 'P1');

        expect(r.modifie).toBe(true);
        expect(evals.find(e => e.id === 'E2').remplaceeParId).toBe('E1');
    });

    it('une REPRISE note-égale (repriseDeId) n\'est jamais marquée et reste survivante', () => {
        const evals = [ev('A'), ev('B', { repriseDeId: 'X', jetonRepriseApplique: true })];
        const r = R.reconcilierActivesNoteEgale(evals, 'DA1', 'P1');

        expect(r.modifie).toBe(true);
        expect(r.marquees).toEqual(['A']);                 // survivant = la reprise (priorité)
        const reprise = evals.find(e => e.id === 'B');
        expect(reprise.remplaceeParId).toBeUndefined();
        expect(reprise.reconcilieParDoublon).toBeUndefined();
    });

    it('une REPRISE CIBLÉE note-égale (jetonRepriseCibleeApplique) n\'est jamais marquée', () => {
        const evals = [ev('A'), ev('B', { jetonRepriseCibleeApplique: true })];
        const r = R.reconcilierActivesNoteEgale(evals, 'DA1', 'P1');

        expect(r.modifie).toBe(true);
        expect(r.marquees).toEqual(['A']);                 // survivant = la ciblée (priorité 1)
        expect(evals.find(e => e.id === 'B').remplaceeParId).toBeUndefined();
    });

    it('reprise SURNUMÉRAIRE protégée : ciblée survit, reprise normale jamais marquée (break-test garde reprise)', () => {
        // Ordre : plain, reprise normale, ciblée — toutes note-égale.
        const evals = [
            ev('A'),
            ev('B', { repriseDeId: 'X', jetonRepriseApplique: true }),
            ev('C', { jetonRepriseCibleeApplique: true })
        ];
        const r = R.reconcilierActivesNoteEgale(evals, 'DA1', 'P1');

        expect(r.modifie).toBe(true);
        expect(r.marquees).toEqual(['A']);                 // survivant = C (ciblée) ; SEULE A (plain) marquée
        expect(evals.find(e => e.id === 'B').remplaceeParId).toBeUndefined(); // reprise normale protégée
        expect(evals.find(e => e.id === 'C').remplaceeParId).toBeUndefined(); // ciblée survivante
    });

    it('surnuméraire VERROUILLÉE → jamais marquée (invariant lecture-seule, break-test)', () => {
        const evals = [ev('A'), ev('B', { verrouillee: true })];
        const r = R.reconcilierActivesNoteEgale(evals, 'DA1', 'P1');

        expect(r.modifie).toBe(false);                     // B verrouillée = intouchable
        expect(evals.filter(e => !e.remplaceeParId)).toHaveLength(2);
    });

    it('plagiat / noteFinale null écartés du pool moteur, mais les plain doublons restent réconciliés', () => {
        const evals = [
            ev('A'),
            ev('B'),
            ev('C', { statutIntegrite: 'plagiat' }),
            ev('D', { noteFinale: null })
        ];
        const r = R.reconcilierActivesNoteEgale(evals, 'DA1', 'P1');

        expect(r.modifie).toBe(true);
        expect(r.marquees).toEqual(['B']);                 // A survivant, B marqué
        expect(evals.find(e => e.id === 'C').remplaceeParId).toBeUndefined(); // plagiat intact
        expect(evals.find(e => e.id === 'D').remplaceeParId).toBeUndefined(); // null intact
    });

    it('une seule active → no-op', () => {
        const evals = [ev('A')];
        expect(R.reconcilierActivesNoteEgale(evals, 'DA1', 'P1').modifie).toBe(false);
    });

    it('survivant sans id net → refuse de marquer (le prédicat moteur est truthy)', () => {
        const evals = [ev(''), ev('')];
        const r = R.reconcilierActivesNoteEgale(evals, 'DA1', 'P1');
        expect(r.modifie).toBe(false);
    });

    it('n\'affecte pas un autre couple (da/pid)', () => {
        const evals = [
            ev('A'),
            ev('B'),
            ev('Z', { etudiantDA: 'DA2' }),
            ev('Y', { productionId: 'P2' })
        ];
        const r = R.reconcilierActivesNoteEgale(evals, 'DA1', 'P1');
        expect(r.marquees).toEqual(['B']);
        expect(evals.find(e => e.id === 'Z').remplaceeParId).toBeUndefined();
        expect(evals.find(e => e.id === 'Y').remplaceeParId).toBeUndefined();
    });
});

describe('#360 · collision Option A · restaurerOriginaleSiReprise (comportemental)', () => {

    let restaurer;
    beforeAll(() => {
        const win = chargerScript('js/liste-evaluations.js');
        restaurer = win._restaurerOriginaleSiReprise;
    });

    it('supprimer le survivant NE ressuscite PAS un doublon réconcilié (break-test)', () => {
        const evals = [
            { id: 'SUR', noteFinale: 77.3 },
            { id: 'DBL', remplaceeParId: 'SUR', reconcilieParDoublon: true, noteFinale: 77.3 }
        ];
        const restaure = restaurer(evals, 'SUR');             // on supprime le survivant

        expect(restaure).toBe(false);                          // rien à « restaurer »
        expect(evals.find(e => e.id === 'DBL').remplaceeParId).toBe('SUR'); // doublon reste exclu
    });

    it('contrôle positif : une VRAIE originale de reprise EST bien restaurée', () => {
        const evals = [
            { id: 'ORIG', remplaceeParId: 'REP' },             // archivée par une vraie reprise
            { id: 'REP', repriseDeId: 'ORIG' }
        ];
        const restaure = restaurer(evals, 'REP');              // on supprime la reprise

        expect(restaure).toBe(true);
        expect(evals.find(e => e.id === 'ORIG').remplaceeParId).toBeUndefined();
    });
});

describe('#360 · collision Option A · retirerJetonReprise branche else (comportemental)', () => {

    let retirer, store;
    beforeAll(() => {
        const db = { getSync: () => store, setSync: () => {}, set: () => {}, get: async () => store };
        const win = chargerScript('js/evaluation-jetons.js', {
            db,
            cle: (k) => k,
            confirm: () => true,
            notifications: { succes: () => {}, erreur: () => {}, info: () => {} },
            sauvegarderDonneesSelonMode: () => true
        });
        retirer = win.retirerJetonReprise;
    });

    it('décocher le jeton restaure l\'ORIGINALE archivée, jamais un doublon réconcilié (break-test)', () => {
        // R = reprise survivante ; O = originale archivée par R ; D = doublon réconcilié
        // pointant aussi R, placé AVANT O dans l'ordre de disque (piège du find non gardé).
        store = [
            { id: 'D', etudiantDA: 'DA1', productionId: 'P1', noteFinale: 77.3, remplaceeParId: 'R', reconcilieParDoublon: true },
            { id: 'O', etudiantDA: 'DA1', productionId: 'P1', noteFinale: 77.3, remplaceeParId: 'R', archivee: true },
            { id: 'R', etudiantDA: 'DA1', productionId: 'P1', noteFinale: 77.3, repriseDeId: 'O', jetonRepriseApplique: true }
        ];
        const ok = retirer('R');               // l'enseignant décoche le jeton de la reprise

        expect(ok).toBe(true);
        const o = store.find(e => e.id === 'O');
        const d = store.find(e => e.id === 'D');
        expect(o.remplaceeParId).toBeUndefined();   // l'ORIGINALE est restaurée (active)
        expect(d).toBeTruthy();
        expect(d.remplaceeParId).toBe('R');         // le doublon réconcilié N'est PAS ressuscité
        expect(store.some(e => e.id === 'R')).toBe(false); // la reprise est supprimée (undo)
    });
});

describe('#360 · collision Option A · gardes présentes dans les writers (ratchet statique)', () => {

    it('retirerJetonReprise exclut reconcilieParDoublon de la branche « originale remplacée »', () => {
        const src = lire('js/evaluation-jetons.js');
        expect(src).toMatch(/evaluationReprise\.remplaceeParId\s*&&\s*!evaluationReprise\.reconcilieParDoublon/);
    });

    it('l\'avertissement cosmétique « lié à une reprise » exclut reconcilieParDoublon', () => {
        const src = lire('js/liste-evaluations.js');
        expect(src).toMatch(/e\.remplaceeParId\s*&&\s*!e\.reconcilieParDoublon/);
    });
});
