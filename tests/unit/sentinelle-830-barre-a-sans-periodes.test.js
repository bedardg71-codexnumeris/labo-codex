import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #830 (23 sept. 2026) — la barre « Assiduité (A) » du Suivi du groupe dit pourquoi elle est vide.
// Ce banc juge le prédicat « aucune séance de l'horaire ne porte son nombre de périodes », lu comme le
// dénominateur de l'assiduité (`parseInt(nombrePeriodes) > 0`). La barre elle-même se juge dans WebKit :
// tests/integration/suivi-830-barre-a-sans-periodes.spec.js.

describe('#830 · horaireSansAucunePeriode', () => {
    const win = chargerScript('js/tableau-bord-apercu.js', {});
    const f = (s) => win.horaireSansAucunePeriode(s);

    it('aucune séance ne porte de périodes → vrai (absentes, 0, vides, non numériques)', () => {
        expect(f([{ jour: 'Lundi' }, { jour: 'Mercredi', nombrePeriodes: 0 }, { jour: 'Jeudi', nombrePeriodes: '' }, { jour: 'Vendredi', nombrePeriodes: 'x' }])).toBe(true);
    });

    it('une seule séance en porte → faux (cas b : la barre se calcule sur celle-là)', () => {
        expect(f([{ jour: 'Lundi' }, { jour: 'Mercredi', nombrePeriodes: 2 }])).toBe(false);
        expect(f([{ jour: 'Lundi', nombrePeriodes: '3' }])).toBe(false);
    });

    it('horaire vide ou absent → faux : la phrase parle de séances qui existent', () => {
        expect(f([])).toBe(false);
        expect(f(null)).toBe(false);
        expect(f(undefined)).toBe(false);
    });

    it('la phrase est celle que Grégoire a validée, mot pour mot', () => {
        // Constante de haut niveau, hors de window : lue dans la source.
        const src = readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../js/tableau-bord-apercu.js'), 'utf8');
        expect(src).toContain("'Assiduité non calculée : aucune séance de l\\'horaire ne porte son nombre de périodes. Tu peux le saisir dans Cadre › Trimestre › Horaire.'");
    });
});
