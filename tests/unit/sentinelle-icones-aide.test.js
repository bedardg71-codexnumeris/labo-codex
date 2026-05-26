import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineJs = path.resolve(__dirname, '..', '..', 'js');

// Sentinelle Lot A sous-lot 2 (26 mai 2026) — migration ✴ → icons/icons8-info.svg.
//
// Avant le Lot A, ~34 sites dans js/ rendaient l'icône d'aide via le glyphe
// Unicode ✴ (U+2734) ou son entité HTML &#x2734;, ou son échappement
// JavaScript ✴. Le Lot A uniformise vers <img src="icons/icons8-info.svg">.
// Si un commit réintroduit une de ces 3 formes dans js/*.js (hors _archives),
// ce test échoue et bloque la régression.

describe('Lot A · Sentinelle statique · 0 ✴ résiduel dans js/', () => {
    const FORMES = [
        { motif: /✴/, nom: 'glyphe littéral ✴ (U+2734)' },
        { motif: /&#x2734;/i, nom: 'entité HTML &#x2734;' },
        { motif: /\\u2734/, nom: 'échappement JS \\u2734' },
    ];

    function listerFichiersJs() {
        return readdirSync(racineJs)
            .filter(nom => nom.endsWith('.js'))
            .sort();
    }

    it('aucun module js/*.js ne contient ✴ / &#x2734; / \\u2734', () => {
        const violations = [];
        for (const nom of listerFichiersJs()) {
            const contenu = readFileSync(path.join(racineJs, nom), 'utf8');
            for (const { motif, nom: formeNom } of FORMES) {
                const m = contenu.match(motif);
                if (m) {
                    const ligne = contenu.substring(0, m.index).split('\n').length;
                    violations.push(`${nom}:${ligne} — ${formeNom}`);
                }
            }
        }
        expect(
            violations,
            `Régression Lot A détectée :\n${violations.join('\n')}\n` +
            `Utiliser <img src="icons/icons8-info.svg" alt="" class="btn-aide-icon"> ` +
            `(boutons) ou class="btn-inline-icon" (spans/bullets) à la place.`
        ).toEqual([]);
    });
});
