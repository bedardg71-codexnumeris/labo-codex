import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Wrapper Vitest du dry-run d'observation `scripts/dry-run-migration-modeles.mjs`
// (Brique D namespacing, 26 juin 2026). Le script est LECTURE SEULE et prépare la
// migration : il doit RÉELLEMENT distinguer partagés / orphelins / réserves /
// divergences, et réconcilier les deux vues d'usage (évaluations + productions).
// Ces cas prouvent que chaque catégorie est détectée pour de vrai (P2) — sinon le
// rapport serait décoratif. Fixtures synthétiques jetables, aucune donnée réelle.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(racineProjet, 'scripts', 'dry-run-migration-modeles.mjs');

let tmp;
beforeAll(() => { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dryrun-mig-')); });
afterAll(() => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* best effort */ } });

function lancer(obj, ...args) {
    const p = path.join(tmp, 'codex.json');
    fs.writeFileSync(p, JSON.stringify(obj));
    try {
        return { code: 0, sortie: execFileSync(process.execPath, [SCRIPT, '--codex', p, ...args], { encoding: 'utf8' }) };
    } catch (e) {
        return { code: e.status, sortie: (e.stdout || '') + (e.stderr || '') };
    }
}

// Codex riche couvrant les quatre pièges + la réconciliation éval/production.
function codexComplet() {
    return {
        h2026_evaluationsSauvegardees: [{ id: 'EH1', grilleId: 'G_SHARED', echelleId: 'ECH_H' }],
        a2025_evaluationsSauvegardees: [
            { id: 'EA1', grilleId: 'G_SHARED', echelleId: 'ECH_A' },
            { id: 'EA2', grilleId: 'G_GHOST', echelleId: 'ECH_A' }
        ],
        h2026_productions: [{ id: 'P1', grilleId: 'G_PRODONLY', pratiqueId: 'PRAT_X' }],
        grillesTemplates: [
            { id: 'G_SHARED', nom: 'Partagee' },
            { id: 'G_RESERVE', nom: 'Reserve' },
            { id: 'G_DIVERGE', nom: 'Diverge', crit: 1 },
            { id: 'G_PRODONLY', nom: 'ProdOnly' }
        ],
        a2025_grillesTemplates: [{ id: 'G_DIVERGE', nom: 'Diverge', crit: 999 }],
        echellesTemplates: [{ id: 'ECH_H' }, { id: 'ECH_A' }],
        pratiquesConfigurables: [{ id: 'PRAT_X' }]
    };
}

describe('Dry-run d\'observation · migration des modèles (LECTURE SEULE)', () => {

    it('détecte un modèle PARTAGÉ entre trimestres', () => {
        const r = lancer(codexComplet());
        expect(r.code).toBe(0);
        expect(r.sortie).toMatch(/PARTAGÉS[\s\S]*G_SHARED/);
    });

    it('détecte un ORPHELIN (référencé, absent du catalogue)', () => {
        expect(lancer(codexComplet()).sortie).toMatch(/ORPHELINS[\s\S]*G_GHOST/);
    });

    it('détecte un modèle EN RÉSERVE (au catalogue, jamais utilisé)', () => {
        expect(lancer(codexComplet()).sortie).toMatch(/RÉSERVE[\s\S]*G_RESERVE/);
    });

    it('détecte une DIVERGENCE de définition pour un même id', () => {
        expect(lancer(codexComplet()).sortie).toMatch(/DIVERGENCES[\s\S]*G_DIVERGE/);
    });

    it('réconcilie évaluations ET productions dans le plan de copie', () => {
        // h2026 : G_SHARED (via éval) + G_PRODONLY (via production) = 2 grilles.
        // Prouve qu'on ne rate pas l'usage par éval (que identifierTemplatesUtilises,
        // qui ne lit que les productions, manquerait).
        expect(lancer(codexComplet()).sortie).toMatch(/h2026 : grilles=2/);
    });

    it('codex propre → résumé tout à zéro', () => {
        const propre = {
            h2026_evaluationsSauvegardees: [{ id: 'EH', grilleId: 'G_H', echelleId: 'ECH_H' }],
            a2025_evaluationsSauvegardees: [{ id: 'EA', grilleId: 'G_A', echelleId: 'ECH_A' }],
            grillesTemplates: [{ id: 'G_H' }, { id: 'G_A' }],
            echellesTemplates: [{ id: 'ECH_H' }, { id: 'ECH_A' }]
        };
        const r = lancer(propre);
        expect(r.sortie).toContain('0 partagé(s) · 0 orphelin(s) · 0 en réserve · 0 divergence(s)');
    });

    it('annonce explicitement la lecture seule (aucune écriture)', () => {
        expect(lancer(codexComplet()).sortie).toContain('LECTURE SEULE — aucune donnée modifiée');
    });

});
