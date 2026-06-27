import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Wrapper Vitest de l'oracle L2 `scripts/sentinelle-isolation-grilles-trimestre.mjs`
// (Brique D namespacing, 26 juin 2026). Avant ce fichier, l'oracle L2 n'était
// couvert par AUCUN test automatisé — il ne tournait qu'à la main sur le codex
// réel du pilote A25. Or la Brique D l'étend des seules grilles aux quatre
// familles de modèles (grilles / échelles / pratiques / cartouches) : « L2 VERT »
// ne vaut que si chaque dimension peut RÉELLEMENT rougir (SKILL_verification_adverse,
// P2 — un test qui ne peut pas échouer ne prouve rien).
//
// Ces cas SONT le break-test mécanisé de l'oracle : un partage isolé sur UN seul
// type doit faire rougir (preuve que la dimension mord seule), un codex isolé
// doit verdir, et --simuler-isolation doit démontrer le passage rouge → vert.
// Aucune donnée réelle d'élève : fixtures synthétiques jetables en tmp.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(racineProjet, 'scripts', 'sentinelle-isolation-grilles-trimestre.mjs');

let tmp;
beforeAll(() => { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'l2-isolation-')); });
afterAll(() => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* best effort */ } });

function ecrireCodex(nom, obj) {
    const p = path.join(tmp, nom + '.json');
    fs.writeFileSync(p, JSON.stringify(obj));
    return p;
}

// Lance le script L2 et renvoie { code, sortie }. execFileSync lève quand le
// code de sortie est non nul : on récupère alors e.status et e.stdout.
function lancerL2(codexPath, ...args) {
    try {
        const sortie = execFileSync(process.execPath, [SCRIPT, '--codex', codexPath, ...args], { encoding: 'utf8' });
        return { code: 0, sortie };
    } catch (e) {
        return { code: e.status, sortie: (e.stdout || '') + (e.stderr || '') };
    }
}

// Codex de base : H26 et A25 utilisent des modèles entièrement DISTINCTS.
// Chaque fixture de partage n'injecte une collision QUE sur un type.
function codexBase() {
    return {
        h2026_evaluationsSauvegardees: [{ id: 'EVAL_H', grilleId: 'G_H', echelleId: 'ECH_H', cartoucheId: 'CART_H' }],
        a2025_evaluationsSauvegardees: [{ id: 'EVAL_A', grilleId: 'G_A', echelleId: 'ECH_A', cartoucheId: 'CART_A' }],
        grillesTemplates: [{ id: 'G_H', nom: 'Grille H' }, { id: 'G_A', nom: 'Grille A' }],
        echellesTemplates: [{ id: 'ECH_H' }, { id: 'ECH_A' }],
        pratiquesConfigurables: []
    };
}

describe('L2 · sentinelle d\'isolation des modèles par trimestre (oracle CLI)', () => {

    it('codex isolé → VERT (exit 0)', () => {
        const p = ecrireCodex('isole', codexBase());
        const r = lancerL2(p);
        expect(r.code).toBe(0);
        expect(r.sortie).toContain('VERT');
    });

    it('GRILLE partagée seule → ROUGE (exit 1), signalée sous GRILLES', () => {
        const c = codexBase();
        c.a2025_evaluationsSauvegardees[0].grilleId = 'G_H'; // collision grille uniquement
        const r = lancerL2(ecrireCodex('partage-grille', c));
        expect(r.code).toBe(1);
        expect(r.sortie).toContain('ROUGE');
        expect(r.sortie).toMatch(/GRILLES[\s\S]*PARTAGÉS/);
    });

    it('ÉCHELLE partagée seule → ROUGE (la dimension échelle mord indépendamment)', () => {
        const c = codexBase();
        c.a2025_evaluationsSauvegardees[0].echelleId = 'ECH_H'; // collision échelle uniquement
        const r = lancerL2(ecrireCodex('partage-echelle', c));
        expect(r.code).toBe(1);
        expect(r.sortie).toMatch(/ÉCHELLES[\s\S]*PARTAGÉS/);
    });

    it('PRATIQUE partagée seule (echelleId « pratique-<id> ») → ROUGE sous PRATIQUES, pas sous ÉCHELLES', () => {
        const c = codexBase();
        c.h2026_evaluationsSauvegardees[0].echelleId = 'pratique-P_SHARED';
        c.a2025_evaluationsSauvegardees[0].echelleId = 'pratique-P_SHARED';
        const r = lancerL2(ecrireCodex('partage-pratique', c));
        expect(r.code).toBe(1);
        expect(r.sortie).toMatch(/PRATIQUES[\s\S]*PARTAGÉS/);
        // l'échelle ne doit PAS être déclarée partagée (echelleId est une pratique)
        expect(r.sortie).toMatch(/ÉCHELLES\s*──\s*\n\s*Aucun modèle partagé/);
    });

    it('CARTOUCHE partagée seule → ROUGE sous CARTOUCHES', () => {
        const c = codexBase();
        c.a2025_evaluationsSauvegardees[0].cartoucheId = 'CART_H'; // collision cartouche uniquement
        const r = lancerL2(ecrireCodex('partage-cartouche', c));
        expect(r.code).toBe(1);
        expect(r.sortie).toMatch(/CARTOUCHES[\s\S]*PARTAGÉS/);
    });

    it('--type echelle isole le verdict à une seule dimension', () => {
        const c = codexBase();
        c.a2025_evaluationsSauvegardees[0].grilleId = 'G_H'; // grille partagée…
        const r = lancerL2(ecrireCodex('type-focus', c), '--type', 'echelle');
        // …mais on ne regarde QUE les échelles, qui restent isolées → VERT
        expect(r.code).toBe(0);
        expect(r.sortie).toContain('type echelle');
        expect(r.sortie).toContain('VERT');
    });

    it('--simuler-isolation démontre le passage ROUGE → VERT (break-test mécanisé)', () => {
        const c = codexBase();
        c.a2025_evaluationsSauvegardees[0].grilleId = 'G_H';
        c.a2025_evaluationsSauvegardees[0].echelleId = 'ECH_H';
        c.a2025_evaluationsSauvegardees[0].cartoucheId = 'CART_H';
        const r = lancerL2(ecrireCodex('simul', c), '--trimestre-cible', 'a2025', '--simuler-isolation');
        expect(r.code).toBe(0);
        expect(r.sortie).toContain('ISOLATION PROUVÉE');
    });

});
