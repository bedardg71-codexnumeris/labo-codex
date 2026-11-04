/**
 * SENTINELLE #1162 (entrée 12 de la file, 4 nov. 2026) — les pastilles « À réévaluer »,
 * « Non verrouillée » et « Incomplet » se lisent, dans les deux modes.
 *
 * Avant : texte blanc sur `--alerte-bordure-attention`, 2,4 pour 1 en sombre (#c8a060) et
 * 4,0 pour 1 en clair (#a07830). Le couple vit dans deux jetons, `--pastille-attention-fond`
 * et `--pastille-attention-texte`, posés dans `:root` et redéfinis par `.mode-clair`.
 *
 * Ce que l'essai garde : (A) les quatre règles lisent le couple ; (B) le contraste CALCULÉ
 * depuis les définitions tient 4,5 pour 1 dans chaque mode.
 * Mesuré au navigateur le 4 nov. : 7,17 en sombre, 6,34 en clair.
 *
 *   cd tests && npx vitest run unit/sentinelle-1162-pastilles-attention-lisibles.test.js
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(path.resolve(__dirname, '..', '..', 'styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** Le corps du premier bloc de ce sélecteur exact. */
function bloc(selecteur) {
    const m = new RegExp('(?:^|\\})\\s*' + selecteur.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}', 'm').exec(CSS);
    return m ? m[1] : '';
}
function valeurDe(corps, nom) {
    const m = new RegExp('(?:^|;|\\n|\\{)\\s*' + nom + '\\s*:\\s*([^;]+)').exec(corps);
    return m ? m[1].trim() : null;
}
/** Une valeur du bloc, en suivant les var() d'abord dans ce bloc, puis dans :root. */
function resoudre(corps, valeur, profondeur = 0) {
    const m = /^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/.exec(valeur || '');
    if (!m || profondeur > 5) return valeur;
    return resoudre(corps, valeurDe(corps, m[1]) || valeurDe(bloc(':root'), m[1]), profondeur + 1);
}
const versRgb = (hex) => {
    const h = hex.replace('#', '');
    const p = h.length === 3 ? h.split('').map((c) => c + c) : [h.slice(0, 2), h.slice(2, 4), h.slice(4, 6)];
    return p.map((c) => parseInt(c, 16));
};
const luminance = (rgb) => {
    const [r, g, b] = rgb.map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => {
    const [x, y] = [luminance(versRgb(a)), luminance(versRgb(b))].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
};

describe('#1162 · les pastilles de la famille « attention » se lisent', () => {
    it('A · les quatre règles lisent le couple de jetons, plus le blanc en dur', () => {
        const regles = [
            /\.travaux-badge-pill\.a-reevaluer,\s*\.travaux-badge-pill\.non-enregistree,\s*\.travaux-badge-pill\.incomplet\s*\{([^}]*)\}/,
            /\.travaux-compteur-pill\.incomplet\s*\{([^}]*)\}/
        ];
        for (const re of regles) {
            const corps = (re.exec(CSS) || [])[1] || '';
            expect(valeurDe(corps, 'background')).toBe('var(--pastille-attention-fond)');
            expect(valeurDe(corps, 'color')).toBe('var(--pastille-attention-texte)');
        }
    });

    it.each([[':root', 'sombre'], ['.mode-clair', 'clair']])('B · %s (%s) : au moins 4,5 pour 1', (selecteur, mode) => {
        const corps = bloc(selecteur);
        const fond = resoudre(corps, valeurDe(corps, '--pastille-attention-fond'));
        const texte = resoudre(corps, valeurDe(corps, '--pastille-attention-texte'));
        expect(fond, mode + ' : fond défini').toMatch(/^#[0-9a-f]{3,6}$/i);
        expect(texte, mode + ' : texte défini').toMatch(/^#[0-9a-f]{3,6}$/i);
        expect(contraste(fond, texte), mode + ' : ' + texte + ' sur ' + fond).toBeGreaterThanOrEqual(4.5);
    });
});
