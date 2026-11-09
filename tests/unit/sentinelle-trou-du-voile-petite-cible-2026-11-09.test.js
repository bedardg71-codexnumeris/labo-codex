import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE — LE TROU DU VOILE D'UN PARCOURS RESTE UN TRACÉ VALIDE QUAND LA CIBLE EST PRESQUE HORS DE L'ÉCRAN
// (verdict du groupe 2, 9 nov. 2026).
//
// `trouRect` arrondit les coins d'un rayon de 6 px. Quand moins de 12 px de la cible restent visibles, le côté
// droit devenait « v-2.4 » et le gauche « v--2.4 » : WebKit refuse le tracé (« Problem parsing d= ») et
// l'écrit en console. Le banc du parcours 7 rougissait une fois sur trois.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = readFileSync(path.join(RACINE, 'js/parcours-moteur.js'), 'utf8');
const corps = tranche(src, 'function trouRect(r, pad) {', '\n    }\n', { longueurMin: 200 });
const trouRect = new Function('window', corps + '\n    }\nreturn trouRect;')({ innerWidth: 1180, innerHeight: 820 });

// Un tracé de trou valide : jamais « -- » (le signe du tracé suivi d'une longueur négative).
const valide = (d) => !/--/.test(d);
const cotes = (d) => [...d.matchAll(/([hv])(-?)(-?[\d.]+)/g)].map((m) => ({ l: m[1], signe: m[2], n: Number(m[3]) }));

describe('Le trou du voile autour d\'une petite cible', () => {
    it('une cible dont 3,6 px restent visibles en haut de l\'écran donne un tracé valide', () => {
        const d = trouRect({ left: 601, top: -20, right: 1109.5, bottom: -2.43 }, 6);
        expect(d).not.toBe('');
        expect(valide(d)).toBe(true);
        for (const c of cotes(d)) expect(c.n, d).toBeGreaterThanOrEqual(0);
    });

    it('une cible étroite (4 px de large) aussi', () => {
        const d = trouRect({ left: 100, top: 100, right: 100.1, bottom: 300 }, 1);
        expect(valide(d)).toBe(true);
        for (const c of cotes(d)) expect(c.n, d).toBeGreaterThanOrEqual(0);
    });

    it('une cible ordinaire garde ses coins de 6 px', () => {
        const d = trouRect({ left: 100, top: 100, right: 300, bottom: 160 }, 6);
        expect(d).toContain(' a6,6 0 0 1 6,6');
        expect(d).toContain(' v60 ');
    });
});
