import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE-CLIQUET #400 — fuite de listeners du canvas spaghetti A-C-P
// (rapport P3). Le canvas est PERSISTANT, le chart est détruit à chaque
// re-rendu, mais creerGraphiqueGroupeSpaghettiACP ré-attachait
// mouseleave/click/mousemove sans retrait : +3 listeners par rendu, dont les
// closures retenaient le chart DÉTRUIT et ses datasets (75 courbes × semaines).
// Fix (patron #326 R1, sûr par lecture statique — mesure terrain reportée
// post-#362, décision 5 août soir) : attacheur idempotent local
// _attacherListenerSpaghetti (removeEventListener du handler précédent du même
// type avant chaque addEventListener, référence gardée sur le canvas).
//
// Sentinelle SOURCE (le couplage DOM/Chart.js rend le fonctionnel
// disproportionné — patron assumé, cf. sentinelles source-level de la vague
// #379-#392). Break-test = mutation INVERSE (ré-attacher en direct → ROUGE).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
    path.resolve(__dirname, '..', '..', 'js', 'graphiques-progression.js'), 'utf8');

describe('#400 · cliquet — les listeners du canvas spaghetti passent par la garde idempotente', () => {
    it('l\'attacheur idempotent existe : retrait du handler précédent AVANT l\'attache', () => {
        const i = src.indexOf('const _attacherListenerSpaghetti');
        expect(i).toBeGreaterThan(-1);
        const corps = src.slice(i, i + 600);
        // ordre : remove (si handler précédent) PUIS add, référence mémorisée
        const iRemove = corps.indexOf('canvas.removeEventListener(type');
        const iAdd = corps.indexOf('canvas.addEventListener(type');
        expect(iRemove).toBeGreaterThan(-1);
        expect(iAdd).toBeGreaterThan(iRemove);
        expect(corps).toMatch(/_spaghettiHandlers\[type\] = handler/);
    });

    it('les 3 types (mouseleave, click, mousemove) sont routés par l\'attacheur', () => {
        expect(src).toMatch(/_attacherListenerSpaghetti\('mouseleave', function/);
        expect(src).toMatch(/_attacherListenerSpaghetti\('click', function/);
        expect(src).toMatch(/_attacherListenerSpaghetti\('mousemove', function/);
    });

    it('AUCUNE attache directe de ces types sur le canvas ne subsiste (la fuite ne revient pas)', () => {
        expect(src).not.toMatch(/canvas\.addEventListener\('(mouseleave|click|mousemove)'/);
        // la seule attache brute au canvas est celle, générique, de l'attacheur
        const brutes = src.match(/canvas\.addEventListener\(/g) || [];
        expect(brutes.length).toBe(1);
    });
});
